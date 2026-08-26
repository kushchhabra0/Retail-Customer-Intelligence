-- ==============================================================================
-- SQL Script: ETL Bronze to Silver Schema
-- ==============================================================================
-- Description:
--   Cleanses, standardizes, and validates tables from the bronze schema and 
--   loads them into the silver schema. Resolves duplicates, missing values, 
--   incorrect data types, and logical anomalies.
-- ==============================================================================

-- Drop existing silver tables if they exist to allow clean re-runs
DROP TABLE IF EXISTS silver.crm_cust_info;
DROP TABLE IF EXISTS silver.crm_prd_info;
DROP TABLE IF EXISTS silver.crm_sales_details;
DROP TABLE IF EXISTS silver.erp_cust_az12;
DROP TABLE IF EXISTS silver.erp_loc_a101;
DROP TABLE IF EXISTS silver.erp_px_cat_g1v2;

-- ------------------------------------------------------------------------------
-- 1. Clean and Load: silver.crm_cust_info
-- ------------------------------------------------------------------------------

CREATE TABLE silver.crm_cust_info AS
SELECT 
    cst_id,
    TRIM(cst_key) AS cst_key,
    TRIM(COALESCE(NULLIF(cst_firstname, ''), 'Unknown')) AS cst_firstname,
    TRIM(COALESCE(NULLIF(cst_lastname, ''), 'Unknown')) AS cst_lastname,
    CASE 
        WHEN UPPER(TRIM(cst_marital_status)) = 'M' THEN 'Married'
        WHEN UPPER(TRIM(cst_marital_status)) = 'S' THEN 'Single'
        ELSE 'Unspecified'
    END AS cst_marital_status,
    CASE 
        WHEN UPPER(TRIM(cst_gndr)) = 'F' THEN 'Female'
        WHEN UPPER(TRIM(cst_gndr)) = 'M' THEN 'Male'
        ELSE 'Unspecified'
    END AS cst_gndr,
    cst_create_date,
    CURRENT_TIMESTAMP AS dwh_create_date
FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY cst_id ORDER BY cst_create_date DESC) as rn
    FROM bronze.crm_cust_info
    WHERE cst_id IS NOT NULL
)
WHERE rn = 1;


-- ------------------------------------------------------------------------------
-- 2. Clean and Load: silver.crm_prd_info
-- ------------------------------------------------------------------------------

CREATE TABLE silver.crm_prd_info AS
SELECT 
    prd_id,
    REPLACE(SUBSTRING(prd_key, 1, 5), '-', '_') AS cat_id,
    SUBSTRING(prd_key, 7) AS prd_key,
    TRIM(prd_nm) AS prd_nm,
    COALESCE(prd_cost, 0) AS prd_cost,
    CASE 
        WHEN UPPER(TRIM(prd_line)) = 'R' THEN 'Road'
        WHEN UPPER(TRIM(prd_line)) = 'M' THEN 'Mountain'
        WHEN UPPER(TRIM(prd_line)) = 'T' THEN 'Touring'
        WHEN UPPER(TRIM(prd_line)) = 'S' THEN 'Other Sales'
        ELSE 'Unspecified'
    END AS prd_line,
    prd_start_dt,
    CASE 
        WHEN prd_end_dt IS NULL OR prd_end_dt < prd_start_dt THEN 
            LEAD(prd_start_dt) OVER (PARTITION BY SUBSTRING(prd_key, 7) ORDER BY prd_start_dt) - INTERVAL 1 DAY
        ELSE prd_end_dt 
    END AS prd_end_dt,
    CURRENT_TIMESTAMP AS dwh_create_date
FROM bronze.crm_prd_info;


-- ------------------------------------------------------------------------------
-- 3. Clean and Load: silver.crm_sales_details
-- ------------------------------------------------------------------------------

