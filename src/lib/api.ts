import Papa from "papaparse";
import { processAnalysisRun, fetchDashboardData } from "./energy.functions";

const BASE = "";

export type Recommendation = {
  rank: number;
  machine_name: string;
  issue: string;
  action: string;
  estimated_monthly_savings_kwh: number;
  estimated_monthly_savings_inr: number;
  priority: "high" | "medium" | "low";
  implementation_effort: "easy" | "moderate" | "complex";
};

export type MachineRow = {
  machine_name: string;
  total_kwh: number;
  idle_kwh: number;
  active_kwh: number;
  utilization_pct: number;
  idle_cost_inr: number;
};

export type HourlyPoint = { hour: string; kwh: number };

export type DashboardData = {
  summary: {
    total_kwh: number;
    idle_kwh: number;
    idle_cost_inr: number;
    machines_analyzed: number;
  };
  machines: MachineRow[];
  hourly: HourlyPoint[];
  genai: {
    summary_narrative: string;
    total_potential_savings_kwh: number;
    recommendations: Recommendation[];
    quick_wins: string[];
  };
};

function parseCsv(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    });
  });
}

export async function uploadFiles(files: { energy: File; shifts: File; schedules: File }) {
  try {
    const energyData = await parseCsv(files.energy);
    const shiftData = await parseCsv(files.shifts);
    const scheduleData = await parseCsv(files.schedules);

    // Call the server function to calculate and store the analysis run
    const result = await processAnalysisRun({
      data: {
        energyData,
        shiftData,
        scheduleData,
      },
    });
    return result as { run_id: string };
  } catch (err) {
    console.error("Error parsing or uploading CSV files:", err);
    throw new Error(err instanceof Error ? err.message : "Failed to process files");
  }
}

export async function analyze(run_id: string) {
  // Analysis is already run during the upload process in processAnalysisRun, so this is a no-op
  return { success: true };
}

export async function getDashboard(run_id: string): Promise<DashboardData> {
  const data = await fetchDashboardData({ data: { runId: run_id } });
  return data as DashboardData;
}

export function reportUrl(run_id: string, token?: string) {
  // We return a relative client route so we can render the report dynamically
  return `/report?run_id=${run_id}`;
}

export const RUN_ID_KEY = "energy_advisor_run_id";
export function getRunId() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(RUN_ID_KEY);
}
export function setRunId(id: string) {
  localStorage.setItem(RUN_ID_KEY, id);
}
export function clearRunId() {
  localStorage.removeItem(RUN_ID_KEY);
}
