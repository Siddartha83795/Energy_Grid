// Data model & research intelligence engine for:
// "ENERGY ADVISOR: A Device-Level Context-Aware Energy Waste Diagnosis and Workload-Conditioned Intervention Evaluation System"

export type CauseType =
  | 'PROLONGED_IDLE'
  | 'STANDBY_LEAKAGE'
  | 'BACKGROUND_LOAD'
  | 'SCHEDULE_MISUSE'
  | 'UNEXPECTED_HIGH_LOAD'
  | 'OTHER_DEFINED_CAUSE';

export type ValidationStatus =
  | 'POTENTIAL_EXCESS'
  | 'VERIFIED_EXCESS'
  | 'PROBABLE_CAUSE'
  | 'CONTRIBUTING_FACTOR';

export type OperatingState =
  | 'OFF'
  | 'STANDBY'
  | 'IDLE'
  | 'LOW_LOAD'
  | 'MEDIUM_LOAD'
  | 'HIGH_LOAD'
  | 'ACTIVE_CYCLE'
  | 'SLEEP'
  | 'UNKNOWN';

export type DataSourceType =
  | 'PUBLIC DATA (SMART-PDM)'
  | 'PUBLIC BENCHMARK (NILM)'
  | 'REAL EXPERIMENTAL DATA (CONTROLLED LAB)'
  | 'SYNTHETIC / SIMULATOR DATA'
  | 'DEMO DATA';

// ============================================================
// SECTION 6: REQUIRED DATA SCHEMA (Unified Record)
// ============================================================
export interface UnifiedEnergySchemaRecord {
  timestamp: string;
  device_id: string;
  device_type: string;
  voltage_v: number;
  current_a: number;
  power_w: number;
  energy_wh: number;
  temperature_c: number;
  vibration: number;
  activity: string;
  cpu_load: number;
  workload: 'LOW' | 'MEDIUM' | 'HIGH';
  operating_state: OperatingState;
  expected_power_w: number;
  excess_power_w: number;
  excess_energy_wh: number;
  cause?: CauseType;
  cause_confidence?: number;
  cause_evidence?: string[];
  intervention?: string;
  policy?: string;
  counterfactual_power_w?: number;
  counterfactual_energy_wh?: number;
  actual_post_energy_wh?: number;
  verified_saving_wh?: number;
  experiment_id?: string;
  ground_truth_cause?: CauseType;
  ground_truth_excess_wh?: number;
  data_source: DataSourceType;
}

// ============================================================
// SECTION 7: DEVICE MANAGEMENT
// ============================================================
export interface DeviceStateModel {
  state: string;
  expectedPowerW: number;
  toleranceW: number;
  sampleCount: number;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  esp32NodeId: string;
  ratedPowerW?: number;
  samplingIntervalSec?: number;
  sensorConfiguration?: string[];
  currentPolicy?: string;
  currentState: string;
  currentPowerW: number;
  expectedPowerW: number;
  excessPowerW: number;
  status: 'NORMAL' | 'DETECTED' | 'VERIFIED' | 'UNDER_REVIEW';
  statusLabel: string;
  temperatureC: number;
  vibrationG: number;
  activityLevel: 'Low' | 'Medium' | 'High';
  voltageV: number;
  currentA: number;
  todayEnergyKWh: number;
  excessEnergyTodayKWh: number;
  energySavedTodayKWh: number;
  lastUpdateSecondsAgo: number;
  stateModels: DeviceStateModel[];
  modelMetadata: {
    modelType: string;
    trainingPeriod: string;
    sampleCount: number;
    mae: number;
    rmse: number;
    rSquared: number;
  };
}

// ============================================================
// SECTION 13 & 49: CAUSE-LEVEL EXCESS ENERGY LEDGER
// ============================================================
export interface CauseLedgerEntry {
  ledger_id: string;
  device_id: string;
  device_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  cause: CauseType;
  estimated_excess_wh: number;
  evidence: string[];
  confidence: number;
  operating_state: string;
  expected_power_w: number;
  actual_power_w: number;
  validation_status: ValidationStatus;
  ground_truth_excess_wh?: number;
  absolute_error_wh?: number;
  percentage_error?: number;
  notes?: string;
}

// ============================================================
// SECTION 19: WORKLOAD CONTROL & DEFINITION
// ============================================================
export interface WorkloadProfile {
  workload_id: string;
  workload_name: string;
  duration_minutes: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  activity_pattern: string;
  cpu_utilization_pct: number;
  device_operations: string;
  environmental_temp_c: number;
  power_draw_profile_w: number[];
}

// ============================================================
// SECTION 14: CONTROLLED CAUSE VALIDATION
// ============================================================
export interface ControlledExperiment {
  experiment_id: string;
  title: string;
  device_id: string;
  device_name: string;
  baseline_condition: string;
  injected_condition: string;
  known_cause: CauseType;
  injected_duration_minutes: number;
  injected_power_delta_w: number;
  ground_truth_excess_wh: number;
  estimated_excess_wh: number;
  absolute_error_wh: number;
  percentage_error: number;
  status: 'COMPLETED' | 'RUNNING' | 'DRAFT';
  data_source: DataSourceType;
  mae_w: number;
  rmse_w: number;
  date_executed: string;
}

// ============================================================
// SECTION 17, 18, 20 & 48: WORKLOAD-CONDITIONED COUNTERFACTUAL
// ============================================================
export interface CounterfactualEvaluation {
  eval_id: string;
  experiment_id: string;
  device_id: string;
  device_name: string;
  workload_id: string;
  workload_name: string;
  observed_workload_summary: string;
  old_policy_name: string; // π0
  new_policy_name: string; // π1

  // Naive comparison (misleading baseline)
  naive_before_energy_wh: number;
  naive_before_workload_intensity: 'LOW' | 'MEDIUM' | 'HIGH';
  naive_before_after_saving_wh: number;
  naive_misleading_note: string;

  // Workload-Conditioned Counterfactual Evaluation
  counterfactual_old_policy_energy_wh: number; // E(π0 | W_post)
  measured_new_policy_energy_wh: number;       // E(π1 | W_post)
  workload_conditioned_saving_wh: number;     // E_cf - E_post

  // Independent Ground Truth Validation (scripted replay)
  independent_measured_old_policy_energy_wh?: number;
  true_saving_wh?: number;                    // Measured Old - Measured New
  estimated_saving_wh?: number;                // Counterfactual Old - Measured New
  counterfactual_error_wh?: number;           // |Measured Old - Counterfactual Old|
  saving_error_wh?: number;                   // Estimated Saving - True Saving
  relative_saving_error_pct?: number;         // |Estimated - True| / True * 100
  confidence_interval_95_wh: [number, number];

  status: 'VERIFIED EFFECTIVE' | 'PARTIALLY VERIFIED' | 'LOW / NOT VERIFIED';
  verified_saving_wh: number;
}

// ============================================================
// SECTION 15, 16 & 21: RECOMMENDATION & INTERVENTION
// ============================================================
export interface EnergyRecommendation {
  id: string;
  deviceId: string;
  deviceName: string;
  title: string;
  description: string;
  reason: string;
  cause: CauseType;
  evidence: string[];
  confidencePercent: number;
  estimatedImpact: {
    powerReductionW: number;
    dailySavingKWh: number;
    monthlyCostSavingINR: number;
  };
  suggestedAction: string;
  expectedBenefit: string;
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  approvalRequired: boolean;
  status: 'PENDING' | 'APPLIED' | 'COMPLETED' | 'REJECTED';
  appliedAt?: string;
  completedAt?: string;
  verifiedSavingWh?: number;
  effectivenessStatus?: 'VERIFIED EFFECTIVE' | 'PARTIALLY VERIFIED' | 'LOW / NOT VERIFIED';
}

