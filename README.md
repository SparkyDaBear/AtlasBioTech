# Atlas BioTech - Mutation Database Platform

🧬 Interactive web platform for querying mutational data, viewing IC50 summaries, dose-response plots, and exploring 3D protein structures for drug resistance variants.

## Features

- **Global Search**: Search by gene symbol, variant notation (e.g., BCR-ABL p.T267N), or drug name
- **Drug Database**: Browse drugs with resistance profiles (FDA approved and investigational)
- **Variant Datacards**: Detailed mutation information with IC50 values, interactive dose-response plots, and 3D structures
- **Dose-Response Visualization**: Interactive D3.js plots with 95% confidence intervals, 10% axis padding, and error bars
- **Interactive Data Tables**: Sortable, filterable tables with dose-response values using AG-Grid
- **Multi-Drug Support**: Compare dose-response curves across multiple drugs (Imatinib, Hollyniacine)
- **3D Structure Viewer**: Mol* integration for protein structure visualization
- **Amino Acid Heatmap**: Drug-specific position × amino acid heatmaps with concentration toggles
- **Drug Navigation**: Click "View Heat Map" in drug table to navigate directly to protein page with drug pre-selected

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.12+
- Git

### Development Setup

1. **Clone and setup**:
   ```bash
   git clone https://github.com/SparkyDaBear/AtlasBioTech.git
   cd AtlasBioTech
   npm install
   ```

2. **Setup Python environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

3. **Process data** (CSV files are included):
   ```bash
   python data-pipeline/scripts/process_data.py
   python data-pipeline/scripts/build_search_index.py
   python data-pipeline/scripts/generate_heatmap_data.py
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Production Build

```bash
npm run build
npm run preview
```

## Data Overview

### Current Dataset

- **39,384 experimental measurements** from deep mutational scanning
- **4,923 unique BCR-ABL variants** with dose-response data
- **1 drug**: Imatinib (FDA Approved)
- **Cell line**: BaF3
- **Concentration ranges**: 0, 300, 600, 1200 nM with biological replicates (2 replicates per condition)

### Raw Data Files (`data/raw/`)

**Master Dataset** (`master_qDMS_df.csv` - 3.9 MB):
```csv
species,type,synSNP,ref_aa,protein_start,alt_aa,conc,netgr_obs,cell_line,rep,Gene,Drug
I242A,mnv,FALSE,I,242,A,0,0.02150498,BaF3,1,BCR-ABL,Imatinib
I242C,mnv,FALSE,I,242,C,0,0.028109973,BaF3,1,BCR-ABL,Imatinib
```

**Protein Metadata** (`protein_metadata.json` - 5.8 KB):
- Gene information, descriptions, clinical significance
- External links (UniProt, PDB, AlphaFold, etc.)
- Drug resistance mechanisms

**Protein Structure** (`BCR-ABL.pdb` - 711 KB):
- 3D structure file for BCR-ABL kinase domain
- Used for Mol* structure visualization

### JSON Output Structure

Processed data is stored in `public/data/v1.0/`:
- `search_index.json` - Global search index with 4,923 variants and 1 drug
- `heatmap_data.json` - Drug-specific position × amino acid matrices
- `protein_metadata.json` - Copy of protein information for web access
- `variants/` - 4,923 individual variant JSON files with dose-response data
- `assets/plots/` - Generated visualization assets (if any)

## Deployment

### GitHub Pages (Automated)

The site is automatically deployed via GitHub Actions when pushing to the `main` branch:

1. **Data Processing**: Validates and processes CSV data to JSON
2. **Search Index**: Builds searchable index of all variants and drugs  
3. **React Build**: Compiles the frontend application for production
4. **GitHub Pages**: Deploys to `https://sparkydabear.github.io/AtlasBioTech/`

Manual deployment trigger:
```bash
git commit --allow-empty -m "trigger: Deploy latest changes"
git push
```

### Local Production Build

