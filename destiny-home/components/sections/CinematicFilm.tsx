"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import MediaBlock from "@/components/ui/MediaBlock";
import { FILM } from "@/lib/constants";

/** Start buffering before the frame is needed, so the first seconds aren't dropped. */
const WARM_MARGIN = "400px 0px";
/** "Entering the section" = the frame is the dominant thing on screen. */
const PLAY_AT = 0.5;

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

/** What the film block needs. Defaults to the Home page's signature film, so the
 *  Work page can point it at its own footage without a second implementation. */
export interface FilmSource {
  src?: string;
  src720?: string;
  poster?: string;
  /** 9:16 cut. Only used when `vertical` is set. */
  srcVertical?: string;
  posterVertical?: string;
  /** This film is a vertical reel shown at every size, so the frame stays 9:16 and is
   *  capped to a phone-ish width rather than becoming a 2500px tower on a desktop. */
  vertical?: boolean;
  title: string;
  caption: string;
}


/**
 * Full-bleed film block. Autoplays muted when the frame takes over the viewport,
 * pauses when it leaves, and hands control back to the viewer via a mute toggle.
 * One scroll-linked moment: the frame opens from inset/rounded to full-bleed as it arrives.
 */
export default function CinematicFilm({
  film = FILM,
  label = "Signature film",
  overlay,
  frame = "wide",
}: {
  film?: FilmSource;
  label?: string;
  /** `wide` is 16:9. `tall` is 4:3 on phones and 16:9 from `md` up, which gives the
   *  phone a less letterboxed frame. A 4:3 window on a 16:9 source crops 12.5% off each
   *  side, so it is a trade, not a free win. */
  frame?: "wide" | "tall";
  /** Rendered inside the frame, above the media. For pages that want the film's own
   *  title and copy sitting on the picture. It replaces the built-in poster caption,
   *  and the container is click-through so the play button still works underneath. */
  overlay?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  // `poster` is a plain attribute with no media query, so a vertical reel needs its own
  // poster chosen here rather than letting the browser guess.
  const poster = film.vertical ? film.posterVertical ?? film.poster : film.poster;
  const [started, setStarted] = useState(false); // video has taken over from the poster
  const [muted, setMuted] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const manual = useRef(false); // viewer took over, so stop yanking them back
  const everAuto = useRef(false); // first autoplay still has to be silent

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [18, 0]);

  const start = useCallback((forceSilent: boolean) => {
    const v = videoRef.current;
    if (!v) return;
    // Safari/iOS only allow programmatic play() while the element is muted, and only
    // honour the DOM property — setting the attribute alone still gets rejected.
    if (forceSilent && !everAuto.current && !v.muted) {
      v.muted = true;
      setMuted(true);
    }
    const attempt = v.play();
    if (!attempt) return;
    attempt
      .then(() => {
        everAuto.current = true;
        setStarted(true);
      })
      .catch(() => {
        // Low Power Mode, Brave's debouncing, or a data-saver can all refuse.
        // If it was autoplay, fall back to the poster + button; a real tap won't throw.
        if (forceSilent) manual.current = true;
      });
  }, []);

  useEffect(() => {
    const el = ref.current;
    const v = videoRef.current;
    if (!el || !v || !film.src) return;

    // Pull bytes down ahead of arrival, and only ever once.
    const warm = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        v.preload = "auto";
        if (v.networkState === 0 /* NETWORK_EMPTY */) v.load();
        warm.disconnect();
      },
      { rootMargin: WARM_MARGIN }
    );

    // Play on arrival, pause on exit so we don't decode video nobody is watching.
    const gate = new IntersectionObserver(
      ([e]) => {
        if (reduce) return;
        if (e.isIntersecting) start(true);
        else if (!manual.current) v.pause();
      },
      { threshold: PLAY_AT }
    );

    warm.observe(el);
    gate.observe(el);
    return () => {
      warm.disconnect();
      gate.disconnect();
    };
  }, [reduce, start, film.src]);

  const onManualPlay = () => {
    manual.current = true;
    start(false);
  };

  const toggleControls = () => {
    setControlsVisible((visible) => !visible);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next; // property again — the attribute alone won't unmute on iOS
    setMuted(next);
  };

  const showPoster = !started;
  const canPlay = Boolean(film.src);

  return (
    <section aria-label={label} className="border-t border-line py-8 md:py-14">
      <motion.div
        ref={ref}
        style={reduce ? undefined : { scale, borderRadius: radius }}
        className={
          film.vertical
            ? "relative mx-auto aspect-[9/16] w-full max-w-[420px] overflow-hidden bg-[#0B0B0C]"
            : frame === "tall"
              ? "relative aspect-[4/3] w-full overflow-hidden bg-[#0B0B0C] md:aspect-[16/9]"
              : "relative aspect-[16/9] w-full overflow-hidden bg-[#0B0B0C]"
        }
      >
        {/* Stays underneath: the poster, and the fallback if autoplay is ever refused.
            MediaBlock positions itself `relative`, so it gets a positioned wrapper
            rather than being handed `absolute` and colliding on the same property. */}
        <div className="absolute inset-0">
          <MediaBlock
            src={poster}
            alt={`${film.title} — film still`}
            label="CINEMATIC FILM — full reel, sound on"
            tone="plum"
            sizes="100vw"
            className="h-full w-full"
          />
        </div>

        {canPlay && (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
              started ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            poster={poster}
            playsInline
            muted
            controls={controlsVisible}
            preload="none"
            onClick={toggleControls}
            onEnded={() => {
              setStarted(false);
              setControlsVisible(false);
            }}
          >
            {/* Order matters: browsers take the first match. A vertical reel is one file
                for every size; a landscape film sends phones the lighter 720p cut and
                sends everything else the master. */}
            {film.vertical ? (
              <source src={film.srcVertical} type="video/mp4" />
            ) : (
              film.src720 && <source src={film.src720} type="video/mp4" media="(max-width: 900px)" />
            )}
            {/* Fallback: reached only if the source above is missing or fails. */}
            <source src={film.src} type="video/mp4" />
          </video>
        )}

        {showPoster && (
          <>
            <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,transparent_55%,rgba(11,11,12,.8)_100%)]" />
            <button
              type="button"
              disabled={!canPlay}
              onClick={onManualPlay}
              aria-label={`Play film: ${film.title}`}
              className="absolute inset-0 z-20 flex items-center justify-center disabled:cursor-default"
            >
              <motion.span
                whileHover={reduce ? undefined : { scale: 1.1 }}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-paper/50 text-[13px] backdrop-blur-[2px]"
              >
                ▶
              </motion.span>
            </button>
            {/* Suppressed when the caller overlays its own copy, which is the same text
                in the same corner and would sit on top of it. */}
            {!overlay && (
              <div className="absolute bottom-4 left-5 z-20 md:bottom-6 md:left-8">
                <p className="text-sm font-semibold">{film.title}</p>
                <p className="text-xs text-mute">{film.caption}</p>
              </div>
            )}
          </>
        )}

        {/* Above the poster scrim (z-10) and the play button (z-20). Click-through, so
            only the caller's own links take pointer events. */}
        {overlay && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">{overlay}</div>
        )}

        {/* Sits above the play overlay, top-right so it clears the scrub bar. */}
        {started && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? `Unmute ${film.title}` : `Mute ${film.title}`}
            aria-pressed={!muted}
            className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-paper/40 bg-black/45 text-paper backdrop-blur-[2px] transition-colors hover:bg-black/70 md:right-4 md:top-4"
          >
            <VolumeIcon muted={muted} />
          </button>
        )}
      </motion.div>
    </section>
  );
}
