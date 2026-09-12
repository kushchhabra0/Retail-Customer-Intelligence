# Retail Sales & Customer Intelligence Analytics

## Complete Project Roadmap

> **Objective:** Build an end-to-end Data Analytics and Data Science portfolio project that demonstrates SQL, Python, statistics, clustering, visualization, and business problem-solving skills.

---

# 1. Project Overview

## Business Objective

The objective of this project is to analyze retail transactional data to identify:

- Revenue trends and growth patterns.
- Product and category performance.
- Customer purchasing behavior.
- Customer retention and cohort behavior.
- Meaningful customer segments using RFM analysis and K-Means clustering.
- Actionable business recommendations for marketing, retention, and customer engagement.

The project follows the complete analytics lifecycle:

```text
Raw Transaction Data
        │
        ▼
SQL Data Cleaning
        │
        ▼
Data Modeling
        │
        ▼
Business KPI Analysis
        │
        ▼
Customer Analytics
        │
        ▼
RFM Feature Engineering
        │
        ▼
Statistical Analysis
        │
        ▼
K-Means Clustering
        │
        ▼
Cluster Profiling
        │
        ▼
Cohort & Retention Analysis
        │
        ▼
Power BI Dashboard
        │
        ▼
Business Recommendations
```

---

# 2. Technology Stack

| Technology | Purpose |
|---|---|
| SQL Server | Data storage and analytics |
| Python | Advanced analytics |
| Pandas | Data manipulation |
| NumPy | Numerical operations |
| Scikit-Learn | Clustering |
| Matplotlib | Visualization |
| Seaborn | Statistical visualization |
| Power BI | Interactive dashboards |
| Git/GitHub | Version control |

---

# 3. Repository Structure

```text
retail-sales-customer-analytics/
│
├── README.md
├── ROADMAP.md
│
├── data/
│   ├── raw/
│   └── processed/
│
├── sql/
│   ├── 01_database_exploration.sql
│   ├── 02_data_quality.sql
│   ├── 03_data_cleaning.sql
│   ├── 04_data_modeling.sql
│   ├── 05_kpi_analysis.sql
│   ├── 06_customer_analysis.sql
│   ├── 07_product_analysis.sql
│   ├── 08_rfm_analysis.sql
│   ├── 09_cohort_analysis.sql
│   └── 10_retention_analysis.sql
│
├── python/
│   ├── 01_data_exploration.ipynb
│   ├── 02_rfm_analysis.ipynb
│   ├── 03_statistical_analysis.ipynb
│   ├── 04_customer_clustering.ipynb
│   └── 05_cluster_profiling.ipynb
│
├── visualization/
│   ├── eda/
│   └── clustering/
│
├── powerbi/
│   └── retail_customer_dashboard.pbix
│
└── docs/
    ├── business_questions.md
    ├── data_dictionary.md
    ├── methodology.md
    └── business_recommendations.md
```

---

# PHASE 0 — Business Understanding

## Objective

Define the business problem before performing technical analysis.

## Business Questions

### Revenue

1. What is total revenue?
2. How has revenue changed over time?
3. Which categories generate the highest revenue?
4. Which products contribute most to sales?

### Customers

5. How many unique customers are there?
6. What is the average order value?
7. What percentage of customers are repeat buyers?
8. Which customers generate the highest revenue?

### Retention

9. Which customer cohorts retain best?
10. How does retention change over time?

### Segmentation

11. What customer segments exist?
12. What strategy should be used for each segment?

## Deliverable

Create:

```text
docs/business_questions.md
```

---

# PHASE 1 — Data Understanding

## Tasks

For every dataset:

- Count rows and columns.
- Inspect column names.
- Check data types.
- Identify primary keys.
- Identify foreign keys.
- Calculate missing values.
- Check duplicates.
- Inspect date ranges.
- Identify numerical and categorical variables.

## Deliverable

Create:

```text
docs/data_dictionary.md
```

Example:

| Column | Type | Description |
|---|---|---|
| CustomerID | INT | Unique customer identifier |
| OrderDate | DATE | Purchase date |
| ProductID | INT | Product identifier |
| Quantity | INT | Units purchased |
| UnitPrice | DECIMAL | Product price |
| Region | VARCHAR | Customer region |

