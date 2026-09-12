import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { IconUsers, IconTarget, IconTrendingUp, IconArrowUpRight, IconSearch, IconChevronRight } from './Icons';

// Playbook details lookup map based on segment name
const SEGMENT_PLAYBOOKS = {
  'Champions': {
    subtitle: 'Highest Recency, High Frequency & Maximum Lifetime Value',
    tag: 'Priority Strategic Whales',
    tagVariant: 'champions',
    metrics: {
      recencyTier: '1-30 Days (Active)',
      frequencyTier: 'High (4+ Orders)',
      spendingTier: 'Top 5% Portfolio',
      clvGrowth: '+42% Predicted Expansion'
    },
    opportunity: 'Tier-1 revenue drivers with maximum repeat purchase probability. Low churn risk, highly responsive to premium cross-sell.',
    actions: [
      'Personalized VIP product previews & early access catalog',
      'Exclusive high-margin product bundle offers',
      'ROI-led volume discount structures on bulk reorders'
    ],
    salesMotion: 'Dedicated senior account executive & quarterly strategic reviews',
    badgeText: 'Top 5% Revenue'
  },
  'Loyal Customers': {
    subtitle: 'Steady Consistent Buyers with Strong Historical Retention',
    tag: 'Core Revenue Anchor',
    tagVariant: 'loyal',
    metrics: {
      recencyTier: '30-60 Days',
      frequencyTier: 'Moderate-High (3+ Orders)',
      spendingTier: 'Above Average',
      clvGrowth: '+25% Predicted Expansion'
    },
    opportunity: 'Highly predictable revenue baseline. Prime candidates for loyalty reward tiers and cross-category expansion.',
    actions: [
      'Automated replenishment reminders based on past order frequency',
      'Category expansion incentives (buy 2 categories get 15% off)',
      'Quarterly loyalty point multiplier events'
    ],
    salesMotion: 'Automated trigger campaigns backed by inside sales support',
    badgeText: 'Stable Core'
  },
  'At-Risk Customers': {
    subtitle: 'High Historical Spend but Declining Recent Purchase Frequency',
    tag: 'High Churn Danger',
    tagVariant: 'risk',
    metrics: {
      recencyTier: '90-180 Days (Dormant)',
      frequencyTier: 'High Historical',
      spendingTier: 'High Historical Baseline',
      clvGrowth: '-35% If Unchecked'
    },
    opportunity: 'High historical customer lifetime value at risk of total churn. Immediate win-back outreach can recover substantial margin.',
    actions: [
      'Win-back promotional discount code (e.g. 20% off next order)',
      'Direct email survey to identify product or service friction',
      'Targeted personalized product recommendations based on past purchases'
    ],
    salesMotion: 'Outbound customer success call or high-touch win-back email',
    badgeText: 'Immediate Re-engagement Needed'
  },
  'Hibernating / Low-Value': {
    subtitle: 'Infrequent Buyers with Low Monetary Contribution',
    tag: 'Low Margin / Mass Tail',
    tagVariant: 'low',
    metrics: {
      recencyTier: '180+ Days',
      frequencyTier: 'Low (1-2 Orders)',
      spendingTier: 'Below Average',
      clvGrowth: 'Flat Baseline'
    },
    opportunity: 'Low individual LTV. Efficient automated nurture campaigns maximize profit margin while minimizing customer acquisition cost.',
    actions: [
      'Low-cost automated email newsletter highlights',
      'Self-serve online promotional clearance catalog',
      'Standard digital onboarding and self-service support links'
    ],
    salesMotion: 'Fully automated low-cost digital marketing flows',
    badgeText: 'Low Margin / Low Touch'
  }
};

