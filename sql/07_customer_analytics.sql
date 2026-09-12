-- ==============================================================================
-- SQL Script: RFM Base Features Pre-computation
-- ==============================================================================
-- Description:
--   Creates a view 'gold.customer_rfm_base' that computes Recency, Frequency,
--   and Monetary (RFM) values for each customer.
--   - Recency: Days from customer's last order to the maximum order date in the dataset.
--   - Frequency: Total count of unique orders.
--   - Monetary: Total revenue contributed by the customer.
-- ==============================================================================

-- Drop view if it exists to allow clean re-runs
DROP VIEW IF EXISTS gold.customer_rfm_base;

-- Create view
CREATE VIEW gold.customer_rfm_base AS
WITH max_date AS (
    SELECT MAX(order_date) AS max_order_dt FROM gold.fact_sales
)
SELECT 
    f.customer_key,
    c.customer_id,
    c.customer_number,
    DATE_DIFF('day', MAX(f.order_date), (SELECT max_order_dt FROM max_date)) AS recency,
    COUNT(DISTINCT f.order_number) AS frequency,
    SUM(f.sales_amount) AS monetary,
    c.country,
    c.gender,
    c.marital_status
FROM gold.fact_sales f
JOIN gold.dim_customers c ON f.customer_key = c.customer_key
WHERE f.order_date IS NOT NULL
GROUP BY f.customer_key, c.customer_id, c.customer_number, c.country, c.gender, c.marital_status;

-- Log a sample of the view for verification
SELECT * FROM gold.customer_rfm_base 
ORDER BY monetary DESC 
LIMIT 10;
