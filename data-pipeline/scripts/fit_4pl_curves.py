#!/usr/bin/env python3
"""
4-Parameter Logistic (4PL) curve fitting for dose-response data.
Fits IC50 curves for each variant-drug combination.
"""

import numpy as np
from scipy.optimize import curve_fit
import logging

logger = logging.getLogger(__name__)

def four_parameter_logistic(x, a, b, c, d):
    """
    Four parameter logistic function.
    
    Parameters:
    -----------
    x : float or array
        Dose/concentration (independent variable)
    a : float
        Minimum asymptote (lower plateau, response at zero dose / no drug)
    b : float
        Hill slope (steepness of curve)
    c : float
        Inflection point (IC50, concentration at 50% response)
    d : float
        Maximum asymptote (upper plateau, response at infinite dose / high drug)
    
    Returns:
    --------
    y : float or array
        Predicted response (dependent variable)
    
    The equation: y = d + (a - d) / (1 + (x/c)^b)
    
    Note: At x=0 (no drug): y = a (high viability)
          At x→∞ (high drug): y = d (low viability)
    """
    return d + (a - d) / (1 + (x / c) ** b)


def convert_netgr_to_relative_viability(netgrs, netgr_nodrug, t_assay=72):
    """
    Convert net growth rates to relative viability.
    
    Parameters:
    -----------
    netgrs : array-like
        Net growth rates at various drug concentrations
    netgr_nodrug : float
        Net growth rate without drug (baseline)
    t_assay : float
        Assay time in hours (default: 72 hours)
    
    Returns:
    --------
    rel_viabs : array
        Relative viability values (0-1 scale)
    """
    netgrs = np.array(netgrs)
    
    # Convert to relative viability using exponential growth model
    # rel_viab = exp(netgr * t) / exp(netgr_nodrug * t)
    rel_viabs = np.exp(netgrs * t_assay) / np.exp(netgr_nodrug * t_assay)
    
    # Clip to [0, inf] to avoid negative viabilities
    rel_viabs = np.maximum(rel_viabs, 0)
    
    return rel_viabs


