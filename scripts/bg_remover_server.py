"""
Ganga AI Background Removal Server (rembg-free)
Copyright (c) 2026 BG Tool. All rights reserved.

High-performance native HTTP server running Ganga AI Neural Segmentation Engine.
"""

import sys
import json
import os
import time
import gc
import threading
import concurrent.futures
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Import native Ganga AI Engine (Zero rembg dependency)
from ganga_engine import GangaEngine, MODEL_REGISTRY

# Set PIL Decompression Bomb Protection (Max 60 Megapixels)
from PIL import Image
Image.MAX_IMAGE_PIXELS = 60_000_000

# Concurrency limits: max 3 simultaneous inference passes to conserve CPU
executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)

# Rate limiting per IP: 40 requests per minute
ip_rate_limits = {}
ip_rate_lock = threading.Lock()

def check_ip_rate_limit(ip):
    now = time.time()
    with ip_rate_lock:
        if ip not in ip_rate_limits:
            ip_rate_limits[ip] = []
        ip_rate_limits[ip] = [t for t in ip_rate_limits[ip] if now - t < 60]
        if len(ip_rate_limits[ip]) >= 40:
            return False
        ip_rate_limits[ip].append(now)

        stale_ips = [k for k, v in ip_rate_limits.items() if not v]
        for stale_ip in stale_ips:
            del ip_rate_limits[stale_ip]

        return True

def handle_ganga_request(data):
    b64_image = data.get("base64Image", "")
    model = data.get("model", "ganga")
    return GangaEngine.remove_background(b64_image, model_name=model)

class GangaRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean console output
        pass

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path in ["/ping", "/api/ping"]:
            self.send_json({
                "status": "ok",
                "engine": "Ganga AI Native Engine",
                "models": list(MODEL_REGISTRY.keys()),
            })
        else:
            self.send_json({"error": "Not Found"}, status=404)

    def do_POST(self):
        ip = self.client_address[0]
        if not check_ip_rate_limit(ip):
            self.send_json({"success": False, "error": "Too many requests. Please wait a moment."}, status=429)
            return

        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len)

        try:
            data = json.loads(post_data.decode("utf-8"))
        except Exception as e:
            self.send_json({"success": False, "error": f"Invalid JSON payload: {e}"}, status=400)
            return

        if self.path in ["/remove-base64", "/api/remove-bg"]:
            future = executor.submit(handle_ganga_request, data)
            try:
                result = future.result(timeout=60.0)
                self.send_json(result, status=200 if result.get("success") else 400)
            except concurrent.futures.TimeoutError:
                self.send_json({"success": False, "error": "Ganga AI processing timed out."}, status=504)
        else:
            self.send_json({"error": "Not Found"}, status=404)

def run_server(port=5000):
    ThreadingHTTPServer.allow_reuse_address = True
    server_address = ("127.0.0.1", port)
    httpd = ThreadingHTTPServer(server_address, GangaRequestHandler)
    print(f"Ganga AI Native Engine Server running on port {port} (rembg-free)...")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()

if __name__ == "__main__":
    port = 5000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
