import sys
import json
import os
import time
import base64
import io
import threading
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

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
install_and_import("cv2", "opencv-python")
install_and_import("numpy")

try:
    import cv2
    from PIL import Image
    import numpy as np
    print("Face Blur & AI Anonymization Engine dependencies loaded.")
except ImportError as e:
    print(f"Failed to import dependencies: {e}")
    sys.exit(1)

Image.MAX_IMAGE_PIXELS = 100_000_000

def validate_image_bytes(raw_bytes):
    if not raw_bytes or len(raw_bytes) == 0:
        return False, "Empty image data", None
    try:
        bio = io.BytesIO(raw_bytes)
        img = Image.open(bio)
        img.verify()
        bio.seek(0)
        img = Image.open(bio)
        return True, None, img
    except Exception as e:
        return False, f"Invalid image format: {e}", None

_yunet_detector = None
_yunet_lock = threading.Lock()

def get_face_detector():
    global _yunet_detector
    with _yunet_lock:
        if _yunet_detector is not None:
            return _yunet_detector
        
        models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
        os.makedirs(models_dir, exist_ok=True)
        yunet_path = os.path.join(models_dir, "face_detection_yunet.onnx")

        if not os.path.exists(yunet_path):
            yunet_url = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
            try:
                import urllib.request
                print("Downloading YuNet ONNX face detection model...")
                urllib.request.urlretrieve(yunet_url, yunet_path)
            except Exception as e:
                print(f"Failed to download YuNet model: {e}")
                return None

        try:
            detector = cv2.FaceDetectorYN_create(yunet_path, "", (320, 320), score_threshold=0.5, nms_threshold=0.3)
            _yunet_detector = detector
            return detector
        except Exception as e:
            print(f"Failed to create FaceDetectorYN: {e}")
            return None