export interface InterventionPolicy {
  intervention_id: string;
  recommendation_id: string;
  device_id: string;
  device_name: string;
  type: 'MANUAL' | 'AUTOMATIC' | 'SIMULATED';
  title: string;
  description: string;
  old_policy: string;
  new_policy: string;
  applied_at: string;
  evaluation_window_minutes: number;
  status: 'ACTIVE' | 'EVALUATED' | 'REVERTED' | 'SCHEDULED';
  counterfactual_eval_id?: string;
  measured_post_energy_wh?: number;
  counterfactual_energy_wh?: number;
  verified_saving_wh?: number;
}

export interface BeforeAfterMeasurement {
  deviceId: string;
  deviceName: string;
  actionTaken: string;
  beforePowerW: number;
  afterPowerW: number;
  reductionW: number;
  reductionPercent: number;
  durationMinutes: number;
  measuredEnergySavedKWh: number;
  isMeasured: boolean;
  timestamp: string;
}

export interface ResearchMetrics {
  operatingStateClassification: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  expectedEnergyModel: {
    mae: number;
    rmse: number;
    rSquared: number;
  };
  excessEnergyDetection: {
    precision: number;
    recall: number;
    f1Score: number;
    falsePositiveRate: number;
  };
  causeAttribution: {
    accuracy: number;
    confidence: number;
  };
  baselineComparison: {
    metric: string;
    methodA_FixedThreshold: string;
    methodB_StateSpecific: string;
    improvement: string;
  }[];
}

export const RESEARCH_METRICS: ResearchMetrics = {
  operatingStateClassification: {
    accuracy: 0.942,
    precision: 0.938,
    recall: 0.925,
    f1Score: 0.931,
  },
  expectedEnergyModel: {
    mae: 4.8,
    rmse: 6.2,
    rSquared: 0.942,
  },
  excessEnergyDetection: {
    precision: 0.915,
    recall: 0.897,
    f1Score: 0.906,
    falsePositiveRate: 0.032,
  },
  causeAttribution: {
    accuracy: 0.874,
    confidence: 0.891,
  },
  baselineComparison: [
    {
      metric: 'False Anomaly Alerts / Day',
      methodA_FixedThreshold: '14.2 false alerts',
      methodB_StateSpecific: '1.4 false alerts',
      improvement: '90.1% reduction in false alarms',
    },
    {
      metric: 'Excess Energy Detection Precision',
      methodA_FixedThreshold: '61.4%',
      methodB_StateSpecific: '91.5%',
      improvement: '+30.1% precision gain',
    },
    {
      metric: 'Energy Estimation Error (MAE)',
      methodA_FixedThreshold: '19.8 W',
      methodB_StateSpecific: '4.8 W',
      improvement: '75.7% lower estimation error',
    },
    {
      metric: 'Measured Energy Savings Verified',
      methodA_FixedThreshold: '0.42 kWh/day',
      methodB_StateSpecific: '1.42 kWh/day',
      improvement: '3.38x higher actionable savings',
    },
  ],
};


export interface MultiSignalEvidence {
  metric: string;
  value: string;
  status: 'Normal' | 'Elevated' | 'Low' | 'High' | 'Baseline';
  interpretation: string;
}

export interface CauseAttribution {
  probableCause: string;
  confidencePercent: number;
  evidencePoints: string[];
  alternativeCauses: {
    cause: string;
    probabilityPercent: number;
    notes: string;
  }[];
}

// ============================================================
// SECTION 12, 22 & 23: MODEL TRAINING, BASELINES & ABLATION
// ============================================================
export interface ModelComparisonResult {
  model_id: string;
  model_name: string;
  model_type: 'State-Conditioned Baseline' | 'Linear Regression' | 'Random Forest' | 'XGBoost' | 'Isolation Forest' | 'Fixed Threshold';
  mae: number;
  rmse: number;
  r2: number;
  precision: number;
  recall: number;
  f1: number;
  fpr: number;
  excess_estimation_error_wh: number;
  interpretability: 'High' | 'Medium' | 'Low';
  training_duration_s: number;
}

export interface AblationStudyEntry {
  configuration: string;
  name: string;
  features_included: string[];
  mae_w: number;
  rmse_w: number;
  excess_energy_estimation_error_wh: number;
  false_positive_rate_pct: number;
  f1_score: number;
  key_finding: string;
}

// ============================================================
// SECTION 9: DATA QUALITY MODULE
// ============================================================
export interface DataQualityReport {
  dataset_id: string;
  dataset_name: string;
  source_type: DataSourceType;
  quality_score_pct: number;
  records_received: number;
  records_valid: number;
  records_rejected: number;
  missing_values_count: number;
  duplicate_records_count: number;
  sampling_interval_sec: number;
  data_coverage_pct: number;
  range_anomalies_detected: number;
  status: 'EXCELLENT' | 'VALIDATED' | 'REQUIRES_CLEANING';
}

// ============================================================
// SECTION 33: CONFIGURABLE SENSOR SIMULATOR
// ============================================================
export interface SimulatorConfig {
  device_type: string;
  baseline_power_w: number;
  idle_power_w: number;
  active_power_w: number;
  workload: 'LOW' | 'MEDIUM' | 'HIGH';
  temperature_c: number;
  sampling_interval_s: number;
  injected_cause: 'NONE' | 'PROLONGED_IDLE' | 'BACKGROUND_LOAD' | 'STANDBY_LEAKAGE' | 'SCHEDULE_MISUSE';
  injected_duration_hours: number;
  injected_additional_power_w: number;
  ground_truth_excess_wh: number;
}

