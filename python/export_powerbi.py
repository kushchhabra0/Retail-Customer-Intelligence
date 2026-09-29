"""
Power BI Data Export Pipeline
=============================
Exports Gold star-schema tables and data quality audit results
from DuckDB to CSV files for Power BI Desktop import.

Output:
    powerbi/data/
        fact_sales.csv          - Main transaction fact table
        dim_customers.csv       - Customer dimension
        dim_products.csv        - Product dimension
        dim_date.csv            - Date dimension (generated)
        data_quality_audit.csv  - Pipeline quality audit results
"""

import os
import sys
import duckdb
import pandas as pd
from datetime import datetime

# ─── Configuration ────────────────────────────────────────────────────────────

DB_PATH = "data/processed/retail_analytics.db"
OUTPUT_DIR = "powerbi/data"

# ─── Helper ───────────────────────────────────────────────────────────────────

def export_query(conn, query, filename, output_dir):
    """Run a SQL query and write results to CSV."""
    filepath = os.path.join(output_dir, filename)
    df = conn.execute(query).fetchdf()
    df.to_csv(filepath, index=False)
    print(f"  [OK] {filename:40s} -> {len(df):>7,} rows")
    return df


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("  Power BI Data Export Pipeline")
    print("=" * 70)

    if not os.path.exists(DB_PATH):
        print(f"\n  [ERR] Database not found at '{DB_PATH}'.")
        print("    Run 'python python/build_dw.py' first to build the warehouse.")
        sys.exit(1)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    conn = duckdb.connect(DB_PATH, read_only=True)

    # ── 1. Fact Sales ─────────────────────────────────────────────────────
    print("\n[1/5] Exporting fact_sales ...")
    fact_sales_df = export_query(conn, """
        SELECT
            order_number,
            product_key,
            customer_key,
            CAST(order_date AS DATE)    AS order_date,
            CAST(shipping_date AS DATE) AS shipping_date,
            CAST(due_date AS DATE)      AS due_date,
            ROUND(sales_amount, 2)      AS sales_amount,
            quantity,
            ROUND(price, 2)             AS unit_price
        FROM gold.fact_sales
        WHERE order_date IS NOT NULL
        ORDER BY order_date;
    """, "fact_sales.csv", OUTPUT_DIR)

    # ── 2. Dim Customers ──────────────────────────────────────────────────
    print("\n[2/5] Exporting dim_customers ...")
    export_query(conn, """
        SELECT
            customer_key,
            customer_id,
            customer_number,
            first_name,
            last_name,
            country,
            marital_status,
            gender,
            CAST(birthdate AS DATE) AS birthdate,
            CAST(create_date AS DATE) AS create_date
        FROM gold.dim_customers
        ORDER BY customer_key;
    """, "dim_customers.csv", OUTPUT_DIR)

    # ── 3. Dim Products ───────────────────────────────────────────────────
    print("\n[3/5] Exporting dim_products ...")
    export_query(conn, """
        SELECT
            product_key,
            product_id,
            product_number,
            product_name,
            category_id,
            category,
            subcategory,
            maintenance,
            ROUND(cost, 2) AS cost,
            product_line,
            CAST(start_date AS DATE) AS start_date
        FROM gold.dim_products
        ORDER BY product_key;
    """, "dim_products.csv", OUTPUT_DIR)

    # ── 4. Date Dimension (generated from fact date range) ────────────────
    print("\n[4/5] Generating dim_date ...")
    min_date = fact_sales_df["order_date"].min()
    max_date = fact_sales_df["order_date"].max()

    date_range = pd.date_range(start=min_date, end=max_date, freq="D")
    dim_date = pd.DataFrame({
        "date":           date_range,
        "year":           date_range.year,
        "quarter":        date_range.quarter,
        "quarter_label":  ["Q" + str(q) for q in date_range.quarter],
        "month_num":      date_range.month,
        "month_name":     date_range.strftime("%B"),
        "month_short":    date_range.strftime("%b"),
        "year_month":     date_range.strftime("%Y-%m"),
        "day_of_week":    date_range.dayofweek,       # 0=Mon
        "day_name":       date_range.strftime("%A"),
        "day_of_month":   date_range.day,
        "week_of_year":   date_range.isocalendar().week.values,
        "is_weekend":     date_range.dayofweek >= 5,
        "fiscal_year":    [y + 1 if m >= 7 else y for y, m in zip(date_range.year, date_range.month)],
    })
    filepath = os.path.join(OUTPUT_DIR, "dim_date.csv")
    dim_date.to_csv(filepath, index=False)
    print(f"  [OK] {'dim_date.csv':40s} -> {len(dim_date):>7,} rows  ({min_date} to {max_date})")

    # ── 5. Data Quality Audit Results ─────────────────────────────────────
    print("\n[5/5] Running data quality audits ...")

    audit_queries = {
        # NULL checks
        "NULL: crm_cust_info.cst_id":
            "SELECT COUNT(*) FROM bronze.crm_cust_info WHERE cst_id IS NULL",
        "NULL: crm_prd_info.prd_id":
            "SELECT COUNT(*) FROM bronze.crm_prd_info WHERE prd_id IS NULL",
        "NULL: crm_sales_details.sls_ord_num":
            "SELECT COUNT(*) FROM bronze.crm_sales_details WHERE sls_ord_num IS NULL",
        "NULL: erp_cust_az12.cid":
            "SELECT COUNT(*) FROM bronze.erp_cust_az12 WHERE cid IS NULL",

        # Duplicate checks
        "DUPLICATE: crm_cust_info.cst_id":
            "SELECT COUNT(*) - COUNT(DISTINCT cst_id) FROM bronze.crm_cust_info",
        "DUPLICATE: crm_prd_info.prd_key":
            "SELECT COUNT(*) - COUNT(DISTINCT prd_key) FROM bronze.crm_prd_info",
        "DUPLICATE: erp_cust_az12.cid":
            "SELECT COUNT(*) - COUNT(DISTINCT cid) FROM bronze.erp_cust_az12",

        # Data anomalies
        "ANOMALY: Negative Product Cost":
            "SELECT COUNT(*) FROM bronze.crm_prd_info WHERE prd_cost < 0",
        "ANOMALY: Start > End Date":
            "SELECT COUNT(*) FROM bronze.crm_prd_info WHERE prd_end_dt IS NOT NULL AND prd_start_dt > prd_end_dt",
        "ANOMALY: Negative/Zero Sales":
            "SELECT COUNT(*) FROM bronze.crm_sales_details WHERE sls_sales <= 0",
        "ANOMALY: Negative/Zero Quantity":
            "SELECT COUNT(*) FROM bronze.crm_sales_details WHERE sls_quantity <= 0",
        "ANOMALY: Price Discrepancy":
            "SELECT COUNT(*) FROM bronze.crm_sales_details WHERE sls_sales <> (sls_quantity * sls_price)",
        "ANOMALY: Future Birthdate":
            "SELECT COUNT(*) FROM bronze.erp_cust_az12 WHERE bdate > CURRENT_DATE",

        # Referential integrity
        "REF INTEGRITY: Sales→Customers":
            """SELECT COUNT(*) FROM bronze.crm_sales_details s
               LEFT JOIN bronze.crm_cust_info c ON s.sls_cust_id = c.cst_id
               WHERE c.cst_id IS NULL""",
        "REF INTEGRITY: Sales→Products":
            """SELECT COUNT(*) FROM bronze.crm_sales_details s
               LEFT JOIN bronze.crm_prd_info p ON s.sls_prd_key = p.prd_key
               WHERE p.prd_key IS NULL""",
    }

    # Table row counts
    table_counts = {
        "bronze.crm_cust_info":    "SELECT COUNT(*) FROM bronze.crm_cust_info",
        "bronze.crm_prd_info":     "SELECT COUNT(*) FROM bronze.crm_prd_info",
        "bronze.crm_sales_details":"SELECT COUNT(*) FROM bronze.crm_sales_details",
        "bronze.erp_cust_az12":    "SELECT COUNT(*) FROM bronze.erp_cust_az12",
        "bronze.erp_loc_a101":     "SELECT COUNT(*) FROM bronze.erp_loc_a101",
        "bronze.erp_px_cat_g1v2":  "SELECT COUNT(*) FROM bronze.erp_px_cat_g1v2",
        "gold.dim_customers":      "SELECT COUNT(*) FROM gold.dim_customers",
        "gold.dim_products":       "SELECT COUNT(*) FROM gold.dim_products",
        "gold.fact_sales":         "SELECT COUNT(*) FROM gold.fact_sales",
    }

    audit_rows = []

    for check_name, sql in audit_queries.items():
        category = check_name.split(":")[0].strip()
        val = conn.execute(sql).fetchone()[0]
        status = "PASS" if val == 0 else "FAIL"
        audit_rows.append({
            "audit_category": category,
            "check_name": check_name,
            "issue_count": val,
            "status": status,
        })

    for table_name, sql in table_counts.items():
        layer = table_name.split(".")[0].capitalize()
        val = conn.execute(sql).fetchone()[0]
        audit_rows.append({
            "audit_category": "ROW COUNT",
            "check_name": f"ROW COUNT: {table_name}",
            "issue_count": val,
            "status": f"{layer} Layer",
        })

    audit_df = pd.DataFrame(audit_rows)
    filepath = os.path.join(OUTPUT_DIR, "data_quality_audit.csv")
    audit_df.to_csv(filepath, index=False)
    print(f"  [OK] {'data_quality_audit.csv':40s} -> {len(audit_df):>7,} rows")

    conn.close()

    # ── Summary ───────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("  Export complete! Files written to:  powerbi/data/")
    print("=" * 70)
    print("  Files ready for Power BI Desktop import:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        size = os.path.getsize(os.path.join(OUTPUT_DIR, f))
        print(f"    • {f:40s} ({size / 1024:.1f} KB)")
    print()


if __name__ == "__main__":
    main()
