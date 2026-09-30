"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, motionValue, useReducedMotion, useTransform } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { REEL_SECTION, REELS } from "@/lib/constants";
import type { MotionValue } from "framer-motion";

const N = REELS.length;
/** Three copies of the list. Nothing scrolls — each reel is placed by transform — so one copy
 *  either side of the centre covers the window at both ends of the loop. */
const COPIES = 3;
const L = N * COPIES;
/** Position of the first reel that can be centred. The window is `N` wide from here, and a
 *  reel one place either side of the window is only ever seen as a neighbour, so the outer
 *  copies exist purely to keep the strip full during a drag. */
const FIRST = N;

/** Start fetching before the strip is needed, so the first seconds aren't dropped. */
const WARM_MARGIN = "400px 0px";
/** "Entering the section" = the reel wall is the dominant thing on screen. The strip is a
 *  fixed slice of viewport height, so it is always shorter than the viewport and reachable. */
const PLAY_AT = 0.3;

/** Exponential ease constant for the settle. Cinematic: quick out, long tail, no overshoot. */
const EASE = 0.002;
/** How far a flick is projected, in seconds, when picking the reel it lands on. */
const FLICK = 0.18;
/** A trackpad swipe steps one reel per this many ms — a long swipe shouldn't skip the reel. */
const WHEEL_COOLDOWN = 650;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** A phone's frame: the reels' own 9/16, so nothing is cropped. Set per breakpoint in CSS as
 *  --reel-ar; declared here so the JS default matches the design. */
const PORTRAIT = 1.7778;
/** A five-across frame. Full 9/16 at a third of a 16:9 viewport is taller than the screen, so
 *  the width target and the source ratio cannot both hold; cover-cropping the height keeps the
 *  width the design asks for without distorting the picture. */
const CINEMATIC = 1.25;

/**
 * The reel wall's geometry, read off the box so the design stays in CSS. `base` is the width of
 * the centre reel in px; every other size is a ratio of it, and `gap` is a ratio too, which is
 * what lets the outer reels tuck under the centre at a negative gap on a narrow screen.
 */
interface Geo {
  base: number;
  /** Size of the reel immediately beside the centre. */
  a: number;
  /** Size of the reel two places out. Mobile folds this to 0 — three reels, not five. */
  o: number;
  gap: number;
  /** How many cards either side of the centre exist at all: 2 on desktop, 1 on a phone. */
  win: number;
  /** Frame height as a multiple of the card's width. */
  ar: number;
}

/**
 * Slot centres, in units of the centre reel's width, built by walking the right-hand EDGES:
 * start at the centre reel's right edge, step across the gap, add the next reel's width, repeat.
 * Accumulating widths instead would stack every slot as if it were centre-sized, which drops the
 * outer reels underneath their neighbours instead of beside them.
 */
const offset1 = (g: Geo) => 0.5 + g.gap + g.a / 2;
const offset2 = (g: Geo) => 0.5 + g.gap * 2 + g.a + g.o / 2;
const offset3 = (g: Geo) => 0.5 + g.gap * 2 + g.a + g.gap + g.o + g.o / 2;

