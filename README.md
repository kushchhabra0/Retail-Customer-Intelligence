# End-to-End Retail Sales & Customer Intelligence Analytics

A production-grade, next-level data analytics and data science portfolio project. This repository implements a complete analytical pipeline—transforming raw transactional CRM/ERP data into a star schema warehouse, training machine learning models for customer segmentation, and presenting insights through a glassmorphic React dashboard containerized with Docker and ready for direct Vercel deployment.

---

## 🚀 Project Architecture

```text
  Raw CSV Data (CRM & ERP)
             │
             ▼  [Step 1: SQL ETL & Cleaning via DuckDB]
   Silver Schema Tables
             │
             ▼  [Step 2: Star Schema Modeling]
   Gold Schema (Fact & Dimensions)
             │
             ├──► [Step 3: Machine Learning Segmentation (K-Means)]
             └──► [Step 4: Predictive CLV Modeling (Gradient Boosting)]
             │
             ▼  [Step 5: SQL Export Pipeline]
      Static JSON Datasets (dashboard/public/data/)
             │
             ▼  [Step 6: Presentation Layer]
   Glassmorphic React + Vite Web App
             │
     ┌───────┴───────┐
     ▼               ▼
[Vercel Deploy]  [Docker Container]
```

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Query Engine** | **DuckDB** | Columnar SQL database for local, high-speed analytical ETL. |
| **Data Science** | **Python 3.12** | Feature scaling, clustering, and predictive CLV modeling. |
| **ML Framework** | **Scikit-Learn** | K-Means clustering and Gradient Boosting Regressor. |
| **Frontend App** | **React + Vite** | Modern SPA with custom glassmorphic styling (Vanilla CSS). |
| **Charts** | **Chart.js** | Interactive line, bar, and doughnut visualizations. |
| **DevOps** | **Docker** | Containerizes the dashboard using multi-stage builds. |
| **Hosting** | **Vercel** | Serverless hosting directly via GitHub integration. |

---

## 📁 Repository Structure

```text
data-analysis/
│
├── data/
│   ├── raw/                               <- Raw CRM and ERP CSV extracts
│   └── processed/                         <- Local DuckDB database file
│
├── sql/                                   <- ETL and Analytical SQL scripts
│   ├── 00_init_database.sql               <- DB Schemas and CSV load
│   ├── 02_data_cleaning.sql               <- Silver layer cleaning
│   ├── 03_data_modeling.sql               <- Gold star schema setup
│   ├── 04_kpi_analysis.sql                <- Executive KPI calculations
│   ├── 05_time_series_analysis.sql        <- Month-over-Month growth
│   ├── 06_product_analysis.sql            <- Product category and Pareto (80/20)
│   ├── 07_customer_analytics.sql          <- RFM base features view
│   └── 08_cohort_retention.sql            <- Cohort retention matrix
│
├── python/                                <- Machine learning and automation
│   ├── build_dw.py                        <- Pipeline orchestrator
│   ├── run_sql.py                         <- SQL execution runner
│   ├── export_data.py                     <- Queries database and writes JSON files
│   ├── 02_rfm_scoring.ipynb               <- K-Means clustering notebook
│   ├── 03_statistical_analysis.ipynb      <- T-Test/ANOVA statistical tests
│   └── 04_predictive_clv.ipynb            <- ML-based CLV prediction
│
├── dashboard/                             <- React web application
│   ├── src/                               <- React components and vanilla CSS
│   ├── public/data/                       <- Exported analytical JSON files
│   ├── Dockerfile                         <- Multi-stage container build
│   └── package.json
│
├── docs/                                  <- Project reports and documentation
│   ├── business_questions.md
│   ├── data_dictionary.md
│   └── business_report.md                 <- Actionable findings report
│
├── docker-compose.yml                     <- Launches local Docker dashboard
└── requirements.txt                       <- Python dependencies
```

---

## ⚙️ Running Locally

### 1. Database ETL Build
Set up a Python virtual environment, install requirements, and run the pipeline runner. This will load the raw CSVs into DuckDB, run the cleaning SQL scripts, and compile the final Gold schemas:

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the SQL ETL pipeline
python python/build_dw.py
```

### 2. Run Machine Learning & Export Datasets
Execute the customer clustering and CLV scripts, then run the exporter to dump reporting queries to JSON files for the frontend:

```bash
# Run clustering and CLV computations
python scratch/run_clustering.py
python scratch/run_clv.py

# Export analytical tables to JSON
python python/export_data.py
```

### 3. Start React Dashboard
```bash
cd dashboard
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the interactive dashboard.

---

## 🐳 Running with Docker

You can compile the production dashboard assets and serve them inside an Nginx container using the root `docker-compose.yml` file:

```bash
# Spin up the containerized dashboard
docker-compose up --build
```
The dashboard will start immediately on [http://localhost:8080](http://localhost:8080).

---

## ☁️ Deploying to Vercel (via Direct GitHub)

Since we export all query results to static JSON files in `dashboard/public/data/` during our local pipeline runs, the React dashboard operates fully client-side. This allows it to be hosted on Vercel for free with zero database hosting overhead.

### Steps to Deploy:
1. Push this workspace to your public or private **GitHub** repository.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your repository from the Git integration list.
4. **Configuration Settings**:
   - **Framework Preset**: Select **Vite**.
   - **Root Directory**: Select **`dashboard`** (Vercel will build and serve from this folder).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).
5. Click **"Deploy"**.
6. Done! Vercel will build your React code and serve the dashboard globally on their CDN.

---

## 📈 Key Business Insights & Recommendations
Our analytical pipeline extracted the following key findings:
- **Revenue Driver**: **Bikes** generate **96.4%** of total revenue. Accessories drive order counts but contribute minor sales value.
- **Pareto Rule**: **26.9%** of products (35 items) drive **80%** of total revenue. Ensure these bike models never experience stockouts.
- **Top Region**: The **United States** ($9.16M) and **Australia** ($9.06M) represent the primary revenue engines. Notably, Australia shows the highest purchase power ($1,348 AOV).
- **Customer Segmentation**:
  - **Champions** (5,608 customers): Low recency, high frequency, and high monetary spend. Focus on VIP rewards and early model releases.
  - **At Risk** (2,459 customers): Unactive for >240 days. Trigger automatic discount campaigns to reactivate them before they churn.
