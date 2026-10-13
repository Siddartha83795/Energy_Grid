import { describe, it, expect } from "vitest";
import {
  generateMachineTelemetry,
  computeDigitalTwinState,
  generateAIForecast,
  detectAnomaliesAcrossFleet,
  generateOptimizationRecommendations,
  runWhatIfDigitalTwinSimulation,
  getResearchMetrics,
  getFactoryCommandOverview,
  MACHINES,
} from "../src/lib/digital-twin.engine";

describe("Industrial Digital Twin Engine", () => {
  it("generates realistic physical telemetry for Machine A, B, C", () => {
    const readA = generateMachineTelemetry("Machine A", "Running", 85);
    expect(readA.machine_id).toBe("Machine A");
    expect(readA.voltage_v).toBeGreaterThan(380);
    expect(readA.voltage_v).toBeLessThan(440);
    expect(readA.power_kw).toBeGreaterThan(0);
    expect(readA.temperature_c).toBeGreaterThan(20);
    expect(readA.vibration_db).toBeGreaterThan(0);
    expect(readA.production_units_per_min).toBeGreaterThan(0);

    // Physics correlation check: Idle machine should have zero production
    const readIdle = generateMachineTelemetry("Machine B", "Idle", 20);
    expect(readIdle.production_units_per_min).toBe(0);
    expect(readIdle.power_kw).toBeLessThan(MACHINES["Machine B"].ratedPowerKw * 0.3);
  });

  it("calculates digital twin state with health & efficiency scores", () => {
    const twinState = computeDigitalTwinState("Machine A");
    expect(twinState.machine_id).toBe("Machine A");
    expect(twinState.health_score).toBeGreaterThanOrEqual(0);
    expect(twinState.health_score).toBeLessThanOrEqual(100);
    expect(twinState.energy_efficiency_score).toBeGreaterThanOrEqual(0);
    expect(twinState.energy_efficiency_score).toBeLessThanOrEqual(100);
  });

  it("generates 24-48h AI energy forecast curves with confidence metrics", () => {
    const forecast = generateAIForecast();
    expect(forecast.short_term_forecast.length).toBeGreaterThan(0);
    expect(forecast.forecast_confidence_pct).toBeGreaterThan(80);
    expect(forecast.mape_pct).toBeLessThan(10);
  });

  it("detects multi-modal anomalies during voltage or vibration surges", () => {
    // Inject vibration surge anomaly on Machine C
    const readSurge = generateMachineTelemetry("Machine C", "Running", 90, "vibration_spike");
    expect(readSurge.vibration_db).toBeGreaterThan(45);

    const anomalies = detectAnomaliesAcrossFleet();
    expect(Array.isArray(anomalies)).toBe(true);
  });

  it("evaluates constraint-aware optimization recommendations", () => {
    const recs = generateOptimizationRecommendations();
    expect(recs.length).toBeGreaterThan(0);
    const hasSaving = recs.some((r) => r.category === "Energy Saving");
    expect(hasSaving).toBe(true);
  });

  it("simulates what-if digital twin scenarios accurately", () => {
    const scenarioResult = runWhatIfDigitalTwinSimulation({
      machine_id: "Machine A",
      load_change_pct: -15,
      schedule_hours_shift: -2,
      production_target_change_pct: -5,
    });

    expect(scenarioResult.machine_id).toBe("Machine A");
    expect(scenarioResult.savings.pct_energy_saved).toBeGreaterThan(0);
    expect(scenarioResult.savings.cost_saved_daily_inr).toBeGreaterThan(0);
    expect(scenarioResult.simulated.daily_kwh).toBeLessThan(scenarioResult.baseline.daily_kwh);
  });

  it("returns research-grade metrics comparing static baseline vs multi-modal AI", () => {
    const research = getResearchMetrics();
    expect(research.anomaly_detection_comparison.ai_multimodal_fusion.precision).toBeGreaterThan(
      research.anomaly_detection_comparison.static_threshold.precision,
    );
    expect(
      research.anomaly_detection_comparison.ai_multimodal_fusion.false_positive_rate_pct,
    ).toBeLessThan(research.anomaly_detection_comparison.static_threshold.false_positive_rate_pct);
  });

  it("returns global factory command overview stats", () => {
    const overview = getFactoryCommandOverview();
    expect(overview.total_machines).toBe(3);
    expect(overview.fleet_health_score).toBeGreaterThan(50);
  });
});
