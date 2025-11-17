#!/usr/bin/env python3
"""
Data validation script for Atlas BioTech mutation database.
Validates CSV input files and JSON schemas.
"""

import os
import sys
import json
import pandas as pd
from pathlib import Path
from jsonschema import validate, ValidationError
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_schema(schema_path):
    """Load JSON schema from file."""
    try:
        with open(schema_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"Schema file not found: {schema_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON schema: {e}")
        sys.exit(1)

def validate_csv_structure(csv_path, required_columns):
    """Validate CSV file structure and required columns."""
    try:
        df = pd.read_csv(csv_path)
        
        # Check for required columns
        missing_cols = set(required_columns) - set(df.columns)
        if missing_cols:
            logger.error(f"Missing required columns in {csv_path}: {missing_cols}")
            return False
            
        # Check for empty dataframe
        if df.empty:
            logger.warning(f"CSV file is empty: {csv_path}")
            return False
            
        logger.info(f"CSV validation passed: {csv_path} ({len(df)} rows)")
        return True
        
    except FileNotFoundError:
        logger.error(f"CSV file not found: {csv_path}")
        return False
    except pd.errors.EmptyDataError:
        logger.error(f"CSV file is empty or invalid: {csv_path}")
        return False
    except Exception as e:
        logger.error(f"Error reading CSV {csv_path}: {e}")
        return False

def validate_json_against_schema(json_data, schema):
    """Validate JSON data against schema."""
    try:
        validate(json_data, schema)
        return True
    except ValidationError as e:
        logger.error(f"Schema validation failed: {e.message}")
        return False

def validate_gene_symbols(df):
    """Validate gene symbol format and consistency."""
    issues = []
    
    # Check gene symbol format
    if 'gene' in df.columns:
        invalid_genes = df[~df['gene'].str.match(r'^[A-Z0-9-]+$', na=False)]
        if not invalid_genes.empty:
            issues.append(f"Invalid gene symbols found: {invalid_genes['gene'].tolist()}")
    
    return issues

def validate_variant_notation(df):
    """Validate variant notation format."""
    issues = []
    
    if 'protein_change' in df.columns:
        # Check protein change format (p.AAAnnBBB)
        invalid_variants = df[~df['protein_change'].str.match(r'^p\.[A-Z][0-9]+[A-Z]$', na=False)]
        if not invalid_variants.empty:
            issues.append(f"Invalid protein change notation: {invalid_variants['protein_change'].tolist()}")
    
    return issues

def validate_ic50_values(df):
    """Validate IC50 values and related metrics."""
    issues = []
    
    # Check IC50 values are positive
    if 'ic50' in df.columns:
        negative_ic50 = df[df['ic50'] <= 0]
        if not negative_ic50.empty:
            issues.append(f"Non-positive IC50 values found: {len(negative_ic50)} rows")
    
    # Check fold change calculation
    if all(col in df.columns for col in ['ic50', 'ic50_wt', 'fold_change']):
        calculated_fold = df['ic50'] / df['ic50_wt']
        tolerance = 0.1  # 10% tolerance
        inconsistent = df[abs(calculated_fold - df['fold_change']) > tolerance * df['fold_change']]
        if not inconsistent.empty:
            issues.append(f"Inconsistent fold change calculations: {len(inconsistent)} rows")
    
    return issues

def main():
    """Main validation routine."""
    project_root = Path(__file__).parent.parent.parent
    data_dir = project_root / "data" / "raw"
    config_dir = project_root / "data-pipeline" / "config"
    
    logger.info("Starting data validation...")
    
    # Define required columns for different CSV types
    variant_csv_columns = [
        'gene', 'variant_string', 'protein_change', 'transcript_id', 
        'position', 'consequence', 'ic50', 'ic50_wt', 'fold_change',
        'drug', 'model_system'
    ]
    
    drug_csv_columns = [
        'name', 'synonyms', 'fda_status', 'target_class', 'mechanism'
    ]
    
    # Load schemas
    variant_schema = load_schema(config_dir / "variant_schema.json")
    search_schema = load_schema(config_dir / "search_index_schema.json")
    
    validation_passed = True
    
    # Validate existing search index if it exists
    search_index_path = project_root / "public" / "data" / "v1.0" / "search_index.json"
    if search_index_path.exists():
        logger.info("Validating existing search index...")
        with open(search_index_path, 'r') as f:
            search_data = json.load(f)
        
        if not validate_json_against_schema(search_data, search_schema):
            validation_passed = False
    
    # Look for CSV files in data/raw directory
    if data_dir.exists():
        csv_files = list(data_dir.glob("*.csv"))
        
        if not csv_files:
            logger.warning("No CSV files found in data/raw directory")
        else:
            for csv_file in csv_files:
                logger.info(f"Validating CSV file: {csv_file}")
                
                # Determine file type and validate accordingly
                if 'variant' in csv_file.name.lower() or 'mutation' in csv_file.name.lower():
                    if not validate_csv_structure(csv_file, variant_csv_columns):
                        validation_passed = False
                        continue
                    
                    # Additional variant-specific validation
                    df = pd.read_csv(csv_file)
                    
                    issues = []
                    issues.extend(validate_gene_symbols(df))
                    issues.extend(validate_variant_notation(df))
                    issues.extend(validate_ic50_values(df))
                    
                    if issues:
                        logger.error(f"Data quality issues in {csv_file}:")
                        for issue in issues:
                            logger.error(f"  - {issue}")
                        validation_passed = False
                    
                elif 'drug' in csv_file.name.lower():
                    if not validate_csv_structure(csv_file, drug_csv_columns):
                        validation_passed = False
    else:
        logger.info("No raw data directory found - skipping CSV validation")
    
    if validation_passed:
        logger.info("✅ All validation checks passed!")
        sys.exit(0)
    else:
        logger.error("❌ Validation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()