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
    print("Watermark Remover AI Engine dependencies loaded successfully.")
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

def remove_watermark_cv(input_image, mode="full_auto", sensitivity=55, engine="smart_neural", preserve_details=True):
    """
    High-precision watermark detection and inpainting.
    Guarantees 100% pixel-perfect preservation of every clean area of the image.
    Only watermark pixels are replaced.
    """
    orig_rgba = input_image.convert("RGBA")
    orig_np = np.array(orig_rgba)
    orig_h, orig_w = orig_np.shape[:2]

    img_bgr = cv2.cvtColor(orig_np, cv2.COLOR_RGBA2BGR)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    sens = max(0.1, min(1.0, float(sensitivity) / 100.0))
    full_mask = np.zeros((orig_h, orig_w), dtype=np.uint8)

    # 1. Google Gemini AI Sparkle / Astroid Star & Bottom-Right Watermark Detection
    if mode in ["full_auto", "gemini_ai", "corners"]:
        roi_ymin = int(orig_h * 0.50)
        roi_xmin = int(orig_w * 0.50)
        roi_gray = gray[roi_ymin:, roi_xmin:]
        roi_h, roi_w = roi_gray.shape

        if roi_h > 20 and roi_w > 20:
            k_size = max(15, min(45, int(min(orig_w, orig_h) * 0.04) | 1))
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k_size, k_size))
            tophat = cv2.morphologyEx(roi_gray, cv2.MORPH_TOPHAT, kernel)

            p95 = np.percentile(tophat, 95)
            tophat_thresh = max(3.0, min(18.0, p95 * (1.2 - sens * 0.5)))
            _, roi_binary = cv2.threshold(tophat, tophat_thresh, 255, cv2.THRESH_BINARY)

            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(roi_binary)
            for i in range(1, num_labels):
                area = stats[i, cv2.CC_STAT_AREA]
                bw = stats[i, cv2.CC_STAT_WIDTH]
                bh = stats[i, cv2.CC_STAT_HEIGHT]
                aspect = bw / float(bh) if bh > 0 else 0

                max_dim = max(orig_w, orig_h)
                min_star = max(8, int(max_dim * 0.008))
                max_star = max(140, int(max_dim * 0.12))

                if (min_star * min_star * 0.25) <= area <= (max_star * max_star * 1.5) and \
                   0.45 <= aspect <= 2.2 and \
                   bw <= max_star and bh <= max_star:
                    full_mask[roi_ymin:, roi_xmin:][labels == i] = 255

    # 2. General Corner Logos, Timestamps & Watermarks
    if mode in ["full_auto", "corners"]:
        corner_w = int(orig_w * 0.32)
        corner_h = int(orig_h * 0.32)
        corners = [
            (0, corner_h, 0, corner_w),
            (0, corner_h, orig_w - corner_w, orig_w),
            (orig_h - corner_h, orig_h, 0, corner_w),
            (orig_h - corner_h, orig_h, orig_w - corner_w, orig_w),
        ]
        k_size = max(11, min(31, int(min(orig_w, orig_h) * 0.03) | 1))
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (k_size, k_size))

        for (y1, y2, x1, x2) in corners:
            c_gray = gray[y1:y2, x1:x2]
            tophat_w = cv2.morphologyEx(c_gray, cv2.MORPH_TOPHAT, kernel)
            blackhat_b = cv2.morphologyEx(c_gray, cv2.MORPH_BLACKHAT, kernel)

            t_w = max(12.0, 28.0 * (1.15 - sens * 0.5))
            t_b = max(14.0, 32.0 * (1.15 - sens * 0.5))

            _, b_w = cv2.threshold(tophat_w, t_w, 255, cv2.THRESH_BINARY)
            _, b_b = cv2.threshold(blackhat_b, t_b, 255, cv2.THRESH_BINARY)
            c_mask = cv2.bitwise_or(b_w, b_b)

            num_l, labs, sts, _ = cv2.connectedComponentsWithStats(c_mask)
            for i in range(1, num_l):
                area = sts[i, cv2.CC_STAT_AREA]
                bw = sts[i, cv2.CC_STAT_WIDTH]
                bh = sts[i, cv2.CC_STAT_HEIGHT]
                if area >= 15 and bw >= 4 and bh >= 4 and bw < corner_w * 0.9:
                    full_mask[y1:y2, x1:x2][labs == i] = 255

    # 3. Stock Photo Grid / Tiled Watermarks
    if mode == "stock_grid":
        k_size = max(15, min(35, int(min(orig_w, orig_h) * 0.025) | 1))
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (k_size, k_size))
        tophat_w = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)
        t_val = max(10.0, 24.0 * (1.1 - sens * 0.4))
        _, full_grid_mask = cv2.threshold(tophat_w, t_val, 255, cv2.THRESH_BINARY)
        full_mask = cv2.bitwise_or(full_mask, full_grid_mask)

    # 4. Morphological Dilation: encapsulate anti-aliased subpixels
    dilate_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    dilated_mask = cv2.dilate(full_mask, dilate_k, iterations=2)

    mask_pixels = int(np.count_nonzero(dilated_mask))
    if mask_pixels == 0:
        return orig_rgba, False, 0

    # 5. Inpainting (Telea / Navier-Stokes)
    inpaint_method = cv2.INPAINT_NS if engine == "smart_neural" else cv2.INPAINT_TELEA
    inpainted_bgr = cv2.inpaint(img_bgr, dilated_mask, inpaintRadius=5, flags=inpaint_method)

    # 6. Lossless Bit-For-Bit Original Image Preservation
    inpainted_rgba = cv2.cvtColor(inpainted_bgr, cv2.COLOR_BGR2RGBA)
    inpainted_rgba[:, :, 3] = orig_np[:, :, 3]

    # Replace only masked pixels; every unmasked pixel is 100% original copy
    mask_3d = np.repeat((dilated_mask > 0)[:, :, np.newaxis], 4, axis=2)
    final_np = np.where(mask_3d, inpainted_rgba, orig_np)

    # 7. Match local photo micro-grain
    if preserve_details:
        noise = (np.random.randn(orig_h, orig_w, 3) * 1.5).astype(np.int16)
        for c in range(3):
            ch = final_np[:, :, c].astype(np.int16)
            masked_noise = np.where(dilated_mask > 0, ch + noise[:, :, c], ch)
            final_np[:, :, c] = np.clip(masked_noise, 0, 255).astype(np.uint8)

    final_pil = Image.fromarray(final_np, mode="RGBA")
    return final_pil, True, mask_pixels

