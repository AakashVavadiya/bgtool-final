/**
 * High-Performance Client-Side Face Detection & Anonymization Engine
 * Automatically detects faces in images and applies localized privacy blurring/pixelation.
 */

export interface FaceBox {
  id: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  w: number; // percentage (0 - 100)
  h: number; // percentage (0 - 100)
}

export interface FaceBlurOptions {
  type: "gaussian" | "pixelate" | "blackout";
  strength: number; // 5 to 50
  shape: "ellipse" | "rect";
}

/**
 * Detect faces in an HTMLImageElement using native FaceDetector if available,
 * with a fast, universal skin-tone cluster fallback.
 */
export async function detectFacesInImage(img: HTMLImageElement): Promise<FaceBox[]> {
  const natW = img.naturalWidth || img.width || 800;
  const natH = img.naturalHeight || img.height || 600;

  // 1. Try Python YuNet AI Backend (highest accuracy, detects all angles & profile faces)
  try {
    const tempCanvas = document.createElement("canvas");
    // Limit to reasonable resolution for instant upload
    const maxDim = 1200;
    let sW = natW;
    let sH = natH;
    if (Math.max(sW, sH) > maxDim) {
      const scale = maxDim / Math.max(sW, sH);
      sW = Math.round(sW * scale);
      sH = Math.round(sH * scale);
    }
    tempCanvas.width = sW;
    tempCanvas.height = sH;
    const tCtx = tempCanvas.getContext("2d");
    if (tCtx) {
      tCtx.drawImage(img, 0, 0, sW, sH);
      const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.85);
      const res = await fetch("/api/blur-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: dataUrl,
          detectOnly: true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.faces)) {
          return json.faces as FaceBox[];
        }
      }
    }
  } catch (backendErr) {
    console.warn("Python face blur server unreachable for detection, falling back:", backendErr);
  }

  // 2. Try Native Browser FaceDetector (Hardware accelerated in Chrome/Edge/Chromium)
  if (typeof window !== "undefined" && "FaceDetector" in window) {
    try {
      const FaceDetectorClass = (window as any).FaceDetector;
      const detector = new FaceDetectorClass({ fastMode: false, maxDetectedFaces: 20 });
      const detected = await detector.detect(img);

      if (detected && detected.length > 0) {
        const boxes: FaceBox[] = detected.map((face: any, idx: number) => {
          const bb = face.boundingBox;
          // Add small breathing padding around detected face bounds
          const padX = bb.width * 0.15;
          const padY = bb.height * 0.2;

          const x = Math.max(0, bb.x - padX);
          const y = Math.max(0, bb.y - padY);
          const w = Math.min(natW - x, bb.width + padX * 2);
          const h = Math.min(natH - y, bb.height + padY * 2.2);

          return {
            id: `face_${idx + 1}_${Date.now()}`,
            x: Number(((x / natW) * 100).toFixed(1)),
            y: Number(((y / natH) * 100).toFixed(1)),
            w: Number(((w / natW) * 100).toFixed(1)),
            h: Number(((h / natH) * 100).toFixed(1)),
          };
        });
        return boxes;
      }
    } catch (err) {
      console.warn("Native FaceDetector failed, falling back to CV detection:", err);
    }
  }

  // 2. Client-Side Color & Skin Cluster CV Detection
  try {
    const sampleW = 320;
    const sampleH = Math.round((natH / natW) * sampleW);
    const canvas = document.createElement("canvas");
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(img, 0, 0, sampleW, sampleH);
      const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
      const data = imgData.data;

      // Skin mask grid (downsampled by 4 for speed)
      const gridScale = 4;
      const gw = Math.floor(sampleW / gridScale);
      const gh = Math.floor(sampleH / gridScale);
      const skinGrid = new Uint8Array(gw * gh);

      for (let gy = 0; gy < gh; gy++) {
        for (let gx = 0; gx < gw; gx++) {
          const px = gx * gridScale;
          const py = gy * gridScale;
          const idx = (py * sampleW + px) * 4;

          const r = data[idx] ?? 0;
          const g = data[idx + 1] ?? 0;
          const b = data[idx + 2] ?? 0;

          // RGB to YCbCr skin tone classification
          const yVal = 0.299 * r + 0.587 * g + 0.114 * b;
          const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

          if (yVal >= 45 && cb >= 77 && cb <= 132 && cr >= 133 && cr <= 178) {
            skinGrid[gy * gw + gx] = 1;
          }
        }
      }

      // Find connected bounding components
      const visited = new Uint8Array(gw * gh);
      const clusters: { minX: number; maxX: number; minY: number; maxY: number; count: number }[] = [];

      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const idx = y * gw + x;
          if (skinGrid[idx] === 1 && visited[idx] === 0) {
            // BFS fill
            let minX = x, maxX = x, minY = y, maxY = y;
            let count = 0;
            const queue: [number, number][] = [[x, y]];
            visited[idx] = 1;

            while (queue.length > 0) {
              const [cx, cy] = queue.pop()!;
              count++;
              if (cx < minX) minX = cx;
              if (cx > maxX) maxX = cx;
              if (cy < minY) minY = cy;
              if (cy > maxY) maxY = cy;

              const neighbors: [number, number][] = [
                [cx + 1, cy],
                [cx - 1, cy],
                [cx, cy + 1],
                [cx, cy - 1],
              ];

              for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < gw && ny >= 0 && ny < gh) {
                  const nIdx = ny * gw + nx;
                  if (skinGrid[nIdx] === 1 && visited[nIdx] === 0) {
                    visited[nIdx] = 1;
                    queue.push([nx, ny]);
                  }
                }
              }
            }

            const bw = (maxX - minX + 1) * gridScale;
            const bh = (maxY - minY + 1) * gridScale;
            const areaPct = (bw * bh) / (sampleW * sampleH);
            const aspect = bh / (bw || 1);

            // Filter for human head proportions
            if (count >= 12 && areaPct >= 0.015 && areaPct <= 0.65 && aspect >= 0.7 && aspect <= 2.2) {
              clusters.push({
                minX: minX * gridScale,
                maxX: maxX * gridScale,
                minY: minY * gridScale,
                maxY: maxY * gridScale,
                count,
              });
            }
          }
        }
      }

      if (clusters.length > 0) {
        // Sort by area and limit to top 8 faces
        clusters.sort((a, b) => b.count - a.count);
        const topClusters = clusters.slice(0, 8);

        return topClusters.map((c, idx) => {
          const w = (c.maxX - c.minX) * 1.2;
          const h = (c.maxY - c.minY) * 1.25;
          const x = Math.max(0, c.minX - w * 0.1);
          const y = Math.max(0, c.minY - h * 0.15);

          return {
            id: `face_${idx + 1}_${Date.now()}`,
            x: Number(((x / sampleW) * 100).toFixed(1)),
            y: Number(((y / sampleH) * 100).toFixed(1)),
            w: Number(((Math.min(sampleW - x, w) / sampleW) * 100).toFixed(1)),
            h: Number(((Math.min(sampleH - y, h) / sampleH) * 100).toFixed(1)),
          };
        });
      }
    }
  } catch (e) {
    console.error("Skin cluster face detection error:", e);
  }

  // If no faces detected, return empty array
  return [];
}

