import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion, useSpring, useTransform } from "motion/react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/ui/Logo";
import { cn } from "@/lib/utils";
import { clerkEnabled } from "@/app/auth/clerkEnabled";
import { Reveal, BlurFade } from "./cinematic";
import { Ghost } from "./Ghost";
import { GhostCursor } from "./GhostCursor";

/* Phantom palette */
const C = {
  paper: "#fdfcfe",
  bone: "#f4f2f4",
  ash: "#e9e8ea",
  aubergine: "#3c315b",
  lav: "#e2dffe",
  peri: "#ab9ff2",
  obsidian: "#1c1c1c",
  fog: "#6f6a7d",
  faint: "#928c9e",
};

const EASE = "cubic-bezier(0.23,1,0.32,1)";
const navLinks = [
  { label: "The problem", href: "#problem" },
  { label: "What it is", href: "#what" },
  { label: "The method", href: "#method" },
  { label: "What you master", href: "#doctrine" },
];

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className="mb-4 flex items-center gap-2 text-[15px] font-normal tracking-[-0.02em]" style={{ color: light ? C.peri : C.aubergine }}>
      <span className="size-1.5 rounded-full" style={{ background: C.peri }} />
      {children}
    </p>
  );
}

export default function Landing() {
  const reduce = useReducedMotion();
  const page = (
    <>
      <GhostCursor />
      <ScrollProgress />
      <PillNav />
      <Hero />
      <Problem />
      <WhatItIs />
      <Showcase />
      <Method />
      <Doctrine />
      <Who />
      <FinalCta />
      <Footer />
    </>
  );
  return (
    <div
      className="min-h-screen overflow-x-clip tracking-[-0.011em] text-[#1c1c1c] antialiased"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif", background: C.paper }}
    >
      {reduce ? (
        page
      ) : (
        <ReactLenis root options={{ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1, anchors: { offset: -80 } }}>
          {page}
        </ReactLenis>
      )}
    </div>
  );
}

/* Thin periwinkle→aubergine rail that tracks scroll depth (spring-smoothed). */
function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 30, restDelta: 0.001 });
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left"
      style={{ scaleX, background: `linear-gradient(90deg, ${C.peri}, ${C.aubergine})` }}
    />
  );
}

function NavAuthButtons() {
  return (
    <>
      <Link to="/sign-in" className="hidden rounded-full px-4 py-2 text-[15px] font-normal text-[#3c315b]/80 transition-colors hover:bg-[#3c315b]/[0.05] hover:text-[#3c315b] sm:block">
        Sign in
      </Link>
      <Link
        to="/sign-up"
        style={{ background: C.lav, boxShadow: "0 0 4px 0 rgb(226,223,254)", transitionTimingFunction: EASE }}
        className="inline-flex h-10 items-center rounded-full px-5 text-[15px] font-normal text-[#3c315b] transition-transform duration-150 active:scale-[0.97]"
      >
        Request access
      </Link>
    </>
  );
}

function PillNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-5 lg:px-8">
        <Logo to="/" className="text-[#3c315b]" />
        <nav
          style={{ borderColor: C.ash, background: C.paper, transitionTimingFunction: EASE }}
          className={cn(
            "absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border p-1.5 transition-shadow duration-300 lg:flex",
            scrolled && "shadow-[0_8px_30px_-12px_rgba(60,49,91,0.18)]",
          )}
        >
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="rounded-full px-3.5 py-1.5 text-[14px] text-[#3c315b]/75 transition-colors hover:bg-[#3c315b]/[0.05] hover:text-[#3c315b]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {clerkEnabled ? (
            <>
              <SignedIn>
                <Link
                  to="/launch"
                  style={{ background: C.lav, boxShadow: "0 0 4px 0 rgb(226,223,254)", transitionTimingFunction: EASE }}
                  className="inline-flex h-10 items-center rounded-full px-5 text-[15px] font-normal text-[#3c315b] transition-transform duration-150 active:scale-[0.97]"
                >
                  Open app
                </Link>
              </SignedIn>
              <SignedOut>
                <NavAuthButtons />
              </SignedOut>
            </>
          ) : (
            <NavAuthButtons />
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const ghostY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
  const ghostScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.82]);
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.25]);
  return (
    <section ref={ref} className="relative mx-auto grid min-h-[92vh] max-w-[1120px] items-center gap-12 px-6 pt-28 lg:grid-cols-[1.12fr_0.88fr] lg:px-8">
      <div>
        <BlurFade
          as="h1"
          delay={0.05}
          ariaLabel="Become an exceptional product thinker."
          className="max-w-[15ch] font-display text-[clamp(2.6rem,6vw,4.6rem)] font-light leading-[1.06] tracking-[-0.03em]"
          style={{ color: C.aubergine }}
        >
          Become an excepti
          <Ghost interactive className="mx-[0.005em] inline-block h-[0.66em] w-[0.66em] align-[-0.07em]" eye={C.aubergine} fill={C.peri} />
          nal product thinker.
        </BlurFade>
        <BlurFade as="p" delay={0.24} className="mt-7 max-w-[54ch] text-[clamp(1.05rem,1.3vw,1.24rem)] leading-[1.7]" style={{ color: C.fog }}>
          Products rarely die of bad execution. They die of bad <em className="italic" style={{ color: C.aubergine }}>judgment</em> — the confident bet on the wrong thing. Praxos is the practice that builds the judgment behind every product decision you make.
        </BlurFade>
        <BlurFade delay={0.34} className="mt-9 flex flex-wrap items-center gap-3">
          <Link to="/sign-up" style={{ background: C.lav, boxShadow: "0 0 4px 0 rgb(226,223,254)", transitionTimingFunction: EASE }} className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium text-[#3c315b] transition-transform duration-150 active:scale-[0.97]">
            Request early access <ArrowUpRight className="size-4" />
          </Link>
          <a href="#method" className="inline-flex h-12 items-center gap-2 rounded-full border px-6 text-[15px] font-medium transition-transform duration-150 active:scale-[0.97]" style={{ borderColor: C.ash, color: C.aubergine }}>
            See the method
          </a>
        </BlurFade>
        <BlurFade as="p" delay={0.44} className="mt-7 text-[14px]" style={{ color: C.faint }}>
          For founders, founding teams, and the first people who own the call.
        </BlurFade>
      </div>
      <BlurFade delay={0.2} className="hidden items-center justify-center lg:flex">
        <motion.div style={{ y: ghostY, scale: ghostScale, opacity: ghostOpacity }} className="relative grid size-[min(320px,80%)] place-items-center">
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 38% 32%, rgba(171,159,242,0.4), transparent 68%)" }} />
          <Ghost interactive className="relative size-44 drop-shadow-[0_18px_50px_rgba(171,159,242,0.4)]" eye={C.aubergine} fill={C.peri} />
        </motion.div>
      </BlurFade>
    </section>
  );
}

const PROBLEMS = [
  { q: "The beautiful product nobody switches to.", a: "Better in the abstract, but not better than the alternative they already had, for the cost of switching." },
  { q: "The powerful tool that loses to the worse-but-easier one.", a: "You counted the value delivered, and forgot the cost of finding, learning, and trusting it." },
  { q: "The year-long build to a spec the market never wanted.", a: "Conviction stood in for evidence. The bet was placed before anything was learned." },
  { q: "The beloved product with no moat.", a: "Enormous value created, almost none captured, cloned into a commodity or taxed by the platform beneath it." },
];

