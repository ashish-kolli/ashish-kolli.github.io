/**
 * CursorSpotlight Component
 *
 * Bullet-journal dots that appear around the cursor and fade back out after it passes.
 * - Dots sit on a fixed page grid (every DOT_SPACING px), so they stay put while scrolling
 * - Every dot's brightness (and size) depends only on its distance from the cursor: the
 *   nearest dots are fully lit and brightness falls off steeply and evenly outward
 * - Dots fade in quickly inside the spotlight and fade out slowly once it moves on,
 *   leaving a short trail; everywhere else the page stays clean
 * - When the cursor rests in one place it slowly bores into the page: finer grids fill in
 *   one after another, each twice as dense and confined to a smaller circle, so the
 *   center gets tighter and denser the longer it stays. A ripple also rings out every
 *   second. Moving again dissolves the fine grids back to the regular one
 *
 * Performance:
 * - The canvas only covers the area where dots are currently visible, and is released when none are
 * - The animation loop runs only while dots are fading or a ripple is spreading, and stops
 *   when idle; the fine grids and ripples are scheduled with timers, so a resting cursor
 *   costs one short animation per second
 *
 * Only rendered on devices with a real mouse (hover + fine pointer). Phones, tablets,
 * and reduced-motion users get nothing at all.
 */
import React, { useEffect, useRef, useState } from 'react';

const DOT_SPACING = 24;          // px - distance between dots
const DOT_RADIUS = 0.7;          // px - size of a dim dot
const DOT_RADIUS_BRIGHT = 1.15;  // px - size of a fully lit dot; dots grow as they brighten
const DOT_OPACITY = 1;           // strength of a fully lit dot (0-1)
const DOT_RGB = '249, 115, 22';  // orange, same as the Resume button's gradient
const SPOTLIGHT_RADIUS = 40;     // px - dots within this distance of the cursor light up
const EDGE_STRENGTH = 0.05;      // brightness of the outermost dots relative to the center (0-1)
const FALLOFF_POWER = 2;         // how steeply brightness drops toward the rim: higher = more contrast
const FADE_IN_MS = 60;           // how quickly dots appear
const FADE_OUT_MS = 450;         // how slowly dots fade after the cursor moves on
const RESIZE_STEP = 128;         // px - canvas grows/shrinks in steps to avoid constant reallocation
const RIPPLE_INTERVAL_MS = 1000; // a resting cursor sends out a ripple this often
const RIPPLE_MS = 900;           // how long one ripple takes to spread out
const RIPPLE_START = SPOTLIGHT_RADIUS * 0.9; // px - ripple leaves from the spotlight's edge, so its
                                 // brightest moment isn't hidden inside the lit spotlight
const RIPPLE_END = 130;          // px - radius where the ripple has faded away
const RIPPLE_BAND = 14;          // px - half-width of the ring of dots a ripple lights
const RIPPLE_STRENGTH = 1;       // brightness of the ripple ring as it leaves (0-1)
const RIPPLE_DECAY = 2.2;        // how fast the ring dims as it spreads: higher = brighter start
                                 // fading sooner, for more contrast between start and finish
const RIPPLE_FADE_IN_MS = 12;    // ring dots light almost instantly: the ring moves too fast for
                                 // a gradual fade-in to reach full brightness before it passes
const RIPPLE_FADE_OUT_MS = 180;  // dots behind the ring go dark quickly, keeping the ring crisp
// Finer grids a resting cursor reveals, in order. Each halves the spacing of the one before
// and covers a smaller circle, so the dots concentrate toward the center over time. They
// only add density: brightness always comes from the same radial falloff.
//   delay   - how long the cursor must rest before this level appears (ms)
//   spacing - distance between its dots (px)
//   radius  - how far from the cursor it reaches (px)
const SUBDIV_LEVELS = [
  { delay: 500,  spacing: DOT_SPACING / 2, radius: SPOTLIGHT_RADIUS },
  { delay: 2000, spacing: DOT_SPACING / 4, radius: SPOTLIGHT_RADIUS * 0.65 },
  { delay: 3000, spacing: DOT_SPACING / 8, radius: SPOTLIGHT_RADIUS * 0.35 },
];
const SUBDIV_FADE_IN_MS = 450;   // fine grids ease in more gently than the spotlight

