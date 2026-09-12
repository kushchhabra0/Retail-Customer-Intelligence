import React, { useState, useEffect } from 'react';
import './App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import Header from './components/Header';
import KpiSummary from './components/KpiSummary';
import OverviewTab from './components/OverviewTab';
import ProductParetoTab from './components/ProductParetoTab';
import CustomerSegmentationTab from './components/CustomerSegmentationTab';
import CohortRetentionTab from './components/CohortRetentionTab';
import AnalyticalFindingsTab from './components/AnalyticalFindingsTab';
import { IconDatabase } from './components/Icons';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Currency formatting utility
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);
};

// Number formatting utility
const formatNumber = (val) => {
  if (val === undefined || val === null) return '0';
  return val.toLocaleString();
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datasets
  const [kpis, setKpis] = useState(null);
  const [countrySales, setCountrySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [paretoProducts, setParetoProducts] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [cohortRetention, setCohortRetention] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          kpisRes,
          countryRes,
          monthlyRes,
          productRes,
          paretoRes,
          segmentsRes,
          cohortsRes
        ] = await Promise.all([
          fetch('/data/kpi_summary.json').then((r) => r.json()),
          fetch('/data/country_performance.json').then((r) => r.json()),
          fetch('/data/monthly_sales.json').then((r) => r.json()),
          fetch('/data/product_performance.json').then((r) => r.json()),
          fetch('/data/pareto_products.json').then((r) => r.json()),
          fetch('/data/customer_segments.json').then((r) => r.json()),
          fetch('/data/cohort_retention.json').then((r) => r.json())
        ]);

        setKpis(kpisRes[0]);
        setCountrySales(countryRes);
        setMonthlySales(monthlyRes);
        setProductSales(productRes);
        setParetoProducts(paretoRes);
        setCustomerSegments(segmentsRes);
        setCohortRetention(cohortsRes);
        setLoading(false);
      } catch (err) {
        console.error("Error loading dashboard analytics data:", err);
        setError("Failed to load pre-computed analytics JSON datasets. Ensure python/export_data.py was executed.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-state-container">
        <div className="loading-card">
          <IconDatabase size={24} className="spin-icon" />
          <h3 className="loading-title">Connecting to DuckDB Engine</h3>
          <p className="loading-sub">Loading analytical data models and pre-computed pipeline datasets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-state-container">
        <div className="error-card">
          <h3 className="error-title">Data Ingestion Error</h3>
          <p className="error-sub">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* HEADER & TOP NAVIGATION */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="app-main-content">
        {/* COMPACT KPI METRICS STRIP */}
        <KpiSummary kpis={kpis} formatCurrency={formatCurrency} formatNumber={formatNumber} />

        {/* ACTIVE TAB CONTENT */}
        <div className="tab-content-wrapper mt-6">
          {activeTab === 'overview' && (
            <OverviewTab
              kpis={kpis}
              monthlySales={monthlySales}
              countrySales={countrySales}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          )}

          {activeTab === 'products' && (
            <ProductParetoTab
              productSales={productSales}
              paretoProducts={paretoProducts}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerSegmentationTab
              customerSegments={customerSegments}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          )}

          {activeTab === 'cohorts' && (
            <CohortRetentionTab
              cohortRetention={cohortRetention}
              formatNumber={formatNumber}
            />
          )}

          {activeTab === 'findings' && (
            <AnalyticalFindingsTab
              kpis={kpis}
              customerSegments={customerSegments}
              formatCurrency={formatCurrency}
              formatNumber={formatNumber}
            />
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="enterprise-footer">
        <div className="footer-content">
          <span>Retail Sales &amp; Customer Intelligence Platform &bull; Medallion Architecture</span>
          <span className="footer-muted">React 19 &bull; Vite &bull; DuckDB &bull; Chart.js &bull; Python Data Science</span>
        </div>
      </footer>
    </div>
  );
}