```bash
npm run build    # Build for production
npm run preview  # Preview production build locally
```

## Project Structure

```
📁 AtlasBioTech/
├── 📁 data/
│   └── 📁 raw/                        # Raw input files (not committed to build)
│       ├── 📄 master_qDMS_df.csv      # Main dataset (3.9 MB, 56,700 rows)
│       ├── 📄 protein_metadata.json   # Gene/protein annotations (5.8 KB)
│       └── 📄 BCR-ABL.pdb             # Protein structure (711 KB)
├── 📁 public/data/v1.0/               # Processed JSON data & assets
│   ├── 📄 search_index.json           # Search index (genes, drugs, variants)
│   ├── 📄 heatmap_data.json           # Drug-specific heatmap matrices
│   ├── 📄 protein_metadata.json       # Protein info for web access
│   ├── 📁 variants/                   # Individual variant JSON files (3,137)
│   └── 📁 assets/                     # Generated plots and visualizations
│       └── 📁 plots/                  # Static dose-response plots (optional)
├── 📁 data-pipeline/
│   ├── 📁 config/                     # JSON schemas
│   │   ├── 📄 variant_schema.json
│   │   ├── 📄 search_index_schema.json
│   │   └── 📄 heatmap_schema.json
│   ├── 📁 scripts/                    # Data processing scripts
│   │   ├── 📄 process_data.py         # CSV → variant JSON files
│   │   ├── 📄 build_search_index.py   # Build search index
│   │   ├── 📄 generate_heatmap_data.py # Generate heatmap matrices
│   │   └── 📄 validate_data.py        # Schema validation
│   └── 📁 tests/                      # Data validation tests
├── 📁 src/
│   ├── 📁 components/                 # React components
│   │   ├── 📄 HomePage.jsx            # Landing page with search
│   │   ├── 📄 GlobalSearch.jsx        # Search functionality
│   │   ├── 📄 DrugTable.jsx           # Drug database table
│   │   ├── 📄 ProteinPage.jsx         # Protein overview page
│   │   ├── 📄 ProteinOverview.jsx     # Protein metadata display
│   │   ├── 📄 ProteinInteractiveView.jsx # 3D structure viewer
│   │   ├── 📄 VariantCard.jsx         # Variant detail pages
│   │   ├── 📄 DoseResponsePlot.jsx    # D3.js dose-response plots
│   │   ├── 📄 DoseResponseTable.jsx   # Interactive data table (AG-Grid)
│   │   ├── 📄 AminoAcidHeatMap.jsx    # Position × AA heatmap
│   │   ├── 📄 StructureViewer.jsx     # Mol* structure viewer
│   │   └── 📄 Layout.jsx              # Site layout/navigation
│   ├── 📁 css/                        # Stylesheets
│   │   ├── 📄 App.css
│   │   ├── 📄 index.css
│   │   └── 📄 AminoAcidHeatMap.css
│   ├── 📁 js/                         # JavaScript utilities
│   ├── 📄 App.jsx                     # Main app component with routing
│   └── 📄 main.jsx                    # React entry point
├── 📁 .github/workflows/              # CI/CD
│   └── 📄 deploy.yml                  # GitHub Actions deployment
├── 📄 package.json                    # Dependencies and scripts
├── 📄 vite.config.js                  # Build config (base: '/AtlasBioTech/')
├── 📄 requirements.txt                # Python dependencies
├── 📄 index.html                      # HTML entry point
└── 📄 README.md                       # This file
```

## Key Components

### Dose-Response Plots
- **Technology**: D3.js with React integration
- **Features**: Log-scale concentration axis, 95% confidence intervals, multi-drug comparison
- **Data**: Real experimental dose-response curves from deep mutational scanning
- **Interactivity**: Drug selection, zoom, responsive design

