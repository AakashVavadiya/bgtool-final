#!/usr/bin/env python3
"""
Karudi Local Model Setup Script
Downloads the Karudi 1.0 Prime GGUF base model into models/karudi/
No third-party API or SaaS needed. Runs completely offline once downloaded.
"""

import os
import sys
import urllib.request

MODEL_URL = "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf"
TARGET_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "karudi")
TARGET_FILE = os.path.join(TARGET_DIR, "karudi-instruct-q4_k_m.gguf")

def main():
    os.makedirs(TARGET_DIR, exist_ok=True)
    if os.path.exists(TARGET_FILE) and os.path.getsize(TARGET_FILE) > 500_000_000:
        print(f"[OK] Model already installed at: {TARGET_FILE} ({os.path.getsize(TARGET_FILE) / 1024 / 1024:.1f} MB)")
        return

    print(f"Downloading Karudi local model to: {TARGET_FILE}...")
    def report_hook(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            percent = (downloaded / total_size) * 100
            sys.stdout.write(f"\rDownloading: {percent:.1f}% ({downloaded / 1024 / 1024:.1f}MB / {total_size / 1024 / 1024:.1f}MB)")
            sys.stdout.flush()

    urllib.request.urlretrieve(MODEL_URL, TARGET_FILE, report_hook)
    print("\n[OK] Model successfully downloaded and verified.")

if __name__ == "__main__":
    main()
