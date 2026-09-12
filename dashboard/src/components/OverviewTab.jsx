import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { IconTrendingUp, IconBarChart, IconUsers, IconTarget, IconArrowUpRight } from './Icons';

export default function OverviewTab({ kpis, monthlySales, countrySales, formatCurrency, formatNumber }) {
  const repeatPct = kpis?.repeat_rate_pct ? Number(kpis.repeat_rate_pct).toFixed(2) : '0.00';

  // Monthly Revenue Line Chart
  const monthlyRevenueData = {
    labels: monthlySales.map((d) => {
      const date = new Date(d.order_month);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    }),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlySales.map((d) => d.revenue),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.04)',
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4F46E5',
        tension: 0.3,
        fill: true
      },
      {
        label: '3-Month Rolling Average',
        data: monthlySales.map((d) => d.rolling_avg_3m),
        borderColor: '#94A3B8',
        borderWidth: 2,
        borderDash: [4, 4],
        pointRadius: 0,
        tension: 0.3,
        fill: false
      }
    ]
  };

  const monthlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 12, color: '#475569', font: { family: 'Inter', size: 12, weight: '500' } }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: 'Inter', size: 12, weight: '600' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 }, callback: (v) => formatCurrency(v) } }
    }
  };

  // Country Sales Bar Chart
  const countryData = {
    labels: countrySales.map((d) => d.country),
    datasets: [
      {
        label: 'Revenue by Country',
        data: countrySales.map((d) => d.total_revenue),
        backgroundColor: '#4F46E5',
        hoverBackgroundColor: '#4338CA',
        borderRadius: 4,
        barThickness: 24
      }
    ]
  };

  const countryOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: 'Inter', size: 12, weight: '600' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => `Revenue: ${formatCurrency(ctx.raw)}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 }, callback: (v) => formatCurrency(v) } }
    }
  };

  // Peak revenue month
  const peakMonthObj = monthlySales.length > 0
    ? monthlySales.reduce((max, d) => (d.revenue > max.revenue ? d : max), monthlySales[0])
    : null;
  const peakMonthStr = peakMonthObj
    ? new Date(peakMonthObj.order_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    : 'N/A';

  // Top country
  const topCountryObj = countrySales.length > 0 ? countrySales[0] : null;

  return (
    <div className="tab-panel-container">
      {/* EXECUTIVE CALLOUT BANNER */}
      <div className="executive-narrative-banner">
        <div className="narrative-badge">EXECUTIVE SUMMARY</div>
        <h2 className="narrative-title">Consistent Multi-Channel Growth Driven by High-Value Account Retention</h2>
        <p className="narrative-text">
          Enterprise revenue stands at <strong>{formatCurrency(kpis?.total_revenue)}</strong> across <strong>{formatNumber(kpis?.total_orders)}</strong> completed transactions. 
          Repeat buyers account for <strong>{repeatPct}%</strong> of the active customer base, confirming robust brand equity and recurring order velocity.
        </p>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid-2col-balanced mt-6">
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3 className="card-panel-title">Monthly Revenue Trend &amp; Growth Smooth</h3>
              <p className="card-panel-sub">Historical monthly sales trajectory overlaid with 3-month moving average.</p>
            </div>
            {peakMonthObj && (
              <span className="pill-badge">
                Peak: {formatCurrency(peakMonthObj.revenue)} ({peakMonthStr})
              </span>
            )}
          </div>
          <div className="chart-wrapper">
            <Line data={monthlyRevenueData} options={monthlyOptions} />
          </div>
        </div>

        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <h3 className="card-panel-title">Revenue Contribution by Region</h3>
              <p className="card-panel-sub">Geographic distribution of sales performance across global customer locations.</p>
            </div>
            {topCountryObj && (
              <span className="pill-badge primary">
                Top Region: {topCountryObj.country} ({formatCurrency(topCountryObj.total_revenue)})
              </span>
            )}
          </div>
          <div className="chart-wrapper">
            <Bar data={countryData} options={countryOptions} />
          </div>
        </div>
      </div>

      {/* PERFORMANCE HIGHLIGHTS GRID */}
      <div className="highlights-grid mt-6">
        <div className="highlight-card">
          <div className="h-icon-wrapper"><IconTrendingUp size={18} /></div>
          <div>
            <div className="h-label">Average Order Value (AOV)</div>
            <div className="h-val">{formatCurrency(kpis?.average_order_value)}</div>
            <div className="h-sub">Mean spend per completed invoice</div>
          </div>
        </div>

        <div className="highlight-card">
          <div className="h-icon-wrapper"><IconUsers size={18} /></div>
          <div>
            <div className="h-label">Repeat Customer Volume</div>
            <div className="h-val">{formatNumber(kpis?.repeat_customers)} Buyers</div>
            <div className="h-sub">{repeatPct}% repeat purchase rate</div>
          </div>
        </div>

        <div className="highlight-card">
          <div className="h-icon-wrapper"><IconTarget size={18} /></div>
          <div>
            <div className="h-label">Average Revenue / Customer</div>
            <div className="h-val">
              {kpis?.total_customers ? formatCurrency(kpis.total_revenue / kpis.total_customers) : '$0'}
            </div>
            <div className="h-sub">Historical ARPC baseline</div>
          </div>
        </div>
      </div>
    </div>
  );
}
