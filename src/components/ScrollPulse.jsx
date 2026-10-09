/**
 * ScrollPulse Component
 *
 * Rings of dots spreading out from the scroll cue, drawn the same way the cursor
 * spotlight draws its ripples: a band sweeping across a fixed grid, brightest on
 * the ring's centre line and dimming as it widens.
 *
 * One ring leaves on every beat of the dot's own `pulse` animation, at the moment
 * it is brightest. The canvas clock starts with that animation, so the two stay in
 * step without reading the animation back.
 *
 * Idle when scrolled away, and off entirely for reduced motion.
 */
import React, { useEffect, useRef } from 'react';

const CYCLE_MS = 2000;        // matches the dot's `pulse` animation
const PULSE_RIPPLE_MS = 2400;       // longer than a cycle, so a ring is always in flight
                              // and consecutive rings briefly overlap
const RING_START = 6;         // px - leaves at the dot's own edge
const RING_END = 86;          // px - where it has faded out
const RING_BAND = 14;         // px - half-width of the lit band
const RING_DECAY = 2.2;       // higher = brighter start, sooner fade
const PULSE_DOT_SPACING = 24;       // px - same grid as the cursor spotlight
const PULSE_DOT_RADIUS = 0.7;       // px - a dim dot
const PULSE_DOT_RADIUS_BRIGHT = 1.15;
// Finer grids packed around the centre, each halving the spacing of the one before and
// reaching less far, with smaller dots to match. A ring is dense and fine as it leaves
// the dot and coarsens as it widens.
//   spacing - distance between this level's dots (px)
//   reach   - how far from the centre it extends (px)
//   scale   - dot size relative to the base grid
const PULSE_LEVELS = [
  { spacing: PULSE_DOT_SPACING / 2, reach: 46, scale: 0.72 },
  { spacing: PULSE_DOT_SPACING / 4, reach: 26, scale: 0.52 },
  { spacing: PULSE_DOT_SPACING / 8, reach: 13, scale: 0.38 },
];
const PULSE_FADE_IN_MS = 12;        // the ring moves too fast for a gradual fade in
const PULSE_FADE_OUT_MS = 180;      // dots behind it drop away quickly, keeping it crisp
const FIELD = (RING_END + RING_BAND) * 2; // px - canvas is square and centred on the dot

const ScrollPulse = ({ color = '124, 58, 237' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(FIELD * dpr);
    canvas.height = Math.round(FIELD * dpr);
    ctx.scale(dpr, dpr);

    const centre = FIELD / 2;
    // Grid anchored on the centre, so each ring crosses it symmetrically
    const coords = [];
    for (let x = centre % PULSE_DOT_SPACING; x <= FIELD; x += PULSE_DOT_SPACING) {
      for (let y = centre % PULSE_DOT_SPACING; y <= FIELD; y += PULSE_DOT_SPACING) {
        coords.push({ x, y, d: Math.hypot(x - centre, y - centre), scale: 1, alpha: 0 });
      }
    }
    // Then the finer levels, skipping any point a coarser grid already covers
    PULSE_LEVELS.forEach(({ spacing, reach, scale }) => {
      const steps = Math.ceil(reach / spacing);
      for (let i = -steps; i <= steps; i++) {
        for (let j = -steps; j <= steps; j++) {
          if (i % 2 === 0 && j % 2 === 0) continue;
          const d = Math.hypot(i * spacing, j * spacing);
          if (d > reach) continue;
          coords.push({ x: centre + i * spacing, y: centre + j * spacing, d, scale, alpha: 0 });
        }
      }
    });

    let start = null;
    let last = null;
    let frame = null;
    let running = true;

    const draw = (time) => {
      if (start === null) start = time;
      const dt = last === null ? 16.7 : Math.min(time - last, 100);
      last = time;

      // Two rings can overlap, so take the brightest claim on each dot
      const elapsed = time - start;
      const phases = [elapsed % CYCLE_MS, (elapsed % CYCLE_MS) + CYCLE_MS];

      coords.forEach((dot) => { dot.target = 0; });

      phases.forEach((age) => {
        const progress = age / PULSE_RIPPLE_MS;
        if (progress >= 1) return;
        const eased = 1 - (1 - progress) * (1 - progress);
        const radius = RING_START + (RING_END - RING_START) * eased;
        const strength = (1 - progress) ** RING_DECAY;
        coords.forEach((dot) => {
          const offRing = Math.abs(dot.d - radius);
          if (offRing >= RING_BAND) return;
          const lit = strength * Math.cos((offRing / RING_BAND) * (Math.PI / 2));
          if (lit > dot.target) dot.target = lit;
        });
      });

      ctx.clearRect(0, 0, FIELD, FIELD);
      ctx.fillStyle = `rgb(${color})`;
      coords.forEach((dot) => {
        const duration = dot.target > dot.alpha ? PULSE_FADE_IN_MS : PULSE_FADE_OUT_MS;
        dot.alpha += (dot.target - dot.alpha) * (1 - Math.exp(-dt / duration));
        if (dot.alpha < 0.004) { dot.alpha = 0; return; }
        ctx.globalAlpha = dot.alpha;
        ctx.beginPath();
        const radius = (PULSE_DOT_RADIUS + (PULSE_DOT_RADIUS_BRIGHT - PULSE_DOT_RADIUS) * dot.alpha) * dot.scale;
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (running) frame = requestAnimationFrame(draw);
    };

    // Only run while the cue is actually on screen
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && frame === null) {
        running = true;
        last = null;
        frame = requestAnimationFrame(draw);
      } else if (!entry.isIntersecting && frame !== null) {
        running = false;
        cancelAnimationFrame(frame);
        frame = null;
      }
    });
    observer.observe(canvas);

    return () => {
      running = false;
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: `${FIELD}px`,
        height: `${FIELD}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    />
  );
};

export default ScrollPulse;
