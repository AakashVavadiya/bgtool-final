"""
Ganga AI Neural Background Removal Engine (Native Implementation)
Copyright (c) 2026 BG Tool. All rights reserved.

Proprietary neural image segmentation pipeline executing directly
via Microsoft ONNXRuntime without any third-party wrappers (rembg-free).
"""

import os
import sys
import time
import io
import base64
import threading
import numpy as np
from PIL import Image

# Ensure limit on background thread pools to prevent CPU saturation
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
os.environ["OPENBLAS_NUM_THREADS"] = "2"

try:
    import onnxruntime as ort
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "onnxruntime", "pillow", "numpy", "--quiet"])
    import onnxruntime as ort

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_REGISTRY = {
    # Ganga Primary Neural Engines
    "ganga": os.path.join(MODELS_DIR, "ganga-core.onnx"),
    "ganga-core": os.path.join(MODELS_DIR, "ganga-core.onnx"),
    "ganga-ultra": os.path.join(MODELS_DIR, "ganga-ultra.onnx"),
    "ganga-lite": os.path.join(MODELS_DIR, "ganga-lite.onnx"),
    # Aliases for UI selector pills
    "karudi": os.path.join(MODELS_DIR, "ganga-core.onnx"),
    "brahmaputra": os.path.join(MODELS_DIR, "ganga-core.onnx"),
    "narmada": os.path.join(MODELS_DIR, "ganga-lite.onnx"),
    "saraswati": os.path.join(MODELS_DIR, "ganga-lite.onnx"),
}

FALLBACK_MODELS = [
    os.path.join(MODELS_DIR, "ganga-core.onnx"),
    os.path.join(MODELS_DIR, "ganga-ultra.onnx"),
    os.path.join(MODELS_DIR, "ganga-lite.onnx"),
]

class GangaEngine:
    _sessions = {}
    _lock = threading.Lock()

    @classmethod
    def get_session(cls, model_key: str = "ganga") -> ort.InferenceSession:
        target_path = MODEL_REGISTRY.get(model_key.lower(), MODEL_REGISTRY["ganga"])

        with cls._lock:
            if target_path in cls._sessions:
                return cls._sessions[target_path]

            candidates = [target_path] + [p for p in FALLBACK_MODELS if p != target_path]
            for candidate in candidates:
                if os.path.exists(candidate):
                    try:
                        print(f"[Ganga AI] Initializing neural model: {os.path.basename(candidate)}...")
                        opts = ort.SessionOptions()
                        opts.enable_cpu_mem_arena = False
                        opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
                        opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
                        opts.intra_op_num_threads = 2
                        opts.inter_op_num_threads = 2

                        sess = ort.InferenceSession(candidate, sess_options=opts, providers=["CPUExecutionProvider"])
                        cls._sessions[target_path] = sess
                        print(f"[Ganga AI] Neural model {os.path.basename(candidate)} online!")
                        return sess
                    except Exception as e:
                        print(f"[Ganga AI] Error loading {candidate}: {e}")

            raise FileNotFoundError(f"Ganga AI models not found in {MODELS_DIR}. Please ensure model files are present.")

    @classmethod
    def remove_background(cls, image_input, model_name: str = "ganga") -> dict:
        """
        Executes native Ganga AI neural background removal on an image.
        Returns:
            {
                "success": bool,
                "base64Image": "data:image/png;base64,...",
                "width": int,
                "height": int,
                "duration": float
            }
        """
        start_time = time.time()
        try:
            # 1. Parse Image Input
            if isinstance(image_input, str):
                if "," in image_input:
                    image_input = image_input.split(",", 1)[1]
                raw_bytes = base64.b64decode(image_input)
                img = Image.open(io.BytesIO(raw_bytes))
            elif isinstance(image_input, bytes):
                img = Image.open(io.BytesIO(image_input))
            elif isinstance(image_input, Image.Image):
                img = image_input
            else:
                return {"success": False, "error": "Invalid image format provided."}

            img = img.convert("RGB")
            orig_w, orig_h = img.size

            if orig_w <= 0 or orig_h <= 0 or orig_w * orig_h > 60_000_000:
                return {"success": False, "error": "Image resolution exceeds supported limits (max 60 Megapixels)."}

            # 2. Ganga Neural Pre-processing (1024x1024 Standard Input Tensor)
            INPUT_SIZE = (1024, 1024)
            im_resized = img.resize(INPUT_SIZE, Image.Resampling.LANCZOS)
            im_ary = np.array(im_resized, dtype=np.float32) / 255.0

            # Normalization parameters for Dichotomous Image Segmentation
            mean = np.array([0.5, 0.5, 0.5], dtype=np.float32)
            std = np.array([1.0, 1.0, 1.0], dtype=np.float32)
            norm_ary = (im_ary - mean) / std

            # Transpose (H, W, C) -> (1, C, H, W)
            tensor = np.expand_dims(norm_ary.transpose((2, 0, 1)), 0).astype(np.float32)

            # 3. Native ONNX Inference Execution
            session = cls.get_session(model_name)
            input_name = session.get_inputs()[0].name
            ort_outs = session.run(None, {input_name: tensor})

            # 4. Ganga Alpha Map Extraction & Sub-Pixel Normalization
            pred = ort_outs[0][:, 0, :, :]
            ma = np.max(pred)
            mi = np.min(pred)
            pred = (pred - mi) / (ma - mi + 1e-8)
            pred = np.squeeze(pred)

            # 5. Full-Resolution Alpha Upscaling via Lanczos Interpolation
            alpha_mask = Image.fromarray((pred * 255).astype("uint8"), mode="L")
            alpha_mask = alpha_mask.resize((orig_w, orig_h), Image.Resampling.LANCZOS)

            # 6. Lossless RGBA Composite
            r, g, b = img.split()
            cutout_img = Image.merge("RGBA", (r, g, b, alpha_mask))

            out_buf = io.BytesIO()
            cutout_img.save(out_buf, "PNG", optimize=True)
            out_b64 = base64.b64encode(out_buf.getvalue()).decode("utf-8")

            duration = round(time.time() - start_time, 3)
            return {
                "success": True,
                "base64Image": f"data:image/png;base64,{out_b64}",
                "width": orig_w,
                "height": orig_h,
                "duration": duration,
                "engine": "Ganga AI Native Core",
            }
        except Exception as e:
            return {"success": False, "error": str(e) or "Ganga AI processing encountered an error."}
