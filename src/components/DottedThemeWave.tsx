import { useEffect, useRef } from "react";

interface DottedThemeWaveProps {
  originX: number;
  originY: number;
  isDark: boolean;
  onThemeSwitch: () => void;
  onComplete: () => void;
}

export function DottedThemeWave({
  originX,
  originY,
  isDark,
  onThemeSwitch,
  onComplete,
}: DottedThemeWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const switchedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();
    const duration = 950; // Total ms for wave to travel across screen

    // Set canvas dimensions
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Maximum distance from origin to furthest screen corner
    const maxRadius = Math.hypot(
      Math.max(originX, width - originX),
      Math.max(originY, height - originY)
    ) + 60;

    const spacing = 24; // Distance between dots
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    // Precalculate dot grid
    const dots: { x: number; y: number; dist: number; angle: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * spacing;
        const y = r * spacing;
        const dist = Math.hypot(x - originX, y - originY);
        const angle = Math.atan2(y - originY, x - originX);
        dots.push({ x, y, dist, angle });
      }
    }

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out curve for wave propagation
      const easeProgress = 1 - Math.pow(1 - progress, 2.5);
      const waveRadius = easeProgress * maxRadius;

      // Switch theme when wave is ~42% across the screen
      if (progress >= 0.42 && !switchedRef.current) {
        switchedRef.current = true;
        onThemeSwitch();
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing concentric dotted rings along the wave front
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        const ringRadius = waveRadius - i * 55;
        if (ringRadius > 0 && ringRadius < maxRadius + 100) {
          const ringAlpha = Math.max(0, (1 - progress) * (1 - i * 0.25));
          ctx.save();
          ctx.beginPath();
          ctx.arc(originX, originY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isDark
            ? `rgba(249, 115, 22, ${ringAlpha * 0.85})`
            : `rgba(245, 158, 11, ${ringAlpha * 0.9})`;
          ctx.lineWidth = Math.max(1.2, 3 - i * 0.8);
          ctx.setLineDash([4, 8]);
          ctx.lineDashOffset = -progress * 60;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Draw dotted matrix grid affected by the wave
      const waveWidth = 140; // Thickness of the wave disturbance crest

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (!dot) continue;
        const distDiff = Math.abs(dot.dist - waveRadius);

        let radius = 1.3;
        let alpha = 0.18;
        let isWaveActive = false;

        if (distDiff < waveWidth) {
          // Inside the wave crest!
          isWaveActive = true;
          const crestFactor = 1 - distDiff / waveWidth; // 0 to 1 at center of crest
          const bounce = Math.sin(crestFactor * Math.PI); // smooth bump

          radius = 1.3 + bounce * 4.2; // Dot swells up to 5.5px
          alpha = 0.25 + bounce * 0.75; // Glows brightly
        } else if (dot.dist < waveRadius) {
          // Area already swept by wave
          alpha = Math.max(0.08, 0.22 * (1 - progress * 0.7));
          radius = 1.4;
        }

        // Apply overall fade out toward the end of the transition
        if (progress > 0.7) {
          const fadeOut = (1 - progress) / 0.3;
          alpha *= fadeOut;
        }

        if (alpha <= 0.01) continue;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.5, radius), 0, Math.PI * 2);

        if (isWaveActive) {
          // Warm glowing accent dots in the wave crest
          ctx.fillStyle = isDark
            ? `rgba(249, 115, 22, ${alpha})`
            : `rgba(245, 158, 11, ${alpha})`;
          ctx.shadowColor = isDark ? "#f97316" : "#f59e0b";
          ctx.shadowBlur = radius > 3 ? 8 : 2;
        } else {
          // Ambient dot grid
          ctx.fillStyle = isDark
            ? `rgba(255, 255, 255, ${alpha * 0.6})`
            : `rgba(0, 0, 0, ${alpha * 0.5})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      if (progress < 1) {
        animId = requestAnimationFrame(render);
      } else {
        onComplete();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [originX, originY, isDark, onThemeSwitch, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99999]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
