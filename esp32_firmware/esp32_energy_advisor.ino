/*
 =========================================================================================
  GenAI Energy Advisor — Industrial IoT ESP32 Firmware
  Hardware: ESP32-WROOM-32 / DevKit V1
  
  Components Connected:
  1. ESP32-WROOM-32 (Main Controller + Wi-Fi)
  2. PZEM-004T V3 (AC Voltage, Current, Active Power, Energy Wh, Power Factor, Frequency)
  3. SCT-013-000 (Non-invasive Split-core AC Current Transformer cross-validation)
  4. DS18B20 (Waterproof Digital Temperature Probe on motor casing)
  5. MPU6050 (6-DOF IMU for 3-Axis Vibration Acceleration & Harmonics)
  6. HC-SR501 (PIR Human/Occupancy Motion Sensor)
  7. IR Obstacle/Proximity Sensor (Machine feed/cycle detection)
  8. 1-Channel/2-Channel 5V Relay Module (Actuator control signal)
  9. Heavy-Duty AC Contactor (High-power load switching triggered by Relay)
  10. Fuse/MCB (Mains inlet protection)
  11. Mushroom Emergency Stop (E-Stop Safety Interlock)
  12. 0.96" SSD1306 OLED (Local Metrics & AI Recommendation Display)
  13. 5V Active Buzzer (Audible Alarm)
 =========================================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <PZEM004Tv30.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// -----------------------------------------------------------------------------
// NETWORK & SERVER CONFIGURATION
// -----------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
// Adjust server IP and port to your machine running the Energy Analyzer backend
const char* SERVER_URL    = "http://192.168.1.100:3000/api/iot";
const char* MACHINE_ID    = "CNC_Mill_1";

// -----------------------------------------------------------------------------
// PIN DEFINITIONS (ESP32 DEVKIT V1)
// -----------------------------------------------------------------------------
// I2C Bus for OLED (SSD1306) and MPU6050
#define PIN_I2C_SDA          21
#define PIN_I2C_SCL          22

// Hardware Serial 2 for PZEM-004T V3
#define PIN_PZEM_RX          16  // Connect to PZEM TX
#define PIN_PZEM_TX          17  // Connect to PZEM RX

// Analog Input for SCT-013-000 (ADC1 Pin, safe with Wi-Fi)
#define PIN_SCT013_ADC       34

// 1-Wire Digital Bus for DS18B20
#define PIN_DS18B20          4   // 4.7k Pull-up to 3.3V

// Digital Inputs for Sensors & Safety
#define PIN_PIR_MOTION       13  // HC-SR501 PIR Output
#define PIN_IR_PROXIMITY     14  // IR Obstacle / Machine cycle sensor
#define PIN_ESTOP            25  // Mushroom E-stop (Normally Closed loop to GND with internal PULLUP)

// Actuators & Alarms
#define PIN_RELAY_CONTACTOR  26  // Relay module input (Drives AC Contactor Coil)
#define PIN_BUZZER           19  // 5V Active Buzzer (via NPN transistor or logic high)

// OLED Display parameters
#define SCREEN_WIDTH         128
#define SCREEN_HEIGHT        64
#define OLED_RESET           -1
#define OLED_I2C_ADDRESS     0x3C

// -----------------------------------------------------------------------------
// INSTANTIATIONS
// -----------------------------------------------------------------------------
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
PZEM004Tv30 pzem(Serial2, PIN_PZEM_RX, PIN_PZEM_TX);
OneWire oneWire(PIN_DS18B20);
DallasTemperature tempSensor(&oneWire);
Adafruit_MPU6050 mpu;

// Global sensor variables
float voltage_v        = 230.0;
float current_a        = 0.0;
float power_w          = 0.0;
float energy_wh        = 0.0;
float frequency_hz     = 50.0;
float power_factor     = 0.90;
float sct_current_a    = 0.0;
float temperature_c    = 25.0;
float vibration_rms_g  = 0.0;
bool  pir_motion       = false;
bool  proximity_cycle  = false;
bool  estop_active     = false;
bool  relay_state      = true;  // true = Energized (Contactor ON), false = Cutoff
bool  buzzer_active    = false;

unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 3000; // Send telemetry every 3 seconds

// -----------------------------------------------------------------------------
// SCT-013-000 SAMPLING (EMONLIB ALGORITHM IMPLEMENTATION)
// -----------------------------------------------------------------------------
float sampleSCT013Current() {
  const int numSamples = 300;
  float sumSq = 0;
  for (int i = 0; i < numSamples; i++) {
    int raw = analogRead(PIN_SCT013_ADC);
    // ESP32 12-bit ADC centered around 2048 (1.65V DC midpoint)
    float centered = (float)raw - 2048.0;
    sumSq += centered * centered;
    delayMicroseconds(50);
  }
  float rmsRaw = sqrt(sumSq / numSamples);
  // Calibration multiplier for 100A / 50mA CT with 33 ohm burden resistor
  float currentRms = rmsRaw * 0.015;
  if (currentRms < 0.15) currentRms = 0.0; // Noise suppression threshold
  return currentRms;
}

// -----------------------------------------------------------------------------
// MPU6050 VIBRATION ACCELERATION CALCULATION
// -----------------------------------------------------------------------------
float sampleMPU6050VibrationRMS() {
  sensors_event_t a, g, temp;
  if (!mpu.getEvent(&a, &g, &temp)) return 0.05;
  // Calculate magnitude of AC acceleration (removing 1G gravity component)
  float totalAcc = sqrt(a.acceleration.x * a.acceleration.x +
                        a.acceleration.y * a.acceleration.y +
                        a.acceleration.z * a.acceleration.z);
  float vibG = abs(totalAcc - 9.806) / 9.806;
  return vibG;
}

// -----------------------------------------------------------------------------
// OLED STATUS DISPLAY UPDATE
// -----------------------------------------------------------------------------
void updateOLED(const char* line1, const char* line2, const char* statusMsg) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  // Header bar
  display.setCursor(0, 0);
  display.print("ENERGY ADVISOR IoT");
  display.drawLine(0, 10, 127, 10, SSD1306_WHITE);

  // Line 1: Real-time electrical
  display.setCursor(0, 14);
  display.print(line1);

  // Line 2: Vibration & Temp
  display.setCursor(0, 26);
  display.print(line2);

  // Line 3: Hardware State
  display.setCursor(0, 38);
  display.print("RLY:");
  display.print(relay_state ? "ON " : "OFF");
  display.print(" PIR:");
  display.print(pir_motion ? "ACT" : "IDL");
  display.print(" ESTOP:");
  display.print(estop_active ? "TRIP" : "OK");

  // Line 4: AI Recommendation / Status
  display.drawLine(0, 48, 127, 48, SSD1306_WHITE);
  display.setCursor(0, 52);
  display.print(statusMsg);

  display.display();
}

// -----------------------------------------------------------------------------
// TELEMETRY TRANSMISSION & BIDIRECTIONAL AI ACTUATION
// -----------------------------------------------------------------------------
void sendTelemetryToCloud() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[Wi-Fi] Disconnected! Reconnecting...");
    WiFi.reconnect();
    return;
  }

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  // Construct JSON payload
  StaticJsonDocument<1024> doc;
  doc["machine_id"]         = MACHINE_ID;
  doc["voltage_v"]          = voltage_v;
  doc["current_a"]          = current_a;
  doc["power_w"]            = power_w;
  doc["energy_wh"]          = energy_wh;
  doc["power_factor"]       = power_factor;
  doc["frequency_hz"]       = frequency_hz;
  doc["sct_current_a"]      = sct_current_a;
  doc["temperature_c"]      = temperature_c;
  doc["vibration_g"]        = vibration_rms_g;
  doc["pir_motion"]         = pir_motion ? 1 : 0;
  doc["proximity_detected"] = proximity_cycle ? 1 : 0;
  doc["relay_state"]        = relay_state ? "ON" : "OFF";
  doc["estop_active"]       = estop_active ? 1 : 0;
  doc["protocol"]           = "ESP32-WROOM-32";

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("[HTTP] Sending IoT Telemetry Payload...");
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode == 200 || httpResponseCode == 201) {
    String responseString = http.getString();
    Serial.print("[HTTP] Server Response: ");
    Serial.println(responseString);

    // Parse Cloud AI response and closed-loop commands
    StaticJsonDocument<1024> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, responseString);
    if (!error) {
      const char* relayCmd = responseDoc["commands"]["relay"];
      const char* buzzerCmd = responseDoc["commands"]["buzzer"];
      const char* oled1 = responseDoc["commands"]["oled_line1"];
      const char* oled2 = responseDoc["commands"]["oled_line2"];
      const char* aiDiag = responseDoc["ai_analysis"]["state"];

      // 1. Actuate Relay / Contactor
      if (relayCmd && strcmp(relayCmd, "OFF") == 0) {
        relay_state = false;
        digitalWrite(PIN_RELAY_CONTACTOR, HIGH); // Active LOW relay: HIGH = OFF
        Serial.println("[ACTUATION] Cloud command: RELAY SHUTDOWN (OFF)");
      } else if (relayCmd && strcmp(relayCmd, "ON") == 0 && !estop_active) {
        relay_state = true;
        digitalWrite(PIN_RELAY_CONTACTOR, LOW);  // Active LOW relay: LOW = ON
      }

      // 2. Actuate Buzzer Alarm
      if (buzzerCmd && strcmp(buzzerCmd, "ALARM") == 0) {
        digitalWrite(PIN_BUZZER, HIGH);
      } else if (buzzerCmd && strcmp(buzzerCmd, "BEEP") == 0) {
        // Warning Beep
        digitalWrite(PIN_BUZZER, HIGH);
        delay(100);
        digitalWrite(PIN_BUZZER, LOW);
      } else {
        if (!estop_active) {
          digitalWrite(PIN_BUZZER, LOW);
        }
      }

      // 3. Update OLED with AI Response
      if (oled1 && oled2) {
        updateOLED(oled1, oled2, aiDiag ? aiDiag : "AI MONITORED");
      }
    }
  } else {
    Serial.printf("[HTTP] POST failed, error code: %d\n", httpResponseCode);
  }

  http.end();
}

// -----------------------------------------------------------------------------
// SETUP
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n==========================================");
  Serial.println("  GenAI Energy Advisor — ESP32 Starting   ");
  Serial.println("==========================================");

  // Pin Modes
  pinMode(PIN_PIR_MOTION, INPUT);
  pinMode(PIN_IR_PROXIMITY, INPUT_PULLUP);
  pinMode(PIN_ESTOP, INPUT_PULLUP);
  pinMode(PIN_RELAY_CONTACTOR, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  // Initial actuator state: Energize relay safely, buzzer silent
  digitalWrite(PIN_RELAY_CONTACTOR, LOW); // Active LOW relay: ON
  digitalWrite(PIN_BUZZER, LOW);
  relay_state = true;

  // I2C Init
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

  // OLED Init
  if (display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDRESS)) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(10, 20);
    display.println("Connecting Wi-Fi...");
    display.display();
  } else {
    Serial.println("[OLED] Warning: SSD1306 display not found at 0x3C");
  }

  // MPU6050 Init
  if (!mpu.begin()) {
    Serial.println("[MPU6050] Accelerometer not found, using fallback baseline.");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_4_G);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("[MPU6050] Initialized successfully.");
  }

  // DS18B20 Init
  tempSensor.begin();

  // Wi-Fi Connection
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[Wi-Fi] Connecting to ");
  Serial.println(WIFI_SSID);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[Wi-Fi] Running in AP/Offline Mode (Telemetry will retry)");
  }

  updateOLED("V:230V I:0.0A", "TEMP:25C VIB:0.0G", "SYSTEM BOOT OK");
}

// -----------------------------------------------------------------------------
// MAIN LOOP
// -----------------------------------------------------------------------------
void loop() {
  // 1. Read Safety Interlock (E-Stop)
  // When mushroom button is pressed, safety contacts open (logic HIGH with pullup)
  estop_active = (digitalRead(PIN_ESTOP) == HIGH);
  if (estop_active) {
    digitalWrite(PIN_RELAY_CONTACTOR, HIGH); // Cut contactor power immediately
    digitalWrite(PIN_BUZZER, HIGH);          // Sound audible alarm
    relay_state = false;
  }

  // 2. Read Digital Sensors (PIR & Proximity)
  pir_motion = (digitalRead(PIN_PIR_MOTION) == HIGH);
  // Active low IR obstacle sensor: LOW = obstacle/workpiece detected
  proximity_cycle = (digitalRead(PIN_IR_PROXIMITY) == LOW);

  // 3. Read PZEM-004T V3 (Mains Electrical Parameters)
  float p_v = pzem.voltage();
  float p_i = pzem.current();
  float p_p = pzem.power();
  float p_e = pzem.energy();
  float p_f = pzem.frequency();
  float p_pf = pzem.powerFactor();

  if (!isnan(p_v)) voltage_v = p_v;
  if (!isnan(p_i)) current_a = p_i;
  if (!isnan(p_p)) power_w = p_p;
  if (!isnan(p_e)) energy_wh = p_e;
  if (!isnan(p_f)) frequency_hz = p_f;
  if (!isnan(p_pf)) power_factor = p_pf;

  // 4. Read Secondary Current Sensor (SCT-013-000)
  sct_current_a = sampleSCT013Current();

  // 5. Read DS18B20 Temperature
  tempSensor.requestTemperatures();
  float t_c = tempSensor.getTempCByIndex(0);
  if (t_c > -50.0 && t_c < 125.0) {
    temperature_c = t_c;
  }

  // 6. Read MPU6050 Vibration
  vibration_rms_g = sampleMPU6050VibrationRMS();

  // 7. Periodic Telemetry Transmission & AI Sync
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = millis();

    char line1[32];
    snprintf(line1, sizeof(line1), "V:%.1fV P:%.0fW", voltage_v, power_w);

    char line2[32];
    snprintf(line2, sizeof(line2), "T:%.1fC Vib:%.2fG", temperature_c, vibration_rms_g);

    updateOLED(line1, line2, estop_active ? "EMERGENCY TRIP!" : (pir_motion ? "OCCUPIED" : "IDLE WORKSPACE"));
    sendTelemetryToCloud();
  }

  delay(50);
}
