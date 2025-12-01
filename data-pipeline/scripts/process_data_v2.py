#!/usr/bin/env python3
"""
Data processing script for Atlas BioTech mutation database.
Converts CSV files to JSON format and generates variant datacards.
Updated for qDMS format with net growth rate data.
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

def normalize_gene_symbol(symbol):
    """Normalize gene symbol to standard format."""
    return symbol.upper().strip()

def normalize_drug_name(name):
    """Normalize drug name to standard format."""
    return name.strip()

def process_variant_data(csv_path):
    """Process variant CSV data from the new qDMS format into structured format."""
    df = pd.read_csv(csv_path)
    
    # Group by gene and variant (species)
    variants = {}
    
    # Group the data by species to calculate statistics across replicates and concentrations
    grouped = df.groupby(['species', 'Gene', 'Drug', 'ref_aa', 'protein_start', 'alt_aa']).agg({
        'netgr_obs': ['mean', 'std', 'count'],
        'type': 'first',
        'synSNP': 'first'
    }).reset_index()
    
    # Flatten column names
    grouped.columns = ['_'.join(col) if col[1] else col[0] for col in grouped.columns]
    
    for _, row in grouped.iterrows():
        gene = normalize_gene_symbol(row['Gene'])
        variant_string = row['species']
        
        variant_key = f"{gene}_{variant_string}"
        
        if variant_key not in variants:
            # Build protein change notation
            ref_aa = row['ref_aa']
            position = int(row['protein_start'])
            alt_aa = row['alt_aa']
            protein_change = f"p.{ref_aa}{position}{alt_aa}"
            
            variants[variant_key] = {
                'gene': gene,
                'variant_string': variant_string,
                'protein_change': protein_change,
                'transcript_id': '',  # Not provided in this dataset
                'position': position,
                'consequence': 'missense_variant' if row['type_first'] == 'snp' or row['type_first'] == 'mnv' else 'unknown',
                'drugs_tested': [],
                'model_system': 'K562 cells',  # Based on the dataset
                'ic50_values': [],
                'replicate_count': int(row['netgr_obs_count']),
                'qc_flags': [],
                'publication_doi': '',
                'plots': [],
                'netgr_data': {  # Add the net growth rate data
                    'mean': float(row['netgr_obs_mean']),
                    'std': float(row['netgr_obs_std']) if not pd.isna(row['netgr_obs_std']) else 0,
                    'count': int(row['netgr_obs_count']),
                    'is_synonymous': bool(row['synSNP_first']) if pd.notna(row['synSNP_first']) else False
                },
                'metadata': {
                    'date_created': datetime.now(timezone.utc).isoformat(),
                    'version': '2.0',
                    'data_type': 'qDMS_netgr'
                }
            }
        
        # Add drug data
        drug = normalize_drug_name(row['Drug'])
        if drug not in variants[variant_key]['drugs_tested']:
            variants[variant_key]['drugs_tested'].append(drug)
        
        # For qDMS data, we don't have traditional IC50 values, but we have net growth rates
        # Store this as a special data type
        netgr_data = {
            'drug': drug,
            'netgr_mean': float(row['netgr_obs_mean']),
            'netgr_std': float(row['netgr_obs_std']) if not pd.isna(row['netgr_obs_std']) else 0,
            'replicate_count': int(row['netgr_obs_count']),
            'measurement_type': 'net_growth_rate'
        }
        
        variants[variant_key]['ic50_values'].append(netgr_data)
    
    return variants

def process_drug_data(csv_path):
    """Process drug CSV data into structured format."""
    if not os.path.exists(csv_path):
        logger.warning(f"Drug CSV file not found: {csv_path}")
        return {}
    
    df = pd.read_csv(csv_path)
    drugs = {}
    
    for _, row in df.iterrows():
        drug_name = normalize_drug_name(row['name'])
        
        drugs[drug_name] = {
            'name': drug_name,
            'synonyms': [s.strip() for s in str(row.get('synonyms', '')).split(',') if s.strip()],
            'fda_status': row.get('fda_status', 'Unknown'),
            'target_class': row.get('target_class', ''),
            'mechanism': row.get('mechanism', ''),
            'variant_count': 0  # Will be updated when processing variants
        }
    
    return drugs

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
    """Main data processing routine."""
    project_root = Path(__file__).parent.parent.parent
    data_raw_dir = project_root / "data" / "raw"
    data_output_dir = project_root / "public" / "data" / "v1.0"
    
    logger.info("Starting data processing...")
    
    # Create output directories
    variants_dir = data_output_dir / "variants"
    variants_dir.mkdir(parents=True, exist_ok=True)
    
    # Process variant data
    variants = {}
    
    # Look for the new master qDMS file first, then fall back to old format
    master_qDMS_file = data_raw_dir / "master_qDMS_df.csv"
    
    if master_qDMS_file.exists():
        logger.info(f"Processing master qDMS file: {master_qDMS_file}")
        file_variants = process_variant_data(master_qDMS_file)
        variants.update(file_variants)
    else:
        # Fall back to old format variant files
        variant_csv_files = list(data_raw_dir.glob("*variant*.csv")) + list(data_raw_dir.glob("*mutation*.csv"))
        
        if not variant_csv_files:
            logger.warning("No variant CSV files found in data/raw directory")
            variants = {}
        else:
            for csv_file in variant_csv_files:
                logger.info(f"Processing variant file: {csv_file}")
                file_variants = process_variant_data(csv_file)
                variants.update(file_variants)
    
    # Process drug data
    drugs = {}
    drug_csv_files = list(data_raw_dir.glob("*drug*.csv"))
    
    if not drug_csv_files:
        logger.warning("No drug CSV files found in data/raw directory")
        # Create demo drug data based on what's in the qDMS file
        drugs = {
            'Imatinib': {
                'name': 'Imatinib',
                'synonyms': ['Gleevec', 'STI571'],
                'fda_status': 'Approved',
                'target_class': 'Tyrosine kinase inhibitor',
                'mechanism': 'BCR-ABL, KIT, PDGFR inhibitor',
                'variant_count': 0
            }
        }
    else:
        for csv_file in drug_csv_files:
            logger.info(f"Processing drug file: {csv_file}")
            file_drugs = process_drug_data(csv_file)
            drugs.update(file_drugs)
    
    # Update drug variant counts
    for variant_data in variants.values():
        for drug in variant_data['drugs_tested']:
            if drug in drugs:
                drugs[drug]['variant_count'] += 1
    
    # Save individual variant datacards
    if variants:
        save_variant_datacards(variants, variants_dir)
    
    logger.info(f"Processed {len(variants)} variants and {len(drugs)} drugs")
    logger.info("Data processing completed successfully!")

if __name__ == "__main__":
    main()