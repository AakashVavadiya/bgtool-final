#!/usr/bin/env python3
"""
Karudi llama.cpp Runtime Setup Script
Automatically installs the lightweight, high-performance llama-server binary
for Windows or Linux VPS environments.
"""

import os
import sys
import platform
import urllib.request
import zipfile
import tarfile

LLAMA_CPP_VERSION = "b4664"
CWD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIN_DIR = os.path.join(CWD, "bin", "llama")

def setup():
    os.makedirs(BIN_DIR, exist_ok=True)
    system = platform.system().lower()
    
    if system == "windows":
        exe_path = os.path.join(BIN_DIR, "llama-server.exe")
        if os.path.exists(exe_path):
            print(f"[OK] llama-server already installed at: {exe_path}")
            return
        
        url = f"https://github.com/ggerganov/llama.cpp/releases/download/{LLAMA_CPP_VERSION}/llama-{LLAMA_CPP_VERSION}-bin-win-cpu-x64.zip"
        zip_path = os.path.join(BIN_DIR, "llama-win.zip")
        print(f"Downloading llama.cpp Windows binary from {url}...")
        urllib.request.urlretrieve(url, zip_path)
        print("Extracting...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(BIN_DIR)
        if os.path.exists(zip_path):
            os.remove(zip_path)
        print(f"[OK] Successfully installed llama-server.exe in {BIN_DIR}")

    elif system == "linux":
        bin_path = os.path.join(BIN_DIR, "llama-server")
        if os.path.exists(bin_path):
            print(f"[OK] llama-server already installed at: {bin_path}")
            return
        
        url = f"https://github.com/ggerganov/llama.cpp/releases/download/{LLAMA_CPP_VERSION}/llama-{LLAMA_CPP_VERSION}-bin-ubuntu-x64.tar.gz"
        tar_path = os.path.join(BIN_DIR, "llama-linux.tar.gz")
        print(f"Downloading llama.cpp Ubuntu binary from {url}...")
        urllib.request.urlretrieve(url, tar_path)
        print("Extracting...")
        with tarfile.open(tar_path, "r:gz") as tar:
            tar.extractall(BIN_DIR)
        if os.path.exists(tar_path):
            os.remove(tar_path)
        os.chmod(bin_path, 0o755)
        print(f"[OK] Successfully installed llama-server in {BIN_DIR}")
    else:
        print(f"Unsupported automated OS: {system}. Please install llama.cpp manually into {BIN_DIR}.")

if __name__ == "__main__":
    setup()
