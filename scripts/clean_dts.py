import os

def clean_files(directories):
    for directory in directories:
        if not os.path.exists(directory):
            print(f"Directory not found: {directory}")
            continue

        print(f"Scanning directory: {directory}")
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(".ts") and not file.endswith(".d.ts"):
                    # Found a .ts file
                    
                    # 1. Check and delete .d.ts
                    dts_filename = file[:-3] + ".d.ts"
                    dts_path = os.path.join(root, dts_filename)
                    if os.path.exists(dts_path):
                        try:
                            os.remove(dts_path)
                            print(f"Deleted: {dts_path}")
                        except OSError as e:
                            print(f"Error deleting {dts_path}: {e}")

                    # 2. Check and delete .js
                    js_filename = file[:-3] + ".js"
                    js_path = os.path.join(root, js_filename)
                    if os.path.exists(js_path):
                        try:
                            os.remove(js_path)
                            print(f"Deleted: {js_path}")
                        except OSError as e:
                            print(f"Error deleting {js_path}: {e}")

if __name__ == "__main__":
    target_dirs = [
        "/Users/mayfair/Documents/other/timeless/packages",
        "/Users/mayfair/Documents/other/timeless/apps"
    ]
    clean_files(target_dirs)
