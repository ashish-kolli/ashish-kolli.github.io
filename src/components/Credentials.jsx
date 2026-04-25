/**
 * Credentials Component - "The Scholarly Disruptor"
 *
 * Editorial magazine aesthetic
 * - Display typography for categories
 * - Dark background for contrast
 * - 3x2 grid for 6 credentials
 * - Scroll-triggered entrance animation
 */
import React, { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

const Credentials = ({ credentials }) => {
  const [ref, inView] = useInView();

  if (!credentials || credentials.length === 0) return null;

  return (
    <div
      ref={ref}
      style={{
        marginTop: SPACE[8],
        marginBottom: SPACE[8],
        background: COLORS.surface.dark,
        borderRadius: EFFECTS.radius.lg,
        padding: `${SPACE[7]} ${SPACE[6]}`,
        position: 'relative',
        overflow: 'hidden',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.98)',
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
      }}
    >
      {/* Subtle noise texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.accent.primary}40 50%, transparent 100%)`,
        }}
      />

      {/* Header */}
      <h4
        style={{
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: TYPE_SCALE.mono.sm.size,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: COLORS.ink[400],
          marginBottom: SPACE[6],
          position: 'relative',
          zIndex: 1,
        }}
      >
        At a Glance
      </h4>

      {/* Credentials grid - fixed 3 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: `${SPACE[5]} ${SPACE[4]}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {credentials.map((cred, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              padding: `${SPACE[3]} ${SPACE[2]}`,
            }}
          >
            {/* Category name - editorial display style */}
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: i === 0 ? COLORS.accent.light : COLORS.ink[100],
                marginBottom: SPACE[2],
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {cred.value}
            </div>
            {/* Description */}
            <div
              style={{
                fontFamily: FONTS.ui,
                fontSize: TYPE_SCALE.ui.sm.size,
                color: COLORS.ink[400],
                lineHeight: 1.4,
              }}
            >
              {cred.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credentials;
