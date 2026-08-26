import os
import sys
import duckdb

def run_sql_file(db_path, sql_file_path):
    """
    Connects to DuckDB database and executes a SQL file.
    """
    print(f"Connecting to database: {db_path}...")
    # Ensure parent directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    conn = duckdb.connect(db_path)
    
    if not os.path.exists(sql_file_path):
        print(f"Error: SQL file not found at {sql_file_path}")
        sys.exit(1)
        
    print(f"Reading and executing SQL script: {sql_file_path}...")
    with open(sql_file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()
        
    try:
        # We can split the script by semicolon, but simple execution is fine.
        # To print select outputs, we can execute commands and if they have cursor description, fetch data.
        # In DuckDB, we can run multiple statements by split or using the connection.
        # Let's split the statements by semicolon to print outputs for select queries
        statements = sql_content.split(';')
        for stmt in statements:
            stmt = stmt.strip()
            if not stmt:
                continue
            
            # Print statement summary
            first_line = stmt.split('\n')[0][:80]
            print(f"\nExecuting: {first_line}...")
            
            # Use pandas to read if it is a SELECT or UNION or WITH query that returns data
            is_query = any(keyword in stmt.upper() for keyword in ["SELECT", "WITH", "SHOW", "DESCRIBE", "PRAGMA"])
            if is_query:
                df = conn.execute(stmt).fetchdf()
                if not df.empty:
                    print(df.to_string(index=False))
                else:
                    print("(Empty Result)")
            else:
                conn.execute(stmt)
                
        print("\nSQL script executed successfully!")
    except Exception as e:
        print(f"Error executing SQL script: {e}")
        conn.close()
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python run_sql.py <path_to_db> <path_to_sql_file>")
        sys.exit(1)
        
    db_path = sys.argv[1]
    sql_file_path = sys.argv[2]
    run_sql_file(db_path, sql_file_path)
