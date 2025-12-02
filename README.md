# Atlas BioTech - Mutation Database Platform

🧬 Interactive web platform for querying mutational data, viewing IC50 summaries, and exploring 3D protein structures for drug resistance variants.

## Features

- **Global Search**: Search by gene symbol, variant notation (e.g., EGFR p.L858R), or drug name
- **Drug Table**: Browse FDA approved drugs with resistance profiles
- **Variant Datacards**: Detailed mutation information with IC50 values, plots, and 3D structures
- **3D Structure Viewer**: Mol* integration for protein structure visualization

## Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- Git

### Development Setup

1. **Clone and setup**:
   ```bash
   git clone <your-repo-url>
   cd AtlasBioTech
   npm install
   ```

2. **Setup Python environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

3. **Add your data**:
   - Place CSV files in `data/raw/`
   - Run data processing: `python data-pipeline/scripts/process_data.py`
   - Build search index: `python data-pipeline/scripts/build_search_index.py`

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Production Build

```bash
npm run build
npm run preview
```

## Data Format

### CSV Input Format

**Variant Data** (`data/raw/variants.csv`):
```csv
gene,variant_string,protein_change,transcript_id,position,consequence,ic50,ic50_wt,fold_change,drug,model_system,publication_doi
EGFR,L858R,p.L858R,ENST00000275493,858,missense_variant,1250,45,27.8,Imatinib,Ba/F3 cells,10.1038/example.2024
```

**Drug Data** (`data/raw/drugs.csv`):
```csv
name,synonyms,fda_status,target_class,mechanism
Imatinib,"Gleevec,STI571",Approved,Tyrosine kinase inhibitor,BCR-ABL inhibitor
```

### JSON Output Structure

Processed data is stored in `data/v1.0/`:
- `search_index.json` - Global search index
- `variants/{GENE}/{VARIANT}.json` - Individual variant datacards

## Deployment

### GitHub Pages

1. **Configure repository settings**:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`

2. **Update package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/AtlasBioTech"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

   Or use GitHub Actions (configured in `.github/workflows/deploy.yml`)

## Project Structure

```
📁 AtlasBioTech/
├── 📁 data/
│   ├── 📁 raw/           # Input CSV files
│   └── 📁 v1.0/          # Processed JSON data
├── 📁 data-pipeline/
│   ├── 📁 config/        # JSON schemas
│   └── 📁 scripts/       # Data processing scripts
├── 📁 src/
│   ├── 📁 components/    # React components
│   ├── 📁 css/          # Stylesheets
│   └── 📄 App.jsx       # Main app component
├── 📁 .github/workflows/ # CI/CD configuration
├── 📄 package.json      # Dependencies and scripts
├── 📄 vite.config.js    # Build configuration
└── 📄 index.html        # Entry point
```

## Development

### Adding New Data

1. Add CSV files to `data/raw/`
2. Run validation: `python data-pipeline/scripts/validate_data.py`
3. Process data: `python data-pipeline/scripts/process_data.py`
4. Build index: `python data-pipeline/scripts/build_search_index.py`
5. Rebuild site: `npm run build`

### Customization

- **Styling**: Edit files in `src/css/`
- **Components**: Add/modify React components in `src/components/`
- **Data Schema**: Update JSON schemas in `data-pipeline/config/`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions or support, please contact Ian Sitarik at Mesolyte LLC.# Updated Mon Dec  1 22:25:26 EST 2025
