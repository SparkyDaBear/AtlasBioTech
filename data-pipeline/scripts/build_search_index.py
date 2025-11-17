#!/usr/bin/env python3
"""
Search index builder for Atlas BioTech mutation database.
Creates searchable index from processed variant and drug data.
"""

import os
import sys
import json
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def process_csv_data(csv_path):
    """Extract genes, drugs, and variant info from CSV data."""
    if not csv_path.exists():
        logger.warning(f"CSV file not found: {csv_path}")
        return {}, {}, []
    
    logger.info(f"Processing CSV data from: {csv_path}")
    
    try:
        # Load CSV data
        df = pd.read_csv(csv_path)
        
        # Extract unique drugs
        drugs = {}
        unique_drugs = df['Drug'].unique() if 'Drug' in df.columns else []
        
        for drug in unique_drugs:
            drug_variants = df[df['Drug'] == drug]
            variant_count = len(drug_variants)
            
            # Create drug entry with basic information
            drugs[drug] = {
                'name': drug,
                'synonyms': [],
                'fda_status': 'Investigational',  # Default status
                'target_class': 'Unknown',
                'mechanism': 'Unknown',
                'variant_count': variant_count
            }
            
            # Add known drug information
            if drug == 'Imatinib':
                drugs[drug].update({
                    'synonyms': ['Gleevec', 'STI571'],
                    'fda_status': 'Approved',
                    'target_class': 'Tyrosine kinase inhibitor',
                    'mechanism': 'BCR-ABL, KIT, PDGFR inhibitor'
                })
            elif drug == 'Dasatinib':
                drugs[drug].update({
                    'synonyms': ['Sprycel', 'BMS-354825'],
                    'fda_status': 'Approved',
                    'target_class': 'Tyrosine kinase inhibitor',
                    'mechanism': 'BCR-ABL, SRC, KIT inhibitor'
                })
            elif drug == 'Nilotinib':
                drugs[drug].update({
                    'synonyms': ['Tasigna', 'AMN107'],
                    'fda_status': 'Approved',
                    'target_class': 'Tyrosine kinase inhibitor',
                    'mechanism': 'BCR-ABL inhibitor'
                })
        
        # Extract unique genes
        genes = {}
        unique_genes = df['Gene'].unique() if 'Gene' in df.columns else []
        
        for gene in unique_genes:
            gene_variants = df[df['Gene'] == gene]
            variant_count = len(gene_variants)
            
            genes[gene] = {
                'symbol': gene,
                'name': f'{gene} gene',
                'synonyms': [],
                'chromosome': '',
                'variant_count': variant_count
            }
        
        # Create variant entries for search
        variants = []
        for _, row in df.iterrows():
            if pd.notna(row.get('ref_aa')) and pd.notna(row.get('alt_aa')) and pd.notna(row.get('protein_start')):
                variant_id = f"{row.get('ref_aa', '')}{row.get('protein_start', '')}{row.get('alt_aa', '')}"
                protein_change = f"p.{row.get('ref_aa', '')}{row.get('protein_start', '')}{row.get('alt_aa', '')}"
                variants.append({
                    'gene': row.get('Gene', ''),
                    'variant_string': variant_id,
                    'protein_change': protein_change,
                    'consequence': 'missense_variant',
                    'drugs_tested': [row.get('Drug', '')]
                })
        
        logger.info(f"Processed {len(genes)} genes, {len(drugs)} drugs, {len(variants)} variants from CSV")
        return genes, drugs, variants
        
    except Exception as e:
        logger.error(f"Error processing CSV: {str(e)}")
        return {}, {}, []

