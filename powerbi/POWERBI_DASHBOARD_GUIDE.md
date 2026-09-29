# Power BI Retail Sales & Customer Analytics Dashboard
## Complete Build Guide

---

## Table of Contents

1. [Data Import & Model Setup](#1-data-import--model-setup)
2. [Relationships (Star Schema)](#2-relationships-star-schema)
3. [DAX Measures](#3-dax-measures)
4. [Page 1 – Executive Sales Overview](#4-page-1--executive-sales-overview)
5. [Page 2 – Sales & Product Analysis](#5-page-2--sales--product-analysis)
6. [Page 3 – Customer Analysis](#6-page-3--customer-analysis)
7. [Page 4 – Operational Analysis](#7-page-4--operational-analysis)
8. [Page 5 – Data Quality & Pipeline Monitoring](#8-page-5--data-quality--pipeline-monitoring)
9. [Design Standards](#9-design-standards)

---

## 1. Data Import & Model Setup

### Step 1: Open Power BI Desktop
- File -> New Report

### Step 2: Import CSV Files
- Home -> Get Data -> Text/CSV
- Navigate to `powerbi/data/` and import each file:

| File | Table Name | Role |
|------|-----------|------|
| `fact_sales.csv` | fact_sales | Fact table (60,379 rows) |
| `dim_customers.csv` | dim_customers | Dimension |
| `dim_products.csv` | dim_products | Dimension |
| `dim_date.csv` | dim_date | Date dimension (1,127 days) |
| `data_quality_audit.csv` | data_quality_audit | Audit results |

### Step 3: Data Type Validation
In Power Query Editor (Transform Data), verify:

**fact_sales:**
| Column | Type |
|--------|------|
| order_number | Text |
| product_key | Whole Number |
| customer_key | Whole Number |
| order_date | Date |
| shipping_date | Date |
| due_date | Date |
| sales_amount | Decimal Number |
| quantity | Whole Number |
| unit_price | Decimal Number |

**dim_date:**
| Column | Type |
|--------|------|
| date | Date |
| year | Whole Number |
| quarter | Whole Number |
| month_num | Whole Number |
| is_weekend | True/False |
| fiscal_year | Whole Number |

> **IMPORTANT:** Mark `dim_date` as the **Date Table**:
> - Select `dim_date` in Model view
> - Table tools -> Mark as date table -> Column: `date`

---

## 2. Relationships (Star Schema)

Create these relationships in **Model View** (drag & drop):

```
dim_date.date  -------->  fact_sales.order_date       (1:Many)
dim_customers.customer_key -->  fact_sales.customer_key  (1:Many)
dim_products.product_key  -->  fact_sales.product_key   (1:Many)
```

All relationships should be **Single direction** (from Dimension to Fact), **Active**, and **Cross-filter direction: Single**.

---

## 3. DAX Measures

Create a new **Measures Table**: Modeling -> New Table -> `Measures = {BLANK()}`

Then add each measure below.

### 3.1 Core Revenue Measures

```dax
Total Revenue =
    SUM(fact_sales[sales_amount])

Total Orders =
    DISTINCTCOUNT(fact_sales[order_number])

Total Units Sold =
    SUM(fact_sales[quantity])

Total Customers =
    DISTINCTCOUNT(fact_sales[customer_key])

Average Order Value =
    DIVIDE([Total Revenue], [Total Orders], 0)

Average Revenue Per Customer =
    DIVIDE([Total Revenue], [Total Customers], 0)

Average Unit Price =
    DIVIDE([Total Revenue], [Total Units Sold], 0)
```

### 3.2 Time Intelligence Measures

```dax
Revenue LY =
    CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(dim_date[date]))

Revenue YoY Growth % =
    VAR _current = [Total Revenue]
    VAR _previous = [Revenue LY]
    RETURN
        DIVIDE(_current - _previous, _previous, 0)

Revenue MoM Growth % =
    VAR _current = [Total Revenue]
    VAR _previous = CALCULATE([Total Revenue], DATEADD(dim_date[date], -1, MONTH))
    RETURN
        DIVIDE(_current - _previous, _previous, 0)

Revenue MTD =
    TOTALMTD([Total Revenue], dim_date[date])

Revenue YTD =
    TOTALYTD([Total Revenue], dim_date[date])

Revenue QTD =
    TOTALQTD([Total Revenue], dim_date[date])

Cumulative Revenue =
    CALCULATE(
        [Total Revenue],
        FILTER(
            ALL(dim_date),
            dim_date[date] <= MAX(dim_date[date])
        )
    )

Rolling 3M Average Revenue =
    CALCULATE(
        [Total Revenue] / 3,
        DATESINPERIOD(dim_date[date], MAX(dim_date[date]), -3, MONTH)
    )
```

### 3.3 Customer Measures

```dax
New Customers =
    VAR _minDateInContext = MIN(dim_date[date])
    VAR _maxDateInContext = MAX(dim_date[date])
    RETURN
    CALCULATE(
        DISTINCTCOUNT(fact_sales[customer_key]),
        FILTER(
            VALUES(fact_sales[customer_key]),
            CALCULATE(
                MIN(fact_sales[order_date]),
                ALL(dim_date)
            ) >= _minDateInContext
            && CALCULATE(
                MIN(fact_sales[order_date]),
                ALL(dim_date)
            ) <= _maxDateInContext
        )
    )

Returning Customers =
    [Total Customers] - [New Customers]

Repeat Purchase Rate % =
    VAR _repeatCustomers =
        CALCULATE(
            DISTINCTCOUNT(fact_sales[customer_key]),
            FILTER(
                ADDCOLUMNS(
                    VALUES(fact_sales[customer_key]),
                    "@orders", CALCULATE(DISTINCTCOUNT(fact_sales[order_number]))
                ),
                [@orders] > 1
            )
        )
    RETURN
        DIVIDE(_repeatCustomers, [Total Customers], 0)

Customer Lifetime Value =
    DIVIDE([Total Revenue], [Total Customers], 0)
```

### 3.4 Product Measures

```dax
Margin =
    SUM(fact_sales[sales_amount]) - SUMX(
        fact_sales,
        fact_sales[quantity] * RELATED(dim_products[cost])
    )

Margin % =
    DIVIDE([Margin], [Total Revenue], 0)

Category Revenue Contribution % =
    DIVIDE(
        [Total Revenue],
        CALCULATE([Total Revenue], ALL(dim_products[category])),
        0
    )

Subcategory Revenue Contribution % =
    DIVIDE(
        [Total Revenue],
        CALCULATE([Total Revenue], ALL(dim_products[subcategory])),
        0
    )
```

### 3.5 Operational Measures

```dax
Avg Fulfillment Days =
    AVERAGEX(
        FILTER(
            fact_sales,
            NOT(ISBLANK(fact_sales[shipping_date]))
                && NOT(ISBLANK(fact_sales[order_date]))
        ),
        DATEDIFF(fact_sales[order_date], fact_sales[shipping_date], DAY)
    )

Avg Delivery Lead Time =
    AVERAGEX(
        FILTER(
            fact_sales,
            NOT(ISBLANK(fact_sales[due_date]))
                && NOT(ISBLANK(fact_sales[order_date]))
        ),
        DATEDIFF(fact_sales[order_date], fact_sales[due_date], DAY)
    )

On-Time Delivery Rate % =
    DIVIDE(
        CALCULATE(
            COUNT(fact_sales[order_number]),
            fact_sales[shipping_date] <= fact_sales[due_date]
        ),
        COUNT(fact_sales[order_number]),
        0
    )

Orders Per Day =
    DIVIDE(
        [Total Orders],
        DISTINCTCOUNT(dim_date[date]),
        0
    )
```

### 3.6 Data Quality Measures

```dax
Total Audit Checks =
    COUNTROWS(data_quality_audit)

Passed Checks =
    CALCULATE(
        COUNTROWS(data_quality_audit),
        data_quality_audit[status] = "PASS"
    )

Failed Checks =
    CALCULATE(
        COUNTROWS(data_quality_audit),
        data_quality_audit[status] = "FAIL"
    )

Pass Rate % =
    DIVIDE([Passed Checks], [Passed Checks] + [Failed Checks], 0)

Total Issues Found =
    CALCULATE(
        SUM(data_quality_audit[issue_count]),
        data_quality_audit[status] = "FAIL"
    )
```

---

## 4. Page 1 -- Executive Sales Overview

### KPI Cards (top row)

| Card | Measure | Format |
|------|---------|--------|
| Total Revenue | [Total Revenue] | $#,##0 |
| Total Orders | [Total Orders] | #,##0 |
| Total Customers | [Total Customers] | #,##0 |
| Avg Order Value | [Average Order Value] | $#,##0.00 |
| YoY Growth | [Revenue YoY Growth %] | 0.0% (conditional color) |

### Charts

| Visual | Config |
|--------|--------|
| **Line Chart** | X: dim_date[year_month], Y: [Total Revenue], Y2: [Rolling 3M Average Revenue]. Add trend line. |
| **Stacked Bar** | X: dim_date[year], Legend: dim_date[quarter_label], Y: [Total Revenue] |
| **Donut Chart** | Legend: dim_customers[country], Values: [Total Revenue], Labels: % |
| **KPI Cards (bottom)** | [Revenue YTD], [Revenue MTD], [Cumulative Revenue] |

### Slicers
- dim_date[year] (Dropdown)
- dim_date[quarter_label] (Buttons)
- dim_customers[country] (Dropdown)

---

## 5. Page 2 -- Sales & Product Analysis

### Visuals

| # | Visual | Config |
|---|--------|--------|
| 1 | **Treemap** | Group: category -> subcategory, Values: [Total Revenue] |
| 2 | **Matrix** | Rows: category + subcategory, Values: Revenue, Units, AOV, Margin%. Conditional formatting on Margin%. |
| 3 | **Horizontal Bar** | Y: product_name, X: [Total Revenue], Top N = 10, sorted desc |
| 4 | **Horizontal Bar** | Y: product_name, X: [Total Units Sold], Top N = 10 |
| 5 | **Clustered Column** | X: product_line, Y: [Total Revenue] |
| 6 | **Stacked Area** | X: year_month, Legend: category, Y: [Total Revenue] |

### Slicers
- dim_products[category] (Dropdown)
- dim_products[subcategory] (Dropdown)

---

## 6. Page 3 -- Customer Analysis

### KPI Cards

| Card | Measure |
|------|---------|
| Total Customers | [Total Customers] |
| New Customers | [New Customers] |
| Returning Customers | [Returning Customers] |
| Repeat Purchase Rate | [Repeat Purchase Rate %] |

### Visuals

| # | Visual | Config |
|---|--------|--------|
| 1 | **Clustered Column** | X: dim_date[year], Y: [New Customers] & [Returning Customers] |
| 2 | **Pie Chart** | Legend: gender, Values: [Total Customers] |
| 3 | **Stacked Bar** | Y: country, X: [Total Customers], sorted desc |
| 4 | **Column** | X: marital_status, Y: [Total Customers] |
| 5 | **Line Chart** | X: year_month, Y: [New Customers] -- acquisition trend |
| 6 | **Matrix** | Rows: country, Cols: gender, Values: [Total Customers], [Avg Rev Per Customer] |

### Slicers
- dim_customers[gender] (Buttons)
- dim_customers[country] (Dropdown)
- dim_customers[marital_status] (Buttons)

---

## 7. Page 4 -- Operational Analysis

### KPI Cards

| Card | Measure | Format |
|------|---------|--------|
| Avg Fulfillment Days | [Avg Fulfillment Days] | 0.0 |
| Avg Lead Time | [Avg Delivery Lead Time] | 0.0 |
| On-Time Rate | [On-Time Delivery Rate %] | 0.0% |
| Orders/Day | [Orders Per Day] | 0.0 |

### Visuals

| # | Visual | Config |
|---|--------|--------|
| 1 | **Line Chart** | X: year_month, Y: [Avg Fulfillment Days], Y2: [Avg Delivery Lead Time] |
| 2 | **Matrix (Heatmap)** | Rows: day_name, Cols: month_short, Values: [Total Orders]. Background color gradient. |
| 3 | **Bar Chart** | Y: category, X: [Avg Fulfillment Days], sorted desc |
| 4 | **Column Chart** | X: day_name, Y: [Total Orders] |
| 5 | **Scatter** | X: [Total Units Sold], Y: [Total Revenue], Size: [Total Orders], Legend: category |

---

## 8. Page 5 -- Data Quality & Pipeline Monitoring

### KPI Cards

| Card | Measure | Color |
|------|---------|-------|
| Total Checks | [Total Audit Checks] | Default |
| Passed | [Passed Checks] | Green font |
| Failed | [Failed Checks] | Red font |
| Pass Rate | [Pass Rate %] | Conditional |

### Visuals

| # | Visual | Config |
|---|--------|--------|
| 1 | **Stacked Bar** | Y: audit_category, Legend: status, X: count. PASS=green, FAIL=red. |
| 2 | **Table** | Columns: check_name, issue_count, status. Conditional formatting on status. |
| 3 | **Donut** | Legend: status, Values: count. PASS=#2A9D8F, FAIL=#E76F51. |
| 4 | **Table** | Filter: audit_category = "ROW COUNT". Shows pipeline record flow. |

---

## 9. Design Standards

### Color Palette

| Element | Hex |
|---------|-----|
| Primary Accent (Deep Indigo) | `#1B2A4A` |
| Secondary (Slate Blue) | `#3D5A80` |
| Positive (Muted Teal) | `#2A9D8F` |
| Negative (Coral Red) | `#E76F51` |
| Neutral Labels | `#2D3436` |
| Background | `#FAFAFA` |
| Card Background | `#FFFFFF` |
| Grid / Dividers | `#E8E8E8` |
| Category 1 | `#264653` |
| Category 2 | `#2A9D8F` |
| Category 3 | `#E9C46A` |
| Category 4 | `#F4A261` |
| Category 5 | `#E76F51` |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Page Title | Segoe UI | 20pt | Bold |
| Section Header | Segoe UI | 14pt | Semibold |
| KPI Value | Segoe UI | 28pt | Bold |
| KPI Label | Segoe UI | 10pt | Regular |
| Axis Labels | Segoe UI | 9pt | Regular |
| Data Labels | Segoe UI | 8pt | Regular |

### Formatting Rules

1. **Currency values**: `$#,##0` (no decimals) or `$#,##0.00` for AOV
2. **Percentages**: `0.0%`
3. **Large numbers**: `#,##0` with thousands separator
4. **Cards**: White bg, subtle shadow, 2px left-border accent color
5. **Charts**: Remove secondary gridlines, keep subtle horizontal gridlines
6. **Rounding**: 2 decimal places for money, 1 for percentages

### Interactivity

- Cross-filtering: enabled on all pages
- Drill-through: product/customer detail pages
- Bookmarks: create for page navigation
- Tooltips: custom tooltip pages for hover details

---

## Quick Start Checklist

- [ ] Import 5 CSV files from `powerbi/data/`
- [ ] Validate data types in Power Query
- [ ] Mark `dim_date` as Date Table
- [ ] Create 3 star-schema relationships
- [ ] Create Measures table with all DAX formulas
- [ ] Build Page 1: Executive Overview
- [ ] Build Page 2: Sales & Products
- [ ] Build Page 3: Customer Analysis
- [ ] Build Page 4: Operational Analysis
- [ ] Build Page 5: Data Quality
- [ ] Apply color palette
- [ ] Add page navigation
- [ ] Test cross-filtering
- [ ] Save as `.pbix` file
