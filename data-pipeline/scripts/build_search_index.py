#!/usr/bin/env python3
"""
Search index builder for Atlas BioTech mutation database.
Creates searchable index from processed variant and drug data.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime, timezone
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def collect_genes_from_variants(variants_dir):
    """Extract gene information from variant files."""
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
                            'fda_status': 'Experimental',
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
    variants_dir = project_root / "data" / "v1.0" / "variants"
    output_file = project_root / "data" / "v1.0" / "search_index.json"
    
    logger.info("Building search index...")
    
    # For now, create a basic search index with default drugs
    default_drugs = [
        {
            'name': 'Imatinib',
            'synonyms': ['Gleevec', 'STI571'],
            'fda_status': 'Approved',
            'target_class': 'Tyrosine kinase inhibitor',
            'mechanism': 'BCR-ABL, KIT, PDGFR inhibitor',
            'variant_count': 0
        },
        {
            'name': 'Dasatinib',
            'synonyms': ['Sprycel', 'BMS-354825'],
            'fda_status': 'Approved',
            'target_class': 'Tyrosine kinase inhibitor',
            'mechanism': 'BCR-ABL, SRC family inhibitor',
            'variant_count': 0
        },
        {
            'name': 'Nilotinib',
            'synonyms': ['Tasigna', 'AMN107'],
            'fda_status': 'Approved',
            'target_class': 'Tyrosine kinase inhibitor',
            'mechanism': 'BCR-ABL inhibitor',
            'variant_count': 0
        }
    ]
    
    # Collect genes and drugs if variants exist
    genes_data, drugs_data, variants_data = collect_genes_from_variants(variants_dir)
    
    # Merge with default FDA approved drugs, keeping higher variant counts
    all_drugs = list(default_drugs)
    for drug_name, drug_info in drugs_data.items():
        # Check if this drug already exists in default_drugs
        existing_drug = None
        for i, default_drug in enumerate(all_drugs):
            if default_drug['name'] == drug_name:
                existing_drug = i
                break
        
        if existing_drug is not None:
            # Update variant count for existing drug
            all_drugs[existing_drug]['variant_count'] = drug_info['variant_count']
        else:
            # Add new drug from data
            all_drugs.append(drug_info)
    
    # Build final search index
    search_index = {
        'genes': list(genes_data.values()),
        'drugs': all_drugs,
        'variants': variants_data,
        'lastUpdate': datetime.now(timezone.utc).isoformat(),
        'stats': {
            'total_genes': len(genes_data),
            'total_drugs': len(all_drugs),
            'total_variants': len(variants_data)
        }
    }
    
    # Create output directory if needed
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Save search index
    with open(output_file, 'w') as f:
        json.dump(search_index, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Search index saved: {output_file}")
    logger.info(f"Index contains: {len(genes_data)} genes, {len(default_drugs)} drugs, {len(variants_data)} variants")

if __name__ == "__main__":
    main()