def process_watermark_base64(data):
    b64_input = data.get("base64Image", "")
    mode = data.get("mode", "full_auto")
    sensitivity = float(data.get("sensitivity", 55))
    engine = data.get("engine", "smart_neural")
    preserve_details = bool(data.get("preserveDetails", True))

    start_time = time.time()
    try:
        if "," in b64_input:
            b64_input = b64_input.split(",", 1)[1]

        raw_bytes = base64.b64decode(b64_input)
        valid, err_msg, input_img = validate_image_bytes(raw_bytes)
        if not valid:
            return {"success": False, "error": err_msg}

        cleaned_img, detected, pixel_count = remove_watermark_cv(
            input_img, mode=mode, sensitivity=sensitivity, engine=engine, preserve_details=preserve_details
        )

        output_buf = io.BytesIO()
        cleaned_img.save(output_buf, "PNG", optimize=True)
        out_b64 = base64.b64encode(output_buf.getvalue()).decode("utf-8")

        return {
            "success": True,
            "base64Image": f"data:image/png;base64,{out_b64}",
            "watermarkDetected": detected,
            "maskedPixels": pixel_count,
            "duration": round(time.time() - start_time, 3),
        }
    except Exception as e:
        return {"success": False, "error": str(e) or "Watermark processing failed."}

# -------------------------------------------------------------
# High-Accuracy Auto Face Detection & Localized Anonymization (YuNet DNN)
# -------------------------------------------------------------
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

class WatermarkServerHandler(BaseHTTPRequestHandler):
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
            self.send_json({"status": "ok", "service": "watermark-and-face-ai"})
        else:
            self.send_json({"error": "Not Found"}, status=404)

    def do_POST(self):
        content_len = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_len)
        data = json.loads(post_data.decode("utf-8"))

        if self.path in ["/remove-watermark", "/api/remove-watermark"]:
            res = process_watermark_base64(data)
            self.send_json(res, status=200 if res.get("success") else 400)
        elif self.path in ["/blur-face", "/api/blur-face", "/detect-faces", "/api/detect-faces"]:
            if "detect-faces" in self.path:
                data["detectOnly"] = True
            res = process_face_blur_base64(data)
            self.send_json(res, status=200 if res.get("success") else 400)
        else:
            self.send_json({"error": "Not Found"}, status=404)

def run_server(port=5001):
    ThreadingHTTPServer.allow_reuse_address = True
    server_address = ("127.0.0.1", port)
    httpd = ThreadingHTTPServer(server_address, WatermarkServerHandler)
    print(f"Watermark Remover Python server running on port {port}...")
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
