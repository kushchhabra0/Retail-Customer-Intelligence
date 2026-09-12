-- ==============================================================================
-- SQL Script: Core Business KPI Analysis
-- ==============================================================================
-- Description:
--   Calculates high-level Executive KPIs: Total Revenue, Total Orders, 
--   Unique Customers, Average Order Value (AOV), Average Revenue per Customer 
--   (ARPC), and Repeat Customer Rate.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Executive Summary KPIs
-- ------------------------------------------------------------------------------
WITH customer_orders AS (
    SELECT 
        customer_key, 
        COUNT(DISTINCT order_number) AS order_cnt,
        SUM(sales_amount) AS customer_revenue
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
    r.total_revenue / r.total_orders AS average_order_value,
    r.total_revenue / r.total_customers AS average_revenue_per_customer,
    ret.repeat_customers,
    ret.repeat_rate
FROM kpis r
CROSS JOIN retention ret;


-- ------------------------------------------------------------------------------
-- 2. Geographic KPI Breakdown
-- ------------------------------------------------------------------------------
SELECT 
    c.country,
    COUNT(DISTINCT f.order_number) AS total_orders,
    COUNT(DISTINCT f.customer_key) AS unique_customers,
    SUM(f.sales_amount) AS total_revenue,
    SUM(f.sales_amount) / COUNT(DISTINCT f.order_number) AS average_order_value
FROM gold.fact_sales f
JOIN gold.dim_customers c ON f.customer_key = c.customer_key
GROUP BY c.country
ORDER BY total_revenue DESC;