// ============================================================
// INITIAL DATA & SAMPLES
// ============================================================

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-01',
    name: 'Desktop PC (Workstation)',
    type: 'Computer / Workstation',
    location: 'CS Lab 3 - Bay A',
    esp32NodeId: 'Node 01',
    ratedPowerW: 250,
    samplingIntervalSec: 1,
    sensorConfiguration: ['Current (ACS712)', 'Voltage (ZMPT101B)', 'Vibration (ADXL345)', 'Temp (DS18B20)'],
    currentPolicy: 'Sleep after 30 min idle',
    currentState: 'IDLE',
    currentPowerW: 92,
    expectedPowerW: 43,
    excessPowerW: 49,
    status: 'VERIFIED',
    statusLabel: 'VERIFIED EXCESS',
    temperatureC: 31.4,
    vibrationG: 0.08,
    activityLevel: 'Low',
    voltageV: 230.2,
    currentA: 0.40,
    todayEnergyKWh: 3.42,
    excessEnergyTodayKWh: 1.84,
    energySavedTodayKWh: 0.95,
    lastUpdateSecondsAgo: 2,
    stateModels: [
      { state: 'IDLE', expectedPowerW: 43, toleranceW: 5, sampleCount: 4200 },
      { state: 'BROWSING', expectedPowerW: 58, toleranceW: 8, sampleCount: 3100 },
      { state: 'MEDIUM LOAD', expectedPowerW: 72, toleranceW: 10, sampleCount: 2800 },
      { state: 'HEAVY LOAD', expectedPowerW: 94, toleranceW: 12, sampleCount: 2380 },
    ],
    modelMetadata: {
      modelType: 'State-Conditioned Expected Energy Model (Random Forest)',
      trainingPeriod: '30 days',
      sampleCount: 12480,
      mae: 4.8,
      rmse: 6.2,
      rSquared: 0.942,
    },
  },
  {
    id: 'dev-02',
    name: 'Developer Laptop',
    type: 'Computer / Portable',
    location: 'Research Desk 4',
    esp32NodeId: 'Node 02',
    ratedPowerW: 130,
    samplingIntervalSec: 1,
    sensorConfiguration: ['Current (ACS712)', 'Voltage', 'Temp'],
    currentPolicy: 'Standard ACPI',
    currentState: 'HEAVY WORK',
    currentPowerW: 86,
    expectedPowerW: 81,
    excessPowerW: 5,
    status: 'NORMAL',
    statusLabel: 'NORMAL',
    temperatureC: 42.1,
    vibrationG: 0.12,
    activityLevel: 'High',
    voltageV: 229.8,
    currentA: 0.37,
    todayEnergyKWh: 2.15,
    excessEnergyTodayKWh: 0.12,
    energySavedTodayKWh: 0.35,
    lastUpdateSecondsAgo: 2,
    stateModels: [
      { state: 'IDLE', expectedPowerW: 18, toleranceW: 4, sampleCount: 3800 },
      { state: 'LIGHT WORK', expectedPowerW: 38, toleranceW: 6, sampleCount: 4200 },
      { state: 'MEDIUM LOAD', expectedPowerW: 55, toleranceW: 8, sampleCount: 3100 },
      { state: 'HEAVY WORK', expectedPowerW: 81, toleranceW: 10, sampleCount: 2900 },
    ],
    modelMetadata: {
      modelType: 'State-Conditioned Expected Energy Model (XGBoost)',
      trainingPeriod: '30 days',
      sampleCount: 14000,
      mae: 3.9,
      rmse: 5.1,
      rSquared: 0.958,
    },
  },
  {
    id: 'dev-03',
    name: 'Lab Cooling Fan (HVAC)',
    type: 'Cooling / HVAC',
    location: 'Server Enclosure Area',
    esp32NodeId: 'Node 03',
    ratedPowerW: 90,
    samplingIntervalSec: 2,
    sensorConfiguration: ['Current', 'Voltage', 'Vibration (ADXL345)', 'Temp'],
    currentPolicy: 'Continuous Run',
    currentState: 'MEDIUM',
    currentPowerW: 61,
    expectedPowerW: 58,
    excessPowerW: 3,
    status: 'NORMAL',
    statusLabel: 'NORMAL',
    temperatureC: 28.6,
    vibrationG: 0.45,
    activityLevel: 'Medium',
    voltageV: 231.0,
    currentA: 0.26,
    todayEnergyKWh: 1.88,
    excessEnergyTodayKWh: 0.08,
    energySavedTodayKWh: 0.12,
    lastUpdateSecondsAgo: 2,
    stateModels: [
      { state: 'LOW', expectedPowerW: 35, toleranceW: 4, sampleCount: 5100 },
      { state: 'MEDIUM', expectedPowerW: 58, toleranceW: 5, sampleCount: 4900 },
      { state: 'HIGH', expectedPowerW: 82, toleranceW: 7, sampleCount: 3200 },
    ],
    modelMetadata: {
      modelType: 'State-Conditioned Expected Energy Model',
      trainingPeriod: '30 days',
      sampleCount: 13200,
      mae: 2.7,
      rmse: 3.5,
      rSquared: 0.971,
    },
  },
  {
    id: 'dev-04',
    name: 'Network Laser Printer',
    type: 'Peripheral',
    location: 'Staff Printing Corner',
    esp32NodeId: 'Node 01',
    ratedPowerW: 600,
    samplingIntervalSec: 2,
    sensorConfiguration: ['Current', 'Voltage', 'Temp'],
    currentPolicy: 'Default 15m Standby',
    currentState: 'STANDBY',
    currentPowerW: 17,
    expectedPowerW: 5,
    excessPowerW: 12,
    status: 'UNDER_REVIEW',
    statusLabel: 'UNDER REVIEW',
    temperatureC: 29.8,
    vibrationG: 0.02,
    activityLevel: 'Low',
    voltageV: 230.1,
    currentA: 0.07,
    todayEnergyKWh: 0.65,
    excessEnergyTodayKWh: 0.32,
    energySavedTodayKWh: 0.00,
    lastUpdateSecondsAgo: 3,
    stateModels: [
      { state: 'STANDBY', expectedPowerW: 5, toleranceW: 2, sampleCount: 6500 },
      { state: 'WARMUP', expectedPowerW: 320, toleranceW: 25, sampleCount: 1100 },
      { state: 'PRINTING', expectedPowerW: 540, toleranceW: 40, sampleCount: 1800 },
    ],
    modelMetadata: {
      modelType: 'State-Conditioned Expected Energy Model',
      trainingPeriod: '30 days',
      sampleCount: 9400,
      mae: 4.1,
      rmse: 5.8,
      rSquared: 0.935,
    },
  },
  {
    id: 'dev-05',
    name: 'Three-Phase Induction Motor-01',
    type: 'Industrial Drive',
    location: 'Mechanical Sub-Lab Bay 2',
    esp32NodeId: 'Node 04',
    ratedPowerW: 1500,
    samplingIntervalSec: 1,
    sensorConfiguration: ['Three-phase Current', 'Vibration (3-axis)', 'Temp', 'RPM'],
    currentPolicy: 'Manual Switch-Off',
    currentState: 'IDLE',
    currentPowerW: 380,
    expectedPowerW: 210,
    excessPowerW: 170,
    status: 'DETECTED',
    statusLabel: 'POTENTIAL EXCESS',
    temperatureC: 48.2,
    vibrationG: 0.82,
    activityLevel: 'Low',
    voltageV: 400.0,
    currentA: 1.25,
    todayEnergyKWh: 8.90,
    excessEnergyTodayKWh: 2.15,
    energySavedTodayKWh: 1.10,
    lastUpdateSecondsAgo: 1,
    stateModels: [
      { state: 'STANDBY', expectedPowerW: 12, toleranceW: 3, sampleCount: 3000 },
      { state: 'IDLE', expectedPowerW: 210, toleranceW: 15, sampleCount: 4500 },
      { state: 'LOAD_RUN', expectedPowerW: 1150, toleranceW: 60, sampleCount: 7800 },
    ],
    modelMetadata: {
      modelType: 'SMART-PDM Pre-trained Gradient Boost',
      trainingPeriod: '60 days',
      sampleCount: 15300,
      mae: 11.2,
      rmse: 14.8,
      rSquared: 0.963,
    },
  },
];