function Problem() {
  return (
    <section id="problem" className="scroll-mt-24 border-t" style={{ borderColor: C.ash }}>
      <div className="mx-auto max-w-[1120px] px-6 py-24 lg:px-8">
        <Reveal className="max-w-[64ch]">
          <Eyebrow>The real bottleneck</Eyebrow>
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-light leading-[1.1] tracking-[-0.02em]" style={{ color: C.aubergine }}>
            You can build anything. The hard part is knowing what is worth building.
          </h2>
          <p className="mt-4 text-[1.1rem] leading-[1.6]" style={{ color: C.fog }}>
            Every founder has watched a version of these. Not one is an execution failure, each is a failure of judgment, made with full conviction.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.q} delay={(i % 2) * 0.07} className="rounded-[18px] border p-7" style={{ background: C.bone, borderColor: C.ash }}>
              <p className="font-display text-[1.3rem] font-normal leading-[1.25]" style={{ color: C.aubergine }}>
                {p.q}
              </p>
              <p className="mt-2.5 text-[15px] leading-[1.55]" style={{ color: C.fog }}>
                {p.a}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatItIs() {
  const course = ["Information to remember", "A certificate of completion", "Frameworks you forget by Monday", "No idea whether you understood"];
  const praxos = ["Judgment you can apply under pressure", "A credible read on where you actually stand", "A way of seeing you cannot unsee", "Practice until the thinking is automatic"];
  return (
    <section id="what" className="scroll-mt-24 border-t" style={{ borderColor: C.ash }}>
      <div className="mx-auto max-w-[1120px] px-6 py-24 lg:px-8">
        <Reveal className="max-w-[64ch]">
          <Eyebrow>What Praxos is</Eyebrow>
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-light leading-[1.1] tracking-[-0.02em]" style={{ color: C.aubergine }}>
            Not a course. A capability you keep.
          </h2>
          <p className="mt-4 text-[1.1rem] leading-[1.6]" style={{ color: C.fog }}>
            Courses hand you information and hope it sticks. Praxos does the opposite: it teaches the way great product minds reason, then questions you, scores how well you actually understood, and keeps going until that reasoning becomes instinct. The name is{" "}
            <em className="italic" style={{ color: C.aubergine }}>praxis</em>: knowledge turned into practised skill.
          </p>
        </Reveal>
        <Reveal className="mt-12 grid overflow-hidden rounded-[20px] border md:grid-cols-2" style={{ borderColor: C.ash }}>
          <div className="p-8" style={{ background: C.bone }}>
            <h4 className="mb-4 text-[13px] font-medium tracking-[-0.01em]" style={{ color: C.faint }}>
              A course gives you
            </h4>
            <ul>
              {course.map((t) => (
                <li key={t} className="border-b py-2.5 text-[1.02rem] last:border-b-0" style={{ color: C.fog, borderColor: "rgba(60,49,91,0.08)" }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8" style={{ background: C.aubergine }}>
            <h4 className="mb-4 text-[13px] font-medium tracking-[-0.01em]" style={{ color: "#a59fb8" }}>
              Praxos gives you
            </h4>
            <ul>
              {praxos.map((t) => (
                <li key={t} className="border-b py-2.5 text-[1.02rem] last:border-b-0" style={{ color: "#f0ecfa", borderColor: "rgba(255,255,255,0.1)" }}>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* Sticky product peek — real screenshots crossfade as captions scroll. */
const SHOWCASE = [
  { shot: "/mockups/learner-home.png", eyebrow: "The session", title: "A voice conversation, not a video you forget", body: "Praxos teaches a concept out loud, pitched to your level, then asks you to explain it back. It moves on only when the answer lands." },
  { shot: "/mockups/admin-overview.png", eyebrow: "The score", title: "A credible read on where everyone stands", body: "Understanding rolls up in real time. Not what was watched, but whether it can actually be applied, across cohorts and teams." },
  { shot: "/mockups/admin-people.png", eyebrow: "The follow-up", title: "See who is shallow, before it costs you", body: "Per-person depth on every topic, so a quiet gap is caught and reinforced before it turns into a confident wrong call." },
];

function Showcase() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.max(0, Math.min(SHOWCASE.length - 1, Math.floor(v * SHOWCASE.length)))));
  return (
    <section ref={ref} className="scroll-mt-24 border-t" style={{ background: C.paper, borderColor: C.ash }}>
      <div className="mx-auto grid max-w-[1260px] gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          {SHOWCASE.map((s, i) => (
            <div key={i} className="flex min-h-[64vh] flex-col justify-center py-12 lg:min-h-screen">
              <Eyebrow>{s.eyebrow}</Eyebrow>
              <h3 className="max-w-md font-display text-[clamp(1.7rem,3vw,2.4rem)] font-light leading-[1.1] tracking-[-0.02em]" style={{ color: C.aubergine }}>
                {s.title}
              </h3>
              <p className="mt-4 max-w-md text-[16px] leading-[1.55]" style={{ color: C.fog }}>
                {s.body}
              </p>
              <div className="mt-7 lg:hidden">
                <AppFrame src={s.shot} />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-0 flex h-screen items-center">
            <div className="relative w-full overflow-hidden rounded-[20px] border bg-white shadow-[0_30px_80px_-30px_rgba(60,49,91,0.3)]" style={{ borderColor: C.ash }}>
              <div className="flex items-center gap-1.5 border-b px-4 py-3" style={{ borderColor: "#ececf1" }}>
                {["#ff6058", "#ffbd2e", "#28c93f"].map((c) => (
                  <span key={c} className="size-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                ))}
              </div>
              <div className="relative aspect-[16/9]">
                {SHOWCASE.map((s, i) => (
                  <motion.div
                    key={s.shot}
                    aria-hidden="true"
                    initial={false}
                    animate={{ opacity: active === i ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute inset-0"
                    style={{ backgroundImage: `url(${s.shot})`, backgroundSize: "cover", backgroundPosition: "left top", backgroundRepeat: "no-repeat" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppFrame({ src }: { src: string }) {
  return (
    <div className="overflow-hidden rounded-[18px] border bg-white shadow-[0_24px_60px_-30px_rgba(60,49,91,0.3)]" style={{ borderColor: "#e9e8ea" }}>
      <div className="flex items-center gap-1.5 border-b px-4 py-3" style={{ borderColor: "#ececf1" }}>
        {["#ff6058", "#ffbd2e", "#28c93f"].map((c) => (
          <span key={c} className="size-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
        ))}
      </div>
      <img src={src} alt="" aria-hidden="true" className="w-full" loading="lazy" />
    </div>
  );
}

const STEPS = [
  { n: "01", h: "Teach", p: "Explains a concept progressively, in plain language, pitched to your level." },
  { n: "02", h: "Clarify", p: "Answers your doubts, and is explicit when something sits outside the material." },
  { n: "03", h: "Question", p: "Probes recall, then explanation, then application and judgment. Real understanding, not memory." },
  { n: "04", h: "Score", p: "Evaluates your answers and gives you a credible read on where you actually stand." },
  { n: "05", h: "Feedback", p: "Specific and developmental: your strengths, your shallow spots, what to work on next." },
  { n: "06", h: "Track", p: "Follows your progress across sessions and schedules reinforcement where it counts." },
];

function Method() {
  return (
    <section id="method" className="scroll-mt-24" style={{ background: C.aubergine }}>
      <div className="mx-auto max-w-[1120px] px-6 py-24 lg:px-8">
        <Reveal className="max-w-[64ch]">
          <Eyebrow light>How it works</Eyebrow>
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-light leading-[1.1] tracking-[-0.02em] text-white">
            A conversation that builds judgment, not a video you forget.
          </h2>
          <p className="mt-4 text-[1.1rem] leading-[1.6]" style={{ color: "#b8b2c8" }}>
            Each session is a guided, voice-based conversation. It adapts to where you are, pushes where you are shallow, and never lets a vague answer pass for understanding.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={(i % 3) * 0.06} className="rounded-[16px] border p-6" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.03)" }}>
              <div className="font-display text-[1.05rem] font-semibold" style={{ color: C.peri }}>
                {s.n}
              </div>
              <h3 className="mt-2 text-[1.12rem] font-semibold text-white">{s.h}</h3>
              <p className="mt-1.5 text-[15px] leading-[1.5]" style={{ color: "#aab0ba" }}>
                {s.p}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 max-w-[32ch] font-display text-[1.5rem] font-light leading-[1.4] text-white">
          The difference is the <b className="font-semibold" style={{ color: C.peri }}>score</b>. Praxos does not track what you watched, it knows whether you can actually apply it.
        </Reveal>
      </div>
    </section>
  );
}

const PRINCIPLES = [
  { t: "Value is relational", d: "Always for a specific someone, always measured against their best available alternative, never absolute." },
  { t: "Value is net", d: "What is delivered minus the cost of getting it: friction, effort, learning, trust. Often the cost side is the whole game." },
  { t: "Value is discovered", d: "You cannot specify your way to it. You bet, you instrument, you learn. Cheap evidence before expensive scale." },
  { t: "Value must be captured", d: "The gap between value created and value captured is the business, and capture is bounded by your moat." },
  { t: "Value decays", d: "Staying valuable is the job; becoming valuable was only the entry fee. Renewal is permanent work." },
];

function Doctrine() {
  return (
    <section id="doctrine" className="scroll-mt-24 border-t" style={{ borderColor: C.ash }}>
      <div className="mx-auto max-w-[1120px] px-6 py-24 lg:px-8">
        <Reveal className="max-w-[64ch]">
          <Eyebrow>What you will master</Eyebrow>
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-light leading-[1.1] tracking-[-0.02em]" style={{ color: C.aubergine }}>
            A complete theory of product value.
          </h2>
          <p className="mt-4 text-[1.1rem] leading-[1.6]" style={{ color: C.fog }}>
            Beneath Praxos is a rigorous doctrine: five principles of value, each naming a failure you have watched happen, read through four lenses that keep you honest.
          </p>
        </Reveal>
        <div className="mt-12 border-t" style={{ borderColor: C.ash }}>
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.t} delay={0.04} className="grid grid-cols-[auto_1fr] items-baseline gap-6 border-b py-6" style={{ borderColor: C.ash }}>
              <div className="min-w-[2.2ch] font-display text-[1.5rem] font-semibold" style={{ color: C.peri }}>
                {i + 1}
              </div>
              <div>
                <div className="font-display text-[1.35rem] font-normal" style={{ color: C.aubergine }}>
                  {p.t}
                </div>
                <div className="mt-1 text-[1rem] leading-[1.55]" style={{ color: C.fog }}>
                  {p.d}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 flex flex-wrap items-center gap-2.5">
          <span className="mr-1.5 text-[13px] font-medium tracking-[-0.01em]" style={{ color: C.faint }}>
            Read through four lenses
          </span>
          {["Kind & shape", "Perception", "Boundary", "Legitimacy"].map((c) => (
            <span key={c} className="rounded-full border bg-white px-4 py-1.5 text-[14px]" style={{ borderColor: C.ash, color: C.aubergine }}>
              {c}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

const WHO = [
  { h: "Founders", p: "You are betting time, money, and conviction. Sharpen the judgment behind the bet before you place it." },
  { h: "Founding teams", p: "Get everyone reasoning about value the same way, so debates resolve on logic, not seniority." },
  { h: "First product hires", p: "Own product decisions with the depth of someone who has done it ten times, from the start." },
];

function Who() {
  return (
    <section id="who" className="scroll-mt-24 border-t" style={{ borderColor: C.ash }}>
      <div className="mx-auto max-w-[1120px] px-6 py-24 lg:px-8">
        <Reveal>
          <Eyebrow>Who it is for</Eyebrow>
          <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-light tracking-[-0.02em]" style={{ color: C.aubergine }}>
            Built for the person who makes the call.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {WHO.map((w, i) => (
            <Reveal key={w.h} delay={(i % 3) * 0.06} className="rounded-[18px] border p-7" style={{ background: C.bone, borderColor: C.ash }}>
              <h3 className="font-display text-[1.3rem] font-normal" style={{ color: C.aubergine }}>
                {w.h}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.55]" style={{ color: C.fog }}>
                {w.p}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="start" className="scroll-mt-24" style={{ background: C.aubergine }}>
      <div className="mx-auto max-w-[1120px] px-6 py-28 text-center lg:px-8">
        <Reveal>
          <div aria-label="Praxos" className="flex items-center justify-center gap-1 font-display text-[clamp(2.2rem,7vw,4rem)] font-light tracking-[-0.02em] text-white">
            Prax
            <Ghost interactive className="inline-block h-[0.72em] w-[0.72em] align-[-0.06em]" eye={C.aubergine} fill={C.peri} />
            s
          </div>
          <p className="mt-2 font-display text-[clamp(1.4rem,4vw,2.2rem)] font-light italic" style={{ color: "#cabfe0" }}>
            become an exceptional product thinker.
          </p>
          <p className="mx-auto mt-6 max-w-md text-[16px] leading-[1.6]" style={{ color: "#b8b2c8" }}>
            Praxos is opening access to a first group of founders and founding teams. Request access and we will be in touch.
          </p>
          <div className="mt-9 flex justify-center">
            <Link to="/sign-up" className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-medium text-[#3c315b] transition-transform duration-150 active:scale-[0.97]" style={{ background: C.lav, boxShadow: "0 0 4px 0 rgb(226,223,254)", transitionTimingFunction: EASE }}>
              Request early access <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: C.paper, borderTop: `1px solid ${C.ash}` }}>
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6 py-10 lg:px-8">
        <Logo to="/" className="text-[#3c315b]" />
        <span className="text-[14px]" style={{ color: C.faint }}>
          Product thinking, practised to mastery.
        </span>
        <a href="#top" className="text-[14px] font-medium" style={{ color: C.aubergine, borderBottom: `1px solid ${C.peri}` }}>
          praxos.io
        </a>
      </div>
    </footer>
  );
}
