"""
Karudi AI — Server-Side Image Processing Engine
Unified CLI tool for executing real image operations:
- remove_background (via GangaEngine)
- resize_image
- compress_image
- convert_format (PNG, JPG, WEBP)
- rotate_image
- square_image
- crop_image
- analyze_image
- image_to_binary
"""

import sys
import os
import json
import base64
import io
import math

# Try importing Pillow
try:
    from PIL import Image, ImageOps, ImageFilter
    Image.MAX_IMAGE_PIXELS = 80_000_000
except ImportError as e:
    print(json.dumps({"success": False, "error": f"PIL is not installed: {str(e)}"}))
    sys.exit(1)

# Helper: parse base64 or file path to PIL Image
def load_image(src):
    if not src:
        raise ValueError("No image source provided")
    if src.startswith("data:image/") or ";base64," in src:
        header, b64 = src.split(";base64,", 1)
        data = base64.b64decode(b64)
        return Image.open(io.BytesIO(data)), header
    elif os.path.exists(src):
        with open(src, "rb") as f:
            data = f.read()
        ext = os.path.splitext(src)[1].lower().replace(".", "")
        mime = f"data:image/{'jpeg' if ext in ['jpg', 'jpeg'] else ext};base64"
        return Image.open(io.BytesIO(data)), mime
    else:
        # Try raw base64
        try:
            data = base64.b64decode(src)
            return Image.open(io.BytesIO(data)), "data:image/png;base64"
        except Exception:
            raise ValueError(f"Unable to read image source: {src[:50]}...")

def image_to_base64_url(img, fmt="PNG", quality=90):
    buf = io.BytesIO()
    fmt_upper = fmt.upper()
    if fmt_upper in ["JPG", "JPEG"]:
        if img.mode in ("RGBA", "LA", "P"):
            rgb_img = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
            img = rgb_img
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        mime = "image/jpeg"
    elif fmt_upper == "WEBP":
        img.save(buf, format="WEBP", quality=quality, optimize=True)
        mime = "image/webp"
    else:
        img.save(buf, format="PNG", optimize=True)
        mime = "image/png"
    
    encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:{mime};base64,{encoded}", len(buf.getvalue())

def op_remove_background(params):
    src = params.get("imageSrc", "")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    try:
        from ganga_engine import GangaEngine
        # Extract base64
        if ";base64," in src:
            b64_raw = src.split(";base64,", 1)[1]
        else:
            b64_raw = src
            
        result = GangaEngine.remove_background(b64_raw, model_name=params.get("model", "ganga"))
        if result.get("success"):
            data_url = result.get("dataUrl")
            return {
                "success": True,
                "tool": "remove_background",
                "action": "remove_background",
                "resultImageSrc": data_url,
                "format": "png",
                "message": "Background removed successfully with transparent cutout."
            }
        else:
            raise RuntimeError(result.get("error", "Background removal engine returned an error"))
    except Exception as e:
        return {
            "success": False,
            "error": f"Background removal failed: {str(e)}"
        }

def op_resize(params):
    img, _ = load_image(params.get("imageSrc"))
    orig_w, orig_h = img.size
    
    target_w = params.get("width")
    target_h = params.get("height")
    scale = params.get("scale")
    maintain_aspect = params.get("maintainAspectRatio", True)
    
    if scale:
        scale_factor = float(scale) / 100.0 if float(scale) > 2 else float(scale)
        new_w = max(1, int(orig_w * scale_factor))
        new_h = max(1, int(orig_h * scale_factor))
    elif target_w and target_h:
        new_w = int(target_w)
        new_h = int(target_h)
        if maintain_aspect:
            aspect = orig_w / orig_h
            if new_w / new_h > aspect:
                new_w = int(new_h * aspect)
            else:
                new_h = int(new_w / aspect)
    elif target_w:
        new_w = int(target_w)
        new_h = int(target_w * (orig_h / orig_w))
    elif target_h:
        new_h = int(target_h)
        new_w = int(target_h * (orig_w / orig_h))
    else:
        new_w, new_h = orig_w, orig_h
        
    resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    fmt = params.get("format", "PNG")
    data_url, byte_count = image_to_base64_url(resized, fmt=fmt)
    
    return {
        "success": True,
        "tool": "resize_image",
        "action": "resize_image",
        "resultImageSrc": data_url,
        "width": new_w,
        "height": new_h,
        "originalWidth": orig_w,
        "originalHeight": orig_h,
        "bytes": byte_count,
        "format": fmt.lower(),
        "filename": f"resized_{new_w}x{new_h}.{fmt.lower()}",
        "message": f"Image successfully resized to {new_w}×{new_h} px."
    }

