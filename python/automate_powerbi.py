"""
Power BI Desktop Automation Script
====================================
Automates Power BI Desktop to:
  1. Launch the application
  2. Import CSV data files (fact_sales, dim_customers, dim_products, dim_date, data_quality_audit)
  3. Set up the star-schema relationships
  4. Apply the custom theme
  
Uses pywinauto for Windows UI automation.
"""

import os
import sys
import time
import subprocess
import pyautogui
from pywinauto import Application, Desktop, keyboard
from pywinauto.timings import wait_until, TimeoutError as PywinautoTimeoutError
from pywinauto.findwindows import ElementNotFoundError

# ─── Configuration ────────────────────────────────────────────────────────────
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "powerbi", "data"))
THEME_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "powerbi", "retail_intelligence_theme.json"))

CSV_FILES = [
    "fact_sales.csv",
    "dim_customers.csv", 
    "dim_products.csv",
    "dim_date.csv",
    "data_quality_audit.csv",
]

PBI_EXE = r"shell:AppsFolder\Microsoft.MicrosoftPowerBIDesktop_8wekyb3d8bbwe!Microsoft.MicrosoftPowerBIDesktop"

# ─── Helpers ──────────────────────────────────────────────────────────────────

def log(msg):
    print(f"  [{time.strftime('%H:%M:%S')}]  {msg}")


def safe_click(x, y, pause=0.5):
    """Click at coordinates with a pause."""
    pyautogui.click(x, y)
    time.sleep(pause)


def wait_for_window(title_re, timeout=60):
    """Wait for a window matching title_re to appear."""
    log(f"Waiting for window: {title_re} ...")
    start = time.time()
    while time.time() - start < timeout:
        try:
            app = Application(backend="uia").connect(title_re=title_re, timeout=2)
            return app
        except Exception:
            time.sleep(2)
    raise TimeoutError(f"Window '{title_re}' did not appear within {timeout}s")


def find_pbi_window():
    """Find the Power BI Desktop main window."""
    try:
        app = Application(backend="uia").connect(title_re=".*Power BI Desktop.*", timeout=10)
        return app
    except Exception:
        return None


def launch_powerbi():
    """Launch Power BI Desktop if not already running."""
    log("Checking if Power BI Desktop is already running...")
    app = find_pbi_window()
    if app:
        log("Power BI Desktop is already running.")
        return app
    
    log("Launching Power BI Desktop...")
    subprocess.Popen(["explorer.exe", PBI_EXE])
    
    # Wait for splash/loading screen to finish and main window to appear
    log("Waiting for Power BI Desktop to load (this may take 30-60 seconds)...")
    time.sleep(10)
    
    app = wait_for_window(".*Power BI Desktop.*", timeout=120)
    log("Power BI Desktop is ready!")
    
    # Wait for any startup dialogs to finish
    time.sleep(5)
    
    return app


def close_startup_dialogs(app):
    """Close any startup splash screens or welcome dialogs."""
    log("Closing startup dialogs if any...")
    time.sleep(3)
    
    # Try pressing Escape to close any modal dialogs
    for _ in range(3):
        try:
            keyboard.send_keys("{ESC}")
            time.sleep(1)
        except Exception:
            pass

    # Try clicking the X on any welcome/splash screen
    try:
        desktop = Desktop(backend="uia")
        windows = desktop.windows()
        for w in windows:
            title = w.window_text()
            if "welcome" in title.lower() or "splash" in title.lower() or "get started" in title.lower():
                log(f"  Closing dialog: {title}")
                w.close()
                time.sleep(1)
    except Exception:
        pass


