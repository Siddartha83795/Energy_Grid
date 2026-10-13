# ⚡ ESP32 Industrial IoT Hardware Integration Guide

This guide documents the physical connection, electrical schematics, pin mapping, safety interlocks, and AI closed-loop workflow for connecting the **GenAI Energy Advisor** application to the **ESP32** hardware module equipped with all 13 industrial sensors and actuators.

---

## 📋 Bill of Materials & Sensor Overview

| # | Component | Recommended Model | Function & Role | ESP32 Pin / Interface | Supply Voltage |
|---|---|---|---|---|---|
| 1 | **Main Controller** | ESP32-WROOM-32 / DevKit V1 | Main MCU, Wi-Fi telemetry & HTTP/MQTT client | Microcontroller | 5V (USB / VIN) |
| 2 | **Energy Meter** | PZEM-004T V3.0 | True RMS AC Voltage, Current, Power, Energy (Wh), Power Factor, Frequency | UART2 (RX=GPIO16, TX=GPIO17) | 5V + Optical Isolation |
| 3 | **Current Sensor** | SCT-013-000 (100A/50mA) | Non-invasive AC current secondary cross-validation | Analog ADC1 (GPIO34) | Passive + 1.65V DC Bias |
| 4 | **Temperature** | DS18B20 (Waterproof) | Motor & equipment surface temperature monitoring | 1-Wire Digital (GPIO4) | 3.3V (4.7kΩ pull-up) |
| 5 | **Vibration / IMU** | MPU6050 (6-DOF) | 3-axis mechanical vibration acceleration & bearing harmonics | I2C (SDA=GPIO21, SCL=GPIO22) | 3.3V / 5V |
| 6 | **PIR Motion** | HC-SR501 | Workstation human / operator presence detection | Digital Input (GPIO13) | 5V VCC, 3.3V Out |
| 7 | **Proximity Sensor** | IR Obstacle / Proximity | Workpiece movement & machine cycle feed detection | Digital Input (GPIO14) | 3.3V / 5V |
| 8 | **Relay Module** | 1-Channel / 2-Channel 5V Relay | Low-voltage signal to energize/de-energize AC contactor coil | Digital Output (GPIO26) | 5V (Active LOW) |
| 9 | **AC Contactor** | 3-Pole / 1-Pole AC Contactor (25A/40A, 220V Coil) | Heavy-duty physical galvanic disconnection of AC load | Switched by Relay Contact | 230V AC Coil |
| 10 | **Fuse / MCB** | 16A / 25A C-Curve MCB | Overcurrent & short-circuit protection at mains inlet | Main Line Input | 230V AC |
| 11 | **Emergency Stop** | Mushroom Twist-to-Release E-Stop | Physical safety loop cut & MCU telemetry interrupt | Safety Loop + GPIO25 | Hardwired interlock |
| 12 | **Local Display** | 0.96" SSD1306 I2C OLED (128x64) | Real-time voltage, power, and AI diagnostic message | I2C (SDA=GPIO21, SCL=GPIO22) | 3.3V |
| 13 | **Buzzer** | 5V Active Buzzer | Local audible alert on faults, high vibration, or E-stop | Digital Output (GPIO19) | 5V |

---

## 🔌 Circuit Pinout & Wiring Connections

### 1. PZEM-004T V3 Connection
- **PZEM VCC** → ESP32 5V (VIN)
- **PZEM GND** → ESP32 GND
- **PZEM TX**  → ESP32 **GPIO16** (RX2)
- **PZEM RX**  → ESP32 **GPIO17** (TX2)
- **High-Voltage Side**:
  - Connect **AC Mains L (Live)** and **N (Neutral)** to the screw terminals.
  - Pass the single Live conductor wire through the PZEM CT ring.

### 2. SCT-013-000 Non-Invasive CT Clamp Connection
- Connect a **33Ω Burden Resistor** in parallel across the two SCT-013 leads.
- Connect a **Voltage Divider** with two 10kΩ resistors from 3.3V to GND to create a stable **1.65V DC midpoint**.
- Connect a **10µF Capacitor** between the 1.65V midpoint and GND to decouple AC noise.
- Connect one SCT-013 wire to the 1.65V bias point; connect the other to **GPIO34** (ADC1_CH6).
- Clamp the SCT-013 ring around the same Live wire to cross-check readings.

