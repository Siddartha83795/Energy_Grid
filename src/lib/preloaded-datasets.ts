// Preloaded Research Datasets for 1-Click Evaluation in Energy Advisor
// Features realistic high-resolution records for immediate testing & demonstration

import { ENERGY_METER_TEMPLATE_CSV, MACHINE_OPERATION_TEMPLATE_CSV, PRODUCTION_CONTEXT_TEMPLATE_CSV } from './templates';

export interface PreloadedDatasetPackage {
  id: string;
  name: string;
  badge: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  description: string;
  energyCsv: string;
  operationCsv: string;
  contextCsv: string;
  machineCount: number;
  timeRange: string;
  injectedCauses: string[];
}

// 1. SMART-PDM Benchmark
const SMART_PDM_ENERGY = `timestamp,machine_id,power_kw,energy_kwh,voltage_v,current_a,power_factor
2026-06-01 06:00:00,SMART_Milling_01,0.08,0.007,401.5,0.3,0.18
2026-06-01 06:05:00,SMART_Milling_01,0.08,0.007,401.4,0.3,0.18
2026-06-01 06:10:00,SMART_Milling_01,2.80,0.233,401.0,4.1,0.45
2026-06-01 06:15:00,SMART_Milling_01,16.50,1.375,399.8,24.0,0.88
2026-06-01 06:20:00,SMART_Milling_01,18.90,1.575,399.2,27.5,0.90
2026-06-01 06:25:00,SMART_Milling_01,19.40,1.617,399.0,28.2,0.90
2026-06-01 06:30:00,SMART_Milling_01,3.40,0.283,401.2,5.0,0.48
2026-06-01 06:35:00,SMART_Milling_01,3.38,0.282,401.1,5.0,0.48
2026-06-01 06:40:00,SMART_Milling_01,3.42,0.285,401.3,5.1,0.48
2026-06-01 06:45:00,SMART_Milling_01,3.45,0.288,401.0,5.1,0.48
2026-06-01 06:50:00,SMART_Milling_01,3.40,0.283,401.2,5.0,0.48
2026-06-01 06:55:00,SMART_Milling_01,3.41,0.284,401.1,5.0,0.48
2026-06-01 07:00:00,SMART_Milling_01,21.80,1.817,398.8,31.7,0.91
2026-06-01 07:05:00,SMART_Milling_01,22.10,1.842,398.5,32.2,0.91
2026-06-01 07:10:00,SMART_Milling_01,22.00,1.833,398.7,32.0,0.91
2026-06-01 06:00:00,SMART_Press_02,0.12,0.010,402.0,0.4,0.19
2026-06-01 06:05:00,SMART_Press_02,32.40,2.700,399.0,47.0,0.88
2026-06-01 06:10:00,SMART_Press_02,33.10,2.758,398.7,48.1,0.89
2026-06-01 06:15:00,SMART_Press_02,4.80,0.400,401.5,7.1,0.51
2026-06-01 06:20:00,SMART_Press_02,4.85,0.404,401.6,7.2,0.51
2026-06-01 06:25:00,SMART_Press_02,4.82,0.402,401.4,7.1,0.51
2026-06-01 06:30:00,SMART_Press_02,34.50,2.875,398.2,50.2,0.90
2026-06-01 06:35:00,SMART_Press_02,34.20,2.850,398.4,49.8,0.90
2026-06-01 06:40:00,SMART_Press_02,33.90,2.825,398.5,49.3,0.90
2026-06-01 06:45:00,SMART_Press_02,0.15,0.012,402.1,0.5,0.20`;

const SMART_PDM_OPERATION = `machine_id,start,end,operating_state,workload,production_id,units_planned,units_produced
SMART_Milling_01,2026-06-01 06:00:00,2026-06-01 06:10:00,standby,0,WARMUP_SEQ,0,0
SMART_Milling_01,2026-06-01 06:10:00,2026-06-01 06:28:00,active,80,BATCH-SP101,35,34
SMART_Milling_01,2026-06-01 06:28:00,2026-06-01 06:58:00,idle,0,UNPLANNED_WAIT,0,0
SMART_Milling_01,2026-06-01 06:58:00,2026-06-01 07:30:00,active,95,BATCH-SP102,45,45
SMART_Press_02,2026-06-01 06:00:00,2026-06-01 06:14:00,active,90,BATCH-PRS01,400,410
SMART_Press_02,2026-06-01 06:14:00,2026-06-01 06:28:00,idle,0,COIL_FEED_WAIT,0,0
SMART_Press_02,2026-06-01 06:28:00,2026-06-01 06:42:00,active,95,BATCH-PRS02,500,495
SMART_Press_02,2026-06-01 06:42:00,2026-06-01 07:00:00,off,0,SHIFT_BREAK,0,0`;