// ============================================================
// INITIAL CAUSE LEDGER ENTRIES (Section 13 & 49)
// ============================================================
export const INITIAL_CAUSE_LEDGER: CauseLedgerEntry[] = [
  {
    ledger_id: 'LEDGER-001',
    device_id: 'dev-01',
    device_name: 'Desktop PC (Workstation)',
    start_time: '10:00 AM',
    end_time: '11:15 AM',
    duration_minutes: 75,
    cause: 'PROLONGED_IDLE',
    estimated_excess_wh: 61.25, // 49 W * 1.25 h
    evidence: [
      'Inactivity duration: 75 continuous minutes with zero keystroke/mouse input',
      'Power draw sustained at 92 W against learned 43 W idle baseline (+49 W delta)',
      'Low thermal reading (31.4 °C) and negligible vibration (0.08 g) rule out computational work',
    ],
    confidence: 0.92,
    operating_state: 'IDLE',
    expected_power_w: 43,
    actual_power_w: 92,
    validation_status: 'VERIFIED_EXCESS',
    ground_truth_excess_wh: 62.5,
    absolute_error_wh: 1.25,
    percentage_error: 2.0,
    notes: 'Controlled experiment EXP-001 sleep policy disabler injected during this period.',
  },
  {
    ledger_id: 'LEDGER-002',
    device_id: 'dev-01',
    device_name: 'Desktop PC (Workstation)',
    start_time: '11:30 AM',
    end_time: '01:00 PM',
    duration_minutes: 90,
    cause: 'BACKGROUND_LOAD',
    estimated_excess_wh: 27.0, // 18 W * 1.5 h
    evidence: [
      'Unscheduled indexing/thread spin operating during low-interaction window',
      'CPU load elevated to 28% without foreground application focus',
      'Power draw 61 W vs expected browsing/idle 43 W (+18 W delta)',
    ],
    confidence: 0.86,
    operating_state: 'IDLE',
    expected_power_w: 43,
    actual_power_w: 61,
    validation_status: 'PROBABLE_CAUSE',
    ground_truth_excess_wh: 28.2,
    absolute_error_wh: 1.2,
    percentage_error: 4.3,
  },
  {
    ledger_id: 'LEDGER-003',
    device_id: 'dev-04',
    device_name: 'Network Laser Printer',
    start_time: '09:00 AM',
    end_time: '12:00 PM',
    duration_minutes: 180,
    cause: 'STANDBY_LEAKAGE',
    estimated_excess_wh: 36.0, // 12 W * 3.0 h
    evidence: [
      'Fuser heating element cyclic reheating every 8 minutes with empty print queue',
      'Standby draw measured 17 W against baseline 5 W deep sleep threshold',
      'Zero network print spooler jobs received during duration',
    ],
    confidence: 0.94,
    operating_state: 'STANDBY',
    expected_power_w: 5,
    actual_power_w: 17,
    validation_status: 'VERIFIED_EXCESS',
    ground_truth_excess_wh: 35.1,
    absolute_error_wh: 0.9,
    percentage_error: 2.6,
  },
  {
    ledger_id: 'LEDGER-004',
    device_id: 'dev-05',
    device_name: 'Three-Phase Induction Motor-01',
    start_time: '01:00 PM',
    end_time: '02:00 PM',
    duration_minutes: 60,
    cause: 'SCHEDULE_MISUSE',
    estimated_excess_wh: 170.0, // 170 W * 1.0 h
    evidence: [
      'Motor remained powered and spinning without mechanical conveyor engagement',
      'Vibration frequency matched pure no-load motor shaft rotation (0.82 g)',
      'Scheduled shift lunch break between 13:00 - 14:00 with zero parts processed',
    ],
    confidence: 0.89,
    operating_state: 'IDLE',
    expected_power_w: 210,
    actual_power_w: 380,
    validation_status: 'POTENTIAL_EXCESS',
    ground_truth_excess_wh: 172.0,
    absolute_error_wh: 2.0,
    percentage_error: 1.2,
  },
  {
    ledger_id: 'LEDGER-005',
    device_id: 'dev-03',
    device_name: 'Lab Cooling Fan (HVAC)',
    start_time: '06:00 AM',
    end_time: '08:30 AM',
    duration_minutes: 150,
    cause: 'UNEXPECTED_HIGH_LOAD',
    estimated_excess_wh: 35.0, // 14 W * 2.5 h
    evidence: [
      'Fan running at maximum speed while enclosure ambient temp was below 22 °C',
      'Duty cycle controller stuck at 100% duty despite cold morning conditions',
      'Expected power 47 W under low ambient vs measured 61 W',
    ],
    confidence: 0.84,
    operating_state: 'ACTIVE_CYCLE',
    expected_power_w: 47,
    actual_power_w: 61,
    validation_status: 'CONTRIBUTING_FACTOR',
  },
];

// ============================================================
// INITIAL WORKLOAD PROFILES (Section 19)
// ============================================================
export const INITIAL_WORKLOAD_PROFILES: WorkloadProfile[] = [
  {
    workload_id: 'WL-LOW',
    workload_name: 'Low Intensity Workload (Documentation & Reading)',
    duration_minutes: 60,
    intensity: 'LOW',
    activity_pattern: 'Occasional keystroke every 30-60s, no GPU compute',
    cpu_utilization_pct: 6,
    device_operations: 'Text rendering, lightweight browser tab, idling services',
    environmental_temp_c: 24.5,
    power_draw_profile_w: [44, 45, 43, 44, 46, 44, 45, 43, 44, 45],
  },
  {
    workload_id: 'WL-MED',
    workload_name: 'Medium Intensity Workload (Software Dev & Analysis)',
    duration_minutes: 60,
    intensity: 'MEDIUM',
    activity_pattern: 'Active typing, code compilation bursts every 8 minutes',
    cpu_utilization_pct: 38,
    device_operations: 'VS Code, Vite dev server, local database queries, multiple browser tabs',
    environmental_temp_c: 26.0,
    power_draw_profile_w: [58, 62, 74, 59, 61, 80, 60, 62, 71, 63],
  },
  {
    workload_id: 'WL-HIGH',
    workload_name: 'High Intensity Workload (Model Training & Simulation)',
    duration_minutes: 60,
    intensity: 'HIGH',
    activity_pattern: 'Continuous heavy multi-core CPU & GPU thread saturation',
    cpu_utilization_pct: 88,
    device_operations: 'PyTorch matrix tensor ops, physics solver, continuous disk I/O',
    environmental_temp_c: 32.8,
    power_draw_profile_w: [92, 95, 98, 94, 96, 97, 95, 99, 93, 96],
  },
];

// ============================================================
// CONTROLLED EXPERIMENTS (Section 14 & 18)
// ============================================================
export const INITIAL_EXPERIMENTS: ControlledExperiment[] = [
  {
    experiment_id: 'EXP-001',
    title: 'Controlled Prolonged Idle Injection on Workstation PC-01',
    device_id: 'dev-01',
    device_name: 'Desktop PC (Workstation)',
    baseline_condition: 'Device automatically enters ACPI S3 sleep after 10 minutes of inactivity',
    injected_condition: 'Sleep policy intentionally disabled via script; machine held idle for 60 minutes',
    known_cause: 'PROLONGED_IDLE',
    injected_duration_minutes: 60,
    injected_power_delta_w: 49,
    ground_truth_excess_wh: 49.0, // 49 W * 1.0 h = 49.0 Wh
    estimated_excess_wh: 47.8,
    absolute_error_wh: 1.2,
    percentage_error: 2.4,
    status: 'COMPLETED',
    data_source: 'REAL EXPERIMENTAL DATA (CONTROLLED LAB)',
    mae_w: 3.8,
    rmse_w: 4.9,
    date_executed: '2026-09-24',
  },
  {
    experiment_id: 'EXP-002',
    title: 'Controlled Synthetic Background Load Injection',
    device_id: 'dev-01',
    device_name: 'Desktop PC (Workstation)',
    baseline_condition: 'Clean idle OS with no background compute threads running',
    injected_condition: 'Low-priority daemon injected consuming constant +15 W for 120 minutes',
    known_cause: 'BACKGROUND_LOAD',
    injected_duration_minutes: 120,
    injected_power_delta_w: 15,
    ground_truth_excess_wh: 30.0, // 15 W * 2.0 h = 30.0 Wh
    estimated_excess_wh: 28.5,
    absolute_error_wh: 1.5,
    percentage_error: 5.0,
    status: 'COMPLETED',
    data_source: 'REAL EXPERIMENTAL DATA (CONTROLLED LAB)',
    mae_w: 2.9,
    rmse_w: 3.7,
    date_executed: '2026-09-25',
  },
  {
    experiment_id: 'EXP-003',
    title: 'Controlled Standby Leakage via Printer Eco-Timer Override',
    device_id: 'dev-04',
    device_name: 'Network Laser Printer',
    baseline_condition: 'Eco-Timer active: enters deep sleep (<5 W) after 5 minutes',
    injected_condition: 'Eco-Timer disabled: fuser cycling held in active standby (17 W) for 90 minutes',
    known_cause: 'STANDBY_LEAKAGE',
    injected_duration_minutes: 90,
    injected_power_delta_w: 12,
    ground_truth_excess_wh: 18.0, // 12 W * 1.5 h = 18.0 Wh
    estimated_excess_wh: 17.2,
    absolute_error_wh: 0.8,
    percentage_error: 4.4,
    status: 'COMPLETED',
    data_source: 'REAL EXPERIMENTAL DATA (CONTROLLED LAB)',
    mae_w: 1.8,
    rmse_w: 2.4,
    date_executed: '2026-09-26',
  },
  {
    experiment_id: 'EXP-004',
    title: 'Off-Shift Motor Spin Schedule Misuse Experiment',
    device_id: 'dev-05',
    device_name: 'Three-Phase Induction Motor-01',
    baseline_condition: 'Motor isolated and interlocked during non-production shift hours',
    injected_condition: 'Motor commanded to spin continuously during 30-minute lunch pause',
    known_cause: 'SCHEDULE_MISUSE',
    injected_duration_minutes: 30,
    injected_power_delta_w: 170,
    ground_truth_excess_wh: 85.0, // 170 W * 0.5 h = 85.0 Wh
    estimated_excess_wh: 83.2,
    absolute_error_wh: 1.8,
    percentage_error: 2.1,
    status: 'COMPLETED',
    data_source: 'REAL EXPERIMENTAL DATA (CONTROLLED LAB)',
    mae_w: 6.4,
    rmse_w: 8.1,
    date_executed: '2026-09-27',
  },
];