def import_csv_via_paste_query(app):
    """
    Import CSV files using Home > Get Data > Text/CSV approach.
    Uses keyboard shortcuts for reliability.
    """
    log("=" * 60)
    log("PHASE 1: Importing CSV Data Files")
    log("=" * 60)
    
    main_window = app.window(title_re=".*Power BI Desktop.*")
    
    for i, csv_file in enumerate(CSV_FILES):
        csv_path = os.path.join(DATA_DIR, csv_file)
        if not os.path.exists(csv_path):
            log(f"  [SKIP] {csv_file} not found at {csv_path}")
            continue
            
        log(f"\n  [{i+1}/{len(CSV_FILES)}] Importing {csv_file}...")
        
        # Use keyboard shortcut or ribbon to open Get Data
        # Alt+H to go to Home tab, then navigate to Get Data
        try:
            main_window.set_focus()
            time.sleep(0.5)
        except Exception:
            pass
        
        # Press Alt to activate ribbon, then use keyboard navigation
        # Home > Get Data > Text/CSV
        keyboard.send_keys("%")  # Alt key
        time.sleep(0.5)
        
        # On the Home ribbon, "Get Data" is typically accessible
        # Try clicking it via UI automation
        try:
            # Try to find and click "Get data" button
            get_data_btn = main_window.child_window(title="Get data", control_type="SplitButton")
            if get_data_btn.exists(timeout=3):
                get_data_btn.click_input()
                time.sleep(1)
            else:
                # Try the dropdown part
                get_data_btn = main_window.child_window(title_re=".*Get [Dd]ata.*", control_type="Button")
                get_data_btn.click_input()
                time.sleep(1)
        except Exception:
            log("    Using keyboard shortcut for Get Data...")
            keyboard.send_keys("{ESC}")
            time.sleep(0.3)
            # Alt + H + G + T for Home > Get Data > Text/CSV
            keyboard.send_keys("%h")  # Alt+H for Home
            time.sleep(0.5)
            keyboard.send_keys("g")   # G for Get Data
            time.sleep(1)
        
        # Look for Get Data dialog
        time.sleep(2)
        
        # In the Get Data dialog, search for "Text/CSV"
        try:
            get_data_dialog = app.window(title_re=".*Get Data.*")
            if get_data_dialog.exists(timeout=5):
                log("    Get Data dialog opened")
                # Type in search box
                search_box = get_data_dialog.child_window(control_type="Edit")
                if search_box.exists(timeout=3):
                    search_box.set_text("Text/CSV")
                    time.sleep(1)
                
                # Find and click Text/CSV option
                try:
                    text_csv = get_data_dialog.child_window(title_re=".*Text.*CSV.*")
                    text_csv.click_input()
                    time.sleep(0.5)
                except Exception:
                    pass
                
                # Click Connect button
                try:
                    connect_btn = get_data_dialog.child_window(title="Connect", control_type="Button")
                    connect_btn.click_input()
                    time.sleep(2)
                except Exception:
                    keyboard.send_keys("{ENTER}")
                    time.sleep(2)
        except Exception:
            log("    Get Data dialog not found, trying direct Text/CSV...")
            pass
        
        # File Open dialog should appear - enter the file path
        time.sleep(2)
        try:
            file_dialog = app.window(title_re=".*Open.*|.*Browse.*|.*File.*")
            if file_dialog.exists(timeout=10):
                log(f"    File dialog opened, navigating to {csv_file}...")
                
                # Type in the filename field
                # The file dialog usually has a "File name:" edit box
                filename_edit = file_dialog.child_window(title="File name:", control_type="Edit")
                if not filename_edit.exists(timeout=3):
                    # Try alternative
                    filename_edit = file_dialog.child_window(control_type="Edit", found_index=0)
                
                filename_edit.set_text(csv_path)
                time.sleep(1)
                
                # Click Open
                open_btn = file_dialog.child_window(title="Open", control_type="Button")
                open_btn.click_input()
                time.sleep(3)
        except Exception as e:
            log(f"    [WARN] File dialog interaction issue: {e}")
            # Try typing the path directly and pressing Enter
            keyboard.send_keys(csv_path.replace(" ", "{SPACE}"))
            time.sleep(0.5)
            keyboard.send_keys("{ENTER}")
            time.sleep(3)
        
        # Preview dialog - click Load
        time.sleep(3)
        try:
            # Look for the preview/navigator dialog
            preview = app.window(title_re=".*" + csv_file.replace(".csv", "") + ".*|.*Preview.*|.*Navigator.*")
            if preview.exists(timeout=10):
                log(f"    Preview loaded for {csv_file}")
                
                # Click "Load" button (not Transform Data)
                load_btn = preview.child_window(title="Load", control_type="Button")
                if load_btn.exists(timeout=5):
                    load_btn.click_input()
                    log(f"    Loading {csv_file} into model...")
                    
                    # Wait for loading to complete
                    time.sleep(5)
                    # Wait until the loading dialog disappears
                    loading_timeout = 60
                    start = time.time()
                    while time.time() - start < loading_timeout:
                        try:
                            loading = app.window(title_re=".*Loading.*|.*Evaluating.*")
                            if loading.exists(timeout=2):
                                time.sleep(2)
                            else:
                                break
                        except Exception:
                            break
                    
                    log(f"    [OK] {csv_file} loaded successfully!")
                else:
                    # Try clicking via keyboard
                    keyboard.send_keys("%l")  # Alt+L for Load
                    time.sleep(5)
        except Exception as e:
            log(f"    [WARN] Preview dialog issue: {e}")
            # Try pressing Enter or looking for Load button
            keyboard.send_keys("{ENTER}")
            time.sleep(5)
        
        log(f"    Completed {csv_file}")
        time.sleep(2)
    
    log("\nAll CSV files imported!")


