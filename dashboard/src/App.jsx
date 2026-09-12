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
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js elements
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

// Helper for formatting currencies
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);
};

// Helper for formatting numbers
const formatNumber = (val) => {
  if (val === undefined || val === null) return '0';
  return val.toLocaleString();
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard datasets
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
        // Fetch all pre-computed JSON files concurrently
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
        console.error("Error loading dashboard data:", err);
        setError("Failed to load pre-computed analytics files. Verify that 'python/export_data.py' was executed.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="db-badge">
          <div className="badge-dot"></div>
          <span>Loading Analytics Pipeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', color: '#ef4444' }}>
        <h2>Database Export Error</h2>
        <p style={{ marginTop: '1rem', color: '#8f9cae' }}>{error}</p>
      </div>
    );
  }

  // --- CHART CONFIGURATIONS ---

  // 1. Monthly Revenue Chart (Overview Tab)
  const monthlyRevenueData = {
    labels: monthlySales.map((d) => {
      const date = new Date(d.order_month);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    }),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlySales.map((d) => d.revenue),
        borderColor: '#4fa3ff',
        backgroundColor: 'rgba(79, 163, 255, 0.1)',
        borderWidth: 3,
        pointRadius: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: '3-Month Rolling Average',
        data: monthlySales.map((d) => d.rolling_avg_3m),
        borderColor: '#a855f7',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.3,
        fill: false
      }
    ]
  };

  const monthlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8f9cae', font: { family: 'Plus Jakarta Sans' } } }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8f9cae' } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8f9cae', callback: (v) => formatCurrency(v) } }
    }
  };

  // 2. Country Sales Chart (Overview Tab)
  const countrySalesData = {
    labels: countrySales.map((d) => d.country),
    datasets: [
      {
        label: 'Revenue by Country',
        data: countrySales.map((d) => d.total_revenue),
        backgroundColor: [
          '#00f2fe',
          '#4fa3ff',
          '#a855f7',
          '#f59e0b',
          '#10b981',
          '#ef4444',
          '#6b7280'
        ],
        borderWidth: 0,
        borderRadius: 6
      }
    ]
  };

  const countryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8f9cae' } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#8f9cae', callback: (v) => formatCurrency(v) } }
    }
  };

  // 3. Category Distribution Chart (Products Tab)
  // Aggregate categories
  const categories = [...new Set(productSales.map((p) => p.category))];
  const categoryRevenue = categories.map((cat) =>
    productSales.filter((p) => p.category === cat).reduce((sum, p) => sum + p.total_revenue, 0)
  );

  const categoryData = {
    labels: categories,
    datasets: [
      {
        data: categoryRevenue,
        backgroundColor: ['#4fa3ff', '#a855f7', '#00f2fe'],
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 2
      }
    ]
  };

  // 4. Customer Segments Sizes (Customers Tab)
  const segmentData = {
    labels: customerSegments.map((s) => s.segment_name),
    datasets: [
      {
        label: 'Customers Count',
        data: customerSegments.map((s) => s.customer_count),
        backgroundColor: ['#10b981', '#4fa3ff', '#f59e0b', '#ef4444'],
        borderWidth: 0,
        borderRadius: 8
      }
    ]
  };

  // 5. Customer Segment CLV vs Spending
  const segmentClvData = {
    labels: customerSegments.map((s) => s.segment_name),
    datasets: [
      {
        label: 'Avg Historical Spending',
        data: customerSegments.map((s) => s.avg_spending),
        backgroundColor: 'rgba(79, 163, 255, 0.4)',
        borderColor: '#4fa3ff',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Avg Lifetime Value (CLV)',
        data: customerSegments.map((s) => s.avg_clv),
        backgroundColor: 'rgba(168, 85, 247, 0.4)',
        borderColor: '#a855f7',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // --- RETENTION HEATMAP PROCESSING ---
  // Get unique cohorts (cohort_month)
  const cohorts = [...new Set(cohortRetention.map((c) => c.cohort_month))].sort();
  // Get max cohort index (number of columns)
  const maxIndex = Math.max(...cohortRetention.map((c) => c.cohort_index));
  const indices = Array.from({ length: maxIndex + 1 }, (_, i) => i);

  // Helper function to get cell data
  const getRetentionCell = (cohort, index) => {
    const record = cohortRetention.find(
      (r) => r.cohort_month === cohort && r.cohort_index === index
    );
    return record ? { pct: record.retention_pct, active: record.active_customers } : null;
  };

  // Function to get color based on retention rate
  const getCellColor = (pct) => {
    if (pct === undefined || pct === null) return 'transparent';
    if (pct === 100) return 'rgba(0, 242, 254, 0.25)'; // Month 0
    // Interpolate alpha from 0 to 0.8 based on retention percentage (max 50% for visibility scales)
    const alpha = Math.min(pct / 45, 0.85); 
    return `rgba(79, 163, 255, ${alpha})`;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-title-container">
          <h1>Retail Customer Intelligence</h1>
          <p>End-to-End Sales Performance, Cohort Retention, and Machine Learning Customer Segmentation</p>
        </div>
        <div className="db-badge">
          <div className="badge-dot"></div>
          <span>DuckDB Engine Connected</span>
        </div>
      </header>

      {/* KPI Row */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-val">{formatCurrency(kpis?.total_revenue)}</div>
          <div className="kpi-subtext">Cumulative sales amount</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-val">{formatNumber(kpis?.total_orders)}</div>
          <div className="kpi-subtext">Transactions completed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Customers</div>
          <div className="kpi-val">{formatNumber(kpis?.total_customers)}</div>
          <div className="kpi-subtext">Unique buying profiles</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Order Value (AOV)</div>
          <div className="kpi-val">{formatCurrency(kpis?.average_order_value)}</div>
          <div className="kpi-subtext">Mean invoice amount</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Repeat Customer Rate</div>
          <div className="kpi-val">{kpis?.repeat_rate_pct}%</div>
          <div className="kpi-subtext highlight">{formatNumber(kpis?.repeat_customers)} customers with &gt;1 orders</div>
        </div>
      </section>

      {/* Tabs Menu */}
      <nav className="app-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Executive Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Pareto
        </button>
        <button
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          ML Segmentation
        </button>
        <button
          className={`tab-btn ${activeTab === 'cohorts' ? 'active' : ''}`}
          onClick={() => setActiveTab('cohorts')}
        >
          Cohort Retention
        </button>
      </nav>

      {/* Main Panels */}
      <main className="app-content">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="panel">
            <div className="grid-2col">
              <div className="card">
                <div className="card-title">Monthly Revenue Trend &amp; Growth</div>
                <div className="chart-container">
                  <Line data={monthlyRevenueData} options={monthlyChartOptions} />
                </div>
              </div>
              <div className="card">
                <div className="card-title">Revenue by Country</div>
                <div className="chart-container">
                  <Bar data={countrySalesData} options={countryChartOptions} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="panel">
            <div className="grid-2col">
              <div className="card" style={{ flex: '1 1 35%' }}>
                <div className="card-title">Category Revenue Breakdown</div>
                <div className="chart-container" style={{ height: '280px' }}>
                  <Doughnut 
                    data={categoryData} 
                    options={{ 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { color: '#8f9cae' } } }
                    }} 
                  />
                </div>
              </div>
              <div className="card" style={{ flex: '1 1 65%' }}>
                <div className="card-title">Pareto Analysis: Top Products Driving 80% Revenue</div>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th style={{ textAlign: 'right' }}>Sales</th>
                        <th style={{ textAlign: 'right' }}>Contribution %</th>
                        <th style={{ textAlign: 'right' }}>Cumulative %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paretoProducts.map((p) => (
                        <tr key={p.rank}>
                          <td>#{p.rank}</td>
                          <td style={{ fontWeight: '600' }}>{p.product_name}</td>
                          <td>{p.category}</td>
                          <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>{formatCurrency(p.revenue)}</td>
                          <td style={{ textAlign: 'right' }}>{p.pct_contribution}%</td>
                          <td style={{ textAlign: 'right', fontWeight: p.cumulative_pct_contribution <= 80 ? 'bold' : 'normal' }}>
                            {p.cumulative_pct_contribution}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="panel">
            <div className="grid-2col">
              <div className="card">
                <div className="card-title">Customer Count by Segment (K-Means)</div>
                <div className="chart-container">
                  <Bar 
                    data={segmentData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { ticks: { color: '#8f9cae' } },
                        y: { ticks: { color: '#8f9cae' } }
                      }
                    }} 
                  />
                </div>
              </div>
              <div className="card">
                <div className="card-title">Historical Spending vs. Predicted CLV</div>
                <div className="chart-container">
                  <Bar 
                    data={segmentClvData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { labels: { color: '#8f9cae' } } },
                      scales: {
                        x: { ticks: { color: '#8f9cae' } },
                        y: { ticks: { color: '#8f9cae', callback: (v) => formatCurrency(v) } }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Segment Profiles Details</div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Segment</th>
                      <th style={{ textAlign: 'right' }}>Customer Count</th>
                      <th style={{ textAlign: 'right' }}>Avg Recency (Days)</th>
                      <th style={{ textAlign: 'right' }}>Avg Frequency (Orders)</th>
                      <th style={{ textAlign: 'right' }}>Avg Historical Spend</th>
                      <th style={{ textAlign: 'right' }}>Avg Predicted CLV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerSegments.map((s) => (
                      <tr key={s.segment_name}>
                        <td>
                          <span className={`segment-badge ${s.segment_name.toLowerCase().includes('champ') ? 'champions' : s.segment_name.toLowerCase().includes('loyal') ? 'loyal' : s.segment_name.toLowerCase().includes('risk') ? 'risk' : 'low'}`}>
                            {s.segment_name}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatNumber(s.customer_count)}</td>
                        <td style={{ textAlign: 'right' }}>{s.avg_recency} days</td>
                        <td style={{ textAlign: 'right' }}>{s.avg_frequency} orders</td>
                        <td style={{ textAlign: 'right', color: 'var(--color-primary)' }}>{formatCurrency(s.avg_spending)}</td>
                        <td style={{ textAlign: 'right', color: 'var(--color-accent)', fontWeight: 'bold' }}>{formatCurrency(s.avg_clv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COHORTS */}
        {activeTab === 'cohorts' && (
          <div className="panel">
            <div className="card">
              <div className="card-title">Cohort Retention Heatmap (%)</div>
              <div className="heatmap-scroll-container">
                <table className="heatmap-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', paddingLeft: '1rem' }}>Cohort Month</th>
                      <th>Size</th>
                      {indices.map((idx) => (
                        <th key={idx}>M{idx}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((cMonth) => {
                      const sizeRecord = cohortRetention.find((r) => r.cohort_month === cMonth && r.cohort_index === 0);
                      const size = sizeRecord ? sizeRecord.cohort_size : 0;
                      return (
                        <tr key={cMonth}>
                          <td className="heatmap-cohort">
                            {new Date(cMonth).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}
                          </td>
                          <td className="heatmap-size">{formatNumber(size)}</td>
                          {indices.map((idx) => {
                            const cell = getRetentionCell(cMonth, idx);
                            if (!cell) return <td key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>-</td>;
                            return (
                              <td
                                key={idx}
                                className="heatmap-cell"
                                style={{ backgroundColor: getCellColor(cell.pct) }}
                                title={`${formatNumber(cell.active)} active out of ${formatNumber(size)}`}
                              >
                                {cell.pct}%
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Built with React &bull; Vite &bull; Chart.js &bull; DuckDB &bull; Docker</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>Retail Sales &amp; Customer Intelligence Analytics portfolio project &copy; 2026</p>
      </footer>
    </div>
  );
}
