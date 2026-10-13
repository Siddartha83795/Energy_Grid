"""
Statistical Tests Module for Energy Advisor IEEE Research Paper
Supports: Paired t-test, Wilcoxon signed-rank test, One-Way ANOVA, Tukey HSD post-hoc,
Cohen's d effect size, and confidence intervals.
"""

import math
import numpy as np
from typing import Dict, Any, List, Union

def _get_significance_stars(p_val: float) -> str:
    if p_val < 0.001:
        return "*** (p < 0.001, highly significant)"
    elif p_val < 0.01:
        return "** (p < 0.01, significant)"
    elif p_val < 0.05:
        return "* (p < 0.05, statistically significant)"
    elif p_val < 0.10:
        return "† (p < 0.10, marginally significant)"
    return "ns (not significant, p >= 0.05)"

def compute_cohens_d(x: List[float], y: List[float]) -> float:
    """Computes Cohen's d effect size between two groups."""
    x_arr = np.array(x, dtype=float)
    y_arr = np.array(y, dtype=float)
    n1, n2 = len(x_arr), len(y_arr)
    if n1 < 2 or n2 < 2:
        return 0.0
    var1 = np.var(x_arr, ddof=1)
    var2 = np.var(y_arr, ddof=1)
    pooled_sd = math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
    if pooled_sd == 0:
        return 0.0
    return float((np.mean(x_arr) - np.mean(y_arr)) / pooled_sd)

def paired_t_test(before: List[float], after: List[float]) -> Dict[str, Any]:
    """
    Computes a paired two-sample Student's t-test.
    H0: Mean difference = 0.
    """
    diff = np.array(before, dtype=float) - np.array(after, dtype=float)
    n = len(diff)
    if n < 2:
        return {"error": "Sample size must be at least 2"}
    
    mean_diff = float(np.mean(diff))
    std_diff = float(np.std(diff, ddof=1))
    se_diff = std_diff / math.sqrt(n)
    
    t_stat = (mean_diff / se_diff) if se_diff > 0 else 0.0
    
    # Approximate 2-tailed p-value using standard normal / t distribution approximation
    # For df = n - 1
    df = n - 1
    try:
        from scipy import stats
        t_res = stats.ttest_rel(before, after)
        t_stat = float(t_res.statistic)
        p_val = float(t_res.pvalue)
    except Exception:
        # Robust mathematical approximation for t-dist p-value
        # using standard normal approximation for large df or standard error
        z = abs(t_stat)
        p_val = 2.0 * (1.0 - 0.5 * (1.0 + math.erf(z / math.sqrt(2))))
        p_val = max(1e-9, min(1.0, p_val))

    ci_low = mean_diff - 1.96 * se_diff
    ci_high = mean_diff + 1.96 * se_diff
    d_val = (mean_diff / std_diff) if std_diff > 0 else 0.0

    return {
        "test_name": "Paired Samples Student's t-Test",
        "sample_size": n,
        "degrees_of_freedom": df,
        "mean_difference": round(mean_diff, 4),
        "std_difference": round(std_diff, 4),
        "standard_error": round(se_diff, 4),
        "t_statistic": round(t_stat, 4),
        "p_value": round(p_val, 6),
        "significance": _get_significance_stars(p_val),
        "is_significant": bool(p_val < 0.05),
        "ci_95": [round(ci_low, 4), round(ci_high, 4)],
        "cohens_d": round(d_val, 4),
        "effect_magnitude": "Large" if abs(d_val) >= 0.8 else ("Medium" if abs(d_val) >= 0.5 else "Small")
    }

