import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { IconPackage, IconSearch, IconFilter, IconArrowUpRight, IconShieldCheck } from './Icons';

export default function ProductParetoTab({ productSales, paretoProducts, formatCurrency, formatNumber }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Category aggregation
  const categories = [...new Set(productSales.map((p) => p.category))];
  const categoryStats = categories.map((cat) => {
    const items = productSales.filter((p) => p.category === cat);
    const rev = items.reduce((sum, p) => sum + p.total_revenue, 0);
    const units = items.reduce((sum, p) => sum + (p.total_quantity || 0), 0);
    const orders = items.reduce((sum, p) => sum + (p.total_orders || 0), 0);
    return { category: cat, total_revenue: rev, total_units: units, total_orders: orders };
  });

  const totalCatalogRevenue = categoryStats.reduce((sum, c) => sum + c.total_revenue, 0);

  // Doughnut Chart Data
  const categoryData = {
    labels: categories,
    datasets: [
      {
        data: categoryStats.map(c => c.total_revenue),
        backgroundColor: ['#4F46E5', '#2563EB', '#38BDF8', '#94A3B8', '#CBD5E1'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          color: '#475569',
          font: { family: 'Inter', size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        callbacks: {
          label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)} (${((ctx.raw / totalCatalogRevenue) * 100).toFixed(1)}%)`
        }
      }
    },
    cutout: '70%'
  };

  // Filter Pareto Products
  const filteredPareto = paretoProducts.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Top 15 total revenue sum
  const top15Revenue = paretoProducts.reduce((sum, p) => sum + p.revenue, 0);
  const top15Pct = paretoProducts.length > 0 ? paretoProducts[paretoProducts.length - 1].cumulative_pct_contribution : 80;

  return (
    <div className="tab-panel-container">
      {/* SECTION 1: PARETO EXECUTIVE BANNER */}
      <div className="pareto-hero-banner">
        <div className="pareto-hero-content">
          <div className="pareto-tag">PARETO (80/20 RULE) PRODUCT ANALYSIS</div>
          <h2 className="pareto-hero-title">Top 15 Products Drive {top15Pct}% of Total Revenue</h2>
          <p className="pareto-hero-desc">
            Out of the entire catalog, a concentrated group of top SKUs generates four-fifths of overall sales. Optimizing inventory and supply chain reliability for these high-velocity products is critical to revenue stability.
          </p>
        </div>
        <div className="pareto-hero-stats">
          <div className="hero-stat-card">
            <span className="h-stat-label">Concentrated Top SKUs</span>
            <span className="h-stat-val">15 Products</span>
            <span className="h-stat-sub">1.8% of product catalog</span>
          </div>
          <div className="hero-stat-card">
            <span className="h-stat-label">Top 15 Revenue Sum</span>
            <span className="h-stat-val">{formatCurrency(top15Revenue)}</span>
            <span className="h-stat-sub">{top15Pct}% of enterprise sales</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: CATEGORY BREAKDOWN & DOUGHNUT */}
      <div className="grid-2col-balanced mt-6">
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Revenue Distribution by Category</h3>
            <span className="card-panel-badge">{categories.length} Primary Categories</span>
          </div>
          <div className="chart-wrapper" style={{ height: '240px' }}>
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Category Performance Metrics</h3>
            <span className="card-panel-badge">Sales &amp; Volume</span>
          </div>
          <div className="table-responsive">
            <table className="enterprise-table compact">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Total Revenue</th>
                  <th style={{ textAlign: 'right' }}>Volume Sold</th>
                  <th style={{ textAlign: 'right' }}>Revenue Share</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((c) => {
                  const pct = ((c.total_revenue / totalCatalogRevenue) * 100).toFixed(1);
                  return (
                    <tr key={c.category}>
                      <td style={{ fontWeight: '600', color: '#0F172A' }}>{c.category}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: '#4F46E5' }}>{formatCurrency(c.total_revenue)}</td>
                      <td style={{ textAlign: 'right', color: '#475569' }}>{formatNumber(c.total_units)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                          <span className="progress-text">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: TOP 15 PARETO PRODUCTS TABLE */}
      <div className="card-panel mt-6">
        <div className="card-panel-header flex-between">
          <div>
            <h3 className="card-panel-title">Top Revenue Products (Pareto 80% Threshold)</h3>
            <p className="card-panel-sub">Ranked catalog items contributing to the cumulative 80% enterprise revenue target.</p>
          </div>
          <div className="table-controls-row">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="table-select-input"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="table-search-box">
              <IconSearch size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="table-search-input"
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Product Name</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Sales Revenue</th>
                <th style={{ textAlign: 'right' }}>Individual %</th>
                <th style={{ textAlign: 'right' }}>Cumulative %</th>
                <th style={{ textAlign: 'center' }}>Pareto Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPareto.map((p) => {
                const isUnder80 = p.cumulative_pct_contribution <= 80;
                return (
                  <tr key={p.rank}>
                    <td style={{ fontWeight: '700', color: '#64748B' }}>#{p.rank}</td>
                    <td style={{ fontWeight: '600', color: '#0F172A' }}>{p.product_name}</td>
                    <td><span className="category-pill">{p.category}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: '#0F172A' }}>{formatCurrency(p.revenue)}</td>
                    <td style={{ textAlign: 'right', color: '#475569' }}>{p.pct_contribution}%</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`cum-pct-badge ${isUnder80 ? 'active' : ''}`}>
                        {p.cumulative_pct_contribution}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isUnder80 ? (
                        <span className="badge badge-champions">
                          <IconShieldCheck size={12} /> Key Driver (&le;80%)
                        </span>
                      ) : (
                        <span className="badge badge-low">Tail (&gt;80%)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