## Interview Preparation

Be able to answer:

> How did you understand the dataset before analysis?

---

# PHASE 2 — SQL Database Setup

## Tasks

- Import CSV files into SQL Server.
- Create tables.
- Define relationships.
- Verify record counts.

## SQL Concepts

Practice:

```sql
CREATE TABLE
INSERT
SELECT
WHERE
GROUP BY
HAVING
ORDER BY
DISTINCT
JOIN
CASE WHEN
```

Then progress to:

```sql
CTE
Subqueries
Window Functions
ROW_NUMBER()
RANK()
DENSE_RANK()
LAG()
LEAD()
SUM() OVER()
AVG() OVER()
```

## Deliverable

A reproducible SQL database setup.

---

# PHASE 3 — Data Quality

## Tasks

Check:

### Missing Values

- Customer IDs
- Product IDs
- Dates
- Prices

### Duplicates

- Duplicate transaction IDs.
- Duplicate customer records.

### Invalid Data

Check for:

- Quantity <= 0.
- Price <= 0.
- Invalid dates.
- Inconsistent categories.

### Referential Integrity

Verify:

```text
Sales → Customers
Sales → Products
```

## Deliverable

```text
sql/02_data_quality.sql
```

---

# PHASE 4 — Data Cleaning & Modeling

## Tasks

- Remove duplicates.
- Handle missing values.
- Correct data types.
- Create derived columns.
- Build an analytics-friendly schema.

## Recommended Data Model

```text
             DimCustomer
                  │
                  │
DimProduct ─ FactSales ─ DimDate
                  │
                  │
              DimRegion
```

## Deliverable

```text
sql/03_data_cleaning.sql
sql/04_data_modeling.sql
```

---

# PHASE 5 — KPI Analysis

## Metrics

### Revenue

```text
Revenue = Quantity × UnitPrice
```

### Orders

```text
COUNT(DISTINCT OrderID)
```

### Customers

```text
COUNT(DISTINCT CustomerID)
```

### Average Order Value

```text
AOV = Revenue / Orders
```

### Average Revenue per Customer

```text
ARPC = Revenue / Customers
```

### Repeat Customer Rate

```text
Repeat Customers / Total Customers
```

## Deliverable

```text
sql/05_kpi_analysis.sql
```

---

# PHASE 6 — Time-Series Analysis

## Analyze

- Monthly revenue.
- Monthly orders.
- Monthly customers.
- Month-over-month growth.
- Cumulative revenue.
- Rolling averages.

## Formula

```text
MoM Growth =
(Current Revenue - Previous Revenue)
/
Previous Revenue
```

## SQL Skills

Use:

```sql
LAG()
LEAD()
SUM() OVER()
```

## Visualizations

- Revenue trend.
- Orders trend.
- Customer trend.
- Growth trend.

---

# PHASE 7 — Product Analysis

## Questions

- Top products.
- Bottom products.
- Revenue by category.
- Quantity sold.
- Average selling price.
- Product contribution percentage.

## Advanced Analysis

Perform a Pareto analysis:

> What percentage of revenue comes from the top 20% of products?

## Deliverable

```text
sql/07_product_analysis.sql
```

---

# PHASE 8 — Customer Analytics

## Calculate

For every customer:

- Total revenue.
- Number of orders.
- Average order value.
- Last purchase date.

## Categorize

- One-time customers.
- Repeat customers.
- High-value customers.
- Low-value customers.

## Deliverable

```text
sql/06_customer_analysis.sql
```

---

# PHASE 9 — RFM Analysis

## Objective

Create customer-level behavioral features.

### Recency

```text
Current Date - Last Purchase Date
```

### Frequency

```text
Number of Orders
```

### Monetary

```text
Total Revenue
```

## Output

| Customer | Recency | Frequency | Monetary |
|---|---:|---:|---:|
| C001 | 15 | 12 | 45000 |
| C002 | 120 | 2 | 3500 |

## Deliverable