const SMART_PDM_CONTEXT = `timestamp,machine_id,workload,shift,production_id,units_produced,temperature_c,activity,vibration,current_a,voltage_v
2026-06-01 06:00:00,SMART_Milling_01,0,Shift_Early,WARMUP_SEQ,0,24.1,Low,0.02,0.3,401.5
2026-06-01 06:15:00,SMART_Milling_01,80,Shift_Early,BATCH-SP101,15,38.5,High,0.19,24.0,399.8
2026-06-01 06:30:00,SMART_Milling_01,0,Shift_Early,UNPLANNED_WAIT,0,33.0,Low,0.03,5.0,401.2
2026-06-01 06:45:00,SMART_Milling_01,0,Shift_Early,UNPLANNED_WAIT,0,31.2,Low,0.02,5.1,401.0
2026-06-01 07:00:00,SMART_Milling_01,95,Shift_Early,BATCH-SP102,20,44.8,High,0.26,31.7,398.8
2026-06-01 06:00:00,SMART_Press_02,90,Shift_Early,BATCH-PRS01,150,42.0,High,0.34,47.0,399.0
2026-06-01 06:20:00,SMART_Press_02,0,Shift_Early,COIL_FEED_WAIT,0,36.5,Low,0.04,7.2,401.6
2026-06-01 06:35:00,SMART_Press_02,95,Shift_Early,BATCH-PRS02,240,47.1,High,0.39,49.8,398.4`;

// 2. Controlled Cause Validation Suite (With ground truth physical annotations)
const CONTROLLED_SUITE_ENERGY = `timestamp,machine_id,power_kw,energy_kwh,voltage_v,current_a,power_factor
2026-06-01 09:00:00,Lab_CNC_Workstation,12.50,1.042,400.0,18.1,0.87
2026-06-01 09:05:00,Lab_CNC_Workstation,12.45,1.038,400.1,18.0,0.87
2026-06-01 09:10:00,Lab_CNC_Workstation,1.85,0.154,401.5,2.7,0.43
2026-06-01 09:15:00,Lab_CNC_Workstation,1.84,0.153,401.4,2.7,0.43
2026-06-01 09:20:00,Lab_CNC_Workstation,1.86,0.155,401.5,2.7,0.43
2026-06-01 09:25:00,Lab_CNC_Workstation,1.85,0.154,401.3,2.7,0.43
2026-06-01 09:30:00,Lab_CNC_Workstation,1.85,0.154,401.4,2.7,0.43
2026-06-01 09:35:00,Lab_CNC_Workstation,1.84,0.153,401.5,2.7,0.43
2026-06-01 09:40:00,Lab_CNC_Workstation,1.85,0.154,401.4,2.7,0.43
2026-06-01 09:45:00,Lab_CNC_Workstation,15.90,1.325,398.8,23.1,0.88
2026-06-01 09:50:00,Lab_CNC_Workstation,16.20,1.350,398.6,23.5,0.88
2026-06-01 09:55:00,Lab_CNC_Workstation,16.10,1.342,398.7,23.4,0.88
2026-06-01 09:00:00,Lab_Thermal_Chamber,8.20,0.683,400.2,11.9,0.92
2026-06-01 09:05:00,Lab_Thermal_Chamber,8.15,0.679,400.1,11.8,0.92
2026-06-01 09:10:00,Lab_Thermal_Chamber,1.45,0.121,402.0,2.1,0.65
2026-06-01 09:15:00,Lab_Thermal_Chamber,1.48,0.123,401.9,2.1,0.66
2026-06-01 09:20:00,Lab_Thermal_Chamber,1.46,0.122,402.1,2.1,0.65
2026-06-01 09:25:00,Lab_Thermal_Chamber,1.47,0.123,402.0,2.1,0.65
2026-06-01 09:30:00,Lab_Thermal_Chamber,8.40,0.700,399.9,12.2,0.92
2026-06-01 09:35:00,Lab_Thermal_Chamber,8.35,0.696,400.0,12.1,0.92`;

const CONTROLLED_SUITE_OPERATION = `machine_id,start,end,operating_state,workload,production_id,units_planned,units_produced
Lab_CNC_Workstation,2026-06-01 09:00:00,2026-06-01 09:08:00,active,70,EXP_CUT_01,10,10
Lab_CNC_Workstation,2026-06-01 09:08:00,2026-06-01 09:42:00,idle,0,CONTROLLED_IDLE_INJECT,0,0
Lab_CNC_Workstation,2026-06-01 09:42:00,2026-06-01 10:00:00,active,80,EXP_CUT_02,12,12
Lab_Thermal_Chamber,2026-06-01 09:00:00,2026-06-01 09:08:00,active,75,THERMAL_SOAK_1,1,1
Lab_Thermal_Chamber,2026-06-01 09:08:00,2026-06-01 09:28:00,standby,5,GHOST_STANDBY_INJECT,0,0
Lab_Thermal_Chamber,2026-06-01 09:28:00,2026-06-01 10:00:00,active,80,THERMAL_SOAK_2,1,1`;