def collect_genes_from_variants(variants_dir):
    """Extract gene information from variant files (legacy)."""
    genes = {}
    drugs = {}
    variants = []
    
    if not variants_dir.exists():
        logger.warning(f"Variants directory not found: {variants_dir}")
        return {}, {}, []
    
    # Walk through gene directories
    for gene_dir in variants_dir.iterdir():
        if not gene_dir.is_dir():
            continue
        
        gene_symbol = gene_dir.name
        variant_count = 0
        
        # Process variants for this gene
        for variant_file in gene_dir.glob("*.json"):
            variant_count += 1
            
            # Load variant data for search index
            try:
                with open(variant_file, 'r') as f:
                    variant_data = json.load(f)
                
                # Collect drugs from variant data
                for drug in variant_data.get('drugs_tested', []):
                    if drug not in drugs:
                        drugs[drug] = {
                            'name': drug,
                            'synonyms': [],
                            'fda_status': 'Investigational',
                            'target_class': 'Unknown',
                            'mechanism': 'Unknown',
                            'variant_count': 0
                        }
                    drugs[drug]['variant_count'] += 1
                
                # Create search-optimized variant entry
                variants.append({
                    'gene': gene_symbol,
                    'variant_string': variant_data.get('variant_string', ''),
                    'protein_change': variant_data.get('protein_change', ''),
                    'ic50': variant_data.get('ic50_estimate', 'N/A'),
                    'qc_pass': variant_data.get('qc_pass', False),
                    'searchable_text': f"{gene_symbol} {variant_data.get('variant_string', '')} {variant_data.get('protein_change', '')}"
                })
            except Exception as e:
                logger.warning(f"Failed to process variant file {variant_file}: {e}")
        
        if variant_count > 0:
            genes[gene_symbol] = {
                'symbol': gene_symbol,
                'name': f'{gene_symbol} gene',
                'synonyms': [],
                'chromosome': '',
                'variant_count': variant_count
            }
    
    return genes, drugs, variants

def main():
    """Main search index building routine."""
    project_root = Path(__file__).parent.parent.parent
    variants_dir = project_root / "public" / "data" / "v1.0" / "variants"
    csv_path = project_root / "data" / "raw" / "k562_asc_screen_ngr_051024.csv"
    output_file = project_root / "public" / "data" / "v1.0" / "search_index.json"
    
    logger.info("Building search index...")
    
    # First try to process CSV data
    genes, drugs, variants = process_csv_data(csv_path)
    
    # If CSV processing didn't yield results, fall back to variant files
    if not genes and not drugs:
        logger.info("No CSV data found, falling back to variant files...")
        genes, drugs, variants = collect_genes_from_variants(variants_dir)
    
    # Add default drugs if none found
    if not drugs:
        logger.info("No drugs found, adding defaults...")
        drugs = {
            'Imatinib': {
                'name': 'Imatinib',
                'synonyms': ['Gleevec', 'STI571'],
                'fda_status': 'Approved',
                'target_class': 'Tyrosine kinase inhibitor',
                'mechanism': 'BCR-ABL, KIT, PDGFR inhibitor',
                'variant_count': 0
            },
            'Dasatinib': {
                'name': 'Dasatinib',
                'synonyms': ['Sprycel', 'BMS-354825'],
                'fda_status': 'Approved',
                'target_class': 'Tyrosine kinase inhibitor',
                'mechanism': 'BCR-ABL, SRC, KIT inhibitor',
                'variant_count': 0
            },
            'Nilotinib': {
                'name': 'Nilotinib',
                'synonyms': ['Tasigna', 'AMN107'],
                'fda_status': 'Approved',
                'target_class': 'Tyrosine kinase inhibitor',
                'mechanism': 'BCR-ABL inhibitor',
                'variant_count': 0
            }
        }
    
    # Build final search index
    search_index = {
        'genes': list(genes.values()),
        'drugs': list(drugs.values()),
        'variants': variants,
        'lastUpdate': datetime.now(timezone.utc).isoformat(),
        'stats': {
            'total_genes': len(genes),
            'total_drugs': len(drugs),
            'total_variants': len(variants)
        }
    }
    
    # Create output directory if needed
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Save search index
    with open(output_file, 'w') as f:
        json.dump(search_index, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Search index saved: {output_file}")
    logger.info(f"Index contains: {len(genes)} genes, {len(drugs)} drugs, {len(variants)} variants")

if __name__ == "__main__":
    main()