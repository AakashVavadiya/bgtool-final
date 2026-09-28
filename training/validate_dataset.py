#!/usr/bin/env python
"""
Karudi AI — Local Model Dataset Validation & Preprocessing Pipeline
Validates and parses jsonl datasets in data/karudi/
"""

import os
import json
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "karudi")

def validate_datasets():
    print(f"=== Validating Karudi AI Training Datasets in {DATA_DIR} ===")
    if not os.path.exists(DATA_DIR):
        print(f"Error: {DATA_DIR} does not exist.")
        sys.exit(1)

    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".jsonl")]
    total_samples = 0

    for filename in sorted(files):
        path = os.path.join(DATA_DIR, filename)
        count = 0
        with open(path, "r", encoding="utf-8") as f:
            for line_idx, line in enumerate(f, 1):
                line = line.trim() if hasattr(line, 'trim') else line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    count += 1
                except json.JSONDecodeError as e:
                    print(f"[ERROR] {filename}:{line_idx}: Invalid JSON: {e}")
                    sys.exit(1)
        print(f"  [OK] {filename:25s} : {count:4d} samples")
        total_samples += count

    print(f"Total Validated Training & Evaluation Samples: {total_samples}")
    print("Dataset validation passed with 0 errors.")

if __name__ == "__main__":
    validate_datasets()