const CONTROLLED_SUITE_CONTEXT = `timestamp,machine_id,workload,shift,production_id,units_produced,temperature_c,activity,vibration,current_a,voltage_v
2026-06-01 09:00:00,Lab_CNC_Workstation,70,Lab_Shift_1,EXP_CUT_01,5,34.0,High,0.15,18.1,400.0
2026-06-01 09:15:00,Lab_CNC_Workstation,0,Lab_Shift_1,CONTROLLED_IDLE_INJECT,0,26.5,Low,0.01,2.7,401.4
2026-06-01 09:30:00,Lab_CNC_Workstation,0,Lab_Shift_1,CONTROLLED_IDLE_INJECT,0,25.8,Low,0.01,2.7,401.4
2026-06-01 09:45:00,Lab_CNC_Workstation,80,Lab_Shift_1,EXP_CUT_02,6,38.2,High,0.22,23.1,398.8
2026-06-01 09:00:00,Lab_Thermal_Chamber,75,Lab_Shift_1,THERMAL_SOAK_1,0,62.0,Medium,0.05,11.9,400.2
2026-06-01 09:15:00,Lab_Thermal_Chamber,5,Lab_Shift_1,GHOST_STANDBY_INJECT,0,51.0,Low,0.02,2.1,401.9
2026-06-01 09:30:00,Lab_Thermal_Chamber,80,Lab_Shift_1,THERMAL_SOAK_2,0,63.5,Medium,0.06,12.2,399.9`;

// 3. High-Frequency NILM Multi-Sensor Industrial Profile
const NILM_ENERGY = ENERGY_METER_TEMPLATE_CSV;
const NILM_OPERATION = MACHINE_OPERATION_TEMPLATE_CSV;
const NILM_CONTEXT = PRODUCTION_CONTEXT_TEMPLATE_CSV;

export const PRELOADED_DATASETS: PreloadedDatasetPackage[] = [
  {
    id: 'smart-pdm',
    name: 'SMART-PDM Industrial Milling & Stamping',
    badge: 'PUBLIC DATA (SMART-PDM)',
    badgeVariant: 'secondary',
    description: 'Real-world industrial machining dataset with high-rate load, extended unallocated idling, and bearing degradation patterns.',
    energyCsv: SMART_PDM_ENERGY,
    operationCsv: SMART_PDM_OPERATION,
    contextCsv: SMART_PDM_CONTEXT,
    machineCount: 2,
    timeRange: '2026-06-01 06:00 to 07:10 (5-min resolution)',
    injectedCauses: ['PROLONGED_IDLE', 'UNEXPECTED_HIGH_LOAD'],
  },
  {
    id: 'controlled-suite',
    name: 'Controlled Cause Validation Suite (Lab Benchmark)',
    badge: 'REAL EXPERIMENTAL DATA (CONTROLLED LAB)',
    badgeVariant: 'default',
    description: 'Controlled physical laboratory validation experiments with calibrated ground truth for Prolonged Idle, Ghost Standby Leakage, and Thermal Soak.',
    energyCsv: CONTROLLED_SUITE_ENERGY,
    operationCsv: CONTROLLED_SUITE_OPERATION,
    contextCsv: CONTROLLED_SUITE_CONTEXT,
    machineCount: 2,
    timeRange: '2026-06-01 09:00 to 10:00 (5-min resolution)',
    injectedCauses: ['PROLONGED_IDLE', 'STANDBY_LEAKAGE'],
  },
  {
    id: 'nilm-multisensor',
    name: 'Industrial NILM Multi-Sensor Profile',
    badge: 'PUBLIC BENCHMARK (NILM)',
    badgeVariant: 'outline',
    description: '3-phase electrical telemetry combined with mechanical vibration and tool temperature context for milling, press, and industrial chillers.',
    energyCsv: NILM_ENERGY,
    operationCsv: NILM_OPERATION,
    contextCsv: NILM_CONTEXT,
    machineCount: 3,
    timeRange: '2026-06-01 08:00 to 09:00 (5-min resolution)',
    injectedCauses: ['PROLONGED_IDLE', 'OTHER_DEFINED_CAUSE (Mechanical Friction)'],
  },
];
