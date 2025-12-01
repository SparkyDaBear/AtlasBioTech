#!/usr/bin/env python3
"""
Generate amino acid heat map data from K562 dose-response screen data.
Processes CSV to calculate mean netgr_obs values by amino acid for visualization.
"""

import pandas as pd
import numpy as np
import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Any

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_canonical_amino_acids() -> List[str]:
    """Return the 20 canonical amino acids in standard single-letter code."""
    return ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 
            'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y']

def process_heatmap_data(csv_path: str) -> Dict[str, Any]:
    """
    Process CSV data to generate position vs amino acid heat map matrix.
    
    Args:
        csv_path: Path to the master qDMS CSV file
        
    Returns:
        Dictionary containing heat map data and metadata
    """
    logger.info(f"Loading data from: {csv_path}")
    
    # Load the CSV data
    df = pd.read_csv(csv_path)
    logger.info(f"Loaded {len(df)} measurements")
    
    # Get canonical amino acids
    canonical_aa = get_canonical_amino_acids()
    
    # Filter for canonical amino acids only
    df_canonical = df[df['alt_aa'].isin(canonical_aa)].copy()
    logger.info(f"Filtered to {len(df_canonical)} measurements with canonical amino acids")
    
    # Map concentration values to dose level names for consistency
    dose_mapping = {5: 'low', 30: 'medium', 100: 'high'}
    df_canonical['dose_level'] = df_canonical['conc'].map(dose_mapping)
    
    # Group by species, dose level and calculate mean/std across replicates
    grouped_stats = df_canonical.groupby(['species', 'protein_start', 'alt_aa', 'ref_aa', 'dose_level', 'Gene', 'Drug'])['netgr_obs'].agg(['mean', 'std', 'count']).reset_index()
    
    logger.info(f"Calculated statistics for {len(grouped_stats)} species-dose combinations")
    
    # Get position range
    min_position = int(grouped_stats['protein_start'].min())
    max_position = int(grouped_stats['protein_start'].max())
    all_positions = sorted(grouped_stats['protein_start'].unique())
    
    logger.info(f"Position range: {min_position} to {max_position}")
    logger.info(f"Total positions with data: {len(all_positions)}")
    
    # Create position vs amino acid matrix
    position_aa_matrix = {}
    variant_lookup = {}
    
    # Pivot the data to get the structure we need
    for _, row in grouped_stats.iterrows():
        position = int(row['protein_start'])
        aa = row['alt_aa']
        dose_level = row['dose_level']
        ref_aa = row['ref_aa']
        
        mean_value = float(row['mean'])
        std_value = float(row['std']) if not pd.isna(row['std']) else 0
        count_value = int(row['count'])
        
        position_str = str(position)  # Use string keys for JSON compatibility
        if position_str not in position_aa_matrix:
            position_aa_matrix[position_str] = {}
        
        if aa not in position_aa_matrix[position_str]:
            position_aa_matrix[position_str][aa] = {
                'low': {'value': None, 'std': None, 'count': 0},
                'medium': {'value': None, 'std': None, 'count': 0},
                'high': {'value': None, 'std': None, 'count': 0},
                'ref_aa': ref_aa
            }
        
        # Store the calculated values for this dose level
        position_aa_matrix[position_str][aa][dose_level] = {
            'value': mean_value,
            'std': std_value,
            'count': count_value
        }
        position_aa_matrix[position_str][aa]['ref_aa'] = ref_aa if ref_aa else 'X'  # Use 'X' for unknown ref_aa
    
    # Create variant lookup for navigation
    for position_str, aa_data in position_aa_matrix.items():
        position = int(position_str)
        for aa, dose_data in aa_data.items():
            if aa != 'ref_aa' and dose_data.get('ref_aa'):  # Only create lookup if we have ref_aa data
                ref_aa_val = dose_data['ref_aa'] if dose_data['ref_aa'] != 'X' else '?'
                variant_id = f"{ref_aa_val}{position}{aa}"
                variant_lookup[f"{position}_{aa}"] = {
                    'id': variant_id,
                    'position': position,
                    'ref_aa': dose_data['ref_aa'],
                    'alt_aa': aa,
                    'low_value': dose_data['low']['value'],
                    'medium_value': dose_data['medium']['value'],
                    'high_value': dose_data['high']['value'],
                    'count': dose_data['low']['count'] if dose_data['low']['value'] is not None else 0
                }
    
    # Fill in missing combinations with null values
    for position in all_positions:
        position_str = str(position)
        if position_str not in position_aa_matrix:
            position_aa_matrix[position_str] = {}
        for aa in canonical_aa:
            if aa not in position_aa_matrix[position_str]:
                position_aa_matrix[position_str][aa] = {
                    'low': {'value': None, 'std': None, 'count': 0},
                    'medium': {'value': None, 'std': None, 'count': 0},
                    'high': {'value': None, 'std': None, 'count': 0},
                    'ref_aa': None
                }    # Calculate global statistics for color scaling across all doses
    all_values_low = []
    all_values_medium = []
    all_values_high = []
    
    for pos_data in position_aa_matrix.values():
        for aa_data in pos_data.values():
            if aa_data['low']['value'] is not None:
                all_values_low.append(aa_data['low']['value'])
            if aa_data['medium']['value'] is not None:
                all_values_medium.append(aa_data['medium']['value'])
            if aa_data['high']['value'] is not None:
                all_values_high.append(aa_data['high']['value'])
    
    # Global min/max across all doses for consistent color scaling
    all_values_combined = all_values_low + all_values_medium + all_values_high
    global_min = min(all_values_combined) if all_values_combined else 0
    global_max = max(all_values_combined) if all_values_combined else 1
    
    # Create heat map data structure
    heatmap_data = {
        'metadata': {
            'type': 'position_vs_amino_acid',
            'total_variants': int(len(grouped_stats.groupby(['protein_start', 'alt_aa']))),  # Count unique variants
            'position_range': {
                'min': int(min_position),  # Convert to Python int
                'max': int(max_position),  # Convert to Python int
                'positions_with_data': len(all_positions)
            },
            'amino_acids': canonical_aa,
            'amino_acids_count': len(canonical_aa),
            'gene': grouped_stats['Gene'].iloc[0] if len(grouped_stats) > 0 else None,
            'drug': grouped_stats['Drug'].iloc[0] if len(grouped_stats) > 0 else None,
            'value_range': {
                'min': float(global_min),
                'max': float(global_max),
                'low': {
                    'min': float(min(all_values_low)) if all_values_low else 0,
                    'max': float(max(all_values_low)) if all_values_low else 1
                },
                'medium': {
                    'min': float(min(all_values_medium)) if all_values_medium else 0,
                    'max': float(max(all_values_medium)) if all_values_medium else 1
                },
                'high': {
                    'min': float(min(all_values_high)) if all_values_high else 0,
                    'max': float(max(all_values_high)) if all_values_high else 1
                }
            },
            'description': 'Mean netgr_obs values by protein position and amino acid substitution across all dose levels',
            'dose_levels': ['low', 'medium', 'high'],
            'data_columns': {
                'low': 'Mean netgr_obs values at 5 μM concentration across replicates',
                'medium': 'Mean netgr_obs values at 30 μM concentration across replicates',
                'high': 'Mean netgr_obs values at 100 μM concentration across replicates',
                'std': 'Standard deviation across replicates for each concentration',
                'count': 'Number of replicates/measurements for each concentration',
                'ref_aa': 'Reference (wild-type) amino acid at this position'
            }
        },
        'matrix': position_aa_matrix,
        'positions': [int(pos) for pos in all_positions],  # Convert to Python ints
        'variant_lookup': variant_lookup
    }
    
    # Count total data points across all doses
    data_points_low = sum(
        1 for pos_data in position_aa_matrix.values() 
        for aa_data in pos_data.values() 
        if aa_data['low']['value'] is not None
    )
    data_points_medium = sum(
        1 for pos_data in position_aa_matrix.values() 
        for aa_data in pos_data.values() 
        if aa_data['medium']['value'] is not None
    )
    data_points_high = sum(
        1 for pos_data in position_aa_matrix.values() 
        for aa_data in pos_data.values() 
        if aa_data['high']['value'] is not None
    )
    
    logger.info(f"Generated heat map matrix: {len(all_positions)} positions × {len(canonical_aa)} amino acids × 3 dose levels")
    logger.info(f"Total data points - Low: {data_points_low}, Medium: {data_points_medium}, High: {data_points_high}")
    
    return heatmap_data

def main():
    """Main function to generate heat map data."""
    # Define paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    csv_path = project_root / "data" / "raw" / "master_qDMS_df.csv"
    output_dir = project_root / "public" / "data" / "v1.0"
    output_file = output_dir / "heatmap_data.json"
    
    try:
        # Check if CSV file exists
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV file not found: {csv_path}")
        
        # Generate heat map data
        heatmap_data = process_heatmap_data(str(csv_path))
        
        # Ensure output directory exists
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save heat map data
        with open(output_file, 'w') as f:
            json.dump(heatmap_data, f, indent=2)
        
        logger.info(f"Heat map data saved: {output_file}")
        logger.info(f"Generated data for {heatmap_data['metadata']['amino_acids_count']} amino acids")
        logger.info(f"Total variants processed: {heatmap_data['metadata']['total_variants']}")
        
    except Exception as e:
        logger.error(f"Error generating heat map data: {e}")
        raise

if __name__ == "__main__":
    main()