def fit_4pl_curve(doses, responses, use_viability_conversion=True, netgr_nodrug=None):
    """
    Fit 4-parameter logistic curve to dose-response data.
    
    Parameters:
    -----------
    doses : array-like
        Concentration values
    responses : array-like
        Response values (netGR or viability)
    use_viability_conversion : bool
        If True, convert netGR to relative viability before fitting
    netgr_nodrug : float
        Baseline netGR without drug (needed for viability conversion)
    
    Returns:
    --------
    dict with keys:
        - 'success': bool, whether fit succeeded
        - 'parameters': dict with a, b, c, d values
        - 'ic50': float, IC50 value (parameter c)
        - 'hill_slope': float, Hill slope (parameter b)
        - 'min_response': float, minimum asymptote (parameter a)
        - 'max_response': float, maximum asymptote (parameter d)
        - 'r_squared': float, goodness of fit
        - 'residual_sum_squares': float, RSS
        - 'fitted_curve': array, fitted y values for given x
        - 'model_type': str, description of fitted model
    """
    doses = np.array(doses, dtype=float)
    responses = np.array(responses, dtype=float)
    
    # Remove any NaN or infinite values
    valid_mask = np.isfinite(doses) & np.isfinite(responses) & (doses > 0)
    doses = doses[valid_mask]
    responses = responses[valid_mask]
    
    if len(doses) < 4:
        logger.warning(f"Insufficient data points for 4PL fit: {len(doses)} points (minimum 4 required for 4 parameters)")
        return {
            'success': False,
            'error': 'Insufficient data points',
            'parameters': {},
            'ic50': None,
            'hill_slope': None,
            'min_response': None,
            'max_response': None,
            'r_squared': None,
            'residual_sum_squares': None,
            'fitted_curve': None,
            'model_type': '4PL'
        }
    
    # Convert to relative viability if requested
    if use_viability_conversion:
        if netgr_nodrug is None:
            # Estimate from maximum response (assuming no drug condition is max)
            netgr_nodrug = np.max(responses)
        
        responses = convert_netgr_to_relative_viability(responses, netgr_nodrug)
    
    # Initial parameter guesses
    min_response = np.min(responses)
    max_response = np.max(responses)
    mid_response = (min_response + max_response) / 2
    
    # Estimate IC50 as dose at middle response
    if len(doses) >= 2:
        # Find dose closest to middle response
        mid_idx = np.argmin(np.abs(responses - mid_response))
        ic50_guess = doses[mid_idx]
    else:
        ic50_guess = np.median(doses)
    
    # Set bounds to constrain the fit
    # For viability data: a ~1 (high viability at no drug), d ~0 (low viability at high drug)
    # Following R code constraints: upperl=c(1,Inf,Inf,0.02), lowerl=c(0.98,-Inf,-Inf,0)
    # Order in R dr4pl: (upper asymptote, IC50, Hill slope, lower asymptote) = (a, c, b, d)
    if use_viability_conversion:
        bounds = (
            [0.8, -10.0, np.min(doses) * 0.1, 0.0],    # Lower bounds: [a_min, b_min, c_min, d_min]
            [1.2, 10.0, np.max(doses) * 10, 0.2]       # Upper bounds: [a_max, b_max, c_max, d_max]
        )
    else:
        bounds = (
            [max_response * 0.8, -10.0, np.min(doses) * 0.1, min_response * 0.5],
            [max_response * 1.2, 10.0, np.max(doses) * 10, min_response * 1.5]
        )
    
    # Initial guesses: [a, b, c, d]
    # Following the equation: y = d + (a - d) / (1 + (x/c)^b)
    # a = response at x=0 (no drug, high viability ~1.0)
    # d = response at x→∞ (high drug, low viability ~0.0)
    # b = Hill slope
    # c = IC50
    # IMPORTANT: Clip initial guesses to be within bounds to avoid "initial guess outside bounds" error
    a_guess = np.clip(max_response, bounds[0][0], bounds[1][0])
    d_guess = np.clip(min_response, bounds[0][3], bounds[1][3])
    ic50_guess = np.clip(ic50_guess, bounds[0][2], bounds[1][2])
    p0 = [a_guess, 1.0, ic50_guess, d_guess]
    
    try:
        # Fit the curve
        popt, pcov = curve_fit(
            four_parameter_logistic,
            doses,
            responses,
            p0=p0,
            bounds=bounds,
            maxfev=10000,
            method='trf'
        )
        
        a_fit, b_fit, c_fit, d_fit = popt
        
        # Calculate fitted values
        y_fit = four_parameter_logistic(doses, a_fit, b_fit, c_fit, d_fit)
        
        # Calculate R-squared
        ss_res = np.sum((responses - y_fit) ** 2)
        ss_tot = np.sum((responses - np.mean(responses)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
        
        # Generate fitted curve for plotting (100 points)
        doses_fine = np.logspace(np.log10(np.min(doses)), np.log10(np.max(doses)), 100)
        fitted_curve = four_parameter_logistic(doses_fine, a_fit, b_fit, c_fit, d_fit)
        
        return {
            'success': True,
            'parameters': {
                'a': float(a_fit),  # Upper asymptote (response at x=0, no drug)
                'b': float(b_fit),  # Hill slope
                'c': float(c_fit),  # IC50
                'd': float(d_fit)   # Lower asymptote (response at x→∞, high drug)
            },
            'ic50': float(c_fit),
            'hill_slope': float(b_fit),
            'min_response': float(d_fit),  # d is the lower asymptote (min response)
            'max_response': float(a_fit),  # a is the upper asymptote (max response)
            'r_squared': float(r_squared),
            'residual_sum_squares': float(ss_res),
            'fitted_curve': {
                'doses': doses_fine.tolist(),
                'responses': fitted_curve.tolist()
            },
            'model_type': '4PL',
            'convergence': True
        }
        
    except Exception as e:
        logger.warning(f"4PL curve fitting failed: {e}")
        return {
            'success': False,
            'error': str(e),
            'parameters': {},
            'ic50': None,
            'hill_slope': None,
            'min_response': None,
            'max_response': None,
            'r_squared': None,
            'residual_sum_squares': None,
            'fitted_curve': None,
            'model_type': '4PL',
            'convergence': False
        }


def fit_variant_drug_curve(doses, responses_rep1, responses_rep2, 
                           use_viability=True, netgr_nodrug=None):
    """
    Fit 4PL curve to variant-drug dose-response data.
    Uses ALL individual replicate measurements (not averaged) for better fit.
    
    Parameters:
    -----------
    doses : list
        Dose concentrations (one per concentration level)
    responses_rep1 : list
        Replicate 1 responses (one per concentration)
    responses_rep2 : list
        Replicate 2 responses (one per concentration)
    use_viability : bool
        Convert netGR to viability
    netgr_nodrug : float
        Baseline netGR without drug
    
    Returns:
    --------
    dict : Curve fit results
    """
    # Expand doses and responses to include all individual replicates
    # This gives us 2x the data points (better for fitting 4 parameters)
    all_doses = doses + doses  # Duplicate doses for each replicate
    all_responses = responses_rep1 + responses_rep2  # Concatenate all measurements
    
    # Fit the curve using ALL individual measurements
    fit_result = fit_4pl_curve(
        all_doses, 
        all_responses,
        use_viability_conversion=use_viability,
        netgr_nodrug=netgr_nodrug
    )
    
    # Calculate average responses for reporting
    avg_responses = [(r1 + r2) / 2 for r1, r2 in zip(responses_rep1, responses_rep2)]
    
    # Add replicate information
    fit_result['replicate_data'] = {
        'rep1': responses_rep1,
        'rep2': responses_rep2,
        'average': avg_responses,
        'n_points_fitted': len(all_doses)
    }
    
    return fit_result
