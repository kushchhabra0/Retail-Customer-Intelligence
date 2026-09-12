-- ==============================================================================
-- SQL Script: Product Analytics and Pareto (80/20 Rule) Analysis
-- ==============================================================================
-- Description:
--   1. Evaluates revenue, orders, and average price by Category and Subcategory.
--   2. Implements a Pareto Analysis to identify the percentage of products
--      responsible for 80% of the total revenue.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Product Category & Subcategory Performance
-- ------------------------------------------------------------------------------
SELECT 
    p.category,
    p.subcategory,
    SUM(f.sales_amount) AS total_revenue,
    SUM(f.quantity) AS total_quantity,
    COUNT(DISTINCT f.order_number) AS total_orders,
    AVG(f.price) AS average_price
FROM gold.fact_sales f
JOIN gold.dim_products p ON f.product_key = p.product_key
GROUP BY p.category, p.subcategory
ORDER BY total_revenue DESC;


-- ------------------------------------------------------------------------------
-- 2. Pareto 80/20 Rule Aggregation Summary
-- ------------------------------------------------------------------------------
WITH product_revenue AS (
    SELECT 
        p.product_key,
        SUM(f.sales_amount) AS revenue
    FROM gold.fact_sales f
    JOIN gold.dim_products p ON f.product_key = p.product_key
    GROUP BY p.product_key
),
running_revenue AS (
    SELECT 
        product_key,
        revenue,
        SUM(revenue) OVER (ORDER BY revenue DESC) AS running_rev,
        SUM(revenue) OVER () AS total_rev,
        ROW_NUMBER() OVER (ORDER BY revenue DESC) AS row_num,
        COUNT(*) OVER () AS total_products
    FROM product_revenue
)
SELECT 
    SUM(CASE WHEN (running_rev - revenue) / total_rev <= 0.80 THEN 1 ELSE 0 END) AS top_products_count,
    MIN(total_products) AS total_products,
    CAST(SUM(CASE WHEN (running_rev - revenue) / total_rev <= 0.80 THEN 1 ELSE 0 END) AS FLOAT) / MIN(total_products) AS pct_products_driving_80_percent
FROM running_revenue;


-- ------------------------------------------------------------------------------
-- 3. Top 15 Products by Revenue Contribution
-- ------------------------------------------------------------------------------
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
    revenue / total_rev AS pct_contribution,
    running_rev / total_rev AS cumulative_pct_contribution
FROM running_revenue
LIMIT 15;