def detect_and_blur_faces_cv(
    input_image,
    blur_type="gaussian",
    strength=25,
    shape="ellipse",
    margin=15,
    detect_only=False,
    manual_faces=None,
):
    orig_rgba = input_image.convert("RGBA")
    orig_np = np.array(orig_rgba)
    orig_h, orig_w = orig_np.shape[:2]

    bgr = cv2.cvtColor(orig_np, cv2.COLOR_RGBA2BGR)
    alpha_channel = orig_np[:, :, 3] if orig_np.shape[2] == 4 else None

    faces_boxes = []

    if manual_faces and len(manual_faces) > 0:
        for idx, mf in enumerate(manual_faces):
            fx = float(mf.get("x", 0)) * orig_w / 100.0
            fy = float(mf.get("y", 0)) * orig_h / 100.0
            fw = float(mf.get("w", 0)) * orig_w / 100.0
            fh = float(mf.get("h", 0)) * orig_h / 100.0
            faces_boxes.append({
                "id": mf.get("id") or f"face_{idx+1}_{int(time.time()*1000)}",
                "x": round((fx / orig_w) * 100, 1),
                "y": round((fy / orig_h) * 100, 1),
                "w": round((fw / orig_w) * 100, 1),
                "h": round((fh / orig_h) * 100, 1),
            })
    else:
        detector = get_face_detector()
        if detector is not None:
            max_dim = 1024
            scale = 1.0
            if max(orig_w, orig_h) > max_dim:
                scale = max_dim / float(max(orig_w, orig_h))
                det_w = int(orig_w * scale)
                det_h = int(orig_h * scale)
                det_img = cv2.resize(bgr, (det_w, det_h))
            else:
                det_w, det_h = orig_w, orig_h
                det_img = bgr

            detector.setInputSize((det_w, det_h))
            status, detected = detector.detect(det_img)

            if detected is not None and len(detected) > 0:
                for idx, row in enumerate(detected):
                    score = float(row[14])
                    if score < 0.45:
                        continue
                    dx, dy, dw, dh = float(row[0]), float(row[1]), float(row[2]), float(row[3])
                    fx = dx / scale
                    fy = dy / scale
                    fw = dw / scale
                    fh = dh / scale

                    pad_w = fw * (float(margin) / 100.0)
                    pad_h = fh * (float(margin) / 100.0 + 0.08)

                    fx_padded = max(0, fx - pad_w)
                    fy_padded = max(0, fy - pad_h)
                    fw_padded = min(orig_w - fx_padded, fw + pad_w * 2)
                    fh_padded = min(orig_h - fy_padded, fh + pad_h * 2)

                    faces_boxes.append({
                        "id": f"face_{idx+1}_{int(time.time()*1000)}",
                        "x": round((fx_padded / orig_w) * 100, 1),
                        "y": round((fy_padded / orig_h) * 100, 1),
                        "w": round((fw_padded / orig_w) * 100, 1),
                        "h": round((fh_padded / orig_h) * 100, 1),
                    })

    if len(faces_boxes) == 0 or detect_only:
        return input_image, faces_boxes

    result_bgr = bgr.copy()

    for face in faces_boxes:
        fx = int(face["x"] * orig_w / 100.0)
        fy = int(face["y"] * orig_h / 100.0)
        fw = int(face["w"] * orig_w / 100.0)
        fh = int(face["h"] * orig_h / 100.0)

        fx = max(0, min(orig_w - 1, fx))
        fy = max(0, min(orig_h - 1, fy))
        fw = max(1, min(orig_w - fx, fw))
        fh = max(1, min(orig_h - fy, fh))

        roi = result_bgr[fy : fy + fh, fx : fx + fw]
        roi_h, roi_w = roi.shape[:2]
        if roi_h < 2 or roi_w < 2:
            continue

        if blur_type == "blackout":
            if shape == "ellipse":
                cv2.ellipse(
                    result_bgr,
                    (fx + fw // 2, fy + fh // 2),
                    (fw // 2, fh // 2),
                    0,
                    0,
                    360,
                    (0, 0, 0),
                    -1,
                    cv2.LINE_AA,
                )
            else:
                cv2.rectangle(result_bgr, (fx, fy), (fx + fw, fy + fh), (0, 0, 0), -1)
            continue

        if blur_type == "pixelate":
            block_size = max(4, int((strength / 50.0) * (min(roi_w, roi_h) / 3.0)))
            tiny_w = max(1, roi_w // block_size)
            tiny_h = max(1, roi_h // block_size)
            tiny = cv2.resize(roi, (tiny_w, tiny_h), interpolation=cv2.INTER_LINEAR)
            processed_roi = cv2.resize(tiny, (roi_w, roi_h), interpolation=cv2.INTER_NEAREST)
        else:
            ksize = max(15, int((strength / 50.0) * (min(roi_w, roi_h) * 0.75)) | 1)
            sigma = max(5, int((strength / 50.0) * 45))
            processed_roi = cv2.GaussianBlur(roi, (ksize, ksize), sigma)

        mask = np.zeros((roi_h, roi_w), dtype=np.uint8)
        if shape == "ellipse":
            cv2.ellipse(
                mask,
                (roi_w // 2, roi_h // 2),
                (roi_w // 2, roi_h // 2),
                0,
                0,
                360,
                255,
                -1,
            )
        else:
            mask[:] = 255

        feather_k = max(5, int(min(roi_w, roi_h) * 0.1) | 1)
        feathered_mask = cv2.GaussianBlur(mask, (feather_k, feather_k), feather_k / 3.0)
        alpha = (feathered_mask.astype(float) / 255.0)[:, :, None]

        blended_roi = (roi * (1.0 - alpha) + processed_roi * alpha).astype(np.uint8)
        result_bgr[fy : fy + fh, fx : fx + fw] = blended_roi

    if alpha_channel is not None:
        result_rgb = cv2.cvtColor(result_bgr, cv2.COLOR_BGR2RGB)
        result_rgba = np.dstack([result_rgb, alpha_channel])
        out_img = Image.fromarray(result_rgba, "RGBA")
    else:
        result_rgb = cv2.cvtColor(result_bgr, cv2.COLOR_BGR2RGB)
        out_img = Image.fromarray(result_rgb, "RGB")

    return out_img, faces_boxes

def process_face_blur_base64(data):
    start_time = time.time()
    try:
        raw_b64 = data.get("base64Image") or data.get("image")
        if not raw_b64:
            return {"success": False, "error": "No image data provided"}

        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]

        img_bytes = base64.b64decode(raw_b64)
        is_valid, err_msg, input_img = validate_image_bytes(img_bytes)
        if not is_valid:
            return {"success": False, "error": err_msg}

        blur_type = data.get("blurType", "gaussian")
        strength = float(data.get("strength", 25))
        shape = data.get("shape", "ellipse")
        margin = float(data.get("margin", 15))
        detect_only = bool(data.get("detectOnly", False))
        manual_faces = data.get("faces", None)

        blurred_img, faces_boxes = detect_and_blur_faces_cv(
            input_img,
            blur_type=blur_type,
            strength=strength,
            shape=shape,
            margin=margin,
            detect_only=detect_only,
            manual_faces=manual_faces,
        )

        output_buf = io.BytesIO()
        blurred_img.save(output_buf, "PNG", optimize=True)
        out_b64 = base64.b64encode(output_buf.getvalue()).decode("utf-8")

        return {
            "success": True,
            "base64Image": f"data:image/png;base64,{out_b64}",
            "facesDetected": len(faces_boxes),
            "faces": faces_boxes,
            "duration": round(time.time() - start_time, 3),
        }
    except Exception as e:
        return {"success": False, "error": str(e) or "Face detection & blur failed."}

class FaceBlurServerHandler(BaseHTTPRequestHandler):
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
            self.send_json({"status": "ok", "service": "face-blur-ai"})
        else:
            self.send_json({"error": "Not Found"}, status=404)

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len)
        data = json.loads(post_data.decode("utf-8"))

        if self.path in ["/blur-face", "/api/blur-face", "/detect-faces", "/api/detect-faces"]:
            if "detect-faces" in self.path:
                data["detectOnly"] = True
            res = process_face_blur_base64(data)
            self.send_json(res, status=200 if res.get("success") else 400)
        else:
            self.send_json({"error": "Not Found"}, status=404)

def run_server(port=5001):
    ThreadingHTTPServer.allow_reuse_address = True
    server_address = ("127.0.0.1", port)
    httpd = ThreadingHTTPServer(server_address, FaceBlurServerHandler)
    print(f"Face Blur Python server running on port {port}...")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.server_close()

if __name__ == "__main__":
    port = 5001
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_server(port)
