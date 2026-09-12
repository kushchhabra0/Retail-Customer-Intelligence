# Retail Sales & Customer Intelligence Analytics: Business Framing & Objectives

## Business Objective
The objective of this project is to analyze transactional sales and customer data to extract actionable intelligence that helps the marketing, sales, and operations departments make data-driven decisions. By understanding customer purchasing habits, product performance, and retention trends, we aim to maximize revenue, improve retention, and run targeted customer engagement campaigns.

The project follows a standard analytical lifecycle:
1. **Business Framing**: Defining the exact business questions we need to answer.
2. **Data Exploration & Quality Audits**: Profiling data, resolving quality issues (duplicates, anomalies, referential integrity).
3. **ETL & Data Modeling**: Organizing the raw transactional data into a Star Schema (Fact and Dimension tables) optimized for analytics.
4. **KPI & Trend Analysis**: Examining core business metrics (Revenue, Orders, AOV, Repeat Rate) and growth over time.
5. **Product Analytics**: Identifying top-performing categories and items, and performing a Pareto analysis (80/20 rule).
6. **Customer Profiling & ML Segmentation**: Using RFM metrics and K-Means clustering to partition the customer base into actionable behavioral segments.
7. **Cohort & Retention Analysis**: Tracking monthly cohorts to assess retention rates over time.
8. **Predictive CLV Modeling**: Training probabilistic models to forecast customer future purchasing behavior.
9. **Interactive Presentation Layer**: Building a web-based interactive dashboard to present insights to stakeholders.

---

## Core Business Questions

### 1. Revenue & Sales Performance
- What is the total revenue generated across the historical dataset, and what is its trend over time (monthly, quarterly)?
- What is the Month-over-Month (MoM) revenue growth rate, and are there seasonal patterns?
- Which product categories generate the highest revenue and transaction volumes?
- Which individual products contribute the most to sales, and does the 80/20 Pareto rule hold true (do top 20% of products generate 80% of revenue)?

### 2. Customer Behavior
- How many unique customers have purchased from us, and how is this split between one-time and repeat buyers?
- What is the Average Order Value (AOV) and Average Revenue per Customer (ARPC)?
- Who are our top 10% highest-value customers by lifetime revenue contribution?
- Does customer purchase behavior (like AOV) vary significantly by region?

### 3. Customer Retention & Cohorts
- How well are we retaining customers month-over-month?
- Which monthly acquisition cohorts (e.g., customers who made their first purchase in Jan 2023 vs. Feb 2023) show the highest long-term retention?
- How many months does a customer typically stay active before churning?

### 4. Behavioral Segmentation (RFM & ML)
- What distinct segments of customers exist based on Recency, Frequency, and Monetary (RFM) characteristics?
- How do the K-Means clusters compare with standard RFM scoring segments?
- What are the unique characteristics of each cluster (e.g., high-value occasional buyers vs. low-value highly frequent buyers)?
- What targeted marketing and operational strategies should be applied to each customer segment to maximize customer lifetime value (CLV)?
