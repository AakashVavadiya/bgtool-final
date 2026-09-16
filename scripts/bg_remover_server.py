import sys
import json
import os
import time
import gc
import threading
import concurrent.futures
import base64
import io

# ── Limit C++ & OpenMP thread pools BEFORE imports to save RAM/CPU ─────────────
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
os.environ["OPENBLAS_NUM_THREADS"] = "2"
os.environ["VECLIB_MAXIMUM_THREADS"] = "2"
os.environ["NUMEXPR_NUM_THREADS"] = "2"

from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Ensure necessary packages are available
def install_and_import(package, pip_name=None):
    import subprocess
    if pip_name is None:
        pip_name = package
    try:
        __import__(package)
    except ImportError:
        print(f"Installing {pip_name}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", pip_name, "--quiet"])
        except Exception as e:
            print(f"Failed to install {pip_name}: {e}")

install_and_import("PIL", "pillow")
install_and_import("rembg")
install_and_import("onnxruntime")
install_and_import("numpy")
install_and_import("psutil")

try:
    from rembg import remove, new_session
    from PIL import Image, ImageFilter
    import numpy as np
    import psutil
    import onnxruntime as ort
    print("Dependencies loaded successfully.")
except ImportError as e:
    print(f"Failed to import dependencies: {e}")
    sys.exit(1)

# Set PIL Decompression Bomb Protection (Max 50 Megapixels)
Image.MAX_IMAGE_PIXELS = 50_000_000

# Global session cache & Concurrency parameters
sessions = {}
sessions_lock = threading.Lock()
job_lock = threading.Lock()
active_and_queued_jobs = 0

# Limit to max 3 simultaneous processing jobs for CPU/RAM optimization
executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)

# Rate limiting per IP: 30 requests per minute
ip_rate_limits = {}
ip_rate_lock = threading.Lock()

def check_ip_rate_limit(ip):
    now = time.time()
    with ip_rate_lock:
        if ip not in ip_rate_limits:
            ip_rate_limits[ip] = []
        ip_rate_limits[ip] = [t for t in ip_rate_limits[ip] if now - t < 60]
        if len(ip_rate_limits[ip]) >= 30:
            return False
        ip_rate_limits[ip].append(now)

        stale_ips = [k for k, v in ip_rate_limits.items() if not v]
        for stale_ip in stale_ips:
            del ip_rate_limits[stale_ip]

        return True

def trim_memory_if_needed():
    with sessions_lock:
        now = time.time()
        stale_models = [
            name for name, meta in sessions.items()
            if isinstance(meta, dict) and (now - meta.get("last_used", 0) > 300) and len(sessions) > 1
        ]
        for name in stale_models:
            print(f"[RAM Cleanup] Evicting idle model session: {name}")
            del sessions[name]

        try:
            proc = psutil.Process()
            rss_mb = proc.memory_info().rss / (1024 * 1024)
            if rss_mb > 2500:
                print(f"[RAM Cleanup] Process RSS is {rss_mb:.1f} MB (>2500MB). Clearing session cache.")
                sessions.clear()
            elif rss_mb > 1800 and len(sessions) > 1:
                sorted_sessions = sorted(
                    [(k, v.get("last_used", 0) if isinstance(v, dict) else 0) for k, v in sessions.items()],
                    key=lambda x: x[1]
                )
                oldest_name = sorted_sessions[0][0]
                print(f"[RAM Cleanup] Process RSS is {rss_mb:.1f} MB (>1800MB). Evicting oldest model: {oldest_name}")
                del sessions[oldest_name]
        except Exception as ram_err:
            print(f"[RAM Cleanup] Error checking process RAM: {ram_err}")

    gc.collect()

def get_session(model_name):
    with sessions_lock:
        now = time.time()
        if model_name not in sessions:
            print(f"Loading session for model: {model_name}...")
            start = time.time()
            sess_options = None
            try:
                import onnxruntime as ort
                sess_options = ort.SessionOptions()
                sess_options.enable_cpu_mem_arena = False
                sess_options.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
                sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
                sess_options.intra_op_num_threads = 2
                sess_options.inter_op_num_threads = 2
            except Exception as opt_err:
                print(f"ONNX SessionOptions warning: {opt_err}")

            if sess_options:
                try:
                    sess_obj = new_session(model_name, providers=["CPUExecutionProvider"], sess_options=sess_options)
                except Exception as sess_err:
                    print(f"Warning: new_session with sess_options failed ({sess_err}), using default.")
                    sess_obj = new_session(model_name, providers=["CPUExecutionProvider"])
            else:
                sess_obj = new_session(model_name, providers=["CPUExecutionProvider"])

            sessions[model_name] = {"session": sess_obj, "last_used": now}
            print(f"Model {model_name} loaded in {time.time() - start:.2f}s")
        else:
            sessions[model_name]["last_used"] = now

        return sessions[model_name]["session"]

