#!/usr/bin/env python3
# make_index.py
# Scans the 'fits/' directory and writes data.json at repo root.
# Expects folders directly under fits/, and FITS files inside those folders.

import os
import json
import re
from datetime import datetime

FITS_DIR = 'fits'
OUT_FILE = 'data.json'
VALID_EXT = ('.fit', '.fits', '.FIT', '.FITS')

def parse_date_from_filename(name):
    # Try several patterns commonly used: YYYY-MM-DD, YYYYMMDD, YYYY_MM_DD
    # returns ISO date 'YYYY-MM-DD' or None
    patterns = [
        r'(\d{4}-\d{2}-\d{2})',
        r'(\d{8})',           # 20230401
        r'(\d{4}_\d{2}_\d{2})',
    ]
    for p in patterns:
        m = re.search(p, name)
        if m:
            s = m.group(1)
            try:
                if '-' in s:
                    dt = datetime.strptime(s, '%Y-%m-%d')
                elif '_' in s:
                    dt = datetime.strptime(s, '%Y_%m_%d')
                else:
                    dt = datetime.strptime(s, '%Y%m%d')
                return dt.strftime('%Y-%m-%d')
            except Exception:
                continue
    return None

def main():
    out = []
    if not os.path.isdir(FITS_DIR):
        print(f"Directory '{FITS_DIR}' not found. Create it and add your galaxy folders.")
        with open(OUT_FILE, 'w') as f:
            json.dump([], f, indent=2)
        return

    for folder in sorted(os.listdir(FITS_DIR)):
        folder_path = os.path.join(FITS_DIR, folder)
        if not os.path.isdir(folder_path):
            continue
        files = []
        for fn in sorted(os.listdir(folder_path)):
            if fn.endswith(VALID_EXT):
                date = parse_date_from_filename(fn) or None
                rel_path = os.path.join(FITS_DIR, folder, fn).replace('\\','/')
                files.append({
                    "name": fn,
                    "date": date,
                    "path": rel_path
                })
        out.append({
            "name": folder,
            "files": files
        })
    # write JSON
    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"Wrote {OUT_FILE} with {len(out)} folders.")

if __name__ == "__main__":
    main()
