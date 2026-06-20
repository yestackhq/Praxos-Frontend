import { useEffect, useRef } from "react";

/**
 * A faint matrix of warm digits, brightest near a light source and falling off
 * into the dark — the "Beacon" code-field. Drawn once on mount so it renders
 * even when requestAnimationFrame is throttled; a slow shimmer flips a few
 * digits per second in a live browser. Honors reduced motion (static then).
 */
export function CodeMatrix({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cell = 22;
    let cols = 0;
    let rows = 0;
    let grid: number[] = [];
    let raf = 0;
    let frame = 0;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.font = '12px "Geist Mono", ui-monospace, monospace';
      ctx.textBaseline = "top";
      const lx = w * 0.62;
      const ly = h * 0.32;
      const reach = Math.max(w, h) * 0.85;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = x * cell;
          const py = y * cell;
          const dist = Math.hypot(px - lx, py - ly);
          const falloff = Math.max(0, 1 - dist / reach);
          if (falloff <= 0.04) continue;
          ctx.fillStyle = `rgba(216,180,131,${(falloff * falloff * 0.55).toFixed(3)})`;
          ctx.fillText(String(grid[y * cols + x]), px, py);
        }
      }
    };

    const resize = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 0;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 0;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cell) + 1;
      rows = Math.ceil(h / cell) + 1;
      grid = Array.from({ length: cols * rows }, () => Math.floor(Math.random() * 10));
      draw();
    };

    const tick = () => {
      frame++;
      if (frame % 28 === 0 && cols > 0) {
        for (let i = 0; i < 10; i++) grid[Math.floor(Math.random() * grid.length)] = Math.floor(Math.random() * 10);
        draw();
      }
      raf = requestAnimationFrame(tick);
    };

    // ResizeObserver fires after layout with correct dimensions (clientWidth can
    // be 0 during the initial effect), so it's more reliable than a one-shot read.
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();
    if (!reduce) raf = requestAnimationFrame(tick);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
