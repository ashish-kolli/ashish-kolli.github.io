/**
 * Convergence Component - "The Scholarly Disruptor"
 *
 * Triangular convergence diagram showing PM, Designer, and Engineer
 * roles merging toward a central "Product Engineer" hub
 * - Scroll-triggered entrance animation
 */
import React, { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

const Convergence = ({
  roles,
  eyebrow = 'The Convergence',
  title = 'Three Roles Becoming One',
  centerLabel = 'The New Role',
  centerTitle = <>Product<br/>Engineer</>,
  insight = (
    <em>The role that remains is the one who knows <strong style={{ color: COLORS.ink[800] }}>what to build</strong> and <strong style={{ color: COLORS.ink[800] }}>why</strong>.</em>
  ),
}) => {
  const [hoveredRole, setHoveredRole] = useState(null);
  const [ref, inView] = useInView();

  if (!roles || roles.length === 0) return null;

  // Map roles to positions (we expect 3 roles: PM, Designer, Engineer)
  const roleData = [
    { ...roles[0], position: 'top', angle: 0 },
    { ...roles[1], position: 'bottomLeft', angle: 120 },
    { ...roles[2], position: 'bottomRight', angle: 240 },
  ];

  return (
    <div
      ref={ref}
      style={{
        marginTop: SPACE[10],
        marginBottom: SPACE[10],
        background: `linear-gradient(135deg, ${COLORS.surface.inset} 0%, ${COLORS.surface.paper} 100%)`,
        borderRadius: EFFECTS.radius.xl,
        padding: SPACE[8],
        border: `1px solid ${COLORS.ink[100]}`,
        position: 'relative',
        overflow: 'hidden',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
        transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
      }}
    >
      {/* Subtle background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          background: `radial-gradient(circle at 50% 50%, ${COLORS.accent.primary} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: SPACE[6], position: 'relative' }}>
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE_SCALE.mono.sm.size,
            color: COLORS.accent.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {eyebrow}
        </span>
        <h4
          style={{
            fontFamily: FONTS.display,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 400,
            color: COLORS.ink[800],
            margin: `${SPACE[2]} 0 0 0`,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h4>
      </div>

      {/* Convergence Diagram */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto',
          aspectRatio: '1.2 / 1',
          minHeight: '350px',
        }}
      >
        {/* Connection lines - curved paths */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          viewBox="0 0 400 350"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={COLORS.ink[200]} />
              <stop offset="50%" stopColor={COLORS.accent.primary} stopOpacity="0.5" />
              <stop offset="100%" stopColor={COLORS.ink[200]} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Lines from each node to center */}
          {/* Top to center */}
          <path
            d="M 200 60 Q 200 120 200 175"
            fill="none"
            stroke={`url(#lineGradient)`}
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity={hoveredRole === 0 ? 1 : 0.6}
          />
          {/* Bottom left to center */}
          <path
            d="M 80 280 Q 130 230 200 175"
            fill="none"
            stroke={`url(#lineGradient)`}
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity={hoveredRole === 1 ? 1 : 0.6}
          />
          {/* Bottom right to center */}
          <path
            d="M 320 280 Q 270 230 200 175"
            fill="none"
            stroke={`url(#lineGradient)`}
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity={hoveredRole === 2 ? 1 : 0.6}
          />

          {/* Subtle connecting arcs between outer nodes */}
          <path
            d="M 80 280 Q 200 330 320 280"
            fill="none"
            stroke={COLORS.ink[150] || COLORS.ink[200]}
            strokeWidth="1"
            opacity="0.3"
          />
          <path
            d="M 200 60 Q 100 150 80 280"
            fill="none"
            stroke={COLORS.ink[150] || COLORS.ink[200]}
            strokeWidth="1"
            opacity="0.3"
          />
          <path
            d="M 200 60 Q 300 150 320 280"
            fill="none"
            stroke={COLORS.ink[150] || COLORS.ink[200]}
            strokeWidth="1"
            opacity="0.3"
          />
        </svg>

        {/* Center hub - Product Engineer */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.accent.primary} 0%, ${COLORS.accent.muted} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 32px ${COLORS.accent.primary}40, 0 0 0 8px ${COLORS.accent.wash}`,
              border: `3px solid ${COLORS.surface.paper}`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.ui,
                fontSize: '0.65rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: SPACE[1],
              }}
            >
              {centerLabel}
            </span>
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: '1.1rem',
                fontWeight: 500,
                color: '#FFFFFF',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {centerTitle}
            </span>
          </div>
        </div>

        {/* Role nodes */}
        {roleData.map((role, i) => {
          const positions = {
            0: { top: '0', left: '50%', transform: 'translateX(-50%)' },
            1: { bottom: '0', left: '5%' },
            2: { bottom: '0', right: '5%' },
          };
          const pos = positions[i];
          const isHovered = hoveredRole === i;

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredRole(i)}
              onMouseLeave={() => setHoveredRole(null)}
              style={{
                position: 'absolute',
                ...pos,
                cursor: 'default',
                transition: 'all 0.3s ease',
                transform: `${pos.transform || ''} ${isHovered ? 'scale(1.05)' : 'scale(1)'}`,
                zIndex: isHovered ? 15 : 5,
              }}
            >
              {/* Role card */}
              <div
                style={{
                  background: COLORS.surface.elevated,
                  borderRadius: EFFECTS.radius.lg,
                  padding: `${SPACE[4]} ${SPACE[5]}`,
                  border: `2px solid ${isHovered ? COLORS.accent.primary : COLORS.ink[200]}`,
                  boxShadow: isHovered
                    ? `0 8px 24px ${COLORS.accent.primary}20`
                    : EFFECTS.shadow.md,
                  textAlign: 'center',
                  minWidth: '100px',
                  transition: 'all 0.3s ease',
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.ui,
                    fontSize: TYPE_SCALE.ui.lg.size,
                    fontWeight: 600,
                    color: isHovered ? COLORS.accent.primary : COLORS.ink[700],
                    marginBottom: SPACE[1],
                    transition: 'color 0.3s ease',
                  }}
                >
                  {role.from}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: '0.65rem',
                    color: COLORS.ink[400],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  → {role.to}
                </div>
              </div>

              {/* Description tooltip on hover */}
              <div
                style={{
                  position: 'absolute',
                  top: i === 0 ? '100%' : 'auto',
                  bottom: i !== 0 ? '100%' : 'auto',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: i === 0 ? SPACE[2] : 0,
                  marginBottom: i !== 0 ? SPACE[2] : 0,
                  width: '200px',
                  opacity: isHovered ? 1 : 0,
                  visibility: isHovered ? 'visible' : 'hidden',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    background: COLORS.ink[800],
                    color: COLORS.surface.paper,
                    padding: `${SPACE[3]} ${SPACE[4]}`,
                    borderRadius: EFFECTS.radius.md,
                    fontFamily: FONTS.body,
                    fontSize: TYPE_SCALE.body.sm.size,
                    lineHeight: 1.5,
                    textAlign: 'center',
                    boxShadow: EFFECTS.shadow.lg,
                  }}
                >
                  {role.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom insight */}
      <div
        style={{
          textAlign: 'center',
          marginTop: SPACE[6],
          paddingTop: SPACE[5],
          borderTop: `1px solid ${COLORS.ink[100]}`,
        }}
      >
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: TYPE_SCALE.body.md.size,
            lineHeight: TYPE_SCALE.body.md.lineHeight,
            color: COLORS.ink[600],
            margin: 0,
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {insight}
        </p>
      </div>
    </div>
  );
};

export default Convergence;