CREATE TABLE silver.crm_sales_details AS
SELECT 
    TRIM(sls_ord_num) AS sls_ord_num,
    TRIM(sls_prd_key) AS sls_prd_key,
    sls_cust_id,
    CASE 
        WHEN LENGTH(CAST(sls_order_dt AS VARCHAR)) = 8 THEN CAST(strptime(CAST(sls_order_dt AS VARCHAR), '%Y%m%d') AS DATE)
        ELSE NULL
    END AS sls_order_dt,
    CASE 
        WHEN LENGTH(CAST(sls_ship_dt AS VARCHAR)) = 8 THEN CAST(strptime(CAST(sls_ship_dt AS VARCHAR), '%Y%m%d') AS DATE)
        ELSE NULL
    END AS sls_ship_dt,
    CASE 
        WHEN LENGTH(CAST(sls_due_dt AS VARCHAR)) = 8 THEN CAST(strptime(CAST(sls_due_dt AS VARCHAR), '%Y%m%d') AS DATE)
        ELSE NULL
    END AS sls_due_dt,
    CASE 
        WHEN sls_sales IS NULL OR sls_sales <= 0 THEN sls_quantity * sls_price
        ELSE sls_sales
    END AS sls_sales,
    sls_quantity,
    CASE 
        WHEN sls_price IS NULL OR sls_price <= 0 THEN sls_sales / NULLIF(sls_quantity, 0)
        ELSE sls_price
    END AS sls_price,
    CURRENT_TIMESTAMP AS dwh_create_date
FROM bronze.crm_sales_details;


-- ------------------------------------------------------------------------------
-- 4. Clean and Load: silver.erp_cust_az12
-- ------------------------------------------------------------------------------

CREATE TABLE silver.erp_cust_az12 AS
SELECT 
    CASE WHEN cid LIKE 'NAS%' THEN SUBSTRING(cid, 4) ELSE cid END AS cid,
    CASE WHEN bdate > CURRENT_DATE THEN NULL ELSE bdate END AS bdate,
    CASE 
        WHEN UPPER(TRIM(gen)) IN ('M', 'MALE') THEN 'Male'
        WHEN UPPER(TRIM(gen)) IN ('F', 'FEMALE') THEN 'Female'
        ELSE 'Unspecified'
    END AS gen,
    CURRENT_TIMESTAMP AS dwh_create_date
FROM bronze.erp_cust_az12;


-- ------------------------------------------------------------------------------
-- 5. Clean and Load: silver.erp_loc_a101
-- ------------------------------------------------------------------------------

CREATE TABLE silver.erp_loc_a101 AS
SELECT 
    REPLACE(cid, '-', '') AS cid,
    CASE 
        WHEN TRIM(cntry) IN ('US', 'USA', 'United States') THEN 'United States'
        WHEN TRIM(cntry) IN ('DE', 'Germany') THEN 'Germany'
        WHEN TRIM(cntry) = '' OR cntry IS NULL THEN 'Unspecified'
        ELSE TRIM(cntry)
    END AS cntry,
    CURRENT_TIMESTAMP AS dwh_create_date
FROM bronze.erp_loc_a101;


-- ------------------------------------------------------------------------------
-- 6. Clean and Load: silver.erp_px_cat_g1v2
-- ------------------------------------------------------------------------------

CREATE TABLE silver.erp_px_cat_g1v2 AS
SELECT 
    TRIM(id) AS id,
    TRIM(cat) AS cat,
    TRIM(subcat) AS subcat,
    maintenance,
    CURRENT_TIMESTAMP AS dwh_create_date
FROM bronze.erp_px_cat_g1v2;

-- Log row counts for verification
SELECT 'silver.crm_cust_info' AS table_name, COUNT(*) AS row_count FROM silver.crm_cust_info
UNION ALL
SELECT 'silver.crm_prd_info', COUNT(*) FROM silver.crm_prd_info
UNION ALL
SELECT 'silver.crm_sales_details', COUNT(*) FROM silver.crm_sales_details
UNION ALL
SELECT 'silver.erp_cust_az12', COUNT(*) FROM silver.erp_cust_az12
UNION ALL
SELECT 'silver.erp_loc_a101', COUNT(*) FROM silver.erp_loc_a101
UNION ALL
SELECT 'silver.erp_px_cat_g1v2', COUNT(*) FROM silver.erp_px_cat_g1v2;
