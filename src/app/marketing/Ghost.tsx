import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * The Phantom ghost mascot. The one recurring illustration in the system,
 * rendered flat in Periwinkle and dropped inline to replace a vowel in display
 * headlines. When `interactive`, the pupils track the cursor, it bobs gently,
 * and it blinks now and then — alive without being noisy. Honors reduced motion.
 */
export function Ghost({
  className,
  eye = "#3c315b",
  fill = "#ab9ff2",
  interactive = false,
}: {
  className?: string;
  eye?: string;
  fill?: string;
  interactive?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 220, damping: 18, mass: 0.4 });
  const py = useSpring(rawY, { stiffness: 220, damping: 18, mass: 0.4 });

  useEffect(() => {
    if (!interactive || reduce) return;
    const MAX = 2.4; // pupil travel in viewBox units
    const onMove = (e: MouseEvent) => {
      const el = svgRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, d / 240); // ease in as the cursor nears
      rawX.set((dx / d) * MAX * reach);
      rawY.set((dy / d) * MAX * reach);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, reduce, rawX, rawY]);

  const float = interactive && !reduce ? { y: [0, -1.6, 0] } : undefined;

  return (
    <motion.svg
      ref={svgRef}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="ghost"
      animate={float}
      transition={float ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <path
        fill={fill}
        d="M10 30a22 22 0 0 1 44 0v27q-5.5 5-11 0-5.5-5-11 0-5.5 5-11 0-5.5-5-11 0z"
      />
      {[25, 39].map((cx) => (
        <motion.ellipse key={cx} cx={cx} cy={28} rx={3.1} ry={4.3} fill={eye} style={interactive ? { x: px, y: py } : undefined}>
          {interactive && !reduce && (
            <animate attributeName="ry" values="4.3;4.3;0.5;4.3;4.3" dur="5.2s" keyTimes="0;0.92;0.95;0.98;1" repeatCount="indefinite" />
          )}
        </motion.ellipse>
      ))}
    </motion.svg>
  );
}
