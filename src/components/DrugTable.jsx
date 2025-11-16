import React, { useState, useEffect, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { Download, Filter, TrendingUp } from 'lucide-react'

const DrugTable = () => {
  const [rowData, setRowData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterText, setFilterText] = useState('')

  useEffect(() => {
    // Load drug data from search index
    fetch(`${import.meta.env.BASE_URL}data/v1.0/search_index.json`)
      .then(res => res.json())
      .then(data => {
        setDrugs(data.drugs)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading drug data:', err)
        setLoading(false)
      })
  }, [])

  const columnDefs = useMemo(() => [
    {
      headerName: 'Drug Name',
      field: 'name',
      sortable: true,
      filter: true,
      pinned: 'left',
      width: 150,
      cellRenderer: (params) => (
        <div className="font-medium text-primary">{params.value}</div>
      )
    },
    {
      headerName: 'FDA Status',
      field: 'fda_status',
      sortable: true,
      filter: true,
      width: 120,
      cellRenderer: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value === 'Approved' ? 'bg-green-100 text-green-800' :
          params.value === 'Investigational' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {params.value}
        </span>
      )
    },
    {
      headerName: 'Target Class',
      field: 'target_class',
      sortable: true,
      filter: true,
      width: 140
    },
    {
      headerName: 'Mechanism',
      field: 'mechanism',
      sortable: true,
      filter: true,
      width: 180,
      tooltipField: 'mechanism'
    },
    {
      headerName: 'Tested Variants',
      field: 'variant_count',
      sortable: true,
      filter: 'agNumberColumnFilter',
      width: 130,
      cellRenderer: (params) => (
        <div className="text-center">
          <span className="font-medium">{params.value || 0}</span>
        </div>
      )
    },
    {
      headerName: 'Resistance Heat Map',
      field: 'resistance_profile',
      sortable: false,
      width: 180,
      cellRenderer: (params) => (
        <button className="btn btn-primary btn-sm">
          <TrendingUp size={14} />
          View Heat Map
        </button>
      )
    }
  ], [])

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true
  }), [])

  const exportData = () => {
    // Export functionality would be implemented here
    console.log('Export data:', rowData)
  }

  const filteredData = useMemo(() => {
    if (!filterText) return rowData
    return rowData.filter(row => 
      Object.values(row).some(value => 
        value && value.toString().toLowerCase().includes(filterText.toLowerCase())
      )
    )
  }, [rowData, filterText])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg">Loading drug data...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          FDA Approved Drugs
        </h1>
        <p className="text-gray-600 mb-6">
          Comprehensive database of FDA approved drugs with resistance profiles and variant testing data.
        </p>
        
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Filter size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Filter drugs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <button onClick={exportData} className="btn btn-secondary">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="data-table">
        <div className="ag-theme-alpine" style={{ height: '600px' }}>
          <AgGridReact
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            animateRows={true}
            rowSelection="single"
            suppressRowClickSelection={true}
          />
        </div>
      </div>
    </div>
  )
}

export default DrugTable