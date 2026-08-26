-- ==============================================================================
-- SQL Script: ETL Silver to Gold Schema (Star Schema Modeling)
-- ==============================================================================
-- Description:
--   Transforms cleaned silver layer tables into an analytical star schema
--   consisting of dimension tables (dim_customers, dim_products) and a
--   fact table (fact_sales). Generates surrogate keys for dimensions.
-- ==============================================================================

-- Drop existing gold tables if they exist to allow clean re-runs
DROP TABLE IF EXISTS gold.fact_sales;
DROP TABLE IF EXISTS gold.dim_customers;
DROP TABLE IF EXISTS gold.dim_products;

-- ------------------------------------------------------------------------------
-- 1. Create Dimension: gold.dim_customers
-- ------------------------------------------------------------------------------
CREATE TABLE gold.dim_customers AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY c.cst_id) AS customer_key,
    c.cst_id AS customer_id,
    c.cst_key AS customer_number,
    c.cst_firstname AS first_name,
    c.cst_lastname AS last_name,
    COALESCE(l.cntry, 'Unspecified') AS country,
    c.cst_marital_status AS marital_status,
    COALESCE(NULLIF(c.cst_gndr, 'Unspecified'), COALESCE(a.gen, 'Unspecified')) AS gender,
    a.bdate AS birthdate,
    c.cst_create_date AS create_date
FROM silver.crm_cust_info c
LEFT JOIN silver.erp_cust_az12 a 
  ON c.cst_key = a.cid
LEFT JOIN silver.erp_loc_a101 l 
  ON c.cst_key = l.cid;


-- ------------------------------------------------------------------------------
-- 2. Create Dimension: gold.dim_products
-- ------------------------------------------------------------------------------
CREATE TABLE gold.dim_products AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY p.prd_key) AS product_key,
    p.prd_id AS product_id,
    p.prd_key AS product_number,
    p.prd_nm AS product_name,
    p.cat_id AS category_id,
    COALESCE(c.cat, 'Unspecified') AS category,
    COALESCE(c.subcat, 'Unspecified') AS subcategory,
    COALESCE(c.maintenance, FALSE) AS maintenance,
    p.prd_cost AS cost,
    p.prd_line AS product_line,
    p.prd_start_dt AS start_date
FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY prd_key ORDER BY prd_start_dt DESC) AS rn
    FROM silver.crm_prd_info
) p
LEFT JOIN silver.erp_px_cat_g1v2 c 
  ON p.cat_id = c.id
WHERE p.rn = 1;


-- ------------------------------------------------------------------------------
-- 3. Create Fact Table: gold.fact_sales
-- ------------------------------------------------------------------------------
CREATE TABLE gold.fact_sales AS
SELECT 
    s.sls_ord_num AS order_number,
    p.product_key,
    c.customer_key,
    s.sls_order_dt AS order_date,
    s.sls_ship_dt AS shipping_date,
    s.sls_due_dt AS due_date,
    s.sls_sales AS sales_amount,
    s.sls_quantity AS quantity,
    s.sls_price AS price
FROM silver.crm_sales_details s
LEFT JOIN gold.dim_products p 
  ON s.sls_prd_key = p.product_number
LEFT JOIN gold.dim_customers c 
  ON s.sls_cust_id = c.customer_id;

-- Log row counts for verification
SELECT 'gold.dim_customers' AS table_name, COUNT(*) AS row_count FROM gold.dim_customers
UNION ALL
SELECT 'gold.dim_products', COUNT(*) FROM gold.dim_products
UNION ALL
SELECT 'gold.fact_sales', COUNT(*) FROM gold.fact_sales;
