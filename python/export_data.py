import os
import sys
import json
import duckdb

def export_to_json(db_path, output_dir):
    """
    Queries DuckDB and exports results to JSON files inside the dashboard public folder.
    """
    print(f"Connecting to database: {db_path}")
    conn = duckdb.connect(db_path)
    
    os.makedirs(output_dir, exist_ok=True)
    
    queries = {
        # 1. Executive KPIs
        "kpi_summary": """
            WITH customer_orders AS (
                SELECT 
                    customer_key, 
                    COUNT(DISTINCT order_number) AS order_cnt
                FROM gold.fact_sales
                GROUP BY customer_key
            ),
            kpis AS (
                SELECT 
                    SUM(sales_amount) AS total_revenue,
                    COUNT(DISTINCT order_number) AS total_orders,
                    COUNT(DISTINCT customer_key) AS total_customers
                FROM gold.fact_sales
            ),
            retention AS (
                SELECT 
                    COUNT(*) AS total_purchasing_customers,
                    SUM(CASE WHEN order_cnt > 1 THEN 1 ELSE 0 END) AS repeat_customers,
                    CAST(SUM(CASE WHEN order_cnt > 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) AS repeat_rate
                FROM customer_orders
            )
            SELECT 
                r.total_revenue,
                r.total_orders,
                r.total_customers,
                ROUND(r.total_revenue / r.total_orders, 2) AS average_order_value,
                ROUND(r.total_revenue / r.total_customers, 2) AS average_revenue_per_customer,
                ret.repeat_customers,
                ROUND(ret.repeat_rate * 100, 2) AS repeat_rate_pct
            FROM kpis r
            CROSS JOIN retention ret;
        """,
        
        # 2. Country Sales Performance
        "country_performance": """
            SELECT 
                c.country,
                COUNT(DISTINCT f.order_number) AS total_orders,
                COUNT(DISTINCT f.customer_key) AS unique_customers,
                SUM(f.sales_amount) AS total_revenue,
                ROUND(SUM(f.sales_amount) / COUNT(DISTINCT f.order_number), 2) AS average_order_value
            FROM gold.fact_sales f
            JOIN gold.dim_customers c ON f.customer_key = c.customer_key
            GROUP BY c.country
            ORDER BY total_revenue DESC;
        """,
        
        # 3. Monthly Sales & Customer Trends
        "monthly_sales": """
            WITH monthly_sales AS (
                SELECT 
                    DATE_TRUNC('month', order_date) AS order_month,
                    SUM(sales_amount) AS revenue,
                    COUNT(DISTINCT order_number) AS total_orders,
                    COUNT(DISTINCT customer_key) AS unique_customers
                FROM gold.fact_sales
                WHERE order_date IS NOT NULL
                GROUP BY DATE_TRUNC('month', order_date)
            )
            SELECT 
                CAST(order_month AS VARCHAR) AS order_month,
                revenue,
                total_orders,
                unique_customers,
                ROUND(COALESCE((revenue - LAG(revenue) OVER (ORDER BY order_month)) 
                    / NULLIF(LAG(revenue) OVER (ORDER BY order_month), 0), 0) * 100, 2) AS mom_growth_pct,
                SUM(revenue) OVER (
                    ORDER BY order_month 
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS cumulative_revenue,
                ROUND(AVG(revenue) OVER (
                    ORDER BY order_month 
                    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
                ), 2) AS rolling_avg_3m
            FROM monthly_sales
            ORDER BY order_month;
        """,
        
        # 4. Product Category/Subcategory performance
        "product_performance": """
            SELECT 
                p.category,
                p.subcategory,
                SUM(f.sales_amount) AS total_revenue,
                SUM(f.quantity) AS total_quantity,
                COUNT(DISTINCT f.order_number) AS total_orders,
                ROUND(AVG(f.price), 2) AS average_price
            FROM gold.fact_sales f
            JOIN gold.dim_products p ON f.product_key = p.product_key
            GROUP BY p.category, p.subcategory
            ORDER BY total_revenue DESC;
        """,
        
        # 5. Top Products (Pareto list)
        "pareto_products": """
            WITH product_revenue AS (
                SELECT 
                    p.product_name,
                    p.category,
                    SUM(f.sales_amount) AS revenue
                FROM gold.fact_sales f
                JOIN gold.dim_products p ON f.product_key = p.product_key
                GROUP BY p.product_name, p.category
            ),
            running_revenue AS (
                SELECT 
                    product_name,
                    category,
                    revenue,
                    SUM(revenue) OVER (ORDER BY revenue DESC) AS running_rev,
                    SUM(revenue) OVER () AS total_rev,
                    ROW_NUMBER() OVER (ORDER BY revenue DESC) AS row_num
                FROM product_revenue
            )
            SELECT 
                row_num AS rank,
                product_name,
                category,
                revenue,
                ROUND(revenue / total_rev * 100, 2) AS pct_contribution,
                ROUND(running_rev / total_rev * 100, 2) AS cumulative_pct_contribution
            FROM running_revenue
            LIMIT 20;
        """,
        
        # 6. Customer Segments (K-Means & CLV results)
        "customer_segments": """
            SELECT 
                segment_name,
                COUNT(*) AS customer_count,
                ROUND(AVG(recency), 1) AS avg_recency,
                ROUND(AVG(frequency), 1) AS avg_frequency,
                ROUND(AVG(monetary), 2) AS avg_spending,
                ROUND(AVG(customer_lifetime_value), 2) AS avg_clv
            FROM gold.customer_segments
            GROUP BY segment_name
            ORDER BY avg_spending DESC;
        """,
        
        # 7. Cohort Retention Matrix
        "cohort_retention": """
            SELECT 
                CAST(cohort_month AS VARCHAR) AS cohort_month,
                cohort_size,
                cohort_index,
                active_customers,
                ROUND(retention_rate * 100, 2) AS retention_pct
            FROM gold.cohort_retention
            ORDER BY cohort_month, cohort_index;
        """
    }
    
    for filename, sql_query in queries.items():
        print(f"Exporting {filename}.json...")
        df = conn.execute(sql_query).fetchdf()
        
        # Convert DataFrame to list of dicts (JSON records)
        records = df.to_dict(orient="records")
        
        output_path = os.path.join(output_dir, f"{filename}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, default=str)
            
    conn.close()
    print("All datasets successfully exported to JSON!")

if __name__ == "__main__":
    db_path = "data/processed/retail_analytics.db"
    # We will export to dashboard/public/data
    output_dir = "dashboard/public/data"
    export_to_json(db_path, output_dir)
