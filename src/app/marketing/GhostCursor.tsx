import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useVelocity, useTransform, useReducedMotion } from "motion/react";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Replaces the cursor with the ghost mascot on the landing. It trails the
 * pointer on a spring; while moving it leans into the direction of travel,
 * stretches long-and-thin along that direction (like something cutting through
 * air), and its eyes lead the way — settling back to a fat, upright ghost when
 * still. Desktop + fine-pointer only, never under reduced motion.
 */
export function GhostCursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const posX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.6 });
  const posY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.6 });
  const velX = useVelocity(posX);
  const velY = useVelocity(posY);

  // Lean into horizontal travel; returns to 0 at rest.
  const lean = useTransform(() => clamp(velX.get() / 55, -22, 22));
  // Stretch ALONG the direction of motion, thin across it.
  const stretchX = useTransform(() => 1 + Math.min(Math.abs(velX.get()) / 2600, 0.5) - Math.min(Math.abs(velY.get()) / 4200, 0.22));
  const stretchY = useTransform(() => 1 + Math.min(Math.abs(velY.get()) / 2600, 0.5) - Math.min(Math.abs(velX.get()) / 4200, 0.22));
  // Eyes lead the direction of travel (only when actually moving).
  const eyeX = useTransform(() => {
    const vx = velX.get();
    const vy = velY.get();
    const m = Math.hypot(vx, vy) || 1;
    return (vx / m) * 2.6 * Math.min(1, m / 650);
  });
  const eyeY = useTransform(() => {
    const vx = velX.get();
    const vy = velY.get();
    const m = Math.hypot(vx, vy) || 1;
    return (vy / m) * 2.6 * Math.min(1, m / 650);
  });

  useEffect(() => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    const prev = document.body.style.cursor;
    document.body.style.cursor = "none";
    return () => {
      window.removeEventListener("mousemove", move);
      document.body.style.cursor = prev;
    };
  }, [reduce, x, y]);

  if (!enabled) return null;
  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[100]" style={{ x: posX, y: posY }} aria-hidden="true">
      <motion.svg
        width={36}
        height={36}
        viewBox="0 0 64 64"
        className="drop-shadow-[0_5px_14px_rgba(60,49,91,0.3)]"
        style={{ rotate: lean, scaleX: stretchX, scaleY: stretchY, translateX: "-50%", translateY: "-50%", transformOrigin: "50% 42%" }}
      >
        <path fill="#ab9ff2" d="M10 30a22 22 0 0 1 44 0v27q-5.5 5-11 0-5.5-5-11 0-5.5 5-11 0-5.5-5-11 0z" />
        <motion.ellipse cx={25} cy={28} rx={3.1} ry={4.3} fill="#3c315b" style={{ x: eyeX, y: eyeY }} />
        <motion.ellipse cx={39} cy={28} rx={3.1} ry={4.3} fill="#3c315b" style={{ x: eyeX, y: eyeY }} />
      </motion.svg>
    </motion.div>
  );
}
