"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, motionValue, useTransform, type MotionValue } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import Container from "@/components/ui/Container";
import SectionHead from "@/components/ui/SectionHead";
import { CATEGORIES, type Category } from "@/lib/constants";

/** A category that is guaranteed to have a photograph to show. */
type StripCategory = Category & { image: string };

/** Only the categories Destiny has a real frame for. The archive is a catalogue;
 *  this is a photography wall, so an unshot category never turns in it. The predicate
 *  narrows `image` to string rather than casting for it, so the filter really is the
 *  proof and no card can render without a source. */
const STRIP = CATEGORIES.filter((c): c is StripCategory => c.featured === true && !!c.image);
const N = STRIP.length;
/** Three copies of the list. Nothing scrolls — the track is translated — so one copy
 *  either side of the centre covers the viewport at both ends of the loop. */
const COPIES = 3;
const TOTAL = N * COPIES;

/** Card width, kept in CSS so the layout owns it. `sizes` below has to agree. */
const SIZES = "(min-width:768px) 300px, 50vw";

/** Autoplay pacing: seconds to travel one card. */
const SECONDS_PER_CARD = 2.6;
/** Time to wind up to full speed after a resume, so it never jerks into motion. */
const RAMP_MS = 700;
/** Flick handling. */
const MAX_FLICK = 2400;
const MIN_FLICK = 120;
const FRICTION = 0.94;
const STOP_V = 24;
/**
 * Arrow steps and click-to-centre, as the share of the remaining gap closed in
 * `STEP_EASE_MS`. Held as a per-millisecond decay so the ease is identical at
 * 60Hz and 120Hz — anything stiffer than this and a step lands in a single
 * frame, which reads as a cut rather than a move.
 */
const STEP_EASE_MS = 400;
const EASE = Math.pow(0.1, 1 / STEP_EASE_MS);
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

/**
 * One category, full-bleed. The photograph is the card: it fills to the frame,
 * and the only thing laid over it is a scrim weighted to the bottom so the label
 * holds. Nothing is graded, and the whole deck keeps turning whether or not a
 * card is hovered.
 */
function Card({
  category,
  index,
  focus,
  tabbable,
  onActivate,
}: {
  category: StripCategory;
  index: number;
  focus: MotionValue<number>;
  tabbable: boolean;
  onActivate: (index: number) => void;
}) {
  const scale = useTransform(focus, [0, 1], [0.82, 1]);
  const opacity = useTransform(focus, [0, 1], [0.4, 1]);
  const labelOpacity = useTransform(focus, [0.72, 1], [0, 1]);

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
      className="group relative aspect-[3/4] w-[var(--cf-w)] shrink-0 cursor-pointer overflow-hidden rounded-[3px] bg-bg2 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
    >
      <Image
        src={category.image}
        /* The card's aria-label already names the category, so the photo is
           decoration as far as a screen reader is concerned. */
        alt=""
        fill
        sizes={SIZES}
        /* A moving strip can't lazy-load: cards slide in while you watch, and a
           frame arriving a beat after its card reads as a flicker. There are only
           six unique images across eighteen cards and `sizes` keeps each to a
           ~320w variant, so eager here costs ~50KB a side and never competes with
           the hero for bandwidth. */
        loading="eager"
        fetchPriority="low"
        draggable={false}
        className="object-cover transition-[transform,filter] duration-[900ms] ease-out motion-reduce:transition-none group-hover:scale-[1.045] group-hover:brightness-[1.08]"
      />

      {/* Legibility scrim, not a grade — clear through the middle so the
          photograph reads as itself, weighted only where the label sits.
          Lifts on hover so the frame brightens with the image. */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(11,11,12,.3)_0%,rgba(11,11,12,0)_24%,rgba(11,11,12,0)_46%,rgba(11,11,12,.6)_80%,rgba(11,11,12,.92)_100%)] transition-opacity duration-500 group-hover:opacity-70" />

      <motion.div style={{ opacity: labelOpacity }} className="absolute bottom-4 left-4 z-20 pr-4">
        <span aria-hidden className="block h-px w-5 bg-gold/70" />
        <p className="mt-2 text-[13px] font-semibold tracking-[0.01em] [text-shadow:0_1px_12px_rgba(11,11,12,.8)]">
          {category.label}
        </p>
        <p className="mt-1 text-[10.5px] leading-snug text-paper/70 [text-shadow:0_1px_10px_rgba(11,11,12,.8)]">
          {category.blurb}
        </p>
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
      if (downSettled.current) router.push(STRIP[logical].href);
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
    const drag = { active: false, startX: 0, startP: 0, lastX: 0, lastT: 0, v: 0 };
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
      // Only cards the viewport can reach need a focus value written; the rest are
      // parked far off-screen where nothing reads it. `pr` is folded into one
      // period first, so this window slides continuously and never jumps at the
      // wrap — and since it reaches a full falloff radius past each edge, a card
      // is always fresh before it comes into view, so nothing pops in.
      const lo = Math.max(0, Math.floor((centre - cardW - half) / step));
      const hi = Math.min(TOTAL - 1, Math.ceil((centre + cardW + half) / step));
      let best = lo;
      let bestD = Infinity;
      for (let i = lo; i <= hi; i++) {
        // Distance is measured from the card's CENTRE, not its leading edge.
        const d = Math.abs(i * step + cardW / 2 - centre);
        if (d < bestD) { bestD = d; best = i; }
        focuses[i].set(1 - Math.min(d / half, 1));
      }

      const n = ((best % N) + N) % N;
      // `render` scans every copy, so the centre index is recorded here rather
      // than recomputed elsewhere — two scans can disagree near a copy boundary.
      nearest.current = { index: best, logical: n, d: bestD };
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
      if (Math.abs(dx) > 4) { moved.current = true; }
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
          className="relative touch-pan-y overflow-hidden py-2 [--cf-w:min(50vw,200px)] md:[--cf-w:300px]"
        >
          {/* Hidden until the first rAF applies the transform, otherwise the
              untransformed track flashes at translate(0) for one frame. */}
          <div ref={trackRef} style={{ opacity: 0 }} className="flex items-start gap-3 will-change-transform md:gap-4">
            {Array.from({ length: COPIES }, (_, copy) =>
              STRIP.map((c, i) => (
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

          {/* Both ends dissolve into the page, so cards arrive and leave as if the
              strip goes on past the frame instead of stopping dead at it. Scaled to
              the viewport and capped, so a phone keeps most of its width for cards. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[13vw] max-w-32 bg-[linear-gradient(90deg,var(--color-bg)_0%,rgba(11,11,12,0)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[13vw] max-w-32 bg-[linear-gradient(270deg,var(--color-bg)_0%,rgba(11,11,12,0)_100%)]"
          />
        </div>

        {/* Desktop arrows. Touch users swipe. */}
        <button
          type="button"
          aria-label="Previous"
          onClick={() => api.current?.step(-1)}
          className="absolute left-6 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/60 text-paper/70 backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold md:flex"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => api.current?.step(1)}
          className="absolute right-6 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/60 text-paper/70 backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold md:flex"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