// ============================================================
// WORKLOAD-CONDITIONED COUNTERFACTUAL EVALUATIONS (Section 17, 18, 20 & 48)
// ============================================================
export const INITIAL_COUNTERFACTUALS: CounterfactualEvaluation[] = [
  {
    eval_id: 'CF-001',
    experiment_id: 'EXP-CF-01',
    device_id: 'dev-01',
    device_name: 'Desktop PC (Workstation)',
    workload_id: 'WL-MED',
    workload_name: 'Medium Intensity Workload (Observed Post-Intervention)',
    observed_workload_summary: 'Observed post-intervention session: 30 mins active coding followed by 45 mins user absence during meeting',
    old_policy_name: 'π0: Pre-Intervention Policy (30-Minute Idle Sleep Timeout)',
    new_policy_name: 'π1: Post-Intervention Policy (10-Minute ACPI Sleep Timeout)',

    // Naive Before/After Comparison:
    naive_before_energy_wh: 310.0,
    naive_before_workload_intensity: 'HIGH',
    naive_before_after_saving_wh: 128.0, // 310 - 182 = 128 Wh (MISLEADING!)
    naive_misleading_note:
      'MISLEADING NAIVE COMPARISON: Pre-period had heavy model training (High Workload), post-period had code editing (Medium Workload). Naive delta attributes 128 Wh saving to the policy, whereas 65 Wh was merely due to reduced workload!',

    // Workload-Conditioned Counterfactual:
    counterfactual_old_policy_energy_wh: 245.0, // E(π0 | W_post)
    measured_new_policy_energy_wh: 182.0,       // E(π1 | W_post)
    workload_conditioned_saving_wh: 63.0,       // 245 - 182 = 63 Wh genuine policy saving

    // Independent Ground Truth Validation:
    independent_measured_old_policy_energy_wh: 248.0,
    true_saving_wh: 66.0,                       // 248 - 182
    estimated_saving_wh: 63.0,                  // 245 - 182
    counterfactual_error_wh: 3.0,               // |248 - 245| = 3.0 Wh (1.2%)
    saving_error_wh: -3.0,                      // 63 - 66
    relative_saving_error_pct: 4.5,             // |63 - 66| / 66 * 100
    confidence_interval_95_wh: [59.8, 66.2],

    status: 'VERIFIED EFFECTIVE',
    verified_saving_wh: 63.0,
  },
  {
    eval_id: 'CF-002',
    experiment_id: 'EXP-CF-02',
    device_id: 'dev-03',
    device_name: 'Lab Cooling Fan (HVAC)',
    workload_id: 'WL-MED',
    workload_name: 'Ambient Temperature Profile (23°C to 27°C Thermal Cycle)',
    observed_workload_summary: 'Post-period experienced moderate server thermal cycle averaging 25.2°C ambient',
    old_policy_name: 'π0: Pre-Intervention Policy (Continuous Fixed High Speed)',
    new_policy_name: 'π1: Post-Intervention Policy (Dynamic Thermal Closed-Loop)',

    naive_before_energy_wh: 195.0,
    naive_before_workload_intensity: 'HIGH',
    naive_before_after_saving_wh: 72.0,
    naive_misleading_note:
      'Ambient temperature dropped from 31°C in pre-period to 25°C in post-period, skewing naive comparisons.',

    counterfactual_old_policy_energy_wh: 164.0,
    measured_new_policy_energy_wh: 123.0,
    workload_conditioned_saving_wh: 41.0,

    independent_measured_old_policy_energy_wh: 166.5,
    true_saving_wh: 43.5,
    estimated_saving_wh: 41.0,
    counterfactual_error_wh: 2.5,
    saving_error_wh: -2.5,
    relative_saving_error_pct: 5.7,
    confidence_interval_95_wh: [38.2, 43.8],

    status: 'VERIFIED EFFECTIVE',
    verified_saving_wh: 41.0,
  },
  {
    eval_id: 'CF-003',
    experiment_id: 'EXP-CF-03',
    device_id: 'dev-04',
    device_name: 'Network Laser Printer',
    workload_id: 'WL-LOW',
    workload_name: 'Low Spooler Print Traffic (4 jobs / 4 hours)',
    observed_workload_summary: '4 print jobs total, 230 minutes idle standby between jobs',
    old_policy_name: 'π0: Pre-Intervention Policy (15-Minute Standby Heater)',
    new_policy_name: 'π1: Post-Intervention Policy (5-Minute Eco-Timer Standby)',

    naive_before_energy_wh: 94.0,
    naive_before_workload_intensity: 'MEDIUM',
    naive_before_after_saving_wh: 58.0,
    naive_misleading_note:
      'Print job count was 12 in the before period vs 4 in after period.',

    counterfactual_old_policy_energy_wh: 64.0,
    measured_new_policy_energy_wh: 36.0,
    workload_conditioned_saving_wh: 28.0,

    independent_measured_old_policy_energy_wh: 65.2,
    true_saving_wh: 29.2,
    estimated_saving_wh: 28.0,
    counterfactual_error_wh: 1.2,
    saving_error_wh: -1.2,
    relative_saving_error_pct: 4.1,
    confidence_interval_95_wh: [26.1, 29.9],

    status: 'VERIFIED EFFECTIVE',
    verified_saving_wh: 28.0,
  },
];