```text
sql/08_rfm_analysis.sql
python/02_rfm_analysis.ipynb
```

---

# PHASE 10 — RFM Scoring

## Score Each Customer

| Metric | Score |
|---|---|
| Recency | 1–5 |
| Frequency | 1–5 |
| Monetary | 1–5 |

## Create Segments

- Champions
- Loyal Customers
- Potential Loyalists
- New Customers
- At Risk
- Lost Customers

## Important

Document the scoring logic clearly.

---

# PHASE 11 — Statistical Analysis

## Objective

Answer meaningful business questions statistically.

### Question 1

Do high-value customers have higher average order values?

### Hypotheses

```text
H0: Mean AOV is equal.
H1: Mean AOV is different.
```

Report:

- Test used.
- Assumptions.
- Test statistic.
- P-value.
- Confidence interval.
- Effect size.
- Business interpretation.

### Question 2

Does average order value differ across regions?

If assumptions are satisfied, perform an ANOVA.

## Deliverable

```text
python/03_statistical_analysis.ipynb
```

---

# PHASE 12 — Python EDA

## Libraries

```python
pandas
numpy
matplotlib
seaborn
```

## Perform

### Univariate Analysis

- Revenue distribution.
- Order value distribution.
- Frequency distribution.

### Bivariate Analysis

- Revenue vs frequency.
- AOV vs segment.
- Category vs revenue.

### Correlation Analysis

Study relationships among:

- Recency.
- Frequency.
- Monetary.
- Revenue.
- Orders.

### Outlier Analysis

Inspect:

- Revenue.
- Frequency.
- Monetary value.

---

# PHASE 13 — Customer Clustering

## Pipeline

```text
RFM Features
     ↓
StandardScaler
     ↓
K-Means
     ↓
Evaluate K
     ↓
Cluster Assignment
```

## Steps

1. Select RFM features.
2. Standardize them.
3. Train K-Means for K = 2 to 6.
4. Record inertia.
5. Calculate silhouette scores.
6. Compare cluster sizes.
7. Choose the most interpretable solution.

## Deliverable

```text
python/04_customer_clustering.ipynb
```

---

# PHASE 14 — Choosing the Number of Clusters

## Metrics

### Inertia

Measures within-cluster compactness.

### Silhouette Score

Measures separation and cohesion.

## Decision Criteria

Choose K based on:

- Inertia.
- Silhouette score.
- Cluster balance.
- Stability.
- Business interpretability.

Do not select K based on one metric alone.

---

# PHASE 15 — Cluster Profiling

## Example

| Cluster | Interpretation |
|---|---|
| 0 | Champions |
| 1 | At Risk |
| 2 | Loyal Customers |
| 3 | High-Value Occasional |

## Profile Using

- Average recency.
- Average frequency.
- Average monetary value.
- Revenue contribution.
- Customer count.

## Deliverable

```text
python/05_cluster_profiling.ipynb
```

---

# PHASE 16 — Business Recommendations

Create actionable recommendations.

| Segment | Recommendation |
|---|---|
| Champions | VIP rewards |
| At Risk | Re-engagement campaign |
| Loyal | Cross-selling |
| High-Value Occasional | Personalized offers |
| Low-Value | Cost-efficient marketing |

Focus on actions, not algorithms.

---

# PHASE 17 — Cohort Analysis

## Steps

1. Identify each customer's first purchase month.
2. Assign a cohort.
3. Track activity over subsequent months.
4. Build a retention matrix.
5. Visualize with a heatmap.

## Questions

- Which cohorts retain customers best?
- Does retention improve or decline over time?

## Deliverable

```text
sql/09_cohort_analysis.sql
sql/10_retention_analysis.sql
```

---

# PHASE 18 — Estimated Customer Lifetime Value

Use a simple analytical estimate:

```text
Estimated CLV =
Average Order Value
×
Purchase Frequency
×
Customer Lifespan
```

Compare CLV with:

- RFM segments.
- K-Means clusters.

Clearly label this as an estimate, not a probabilistic CLV model.

---

# PHASE 19 — Power BI Dashboard

## Page 1 — Executive Overview

KPIs:

- Total Revenue.
- Total Orders.
- Total Customers.
- Average Order Value.
- Repeat Customer Rate.
- Revenue Growth.

Charts:

- Revenue trend.
- Revenue by category.
- Top products.

## Page 2 — Customer Analytics

Show:

- New vs returning customers.
- Revenue by customer.
- Customer value distribution.

## Page 3 — Customer Segmentation

Show:

- RFM segments.
- K-Means clusters.
- Revenue contribution.
- Cluster profiles.

## Page 4 — Retention

Show:

- Cohort heatmap.
- Retention curve.
- Repeat purchase rate.

---

# PHASE 20 — Business Report

Create:

```text
docs/business_recommendations.md
```

## Structure

### Finding 1

Revenue concentration.

### Finding 2

Customer behavior.

### Finding 3

Retention.

### Finding 4

Segmentation.

### Recommendations

Specific business actions supported by the analysis.

---

# PHASE 21 — GitHub README

The README should contain:

1. Project objective.
2. Business questions.
3. Dataset description.
4. Technology stack.
5. Project architecture.
6. SQL analysis.
7. Python analysis.
8. Clustering methodology.
9. Dashboard screenshots.
10. Key findings.
11. Business recommendations.
12. Credits.

---

# PHASE 22 — Interview Preparation

You should be able to explain:

### SQL

- Why did you use a CTE?
- Difference between `WHERE` and `HAVING`.
- When to use window functions.

### Statistics

- Why did you choose the statistical test?
- What does the p-value mean?
- What assumptions did you check?

### Clustering

- Why K-Means?
- Why scaling?
- How did you choose K?
- Why not DBSCAN?
- How did you validate the clusters?

### Business

- Which cluster is most valuable?
- What would the company do with these results?
- How would you measure whether your recommendations worked?

---

# 10-Day Execution Plan

| Day | Focus |
|---|---|
| Day 1 | Business questions, data understanding, data dictionary |
| Day 2 | SQL setup and data quality |
| Day 3 | Cleaning, modeling, KPI analysis |
| Day 4 | Time-series and product analysis |
| Day 5 | Customer analytics and RFM |
| Day 6 | Python EDA and statistical analysis |
| Day 7 | K-Means, elbow, silhouette, profiling |
| Day 8 | Cohort analysis, retention, estimated CLV |
| Day 9 | Power BI dashboard |
| Day 10 | README, business report, GitHub cleanup |

---

# Definition of Done

The project is complete only when you can confidently answer all of these questions without looking at the code:

- What business problem did you solve?
- How did you clean the data?
- What were the most important KPIs?
- How did you engineer RFM features?
- Why did you standardize the data?
- How did you choose the number of clusters?
- What does the silhouette score indicate?
- What does each cluster represent?
- What business action would you recommend?
- What would you improve if given more time?

---

# Final Resume Description

Once completed, describe the project as:

> **Retail Sales & Customer Intelligence Analytics | SQL, Python, Power BI**
>
> - Built an end-to-end analytics pipeline using SQL Server and Python, transforming transactional data into customer-, product-, and revenue-level analytical datasets.
> - Developed RFM-based customer segmentation using K-Means, evaluating cluster quality with inertia and silhouette score and profiling segments by purchasing behavior.
> - Performed time-series, cohort, retention, and statistical analysis, and presented actionable customer and business insights through an interactive Power BI dashboard.

---

## Final Outcome

By completing this roadmap, the project will demonstrate:

- **SQL:** Data cleaning, joins, CTEs, window functions, and business analytics.
- **Python:** EDA, feature engineering, statistics, and machine learning.
- **Statistics:** Hypothesis testing and analytical reasoning.
- **Machine Learning:** Customer segmentation with K-Means.
- **Visualization:** Matplotlib, Seaborn, and Power BI.
- **Business Acumen:** Turning analysis into actionable recommendations.
- **Communication:** Presenting findings clearly to technical and non-technical stakeholders.

This combination makes the project substantially stronger than a standard SQL tutorial project and provides a defensible, interview-ready portfolio piece for Data Analyst, Associate Data Scientist, and analytics consulting roles.
