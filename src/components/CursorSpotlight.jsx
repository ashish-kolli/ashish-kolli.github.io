/**
 * CursorSpotlight Component
 *
 * Bullet-journal dots that appear around the cursor and fade back out after it passes.
 * - Dots sit on a fixed page grid (every DOT_SPACING px), so they stay put while scrolling
 * - Brightest at the cursor, dimming steadily toward the rim of the spotlight
 * - Dots fade in quickly inside the spotlight and fade out slowly once it moves on,
 *   leaving a short trail; everywhere else the page stays clean
 * - When the cursor rests in one place, a ripple rings out from it every second,
 *   lighting the dots it passes over
 *
 * Performance:
 * - The canvas only covers the area where dots are currently visible, and is released when none are
 * - The animation loop runs only while dots are fading or a ripple is spreading, and stops
 *   when idle; ripples are scheduled with a timer, so a resting cursor costs one short
 *   animation per second
 *
 * Only rendered on devices with a real mouse (hover + fine pointer). Phones, tablets,
 * and reduced-motion users get nothing at all.
 */
import React, { useEffect, useRef, useState } from 'react';

const DOT_SPACING = 24;          // px - distance between dots
const DOT_RADIUS = 0.75;         // px - size of each dot
const DOT_OPACITY = 0.85;        // strength of a fully lit dot (0-1)
const DOT_RGB = '91, 33, 182';   // COLORS.accent.primary
const SPOTLIGHT_RADIUS = 40;     // px - dots within this distance of the cursor light up
const EDGE_STRENGTH = 0.15;      // brightness of the outermost dots relative to the center (0-1)
const FADE_IN_MS = 60;           // how quickly dots appear
const FADE_OUT_MS = 450;         // how slowly dots fade after the cursor moves on
const RESIZE_STEP = 128;         // px - canvas grows/shrinks in steps to avoid constant reallocation
const RIPPLE_INTERVAL_MS = 1000; // a resting cursor sends out a ripple this often
const RIPPLE_MS = 900;           // how long one ripple takes to spread out
const RIPPLE_START = SPOTLIGHT_RADIUS * 0.6; // px - ripple begins just inside the spotlight
const RIPPLE_END = 130;          // px - radius where the ripple has faded away
const RIPPLE_BAND = 16;          // px - half-width of the ring of dots a ripple lights
const RIPPLE_STRENGTH = 0.9;     // brightness of the ripple ring at its start (0-1)

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
    const dots = new Map(); // "col,row" -> { col, row, alpha, target, x, y, onScreen }
    const ripples = [];     // { x, y, start } - page coordinates and start time
    let frame = null;
    let lastTime = null;
    let rippleTimer = null;

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

    // Raise a dot's brightness target for this frame (never lowers one another effect set)
    const light = (col, row, strength) => {
      const key = `${col},${row}`;
      let dot = dots.get(key);
      if (!dot) {
        dot = { col, row, alpha: 0, target: 0 };
        dots.set(key, dot);
      }
      if (strength > dot.target) dot.target = strength;
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
        for (let col = Math.ceil((px - SPOTLIGHT_RADIUS) / DOT_SPACING); col * DOT_SPACING <= px + SPOTLIGHT_RADIUS; col++) {
          for (let row = Math.ceil((py - SPOTLIGHT_RADIUS) / DOT_SPACING); row * DOT_SPACING <= py + SPOTLIGHT_RADIUS; row++) {
            const distance = Math.hypot(col * DOT_SPACING - px, row * DOT_SPACING - py);
            if (distance >= SPOTLIGHT_RADIUS) continue;

            // Gradient: full brightness at the cursor, dimming evenly out to EDGE_STRENGTH at the rim
            light(col, row, 1 - (1 - EDGE_STRENGTH) * (distance / SPOTLIGHT_RADIUS));
          }
        }
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
        const ringStrength = RIPPLE_STRENGTH * (1 - progress);
        const reach = radius + RIPPLE_BAND;
        for (let col = Math.ceil((ripple.x - reach) / DOT_SPACING); col * DOT_SPACING <= ripple.x + reach; col++) {
          for (let row = Math.ceil((ripple.y - reach) / DOT_SPACING); row * DOT_SPACING <= ripple.y + reach; row++) {
            const offRing = Math.abs(Math.hypot(col * DOT_SPACING - ripple.x, row * DOT_SPACING - ripple.y) - radius);
            if (offRing < RIPPLE_BAND) light(col, row, ringStrength * (1 - offRing / RIPPLE_BAND));
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
        const duration = dot.target > dot.alpha ? FADE_IN_MS : FADE_OUT_MS;
        dot.alpha += (dot.target - dot.alpha) * (1 - Math.exp(-dt / duration));
        if (dot.target === 0 && dot.alpha < 0.01) {
          dots.delete(key);
          return;
        }
        if (Math.abs(dot.target - dot.alpha) > 0.005) animating = true;

        dot.x = Math.round(dot.col * DOT_SPACING - scrollX); // viewport position
        dot.y = Math.round(dot.row * DOT_SPACING - scrollY);
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
        const pad = Math.ceil(DOT_RADIUS) + 2;
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
          ctx.arc(dot.x - originX + 0.5, dot.y - originY + 0.5, DOT_RADIUS, 0, Math.PI * 2);
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

    const handleMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouseInside = true;
      restartRippleWait();
      wake();
    };
    const handleLeave = () => {
      mouseInside = false;
      restartRippleWait();
      wake();
    };
    const handleScroll = () => {
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