/** Smoothstep, so a reel eases into its slot instead of snapping as it crosses over. */
function ease(t: number) {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

/**
 * Size and offset are one continuous function of `f`, a reel's distance from the centre measured
 * in cards. At f = 0 it is the full-size centre reel, by f = 0.5 it has shrunk into the adjacent
 * slot, by f = 1.5 into the outer slot, and by f = 2.5 it is gone. Because the curve is
 * continuous rather than stepped, a reel grows and slides across in the same frame — which is
 * what sells the depth, and keeps the whole move on the compositor.
 *
 * Offsets are in units of the centre reel's width, mirrored for the left-hand side.
 */
function profile(f: number, g: Geo) {
  const d = Math.abs(f);
  const sgn = f < 0 ? -1 : 1;
  const e1 = offset1(g);
  const e2 = offset2(g);
  const e3 = offset3(g);
  const far = g.win >= 2;
  const past = far ? e3 + g.gap + g.o : e1 + g.gap + g.a;

  // [distance in cards, scale, centre-to-centre offset], easing between each pair.
  const points: readonly [number, number, number][] = far
    ? [[0, 1, 0], [0.5, g.a, e1], [1, g.a, e1], [1.5, g.o, e2], [2, g.o, e2], [2.5, 0, e3], [3, 0, past]]
    : [[0, 1, 0], [0.5, g.a, e1], [1, g.a, e1], [1.5, 0, past], [2, 0, past]];

  const out = (scale: number, off: number) => {
    // The card is laid out at full `base` size with its TOP-LEFT corner on the box centre, and
    // `scale` is about the box's own centre, so the rendered centre always sits at
    // boxCentre + base/2 (or + base*ASPECT/2 vertically) no matter the scale. Pull that back to
    // the middle, then push out to the slot. Measuring the pull in scaled pixels would leave
    // every reel off-centre by (base - base*scale)/2.
    const w = g.base * scale;
    return {
      scale,
      w,
      x: off * g.base * sgn - g.base / 2,
      y: (-(g.base * g.ar)) / 2,
      vis: scale > 0.01,
    };
  };
  if (d >= points[points.length - 1][0]) return out(0, past);
  for (let i = 1; i < points.length; i++) {
    const [d0, s0, o0] = points[i - 1];
    const [d1, s1, o1] = points[i];
    if (d <= d1) {
      const t = ease((d - d0) / (d1 - d0));
      return out(s0 + (s1 - s0) * t, o0 + (o1 - o0) * t);
    }
  }
  return out(0, past);
}

/** Rewinding before any data has arrived is a no-op in some engines and throws in others. */
function rewind(v: HTMLVideoElement) {
  try {
    v.currentTime = 0;
  } catch {
    /* not seekable yet */
  }
}

/** play() rejects rather than throws; every call site swallows it, so Safari's autoplay
 *  refusal can never surface as an unhandled promise rejection. */
function attempt(v: HTMLVideoElement, onBlocked?: () => void) {
  const p = v.play();
  if (!p) return;
  p.then(undefined, onBlocked ?? (() => {}));
}

/** Speaker glyphs, inline so the site keeps its zero-runtime-dependency footprint. */
function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {muted ? (
        <>
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a 5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}

function TransportIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {playing ? (
        <>
          <line x1="9.5" y1="6" x2="9.5" y2="18" />
          <line x1="14.5" y1="6" x2="14.5" y2="18" />
        </>
      ) : (
        <polygon points="8 5 19 12 8 19 8 5" />
      )}
    </svg>
  );
}

