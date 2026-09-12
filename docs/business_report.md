# Retail Sales & Customer Intelligence Analytics: Business Report

This report summarizes key business findings, customer behavior segments, and data-backed marketing and operational recommendations derived from the end-to-end analytical pipeline.

---

## 1. Executive Summary & Core KPIs

Our retail analytical database consolidates transactional history from December 2010 to January 2014. The high-level performance indicators for the business are:

- **Total Revenue**: **$29,355,866**
- **Total Orders**: **27,659**
- **Active Customers**: **18,484**
- **Average Order Value (AOV)**: **$1,061.35**
- **Average Revenue per Customer (ARPC)**: **$1,588.18**
- **Repeat Customer Rate**: **37.14%** (6,865 customers completed more than 1 transaction)

*Takeaway*: While we have a healthy customer base, the AOV is high (driven by premium bicycle sales), but our repeat purchase rate (37%) has significant room for growth.

---

## 2. Geographic Sales Distribution

By standardizing and resolving state/country-level coding conflicts (e.g. mapping US/USA and DE/Germany), we identified the following top-performing regions:

| Country | Total Orders | Unique Customers | Total Revenue | Average Order Value |
|---|---:|---:|---:|---:|
| **United States** | 9,230 | 7,482 | **$9,162,054** | $992.64 |
| **Australia** | 6,718 | 3,591 | **$9,060,172** | $1,348.64 |
| **United Kingdom** | 3,031 | 1,913 | **$3,391,328** | $1,118.88 |
| **Germany** | 2,484 | 1,780 | **$2,894,016** | $1,165.06 |
| **France** | 2,484 | 1,810 | **$2,643,788** | $1,064.33 |
| **Canada** | 3,375 | 1,571 | **$1,977,688** | $585.98 |

*Takeaway*: The United States and Australia represent our core markets, contributing **62%** of total revenue. Notably, Australian customers show the highest purchase power with an AOV of **$1,348.64**, whereas Canadian customers make smaller transactions ($585.98 AOV) but purchase frequently.

---

## 3. Product Performance & Pareto (80/20 Rule)

### Category Breakdown
Bicycles are our primary revenue engine, while Accessories and Clothing drive order volumes:

- **Bikes**: **$28,316,272** revenue (**96.4%** of total) across 15,205 orders.
- **Accessories**: **$647,937** revenue (**2.2%** of total) across 21,396 orders.
- **Clothing**: **$299,444** revenue (**1.0%** of total) across 8,539 orders.

### Pareto Analysis Findings
Our analysis confirmed that **35 products out of 130 (26.9%) generate 80% of total revenue**. The top 5 individual products are:
1. *Mountain-200 Black- 46* (Bikes) - $1,373,454
2. *Mountain-200 Black- 42* (Bikes) - $1,363,128
3. *Mountain-200 Silver- 38* (Bikes) - $1,339,394
4. *Mountain-200 Silver- 46* (Bikes) - $1,301,029
5. *Mountain-200 Black- 38* (Bikes) - $1,294,854

*Takeaway*: The business is highly dependent on high-value Mountain and Road Bike models. Accessories (like helmets and tire tubes) have extremely high transaction frequency but contribute marginally to the bottom line.

---

## 4. Customer Behavioral Segments & CLV Predictions

Using K-Means clustering on scaled Recency, Frequency, and Monetary (RFM) features, and applying a Gradient Boosting Machine Learning model to forecast holdout spending, we partitioned our customer base into 4 actionable segments:

| Segment Name | Customer Count | Avg Recency (Days) | Avg Frequency (Orders) | Avg Historical Spend | Avg Predicted CLV (Lifetime) |
|---|---:|---:|---:|---:|---:|
| **Champions** | 5,608 | 32.5 | 4.8 | $4,008.70 | **$3,926.10** |
| **Loyal Customers** | 3,736 | 134.2 | 2.5 | $1,572.00 | **$1,694.30** |
| **At Risk** | 2,459 | 240.4 | 1.2 | $260.40 | **$260.40** |
| **Low-Value / Occasional** | 6,679 | 94.6 | 1.1 | $51.90 | **$56.40** |

### Segment Insights
- **Champions**: Our most active and highest-spending customers. They buy frequently, made purchases recently, and represent **76%** of our lifetime value.
- **Loyal Customers**: Steady buyers who purchase consistently but have a lower average transaction value than Champions.
- **At Risk**: Customers who used to buy but haven't placed an order in over 240 days.
- **Low-Value / Occasional**: The largest segment by count (6,679 customers) but contributing very low monetary value. These are mostly one-off accessory or clothing buyers.

---

## 5. Actionable Strategic Recommendations

### Marketing & Customer Retention (RFM & CLV Driven)
1. **VIP Rewards for Champions**:
   - Establish a VIP loyalty club offering early access to new bike model releases, free premium maintenance agreements (since maintenance has a high margin/low cost), and exclusive regional cycling events.
2. **Re-engagement Campaign for At-Risk Customers**:
   - Run email marketing campaigns targeting the 2,459 "At Risk" customers. Offer a "We Miss You" discount code (e.g. 10% off high-margin bike parts or clothing) to reactivate them before they churn permanently.
3. **Cross-Selling to Low-Value/Occasional Buyers**:
   - Low-value customers represent 36% of the customer base but only buy cheap accessories. Send post-purchase automated sequences suggesting mid-range clothing, helmets, or upgrades, attempting to transition them to "Loyal" segments.

### Inventory & Geographic Optimization
4. **Targeted Stock Allocation**:
   - Since Australia has a very high AOV ($1,348) compared to Canada ($585), allocate premium road and mountain bike inventory to warehouses serving Australia and the US. In Canada, focus stock on high-turnover accessories, clothing, and entry-level bikes.
5. **Pareto-Focus Supply Chain**:
   - Ensure the 35 key products driving 80% of revenue never experience stockouts. Set up automatic reorder points and buffer stocks for these specific bike models.