def validate_image_bytes(raw_bytes):
    size_bytes = len(raw_bytes)
    if size_bytes == 0:
        return False, "Unable to detect a valid image.", None
    if size_bytes > 20 * 1024 * 1024:
        return False, "Image is too large.", None

    hex_sig = raw_bytes[:12].hex().upper()
    is_png  = hex_sig.startswith("89504E470D0A1A0A")
    is_jpg  = hex_sig.startswith("FFD8FF")
    is_webp = hex_sig.startswith("52494646") and hex_sig[16:24] == "57454250"

    if not (is_png or is_jpg or is_webp):
        return False, "Unsupported image format.", None

    try:
        bio = io.BytesIO(raw_bytes)
        img = Image.open(bio)
        img.verify()
        bio.seek(0)
        img = Image.open(bio)
        w, h = img.size

        if w <= 0 or h <= 0 or w > 10000 or h > 10000 or w * h > 50_000_000:
            return False, "Unable to detect a valid image.", None

        return True, None, img
    except Exception:
        return False, "Unable to detect a valid image.", None

def process_image_base64(data):
    b64_input = data.get("base64Image", "")
    model_name = data.get("model", "birefnet-general-lite")
    alpha_matting = data.get("alphaMatting", False)
    fill_holes = data.get("fillHoles", False)
    smooth_edge = float(data.get("smoothEdge", 0.0))

    start_time = time.time()
    try:
        if "," in b64_input:
            b64_input = b64_input.split(",", 1)[1]

        raw_bytes = base64.b64decode(b64_input)
        valid, user_err, input_image = validate_image_bytes(raw_bytes)
        if not valid:
            return {"success": False, "error": user_err}

        input_image = input_image.convert("RGBA")
        orig_w, orig_h = input_image.size

        MAX_SIDE = 2048
        scale = min(MAX_SIDE / orig_w, MAX_SIDE / orig_h, 1.0)
        if scale < 1.0:
            new_w = int(orig_w * scale)
            new_h = int(orig_h * scale)
            model_input = input_image.resize((new_w, new_h), Image.Resampling.LANCZOS)
        else:
            model_input = input_image.copy()

        session = get_session(model_name)
        try:
            model_output = remove(
                model_input,
                session=session,
                alpha_matting=True,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_size=10,
                post_process_mask=True
            )
        except Exception as matting_err:
            print(f"Alpha matting fallback: {matting_err}")
            try:
                model_output = remove(model_input, session=session, post_process_mask=True)
            except Exception:
                model_output = remove(model_input, session=session)

        if isinstance(model_output, np.ndarray):
            model_output = Image.fromarray(model_output)
        elif not isinstance(model_output, Image.Image):
            model_output = Image.fromarray(np.array(model_output))

        model_output = model_output.convert("RGBA")
        alpha = model_output.split()[3]
        if smooth_edge > 0:
            alpha = alpha.filter(ImageFilter.GaussianBlur(smooth_edge))

        alpha_upscaled = alpha.resize((orig_w, orig_h), Image.Resampling.LANCZOS)
        r_orig, g_orig, b_orig, _ = input_image.split()

        if fill_holes:
            try:
                import scipy.ndimage as ndimage
                alpha_np = np.array(alpha_upscaled, dtype=np.uint8)
                binary_mask = alpha_np > 20
                filled_mask = ndimage.binary_fill_holes(binary_mask)
                holes = filled_mask & ~binary_mask
                if np.any(holes):
                    alpha_np[holes] = 255
                    alpha_upscaled = Image.fromarray(alpha_np)
            except Exception:
                pass

        final_image = Image.merge("RGBA", (r_orig, g_orig, b_orig, alpha_upscaled))
        output_buf = io.BytesIO()
        final_image.save(output_buf, "PNG")
        output_b64 = base64.b64encode(output_buf.getvalue()).decode("utf-8")

        duration = time.time() - start_time
        return {
            "success": True,
            "base64Image": f"data:image/png;base64,{output_b64}",
            "duration": round(duration, 3),
        }
    except Exception as e:
        return {"success": False, "error": str(e) or "Processing failed."}
    finally:
        trim_memory_if_needed()

class BackgroundRemoverHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
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
            self.send_json({"status": "ok", "models": list(sessions.keys())})
        else:
            self.send_json({"error": "Not Found"}, status=404)

    def do_POST(self):
        global active_and_queued_jobs
        ip = self.client_address[0]

        if not check_ip_rate_limit(ip):
            self.send_json({"success": False, "error": "Too many requests."}, status=429)
            return

        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len)
        data = json.loads(post_data.decode("utf-8"))

        if self.path in ["/remove-base64", "/api/remove-bg"]:
            future = executor.submit(process_image_base64, data)
            result = future.result(timeout=60.0)
            self.send_json(result, status=200 if result.get("success") else 400)
        else:
            self.send_json({"error": "Not Found"}, status=404)

def run_server(port=5000):
    ThreadingHTTPServer.allow_reuse_address = True
    server_address = ("127.0.0.1", port)
    httpd = ThreadingHTTPServer(server_address, BackgroundRemoverHandler)
    print(f"Background Remover AI server running on port {port}...")
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
