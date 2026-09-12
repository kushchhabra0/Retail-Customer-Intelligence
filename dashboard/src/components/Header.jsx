import React from 'react';
import { IconDatabase, IconFileText, IconCalendar, IconBarChart, IconUsers, IconPackage, IconLayers } from './Icons';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="enterprise-header-container">
      {/* BRAND & TOP CONTROLS ROW */}
      <div className="header-top-bar">
        <div className="brand-title-group">
          <div className="brand-icon-box">
            <IconLayers size={18} className="brand-svg" />
          </div>
          <div>
            <h1 className="brand-heading">Retail Customer Intelligence</h1>
            <p className="brand-tagline">Enterprise Analytics Platform &bull; DuckDB Engine</p>
          </div>
        </div>

        <div className="header-right-actions">
          <div className="db-engine-pill">
            <span className="live-dot"></span>
            <span>DuckDB Connected</span>
          </div>

          <div className="date-filter-pill">
            <IconCalendar size={13} />
            <span>FY 2024 &bull; All Regions</span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION BAR */}
      <nav className="header-tabs-bar">
        <button
          className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <IconBarChart size={15} />
          <span>Executive Overview</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <IconPackage size={15} />
          <span>Product Pareto &amp; Catalog</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <IconUsers size={15} />
          <span>ML Segmentation &amp; Playbooks</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'cohorts' ? 'active' : ''}`}
          onClick={() => setActiveTab('cohorts')}
        >
          <IconCalendar size={15} />
          <span>Cohort Retention Matrix</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'findings' ? 'active' : ''}`}
          onClick={() => setActiveTab('findings')}
        >
          <IconFileText size={15} />
          <span>Analytical Report &amp; Findings</span>
        </button>
      </nav>
    </header>
  );
}
