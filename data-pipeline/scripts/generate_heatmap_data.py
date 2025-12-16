#!/usr/bin/env python3
"""
Generate heat map data for position vs amino acid visualization.
This script processes the qDMS data and creates a 2D matrix showing 
net growth rate values for each position-amino acid combination.
"""

import pandas as pd
import numpy as np
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
AMINO_ACIDS = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y']

def main():
    """Main processing function"""
    
    # Set up paths
    base_path = Path(__file__).parent.parent.parent
    input_path = base_path / "data" / "raw" / "master_qDMS_df.csv"
    output_path = base_path / "public" / "data" / "v1.0" / "heatmap_data.json"
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    logger.info(f"Loading data from: {input_path}")
    
    # Load data
    df = pd.read_csv(input_path)
    logger.info(f"Loaded {len(df)} measurements")
    
    # Filter to canonical amino acids only
    df_canonical = df[df['alt_aa'].isin(AMINO_ACIDS)]
    logger.info(f"Filtered to {len(df_canonical)} measurements with canonical amino acids")
    
    # Create dose level categories
    dose_mapping = {5: 'low', 30: 'medium', 100: 'high'}
    df_canonical['dose_level'] = df_canonical['conc'].map(dose_mapping)
    df_canonical = df_canonical[df_canonical['dose_level'].notna()]
    
    # Calculate aggregated statistics
    aggregated_stats = df_canonical.groupby(['species', 'protein_start', 'alt_aa', 'ref_aa', 'dose_level', 'Gene', 'Drug'])['netgr_obs'].agg(['mean', 'std', 'count']).reset_index()
    logger.info(f"Calculated statistics for {len(aggregated_stats)} species-drug-dose combinations")
    
    # Get all positions with data and reference amino acids per position
    all_positions = sorted(aggregated_stats['protein_start'].unique())
    position_ref_aa = {}
    for _, row in aggregated_stats.iterrows():
        position = int(row['protein_start'])
        position_ref_aa[position] = row['ref_aa']
    
    logger.info(f"Position range: {min(all_positions)} to {max(all_positions)}")
    logger.info(f"Total positions with data: {len(all_positions)}")
    
    # Get unique drugs
    unique_drugs = sorted(aggregated_stats['Drug'].unique())
    logger.info(f"Drugs found: {unique_drugs}")
    
    # Create position vs amino acid matrix PER DRUG
    drug_matrices = {}
    
    for drug in unique_drugs:
        drug_data = aggregated_stats[aggregated_stats['Drug'] == drug]
        position_aa_matrix = {}
        
        # First populate with actual data for this drug
        for _, row in drug_data.iterrows():
            position = int(row['protein_start'])
            aa = row['alt_aa']
            dose_level = row['dose_level']
            ref_aa = row['ref_aa']
            
            mean_value = float(row['mean'])
            std_value = float(row['std']) if not pd.isna(row['std']) else None
            count_value = int(row['count'])
            
            position_str = str(position)
            if position_str not in position_aa_matrix:
                position_aa_matrix[position_str] = {}
            
            if aa not in position_aa_matrix[position_str]:
                position_aa_matrix[position_str][aa] = {
                    'low': {'value': None, 'std': None, 'count': 0},
                    'medium': {'value': None, 'std': None, 'count': 0},
                    'high': {'value': None, 'std': None, 'count': 0},
                    'ref_aa': ref_aa
                }
            
            # Store values
            position_aa_matrix[position_str][aa][dose_level] = {
                'value': mean_value,
                'std': std_value,
                'count': count_value
            }
            position_aa_matrix[position_str][aa]['ref_aa'] = ref_aa
        
        # Fill in missing amino acids for each position
        for position in all_positions:
            position_str = str(position)
            ref_aa = position_ref_aa[position]
            
            if position_str not in position_aa_matrix:
                position_aa_matrix[position_str] = {}
            
            for aa in AMINO_ACIDS:
                if aa not in position_aa_matrix[position_str]:
                    position_aa_matrix[position_str][aa] = {
                        'low': {'value': None, 'std': None, 'count': 0},
                        'medium': {'value': None, 'std': None, 'count': 0},
                        'high': {'value': None, 'std': None, 'count': 0},
                        'ref_aa': ref_aa
                    }
        
        drug_matrices[drug] = position_aa_matrix
    
    # Create variant lookup (shared across drugs)
    variant_lookup = {}
    # Use first drug's matrix to build variant lookup
    first_drug_matrix = drug_matrices[unique_drugs[0]]
    for position_str, aa_data in first_drug_matrix.items():
        position = int(position_str)
        for aa, dose_data in aa_data.items():
            ref_aa = dose_data.get('ref_aa', 'X')
            variant_id = f"{ref_aa}{position}{aa}"
            variant_lookup[f"{position}_{aa}"] = {
                'id': variant_id,
                'position': position,
                'amino_acid': aa,
                'variant_string': variant_id
            }
    
    # Calculate value ranges per drug
    drug_value_ranges = {}
    drug_data_counts = {}
    
    for drug, position_aa_matrix in drug_matrices.items():
        all_values = []
        dose_values = {'low': [], 'medium': [], 'high': []}
        data_counts = {'low': 0, 'medium': 0, 'high': 0}
        
        for pos_data in position_aa_matrix.values():
            for aa_data in pos_data.values():
                for dose in ['low', 'medium', 'high']:
                    value = aa_data[dose]['value']
                    if value is not None:
                        all_values.append(value)
                        dose_values[dose].append(value)
                        data_counts[dose] += 1
        
        value_range = {
            'min': min(all_values) if all_values else 0,
            'max': max(all_values) if all_values else 0
        }
        
        for dose in ['low', 'medium', 'high']:
            if dose_values[dose]:
                value_range[dose] = {
                    'min': min(dose_values[dose]),
                    'max': max(dose_values[dose])
                }
        
        drug_value_ranges[drug] = value_range
        drug_data_counts[drug] = data_counts
    
    # Get metadata
    gene = aggregated_stats['Gene'].iloc[0]
    
    # Count total unique variants across all drugs
    total_variants = len(variant_lookup)
    
    metadata = {
        'type': 'position_vs_amino_acid',
        'total_variants': total_variants,
        'position_range': {
            'min': int(min(all_positions)),
            'max': int(max(all_positions)),
            'positions_with_data': int(len(all_positions))
        },
        'amino_acids': AMINO_ACIDS,
        'amino_acids_count': len(AMINO_ACIDS),
        'gene': gene,
        'drugs': list(unique_drugs),
        'value_ranges': drug_value_ranges,
        'data_counts': drug_data_counts,
        'description': 'Mean netgr_obs values by protein position, amino acid substitution, drug, and dose level',
        'dose_levels': ['low', 'medium', 'high'],
        'data_columns': {
            'low': 'Mean netgr_obs values at 5 μM concentration across replicates',
            'medium': 'Mean netgr_obs values at 30 μM concentration across replicates', 
            'high': 'Mean netgr_obs values at 100 μM concentration across replicates',
            'std': 'Standard deviation across replicates for each concentration',
            'count': 'Number of replicates/measurements for each concentration',
            'ref_aa': 'Reference (wild-type) amino acid at this position'
        }
    }
    
    logger.info(f"Generated heat map matrices: {len(all_positions)} positions × {len(AMINO_ACIDS)} amino acids × {len(unique_drugs)} drugs × 3 dose levels")
    for drug in unique_drugs:
        counts = drug_data_counts[drug]
        logger.info(f"{drug} data points - Low: {counts['low']}, Medium: {counts['medium']}, High: {counts['high']}")
    
    # Assemble final data with drug-specific matrices
    heatmap_data = {
        'metadata': metadata,
        'matrices': drug_matrices,  # Changed from 'matrix' to 'matrices' with drug keys
        'positions': [int(pos) for pos in all_positions],  # Ensure integers
        'variant_lookup': variant_lookup
    }
    
    # Save to file
    with open(output_path, 'w') as f:
        json.dump(heatmap_data, f, indent=2, default=str)
    
    logger.info(f"Heat map data saved: {output_path}")
    logger.info(f"Generated data for {len(AMINO_ACIDS)} amino acids")
    logger.info(f"Total variants processed: {metadata['total_variants']}")

if __name__ == "__main__":
    main()