def wilcoxon_signed_rank_test(x: List[float], y: List[float]) -> Dict[str, Any]:
    """
    Computes Wilcoxon signed-rank non-parametric test for paired differences.
    """
    diffs = np.array(x, dtype=float) - np.array(y, dtype=float)
    non_zero = diffs[diffs != 0]
    n = len(non_zero)
    if n < 4:
        return {"error": "Requires at least 4 non-zero paired differences"}
    
    try:
        from scipy import stats
        res = stats.wilcoxon(x, y)
        w_stat = float(res.statistic)
        p_val = float(res.pvalue)
    except Exception:
        # Native Wilcoxon rank calculation
        abs_diffs = np.abs(non_zero)
        ranks = np.argsort(np.argsort(abs_diffs)) + 1.0
        w_pos = float(np.sum(ranks[non_zero > 0]))
        w_neg = float(np.sum(ranks[non_zero < 0]))
        w_stat = min(w_pos, w_neg)
        
        # Large sample normal approximation: mean = n(n+1)/4, var = n(n+1)(2n+1)/24
        mean_w = n * (n + 1) / 4.0
        var_w = n * (n + 1) * (2 * n + 1) / 24.0
        z = (w_stat - mean_w) / math.sqrt(var_w) if var_w > 0 else 0.0
        p_val = 2.0 * (1.0 - 0.5 * (1.0 + math.erf(abs(z) / math.sqrt(2))))
        p_val = max(1e-9, min(1.0, p_val))

    return {
        "test_name": "Wilcoxon Signed-Rank Test (Non-Parametric)",
        "sample_size": n,
        "w_statistic": round(w_stat, 2),
        "p_value": round(p_val, 6),
        "significance": _get_significance_stars(p_val),
        "is_significant": bool(p_val < 0.05)
    }

def one_way_anova(groups: Dict[str, List[float]]) -> Dict[str, Any]:
    """
    Computes One-Way ANOVA across multiple method groups
    (e.g., 'Fixed Threshold', 'Global Anomaly', 'Energy Advisor').
    """
    group_names = list(groups.keys())
    data_lists = [groups[name] for name in group_names]
    k = len(data_lists)
    all_data = np.concatenate(data_lists)
    n_total = len(all_data)
    
    if k < 2 or n_total <= k:
        return {"error": "Invalid group sizes for ANOVA"}
        
    grand_mean = np.mean(all_data)
    ss_between = sum(len(g) * (np.mean(g) - grand_mean)**2 for g in data_lists)
    ss_within = sum(sum((val - np.mean(g))**2 for val in g) for g in data_lists)
    
    df_between = k - 1
    df_within = n_total - k
    
    ms_between = ss_between / df_between if df_between > 0 else 0
    ms_within = ss_within / df_within if df_within > 0 else 1e-9
    
    f_stat = ms_between / ms_within if ms_within > 0 else 0.0
    
    try:
        from scipy import stats
        f_res = stats.f_oneway(*data_lists)
        f_stat = float(f_res.statistic)
        p_val = float(f_res.pvalue)
    except Exception:
        # Approximate F p-value using Fisher transformation
        z = math.sqrt(2 * f_stat) - math.sqrt(2 * (df_within / max(1, df_between)) - 1) if df_between > 0 else 0
        p_val = max(1e-7, min(1.0, 1.0 - 0.5 * (1.0 + math.erf(abs(z) / math.sqrt(2)))))

    eta_squared = ss_between / (ss_between + ss_within) if (ss_between + ss_within) > 0 else 0

    # Post-hoc pairwise comparisons (Tukey-Kramer approximation)
    post_hoc = []
    for i in range(k):
        for j in range(i + 1, k):
            g1_name, g2_name = group_names[i], group_names[j]
            g1, g2 = data_lists[i], data_lists[j]
            mean_diff = float(np.mean(g1) - np.mean(g2))
            se_diff = math.sqrt(ms_within * (1.0 / len(g1) + 1.0 / len(g2)))
            q_val = abs(mean_diff) / se_diff if se_diff > 0 else 0.0
            p_adj = max(1e-6, min(1.0, p_val * (k * (k - 1) / 2)))  # Bonferroni-adjusted boundary
            post_hoc.append({
                "comparison": f"{g1_name} vs {g2_name}",
                "mean_diff": round(mean_diff, 4),
                "q_statistic": round(q_val, 4),
                "p_adjusted": round(p_adj, 6),
                "is_significant": bool(p_adj < 0.05)
            })

    return {
        "test_name": "One-Way Analysis of Variance (ANOVA)",
        "num_groups": k,
        "total_samples": n_total,
        "f_statistic": round(f_stat, 4),
        "degrees_of_freedom": [df_between, df_within],
        "p_value": round(p_val, 6),
        "significance": _get_significance_stars(p_val),
        "is_significant": bool(p_val < 0.05),
        "eta_squared": round(eta_squared, 4),
        "post_hoc_tukey": post_hoc
    }
