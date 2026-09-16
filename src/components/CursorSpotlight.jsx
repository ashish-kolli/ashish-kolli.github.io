/**
 * CursorSpotlight Component
 *
 * Reveals the 60px page grid in a small circle around the cursor, fading toward the edge.
 *
 * Performance:
 * - Draws on a small canvas that follows the cursor, not a full-screen overlay
 * - The animation loop only runs while the spotlight is moving or fading, and stops when idle
 * - Hidden entirely when not showing, so the browser skips blending it
 *
 * Only rendered on devices with a real mouse (hover + fine pointer). Phones, tablets,
 * and reduced-motion users get nothing at all.
 */
import React, { useEffect, useRef, useState } from 'react';

const GRID_RADIUS = 56;                   // px - area where grid lines are revealed
const GRID_SIZE = 60;                     // px - matches the header grid in Header.jsx
const LINE_OPACITY = 0.55;                // strength of the revealed lines (0-1)
const EASE = 0.14;                        // how quickly the spotlight catches up (0-1)
const LINE_RGB = '91, 33, 182';           // COLORS.accent.primary
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
    let started = false;
    let frame = null;

    const draw = () => {
      frame = null;

      const goal = visible ? 1 : 0;
      spot.x += (target.x - spot.x) * EASE;
      spot.y += (target.y - spot.y) * EASE;
      spot.alpha += (goal - spot.alpha) * 0.12;

      const settled =
        Math.abs(target.x - spot.x) < 0.1 &&
        Math.abs(target.y - spot.y) < 0.1 &&
        Math.abs(goal - spot.alpha) < 0.01;
      if (settled) {
        spot.x = target.x;
        spot.y = target.y;
        spot.alpha = goal;
      }

      if (spot.alpha <= 0.01) {
        canvas.style.visibility = 'hidden';
      } else {
        const left = Math.round(spot.x - SPOTLIGHT_SIZE / 2);
        const top = Math.round(spot.y - SPOTLIGHT_SIZE / 2);
        canvas.style.visibility = 'visible';
        canvas.style.transform = `translate3d(${left}px, ${top}px, 0)`;

        // Cursor position inside the small canvas
        const cx = spot.x - left;
        const cy = spot.y - top;

        ctx.clearRect(0, 0, SPOTLIGHT_SIZE, SPOTLIGHT_SIZE);

        // Lines hold full strength through the inner area, then fade to the edge
        const lines = ctx.createRadialGradient(cx, cy, 0, cx, cy, GRID_RADIUS);
        lines.addColorStop(0, `rgba(${LINE_RGB}, ${LINE_OPACITY * spot.alpha})`);
        lines.addColorStop(0.45, `rgba(${LINE_RGB}, ${LINE_OPACITY * spot.alpha})`);
        lines.addColorStop(1, `rgba(${LINE_RGB}, 0)`);

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, GRID_RADIUS, 0, Math.PI * 2);
        ctx.clip();
        ctx.strokeStyle = lines;
        ctx.lineWidth = 1;
        ctx.beginPath();

        // Page grid positions, converted into canvas coordinates so lines stay locked while scrolling
        const { scrollX, scrollY } = window;
        for (let k = Math.floor((spot.x - GRID_RADIUS + scrollX) / GRID_SIZE); k * GRID_SIZE - scrollX <= spot.x + GRID_RADIUS; k++) {
          const lx = Math.round(k * GRID_SIZE - scrollX) - left + 0.5;
          ctx.moveTo(lx, cy - GRID_RADIUS);
          ctx.lineTo(lx, cy + GRID_RADIUS);
        }
        for (let k = Math.floor((spot.y - GRID_RADIUS + scrollY) / GRID_SIZE); k * GRID_SIZE - scrollY <= spot.y + GRID_RADIUS; k++) {
          const ly = Math.round(k * GRID_SIZE - scrollY) - top + 0.5;
          ctx.moveTo(cx - GRID_RADIUS, ly);
          ctx.lineTo(cx + GRID_RADIUS, ly);
        }

        ctx.stroke();
        ctx.restore();
      }

      // Keep animating only until the spotlight has caught up and finished fading
      if (!settled) frame = requestAnimationFrame(draw);
    };

    const wake = () => {
      if (frame === null) frame = requestAnimationFrame(draw);
    };

    const handleMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!started) {
        spot.x = target.x;
        spot.y = target.y;
        started = true;
      }
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
        zIndex: 9999,
        mixBlendMode: 'multiply',
        visibility: 'hidden',
        willChange: 'transform',
      }}
    />
  );
};

export default CursorSpotlight;