export default function CustomerSegmentationTab({ customerSegments, formatCurrency, formatNumber }) {
  const [selectedSegmentName, setSelectedSegmentName] = useState(
    customerSegments[0]?.segment_name || 'Champions'
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Find active segment object or fallback
  const activeSegmentData = customerSegments.find(s => s.segment_name === selectedSegmentName) || customerSegments[0];
  const activePlaybook = SEGMENT_PLAYBOOKS[selectedSegmentName] || SEGMENT_PLAYBOOKS['Champions'];

  // Total customers count across segments
  const totalCustomers = customerSegments.reduce((sum, s) => sum + s.customer_count, 0);

  // Filter segment table rows
  const filteredSegments = customerSegments.filter(s =>
    s.segment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Chart 1: Segment Sizes Bar Chart
  const segmentCountData = {
    labels: customerSegments.map((s) => s.segment_name),
    datasets: [
      {
        label: 'Active Customers',
        data: customerSegments.map((s) => s.customer_count),
        backgroundColor: customerSegments.map(s => {
          if (s.segment_name.includes('Champ')) return '#4F46E5';
          if (s.segment_name.includes('Loyal')) return '#2563EB';
          if (s.segment_name.includes('Risk')) return '#D97706';
          return '#94A3B8';
        }),
        borderRadius: 4,
        barThickness: 32
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleFont: { family: 'Inter', size: 12, weight: '600' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 6
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } }
    }
  };

  // Chart 2: Historical Spend vs Predicted CLV
  const segmentClvData = {
    labels: customerSegments.map((s) => s.segment_name),
    datasets: [
      {
        label: 'Avg Historical Spend',
        data: customerSegments.map((s) => s.avg_spending),
        backgroundColor: '#94A3B8',
        borderRadius: 4,
        barThickness: 20
      },
      {
        label: 'Avg 12M Predicted CLV',
        data: customerSegments.map((s) => s.avg_clv),
        backgroundColor: '#4F46E5',
        borderRadius: 4,
        barThickness: 20
      }
    ]
  };

  const clvChartOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: { boxWidth: 12, color: '#475569', font: { family: 'Inter', size: 11, weight: '500' } }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } } },
      y: { grid: { color: '#F1F5F9' }, ticks: { color: '#64748B', font: { family: 'Inter', size: 11 }, callback: (v) => formatCurrency(v) } }
    }
  };

  return (
    <div className="tab-panel-container">
      {/* SECTION 1: SEGMENT SELECTOR & PLAYBOOK DEEP DIVE */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Behavioral Segmentation &amp; Strategic Playbooks</h2>
          <p className="section-subtitle">K-Means machine learning cluster profiles matched with BG/NBD predictive lifetime value actions.</p>
        </div>
        <div className="segment-pills-bar">
          {customerSegments.map(s => {
            const isSelected = s.segment_name === selectedSegmentName;
            const pct = Math.round((s.customer_count / totalCustomers) * 100);
            return (
              <button
                key={s.segment_name}
                className={`segment-selector-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedSegmentName(s.segment_name)}
              >
                <span className="seg-name">{s.segment_name}</span>
                <span className="seg-count">{formatNumber(s.customer_count)} ({pct}%)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STRATEGIC PLAYBOOK CARD */}
      <div className="playbook-card">
        <div className="playbook-header">
          <div>
            <div className="playbook-tag-row">
              <span className={`badge badge-${activePlaybook.tagVariant}`}>
                {activePlaybook.tag}
              </span>
              <span className="playbook-badge-text">{activePlaybook.badgeText}</span>
            </div>
            <h3 className="playbook-title">{selectedSegmentName} Strategy Playbook</h3>
            <p className="playbook-subtitle">{activePlaybook.subtitle}</p>
          </div>
          <div className="playbook-stat-box">
            <div className="playbook-stat-label">Avg Predicted 12M CLV</div>
            <div className="playbook-stat-value">{formatCurrency(activeSegmentData?.avg_clv)}</div>
            <div className="playbook-stat-sub">vs {formatCurrency(activeSegmentData?.avg_spending)} Historical</div>
          </div>
        </div>

        <div className="playbook-grid-details">
          {/* Column 1: Segment Profile Metrics */}
          <div className="playbook-detail-col">
            <div className="col-label">BEHAVIORAL PROFILE</div>
            <div className="profile-metrics-stack">
              <div className="metric-row-item">
                <span className="m-label">Recency Window:</span>
                <span className="m-val">{activePlaybook.metrics.recencyTier} ({activeSegmentData?.avg_recency}d avg)</span>
              </div>
              <div className="metric-row-item">
                <span className="m-label">Order Frequency:</span>
                <span className="m-val">{activePlaybook.metrics.frequencyTier} ({activeSegmentData?.avg_frequency} orders)</span>
              </div>
              <div className="metric-row-item">
                <span className="m-label">Historical Spend:</span>
                <span className="m-val">{formatCurrency(activeSegmentData?.avg_spending)}</span>
              </div>
              <div className="metric-row-item">
                <span className="m-label">CLV Forecast:</span>
                <span className="m-val highlight-blue">{activePlaybook.metrics.clvGrowth}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Business Opportunity */}
          <div className="playbook-detail-col">
            <div className="col-label">BUSINESS OPPORTUNITY</div>
            <p className="col-desc-text">{activePlaybook.opportunity}</p>
          </div>

          {/* Column 3: Recommended Action */}
          <div className="playbook-detail-col">
            <div className="col-label">RECOMMENDED STRATEGIC ACTION</div>
            <ul className="action-bullets">
              {activePlaybook.actions.map((act, idx) => (
                <li key={idx}><IconChevronRight size={14} className="bullet-icon" /> {act}</li>
              ))}
            </ul>
          </div>

          {/* Column 4: Sales Motion */}
          <div className="playbook-detail-col">
            <div className="col-label">RECOMMENDED SALES MOTION</div>
            <div className="sales-motion-badge">
              <IconTarget size={14} />
              <span>{activePlaybook.salesMotion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CHARTS ROW */}
      <div className="grid-2col-balanced mt-6">
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Customer Distribution by Segment</h3>
            <span className="card-panel-badge">{formatNumber(totalCustomers)} Total Accounts</span>
          </div>
          <div className="chart-wrapper">
            <Bar data={segmentCountData} options={chartOptions} />
          </div>
        </div>

        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Historical Spend vs. 12-Month Predicted CLV</h3>
            <span className="card-panel-badge">BG/NBD &amp; Gamma-Gamma</span>
          </div>
          <div className="chart-wrapper">
            <Bar data={segmentClvData} options={clvChartOptions} />
          </div>
        </div>
      </div>

      {/* SECTION 3: SEGMENT PROFILE DETAILS TABLE */}
      <div className="card-panel mt-6">
        <div className="card-panel-header flex-between">
          <div>
            <h3 className="card-panel-title">Detailed Segment Profiles &amp; Metrics</h3>
            <p className="card-panel-sub">Comparative behavioral breakdown across all identified customer cohorts.</p>
          </div>
          <div className="table-search-box">
            <IconSearch size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search segment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="table-search-input"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Segment Name</th>
                <th style={{ textAlign: 'right' }}>Customer Count</th>
                <th style={{ textAlign: 'right' }}>Portfolio Share</th>
                <th style={{ textAlign: 'right' }}>Avg Recency</th>
                <th style={{ textAlign: 'right' }}>Avg Frequency</th>
                <th style={{ textAlign: 'right' }}>Avg Historical Spend</th>
                <th style={{ textAlign: 'right' }}>Avg Predicted CLV</th>
                <th style={{ textAlign: 'center' }}>CLV Expansion Ratio</th>
              </tr>
            </thead>
            <tbody>
              {filteredSegments.map((s) => {
                const pct = ((s.customer_count / totalCustomers) * 100).toFixed(1);
                const expansionRatio = (s.avg_clv / (s.avg_spending || 1)).toFixed(2);
                let badgeVariant = 'low';
                if (s.segment_name.includes('Champ')) badgeVariant = 'champions';
                else if (s.segment_name.includes('Loyal')) badgeVariant = 'loyal';
                else if (s.segment_name.includes('Risk')) badgeVariant = 'risk';

                return (
                  <tr key={s.segment_name} className={s.segment_name === selectedSegmentName ? 'row-selected' : ''}>
                    <td>
                      <span className={`badge badge-${badgeVariant}`}>
                        {s.segment_name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>{formatNumber(s.customer_count)}</td>
                    <td style={{ textAlign: 'right', color: '#64748B' }}>{pct}%</td>
                    <td style={{ textAlign: 'right' }}>{s.avg_recency} days</td>
                    <td style={{ textAlign: 'right' }}>{s.avg_frequency} orders</td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: '#0F172A' }}>{formatCurrency(s.avg_spending)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: '#4F46E5' }}>{formatCurrency(s.avg_clv)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="ratio-pill">{expansionRatio}x</span>
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