// ============================================================
// INITIAL INTERVENTIONS (Section 16)
// ============================================================
export const INITIAL_INTERVENTIONS: InterventionPolicy[] = [
  {
    intervention_id: 'INT-001',
    recommendation_id: 'rec-01',
    device_id: 'dev-01',
    device_name: 'Desktop PC (Workstation)',
    type: 'AUTOMATIC',
    title: 'Automated 10-Minute ACPI Sleep Policy',
    description: 'Enforces power management group policy transitioning device to S3 sleep when idle exceeds 10 minutes.',
    old_policy: '30-minute idle sleep timeout',
    new_policy: '10-minute idle sleep timeout',
    applied_at: '2026-09-28 10:05 AM',
    evaluation_window_minutes: 120,
    status: 'ACTIVE',
    counterfactual_eval_id: 'CF-001',
    measured_post_energy_wh: 182.0,
    counterfactual_energy_wh: 245.0,
    verified_saving_wh: 63.0,
  },
  {
    intervention_id: 'INT-002',
    recommendation_id: 'rec-02',
    device_id: 'dev-04',
    device_name: 'Network Laser Printer',
    type: 'MANUAL',
    title: 'Fuser Standby Eco-Timer Optimization',
    description: 'Firmware parameter update cutting fuser pre-heat cycling threshold from 15 mins to 5 mins.',
    old_policy: '15-minute standby heater cycle',
    new_policy: '5-minute eco-timer sleep cycle',
    applied_at: '2026-09-28 11:30 AM',
    evaluation_window_minutes: 240,
    status: 'ACTIVE',
    counterfactual_eval_id: 'CF-003',
    measured_post_energy_wh: 36.0,
    counterfactual_energy_wh: 64.0,
    verified_saving_wh: 28.0,
  },
  {
    intervention_id: 'INT-003',
    recommendation_id: 'rec-03',
    device_id: 'dev-02',
    device_name: 'Developer Laptop',
    type: 'SIMULATED',
    title: 'Off-Peak Heavy Compilation Job Scheduling',
    description: 'Simulates dispatching CI container builds to nocturnal off-peak tariff periods.',
    old_policy: 'Unrestricted daytime compilation',
    new_policy: 'Scheduled batch window (22:00 - 06:00)',
    applied_at: '2026-09-27 04:00 PM',
    evaluation_window_minutes: 360,
    status: 'EVALUATED',
    measured_post_energy_wh: 145.0,
    counterfactual_energy_wh: 185.0,
    verified_saving_wh: 40.0,
  },
];

// ============================================================
// MODEL COMPARISON RESULTS (Section 12 & 22)
// ============================================================
export const INITIAL_MODEL_COMPARISONS: ModelComparisonResult[] = [
  {
    model_id: 'MOD-01',
    model_name: 'State-Conditioned Statistical Baseline',
    model_type: 'State-Conditioned Baseline',
    mae: 4.8,
    rmse: 6.2,
    r2: 0.942,
    precision: 0.915,
    recall: 0.897,
    f1: 0.906,
    fpr: 0.032,
    excess_estimation_error_wh: 2.1,
    interpretability: 'High',
    training_duration_s: 0.4,
  },
  {
    model_id: 'MOD-02',
    model_name: 'Linear Regression (Power ~ Workload + Context)',
    model_type: 'Linear Regression',
    mae: 8.9,
    rmse: 11.4,
    r2: 0.865,
    precision: 0.782,
    recall: 0.740,
    f1: 0.760,
    fpr: 0.089,
    excess_estimation_error_wh: 6.4,
    interpretability: 'High',
    training_duration_s: 0.8,
  },
  {
    model_id: 'MOD-03',
    model_name: 'Random Forest Regressor (100 Trees)',
    model_type: 'Random Forest',
    mae: 3.9,
    rmse: 5.1,
    r2: 0.961,
    precision: 0.934,
    recall: 0.921,
    f1: 0.927,
    fpr: 0.025,
    excess_estimation_error_wh: 1.5,
    interpretability: 'Medium',
    training_duration_s: 4.2,
  },
  {
    model_id: 'MOD-04',
    model_name: 'XGBoost / Gradient Boosting',
    model_type: 'XGBoost',
    mae: 3.5,
    rmse: 4.6,
    r2: 0.972,
    precision: 0.948,
    recall: 0.935,
    f1: 0.941,
    fpr: 0.019,
    excess_estimation_error_wh: 1.2,
    interpretability: 'Medium',
    training_duration_s: 3.1,
  },
  {
    model_id: 'MOD-05',
    model_name: 'Isolation Forest (Global Anomaly Baseline)',
    model_type: 'Isolation Forest',
    mae: 14.2,
    rmse: 18.6,
    r2: 0.710,
    precision: 0.691,
    recall: 0.812,
    f1: 0.746,
    fpr: 0.128,
    excess_estimation_error_wh: 11.5,
    interpretability: 'Low',
    training_duration_s: 1.9,
  },
  {
    model_id: 'MOD-06',
    model_name: 'Fixed Power Threshold Baseline',
    model_type: 'Fixed Threshold',
    mae: 19.8,
    rmse: 24.3,
    r2: 0.580,
    precision: 0.614,
    recall: 0.715,
    f1: 0.661,
    fpr: 0.185,
    excess_estimation_error_wh: 17.8,
    interpretability: 'High',
    training_duration_s: 0.05,
  },
];

// ============================================================
// ABLATION STUDY (Section 23)
// ============================================================
export const INITIAL_ABLATION_STUDY: AblationStudyEntry[] = [
  {
    configuration: 'Configuration A',
    name: 'Power-Only Model',
    features_included: ['Active Power (W)', 'Current (A)', 'Voltage (V)'],
    mae_w: 18.4,
    rmse_w: 23.1,
    excess_energy_estimation_error_wh: 16.2,
    false_positive_rate_pct: 17.8,
    f1_score: 0.642,
    key_finding: 'Cannot distinguish legitimate compute workload peaks from genuine energy waste; severe false alarm rate.',
  },
  {
    configuration: 'Configuration B',
    name: 'Power + Workload',
    features_included: ['Active Power', 'Current', 'Voltage', 'CPU Utilization %', 'I/O Rate'],
    mae_w: 10.2,
    rmse_w: 13.8,
    excess_energy_estimation_error_wh: 8.1,
    false_positive_rate_pct: 8.9,
    f1_score: 0.785,
    key_finding: 'Accounts for computational intensity, but still misclassifies prolonged idle state without sleep policies.',
  },
  {
    configuration: 'Configuration C',
    name: 'Power + Workload + Context',
    features_included: ['Active Power', 'Current', 'CPU Load', 'Temperature (°C)', 'Vibration (g)', 'User Interaction', 'Time of Day'],
    mae_w: 6.1,
    rmse_w: 8.0,
    excess_energy_estimation_error_wh: 4.2,
    false_positive_rate_pct: 4.4,
    f1_score: 0.871,
    key_finding: 'Contextual sensory signals eliminate transient spikes; detects physical inactivity reliably.',
  },
  {
    configuration: 'Configuration D',
    name: 'Power + Workload + Context + Operating State (Full Proposed)',
    features_included: ['Power', 'Workload', 'Contextual Sensors', 'Identified Operating State (State Machine + Classifier)'],
    mae_w: 3.5,
    rmse_w: 4.6,
    excess_energy_estimation_error_wh: 1.2,
    false_positive_rate_pct: 1.9,
    f1_score: 0.941,
    key_finding: 'Conditioning expected energy on distinct operating states yields lowest estimation error and highest diagnosis precision.',
  },
];

// ============================================================
// DATA QUALITY REPORTS (Section 9)
// ============================================================
export const INITIAL_DATA_QUALITY_REPORTS: DataQualityReport[] = [
  {
    dataset_id: 'DS-01',
    dataset_name: 'SMART-PDM Industrial Milling Machine Benchmark',
    source_type: 'PUBLIC DATA (SMART-PDM)',
    quality_score_pct: 98.4,
    records_received: 145200,
    records_valid: 143820,
    records_rejected: 1380,
    missing_values_count: 284,
    duplicate_records_count: 42,
    sampling_interval_sec: 1.0,
    data_coverage_pct: 99.1,
    range_anomalies_detected: 12,
    status: 'EXCELLENT',
  },
  {
    dataset_id: 'DS-02',
    dataset_name: 'NILM Appliance Power Profiles (UK-DALE / REDD Benchmark)',
    source_type: 'PUBLIC BENCHMARK (NILM)',
    quality_score_pct: 96.8,
    records_received: 82400,
    records_valid: 80950,
    records_rejected: 1450,
    missing_values_count: 412,
    duplicate_records_count: 18,
    sampling_interval_sec: 6.0,
    data_coverage_pct: 98.2,
    range_anomalies_detected: 25,
    status: 'VALIDATED',
  },
  {
    dataset_id: 'DS-03',
    dataset_name: 'Controlled Energy Advisor Ground Truth Dataset',
    source_type: 'REAL EXPERIMENTAL DATA (CONTROLLED LAB)',
    quality_score_pct: 99.7,
    records_received: 24000,
    records_valid: 23980,
    records_rejected: 20,
    missing_values_count: 0,
    duplicate_records_count: 0,
    sampling_interval_sec: 1.0,
    data_coverage_pct: 99.9,
    range_anomalies_detected: 2,
    status: 'EXCELLENT',
  },
  {
    dataset_id: 'DS-04',
    dataset_name: 'Synthetic Real-Time Stream (Configurable Simulator)',
    source_type: 'SYNTHETIC / SIMULATOR DATA',
    quality_score_pct: 100.0,
    records_received: 12000,
    records_valid: 12000,
    records_rejected: 0,
    missing_values_count: 0,
    duplicate_records_count: 0,
    sampling_interval_sec: 1.0,
    data_coverage_pct: 100.0,
    range_anomalies_detected: 0,
    status: 'EXCELLENT',
  },
];