### 3. DS18B20 Digital Temperature Probe
- **VCC (Red)** → ESP32 3.3V
- **GND (Black)** → ESP32 GND
- **Data (Yellow)** → ESP32 **GPIO4**
- Place a **4.7kΩ Pull-Up Resistor** between Data and 3.3V.

### 4. MPU6050 6-Axis Vibration / IMU
- **VCC** → ESP32 3.3V
- **GND** → ESP32 GND
- **SDA** → ESP32 **GPIO21** (I2C Data)
- **SCL** → ESP32 **GPIO22** (I2C Clock)

### 5. 0.96" SSD1306 OLED Display
- Shares the same I2C bus:
  - **SDA** → ESP32 **GPIO21**
  - **SCL** → ESP32 **GPIO22**
  - **VCC** → ESP32 3.3V
  - **GND** → ESP32 GND

### 6. HC-SR501 PIR Motion Sensor
- **VCC** → ESP32 5V
- **GND** → ESP32 GND
- **OUT** → ESP32 **GPIO13**

### 7. IR Proximity / Obstacle Sensor
- **VCC** → ESP32 3.3V
- **GND** → ESP32 GND
- **OUT** → ESP32 **GPIO14**

### 8. Actuators: 5V Relay, AC Contactor, E-Stop & Buzzer
- **5V Relay Module**:
  - VCC → 5V, GND → GND, IN1 → **GPIO26**
- **AC Contactor Coil (A1 / A2)**:
  - Contactor Coil A1 is wired in series through the Relay NO (Normally Open) contact AND the Emergency Stop button.
  - When Relay is ON and E-Stop is closed, Contactor coil energizes, pulling high-power contacts closed to feed the machine.
- **Emergency Stop (E-Stop)**:
  - Auxiliary contact wired between **GPIO25** and GND (with internal pull-up).
  - Main contact wired directly in line with Contactor coil power for fail-safe hardwired cutoff.
- **5V Buzzer**:
  - Positive lead → **GPIO19** (via 220Ω resistor or transistor driver)
  - Negative lead → GND

---

## 🤖 Closed-Loop AI Prediction & Control Flow

```
[IoT Physical Layer]
  PZEM-004T (V, I, P, PF) + SCT-013 (I_check)
  DS18B20 (Temperature °C)
  MPU6050 (Vibration G RMS)
  HC-SR501 (PIR Occupancy)
  IR Proximity (Workpiece Cycle)
  E-Stop Switch (Safety Interlock)
            │
            ▼ (JSON Telemetry every 3s via Wi-Fi)
[Energy Advisor Server: POST /api/iot]
            │
            ├─► 1. Multi-Modal Signal Fusion:
            │      - Is E-stop tripped? ───────► Emergency Shutdown
            │      - Is Current > 25A? ────────► Overcurrent Protection Trip
            │      - High Vib + High Temp? ────► Bearing Wear / Maintenance Alert
            │      - Power > 25W & PIR=0 & Prox=0 ──► Idle Standby Waste Detected!
            │
            ├─► 2. AI Reasoning & Predictive Forecasting:
            │      - Calculate excess power (W) & waste cost (₹/hr)
            │      - Workload-conditioned expected energy model
            │      - 24-48h idle risk prediction
            │
            └─► 3. Closed-Loop Command Dispatch back to ESP32:
                   - Relay: ON / OFF / KEEP
                   - Buzzer: OFF / BEEP / ALARM
                   - OLED Display: "P:312W IDLE WASTE", "AI: STANDBY REC"
```

---

## 🚀 How to Flash & Run

1. Open Arduino IDE.
2. Install required libraries from Library Manager:
   - `ArduinoJson` (by Benoit Blanchon, v6.x or v7.x)
   - `PZEM004Tv30` (by Mandar Solanki)
   - `OneWire` and `DallasTemperature` (by Miles Burton)
   - `Adafruit MPU6050` and `Adafruit Sensor`
   - `Adafruit SSD1306` and `Adafruit GFX Library`
3. Open `esp32_firmware/esp32_energy_advisor.ino`.
4. Update `WIFI_SSID`, `WIFI_PASSWORD`, and `SERVER_URL` (IP of your PC running the Energy Analyzer).
5. Select Board: **ESP32 Dev Module** and correct COM port.
6. Click **Upload**.
7. Open Serial Monitor at **115200 baud** to see real-time sensor polling and bidirectional AI handshakes!
