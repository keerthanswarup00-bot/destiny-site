"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, motionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { REEL_SECTION, REELS } from "@/lib/constants";

const N = REELS.length;
/** Three copies of the list. Nothing scrolls — the track is translated — so one copy
 *  either side of the centre covers the window at both ends of the loop. */
const COPIES = 3;
const L = N * COPIES;
/** Position of the first reel that can be centred. The window is `N` wide from here, and
 *  a reel one place either side of the window is only ever seen as a neighbour, so the
 *  outer copies exist purely to keep the strip full during a drag. */
const FIRST = N;

/** Start fetching before the strip is needed, so the first seconds aren't dropped. */
const WARM_MARGIN = "400px 0px";
/** "Entering the section" = the reel strip is the dominant thing on screen. The strip is
 *  capped at 42vh of width, so it is always shorter than the viewport and this is reachable. */
const PLAY_AT = 0.3;

/** Exponential ease constant for the settle. Cinematic: quick out, long tail, no overshoot. */
const EASE = 0.002;
/** How far a flick is projected, in seconds, when picking the reel it lands on. */
const FLICK = 0.18;
/** A trackpad swipe steps one reel per this many ms — a long swipe shouldn't skip the reel. */
const WHEEL_COOLDOWN = 650;

/** Side-reel falloff, all keyed off distance from the centre in cards. One card out lands
 *  around scale .84 / opacity .61 / blur 2.6px; two cards out lands at zero, which is also
 *  where the outer copies have scrolled past the edge of the window. */
