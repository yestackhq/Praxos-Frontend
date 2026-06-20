import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

// Strong ease-out (Emil Kowalski): more punch than the built-in curves.
const EASE = [0.23, 1, 0.32, 1] as const;

// Static map — accessing motion components by a variable key (motion[as]) breaks
// under the proxy in some bundles, so resolve to real components up front.
const TAGS = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
  li: motion.li,
} as const;

type Tag = keyof typeof TAGS;

/** Blur-fade-and-rise as the element scrolls into view (once). Honors reduced
 * motion (renders immediately). */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  as = "div",
  style,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: Tag;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const M = TAGS[as];
  return (
    <M
      className={className}
      style={style}
      aria-label={ariaLabel}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** Blur-fade-in on mount (above-the-fold / hero). Plays on load with an optional
 * stagger delay. Honors reduced motion. */
export function BlurFade({
  children,
  className,
  delay = 0,
  y = 14,
  as = "div",
  style,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: Tag;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const M = TAGS[as];
  return (
    <M
      className={className}
      style={style}
      aria-label={ariaLabel}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** A full-bleed background image that drifts (and optionally scales) as its
 * section scrolls past — the cinematic parallax. Opacity is never touched, so it
 * is always visible at rest. */
export function ParallaxImage({
  src,
  alt = "",
  className,
  travel = 140,
  scale = 1.18,
  overlay = "linear-gradient(180deg, rgba(9,9,11,0.35) 0%, rgba(9,9,11,0.15) 40%, rgba(9,9,11,0.85) 100%)",
}: {
  src: string;
  alt?: string;
  className?: string;
  travel?: number;
  scale?: number;
  overlay?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -travel, reduce ? 0 : travel]);
  const s = useTransform(scrollYProgress, [0, 1], [scale, 1]);

  return (
    <div ref={ref} className={cn("absolute inset-0 -z-10 overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y, scale: reduce ? 1 : s }}
        className="absolute inset-0 h-[120%] w-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: overlay }} />
    </div>
  );
}

/** Maps a section's own scroll progress to phrase reveals (used by the pinned
 * ribbon section). Returns the progress value for callers to derive transforms. */
export function useSectionProgress(ref: React.RefObject<HTMLElement>): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return scrollYProgress;
}
