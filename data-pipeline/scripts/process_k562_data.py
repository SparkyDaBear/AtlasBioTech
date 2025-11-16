#!/usr/bin/env python3
"""
K562 screening data processor for Atlas BioTech mutation database.
Converts K562 dose-response CSV to JSON format.
"""

import os
import sys
import json
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime, timezone
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def estimate_ic50(doses, responses):
    """Estimate IC50 from dose-response data."""
    if len(doses) < 2 or not doses:
        return None
    
    try:
        # For growth rate data, lower values indicate more inhibition
        # IC50 is where growth rate is 50% of the maximum (uninhibited) response
        max_response = max(responses)
        target_response = max_response * 0.5
        
        # Find doses and responses in ascending order
        sorted_data = sorted(zip(doses, responses))
        doses_sorted = [d[0] for d in sorted_data]
        responses_sorted = [d[1] for d in sorted_data]
        
        # Find IC50 by interpolation
        for i in range(len(responses_sorted) - 1):
            y1, y2 = responses_sorted[i], responses_sorted[i + 1]
            x1, x2 = doses_sorted[i], doses_sorted[i + 1]
            
            # Check if target is between these two points
            if (y1 >= target_response >= y2) or (y2 >= target_response >= y1):
                if y2 != y1:  # Avoid division by zero
                    ic50 = x1 + (target_response - y1) * (x2 - x1) / (y2 - y1)
                    return max(0, ic50)
                else:
                    return x1
        
        # If no interpolation possible, return middle dose
        return doses_sorted[len(doses_sorted) // 2]
        
    except (ValueError, ZeroDivisionError, IndexError):
        return None

def process_k562_data(csv_path):
    """Process K562 screening CSV data."""
    logger.info(f"Processing K562 data from {csv_path}")
    
    df = pd.read_csv(csv_path)
    variants = {}
    
    # You need to specify the actual gene name here
    # Based on the filename "k562_asc_screen", this might be related to ASC/PYCARD
    # Please update this with the correct gene symbol
    GENE_NAME = "ASC"  # TODO: Update this with your actual gene name (e.g., PYCARD, CASP1, etc.)
    
    for _, row in df.iterrows():
        # Extract variant information
        ref_aa = row['ref_aa']
        position = int(row['protein_start'])
        alt_aa = row['alt_aa']
        
        # Create variant identifiers
        variant_string = f"{ref_aa}{position}{alt_aa}"
        protein_change = f"p.{ref_aa}{position}{alt_aa}"
        variant_key = f"{GENE_NAME}_{variant_string}"
        
        # Extract dose-response data
        doses = []
        responses_rep1 = []
        responses_rep2 = []
        
        # Collect dose-response points
        dose_columns = ['dose.low', 'dose.medium', 'dose.high']
        rep1_columns = ['netgr_obs_rep1.low', 'netgr_obs_rep1.medium', 'netgr_obs_rep1.high']
        rep2_columns = ['netgr_obs_rep2.low', 'netgr_obs_rep2.medium', 'netgr_obs_rep2.high']
        
        for dose_col, rep1_col, rep2_col in zip(dose_columns, rep1_columns, rep2_columns):
            if pd.notna(row.get(dose_col)):
                doses.append(float(row[dose_col]))
                responses_rep1.append(float(row.get(rep1_col, 0)))
                responses_rep2.append(float(row.get(rep2_col, 0)))
        
        if not doses:
            logger.warning(f"No dose data for variant {variant_string}")
            continue
        
        # Calculate average responses
        avg_responses = [(r1 + r2) / 2 for r1, r2 in zip(responses_rep1, responses_rep2)]
        
        # Estimate IC50
        ic50_estimated = estimate_ic50(doses, avg_responses)
        
        # Create variant entry
        variants[variant_key] = {
            'gene': GENE_NAME,
            'variant_string': variant_string,
            'protein_change': protein_change,
            'transcript_id': 'UNKNOWN',  # Not provided in K562 data
            'position': position,
            'consequence': 'missense_variant',  # Assuming all are missense
            'drugs_tested': ['Compound_Screen'],
            'model_system': 'K562 cells',
            'ic50_values': [{
                'drug': 'Compound_Screen',
                'ic50': ic50_estimated if ic50_estimated else 0,
                'replicate_count': 2,
                'dose_response_data': {
                    'doses': doses,
                    'responses_rep1': responses_rep1,
                    'responses_rep2': responses_rep2,
                    'avg_responses': avg_responses
                },
                'qc_flags': get_qc_flags(responses_rep1, responses_rep2, ic50_estimated)
            }],
            'replicate_count': 2,
            'qc_flags': [],
            'publication_doi': '',
            'plots': [],
            'metadata': {
                'date_created': datetime.now(timezone.utc).isoformat(),
                'version': '1.0',
                'is_synonymous': bool(row.get('synSNP', False)),
                'variant_type': row.get('type', 'unknown'),
                'species_context': row.get('species', 'unknown')
            }
        }
    
    logger.info(f"Processed {len(variants)} variants from K562 data")
    return variants

def get_qc_flags(responses_rep1, responses_rep2, ic50):
    """Generate QC flags based on data quality."""
    flags = []
    
    # Check for missing IC50
    if ic50 is None or ic50 <= 0:
        flags.append('incomplete_curve')
    
    # Check for high variability between replicates
    if len(responses_rep1) == len(responses_rep2):
        rep_diffs = [abs(r1 - r2) for r1, r2 in zip(responses_rep1, responses_rep2)]
        max_diff = max(rep_diffs) if rep_diffs else 0
        if max_diff > 0.01:  # 1% threshold for high variability
            flags.append('high_variability')
    
    return flags

def save_variant_datacards(variants, output_dir):
    """Save individual variant JSON datacards."""
    output_dir = Path(output_dir)
    
    for variant_key, variant_data in variants.items():
        gene = variant_data['gene']
        variant_string = variant_data['variant_string']
        
        # Create gene directory
        gene_dir = output_dir / gene
        gene_dir.mkdir(parents=True, exist_ok=True)
        
        # Save variant datacard
        variant_file = gene_dir / f"{variant_string}.json"
        with open(variant_file, 'w') as f:
            json.dump(variant_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved variant datacard: {variant_file}")

def main():
    """Main K562 data processing routine."""
    project_root = Path(__file__).parent.parent.parent
    data_raw_dir = project_root / "data" / "raw"
    data_output_dir = project_root / "data" / "v1.0"
    
    logger.info("Starting K562 data processing...")
    
    # Create output directories
    variants_dir = data_output_dir / "variants"
    variants_dir.mkdir(parents=True, exist_ok=True)
    
    # Look for K562 CSV file
    k562_file = data_raw_dir / "k562_asc_screen_ngr_051024.csv"
    
    if not k562_file.exists():
        logger.error(f"K562 data file not found: {k562_file}")
        sys.exit(1)
    
    # Process the K562 data
    variants = process_k562_data(k562_file)
    
    if variants:
        # Save individual variant datacards
        save_variant_datacards(variants, variants_dir)
        logger.info(f"Successfully processed {len(variants)} variants")
    else:
        logger.warning("No variants were processed")
    
    logger.info("K562 data processing completed!")

if __name__ == "__main__":
    main()