import sys
import json
import os
import subprocess

def install_and_import(package, pip_name=None):
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
            sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage: python remove_bg.py <settings_json_path>")
        sys.exit(1)

    first_arg = sys.argv[1]
    if first_arg.endswith(".json"):
        if not os.path.exists(first_arg):
            print(f"Settings file not found: {first_arg}")
            sys.exit(1)
        with open(first_arg, "r", encoding="utf-8") as f:
            settings = json.load(f)
        input_path = settings.get("input", "")
        output_path = settings.get("output", "")
    else:
        if len(sys.argv) < 3:
            print("Usage: python remove_bg.py <input_path> <output_path>")
            sys.exit(1)
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        settings = {}

    if not input_path or not output_path:
        print("Error: Input and output paths must be specified.")
        sys.exit(1)

    if not os.path.exists(input_path):
        print(f"Input file not found: {input_path}")
        sys.exit(1)

    install_and_import("PIL", "pillow")
    install_and_import("rembg")
    install_and_import("numpy")

    try:
        from rembg import remove, new_session
        from PIL import Image, ImageFilter
        import numpy as np
    except ImportError as e:
        print(f"Failed to load dependencies: {e}")
        sys.exit(1)

    try:
        print(f"Processing: {input_path}")
        input_image = Image.open(input_path).convert("RGBA")
        orig_w, orig_h = input_image.size

        # ── Model Selection ──────────────────────────────────────────────────────
        model_name = settings.get("model", "birefnet-general-lite")
        alpha_matting = settings.get("alpha_matting", False)
        fill_holes = settings.get("fill_holes", False)
        smooth_radius = float(settings.get("smooth_edge", 0.0))

        # ── Resize for AI model pass ─────────────────────────────────────────────
        MAX_SIZE = 2048
        resized_image = input_image.copy()
        resized_image.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
        print(f"Resized for model pass: {resized_image.size}")

        session = None
        try:
            print(f"Loading model: {model_name} ...")
            session = new_session(model_name, providers=["CPUExecutionProvider"])
        except Exception as e:
            print(f"Could not load specified model {model_name}: {e}. Trying fallback models...")
            # Fallback models cascade
            for fb_model in ["birefnet-general-lite", "isnet-general-use", "u2net"]:
                try:
                    print(f"Trying fallback model: {fb_model} ...")
                    session = new_session(fb_model, providers=["CPUExecutionProvider"])
                    model_name = fb_model
                    print(f"Successfully loaded fallback: {fb_model}")
                    break
                except Exception as fb_err:
                    print(f"Failed to load fallback {fb_model}: {fb_err}")

        removed_resized = None
        # ── Run Background Removal on Resized Image ──────────────────────────────
        try:
            if session:
                removed_resized = remove(
                    resized_image,
                    session=session,
                    alpha_matting=True,
                    alpha_matting_foreground_threshold=240,
                    alpha_matting_background_threshold=10,
                    alpha_matting_erode_size=10,
                    post_process_mask=True
                )
            else:
                print("No model loaded — using rembg defaults on resized image.")
                removed_resized = remove(resized_image, post_process_mask=True)
        except Exception as e:
            print(f"Remove failed ({e}), using fallback remove without parameters...")
            try:
                removed_resized = remove(resized_image, session=session, post_process_mask=True) if session else remove(resized_image)
            except Exception as fb_err:
                print(f"Fallback remove failed: {fb_err}")
                removed_resized = resized_image

        # Ensure result is a PIL Image
        if isinstance(removed_resized, np.ndarray):
            removed_resized = Image.fromarray(removed_resized)
        elif not isinstance(removed_resized, Image.Image):
            removed_resized = Image.fromarray(np.array(removed_resized))

        # ── Extract and Upscale Mask ─────────────────────────────────────────────
        r_res, g_res, b_res, alpha = removed_resized.split()

        # Very light edge blur for natural anti-aliasing if requested
        if smooth_radius > 0:
            alpha = alpha.filter(ImageFilter.GaussianBlur(smooth_radius))

        # Upscale mask back to original size with high quality LANCZOS
        alpha_upscaled = alpha.resize((orig_w, orig_h), Image.Resampling.LANCZOS)

        # Apply to original high-res image channels
        r_orig, g_orig, b_orig, _ = input_image.split()

        # Optional: Hole filling
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
                    print(f"Hole filling: restored {int(np.sum(holes))} interior pixels.")
            except Exception as hole_err:
                print(f"Hole filling skipped: {hole_err}")

        output_image = Image.merge("RGBA", (r_orig, g_orig, b_orig, alpha_upscaled))
        print(f"Background removed using model: {model_name}")

        # ── Save Output ──────────────────────────────────────────────────────────
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        output_image.save(output_path, "PNG")

        print("Success")

    except Exception as e:
        import traceback
        print(f"Error: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