def op_compress(params):
    img, _ = load_image(params.get("imageSrc"))
    orig_w, orig_h = img.size
    
    quality = int(params.get("quality", 75))
    target_kb = params.get("targetKb")
    fmt = params.get("format", "JPEG")
    
    best_data_url, best_bytes = image_to_base64_url(img, fmt=fmt, quality=quality)
    
    if target_kb:
        target_bytes = float(target_kb) * 1024
        # Binary search for optimal quality
        low_q, high_q = 15, 95
        for _ in range(5):
            mid_q = (low_q + high_q) // 2
            d_url, b_size = image_to_base64_url(img, fmt=fmt, quality=mid_q)
            if b_size <= target_bytes:
                best_data_url = d_url
                best_bytes = b_size
                low_q = mid_q + 1
            else:
                high_q = mid_q - 1
                
    return {
        "success": True,
        "tool": "compress_image",
        "action": "compress_image",
        "resultImageSrc": best_data_url,
        "compressedSize": best_bytes,
        "width": orig_w,
        "height": orig_h,
        "format": fmt.lower(),
        "filename": f"compressed.{fmt.lower()}",
        "message": f"Image compressed to {(best_bytes / 1024):.1f} KB."
    }

def op_convert_format(params):
    img, _ = load_image(params.get("imageSrc"))
    target_format = params.get("targetFormat", "PNG").upper()
    if target_format == "JPG":
        target_format = "JPEG"
        
    data_url, byte_count = image_to_base64_url(img, fmt=target_format, quality=params.get("quality", 90))
    ext = "jpg" if target_format == "JPEG" else target_format.lower()
    
    return {
        "success": True,
        "tool": "convert_image_format",
        "action": "convert_format",
        "resultImageSrc": data_url,
        "format": ext,
        "bytes": byte_count,
        "filename": f"converted.{ext}",
        "message": f"Image converted to {ext.upper()} format."
    }

def op_rotate(params):
    img, _ = load_image(params.get("imageSrc"))
    degrees = int(params.get("degrees", 90))
    # Negative degrees for clockwise in PIL
    rotated = img.rotate(-degrees, expand=True)
    data_url, byte_count = image_to_base64_url(rotated, fmt="PNG")
    
    return {
        "success": True,
        "tool": "rotate_image",
        "action": "rotate_image",
        "resultImageSrc": data_url,
        "rotationDegrees": degrees,
        "width": rotated.width,
        "height": rotated.height,
        "filename": f"rotated_{degrees}deg.png",
        "message": f"Image rotated by {degrees}°."
    }

def op_square(params):
    img, _ = load_image(params.get("imageSrc"))
    w, h = img.size
    side = max(w, h)
    bg_style = params.get("background", "blur")
    
    if bg_style == "blur":
        # Create blurred background
        bg = img.resize((side, side), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(radius=25))
    elif bg_style == "white":
        bg = Image.new("RGBA", (side, side), (255, 255, 255, 255))
    elif bg_style == "black":
        bg = Image.new("RGBA", (side, side), (0, 0, 0, 255))
    else:
        bg = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        
    if img.mode != "RGBA":
        img = img.convert("RGBA")
        
    paste_x = (side - w) // 2
    paste_y = (side - h) // 2
    bg.paste(img, (paste_x, paste_y), mask=img)
    
    data_url, byte_count = image_to_base64_url(bg, fmt="PNG")
    return {
        "success": True,
        "tool": "square_image",
        "action": "square_image",
        "resultImageSrc": data_url,
        "width": side,
        "height": side,
        "filename": f"squared_{side}x{side}.png",
        "message": f"Image squared to 1:1 ({side}×{side} px) with {bg_style} canvas."
    }