function ReelCard({
  reel,
  physical,
  pos,
  geo,
  isActive,
  isNeighbour,
  dimmed,
  warm,
  live,
  inView,
  onPlaying,
  onEnded,
  register,
}: {
  reel: (typeof REELS)[number];
  physical: number;
  /** The strip's continuous position, in cards. Every card derives its own place from this. */
  pos: MotionValue<number>;
  geo: Geo;
  isActive: boolean;
  isNeighbour: boolean;
  /** The padding copies repeat reels the middle copy already exposes, so they are hidden. */
  dimmed: boolean;
  /** The section is close enough to fetch from. */
  warm: boolean;
  /**
   * This card is the centre reel or one of its two visible neighbours. A media element fetches
   * its own file, so handing the same URL to all three copies of a reel downloads it three times
   * over — this window keeps exactly one element per reel holding a `src`, and every other copy
   * is a poster. Neighbours are blurred and dimmed, so a still frame there is indistinguishable
   * from a paused one, and the poster is frame 0, so the handover isn't.
   */
  live: boolean;
  inView: boolean;
  onPlaying: (playing: boolean) => void;
  onEnded: (physical: number) => void;
  register: (physical: number, el: HTMLVideoElement | null) => void;
}) {
  const reduce = useReducedMotion();

  // Every card reads the strip's one position value and derives its own place from it. The
  // geometry is a closure over props, so this has to be the card's own value rather than a
  // shared one — a hook cannot live inside a useMemo. useTransform seeds itself from the
  // current value, which matters: the strip renders at its resting position before the loop
  // ever runs, and a card that only subscribed to changes would sit at the centre until then.
  const f = useTransform(pos, (v) => v - physical);
  const x = useTransform(f, (v) => profile(v, geo).x);
  const y = useTransform(f, (v) => profile(v, geo).y);
  const scale = useTransform(f, (v) => profile(v, geo).scale);
  // The ramp has to stay open across the whole window — an outer reel that is present but
  // invisible reads as a hole, not as depth.
  const opacity = useTransform(f, (v) => {
    const d = Math.abs(v);
    if (reduce) return d <= geo.win ? 1 : 0;
    if (d < 0.35) return 1;
    if (d < 0.9) return 0.85;
    if (d < 1.35) return 0.7;
    if (d < geo.win) return 0.5;
    return d < geo.win + 0.6 ? 0.22 : 0;
  });
  const blur = useTransform(f, (v) => {
    const d = Math.abs(v);
    return reduce ? "blur(0px)" : d < 0.35 ? "blur(0px)" : d < 0.9 ? "blur(2px)" : "blur(3px)";
  });

  return (
    <motion.li
      data-reel-card
      aria-hidden={dimmed ? true : undefined}
      aria-current={isActive && !dimmed ? true : undefined}
      role="group"
      aria-roledescription="slide"
      aria-label={`${reel.title} of ${N}`}
      className="absolute left-1/2 top-1/2 w-[var(--reel-w)]"
      style={{ x, y, height: geo.base * geo.ar, scale, opacity, filter: blur }}
    >
      <video
        ref={(el) => register(physical, el)}
        // The `src` is attached only once the section is within reach. A poster is always
        // present, so an unsourced element is a still frame rather than a blank box — and a
        // reel nobody has scrolled to yet costs zero bytes.
        src={warm && live ? reel.src : undefined}
        // Decoding happens on one element at a time: the centre plays, its neighbours are
        // held at metadata, and the whole set is released again when the section is left.
        preload={inView ? (isActive ? "auto" : isNeighbour ? "metadata" : "none") : "none"}
        poster={reel.poster}
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full bg-[#0B0B0C] object-cover"
        onPlay={() => onPlaying(true)}
        onPause={() => onPlaying(false)}
        onEnded={() => onEnded(physical)}
      />
    </motion.li>
  );
}

/**
 * Film-reel carousel of the vertical cuts. The centre reel plays muted from the moment the wall
 * fills the screen, runs to its own end, and hands over to the next one — the videos set the
 * pace, there is no timer. Drag, flick, swipe or arrow keys move it; exactly one video ever
 * decodes; the loop is three copies placed by transform rather than scrolled. Five reels read at
 * once on a desktop (small · medium · LARGE · medium · small), three on a phone.
 */
export default function CinematicReelCarousel() {
  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const api = useRef<{ step: (d: 1 | -1) => void } | null>(null);
  const reduce = useReducedMotion();

  /** Which physical card is the centre right now — the one allowed to play. */
  const centreCard = useRef(-1);
  const inView = useRef(false);
  /** Intent, not state: "the viewer pressed pause" is different from "the browser refused". */
  const held = useRef(false);
  const sound = useRef(true);

  /** The centre card, mirrored into state so the cards can size themselves around it. */
  const [centre, setCentre] = useState(FIRST);
  const [geo, setGeo] = useState<Geo>({ base: 300, a: 0.63, o: 0.46, gap: 0.02, win: 2, ar: CINEMATIC });
  /** The loop reads geometry through a ref so a resize never rebuilds it — rebuilding tears
   *  down the observers and pauses every video, and the centred reel then never resumes. The
   *  cards still take `geo` as a prop, so they re-render and pick up the new ratios. */
  const geoRef = useRef(geo);
  const [visible, setVisible] = useState(false);
  const [inWindow, setInWindow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const active = centre % N;

  /** One value for the whole strip: the position every card reads to place itself. */
  const pos = useMemo(() => motionValue(FIRST), []);

  /** Start the centre reel unless the viewer said otherwise, or nobody is looking. */
  const run = useCallback((autoplay: boolean) => {
    const v = videos.current[centreCard.current] ?? null;
    if (!v || held.current || !inView.current || document.hidden) return;
    attempt(v, () => {
      // Sound can be blocked even though the viewer asked for it once. Go quiet and keep
      // going rather than leaving a dead reel on screen.
      if (autoplay && !v.muted) {
        v.muted = true;
        setMuted(true);
      }
    });
  }, []);

  /**
   * The `src` of a reel is attached by the render that follows a change of centre, and
   * play() on an element with no source yet is quietly dropped. Re-issuing it whenever the
   * centre moves, or when the section warms up or opens, means the reel starts whichever
   * way the render and the observers happen to interleave.
   */
  useEffect(() => {
    run(true);
  }, [run, centre, visible, inWindow]);

  /** Hand the centre over to whichever card just landed there. */
  const take = (physical: number) => {
    if (centreCard.current === physical) return;
    const was = videos.current[centreCard.current] ?? null;
    if (was) {
      was.pause();
      rewind(was);
    }
    centreCard.current = physical;
    setCentre(physical);

    const v = videos.current[physical];
    if (!v) return;
    rewind(v);
    v.muted = sound.current; // property, not attribute — the attribute alone won't unmute on iOS
    run(true);
  };

  useEffect(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    if (!box || !track) return;

    // The register callback writes slots into this array in place and never reassigns it, so
    // holding the array across the effect is safe — and the cleanup then pauses exactly the
    // elements this run saw, rather than whatever the ref holds when it tears down.
    const videoEls = videos.current;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Reused across measurements so re-reading never allocates a new geometry mid-gesture. */
    const M: Geo = { ...geoRef.current };
    const st = { pos: FIRST, target: null as number | null };
    const drag = { active: false, startX: 0, startPos: 0, lastX: 0, lastT: 0, v: 0 };
    let wheelAt = 0;
    let lastPos = NaN;
    let lastKey = "";
    let raf = 0;
    let last = 0;

    const num = (name: string, fallback: number) => {
      const v = parseFloat(getComputedStyle(box).getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };

    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>("[data-reel-card]");
      if (cards.length < 2) return;
      const base = cards[0].offsetWidth;
      if (!base) return;
      // The ratios are design, not measurement, so they live in CSS and are read back here. The
      // mobile gap is negative (neighbours tuck under the centre) and that is read as-is.
      M.base = base;
      M.a = num("--reel-a", M.a);
      M.o = num("--reel-o", M.o);
      M.gap = num("--reel-gap", M.gap);
      M.win = num("--reel-win", M.win);
      M.ar = num("--reel-ar", M.ar);
    };

    const render = () => {
      const { base } = M;
      if (!base) return;
      // The loop idles with no rAF at all, so this is the hot path: skip it when nothing moved.
      const key = `${st.pos}|${base}|${M.a}|${M.o}|${M.gap}|${M.win}`;
      if (key === lastKey) return;
      lastKey = key;

      const centre = st.pos;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < L; i++) {
        const d = Math.abs(i - centre);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      pos.set(centre);
      if (track.style.opacity !== "1") track.style.opacity = "1";
      take(best);
    };

    /**
     * Settle on a reel. Targets outside the window fold back into it, and the position moves by
     * the same period — the layout repeats every N cards, so that shift is invisible and the
     * eased distance stays one card instead of crossing the whole strip.
     */
    const goTo = (raw: number) => {
      let t = raw;
      let shift = 0;
      while (t < FIRST) {
        t += N;
        shift += N;
      }
      while (t >= FIRST + N) {
        t -= N;
        shift -= N;
      }
      st.pos += shift;
      st.target = t;
      start();
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (st.target !== null) {
        if (still) {
          st.pos = st.target;
          st.target = null;
        } else {
          st.pos += (st.target - st.pos) * (1 - Math.pow(EASE, dt * 1000));
          if (Math.abs(st.target - st.pos) < 0.0012) {
            st.pos = st.target;
            st.target = null;
          }
        }
      }
      render();
      // Nothing left to animate — park the loop until a gesture, a key or a video ends.
      if (st.target === null && !drag.active) {
        cancelAnimationFrame(raf);
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const from = () => (st.target === null ? Math.round(st.pos) : st.target);

    api.current = {
      step: (d) => goTo(from() + d),
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag.active = true;
      drag.startX = e.clientX;
      drag.startPos = st.pos;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      drag.v = 0;
      st.target = null;
      start();
    };

    const onMove = (e: PointerEvent) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.startX;
      const dt = Math.max(e.timeStamp - drag.lastT, 1);
      drag.v = -((e.clientX - drag.lastX) / dt) * 1000; // px per second
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      // Cards are placed in units of the centre reel's width, so that is the drag's unit too.
      // Clamped to the loop window plus the one card a flick may overshoot, so the strip can
      // never be dragged off the end of the copies.
      st.pos = clamp(drag.startPos - dx / M.base, FIRST - 1, FIRST + N - 1);
      start();
    };

    const onUp = () => {
      if (!drag.active) return;
      drag.active = false;
      const base = Math.round(drag.startPos);
      const landed = st.pos + (drag.v / M.base) * FLICK;
      // One reel per gesture. A hard flick should feel decisive, not skip the film.
      goTo(base + clamp(Math.round(landed - base), -1, 1));
    };

    /**
     * Only a clearly horizontal gesture is taken. A mouse wheel is almost pure deltaY, and a
     * trackpad's vertical scroll arrives here too — both belong to the page, so the section
     * never takes a vertical scroll away from anyone.
     */
    const onWheel = (e: WheelEvent) => {
      const ax = Math.abs(e.deltaX);
      if (ax < 12 || ax < Math.abs(e.deltaY) * 1.6) return;
      e.preventDefault();
      const now = performance.now();
      if (now < wheelAt) return;
      wheelAt = now + WHEEL_COOLDOWN;
      goTo(from() + (e.deltaX > 0 ? 1 : -1));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(from() + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(from() - 1);
      }
    };

    const onVisibility = () => {
      const v = videos.current[centreCard.current] ?? null;
      if (!v) return;
      if (document.hidden) v.pause();
      else run(true);
    };

    const onResize = () => {
      measure();
      render();
      // The visible-slot count is a breakpoint, so the cards need the new one.
      geoRef.current = { ...M };
      setGeo({ ...M });
    };

    // Pull the first reel down ahead of arrival. Everything else waits for the window.
    const warm = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setVisible(true);
        warm.disconnect();
      },
      { rootMargin: WARM_MARGIN }
    );

    // Play on arrival, pause on exit so we don't decode video nobody is watching.
    const gate = new IntersectionObserver(
      ([e]) => {
        const on = e.isIntersecting && e.intersectionRatio >= PLAY_AT;
        inView.current = on;
        setInWindow(on);
        const v = videos.current[centreCard.current] ?? null;
        if (!v) return;
        if (on) run(true);
        else v.pause();
      },
      { threshold: [0, 0.15, PLAY_AT, 0.6, 0.9] }
    );

    // Metrics must never be stale — a resize, a zoom or a late webfont can all change the
    // card width after mount, and the whole loop is built on it.
    const ro = new ResizeObserver(onResize);
    ro.observe(track);

    measure();
    render();
    geoRef.current = { ...M };
    setGeo({ ...M });
    warm.observe(box);
    gate.observe(box);
    // Everything is wired; the observers and the centred reel may have raced, so start it.
    run(true);

    box.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    box.addEventListener("wheel", onWheel, { passive: false });
    box.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      api.current = null;
      ro.disconnect();
      warm.disconnect();
      gate.disconnect();
      box.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      for (const v of videoEls) v?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, run]);

  /** The reel ran out: hand over to the next one. Its length is the only clock there is. */
  const onEnded = (physical: number) => {
    if (centreCard.current !== physical) return;
    setPlaying(false);
    api.current?.step(1);
  };

  const togglePlay = () => {
    const v = videos.current[centreCard.current] ?? null;
    if (!v) return;
    if (!v.paused && !v.ended) {
      held.current = true;
      v.pause();
    } else {
      held.current = false;
      // eslint-disable-next-line react-hooks/immutability -- imperative <video> control: `v` is a DOM node off a ref, not render state.
      v.muted = sound.current;
      attempt(v, () => {
        if (!v.muted) {
          v.muted = true;
          setMuted(true);
        }
      });
    }
  };

  const toggleMute = () => {
    const v = videos.current[centreCard.current] ?? null;
    if (!v) return;
    const next = !v.muted;
    // eslint-disable-next-line react-hooks/immutability -- as above: the DOM property, not the attribute, is the only thing that unmutes on iOS.
    v.muted = next; // property again — the attribute alone won't unmute on iOS
    sound.current = next;
    setMuted(next);
  };

  if (N < 2) return null;

  return (
    <section
      aria-labelledby="reels"
      className="border-t border-line pb-8 pt-9 md:pb-9 md:pt-12"
    >
      <Container>
        <Reveal>
          <SectionHead id="reels" title={REEL_SECTION.title} />
        </Reveal>
      </Container>

      {/*
        The wall is sized off viewport HEIGHT, not width: five 9:16 reels side by side can only
        fill a wide screen by becoming taller than the screen. Sizing by height and letting the
        total run a little past the viewport gives the intended crop — the outer reels running
        off both edges, the centre dominant — at any window shape.
        4/5 rather than 9/16: the full portrait would be 62vw tall at a 35vw width. Cropping to
        4/5 with object-cover keeps the framing, never distorts, and holds the section to ~80vh.
        The ratios are read back in JS, so this block is the only place the layout is defined.
      */}
      <div className="relative mt-5 [--reel-a:0.42] [--reel-gap:0.03] [--reel-o:0.42] [--reel-w:min(68vw,34vh)] [--reel-win:1] [--reel-ar:1.7778] md:mt-7 md:[--reel-a:0.63] md:[--reel-gap:0.02] md:[--reel-o:0.46] md:[--reel-w:min(34vw,58vh)] md:[--reel-win:2] md:[--reel-ar:1.25]">
        <div
          ref={boxRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Vertical reels"
          className="relative h-[calc(var(--reel-w)*var(--reel-ar))] touch-pan-y select-none overflow-hidden outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-gold"
        >
          {/* Hidden until the first render applies the transforms, otherwise the untransformed
              wall flashes for one frame. */}
          <div ref={trackRef} style={{ opacity: 0 }} className="absolute inset-0 will-change-transform">
            <ul className="absolute inset-0">
              {Array.from({ length: COPIES }, (_, copy) =>
                REELS.map((reel, i) => {
                  const physical = copy * N + i;
                  const off = Math.abs(physical - centre);
                  return (
                    <ReelCard
                      key={`${copy}-${reel.id}`}
                      reel={reel}
                      physical={physical}
                      pos={pos}
                      geo={geo}
                      isActive={off === 0}
                      isNeighbour={off === 1}
                      dimmed={copy !== 1}
                      warm={visible}
                      live={off <= 1}
                      inView={inWindow}
                      onPlaying={setPlaying}
                      onEnded={onEnded}
                      register={(p, el) => {
                        videos.current[p] = el;
                      }}
                    />
                  );
                }),
              )}
            </ul>
          </div>
        </div>

        {/* Desktop arrow navigation — matches the CoverflowScroller controls. */}
        <button
          type="button"
          aria-label="Previous reel"
          onClick={() => api.current?.step(-1)}
          className="absolute left-6 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/60 text-paper/70 backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:flex"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next reel"
          onClick={() => api.current?.step(1)}
          className="absolute right-6 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/60 text-paper/70 backdrop-blur-sm transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:flex"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>

        {/* Under the centre reel, out of the frame. */}
        <div className="mt-5 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause reel" : "Play reel"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-paper/70 transition-colors hover:border-gold hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <TransportIcon playing={playing} />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute reels" : "Mute reels"}
            aria-pressed={!muted}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-paper/70 transition-colors hover:border-gold hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <VolumeIcon muted={muted} />
          </button>
        </div>
      </div>
    </section>
  );
}
