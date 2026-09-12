# Retail Sales & Customer Intelligence Platform

[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![DuckDB](https://img.shields.io/badge/Engine-DuckDB-FFF000?style=flat-square&logo=duckdb&logoColor=black)](https://duckdb.org/)
[![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Build-Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.style=flat-square)](LICENSE)

An enterprise-grade data engineering, machine learning, and business intelligence platform. This repository implements an end-to-end medallion data lakehouse pipeline—transforming raw CRM and ERP transactional data into a Gold star-schema warehouse, training unsupervised machine learning models for customer segmentation, forecasting 12-month Customer Lifetime Value (CLV), and presenting actionable insights via a human-designed enterprise analytics web dashboard.

---

## 🏛️ Medallion Architecture & Data Pipeline

```text
                               ┌────────────────────────────────────────┐
                               │   RAW DATA SOURCES (CRM & ERP CSVs)    │
                               └───────────────────┬────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ BRONZE SCHEMA (Ingestion)                                                                           │
│   • crm_cust_info   • crm_prd_info   • crm_sales_details   • erp_cust_az12   • erp_loc_a101   • erp_px │
└──────────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                   │
                                                   ▼  [SQL Data Quality Audits & Transformation]
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SILVER SCHEMA (Cleaned & Standardized)                                                              │
│   • Gender/Marital status normalization   • Cost/Price anomaly fixes   • Deduplicated surrogate keys    │
└──────────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                   │
                                                   ▼  [Dimensional Data Modeling]
┌─────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GOLD SCHEMA (Star Schema Data Warehouse)                                                            │
│   • dim_customers   • dim_products   • fact_sales   • customer_rfm_base   • cohort_retention          │
└────────┬─────────────────────────────────────────┬──────────────────────────────────────────────────┘
         │                                         │
         ▼                                         ▼
┌───────────────────────────────────────┐ ┌──────────────────────────────────────────────────────────┐
│ MACHINE LEARNING PIPELINE             │ │ ANALYTICAL QUERY ENGINE (DuckDB)                         │
│ • K-Means RFM Clustering (K=4)        │ │ • Executive KPIs & Geographic Performance                │
│ • BG/NBD & Gamma-Gamma CLV Prediction │ │ • Product Pareto 80/20 Concentration                     │
│ • Cohort Retention Decay Matrix       │ │ • Monthly Sales Growth & Rolling Averages                │
└──────────────────┬────────────────────┘ └────────────────────────────┬─────────────────────────────┘
                   │                                                   │
                   └───────────────────────┬───────────────────────────┘
                                           │
                                           ▼  [Static Export Pipeline: python/export_data.py]
                            ┌─────────────────────────────┐
                            │  JSON ANALYTICAL DATASETS   │
                            │ (dashboard/public/data/*.json)│
                            └──────────────┬──────────────┘
                                           │
                                           ▼
                            ┌─────────────────────────────┐
                            │ ENTERPRISE REACT DASHBOARD  │
                            │  (Human-Designed UI/UX)     │
                            └─────────────────────────────┘
```

---

## ✨ Key Platform Features

* **Medallion Data Lakehouse:** Automated multi-stage SQL pipeline (`Bronze` $\rightarrow$ `Silver` $\rightarrow$ `Gold`) utilizing **DuckDB** for ultra-fast, local in-memory analytical processing.
* **Automated Data Quality Audits:** Pre-ingestion validation checking for missing primary keys, duplicate records, invalid date bounds, and referential integrity mismatches.
* **Dimensional Data Warehouse:** Star-schema architecture featuring central transaction table (`fact_sales`) joined with customer (`dim_customers`) and product (`dim_products`) dimensions.
* **Machine Learning Customer Segmentation:**
  * **RFM Base Feature Pre-computation:** Recency, Frequency, and Monetary feature extraction.
  * **K-Means Clustering ($K=4$):** Evaluated via Silhouette Score ($0.602$) and 2D/3D Principal Component Analysis (PCA).
  * **Behavioral Cohorts:** Champions, Loyal Core, At-Risk, and Hibernating customer segments.
* **Probabilistic Predictive CLV:** **BG/NBD** (Beta-Geometric / Negative Binomial Distribution) transaction frequency modeling combined with **Gamma-Gamma** monetary value forecasting.
* **Cohort Retention Analysis:** Full monthly acquisition matrix ($M_0 \dots M_{12}$) calculating re-engagement velocity and long-term customer decay rates.
* **Human-Designed Enterprise UI/UX:**
  * Built with React 19, Vite 8, Chart.js, and a bespoke light neutral design system.
  * Information-dense layout inspired by enterprise products (Linear, Stripe, Vercel, Notion).
  * 5 Dedicated Views: *Executive Overview*, *Product Pareto & Catalog*, *ML Segmentation & Playbooks*, *Cohort Retention Matrix*, and *Analytical Report & Findings*.

---

## 🛠️ Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **SQL Engine** | **DuckDB** | Columnar analytical processing engine & local data warehouse storage. |
| **Data Science & ML** | **Python 3.12 / Scikit-Learn** | Feature normalization, K-Means clustering, PCA, BG/NBD & Gamma-Gamma CLV. |
| **Data Analysis** | **Pandas / NumPy** | Matrix transformations, cohort aggregations, and data validation. |
| **Frontend UI** | **React 19 / Vite 8** | Modern single-page web application with modular React component architecture. |
| **Visualization** | **Chart.js / React-Chartjs-2** | Custom interactive line charts, bar charts, and doughnut distribution charts. |
| **DevOps & Container** | **Docker / Docker Compose** | Multi-stage Docker build served via Nginx web server. |
| **Hosting** | **Vercel** | Serverless global CDN deployment with zero server maintenance overhead. |

---

## 📁 Repository Structure

```text
Retail-Customer-Intelligence/
├── data/
│   ├── raw/                               <- Raw CRM & ERP CSV data extracts
│   └── processed/                         <- DuckDB data warehouse binary (warehouse.db)
│
├── sql/                                   <- Medallion SQL ETL & Analytical Queries
│   ├── 00_init_database.sql               <- Database schema setup & Bronze CSV loader
│   ├── 01_data_quality_checks.sql         <- Data quality audit suite & anomaly detection
│   ├── 02_data_cleaning.sql               <- Silver layer cleaning & transformations
│   ├── 03_data_modeling.sql               <- Gold star schema setup (fact_sales, dim_*)
│   ├── 04_kpi_analysis.sql                <- Executive KPI calculations & geographic breakdown
│   ├── 05_time_series_analysis.sql        <- Monthly revenue growth & 3-month rolling averages
│   ├── 06_product_analysis.sql            <- Product category analysis & Pareto 80/20 calculation
│   ├── 07_customer_analytics.sql          <- RFM base feature pre-computation view
│   └── 08_cohort_retention.sql            <- Acquisition cohort retention matrix view
│
├── python/                                <- Data Science & Pipeline Automation
│   ├── build_dw.py                        <- End-to-end Medallion pipeline runner
│   ├── run_sql.py                         <- SQL execution wrapper for DuckDB
│   ├── export_data.py                     <- Queries Gold warehouse & exports JSON files
│   ├── 02_rfm_scoring.ipynb               <- RFM scoring notebook & distribution visualization
│   ├── 03_statistical_analysis.ipynb      <- K-Means clustering & PCA evaluation notebook
│   └── 04_predictive_clv.ipynb            <- BG/NBD & Gamma-Gamma probabilistic CLV model
│
├── dashboard/                             <- Enterprise React Web Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                 <- Top navigation bar & live DuckDB status badge
│   │   │   ├── KpiSummary.jsx             <- Compact high-density KPI metrics strip
│   │   │   ├── OverviewTab.jsx            <- Executive overview & monthly revenue trends
│   │   │   ├── ProductParetoTab.jsx       <- Category breakdown & Pareto 80/20 table
│   │   │   ├── CustomerSegmentationTab.jsx<- Segment selector & Strategy Playbooks
│   │   │   ├── CohortRetentionTab.jsx     <- Cohort retention heatmap matrix
│   │   │   ├── AnalyticalFindingsTab.jsx  <- Formal data science executive report view
│   │   │   └── Icons.jsx                  <- Feather/Lucide SVG icon suite
│   │   ├── App.jsx                        <- Main application entry component
│   │   └── App.css                        <- Design system, color tokens & typography
│   ├── public/data/                       <- Pre-computed analytical JSON datasets
│   ├── Dockerfile                         <- Multi-stage Docker container specification
│   └── package.json
│
├── docs/                                  <- Enterprise Documentation & Business Reports
│   ├── business_questions.md              <- Strategic analytics question catalog
│   ├── data_dictionary.md                 <- Enterprise data dictionary & schema mapping
│   └── business_report.md                 <- Executive report with strategic recommendations
│
├── docker-compose.yml                     <- Single-command Docker service deployment
└── requirements.txt                       <- Python data science dependencies
```

---

## ⚡ Quick Start Guide

### 1. Environment Setup & Data Pipeline Execution
Set up a Python 3.12 virtual environment and execute the full Medallion pipeline to build the database warehouse:

```bash
# Clone repository
git clone https://github.com/kushchhabra0/Retail-Customer-Intelligence.git
cd Retail-Customer-Intelligence

# Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate  # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run the Medallion Data Warehouse build runner
python python/build_dw.py
```

### 2. Export Analytical JSON Datasets
Run the dataset exporter script to update pre-computed JSON files for the frontend dashboard:

```bash
python python/export_data.py
```

### 3. Launch React Dashboard Locally
Navigate to the `dashboard/` folder and start the Vite development server:

```bash
cd dashboard
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the platform.

---

## 🐳 Docker Deployment

The project includes a multi-stage `Dockerfile` and `docker-compose.yml` configuration to compile the React application and serve production static assets using **Nginx**:

```bash
# Build and launch containerized platform
docker-compose up --build
```
Access the running application at [http://localhost:8080](http://localhost:8080).

---

## 📊 Key Business Findings & Executive Summary

* **Executive Revenue Performance:** Total enterprise revenue reached **$29.35M** across **27,659 orders** with an Average Order Value (AOV) of **$1,061**.
* **Repeat Buyer Base:** **37.14%** of total purchasing accounts are repeat buyers (6,865 customers), providing a predictable baseline revenue stream.
* **Pareto (80/20) Concentration:** Top **15 product SKUs (1.8% of product catalog)** generate **63.05% of total enterprise revenue**, with top 35 SKUs driving 80%. Prioritizing supply chain SLA for these key items prevents stockout losses.
* **Regional Dominance:** The **United States ($9.16M)** and **Australia ($9.06M)** drive over 60% of total revenue. Australia exhibits the highest Average Order Value at **$1,348**.
* **Segment Strategy & CLV:**
  * **Champions (30% of accounts):** High recency and frequency; expected to generate **$3,926 12M CLV**.
  * **At-Risk (13% of accounts):** Formerly active high spenders now dormant >90 days. Automated win-back discount flows can recover substantial high-margin revenue.

---

## 📄 License & Author

This project is open-source under the [MIT License](LICENSE).  
Created as an enterprise analytical portfolio demonstration by **Kushal Chhabra**.
