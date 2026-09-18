/**
 * FilmScreen Component
 *
 * A 35mm film frame in the home page hero that plays through the photo reel.
 * - Photos come from the reel folder, listed at build time in filename order - prefix names
 *   with 01-, 02-... to set the order. Originals go in assets/photos/reel/; the build
 *   (scripts/optimize-reel.py) publishes web-sized, metadata-free copies to reel-web/
 * - Every time the pointer moves onto the frame, the film advances to the next photo:
 *   the new frame slides up through the gate while the sprocket holes run with it
 * - On touch screens, where there is no hover, a tap advances instead
 * - Reduced-motion users get an instant swap
 */
import React, { useEffect, useState } from 'react';
import { COLORS, FONTS, EFFECTS } from '../design-tokens';

const FILM_ADVANCE_MS = 420;
const FILM_BASE = '#121214';       // film base, just off black
const FILM_EDGE_TEXT = '#E8A33D';  // amber, like the edge markings printed on real film
const FILM_HOLE = '#3A3A40';

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
      @keyframes filmAdvanceIn {
        0%   { transform: translateY(100%); filter: brightness(1.35); }
        70%  { filter: brightness(1.1); }
        100% { transform: translateY(0); filter: brightness(1); }
      }
      @keyframes filmSprocketRun {
        from { background-position-x: 0; }
        to   { background-position-x: -44px; }
      }
      .film-frame-in { animation: filmAdvanceIn ${FILM_ADVANCE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) both; }
      .film-sprockets-run { animation: filmSprocketRun ${FILM_ADVANCE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1); }
      @media (prefers-reduced-motion: reduce) {
        .film-frame-in, .film-sprockets-run { animation: none; }
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
    style={{
      height: '10px',
      margin: '0 10px',
      backgroundImage: `linear-gradient(90deg, ${FILM_HOLE} 0 14px, transparent 14px 22px)`,
      backgroundSize: '22px 10px',
      backgroundRepeat: 'repeat-x',
      borderRadius: '2px',
    }}
  />
);

const FilmScreen = ({ images = [] }) => {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState(null);
  const [advances, setAdvances] = useState(0); // remounts the incoming frame so it animates each time
  const [hoverCapable, setHoverCapable] = useState(true);

  useEffect(() => {
    injectFilmStyles();
    setHoverCapable(window.matchMedia('(hover: hover)').matches);
    // Warm the cache so each advance shows the next photo immediately
    images.forEach((src) => { const img = new Image(); img.src = src; });
  }, [images]);

  const advance = () => {
    if (images.length < 2) return;
    setPrevious(index);
    setIndex((i) => (i + 1) % images.length);
    setAdvances((n) => n + 1);
  };

  const count = images.length;
  const frameLabel = (n) => String(n + 1).padStart(2, '0');

  return (
    <figure
      onMouseEnter={hoverCapable ? advance : undefined}
      onClick={hoverCapable ? undefined : advance}
      aria-label={count > 1 ? `Photo reel, ${count} photos. Hover or tap to advance.` : 'Photo reel'}
      style={{
        margin: 0,
        width: '100%',
        padding: '10px 0',
        background: FILM_BASE,
        borderRadius: EFFECTS.radius.lg,
        boxShadow: EFFECTS.shadow.lg,
        cursor: count > 1 ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <Sprockets running={advances > 0} key={`top-${advances}`} />

      {/* Edge markings above the frame */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '6px 14px 5px',
          fontFamily: FONTS.mono,
          fontSize: '0.625rem',
          letterSpacing: '0.14em',
          color: FILM_EDGE_TEXT,
          opacity: 0.85,
        }}
      >
        <span>ASHISH KOLLI</span>
        <span>{count > 0 ? `${frameLabel(index)} ▸` : '00 ▸'}</span>
      </div>

      {/* The gate: current frame, with the next one sliding up over it */}
      <div
        style={{
          position: 'relative',
          margin: '0 14px',
          aspectRatio: '6 / 5',
          overflow: 'hidden',
          borderRadius: '3px',
          background: '#000',
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
            {previous !== null && (
              <img
                src={images[previous]}
                alt=""
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <img
              key={advances}
              className={advances > 0 ? 'film-frame-in' : undefined}
              src={images[index]}
              alt={altFromFilename(images[index])}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Soft vignette, like light falling off at the edges of a projected frame */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.35)',
              }}
            />
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
          fontSize: '0.625rem',
          letterSpacing: '0.14em',
          color: FILM_EDGE_TEXT,
          opacity: 0.85,
        }}
      >
        <span>{count > 1 ? (hoverCapable ? 'HOVER TO ADVANCE' : 'TAP TO ADVANCE') : 'PORTFOLIO'}</span>
        <span>{count > 0 ? `${frameLabel(index)} / ${frameLabel(count - 1)}` : '— / —'}</span>
      </div>

      <Sprockets running={advances > 0} key={`bottom-${advances}`} />
    </figure>
  );
};

export default FilmScreen;