def op_crop(params):
    img, _ = load_image(params.get("imageSrc"))
    w, h = img.size
    
    ratio = params.get("ratio")
    if ratio == "1:1":
        side = min(w, h)
        left = (w - side) // 2
        top = (h - side) // 2
        box = (left, top, left + side, top + side)
    elif ratio == "16:9":
        target_h = int(w * 9 / 16)
        if target_h <= h:
            top = (h - target_h) // 2
            box = (0, top, w, top + target_h)
        else:
            target_w = int(h * 16 / 9)
            left = (w - target_w) // 2
            box = (left, 0, left + target_w, h)
    elif ratio == "4:3":
        target_h = int(w * 3 / 4)
        if target_h <= h:
            top = (h - target_h) // 2
            box = (0, top, w, top + target_h)
        else:
            target_w = int(h * 4 / 3)
            left = (w - target_w) // 2
            box = (left, 0, left + target_w, h)
    else:
        box = params.get("box", (0, 0, w, h))
        
    cropped = img.crop(box)
    data_url, byte_count = image_to_base64_url(cropped, fmt="PNG")
    
    return {
        "success": True,
        "tool": "crop_image",
        "action": "crop_image",
        "resultImageSrc": data_url,
        "width": cropped.width,
        "height": cropped.height,
        "filename": "cropped.png",
        "message": f"Image cropped to {cropped.width}×{cropped.height} px."
    }

def op_analyze(params):
    img, _ = load_image(params.get("imageSrc"))
    w, h = img.size
    
    # Palette analysis
    thumb = img.convert("RGB").resize((100, 100))
    quantized = thumb.quantize(colors=6)
    palette_raw = quantized.getpalette()[:18]
    hex_colors = []
    for i in range(0, len(palette_raw), 3):
        r, g, b = palette_raw[i:i+3]
        hex_colors.append(f"#{r:02x}{g:02x}{b:02x}")
        
    gcd_val = math.gcd(w, h)
    aspect = f"{w // gcd_val}:{h // gcd_val}" if gcd_val > 0 else "1:1"
    
    return {
        "success": True,
        "tool": "analyze_image",
        "action": "analyze_image",
        "width": w,
        "height": h,
        "dimensions": f"{w} × {h} px",
        "aspectRatio": aspect,
        "palette": hex_colors,
        "mode": img.mode,
        "format": img.format or "PNG",
        "message": f"Analysis complete: {w}×{h} px, aspect ratio {aspect}, palette extracted."
    }

def op_to_binary(params):
    img, _ = load_image(params.get("imageSrc"))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    raw_bytes = buf.getvalue()
    
    sample_bits = "".join(f"{b:08b}" for b in raw_bytes[:512])
    return {
        "success": True,
        "tool": "image_to_binary",
        "action": "image_to_binary",
        "totalBytes": len(raw_bytes),
        "totalBits": len(raw_bytes) * 8,
        "previewBits": sample_bits + "...",
        "filename": "image_binary.txt",
        "message": f"Encoded image into {len(raw_bytes):,} raw bytes ({len(raw_bytes)*8:,} bits)."
    }

def op_image_to_pdf(params):
    src = params.get("imageSrc", "")
    img, _ = load_image(src)
    buf = io.BytesIO()
    if img.mode in ("RGBA", "LA", "P"):
        rgb_img = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
        img = rgb_img
    elif img.mode != "RGB":
        img = img.convert("RGB")
    
    img.save(buf, format="PDF", resolution=100.0)
    pdf_bytes = buf.getvalue()
    encoded = base64.b64encode(pdf_bytes).decode("utf-8")
    out_filename = params.get("filename", "converted_document.pdf")
    if not out_filename.lower().endswith(".pdf"):
        out_filename += ".pdf"
    
    return {
        "success": True,
        "tool": "image_to_pdf",
        "action": "image_to_pdf",
        "resultPdfDataUrl": f"data:application/pdf;base64,{encoded}",
        "filename": out_filename,
        "message": f"Done — your PDF is ready ({len(pdf_bytes):,} bytes)."
    }

OPERATIONS = {
    "remove_background": op_remove_background,
    "resize_image": op_resize,
    "compress_image": op_compress,
    "convert_format": op_convert_format,
    "rotate_image": op_rotate,
    "square_image": op_square,
    "crop_image": op_crop,
    "analyze_image": op_analyze,
    "image_to_binary": op_to_binary,
    "image_to_pdf": op_image_to_pdf,
}

def main():
    if len(sys.argv) > 1 and sys.argv[1].endswith(".json") and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        input_data = sys.stdin.read()
        if not input_data.strip():
            print(json.dumps({"success": False, "error": "No input JSON received"}))
            return
        data = json.loads(input_data)
        
    op = data.get("operation")
    if op not in OPERATIONS:
        print(json.dumps({"success": False, "error": f"Unknown operation: {op}"}))
        return
        
    try:
        result = OPERATIONS[op](data.get("params", {}))
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
