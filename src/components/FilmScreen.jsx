/**
 * FilmScreen Component
 *
 * A white 35mm film strip in the home page hero that plays through the photo reel.
 * - Photos come from the reel folder, listed at build time in filename order - prefix names
 *   with 01-, 02-... to set the order. Originals go in assets/photos/reel/; the build
 *   (scripts/optimize-reel.py) publishes web-sized, metadata-free copies to reel-web/
 * - Every time the pointer moves onto the frame, the film advances to the next photo: the
 *   sprocket holes run right to left while the frame softly flashes to white, the photo
 *   swaps underneath at the brightest point, and the white fades back out onto the new one
 * - A click (or a tap on touch screens) advances too
 * - The transition waits until the next photo is downloaded and decoded, so the swap at
 *   the peak always has the new photo ready - on a slow first visit it could otherwise
 *   fade out onto a blank or unchanged frame
 * - The strip carries on to the left as blank film, fading out toward the page margin. Row by
 *   row, it is gone before it reaches the hero text beside it (the title, subtitle, and
 *   contact card each end at a different point): the Header measures them and passes them in
 *   as keepOuts. Its sprocket holes run with the rest of the strip; only the right-hand frame
 *   shows a photo
 * - Reduced-motion users get an instant swap, with no flash
 * - Fills its container's height, so in the hero it lines up with the top of the title and
 *   the bottom of the contact card; on phones (single column) the photo falls back to 16:9
 */
import React, { useEffect, useRef, useState } from 'react';
import { COLORS, FONTS, EFFECTS } from '../design-tokens';

const FILM_ADVANCE_MS = 420;      // sprocket run
const FILM_FLASH_MS = 640;        // the white flash: fade up, swap photos, fade back down
const FILM_FLASH_PEAK_AT = 0.45;  // point in the flash (0-1) where it's brightest and the photo swaps
const FILM_FLASH_PEAK = 0.9;      // opacity at the brightest point - nearly white, enough to hide the swap
const FILM_SWAP_MS = Math.round(FILM_FLASH_MS * FILM_FLASH_PEAK_AT);
const FILM_FLASH = '#FFFFFF';
const FILM_BASE = '#FFFFFF';       // white film
const FILM_EDGE_TEXT = '#B45309';  // amber, like the edge markings printed on real film, dark enough to read on white
const FILM_HOLE = '#CFCFD4';       // light grey holes against the white base
const FILM_HOLE_PITCH = 22;        // px - one sprocket hole plus the gap after it
// Opacity of the strip's leader, left to right: nothing at the page margin, full strength
// where it meets the photo frame. Eased (roughly quadratic) rather than linear, so it lingers
// faint across most of the width and only firms up near the frame
const FILM_LEADER_FADE = [[0, 0], [0.15, 0.03], [0.3, 0.09], [0.45, 0.19], [0.6, 0.33], [0.74, 0.52], [0.87, 0.75], [1, 1]];
const FILM_LEADER_MASK = `linear-gradient(to right, ${FILM_LEADER_FADE.map(([at, a]) => `rgba(0, 0, 0, ${a}) ${at * 100}%`).join(', ')})`;
// Cut-outs around the hero text: how far past the text's right edge the strip stays clear,
// how much above and below it, and how softly the cut-out's edges blend (px)
const KEEP_OUT_GAP = 28;
const KEEP_OUT_PAD = 6;
const KEEP_OUT_BLUR = 10;

// The leader's mask as an SVG image: the left-to-right fade, with a soft-edged cut-out for
// each piece of text (keepOuts: { right, top, bottom } in px from the leader's top-left)
const leaderMaskImage = (width, height, keepOuts) => {
  if (!width || !height) return FILM_LEADER_MASK;
  const stops = FILM_LEADER_FADE
    .map(([at, a]) => `<stop offset='${at}' stop-color='white' stop-opacity='${a}'/>`)
    .join('');
  const cutOuts = keepOuts
    .map(({ right, top, bottom }) =>
      `<rect x='-60' y='${top - KEEP_OUT_PAD}' width='${right + KEEP_OUT_GAP + 60}' height='${bottom - top + KEEP_OUT_PAD * 2}' fill='black'/>`)
    .join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>`
    + `<defs><linearGradient id='fade'>${stops}</linearGradient>`
    + `<filter id='soft' x='-50%' y='-50%' width='200%' height='200%'><feGaussianBlur stdDeviation='${KEEP_OUT_BLUR}'/></filter>`
    + `<mask id='clear' maskUnits='userSpaceOnUse' x='0' y='0' width='${width}' height='${height}'>`
    + `<rect width='${width}' height='${height}' fill='white'/><g filter='url(#soft)'>${cutOuts}</g></mask></defs>`
    + `<rect width='${width}' height='${height}' fill='url(#fade)' mask='url(#clear)'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};
