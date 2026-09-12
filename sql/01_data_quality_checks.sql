-- ==============================================================================
-- SQL Script: Bronze Layer Data Quality Audits
-- ==============================================================================
-- Description:
--   Executes a series of checks on the raw bronze tables to identify missing 
--   values, duplicate records, data anomalies, and referential integrity issues.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. NULL Value Audits (Primary/Key Columns)
-- ------------------------------------------------------------------------------

SELECT 'NULL Checks: crm_cust_info.cst_id' AS check_name, COUNT(*) AS null_count 
FROM bronze.crm_cust_info WHERE cst_id IS NULL;

SELECT 'NULL Checks: crm_prd_info.prd_id' AS check_name, COUNT(*) AS null_count 
FROM bronze.crm_prd_info WHERE prd_id IS NULL;

SELECT 'NULL Checks: crm_sales_details.sls_ord_num' AS check_name, COUNT(*) AS null_count 
FROM bronze.crm_sales_details WHERE sls_ord_num IS NULL;

SELECT 'NULL Checks: erp_cust_az12.cid' AS check_name, COUNT(*) AS null_count 
FROM bronze.erp_cust_az12 WHERE cid IS NULL;

SELECT 'NULL Checks: erp_loc_a101.cid' AS check_name, COUNT(*) AS null_count 
FROM bronze.erp_loc_a101 WHERE cid IS NULL;

SELECT 'NULL Checks: erp_px_cat_g1v2.id' AS check_name, COUNT(*) AS null_count 
FROM bronze.erp_px_cat_g1v2 WHERE id IS NULL;


-- ------------------------------------------------------------------------------
-- 2. Duplicate Key Audits
-- ------------------------------------------------------------------------------

SELECT 'Duplicate Checks: crm_cust_info.cst_id' AS check_name, COUNT(*) - COUNT(DISTINCT cst_id) AS dup_count 
FROM bronze.crm_cust_info;

SELECT 'Duplicate Checks: crm_prd_info.prd_key' AS check_name, COUNT(*) - COUNT(DISTINCT prd_key) AS dup_count 
FROM bronze.crm_prd_info;

SELECT 'Duplicate Checks: erp_cust_az12.cid' AS check_name, COUNT(*) - COUNT(DISTINCT cid) AS dup_count 
FROM bronze.erp_cust_az12;

SELECT 'Duplicate Checks: erp_loc_a101.cid' AS check_name, COUNT(*) - COUNT(DISTINCT cid) AS dup_count 
FROM bronze.erp_loc_a101;

SELECT 'Duplicate Checks: erp_px_cat_g1v2.id' AS check_name, COUNT(*) - COUNT(DISTINCT id) AS dup_count 
FROM bronze.erp_px_cat_g1v2;


-- ------------------------------------------------------------------------------
-- 3. Data Anomalies (Value Range & Consistency Audits)
-- ------------------------------------------------------------------------------

SELECT 'Anomalies: crm_prd_info Negative Cost' AS check_name, COUNT(*) AS anomaly_count 
FROM bronze.crm_prd_info WHERE prd_cost < 0;

SELECT 'Anomalies: crm_prd_info Start Date After End Date' AS check_name, COUNT(*) AS anomaly_count 
FROM bronze.crm_prd_info WHERE prd_end_dt IS NOT NULL AND prd_start_dt > prd_end_dt;

SELECT 'Anomalies: crm_sales_details Negative/Zero Sales' AS check_name, COUNT(*) AS anomaly_count 
FROM bronze.crm_sales_details WHERE sls_sales <= 0;

SELECT 'Anomalies: crm_sales_details Negative/Zero Quantity' AS check_name, COUNT(*) AS anomaly_count 
FROM bronze.crm_sales_details WHERE sls_quantity <= 0;

SELECT 'Anomalies: crm_sales_details Negative/Zero Price' AS check_name, COUNT(*) AS anomaly_count 
FROM bronze.crm_sales_details WHERE sls_price <= 0;

SELECT 'Anomalies: crm_sales_details Price/Quantity Consistency Discrepancy' AS check_name, COUNT(*) AS anomaly_count 
FROM bronze.crm_sales_details WHERE sls_sales <> (sls_quantity * sls_price);

SELECT 'Anomalies: erp_cust_az12 Future Birthdate' AS check_name, COUNT(*) AS anomaly_count 
FROM bronze.erp_cust_az12 WHERE bdate > CURRENT_DATE;

SELECT 'Anomalies: erp_cust_az12 Age > 120 Years' AS check_name, COUNT(*) AS anomaly_count 
FROM bronze.erp_cust_az12 WHERE bdate < '1906-01-01';


-- ------------------------------------------------------------------------------
-- 4. Text Standard / Format Audits
-- ------------------------------------------------------------------------------

SELECT 'Formatting: crm_cust_info Gender Codes' AS check_name, cst_gndr, COUNT(*) AS row_count 
FROM bronze.crm_cust_info GROUP BY cst_gndr;

SELECT 'Formatting: erp_cust_az12 Gender Codes' AS check_name, gen, COUNT(*) AS row_count 
FROM bronze.erp_cust_az12 GROUP BY gen;

SELECT 'Formatting: crm_cust_info Marital Codes' AS check_name, cst_marital_status, COUNT(*) AS row_count 
FROM bronze.crm_cust_info GROUP BY cst_marital_status;


-- ------------------------------------------------------------------------------
-- 5. Referential Integrity Audits
-- ------------------------------------------------------------------------------

SELECT 'Referential Integrity: Sales Customer ID Not In CRM Customers' AS check_name, COUNT(*) AS mismatch_count 
FROM bronze.crm_sales_details s
LEFT JOIN bronze.crm_cust_info c ON s.sls_cust_id = c.cst_id
WHERE c.cst_id IS NULL;

SELECT 'Referential Integrity: Sales Product Key Not In CRM Products' AS check_name, COUNT(*) AS mismatch_count 
FROM bronze.crm_sales_details s
LEFT JOIN bronze.crm_prd_info p ON s.sls_prd_key = p.prd_key
WHERE p.prd_key IS NULL;
