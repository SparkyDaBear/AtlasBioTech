import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const DoseResponseTable = ({ data, selectedDrugs = [] }) => {
  // Process data to calculate mean, std, and CI for display
  const tableData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const processedData = [];
    
    selectedDrugs.forEach(drug => {
      const drugData = data.filter(d => d.Drug === drug);
      
      // Group by concentration
      const concentrations = [...new Set(drugData.map(d => +d.conc))].sort((a, b) => a - b);
      
      concentrations.forEach(conc => {
        const concData = drugData.filter(d => +d.conc === conc);
        const values = concData.map(d => +d.netgr_obs);
        
        if (values.length > 0) {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const std = Math.sqrt(variance);
          const n = values.length;
          
          // 95% CI calculation
          const tCritical = n <= 2 ? 12.706 : 2.262;
          const marginError = tCritical * (std / Math.sqrt(n));
          
          processedData.push({
            drug,
            concentration: conc,
            mean: mean,
            std: std,
            lowerCI: mean - marginError,
            upperCI: mean + marginError,
            n: n,
            rep1: values[0] !== undefined ? values[0] : null,
            rep2: values[1] !== undefined ? values[1] : null
          });
        }
      });
    });

    return processedData;
  }, [data, selectedDrugs]);

  // Column definitions
  const columnDefs = [
    {
      field: 'drug',
      headerName: 'Drug',
      sortable: true,
      filter: true,
      width: 150,
      pinned: 'left'
    },
    {
      field: 'concentration',
      headerName: 'Concentration (nM)',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 160,
      valueFormatter: params => params.value ? `${params.value.toFixed(1)} nM` : ''
    },
    {
      field: 'mean',
      headerName: 'Mean netGR',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      valueFormatter: params => params.value !== null ? params.value.toFixed(4) : 'N/A',
      cellStyle: { fontWeight: '500' }
    },
    {
      field: 'std',
      headerName: 'Std Dev',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 120,
      valueFormatter: params => params.value !== null ? params.value.toFixed(4) : 'N/A'
    },
    {
      field: 'lowerCI',
      headerName: 'Lower 95% CI',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 140,
      valueFormatter: params => params.value !== null ? params.value.toFixed(4) : 'N/A'
    },
    {
      field: 'upperCI',
      headerName: 'Upper 95% CI',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 140,
      valueFormatter: params => params.value !== null ? params.value.toFixed(4) : 'N/A'
    },
    {
      field: 'rep1',
      headerName: 'Rep 1',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 110,
      valueFormatter: params => params.value !== null ? params.value.toFixed(4) : 'N/A',
      cellStyle: { color: '#6b7280' }
    },
    {
      field: 'rep2',
      headerName: 'Rep 2',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 110,
      valueFormatter: params => params.value !== null ? params.value.toFixed(4) : 'N/A',
      cellStyle: { color: '#6b7280' }
    },
    {
      field: 'n',
      headerName: 'N',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 80,
      headerTooltip: 'Number of replicates'
    }
  ];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true
  };

  if (tableData.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-600">
        No data available for selected drugs
      </div>
    );
  }

  return (
    <div className="dose-response-table" style={{ width: '100%', height: '400px' }}>
      <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
        <AgGridReact
          rowData={tableData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default DoseResponseTable;