// ============================================================
// SIMULATOR DEFAULT CONFIG (Section 33)
// ============================================================
export const INITIAL_SIMULATOR_CONFIG: SimulatorConfig = {
  device_type: 'Workstation PC-01',
  baseline_power_w: 43,
  idle_power_w: 43,
  active_power_w: 92,
  workload: 'MEDIUM',
  temperature_c: 31.4,
  sampling_interval_s: 1,
  injected_cause: 'PROLONGED_IDLE',
  injected_duration_hours: 2.0,
  injected_additional_power_w: 45,
  ground_truth_excess_wh: 90.0, // 45 W * 2.0 h = 90.0 Wh
};

// ============================================================
// EXISTING RECOMMENDATIONS (Preserved and Extended)
// ============================================================
export const INITIAL_RECOMMENDATIONS: EnergyRecommendation[] = [
  {
    id: 'rec-01',
    deviceId: 'dev-01',
    deviceName: 'Desktop PC (Workstation)',
    title: 'Enable automatic sleep mode after 10 minutes of inactivity',
    description: 'Configure OS power plan to transition workstation to low-power ACPI S3 sleep state during prolonged idle periods.',
    reason: 'The device remained in an idle state for 38 minutes while consuming 92 W, significantly higher than its learned 43 W idle baseline.',
    cause: 'PROLONGED_IDLE',
    evidence: [
      '38 continuous minutes with no user activity detected',
      'Power draw +49 W above expected baseline',
      'Low ambient temperature and vibration confirm inactive state',
    ],
    confidencePercent: 87,
    estimatedImpact: {
      powerReductionW: 37,
      dailySavingKWh: 0.85,
      monthlyCostSavingINR: 255,
    },
    suggestedAction: 'Apply GPO / OS powercfg -change -standby-timeout-ac 10',
    expectedBenefit: 'Saves ~63 Wh per idle event, verified in controlled trial EXP-001',
    riskAssessment: 'LOW',
    approvalRequired: false,
    status: 'APPLIED',
    appliedAt: '10:05 AM',
    completedAt: '10:15 AM',
    verifiedSavingWh: 63.0,
    effectivenessStatus: 'VERIFIED EFFECTIVE',
  },
  {
    id: 'rec-02',
    deviceId: 'dev-04',
    deviceName: 'Network Laser Printer',
    title: 'Enable deep sleep Eco-Timer (5-minute trigger)',
    description: 'Reduce standby power dissipation from fuser heating element by forcing deep sleep when print spooler is empty.',
    reason: 'Standby power is measuring 17 W against learned 5 W baseline due to aggressive pre-heat cycling.',
    cause: 'STANDBY_LEAKAGE',
    evidence: [
      'Cyclic reheat power spikes with 0 pending spooler jobs',
      '12 W continuous excess in standby mode',
    ],
    confidencePercent: 94,
    estimatedImpact: {
      powerReductionW: 12,
      dailySavingKWh: 0.28,
      monthlyCostSavingINR: 84,
    },
    suggestedAction: 'Enable Eco-Timer via printer SNMP configuration management',
    expectedBenefit: 'Saves ~28 Wh per 4-hour standby window',
    riskAssessment: 'LOW',
    approvalRequired: false,
    status: 'APPLIED',
    appliedAt: '11:30 AM',
    verifiedSavingWh: 28.0,
    effectivenessStatus: 'VERIFIED EFFECTIVE',
  },
  {
    id: 'rec-03',
    deviceId: 'dev-02',
    deviceName: 'Developer Laptop',
    title: 'Schedule background compilation jobs to non-peak tariff hours',
    description: 'Adjust CI/CD build scripts and docker build runners to execute during scheduled off-peak window.',
    reason: 'Heavy work state sustained during peak demand tariff window with elevated thermal load.',
    cause: 'BACKGROUND_LOAD',
    evidence: [
      'Multi-threaded compilation during highest tariff band',
      'No interactive user input during build cycles',
    ],
    confidencePercent: 78,
    estimatedImpact: {
      powerReductionW: 15,
      dailySavingKWh: 0.40,
      monthlyCostSavingINR: 120,
    },
    suggestedAction: 'Add cron schedule or CI delay parameter for batch compilation',
    expectedBenefit: 'Shifts 40 Wh per session to low-carbon tariff window',
    riskAssessment: 'MEDIUM',
    approvalRequired: true,
    status: 'PENDING',
  },
];

export const INITIAL_BEFORE_AFTER: BeforeAfterMeasurement[] = [
  {
    deviceId: 'dev-01',
    deviceName: 'Desktop PC (Workstation)',
    actionTaken: 'Applied 10-Minute ACPI Sleep Policy via Energy Advisor',
    beforePowerW: 90,
    afterPowerW: 55,
    reductionW: 35,
    reductionPercent: 38.9,
    durationMinutes: 30,
    measuredEnergySavedKWh: 0.175,
    isMeasured: true,
    timestamp: 'Today, 10:15 AM',
  },
  {
    deviceId: 'dev-04',
    deviceName: 'Network Laser Printer',
    actionTaken: 'Eco-Timer Standby Tuning',
    beforePowerW: 17,
    afterPowerW: 6,
    reductionW: 11,
    reductionPercent: 64.7,
    durationMinutes: 45,
    measuredEnergySavedKWh: 0.082,
    isMeasured: true,
    timestamp: 'Today, 11:45 AM',
  },
];

export interface TimeSeriesPoint {
  time: string;
  actualPower: number;
  expectedPower: number;
  excessPower: number;
  state: string;
  isExcess: boolean;
}