const FILM_SPROCKET_ROW = {
  height: '10px',
  backgroundImage: `linear-gradient(90deg, ${FILM_HOLE} 0 14px, transparent 14px ${FILM_HOLE_PITCH}px)`,
  backgroundSize: `${FILM_HOLE_PITCH}px 10px`,
  backgroundRepeat: 'repeat-x',
};

// "01-cutting-steel.jpg" -> "Cutting steel"
const altFromFilename = (src) => {
  const name = src.split('/').pop().replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim();
  return name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Photo';
};

const injectFilmStyles = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      /* Flash: softly fades up to white over the old photo, swaps the photo at its brightest,
         fades back down over the new one */
      @keyframes filmFlash {
        0%   { opacity: 0; }
        ${FILM_FLASH_PEAK_AT * 100}% { opacity: ${FILM_FLASH_PEAK}; }
        100% { opacity: 0; }
      }
      /* Sprockets run one frame's width (--film-travel, a whole number of holes so the
         pattern lands where it started) */
      @keyframes filmSprocketRun {
        from { background-position-x: 0; }
        to   { background-position-x: calc(var(--film-travel, 44px) * -1); }
      }
      @keyframes filmLeaderRun {
        from { background-position-x: calc(100% - 1px); }
        to   { background-position-x: calc(100% - 1px - var(--film-travel, 44px)); }
      }
      .film-leader-run { animation: filmLeaderRun ${FILM_ADVANCE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1); }
      @media (max-width: 768px) {
        .film-leader { display: none; }
      }
      .film-flash { animation: filmFlash ${FILM_FLASH_MS}ms ease-in-out both; }
      .film-gate { flex: 1; min-height: 160px; }
      @media (max-width: 768px) {
        .film-gate { flex: none; aspect-ratio: 16 / 9; min-height: 0; }
      }
      .film-sprockets-run { animation: filmSprocketRun ${FILM_ADVANCE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1); }
      @media (prefers-reduced-motion: reduce) {
        .film-sprockets-run, .film-leader-run { animation: none; }
        .film-flash { display: none; }
      }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();

// A row of sprocket holes along one edge of the film
const Sprockets = ({ running }) => (
  <div
    className={running ? 'film-sprockets-run' : undefined}
    style={{ ...FILM_SPROCKET_ROW, margin: '0 10px 0 0' }}
  />
);

// Blank film running off to the left of the frame, from the frame's edge to the page margin.
// Its width spans the hero's text column: two frame-widths plus two 2rem grid gaps.
const FilmLeader = ({ running, advances, keepOuts }) => {
  const leaderRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const leader = leaderRef.current;
    if (!leader) return undefined;
    const observer = new ResizeObserver(() => {
      const { width, height } = leader.getBoundingClientRect();
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(leader);
    return () => observer.disconnect();
  }, []);

  const mask = leaderMaskImage(size.width, size.height, keepOuts);
  return (
  <div
    ref={leaderRef}
    className="film-leader"
    aria-hidden="true"
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      // Tucked 1px under the frame: edge to edge at a fractional pixel, the page background
      // shows through as a hairline seam
      right: 'calc(100% - 1px)',
      width: 'calc(200% + 4rem + 1px)',
      background: FILM_BASE,
      pointerEvents: 'none',
      WebkitMaskImage: mask,
      maskImage: mask,
      WebkitMaskSize: '100% 100%',
      maskSize: '100% 100%',
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
    }}
  >
    {['top', 'bottom'].map((edge) => (
      <div
        key={`${edge}-${advances}`}
        className={running ? 'film-leader-run' : undefined}
        style={{ ...FILM_SPROCKET_ROW, position: 'absolute', left: 0, right: 0, [edge]: '10px', backgroundPositionX: 'calc(100% - 1px)' }}
      />
    ))}
  </div>
  );
};