/**
 * Apply localized face blur, pixelation, or blackout censor exclusively onto the detected face regions.
 * Preserves 100% of the non-face image areas in crystal clear detail.
 */
export function applyFaceAnonymization(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  faces: FaceBox[],
  options: FaceBlurOptions
) {
  if (!faces || faces.length === 0) return;

  const { type, strength, shape } = options;

  for (const face of faces) {
    const fx = Math.max(0, Math.round((face.x / 100) * canvasWidth));
    const fy = Math.max(0, Math.round((face.y / 100) * canvasHeight));
    const fw = Math.min(canvasWidth - fx, Math.round((face.w / 100) * canvasWidth));
    const fh = Math.min(canvasHeight - fy, Math.round((face.h / 100) * canvasHeight));

    if (fw <= 0 || fh <= 0) continue;

    ctx.save();
    ctx.beginPath();
    if (shape === "ellipse") {
      ctx.ellipse(fx + fw / 2, fy + fh / 2, fw / 2, fh / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.rect(fx, fy, fw, fh);
    }

    if (type === "blackout") {
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.restore();
      continue;
    }

    // Clip to face boundary so blur/pixelation only modifies face pixels
    ctx.clip();

    if (type === "pixelate") {
      const blockSize = Math.max(4, Math.round((strength / 100) * (fw / 2.5)));
      const tinyW = Math.max(2, Math.round(fw / blockSize));
      const tinyH = Math.max(2, Math.round(fh / blockSize));

      const tinyCanvas = document.createElement("canvas");
      tinyCanvas.width = tinyW;
      tinyCanvas.height = tinyH;
      const tinyCtx = tinyCanvas.getContext("2d");

      if (tinyCtx) {
        tinyCtx.drawImage(ctx.canvas, fx, fy, fw, fh, 0, 0, tinyW, tinyH);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tinyCanvas, 0, 0, tinyW, tinyH, fx, fy, fw, fh);
      }
    } else {
      // Gaussian / Smooth privacy blur
      const blurPx = Math.max(8, Math.round(strength * (canvasWidth / 1000) * 1.5));
      const pad = Math.round(Math.max(fw, fh) * 0.2);

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = fw + pad * 2;
      tempCanvas.height = fh + pad * 2;
      const tempCtx = tempCanvas.getContext("2d");

      if (tempCtx) {
        tempCtx.filter = `blur(${blurPx}px)`;
        // Draw with padding to prevent transparent edge bleed
        const srcX = Math.max(0, fx - pad);
        const srcY = Math.max(0, fy - pad);
        const srcW = Math.min(canvasWidth - srcX, fw + pad * 2);
        const srcH = Math.min(canvasHeight - srcY, fh + pad * 2);

        tempCtx.drawImage(
          ctx.canvas,
          srcX,
          srcY,
          srcW,
          srcH,
          srcX - (fx - pad),
          srcY - (fy - pad),
          srcW,
          srcH
        );

        ctx.drawImage(tempCanvas, pad, pad, fw, fh, fx, fy, fw, fh);
      }
    }

    ctx.restore();
  }
}