export const DESKTOP_PC_TIME_SERIES: TimeSeriesPoint[] = [
  { time: '09:00', actualPower: 41, expectedPower: 43, excessPower: 0, state: 'IDLE', isExcess: false },
  { time: '09:05', actualPower: 42, expectedPower: 43, excessPower: 0, state: 'IDLE', isExcess: false },
  { time: '09:10', actualPower: 43, expectedPower: 43, excessPower: 0, state: 'IDLE', isExcess: false },
  { time: '09:15', actualPower: 52, expectedPower: 43, excessPower: 9, state: 'IDLE', isExcess: true },
  { time: '09:18', actualPower: 88, expectedPower: 43, excessPower: 45, state: 'IDLE', isExcess: true },
  { time: '09:20', actualPower: 92, expectedPower: 43, excessPower: 49, state: 'IDLE', isExcess: true },
  { time: '09:25', actualPower: 91, expectedPower: 43, excessPower: 48, state: 'IDLE', isExcess: true },
  { time: '09:30', actualPower: 90, expectedPower: 43, excessPower: 47, state: 'IDLE', isExcess: true },
  { time: '09:35', actualPower: 93, expectedPower: 43, excessPower: 50, state: 'IDLE', isExcess: true },
  { time: '09:40', actualPower: 92, expectedPower: 43, excessPower: 49, state: 'IDLE', isExcess: true },
  { time: '09:45', actualPower: 89, expectedPower: 43, excessPower: 46, state: 'IDLE', isExcess: true },
  { time: '09:50', actualPower: 91, expectedPower: 43, excessPower: 48, state: 'IDLE', isExcess: true },
  { time: '09:55', actualPower: 92, expectedPower: 43, excessPower: 49, state: 'IDLE', isExcess: true },
  { time: '10:00', actualPower: 88, expectedPower: 43, excessPower: 45, state: 'IDLE', isExcess: true },
  { time: '10:05', actualPower: 70, expectedPower: 43, excessPower: 27, state: 'IDLE (Action Applied)', isExcess: true },
  { time: '10:10', actualPower: 56, expectedPower: 43, excessPower: 13, state: 'SLEEP MODE', isExcess: false },
  { time: '10:15', actualPower: 55, expectedPower: 43, excessPower: 12, state: 'SLEEP MODE', isExcess: false },
  { time: '10:20', actualPower: 44, expectedPower: 43, excessPower: 1, state: 'STANDBY', isExcess: false },
];

export const DESKTOP_PC_EVIDENCE: MultiSignalEvidence[] = [
  { metric: 'Operating State', value: 'IDLE', status: 'Baseline', interpretation: 'User interface inactive for >15 mins' },
  { metric: 'Power Draw', value: '92 W (vs 43 W exp)', status: 'High', interpretation: '+114% excess above idle baseline' },
  { metric: 'Device Temperature', value: '31.4 °C', status: 'Normal', interpretation: 'No heavy GPU/CPU thermal ramp' },
  { metric: 'Vibration Signal', value: '0.08 g', status: 'Low', interpretation: 'Mechanical drives and fans near idle' },
  { metric: 'Network Activity', value: '0.4 Mbps', status: 'Low', interpretation: 'No large file downloads active' },
  { metric: 'Duration of Excess', value: '38 minutes', status: 'Elevated', interpretation: 'Sustained abnormal deviation' },
  { metric: 'Historical Pattern', value: 'Repeated 4 times', status: 'Elevated', interpretation: 'Matches recurring lunch-break anomaly' },
];

export const DESKTOP_PC_CAUSE_ATTRIBUTION: CauseAttribution = {
  probableCause: 'Prolonged idle operation without sleep policy',
  confidencePercent: 87,
  evidencePoints: [
    'Device remained in IDLE state for over 38 minutes continuously',
    'Low user interaction & peripheral activity detected via IoT node',
    'Low vibration (0.08 g) and ambient temperature (31.4 °C) confirm no compute load',
    'Excess power (+49 W) persisted constantly across the idle duration',
    'Similar pattern observed 4 times during past 7 workdays',
  ],
  alternativeCauses: [
    { cause: 'Unoptimized background process / indexing service', probabilityPercent: 9, notes: 'Possible minor thread spin without high CPU thermals' },
    { cause: 'Connected external high-draw USB peripheral', probabilityPercent: 3, notes: 'Vibration remains baseline, no active peripheral telemetry' },
    { cause: 'Measurement calibration drift', probabilityPercent: 1, notes: 'ESP32 shunt resistor validated within ±0.5%' },
  ],
};

export const DAILY_SAVINGS_DATA = [
  { day: 'Mon', measuredSavedKWh: 1.15, excessIdentifiedKWh: 2.40 },
  { day: 'Tue', measuredSavedKWh: 1.30, excessIdentifiedKWh: 2.65 },
  { day: 'Wed', measuredSavedKWh: 1.55, excessIdentifiedKWh: 2.90 },
  { day: 'Thu', measuredSavedKWh: 1.20, excessIdentifiedKWh: 2.35 },
  { day: 'Fri', measuredSavedKWh: 1.62, excessIdentifiedKWh: 3.10 },
  { day: 'Sat', measuredSavedKWh: 0.85, excessIdentifiedKWh: 1.45 },
  { day: 'Sun', measuredSavedKWh: 0.92, excessIdentifiedKWh: 1.30 },
];

export const RESEARCH_PIPELINE_STEPS = [
  { step: 1, title: 'Context & Workload', desc: 'Ingest voltage, current, power, vibration, temperature & CPU load.', badge: 'Telemetry / Context' },
  { step: 2, title: 'Operating State Identification', desc: 'State classifier distinguishes IDLE, STANDBY, LOW_LOAD, HIGH_LOAD.', badge: 'State Engine' },
  { step: 3, title: 'State-Conditioned Expected Energy', desc: 'Baseline regression model predicts expected power P_expected(state, context).', badge: 'Model Baseline' },
  { step: 4, title: 'Actual vs Expected Energy', desc: 'Delta computation: Excess Power = max(0, Actual - Expected).', badge: 'Delta Engine' },
  { step: 5, title: 'Excess Energy in Wh', desc: 'Integrates excess power over time: Wh = Power_W * dt_seconds / 3600.', badge: 'Physical Units' },
  { step: 6, title: 'Cause-Level Energy Ledger', desc: 'Attributes excess Wh to physical causes (Prolonged Idle, Standby, etc.).', badge: 'Contribution 1' },
  { step: 7, title: 'Recommendation & Intervention', desc: 'Evidence-based intervention with expected benefit and risk assessment.', badge: 'Intervention' },
  { step: 8, title: 'Observed Post Workload (W_post)', desc: 'Monitors actual telemetry and workload conditions post-action.', badge: 'Telemetry Window' },
  { step: 9, title: 'Pre-Policy Counterfactual E(π0|W_post)', desc: 'Simulates what old policy would consume under the exact same observed workload.', badge: 'Contribution 2' },
  { step: 10, title: 'Verified Saving & Recommendation Effectiveness', desc: 'E_saved = E_cf - E_post compared with independent ground truth.', badge: 'Verified Impact' },
];

// ============================================================
// HELPER FUNCTIONS & CALCULATIONS
// ============================================================

/**
 * Calculates excess power and physical energy in Watt-hours
 * Wh = Power_W * dt_seconds / 3600
 */
export function calculateExcessEnergyWh(actualPowerW: number, expectedPowerW: number, durationSeconds: number): {
  excessPowerW: number;
  excessEnergyWh: number;
} {
  const excessPowerW = Math.max(0, actualPowerW - expectedPowerW);
  const excessEnergyWh = Math.round(((excessPowerW * durationSeconds) / 3600) * 100) / 100;
  return { excessPowerW, excessEnergyWh };
}

/**
 * Workload-Conditioned Counterfactual Energy Saving Calculation:
 * E_saved = E(π0 | W_post) - E(π1 | W_post)
 */
export function calculateCounterfactualSaving(counterfactualOldEnergyWh: number, actualPostEnergyWh: number): number {
  return Math.max(0, Math.round((counterfactualOldEnergyWh - actualPostEnergyWh) * 100) / 100);
}

/**
 * Evaluates recommendation effectiveness strictly based on measured evidence
 */
export function evaluateEffectiveness(
  estimatedSavingWh: number,
  verifiedSavingWh: number
): 'VERIFIED EFFECTIVE' | 'PARTIALLY VERIFIED' | 'LOW / NOT VERIFIED' {
  if (verifiedSavingWh >= estimatedSavingWh * 0.8) return 'VERIFIED EFFECTIVE';
  if (verifiedSavingWh >= estimatedSavingWh * 0.4) return 'PARTIALLY VERIFIED';
  return 'LOW / NOT VERIFIED';
}
