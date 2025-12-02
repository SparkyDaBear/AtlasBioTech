# Atlas BioTech - Mutation Database Platform

🧬 Interactive web platform for querying mutational data, viewing IC50 summaries, dose-response plots, and exploring 3D protein structures for drug resistance variants.

## Features

- **Global Search**: Search by gene symbol, variant notation (e.g., BCR-ABL p.T267N), or drug name
- **Drug Table**: Browse FDA approved drugs with resistance profiles  
- **Variant Datacards**: Detailed mutation information with IC50 values, interactive dose-response plots, and 3D structures
- **Dose-Response Visualization**: Interactive D3.js plots with 95% confidence intervals showing experimental data
- **Multi-Drug Support**: Compare dose-response curves across multiple drugs (Imatinib, Hollyniacine)
- **3D Structure Viewer**: Mol* integration for protein structure visualization
- **Amino Acid Heatmap**: Position-based mutation frequency visualization

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

- **56,700+ experimental measurements** from deep mutational scanning
- **3,136 BCR-ABL variants** with dose-response data
- **Multiple drugs**: Imatinib, Hollyniacine  
- **Cell lines**: K562, K12
- **Concentration ranges**: 5-100 nM with biological replicates

### CSV Input Format

**Master Dataset** (`data/raw/master_qDMS_df.csv`):
```csv
Gene,variant_string,Drug,Cell_line,conc,netgr_obs,replicate
BCR-ABL,T267N,Imatinib,K562,5,0.127941964,1
BCR-ABL,T267N,Imatinib,K562,30,0.076598512,1
BCR-ABL,T267N,Imatinib,K562,100,0.053539936,1
```

### JSON Output Structure

Processed data is stored in `public/data/v1.0/`:
- `search_index.json` - Global search index with 3,136 variants
- `heatmap_data.json` - Amino acid position-based mutation data
- `variants/` - Individual variant JSON files with dose-response data
- `assets/plots/` - Generated visualization assets

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
│   └── 📁 raw/           # Input CSV files (master_qDMS_df.csv)
├── 📁 public/data/v1.0/  # Processed JSON data & assets
│   ├── 📄 search_index.json
│   ├── 📄 heatmap_data.json
│   ├── 📁 variants/      # Individual variant JSON files (3,136)
│   └── 📁 assets/        # Generated plots and visualizations
├── 📁 data-pipeline/
│   ├── 📁 config/        # JSON schemas (variant_schema.json, etc.)
│   ├── 📁 scripts/       # Data processing (process_data.py, etc.)
│   └── 📁 tests/         # Data validation tests
├── 📁 src/
│   ├── 📁 components/    # React components
│   │   ├── 📄 VariantCard.jsx        # Variant detail pages
│   │   ├── 📄 DoseResponsePlot.jsx   # D3.js dose-response plots
│   │   ├── 📄 AminoAcidHeatMap.jsx   # Position heatmap
│   │   └── 📄 GlobalSearch.jsx       # Search functionality
│   ├── 📁 css/          # Stylesheets
│   └── 📄 App.jsx       # Main app component
├── 📁 .github/workflows/ # CI/CD (deploy.yml)
├── 📄 package.json      # Dependencies and scripts
├── 📄 vite.config.js    # Build configuration (base: '/AtlasBioTech/')
└── 📄 index.html        # Entry point
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

### Troubleshooting

**Common Issues:**
- **Plot not displaying**: Check browser console for data loading errors
- **Variant not found**: Ensure proper URL encoding (BCR-ABL → BCR%2DABL)
- **Build failures**: Verify all dependencies in `package.json` and `requirements.txt`
- **GitHub Actions**: Check workflow logs for data processing or deployment errors

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

**v2.0** (December 2025):
- ✅ Interactive dose-response plots with D3.js visualization
- ✅ Multi-drug comparison support (Imatinib, Hollyniacine)  
- ✅ Real experimental data integration (56,700+ measurements)
- ✅ Improved variant datacard layout and user experience
- ✅ Automated GitHub Actions deployment pipeline
- ✅ Enhanced search functionality with 3,136 BCR-ABL variants