### Variant Datacards  
- **URL Format**: `/variant/BCR-ABL/T267N` (automatically URL-encoded)
- **Data Loading**: Dynamic JSON fetching with proper error handling
- **Layout**: Full-width dose-response plots with metadata panel
- **Real Data**: IC50 values, replicate data, QC flags

### Search System
- **Global Search**: Fuzzy matching across genes, variants, and drugs
- **Auto-complete**: Real-time suggestions with result previews
- **URL Routing**: Direct links to variants, proteins, and drug tables

## Development

### Data Pipeline

1. **Validate data**: `python data-pipeline/scripts/validate_data.py`
2. **Process variants**: `python data-pipeline/scripts/process_data.py` 
   - Converts CSV to 3,136 individual variant JSON files
   - Calculates IC50 values and dose-response curves
   - Handles multiple drugs and cell lines
3. **Build search index**: `python data-pipeline/scripts/build_search_index.py`
4. **Generate heatmap**: `python data-pipeline/scripts/generate_heatmap_data.py`

### Frontend Development

- **Hot Reload**: Changes automatically reflect in browser during `npm run dev`
- **Component Structure**: Modular React components with CSS modules
- **State Management**: React hooks for data fetching and UI state
- **Routing**: React Router for client-side navigation

### Adding New Features

- **New Visualizations**: Add D3.js components in `src/components/`
- **Data Processing**: Extend scripts in `data-pipeline/scripts/`
- **Styling**: Update CSS files in `src/css/` or component-specific styles
- **API Extensions**: Add new data processing endpoints in the pipeline

## Technology Stack

- **Frontend**: React 18.2.0, Vite 5.4.21, D3.js 7.9.0
- **Styling**: CSS3, responsive design
- **Data Visualization**: D3.js for dose-response plots, custom heatmaps
- **3D Visualization**: Mol* (NGL) for protein structures  
- **Backend**: Python 3.12, Pandas, JSON processing
- **Deployment**: GitHub Actions, GitHub Pages
- **Development**: Node.js, NPM, Git

## Performance Notes

- **Large Dataset**: 56,700+ measurements processed into efficient JSON structure
- **Lazy Loading**: Variant data loaded on-demand via fetch requests
- **Caching**: Browser caching for static JSON files and assets
- **Build Optimization**: Vite bundling with code splitting (chunks >500KB noted)

## Data Quality

- **Validation**: JSON schema validation for all processed data
- **QC Flags**: Quality control indicators in variant data
- **Replicates**: Biological replicate data with statistical analysis
- **Error Handling**: Graceful fallbacks for missing or invalid data

## License

MIT License - see LICENSE file for details.

## Contact

For questions or support, please contact:
- **Ian Sitarik** at Mesolyte LLC
- **Repository**: https://github.com/SparkyDaBear/AtlasBioTech
- **Live Site**: https://sparkydabear.github.io/AtlasBioTech/

## Recent Updates

**v2.1** (December 2025):
- ✅ Added interactive data tables with sortable/filterable columns (AG-Grid)
- ✅ Improved dose-response plots with 10% axis padding and error bar range calculation
- ✅ Drug-specific heatmap matrices (separate data for Imatinib and Hollyniacine)
- ✅ Drug selector controls on heatmap with FDA approval status indicators
- ✅ Clickable "View Heat Map" buttons in drug table with URL parameter navigation
- ✅ Fixed Back button to use browser history instead of always going home
- ✅ Updated drug count display (now correctly shows 2 drugs)
- ✅ Renamed "FDA Approved Drugs" to "Drug Database" for accuracy
- ✅ Fixed blank page issue when loading protein page with drug parameter

**v2.0** (December 2025):
- ✅ Interactive dose-response plots with D3.js visualization
- ✅ Multi-drug comparison support (Imatinib, Hollyniacine)  
- ✅ Real experimental data integration (56,700+ measurements)
- ✅ Improved variant datacard layout and user experience
- ✅ Automated GitHub Actions deployment pipeline
- ✅ Enhanced search functionality with 3,136 BCR-ABL variants
