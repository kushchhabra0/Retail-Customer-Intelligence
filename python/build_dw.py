import os
import sys
import time
import duckdb
from run_sql import run_sql_file

def build_data_warehouse(db_path):
    """
    Runs the complete ETL pipeline to build the data warehouse:
    1. Initialize and Load Bronze Layer
    2. Clean and Standardize to Silver Layer
    3. Model Star Schema in Gold Layer
    """
    start_time = time.time()
    print("======================================================================")
    print("STARTING DATA WAREHOUSE ETL PIPELINE")
    print("======================================================================")
    
    # Define files in order of dependency
    sql_files = [
        "sql/00_init_database.sql",
        "sql/02_data_cleaning.sql",
        "sql/03_data_modeling.sql"
    ]
    
    # Verify paths exist
    for f in sql_files:
        if not os.path.exists(f):
            print(f"Error: SQL file {f} is missing from the workspace!")
            sys.exit(1)
            
    # Execute pipeline files
    for idx, sql_file in enumerate(sql_files, 1):
        print(f"\n[Step {idx}/{len(sql_files)}] Running: {sql_file}")
        step_start = time.time()
        run_sql_file(db_path, sql_file)
        step_duration = time.time() - step_start
        print(f"Finished step {idx} in {step_duration:.2f} seconds.")
        
    duration = time.time() - start_time
    print("\n======================================================================")
    print(f"ETL PIPELINE COMPLETED SUCCESSFULLY in {duration:.2f} seconds!")
    print(f"Database location: {os.path.abspath(db_path)}")
    print("======================================================================")

if __name__ == "__main__":
    db_path = "data/processed/retail_analytics.db"
    build_data_warehouse(db_path)
