# Data Dictionary

This document serves as the data dictionary for the Retail Sales & Customer Intelligence Analytics database, detailing the structure of the data across the three analytical layers: **Bronze** (raw ingestion), **Silver** (cleaned and standardized), and **Gold** (analytical star schema modeling).

---

## 1. Bronze Schema (Raw Data Layer)

The Bronze schema contains the raw ingestion tables extracted from CRM and ERP sources. Column types are inferred directly from the source CSV files.

### Table: `bronze.crm_cust_info`
*Description: Raw customer demographic details from CRM.*

| Column Name | Data Type | Nullable | Description |
|---|---|---|---|
| `cst_id` | BIGINT | Yes | Unique ID of the customer in the CRM system. |
| `cst_key` | VARCHAR | Yes | Unique alphanumeric customer code (e.g., 'NAS12345'). |
| `cst_firstname` | VARCHAR | Yes | Customer's first name. |
| `cst_lastname` | VARCHAR | Yes | Customer's last name. |
| `cst_marital_status`| VARCHAR | Yes | Customer's marital status. Contains raw codes or values. |
| `cst_gndr` | VARCHAR | Yes | Customer's gender. Contains raw characters (e.g., 'M', 'F'). |
| `cst_create_date` | DATE | Yes | Date the customer record was created in the CRM. |

### Table: `bronze.crm_prd_info`
*Description: Raw product catalog information from CRM.*

| Column Name | Data Type | Nullable | Description |
|---|---|---|---|
| `prd_id` | BIGINT | Yes | Unique product ID in the CRM system. |
| `prd_key` | VARCHAR | Yes | Unique alphanumeric product code (e.g., 'AR-5381'). |
| `prd_nm` | VARCHAR | Yes | Product name. |
| `prd_cost` | BIGINT | Yes | Standard cost of producing or acquiring the product. |
| `prd_line` | VARCHAR | Yes | Product line code (e.g., 'R' for Road, 'M' for Mountain). |
| `prd_start_dt` | DATE | Yes | Effective date when the product was introduced. |
| `prd_end_dt` | DATE | Yes | Discontinuation date of the product (null if active). |

### Table: `bronze.crm_sales_details`
*Description: Raw sales transactional details from CRM.*

| Column Name | Data Type | Nullable | Description |
|---|---|---|---|
| `sls_ord_num` | VARCHAR | Yes | Sales order identifier. |
| `sls_prd_key` | VARCHAR | Yes | Product alphanumeric key (references `crm_prd_info.prd_key`). |
| `sls_cust_id` | BIGINT | Yes | Customer ID (references `crm_cust_info.cst_id`). |
| `sls_order_dt` | BIGINT | Yes | Order date in `YYYYMMDD` integer format. |
| `sls_ship_dt` | BIGINT | Yes | Shipping date in `YYYYMMDD` integer format. |
| `sls_due_dt` | BIGINT | Yes | Due date in `YYYYMMDD` integer format. |
| `sls_sales` | BIGINT | Yes | Total sales revenue (price * quantity). |
| `sls_quantity` | BIGINT | Yes | Number of units purchased. |
| `sls_price` | BIGINT | Yes | Unit price charged. |

### Table: `bronze.erp_cust_az12`
*Description: Customer demographics from the ERP system (Region AZ).*

| Column Name | Data Type | Nullable | Description |
|---|---|---|---|
| `cid` | VARCHAR | Yes | Cleaned customer key, formatted as 'NAS' or 'AZ' prefix + numeric ID. |
| `bdate` | DATE | Yes | Customer's date of birth. |
| `gen` | VARCHAR | Yes | Customer's gender. |

### Table: `bronze.erp_loc_a101`
*Description: Geographical mapping data from the ERP system.*

| Column Name | Data Type | Nullable | Description |
|---|---|---|---|
| `cid` | VARCHAR | Yes | Customer key, formatted with prefix (matches `erp_cust_az12.cid`). |
| `cntry` | VARCHAR | Yes | Country of residence for the customer. |

### Table: `bronze.erp_px_cat_g1v2`
*Description: Product categorization mapping from the ERP system.*

| Column Name | Data Type | Nullable | Description |
|---|---|---|---|
| `id` | VARCHAR | Yes | Product line / categorization prefix code. |
| `cat` | VARCHAR | Yes | Product category name. |
| `subcat` | VARCHAR | Yes | Product subcategory name. |
| `maintenance` | BOOLEAN | Yes | Flag indicating whether standard maintenance is included. |

---

## 2. Silver Schema (Cleaned Layer)

The Silver layer houses cleansed, validated, and standardized tables. 

### Table: `silver.crm_cust_info`
- Standardizes marital status codes (e.g., 'Single', 'Married').
- Standardizes gender codes (e.g., 'Male', 'Female').
- Deduplicates customer IDs and trims leading/trailing spaces from names.

### Table: `silver.crm_prd_info`
- Standardizes product line names.
- Fills missing product costs with zero or mean where appropriate.
- Validates that `prd_end_dt` is greater than or equal to `prd_start_dt`.

### Table: `silver.crm_sales_details`
- Parses `sls_order_dt`, `sls_ship_dt`, and `sls_due_dt` integers into actual DATE types.
- Fixes records where quantity or price are negative or zero.
- Re-calculates and verifies sales amount (`sales = quantity * price`).

---

## 3. Gold Schema (Dimensional Modeling Layer)

The Gold layer contains the final reporting tables structured in a Star Schema.

### Dimension Table: `gold.dim_customers`
- **Grain**: One row per customer.
- **Attributes**: customer_key, customer_id, customer_number, first_name, last_name, country, marital_status, gender, birthdate, create_date.
- **Source**: Joined from `silver.crm_cust_info`, `silver.erp_cust_az12`, and `silver.erp_loc_a101`.

### Dimension Table: `gold.dim_products`
- **Grain**: One row per product.
- **Attributes**: product_key, product_id, product_number, product_name, category_id, category, subcategory, maintenance, cost, product_line, start_date.
- **Source**: Joined from `silver.crm_prd_info` and `silver.erp_px_cat_g1v2`.

### Fact Table: `gold.fact_sales`
- **Grain**: One row per sales order line.
- **Attributes**: order_number, product_key, customer_key, order_date, shipping_date, due_date, sales_amount, quantity, price.
- **Source**: Joined from `silver.crm_sales_details` with lookups on `gold.dim_products` and `gold.dim_customers`.
