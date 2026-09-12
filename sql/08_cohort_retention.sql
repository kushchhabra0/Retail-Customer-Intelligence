-- ==============================================================================
-- SQL Script: Cohort Retention Analysis
-- ==============================================================================
-- Description:
--   Creates a view 'gold.cohort_retention' that computes the monthly customer
--   cohort retention matrix.
--   - Cohort Month: The month of the customer's first purchase.
--   - Cohort Index: Number of months elapsed since the first purchase.
--   - Retention Rate: Percentage of customers in the cohort active in index month.
-- ==============================================================================

-- Drop view if it exists to allow clean re-runs
DROP VIEW IF EXISTS gold.cohort_retention;

-- Create view
CREATE VIEW gold.cohort_retention AS
WITH customer_first_purchase AS (
    SELECT 
        customer_key,
        DATE_TRUNC('month', MIN(order_date)) AS cohort_month
    FROM gold.fact_sales
    WHERE order_date IS NOT NULL
    GROUP BY customer_key
),
customer_transactions AS (
    SELECT DISTINCT 
        f.customer_key,
        DATE_TRUNC('month', f.order_date) AS order_month
    FROM gold.fact_sales f
    WHERE f.order_date IS NOT NULL
),
cohort_index AS (
    SELECT 
        t.customer_key,
        c.cohort_month,
        t.order_month,
        DATE_DIFF('month', c.cohort_month, t.order_month) AS cohort_index
    FROM customer_transactions t
    JOIN customer_first_purchase c ON t.customer_key = c.customer_key
),
cohort_size AS (
    SELECT 
        cohort_month,
        COUNT(DISTINCT customer_key) AS cohort_size
    FROM customer_first_purchase
    GROUP BY cohort_month
),
cohort_retention_raw AS (
    SELECT 
        c.cohort_month,
        s.cohort_size,
        c.cohort_index,
        COUNT(DISTINCT c.customer_key) AS active_customers
    FROM cohort_index c
    JOIN cohort_size s ON c.cohort_month = s.cohort_month
    GROUP BY c.cohort_month, s.cohort_size, c.cohort_index
)
SELECT 
    cohort_month,
    cohort_size,
    cohort_index,
    active_customers,
    CAST(active_customers AS FLOAT) / cohort_size AS retention_rate
FROM cohort_retention_raw;

-- Log a sample of retention rates for a specific cohort (e.g. 2011-01-01)
SELECT 
    cohort_month,
    cohort_size,
    cohort_index,
    active_customers,
    ROUND(retention_rate * 100, 2) AS retention_pct
FROM gold.cohort_retention 
WHERE cohort_month = '2011-01-01'
ORDER BY cohort_index;
