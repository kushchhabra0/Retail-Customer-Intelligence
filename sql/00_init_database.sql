-- ==============================================================================
-- SQL Script: Initialize Schemas and Load Bronze Data
-- ==============================================================================
-- Description:
--   Creates the bronze, silver, and gold schemas in the analytical database.
--   Loads raw CSV files (bronze layer) from 'data/raw' directory into the 
--   bronze schema using DuckDB's automatic CSV reader.
-- ==============================================================================

-- Create schemas
CREATE SCHEMA IF NOT EXISTS bronze;
CREATE SCHEMA IF NOT EXISTS silver;
CREATE SCHEMA IF NOT EXISTS gold;

-- Drop existing tables in bronze if they exist to allow clean re-runs
DROP TABLE IF EXISTS bronze.crm_cust_info;
DROP TABLE IF EXISTS bronze.crm_prd_info;
DROP TABLE IF EXISTS bronze.crm_sales_details;
DROP TABLE IF EXISTS bronze.erp_cust_az12;
DROP TABLE IF EXISTS bronze.erp_loc_a101;
DROP TABLE IF EXISTS bronze.erp_px_cat_g1v2;

-- Load CRM tables
CREATE TABLE bronze.crm_cust_info AS 
SELECT * FROM read_csv_auto('data/raw/bronze.crm_cust_info.csv', header=True);

CREATE TABLE bronze.crm_prd_info AS 
SELECT * FROM read_csv_auto('data/raw/bronze.crm_prd_info.csv', header=True);

CREATE TABLE bronze.crm_sales_details AS 
SELECT * FROM read_csv_auto('data/raw/bronze.crm_sales_details.csv', header=True);

-- Load ERP tables
CREATE TABLE bronze.erp_cust_az12 AS 
SELECT * FROM read_csv_auto('data/raw/bronze.erp_cust_az12.csv', header=True);

CREATE TABLE bronze.erp_loc_a101 AS 
SELECT * FROM read_csv_auto('data/raw/bronze.erp_loc_a101.csv', header=True);

CREATE TABLE bronze.erp_px_cat_g1v2 AS 
SELECT * FROM read_csv_auto('data/raw/bronze.erp_px_cat_g1v2.csv', header=True);

-- Log table counts for verification
SELECT 'bronze.crm_cust_info' AS table_name, COUNT(*) AS row_count FROM bronze.crm_cust_info
UNION ALL
SELECT 'bronze.crm_prd_info', COUNT(*) FROM bronze.crm_prd_info
UNION ALL
SELECT 'bronze.crm_sales_details', COUNT(*) FROM bronze.crm_sales_details
UNION ALL
SELECT 'bronze.erp_cust_az12', COUNT(*) FROM bronze.erp_cust_az12
UNION ALL
SELECT 'bronze.erp_loc_a101', COUNT(*) FROM bronze.erp_loc_a101
UNION ALL
SELECT 'bronze.erp_px_cat_g1v2', COUNT(*) FROM bronze.erp_px_cat_g1v2;