const FilmScreen = ({ images = [], keepOuts = [] }) => {
  const [index, setIndex] = useState(0);
  const [advances, setAdvances] = useState(0); // remounts the blink and filter so they replay each time
  const [hoverCapable, setHoverCapable] = useState(true);
  const gateRef = useRef(null);
  const [gateWidth, setGateWidth] = useState(0);

  useEffect(() => {
    const gate = gateRef.current;
    if (!gate) return undefined;
    const observer = new ResizeObserver(() => setGateWidth(gate.getBoundingClientRect().width));
    observer.observe(gate);
    return () => observer.disconnect();
  }, []);

  // How far the sprockets run per advance: the photo's width, rounded to whole holes
  const sprocketTravel = Math.max(1, Math.round(gateWidth / FILM_HOLE_PITCH)) * FILM_HOLE_PITCH;

  // Every photo loaded and decoded ahead of time, so a cut can show the next one instantly
  const preloaded = useRef([]);
  const indexRef = useRef(0);
  const waiting = useRef(false);
  const lastAdvance = useRef(0);

  useEffect(() => {
    injectFilmStyles();
    setHoverCapable(window.matchMedia('(hover: hover)').matches);
    preloaded.current = images.map((src) => {
      const img = new Image();
      img.src = src;
      img.decode?.().catch(() => {});
      return img;
    });
  }, [images]);

  const advance = () => {
    if (images.length < 2 || waiting.current) return;
    const next = (indexRef.current + 1) % images.length;
    const nextImage = preloaded.current[next];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = () => {
      lastAdvance.current = performance.now();
      setAdvances((n) => n + 1); // starts the wash and the sprocket run
      // Swap the photo at the wash's peak, while it's under the color
      setTimeout(() => {
        indexRef.current = next;
        setIndex(next);
        waiting.current = false;
      }, reducedMotion ? 0 : FILM_SWAP_MS);
    };
    // Busy from here until the swap, so hovering again mid-transition doesn't skip a photo.
    // If the next photo is still loading, hold the transition until it's ready (or has failed).
    // Capped at 1.5s, so a decode that never settles can't leave the reel stuck.
    waiting.current = true;
    const ready = nextImage?.decode ? nextImage.decode() : Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 1500));
    Promise.race([ready, timeout]).then(start, start);
  };

  // A click right after the hover that already advanced shouldn't skip a second photo
  const handleClick = () => {
    if (performance.now() - lastAdvance.current > 400) advance();
  };

  const count = images.length;

  return (
    <figure
      onMouseEnter={hoverCapable ? advance : undefined}
      onClick={handleClick}
      aria-label={count > 1 ? `Photo reel, ${count} photos. Hover, click, or tap to advance.` : 'Photo reel'}
      style={{
        position: 'relative',
        margin: 0,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 0',
        background: FILM_BASE,
        borderRadius: `0 ${EFFECTS.radius.lg} ${EFFECTS.radius.lg} 0`,
        cursor: count > 1 ? 'pointer' : 'default',
        userSelect: 'none',
        '--film-travel': `${sprocketTravel}px`,
      }}
    >
      <FilmLeader running={advances > 0} advances={advances} keepOuts={keepOuts} />
      <Sprockets running={advances > 0} key={`top-${advances}`} />

      {/* Edge markings above the frame */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '6px 14px 5px',
          fontFamily: FONTS.mono,
          fontSize: '0.375rem',
          letterSpacing: '0.14em',
          color: FILM_EDGE_TEXT,
          opacity: 0.85,
        }}
      >
        <span>RICOH GR IIIx</span>
        <span>{'<<'}</span>
      </div>

      {/* The gate: the photo cuts over instantly; the gradient flash plays on top */}
      <div
        ref={gateRef}
        className="film-gate"
        style={{
          position: 'relative',
          margin: '0 14px',
          overflow: 'hidden',
          borderRadius: '3px',
          background: COLORS.surface.inset,
        }}
      >
        {count === 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
              fontFamily: FONTS.mono,
              fontSize: '0.75rem',
              lineHeight: 1.6,
              color: COLORS.ink[400],
            }}
          >
            Add photos to assets/photos/reel/ and rebuild
          </div>
        ) : (
          <>
            <img
              src={images[index]}
              alt={altFromFilename(images[index])}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {advances > 0 && (
              <div
                key={`flash-${advances}`}
                className="film-flash"
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: FILM_FLASH }}
              />
            )}
          </>
        )}
      </div>

      {/* Edge markings below the frame */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '5px 14px 6px',
          fontFamily: FONTS.mono,
          fontSize: '0.375rem',
          letterSpacing: '0.14em',
          color: FILM_EDGE_TEXT,
          opacity: 0.85,
        }}
      >
        <span>ASPHERICAL LENS</span>
        <span>AK</span>
      </div>

      <Sprockets running={advances > 0} key={`bottom-${advances}`} />
    </figure>
  );
};

export default FilmScreen;
