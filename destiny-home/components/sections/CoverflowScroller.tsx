"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, motionValue, useTransform, type MotionValue } from "framer-motion";
import MediaBlock from "@/components/ui/MediaBlock";
import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";
import SectionHead from "@/components/ui/SectionHead";
import { CATEGORIES } from "@/lib/constants";

const N = CATEGORIES.length;
/** Three copies of the list. Nothing scrolls — the track is translated — so one copy
 *  either side of the centre covers the viewport at both ends of the loop. */
const COPIES = 3;
const TOTAL = N * COPIES;

/** Autoplay pacing: seconds to travel one card. */
const SECONDS_PER_CARD = 2.6;
/** Time to wind up to full speed after a resume, so it never jerks into motion. */
const RAMP_MS = 700;
/** Flick handling. */
const MAX_FLICK = 2400;
const MIN_FLICK = 120;
const FRICTION = 0.94;
const STOP_V = 24;
/** Exponential ease constant for arrow steps and click-to-centre. */
const EASE = 0.002;
/** A press longer than this is a hold (used to stop the deck), not a tap. */
const HOLD_MS = 300;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrap = (v: number, m: number) => ((v % m) + m) % m;

type Mode = "auto" | "stopped" | "drag" | "inertia" | "ease";
type Api = {
  step: (d: 1 | -1) => void;
  centre: (i: number) => void;
  park: () => void;
};

function Card({
  category,
  index,
  focus,
  tabbable,
  onActivate,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
  focus: MotionValue<number>;
  tabbable: boolean;
  onActivate: (index: number) => void;
}) {
  const scale = useTransform(focus, [0, 1], [0.8, 1]);
  const opacity = useTransform(focus, [0, 1], [0.45, 1]);
  const labelOpacity = useTransform(focus, [0.6, 1], [0, 1]);

  return (
    <motion.div
      data-cf-card
      data-idx={index}
      role="button"
      tabIndex={tabbable ? 0 : -1}
      aria-hidden={tabbable ? undefined : true}
      aria-label={`${category.label} — ${category.blurb}`}
      onClick={() => onActivate(index)}
      style={{ scale, opacity }}
      className="relative aspect-[3/4] w-[var(--cf-w)] shrink-0 cursor-pointer overflow-hidden rounded-[3px] outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
    >
      {/* MediaBlock is `relative` itself, so wrap it to fill the card. */}
      <div className="absolute inset-0">
        <MediaBlock
          src={category.image}
          alt={category.label}
          label={category.label}
          tone={category.tone}
          sizes="(min-width:768px) 280px, 60vw"
          className="h-full w-full"
        />
      </div>
      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,transparent_55%,rgba(11,11,12,.85)_100%)]" />
      <motion.div style={{ opacity: labelOpacity }} className="absolute bottom-3 left-4 z-20 pr-3">
        <p className="text-[13.5px] font-semibold">{category.label}</p>
        <p className="mt-0.5 text-[11px] text-mute">{category.blurb}</p>
      </motion.div>
    </motion.div>
  );
}

