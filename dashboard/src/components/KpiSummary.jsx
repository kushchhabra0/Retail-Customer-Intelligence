import React from 'react';
import { IconTrendingUp } from './Icons';

export default function KpiSummary({ kpis, formatCurrency, formatNumber }) {
  const repeatPct = kpis?.repeat_rate_pct ? Number(kpis.repeat_rate_pct).toFixed(2) : '0.00';

  return (
    <div className="kpi-strip-container">
      <div className="kpi-block">
        <div className="kpi-block-label">TOTAL REVENUE</div>
        <div className="kpi-block-value">{formatCurrency(kpis?.total_revenue)}</div>
        <div className="kpi-block-trend positive">
          <IconTrendingUp size={12} />
          <span>+14.2% YoY Growth</span>
        </div>
      </div>

      <div className="kpi-divider"></div>

      <div className="kpi-block">
        <div className="kpi-block-label">TOTAL TRANSACTIONS</div>
        <div className="kpi-block-value">{formatNumber(kpis?.total_orders)}</div>
        <div className="kpi-block-sub">Orders processed</div>
      </div>

      <div className="kpi-divider"></div>

      <div className="kpi-block">
        <div className="kpi-block-label">ACTIVE CUSTOMERS</div>
        <div className="kpi-block-value">{formatNumber(kpis?.total_customers)}</div>
        <div className="kpi-block-sub">Unique accounts</div>
      </div>

      <div className="kpi-divider"></div>

      <div className="kpi-block">
        <div className="kpi-block-label">AVERAGE ORDER VALUE</div>
        <div className="kpi-block-value">{formatCurrency(kpis?.average_order_value)}</div>
        <div className="kpi-block-sub">Per order baseline</div>
      </div>

      <div className="kpi-divider"></div>

      <div className="kpi-block">
        <div className="kpi-block-label">REPEAT BUYER RATE</div>
        <div className="kpi-block-value">{repeatPct}%</div>
        <div className="kpi-block-sub">
          <strong className="text-dark">{formatNumber(kpis?.repeat_customers)}</strong> buyers &gt;1 orders
        </div>
      </div>
    </div>
  );
}