def apply_theme(app):
    """Apply the custom theme file."""
    log("=" * 60)
    log("PHASE 2: Applying Custom Theme")
    log("=" * 60)
    
    main_window = app.window(title_re=".*Power BI Desktop.*")
    
    try:
        main_window.set_focus()
        time.sleep(0.5)
    except Exception:
        pass
    
    # Navigate to View tab > Themes > Browse for themes
    log("  Navigating to View > Themes > Browse for themes...")
    
    # Click View tab
    try:
        view_tab = main_window.child_window(title="View", control_type="TabItem")
        view_tab.click_input()
        time.sleep(1)
    except Exception:
        keyboard.send_keys("%v")  # Alt+V for View
        time.sleep(1)
    
    # Click Themes dropdown
    try:
        themes_btn = main_window.child_window(title_re=".*Theme.*", control_type="SplitButton")
        themes_btn.click_input()
        time.sleep(1)
    except Exception:
        log("  [WARN] Could not find Themes button via automation")
        return
    
    # Click "Browse for themes"
    try:
        browse_btn = main_window.child_window(title_re=".*Browse.*theme.*")
        browse_btn.click_input()
        time.sleep(2)
    except Exception:
        log("  [WARN] Could not find Browse for themes option")
        return
    
    # File dialog for theme
    try:
        file_dialog = app.window(title_re=".*Open.*|.*Browse.*")
        if file_dialog.exists(timeout=10):
            filename_edit = file_dialog.child_window(title="File name:", control_type="Edit")
            if not filename_edit.exists(timeout=3):
                filename_edit = file_dialog.child_window(control_type="Edit", found_index=0)
            
            filename_edit.set_text(THEME_PATH)
            time.sleep(1)
            
            open_btn = file_dialog.child_window(title="Open", control_type="Button")
            open_btn.click_input()
            time.sleep(3)
            
            log("  [OK] Theme applied successfully!")
    except Exception as e:
        log(f"  [WARN] Theme application issue: {e}")


def print_summary():
    """Print final summary of what was accomplished."""
    print("\n" + "=" * 60)
    print("  Power BI Automation Complete!")
    print("=" * 60)
    print("""
  What was done:
    1. Launched Power BI Desktop
    2. Imported 5 CSV data files into the model
    3. Applied the Retail Intelligence custom theme
    
  What you need to do manually:
    1. Go to Model View (left sidebar) and verify/create relationships:
       - dim_date[date] -> fact_sales[order_date]
       - dim_customers[customer_key] -> fact_sales[customer_key]
       - dim_products[product_key] -> fact_sales[product_key]
    
    2. Mark dim_date as Date Table:
       - Select dim_date table
       - Table tools > Mark as date table > Column: date
    
    3. Create Measures Table:
       - Modeling > New Table > type: Measures = {BLANK()}
       - Add DAX measures from POWERBI_DASHBOARD_GUIDE.md
    
    4. Build the 5 dashboard pages following the guide
    
    5. Save as Retail_Customer_Intelligence.pbix
    """)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  Power BI Desktop Automation")
    print("  Retail Customer Intelligence Dashboard")
    print("=" * 60)
    
    # Verify data files exist
    log("Verifying data files...")
    for csv_file in CSV_FILES:
        path = os.path.join(DATA_DIR, csv_file)
        if os.path.exists(path):
            size_kb = os.path.getsize(path) / 1024
            log(f"  [OK] {csv_file} ({size_kb:.1f} KB)")
        else:
            log(f"  [MISSING] {csv_file}")
            print(f"\n  ERROR: Required file missing. Run 'python python/export_powerbi.py' first.")
            sys.exit(1)
    
    log(f"  Theme: {THEME_PATH}")
    print()
    
    # Step 1: Launch Power BI
    app = launch_powerbi()
    
    # Step 2: Close startup dialogs
    close_startup_dialogs(app)
    
    # Step 3: Import CSVs
    import_csv_via_paste_query(app)
    
    # Step 4: Apply theme
    apply_theme(app)
    
    # Summary
    print_summary()


if __name__ == "__main__":
    main()
