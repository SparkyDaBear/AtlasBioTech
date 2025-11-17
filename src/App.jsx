import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './components/HomePage'
import DrugTable from './components/DrugTable'
import VariantCard from './components/VariantCard'
import './css/App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/variant/:gene/:id" element={<VariantCard />} />
        <Route path="/drugs" element={<DrugTable />} />
      </Routes>
    </Layout>
  )
}

export default App