const FALLOFF = 1.75;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

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
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
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
  focus,
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
  focus: MotionValue<number>;
  isActive: boolean;
  isNeighbour: boolean;
  /** The padding copies repeat reels the middle copy already exposes, so they are hidden. */
  dimmed: boolean;
  /** The section is close enough to fetch from. */
  warm: boolean;
  /**
   * This card is the centre reel or one of its two visible neighbours. A media element
   * fetches its own file, so handing the same URL to all three copies of a reel downloads it
   * three times over — this window keeps exactly one element per reel holding a `src`, and
   * every other copy is a poster. Neighbours are blurred and dimmed, so a still frame there
   * is indistinguishable from a paused one, and the poster is frame 0, so the handover isn't.
   */
  live: boolean;
  inView: boolean;
  onPlaying: (playing: boolean) => void;
  onEnded: (physical: number) => void;
  register: (physical: number, el: HTMLVideoElement | null) => void;
}) {
  const reduce = useReducedMotion();

  // The style keys are the same either way — swapping a motion value for a plain number
  // mid-render leaves the old subscription writing, and the card ends up invisible. What
  // changes instead is the range: reduced motion flattens the scale, and drops the blur.
  const scale = useTransform(focus, [0, 0.5, 1], reduce ? [0.82, 0.85, 1] : [0.74, 0.85, 1]);
  const opacity = useTransform(focus, [0, 0.3, 1], reduce ? [0, 0.55, 1] : [0, 0.52, 1]);
  const blur = useTransform(
    focus,
    [0, 0.5, 1],
    reduce ? ["blur(0px)", "blur(0px)", "blur(0px)"] : ["blur(3px)", "blur(2.5px)", "blur(0px)"]
  );

  return (
    <motion.li
      data-reel-card
      aria-hidden={dimmed ? true : undefined}
      aria-current={isActive && !dimmed ? true : undefined}
      role="group"
      aria-roledescription="slide"
      aria-label={`${reel.title} of ${N}`}
      className="relative aspect-[9/16] w-[var(--reel-w)] shrink-0"
      style={{ scale, opacity, filter: blur, marginRight: "var(--reel-gap)" }}
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
 * Film-reel carousel of the vertical cuts. The centre reel plays muted from the moment the
 * strip fills the screen, runs to its own end, and hands over to the next one — the videos
 * set the pace, there is no timer. Drag, flick, swipe or arrow keys move it; exactly one
 * video ever decodes; the loop is three copies translated rather than scrolled.
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
  const [visible, setVisible] = useState(false);
  const [inWindow, setInWindow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const active = centre % N;

  const focuses = useMemo(() => Array.from({ length: L }, () => motionValue(0)), []);

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

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const M = { cardW: 240, pitch: 260, boxW: 0 };
    const st = { pos: FIRST, target: null as number | null };
    const drag = { active: false, startX: 0, startPos: 0, lastX: 0, lastT: 0, v: 0 };
    let wheelAt = 0;
    let lastPos = NaN;
    let lastBoxW = -1;
    let lastPitch = -1;
    let raf = 0;
    let last = 0;

    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>("[data-reel-card]");
      if (cards.length < 2) return;
      const cardW = cards[0].offsetWidth;
      if (!cardW) return;
      // Read the real pitch off the first two cards. The mobile gap is negative (neighbours
      // tuck in), and this reads that back as a negative number rather than clamping to 0.
      const gap = cards[1].offsetLeft - cards[0].offsetLeft - cardW;
      M.cardW = cardW;
      M.pitch = cardW + gap;
      M.boxW = box.clientWidth;
    };

    const render = () => {
      const { cardW, pitch, boxW } = M;
      if (!cardW || !pitch || !boxW) return;
      // The loop idles with no rAF at all, so this is the hot path: skip it when nothing moved.
      if (st.pos === lastPos && boxW === lastBoxW && pitch === lastPitch) return;
      lastPos = st.pos;
      lastBoxW = boxW;
      lastPitch = pitch;

      const x = boxW / 2 - cardW / 2 - st.pos * pitch;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      if (track.style.opacity !== "1") track.style.opacity = "1";

      const centre = st.pos * pitch + cardW / 2;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < L; i++) {
        // Distance is measured from the card's CENTRE, not its leading edge.
        const d = Math.abs(i * pitch + cardW / 2 - centre);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
        focuses[i].set(1 - Math.min(d / (pitch * FALLOFF), 1));
      }
      take(best);
    };

    /**
     * Settle on a reel. Targets outside the window fold back into it, and `pos` moves by the
     * same period — the layout repeats every N cards, so that shift is invisible and the
     * eased distance stays one card instead of crossing the whole track.
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
      // Clamped to the loop window plus the one card a flick is allowed to overshoot, so the
      // strip can never be dragged off the end of the copies.
      st.pos = clamp(drag.startPos - dx / M.pitch, FIRST - 1, FIRST + N - 1);
      start();
    };

    const onUp = () => {
      if (!drag.active) return;
      drag.active = false;
      const base = Math.round(drag.startPos);
      const landed = st.pos + (drag.v / M.pitch) * FLICK;
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
    warm.observe(box);
    gate.observe(box);

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
      for (const v of videos.current) v?.pause();
    };
  }, [focuses]);

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
    v.muted = next; // property again — the attribute alone won't unmute on iOS
    sound.current = next;
    setMuted(next);
  };

  if (N < 2) return null;

  return (
    <section
      aria-labelledby="reels"
      className="border-t border-line pb-11 pt-14 md:pb-[70px] md:pt-[92px]"
    >
      <Container>
        <Reveal>
          <SectionHead id="reels" title={REEL_SECTION.title} />
        </Reveal>
      </Container>

      <div className="[--reel-gap:-5vw] [--reel-w:min(76vw,300px,42vh)] md:[--reel-gap:clamp(64px,7vw,130px)] md:[--reel-w:min(30vw,340px,42vh)]">
        <div
          ref={boxRef}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Vertical reels"
          className="relative touch-pan-y select-none overflow-hidden py-1 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-gold"
        >
          {/* Hidden until the first render applies the transform, otherwise the untransformed
              track flashes at translate(0) for one frame. */}
          <div ref={trackRef} style={{ opacity: 0 }} className="will-change-transform">
            <ul className="flex items-start">
              {Array.from({ length: COPIES }, (_, copy) =>
                REELS.map((reel, i) => {
                  const physical = copy * N + i;
                  const off = Math.abs(physical - centre);
                  return (
                    <ReelCard
                      key={`${copy}-${reel.id}`}
                      reel={reel}
                      physical={physical}
                      focus={focuses[physical]}
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

        {/* Under the centre reel, out of the frame. */}
        <div className="mt-6 flex items-center justify-center gap-2.5">
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
