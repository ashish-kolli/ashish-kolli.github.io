/**
 * CursorSpotlight Component
 *
 * Reveals the bullet-journal dot grid (every 20px) in a small circle around the cursor,
 * fading toward the edge.
 *
 * Performance:
 * - Draws on a small canvas that follows the cursor, not a full-screen overlay
 * - Follows the cursor exactly (no easing); the loop only runs during the fade in/out
 * - Hidden entirely when not showing, so the browser skips blending it
 *
 * Only rendered on devices with a real mouse (hover + fine pointer). Phones, tablets,
 * and reduced-motion users get nothing at all.
 */
import React, { useEffect, useRef, useState } from 'react';

const GRID_RADIUS = 56;                   // px - area where dots are revealed
const DOT_SPACING = 20;                   // px - matches the header dot grid in Header.jsx
const DOT_OPACITY = 0.7;                  // strength of the dots (0-1)
const DOT_RADIUS = 1.75;                  // px - size of each dot
const DOT_RGB = '91, 33, 182';            // COLORS.accent.primary
const SPOTLIGHT_SIZE = GRID_RADIUS * 2 + 4; // px - canvas just big enough for the circle

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
    let dpr = 0;

    const setupCanvas = () => {
      const nextDpr = window.devicePixelRatio || 1;
      if (nextDpr === dpr) return;
      dpr = nextDpr;
      canvas.width = Math.round(SPOTLIGHT_SIZE * dpr);
      canvas.height = Math.round(SPOTLIGHT_SIZE * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const target = { x: 0, y: 0 };
    const spot = { x: 0, y: 0, alpha: 0 };
    let visible = false;
    let frame = null;

    const draw = () => {
      frame = null;

      // Sit exactly on the cursor; only the fade in/out animates
      const goal = visible ? 1 : 0;
      spot.x = target.x;
      spot.y = target.y;
      spot.alpha += (goal - spot.alpha) * 0.12;

      const settled = Math.abs(goal - spot.alpha) < 0.01;
      if (settled) spot.alpha = goal;

      if (spot.alpha <= 0.01) {
        canvas.style.visibility = 'hidden';
      } else {
        const left = Math.round(spot.x - SPOTLIGHT_SIZE / 2);
        const top = Math.round(spot.y - SPOTLIGHT_SIZE / 2);
        canvas.style.visibility = 'visible';
        canvas.style.transform = `translate3d(${left}px, ${top}px, 0)`;

        ctx.clearRect(0, 0, SPOTLIGHT_SIZE, SPOTLIGHT_SIZE);

        // One dot per grid point (every DOT_SPACING px) inside the radius, fading toward the edge.
        // Grid points use page coordinates, so the dots stay locked to the page while scrolling.
        const { scrollX, scrollY } = window;
        const fadeStart = GRID_RADIUS * 0.45;
        ctx.fillStyle = `rgb(${DOT_RGB})`;
        for (let col = Math.ceil((spot.x - GRID_RADIUS + scrollX) / DOT_SPACING); col * DOT_SPACING - scrollX <= spot.x + GRID_RADIUS; col++) {
          for (let row = Math.ceil((spot.y - GRID_RADIUS + scrollY) / DOT_SPACING); row * DOT_SPACING - scrollY <= spot.y + GRID_RADIUS; row++) {
            const pointX = Math.round(col * DOT_SPACING - scrollX);
            const pointY = Math.round(row * DOT_SPACING - scrollY);
            const distance = Math.hypot(pointX - spot.x, pointY - spot.y);
            if (distance >= GRID_RADIUS) continue;

            const fade = distance <= fadeStart ? 1 : 1 - (distance - fadeStart) / (GRID_RADIUS - fadeStart);
            ctx.globalAlpha = DOT_OPACITY * fade * spot.alpha;
            ctx.beginPath();
            ctx.arc(pointX - left + 0.5, pointY - top + 0.5, DOT_RADIUS, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      }

      // Keep animating only until the fade finishes; cursor moves wake a single redraw
      if (!settled) frame = requestAnimationFrame(draw);
    };

    const wake = () => {
      if (frame === null) frame = requestAnimationFrame(draw);
    };

    const handleMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      visible = true;
      wake();
    };
    const handleLeave = () => {
      visible = false;
      wake();
    };
    const handleScroll = () => {
      if (spot.alpha > 0) wake();
    };
    const handleResize = () => {
      setupCanvas();
      wake();
    };

    setupCanvas();
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    document.documentElement.addEventListener('mouseleave', handleLeave);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
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
        width: SPOTLIGHT_SIZE,
        height: SPOTLIGHT_SIZE,
        pointerEvents: 'none',
        // Between the page background (zIndex -2 / root) and content, so text and
        // elements draw above the lines. Relies on the root's `isolation: isolate`
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