export default function CoverflowScroller() {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);

  // One focus value per rendered card, all written from a single rAF pass.
  const focuses = useMemo(() => Array.from({ length: TOTAL }, () => motionValue(0)), []);

  /**
   * Layout facts, re-measured on resize.
   *
   * A ref, deliberately: it is written by `measure` and read by the rAF loop, so it must not be
   * reactive. The ref is only ever unwrapped inside effects and handlers, never during render,
   * which also means it has no business in a dependency array — a ref's identity is stable.
   */
  const M = useRef({ cardW: 240, step: 256, boxW: 0, PERIOD: 1 });
  /** Closest card to the centre, refreshed every frame — lets clicks ask "is this
   *  the centred one?" without reaching into the loop from the outside. */
  const nearest = useRef({ index: 0, logical: 0, d: Infinity });
  /** Set while a gesture is actually dragging, so the click that ends a swipe
   *  doesn't also fire a navigation. */
  const moved = useRef(false);
  /** When the current press began — tells a tap apart from a hold. */
  const press = useRef(0);
  /** Whether the deck was already parked at the moment the current press began.
   *  Judged at pointerdown, not at click time — pointerup resumes the autoplay
   *  before the click lands, which would otherwise make every tap look "moving". */
  const downSettled = useRef(false);

  const measure = useCallback(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    if (!box || !track) return;
    const cards = track.querySelectorAll<HTMLElement>("[data-cf-card]");
    if (cards.length < 2) return;
    const cardW = cards[0].offsetWidth;
    if (!cardW) return;
    // Derive the real gap from the first two cards rather than trusting the token.
    const gap = cards[1].offsetLeft - cards[0].offsetLeft - cardW;
    const step = cardW + gap;
    // The row is one uniform flex line, so the pitch between two copies of the
    // same card is exactly N steps — there is no extra gap at a copy boundary.
    M.current.cardW = cardW;
    M.current.step = step;
    M.current.boxW = box.clientWidth;
    M.current.PERIOD = N * step;
  }, []);

  const onActivate = useCallback(
    (index: number) => {
      // A swipe ends in a click, and a hold ends in one too. Neither should open
      // a page — holding the deck is how you stop it.
      if (moved.current) return;
      if (performance.now() - press.current > HOLD_MS) return;
      const logical = ((index % N) + N) % N;
      // On a carousel that is always moving there is always exactly one nearest
      // card, so that is "the centred one" — tapping it opens the page, tapping
      // any other brings it round to the front first.
      if (nearest.current.index !== index) {
        api.current?.centre(logical);
        return;
      }
      // Tapping the centred card of a deck that is still turning shouldn't throw
      // you off the page — the first tap just parks it, the second opens it.
      if (downSettled.current) router.push(CATEGORIES[logical].href);
      else api.current?.park();
    },
    [router],
  );

  useEffect(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    if (!box || !track) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    measure();

    const st = {
      // p = 0 puts the first card of the middle copy dead centre.
      p: 0,
      v: 0,
      mode: (prefersReduced ? "stopped" : "auto") as Mode,
      targetP: null as number | null,
      wantAuto: !prefersReduced,
    };
    const drag = { active: false, moved: false, startX: 0, startP: 0, lastX: 0, lastT: 0, v: 0 };
    let shown = -1;
    let wasPlaying = st.wantAuto;

    const syncPlaying = (on: boolean) => {
      wasPlaying = on;
    };

    /** Where every transient motion comes to rest. */
    const settleTo = () => {
      st.mode = st.wantAuto ? "auto" : "stopped";
      syncPlaying(st.wantAuto);
    };

    /** Is the deck currently moving on its own? */
    const isRunning = () => wasPlaying;

    const hold = () => {
      if (drag.active) return;
      st.mode = "stopped";
      st.v = 0;
      st.targetP = null;
      syncPlaying(false);
    };


    const render = () => {
      const { cardW, step, boxW, PERIOD } = M.current;
      if (!PERIOD) return;
      // p runs unbounded; fold it into one period so the loop is a pure modulo.
      // Shifting by exactly one period is a no-op visually — that's the loop.
      const pr = wrap(st.p, PERIOD);
      track.style.transform = `translate3d(${((boxW - cardW) / 2 - PERIOD - pr).toFixed(2)}px,0,0)`;
      if (track.style.opacity !== "1") track.style.opacity = "1";

      // Track-local coordinate of the viewport's horizontal centre.
      const centre = cardW / 2 + PERIOD + pr;
      // Falloff radius. Half the viewport is right on desktop, but on a narrow
      // phone one card is wider than half the screen, which would leave the
      // neighbours with no gradient at all — so never let it drop below a step.
      const half = Math.max(boxW / 2, step * 1.2);
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < TOTAL; i++) {
        // Distance is measured from the card's CENTRE, not its leading edge.
        const d = Math.abs(i * step + cardW / 2 - centre);
        if (d < bestD) { bestD = d; best = i; }
        focuses[i].set(1 - Math.min(d / half, 1));
      }

      const n = ((best % N) + N) % N;
      // `render` scans every copy, so the centre index is recorded here rather
      // than recomputed elsewhere — two scans can disagree near a copy boundary.
      nearest.current = { index: best, logical: n, d: bestD };
      if (n !== shown) {
        shown = n;
      }
    };

    /** Which logical card is nearest the centre right now (0..N-1). */
    const logicalAt = () => nearest.current.logical;

    const stepTo = (d: 1 | -1) => {
      st.targetP = st.p + d * M.current.step;
      st.mode = "ease";
      st.v = 0;
      syncPlaying(false);
    };

    const centreOn = (logical: number) => {
      let delta = logical - logicalAt();
      while (delta > N / 2) delta -= N;
      while (delta < -N / 2) delta += N;
      st.targetP = st.p + delta * M.current.step;
      st.mode = "ease";
      st.v = 0;
      syncPlaying(false);
    };

    /** Stop where it is, without claiming the user wants it stopped for good. */
    const stopHere = () => {
      st.targetP = null;
      st.v = 0;
      st.mode = "stopped";
      syncPlaying(false);
    };

    api.current = { step: stepTo, centre: centreOn, park: stopHere };

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const autoV = M.current.step / SECONDS_PER_CARD;

      if (st.mode === "drag") {
        // p is written directly by the pointer handler.
      } else if (st.mode === "ease" && st.targetP !== null) {
        const k = 1 - Math.pow(EASE, dt * 1000);
        st.p += (st.targetP - st.p) * k;
        st.v = 0;
        if (Math.abs(st.targetP - st.p) < 0.4) {
          st.p = st.targetP;
          st.targetP = null;
          settleTo();
        }
      } else if (st.mode === "inertia") {
        st.p += st.v * dt;
        st.v *= Math.pow(FRICTION, dt * 60);
        if (Math.abs(st.v) < STOP_V) {
          st.v = 0;
          settleTo();
        }
      } else {
        // Constant-velocity rotation, ramping in or coasting to a halt.
        const want = st.mode === "auto" ? autoV : 0;
        const diff = want - st.v;
        const rate = st.mode === "auto" ? (autoV / (RAMP_MS / 1000)) * dt : dt * 5;
        st.v += Math.sign(diff) * Math.min(Math.abs(diff), rate);
        st.p += st.v * dt;
      }

      render();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // ---- pointer: holding freezes it, dragging / flicking carries momentum ----
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag.active = true;
      drag.moved = false;
      moved.current = false;
      drag.startX = e.clientX;
      drag.startP = st.p;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      drag.v = 0;
      st.mode = "drag";
      st.targetP = null;
      press.current = performance.now();
      downSettled.current = !isRunning();
      syncPlaying(false);
    };

    const onMove = (e: PointerEvent) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.startX;
      if (Math.abs(dx) > 4) { drag.moved = true; moved.current = true; }
      const dt = Math.max(e.timeStamp - drag.lastT, 1);
      drag.v = -((e.clientX - drag.lastX) / dt) * 1000;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      st.p = drag.startP - dx;
    };

    const onUp = () => {
      if (!drag.active) return;
      drag.active = false;
      if (Math.abs(drag.v) > MIN_FLICK) {
        st.v = clamp(drag.v, -MAX_FLICK, MAX_FLICK);
        st.mode = "inertia";
      } else {
        st.v = 0;
        settleTo();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); stepTo(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stepTo(-1); }
      else if (e.key === "Enter" || e.key === " ") {
        // Cards are focusable, so they owe the keyboard an activation.
        const el = (e.target as HTMLElement)?.closest<HTMLElement>("[data-cf-card]");
        if (!el || el.dataset.idx === undefined) return;
        e.preventDefault();
        press.current = performance.now();
        onActivate(Number(el.dataset.idx));
      }
    };

    const onResize = () => { measure(); render(); };
    const onVisibility = () => (document.hidden ? stop() : start());

    // Metrics must never be stale — a resize, a zoom or a late webfont can all
    // change the card width after mount, and the loop is built on it.
    const ro = new ResizeObserver(() => { measure(); render(); });
    ro.observe(track);

    box.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    box.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    start();

    return () => {
      stop();
      api.current = null;
      ro.disconnect();
      box.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      box.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, [focuses, measure, onActivate]);

  return (
    <section aria-labelledby="what-we-shoot" className="border-t border-line py-11 md:py-[70px]">
      <Container>
        <Reveal>
          <SectionHead id="what-we-shoot" title="One studio, every kind of story." />
        </Reveal>
      </Container>

      <div className="relative">
        <div
          ref={boxRef}
          className="relative touch-pan-y overflow-hidden py-2 [--cf-w:min(60vw,240px)] md:[--cf-w:280px]"
        >
          {/* Hidden until the first rAF applies the transform, otherwise the
              untransformed track flashes at translate(0) for one frame. */}
          <div ref={trackRef} style={{ opacity: 0 }} className="flex items-start gap-4 will-change-transform">
            {Array.from({ length: COPIES }, (_, copy) =>
              CATEGORIES.map((c, i) => (
                <Card
                  key={`${copy}-${c.id}`}
                  category={c}
                  index={copy * N + i}
                  focus={focuses[copy * N + i]}
                  tabbable={copy === 1}
                  onActivate={onActivate}
                />
              )),
            )}
          </div>
        </div>

        {/* Desktop arrows. Touch users swipe. */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => api.current?.step(-1)}
          className="absolute left-6 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/70 backdrop-blur transition-colors hover:border-gold md:flex"
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => api.current?.step(1)}
          className="absolute right-6 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/70 backdrop-blur transition-colors hover:border-gold md:flex"
        >
          →
        </button>
      </div>
    </section>
  );
}
