-- ==============================================================================
-- SQL Script: Time-Series Analytics (Revenue Trends and Growth)
-- ==============================================================================
-- Description:
--   Aggregates sales transactions by month to evaluate monthly revenue trends,
--   Month-over-Month (MoM) growth rates, cumulative running totals, and
--   rolling averages using SQL window functions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Monthly Sales & Customer Trends with Window Metrics
-- ------------------------------------------------------------------------------
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
    order_month,
    revenue,
    total_orders,
    unique_customers,
    -- Month-over-Month Growth Rate
    (revenue - LAG(revenue) OVER (ORDER BY order_month)) 
        / NULLIF(LAG(revenue) OVER (ORDER BY order_month), 0) AS mom_growth,
    -- Cumulative Revenue (Running Total)
    SUM(revenue) OVER (
        ORDER BY order_month 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_revenue,
    -- 3-Month Rolling Average of Revenue
    AVG(revenue) OVER (
        ORDER BY order_month 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS rolling_avg_3m
FROM monthly_sales
ORDER BY order_month;
