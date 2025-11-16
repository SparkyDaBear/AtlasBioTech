#!/usr/bin/env python3
"""
Data processing script for Atlas BioTech mutation database.
Converts CSV files to JSON format and generates variant datacards.
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

def calculate_confidence_interval(ic50, std_error, n_replicates):
    """Calculate 95% confidence interval for IC50."""
    # Using t-distribution for small sample sizes
    from scipy import stats
    
    if n_replicates < 2 or pd.isna(std_error):
        return [ic50, ic50]
    
    t_value = stats.t.ppf(0.975, n_replicates - 1)  # 95% CI
    margin = t_value * std_error
    
    return [max(0, ic50 - margin), ic50 + margin]

def process_variant_data(csv_path):
    """Process variant CSV data into structured format."""
    df = pd.read_csv(csv_path)
    
    # Group by gene and variant
    variants = {}
    
    for _, row in df.iterrows():
        gene = normalize_gene_symbol(row['gene'])
        variant_key = f"{gene}_{row['variant_string']}"
        
        if variant_key not in variants:
            variants[variant_key] = {
                'gene': gene,
                'variant_string': row['variant_string'],
                'protein_change': row['protein_change'],
                'transcript_id': row.get('transcript_id', ''),
                'position': int(row['position']) if pd.notna(row['position']) else None,
                'consequence': row.get('consequence', 'unknown'),
                'drugs_tested': [],
                'model_system': row.get('model_system', ''),
                'ic50_values': [],
                'replicate_count': int(row.get('replicate_count', 1)),
                'qc_flags': [],
                'publication_doi': row.get('publication_doi', ''),
                'plots': [],
                'metadata': {
                    'date_created': datetime.now(timezone.utc).isoformat(),
                    'version': '1.0'
                }
            }
        
        # Add drug data
        drug = normalize_drug_name(row['drug'])
        if drug not in variants[variant_key]['drugs_tested']:
            variants[variant_key]['drugs_tested'].append(drug)
        
        # Add IC50 data
        ic50_data = {
            'drug': drug,
            'ic50': float(row['ic50']),
            'replicate_count': int(row.get('replicate_count', 1))
        }
        
        if pd.notna(row.get('ic50_wt')):
            ic50_data['ic50_wt'] = float(row['ic50_wt'])
            ic50_data['fold_change'] = float(row.get('fold_change', ic50_data['ic50'] / ic50_data['ic50_wt']))
        
        if pd.notna(row.get('std_error')):
            ic50_data['confidence_interval'] = calculate_confidence_interval(
                ic50_data['ic50'], float(row['std_error']), ic50_data['replicate_count']
            )
        
        # Add QC flags
        if row.get('qc_flags'):
            qc_flags = [flag.strip() for flag in str(row['qc_flags']).split(',') if flag.strip()]
            ic50_data['qc_flags'] = qc_flags
        
        variants[variant_key]['ic50_values'].append(ic50_data)
        
        # Add plot information
        if pd.notna(row.get('plot_url')):
            plot_info = {
                'drug': drug,
                'plot_url': row['plot_url'],
                'plot_type': row.get('plot_type', 'dose_response')
            }
            variants[variant_key]['plots'].append(plot_info)
        
        # Add PDB structure information
        if pd.notna(row.get('pdb_id')):
            variants[variant_key]['pdb_structure'] = {
                'pdb_id': row['pdb_id'],
                'chain': row.get('pdb_chain', 'A'),
                'residue_number': int(row.get('pdb_residue', row['position'])),
                'pocket_residues': []
            }
            
            if pd.notna(row.get('pocket_residues')):
                pocket_residues = [int(r.strip()) for r in str(row['pocket_residues']).split(',')]
                variants[variant_key]['pdb_structure']['pocket_residues'] = pocket_residues\n    \n    return variants

def process_drug_data(csv_path):\n    """Process drug CSV data into structured format."""\n    if not os.path.exists(csv_path):\n        logger.warning(f"Drug CSV file not found: {csv_path}")\n        return {}\n    \n    df = pd.read_csv(csv_path)\n    drugs = {}\n    \n    for _, row in df.iterrows():\n        drug_name = normalize_drug_name(row['name'])\n        \n        drugs[drug_name] = {\n            'name': drug_name,\n            'synonyms': [s.strip() for s in str(row.get('synonyms', '')).split(',') if s.strip()],\n            'fda_status': row.get('fda_status', 'Unknown'),\n            'target_class': row.get('target_class', ''),\n            'mechanism': row.get('mechanism', ''),\n            'variant_count': 0  # Will be updated when processing variants\n        }\n    \n    return drugs

def save_variant_datacards(variants, output_dir):\n    """Save individual variant JSON datacards."""\n    output_dir = Path(output_dir)\n    \n    for variant_key, variant_data in variants.items():\n        gene = variant_data['gene']\n        variant_string = variant_data['variant_string']\n        \n        # Create gene directory\n        gene_dir = output_dir / gene\n        gene_dir.mkdir(parents=True, exist_ok=True)\n        \n        # Save variant datacard\n        variant_file = gene_dir / f"{variant_string}.json"\n        with open(variant_file, 'w') as f:\n            json.dump(variant_data, f, indent=2, ensure_ascii=False)\n        \n        logger.info(f"Saved variant datacard: {variant_file}")\n\ndef main():\n    """Main data processing routine."""\n    project_root = Path(__file__).parent.parent.parent\n    data_raw_dir = project_root / "data" / "raw"\n    data_output_dir = project_root / "data" / "v1.0"\n    \n    logger.info("Starting data processing...")\n    \n    # Create output directories\n    variants_dir = data_output_dir / "variants"\n    variants_dir.mkdir(parents=True, exist_ok=True)\n    \n    # Process variant data\n    variants = {}\n    variant_csv_files = list(data_raw_dir.glob("*variant*.csv")) + list(data_raw_dir.glob("*mutation*.csv"))\n    \n    if not variant_csv_files:\n        logger.warning("No variant CSV files found in data/raw directory")\n        # Create empty variants structure for demo\n        variants = {}\n    else:\n        for csv_file in variant_csv_files:\n            logger.info(f"Processing variant file: {csv_file}")\n            file_variants = process_variant_data(csv_file)\n            variants.update(file_variants)\n    \n    # Process drug data\n    drugs = {}\n    drug_csv_files = list(data_raw_dir.glob("*drug*.csv"))\n    \n    if not drug_csv_files:\n        logger.warning("No drug CSV files found in data/raw directory")\n        # Create demo drug data\n        drugs = {\n            'Imatinib': {\n                'name': 'Imatinib',\n                'synonyms': ['Gleevec', 'STI571'],\n                'fda_status': 'Approved',\n                'target_class': 'Tyrosine kinase inhibitor',\n                'mechanism': 'BCR-ABL, KIT, PDGFR inhibitor',\n                'variant_count': 0\n            },\n            'Dasatinib': {\n                'name': 'Dasatinib',\n                'synonyms': ['Sprycel', 'BMS-354825'],\n                'fda_status': 'Approved',\n                'target_class': 'Tyrosine kinase inhibitor',\n                'mechanism': 'BCR-ABL, SRC family inhibitor',\n                'variant_count': 0\n            },\n            'Nilotinib': {\n                'name': 'Nilotinib',\n                'synonyms': ['Tasigna', 'AMN107'],\n                'fda_status': 'Approved',\n                'target_class': 'Tyrosine kinase inhibitor',\n                'mechanism': 'BCR-ABL inhibitor',\n                'variant_count': 0\n            }\n        }\n    else:\n        for csv_file in drug_csv_files:\n            logger.info(f"Processing drug file: {csv_file}")\n            file_drugs = process_drug_data(csv_file)\n            drugs.update(file_drugs)\n    \n    # Update drug variant counts\n    for variant_data in variants.values():\n        for drug in variant_data['drugs_tested']:\n            if drug in drugs:\n                drugs[drug]['variant_count'] += 1\n    \n    # Save individual variant datacards\n    if variants:\n        save_variant_datacards(variants, variants_dir)\n    \n    logger.info(f"Processed {len(variants)} variants and {len(drugs)} drugs")\n    logger.info("Data processing completed successfully!")\n\nif __name__ == "__main__":\n    main()