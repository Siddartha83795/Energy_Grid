// Standard CSV Templates and Generators for Energy Advisor
// A Device-Level Context-Aware Energy Waste Diagnosis and Workload-Conditioned Intervention Evaluation System

export const ENERGY_METER_TEMPLATE_CSV = `timestamp,machine_id,power_kw,energy_kwh,voltage_v,current_a,power_factor
2026-06-01 08:00:00,CNC_Milling_01,14.85,1.237,400.2,21.5,0.88
2026-06-01 08:05:00,CNC_Milling_01,18.42,1.535,399.8,26.8,0.89
2026-06-01 08:10:00,CNC_Milling_01,17.90,1.491,400.1,26.0,0.89
2026-06-01 08:15:00,CNC_Milling_01,18.15,1.512,400.0,26.3,0.89
2026-06-01 08:20:00,CNC_Milling_01,18.05,1.504,400.3,26.2,0.89
2026-06-01 08:25:00,CNC_Milling_01,14.20,1.183,400.1,20.6,0.87
2026-06-01 08:30:00,CNC_Milling_01,3.45,0.287,401.2,5.1,0.48
2026-06-01 08:35:00,CNC_Milling_01,3.42,0.285,401.0,5.0,0.48
2026-06-01 08:40:00,CNC_Milling_01,3.48,0.290,401.1,5.1,0.49
2026-06-01 08:45:00,CNC_Milling_01,3.44,0.286,400.9,5.0,0.48
2026-06-01 08:50:00,CNC_Milling_01,19.20,1.600,399.5,27.9,0.90
2026-06-01 08:55:00,CNC_Milling_01,19.45,1.620,399.4,28.3,0.90
2026-06-01 08:00:00,Stamping_Press_02,28.50,2.375,400.0,41.2,0.85
2026-06-01 08:05:00,Stamping_Press_02,31.20,2.600,399.6,45.2,0.87
2026-06-01 08:10:00,Stamping_Press_02,29.80,2.483,400.1,43.1,0.86
2026-06-01 08:15:00,Stamping_Press_02,30.40,2.533,399.9,44.0,0.86
2026-06-01 08:20:00,Stamping_Press_02,4.85,0.404,401.5,7.1,0.52
2026-06-01 08:25:00,Stamping_Press_02,4.90,0.408,401.6,7.2,0.51
2026-06-01 08:30:00,Stamping_Press_02,4.88,0.406,401.4,7.2,0.52
2026-06-01 08:35:00,Stamping_Press_02,32.10,2.675,399.5,46.5,0.88
2026-06-01 08:00:00,Industrial_Chiller_03,22.40,1.866,400.0,32.5,0.91
2026-06-01 08:05:00,Industrial_Chiller_03,22.10,1.841,400.2,32.0,0.91
2026-06-01 08:10:00,Industrial_Chiller_03,16.50,1.375,400.4,23.9,0.89
2026-06-01 08:15:00,Industrial_Chiller_03,16.20,1.350,400.5,23.5,0.89
2026-06-01 08:20:00,Industrial_Chiller_03,22.80,1.900,399.8,33.0,0.91`;

export const MACHINE_OPERATION_TEMPLATE_CSV = `machine_id,start,end,operating_state,workload,production_id,units_planned,units_produced
CNC_Milling_01,2026-06-01 08:00:00,2026-06-01 08:28:00,active,80,BATCH-M401,30,28
CNC_Milling_01,2026-06-01 08:28:00,2026-06-01 08:48:00,idle,0,UNPLANNED_WAIT,0,0
CNC_Milling_01,2026-06-01 08:48:00,2026-06-01 09:30:00,active,85,BATCH-M402,40,40
Stamping_Press_02,2026-06-01 08:00:00,2026-06-01 08:18:00,active,90,BATCH-SP12,500,510
Stamping_Press_02,2026-06-01 08:18:00,2026-06-01 08:34:00,idle,0,COIL_RELOAD,0,0
Stamping_Press_02,2026-06-01 08:34:00,2026-06-01 09:30:00,active,95,BATCH-SP13,600,590
Industrial_Chiller_03,2026-06-01 08:00:00,2026-06-01 16:00:00,active,75,CONTINUOUS_LOOP,1,1`;

export const PRODUCTION_CONTEXT_TEMPLATE_CSV = `timestamp,machine_id,workload,shift,production_id,units_produced,temperature_c,activity,vibration,current_a,voltage_v
2026-06-01 08:00:00,CNC_Milling_01,80,Shift_A,BATCH-M401,5,38.2,High,0.18,21.5,400.2
2026-06-01 08:10:00,CNC_Milling_01,80,Shift_A,BATCH-M401,10,41.0,High,0.22,26.0,400.1
2026-06-01 08:20:00,CNC_Milling_01,80,Shift_A,BATCH-M401,10,42.5,High,0.21,26.2,400.3
2026-06-01 08:30:00,CNC_Milling_01,0,Shift_A,UNPLANNED_WAIT,0,34.0,Low,0.03,5.1,401.2
2026-06-01 08:40:00,CNC_Milling_01,0,Shift_A,UNPLANNED_WAIT,0,32.5,Low,0.02,5.1,401.1
2026-06-01 08:50:00,CNC_Milling_01,85,Shift_A,BATCH-M402,8,40.8,High,0.24,27.9,399.5
2026-06-01 08:00:00,Stamping_Press_02,90,Shift_A,BATCH-SP12,120,44.2,High,0.35,41.2,400.0
2026-06-01 08:10:00,Stamping_Press_02,90,Shift_A,BATCH-SP12,140,46.0,High,0.38,43.1,400.1
2026-06-01 08:20:00,Stamping_Press_02,0,Shift_A,COIL_RELOAD,0,37.1,Low,0.04,7.1,401.5
2026-06-01 08:30:00,Stamping_Press_02,0,Shift_A,COIL_RELOAD,0,36.5,Low,0.03,7.2,401.4
2026-06-01 08:00:00,Industrial_Chiller_03,75,Shift_A,CONTINUOUS_LOOP,0,18.4,Medium,0.12,32.5,400.0
2026-06-01 08:10:00,Industrial_Chiller_03,75,Shift_A,CONTINUOUS_LOOP,0,18.1,Medium,0.11,23.9,400.4
2026-06-01 08:20:00,Industrial_Chiller_03,75,Shift_A,CONTINUOUS_LOOP,0,18.8,Medium,0.14,33.0,399.8`;

/**
 * Downloads a string as a CSV file in the browser
 */
export function downloadCsvFile(filename: string, content: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
