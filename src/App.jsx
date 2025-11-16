import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './components/HomePage'
import DrugTable from './components/DrugTable'
import VariantCard from './components/VariantCard'
import CompareView from './components/CompareView'
import './css/App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drugs" element={<DrugTable />} />
        <Route path="/variant/:gene/:variant" element={<VariantCard />} />
        <Route path="/compare" element={<CompareView />} />
      </Routes>
    </Layout>
  )
}

export default App