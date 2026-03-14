import os
import glob

base_dir = r"e:\22222\project - Copy\src"
target_old = "https://taskpilot-backend-n09v.onrender.com"
target_new = "http://localhost:8080"

count = 0
for filepath in glob.glob(f"{base_dir}/**/*.jsx", recursive=True) + glob.glob(f"{base_dir}/**/*.js", recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if target_old in content:
        content = content.replace(target_old, target_new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
        count += 1

print(f"Total files updated: {count}")
