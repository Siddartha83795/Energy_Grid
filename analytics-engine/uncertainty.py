"""
Uncertainty Propagation and Confidence Interval Module
For IEEE Paper: "Energy Advisor: A Device-Level Framework for Context-Aware Excess-Energy Diagnosis..."
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple

# Standard hardware measurement uncertainties (calibrated power meter / CT clamp)
HARDWARE_VOLTAGE_REL_UNCERTAINTY = 0.005  # ±0.5%
HARDWARE_CURRENT_REL_UNCERTAINTY = 0.010  # ±1.0%

def compute_measurement_uncertainty(power_w: float) -> float:
    """
    Computes absolute 1-sigma uncertainty for power measurement based on hardware specs.
    sigma_P = sqrt((sigma_V / V)^2 + (sigma_I / I)^2) * P
    """
    rel_unc = math.sqrt(HARDWARE_VOLTAGE_REL_UNCERTAINTY**2 + HARDWARE_CURRENT_REL_UNCERTAINTY**2)
    return float(power_w * rel_unc)

def compute_confidence_interval(
    mean_val: float,
    std_val: float,
    sample_size: int = 30,
    confidence_level: float = 0.95
) -> Dict[str, float]:
    """
    Computes standard normal / Student-t confidence interval bounds.
    Defaults to 95% CI (z ≈ 1.96 for n >= 30).
    """
    if sample_size < 2:
        return {
            "mean": round(float(mean_val), 2),
            "lower_bound": round(float(mean_val - std_val), 2),
            "upper_bound": round(float(mean_val + std_val), 2),
            "margin_of_error": round(float(std_val), 2),
            "std_error": round(float(std_val), 2),
        }
    
    # 95% critical value
    z_crit = 1.96 if sample_size >= 30 else 2.045
    std_err = std_val / math.sqrt(sample_size)
    margin = z_crit * std_err

    return {
        "mean": round(float(mean_val), 2),
        "lower_bound": round(float(mean_val - margin), 2),
        "upper_bound": round(float(mean_val + margin), 2),
        "margin_of_error": round(float(margin), 2),
        "std_error": round(float(std_err), 2),
    }

def propagate_excess_uncertainty(
    measured_power_w: float,
    expected_power_w: float,
    expected_power_std_w: float,
    sample_size: int = 60
) -> Dict[str, Any]:
    """
    Propagates uncertainty to excess energy estimate:
    Excess = Measured - Expected
    sigma_Excess = sqrt(sigma_meas^2 + sigma_model^2)
    """
    meas_unc = compute_measurement_uncertainty(measured_power_w)
    model_std_err = expected_power_std_w / math.sqrt(max(sample_size, 1))
    
    total_sigma = math.sqrt(meas_unc**2 + model_std_err**2)
    excess_val = max(0.0, measured_power_w - expected_power_w)
    z_crit = 1.96
    margin = z_crit * total_sigma

    return {
        "excess_power_w": round(float(excess_val), 2),
        "lower_bound_w": round(float(max(0.0, excess_val - margin)), 2),
        "upper_bound_w": round(float(excess_val + margin), 2),
        "margin_w": round(float(margin), 2),
        "relative_error_pct": round(float((margin / excess_val * 100) if excess_val > 0 else 0.0), 1),
        "measurement_unc_w": round(float(meas_unc), 3),
        "model_unc_w": round(float(model_std_err), 3)
    }
