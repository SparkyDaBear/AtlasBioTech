#!/usr/bin/env python3
"""
K562 screening data processor v2 for Atlas BioTech mutation database.
Converts K562 dose-response CSV to JSON format.
Handles row-per-variant-dose-replicate CSV structure.
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
        
    except Exception as e:
        logger.warning(f"Error estimating IC50: {e}")
        return None

def get_qc_flags(responses_rep1, responses_rep2, ic50):
    """Generate QC flags based on data quality."""
    flags = []
    
    if not responses_rep1 or not responses_rep2:
        flags.append("insufficient_replicates")
    
    # Check for large replicate differences
    if responses_rep1 and responses_rep2 and len(responses_rep1) == len(responses_rep2):
        max_diff = max(abs(r1 - r2) for r1, r2 in zip(responses_rep1, responses_rep2))
        if max_diff > 0.5:  # Threshold for large replicate differences
            flags.append("high_replicate_variation")
    
    # Check for missing IC50
    if ic50 is None:
        flags.append("no_ic50_estimate")
    
    # Check for unusual dose-response patterns
    if responses_rep1:
        if all(r == responses_rep1[0] for r in responses_rep1):
            flags.append("flat_dose_response")
    
    return flags

def process_k562_data_v2(csv_path):
    """Process K562 screening CSV data with proper format handling."""
    logger.info(f"Processing K562 data from {csv_path}")
    
    try:
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded {len(df)} rows of data")
    except Exception as e:
        logger.error(f"Failed to read CSV file: {e}")
        return {}
    
    # Log data structure info
    logger.info(f"CSV columns: {list(df.columns)}")
    unique_genes = df['Gene'].dropna().unique()
    unique_drugs = df['Drug'].dropna().unique()
    unique_concs = sorted(df['conc'].dropna().unique())
    
    logger.info(f"Found {len(unique_genes)} unique genes: {list(unique_genes)}")
    logger.info(f"Found {len(unique_drugs)} unique drugs: {list(unique_drugs)}")
    logger.info(f"Found {len(unique_concs)} unique concentrations: {unique_concs}")
    
    variants = {}
    processed_count = 0
    
    # Group by variant to aggregate dose-response data
    variant_groups = df.groupby(['Gene', 'ref_aa', 'protein_start', 'alt_aa', 'Drug'])
    
    logger.info(f"Processing {len(variant_groups)} unique variant-drug combinations...")
    
    for (gene_name, ref_aa, position, alt_aa, drug_name), group in variant_groups:
        try:
            # Create variant identifiers
            variant_string = f"{ref_aa}{position}{alt_aa}"
            protein_change = f"p.{ref_aa}{position}{alt_aa}"
            variant_key = f"{gene_name}_{variant_string}"
            
            # Group by concentration and replicate to organize dose-response data
            dose_data = {}
            for _, row in group.iterrows():
                conc = float(row['conc'])
                netgr = float(row['netgr_obs'])
                rep = int(row['rep'])
                
                if conc not in dose_data:
                    dose_data[conc] = {}
                dose_data[conc][rep] = netgr
            
            if not dose_data:
                logger.warning(f"No dose data for variant {variant_string}")
                continue
            
            # Convert to lists for dose-response analysis
            doses = []
            responses_rep1 = []
            responses_rep2 = []
            
            for conc in sorted(dose_data.keys()):
                doses.append(conc)
                # Get replicate data, use available data if some replicates missing
                rep1_val = dose_data[conc].get(1, None)
                rep2_val = dose_data[conc].get(2, None)
                
                # Handle missing replicates
                if rep1_val is not None and rep2_val is not None:
                    responses_rep1.append(rep1_val)
                    responses_rep2.append(rep2_val)
                elif rep1_val is not None:
                    responses_rep1.append(rep1_val)
                    responses_rep2.append(rep1_val)  # Use rep1 value for both
                elif rep2_val is not None:
                    responses_rep1.append(rep2_val)  # Use rep2 value for both
                    responses_rep2.append(rep2_val)
                else:
                    # Skip this concentration if no data
                    doses.pop()
                    continue
            
            if not doses:
                logger.warning(f"No valid dose data for variant {variant_string}")
                continue
            
            # Calculate average responses
            avg_responses = [(r1 + r2) / 2 for r1, r2 in zip(responses_rep1, responses_rep2)]
            
            # Estimate IC50
            ic50_estimated = estimate_ic50(doses, avg_responses)
            
            # Determine number of actual replicates
            actual_reps = len(set(group['rep']))
            
            # Check if variant already exists (multiple drugs for same variant)
            if variant_key in variants:
                # Add this drug's data to existing variant
                variants[variant_key]['drugs_tested'].append(drug_name)
                variants[variant_key]['ic50_values'].append({
                    'drug': drug_name,
                    'ic50': ic50_estimated if ic50_estimated else 0,
                    'replicate_count': actual_reps,
                    'dose_response_data': {
                        'doses': doses,
                        'responses_rep1': responses_rep1,
                        'responses_rep2': responses_rep2,
                        'avg_responses': avg_responses
                    },
                    'qc_flags': get_qc_flags(responses_rep1, responses_rep2, ic50_estimated)
                })
            else:
                # Create new variant entry
                variants[variant_key] = {
                    'gene': gene_name,
                    'variant_string': variant_string,
                    'protein_change': protein_change,
                    'transcript_id': 'UNKNOWN',  # Not provided in K562 data
                    'position': position,
                    'consequence': 'missense_variant',  # Assuming all are missense
                    'drugs_tested': [drug_name],
                    'model_system': 'K562 cells',
                    'ic50_values': [{
                        'drug': drug_name,
                        'ic50': ic50_estimated if ic50_estimated else 0,
                        'replicate_count': actual_reps,
                        'dose_response_data': {
                            'doses': doses,
                            'responses_rep1': responses_rep1,
                            'responses_rep2': responses_rep2,
                            'avg_responses': avg_responses
                        },
                        'qc_flags': get_qc_flags(responses_rep1, responses_rep2, ic50_estimated)
                    }],
                    'replicate_count': actual_reps,
                    'qc_flags': [],
                    'publication_doi': '',
                    'plots': [],
                    'metadata': {
                        'date_created': datetime.now(timezone.utc).isoformat(),
                        'version': '2.0',
                        'is_synonymous': bool(group.iloc[0].get('synSNP', False)),
                        'variant_type': group.iloc[0].get('type', 'unknown'),
                        'species_context': group.iloc[0].get('species', 'unknown')
                    }
                }
            
            processed_count += 1
            
            if processed_count % 100 == 0:
                logger.info(f"Processed {processed_count} variants...")
        
        except (ValueError, TypeError) as e:
            logger.warning(f"Error processing variant {variant_string}: {e}")
            continue
    
    logger.info(f"Successfully processed {processed_count} variants from K562 data")
    return variants

def json_serializable(obj):
    """Convert numpy types to native Python types for JSON serialization."""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [json_serializable(v) for v in obj]
    else:
        return obj

def save_variant_datacards(variants, output_dir):
    """Save individual variant datacards as JSON files."""
    logger.info(f"Saving {len(variants)} variant datacards to {output_dir}")
    
    saved_count = 0
    for variant_key, variant_data in variants.items():
        filename = f"{variant_key}.json"
        filepath = output_dir / filename
        
        try:
            # Convert numpy types to native Python types
            serializable_data = json_serializable(variant_data)
            
            with open(filepath, 'w') as f:
                json.dump(serializable_data, f, indent=2)
            saved_count += 1
        except Exception as e:
            logger.error(f"Failed to save variant datacard {filename}: {e}")
    
    logger.info(f"Successfully saved {saved_count} variant datacards")

def main():
    """Main processing function."""
    # Setup paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    data_raw_dir = project_root / "data" / "raw"
    data_output_dir = project_root / "public" / "data" / "v1.0"
    
    logger.info("Starting K562 data processing v2...")
    
    # Create output directories
    variants_dir = data_output_dir / "variants"
    variants_dir.mkdir(parents=True, exist_ok=True)
    
    # Look for K562 CSV file
    k562_file = data_raw_dir / "master_qDMS_df.csv"
    
    if not k562_file.exists():
        logger.error(f"K562 data file not found: {k562_file}")
        sys.exit(1)
    
    # Process the K562 data
    variants = process_k562_data_v2(k562_file)
    
    if variants:
        # Save individual variant datacards
        save_variant_datacards(variants, variants_dir)
        logger.info(f"Successfully processed and saved {len(variants)} variants")
    else:
        logger.warning("No variants were processed")
    
    logger.info("K562 data processing v2 completed!")

if __name__ == "__main__":
    main()