const spotlightSupported = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CursorSpotlight = () => {
  const canvasRef = useRef(null);
  const [enabled] = useState(spotlightSupported);

  useEffect(() => {
    if (!enabled) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const mouse = { x: 0, y: 0 };
    let mouseInside = false;
    const dots = new Map(); // key -> { px, py, fadeIn, fadeOut, alpha, target, x, y, onScreen }
    const ripples = [];     // { x, y, start } - page coordinates and start time
    let frame = null;
    let lastTime = null;
    let rippleTimer = null;
    let subdivTimers = [];
    let lastMove = 0;       // when the cursor last moved or the page last scrolled

    // Canvas backing size, in CSS px
    let canvasW = 0;
    let canvasH = 0;
    let canvasDpr = 0;

    const sizeCanvas = (w, h) => {
      const dpr = window.devicePixelRatio || 1;
      const tooSmall = w > canvasW || h > canvasH;
      const tooBig = canvasW > RESIZE_STEP && (w < canvasW / 2 || h < canvasH / 2);
      if (!tooSmall && !tooBig && dpr === canvasDpr) return;
      canvasW = Math.ceil(w / RESIZE_STEP) * RESIZE_STEP;
      canvasH = Math.ceil(h / RESIZE_STEP) * RESIZE_STEP;
      canvasDpr = dpr;
      canvas.width = Math.round(canvasW * dpr);
      canvas.height = Math.round(canvasH * dpr);
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const releaseCanvas = () => {
      canvas.style.visibility = 'hidden';
      if (canvasW === 0) return;
      canvas.width = 0;
      canvas.height = 0;
      canvasW = 0;
      canvasH = 0;
    };

    // Raise a dot's brightness target for this frame (never lowers one another effect set).
    // px/py are the dot's fixed page position; fadeIn / fadeOut are how quickly it appears
    // and disappears, taken from whichever effect is lighting it most brightly.
    const light = (key, px, py, strength, fadeIn = FADE_IN_MS, fadeOut = FADE_OUT_MS) => {
      let dot = dots.get(key);
      if (!dot) {
        dot = { px, py, fadeIn, fadeOut, alpha: 0, target: 0 };
        dots.set(key, dot);
      }
      if (strength > dot.target) {
        dot.target = strength;
        dot.fadeIn = fadeIn;
        dot.fadeOut = fadeOut;
      }
    };
    const isEven = (n) => ((n % 2) + 2) % 2 === 0;
    // Brightness by distance from the cursor, the same for every dot on every grid: full
    // within `core`, then a steep, even drop to EDGE_STRENGTH at the rim. `core` is half the
    // diagonal of the finest grid showing, so the dots nearest the cursor are always the
    // fully lit ones - and as finer grids appear, the lit center tightens.
    const falloff = (distance, core) => {
      const t = Math.min(Math.max((distance - core) / (SPOTLIGHT_RADIUS - core), 0), 1);
      return EDGE_STRENGTH + (1 - EDGE_STRENGTH) * (1 - t) ** FALLOFF_POWER;
    };

    const draw = (time) => {
      frame = null;
      const dt = lastTime === null ? 16.7 : Math.min(time - lastTime, 100);
      lastTime = time;

      const { scrollX, scrollY, innerWidth, innerHeight } = window;

      // Every dot fades toward nothing unless the spotlight is on it this frame
      dots.forEach((dot) => { dot.target = 0; });

      if (mouseInside) {
        const px = mouse.x + scrollX; // cursor in page coordinates
        const py = mouse.y + scrollY;

        // Which finer grids are showing, and how tight the fully lit center is
        const rested = time - lastMove;
        const levels = SUBDIV_LEVELS.filter((level) => rested >= level.delay);
        const finest = levels.length > 0 ? levels[levels.length - 1].spacing : DOT_SPACING;
        const core = finest * Math.SQRT1_2;

        for (let col = Math.ceil((px - SPOTLIGHT_RADIUS) / DOT_SPACING); col * DOT_SPACING <= px + SPOTLIGHT_RADIUS; col++) {
          for (let row = Math.ceil((py - SPOTLIGHT_RADIUS) / DOT_SPACING); row * DOT_SPACING <= py + SPOTLIGHT_RADIUS; row++) {
            const distance = Math.hypot(col * DOT_SPACING - px, row * DOT_SPACING - py);
            if (distance >= SPOTLIGHT_RADIUS) continue;

            light(`${col},${row}`, col * DOT_SPACING, row * DOT_SPACING, falloff(distance, core));
          }
        }

        // Resting: fill in each finer grid that is due. Points that land on a coarser grid
        // are skipped, since those dots are already lit.
        levels.forEach((level, index) => {
          const { spacing, radius } = level;
          for (let col = Math.ceil((px - radius) / spacing); col * spacing <= px + radius; col++) {
            for (let row = Math.ceil((py - radius) / spacing); row * spacing <= py + radius; row++) {
              if (isEven(col) && isEven(row)) continue;
              const distance = Math.hypot(col * spacing - px, row * spacing - py);
              if (distance >= radius) continue;
              light(`f${index}:${col},${row}`, col * spacing, row * spacing, falloff(distance, core), SUBDIV_FADE_IN_MS);
            }
          }
        });
      }

      // Ripples: a ring that spreads outward and dims, lighting the dots it crosses
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        const progress = (time - ripple.start) / RIPPLE_MS;
        if (progress >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        if (progress < 0) continue;
        const eased = 1 - (1 - progress) * (1 - progress); // fast start, gentle finish
        const radius = RIPPLE_START + (RIPPLE_END - RIPPLE_START) * eased;
        // Bright as it leaves, dimming steeply as it spreads
        const ringStrength = RIPPLE_STRENGTH * (1 - progress) ** RIPPLE_DECAY;
        const reach = radius + RIPPLE_BAND;
        for (let col = Math.ceil((ripple.x - reach) / DOT_SPACING); col * DOT_SPACING <= ripple.x + reach; col++) {
          for (let row = Math.ceil((ripple.y - reach) / DOT_SPACING); row * DOT_SPACING <= ripple.y + reach; row++) {
            const offRing = Math.abs(Math.hypot(col * DOT_SPACING - ripple.x, row * DOT_SPACING - ripple.y) - radius);
            // Brightest on the ring's center line, easing off toward its edges
            if (offRing < RIPPLE_BAND) {
              light(`${col},${row}`, col * DOT_SPACING, row * DOT_SPACING,
                ringStrength * Math.cos((offRing / RIPPLE_BAND) * (Math.PI / 2)), RIPPLE_FADE_IN_MS, RIPPLE_FADE_OUT_MS);
            }
          }
        }
      }

      // Ease each dot toward its target: quick fade in, slow fade out
      let animating = false;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      dots.forEach((dot, key) => {
        const duration = dot.target > dot.alpha ? dot.fadeIn : dot.fadeOut;
        dot.alpha += (dot.target - dot.alpha) * (1 - Math.exp(-dt / duration));
        if (dot.target === 0 && dot.alpha < 0.01) {
          dots.delete(key);
          return;
        }
        if (Math.abs(dot.target - dot.alpha) > 0.005) animating = true;

        dot.x = Math.round(dot.px - scrollX); // viewport position
        dot.y = Math.round(dot.py - scrollY);
        dot.onScreen = dot.x > -8 && dot.y > -8 && dot.x < innerWidth + 8 && dot.y < innerHeight + 8;
        if (!dot.onScreen) return;
        minX = Math.min(minX, dot.x);
        minY = Math.min(minY, dot.y);
        maxX = Math.max(maxX, dot.x);
        maxY = Math.max(maxY, dot.y);
      });

      if (minX === Infinity) {
        if (dots.size === 0) releaseCanvas();
        else canvas.style.visibility = 'hidden';
      } else {
        // Size and place the canvas to just cover the visible dots
        const pad = Math.ceil(DOT_RADIUS_BRIGHT) + 2;
        const originX = minX - pad;
        const originY = minY - pad;
        sizeCanvas(maxX - minX + pad * 2 + 1, maxY - minY + pad * 2 + 1);
        canvas.style.transform = `translate3d(${originX}px, ${originY}px, 0)`;
        canvas.style.visibility = 'visible';

        ctx.clearRect(0, 0, canvasW, canvasH);
        ctx.fillStyle = `rgb(${DOT_RGB})`;
        dots.forEach((dot) => {
          if (!dot.onScreen) return;
          ctx.globalAlpha = DOT_OPACITY * dot.alpha;
          ctx.beginPath();
          const radius = DOT_RADIUS + (DOT_RADIUS_BRIGHT - DOT_RADIUS) * dot.alpha;
          ctx.arc(dot.x - originX + 0.5, dot.y - originY + 0.5, radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Keep animating only while dots are still fading or a ripple is spreading
      if (animating || ripples.length > 0) frame = requestAnimationFrame(draw);
      else lastTime = null;
    };

    const wake = () => {
      if (frame === null) frame = requestAnimationFrame(draw);
    };

    // A ripple goes out after the cursor has rested for RIPPLE_INTERVAL_MS, then every
    // RIPPLE_INTERVAL_MS while it stays put. Any movement or scrolling restarts the wait.
    const emitRipple = () => {
      rippleTimer = null;
      if (!mouseInside || document.hidden) return;
      ripples.push({ x: mouse.x + window.scrollX, y: mouse.y + window.scrollY, start: performance.now() });
      wake();
      rippleTimer = setTimeout(emitRipple, RIPPLE_INTERVAL_MS);
    };
    const restartRippleWait = () => {
      clearTimeout(rippleTimer);
      rippleTimer = mouseInside ? setTimeout(emitRipple, RIPPLE_INTERVAL_MS) : null;
    };

    // Movement resets the rest clock; each time the cursor has rested long enough for the
    // next level, wake the loop so it can fade in (the loop stays asleep in between).
    const restartRest = () => {
      lastMove = performance.now();
      subdivTimers.forEach(clearTimeout);
      subdivTimers = mouseInside ? SUBDIV_LEVELS.map((level) => setTimeout(wake, level.delay + 20)) : [];
    };

    const handleMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseInside = true;
      restartRest();
      restartRippleWait();
      wake();
    };
    const handleLeave = () => {
      mouseInside = false;
      restartRest();
      restartRippleWait();
      wake();
    };
    const handleScroll = () => {
      restartRest();
      restartRippleWait();
      if (dots.size > 0) wake();
    };
    const handleResize = () => {
      canvasDpr = 0; // re-check pixel ratio on next draw
      if (dots.size > 0) wake();
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    document.documentElement.addEventListener('mouseleave', handleLeave);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      clearTimeout(rippleTimer);
      subdivTimers.forEach(clearTimeout);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        // Between the page background (zIndex -2 / root) and content, so text and
        // elements draw above the dots. Relies on the root's `isolation: isolate`
        // in App.jsx and on sections not painting their own backgrounds.
        zIndex: -1,
        mixBlendMode: 'multiply',
        visibility: 'hidden',
        willChange: 'transform',
      }}
    />
  );
};

export default CursorSpotlight;
