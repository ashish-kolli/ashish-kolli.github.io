/**
 * StatsGrid Component - "The Scholarly Disruptor"
 *
 * Editorial data visualization cards
 * - Hero stat with dark treatment
 * - Large background decorative numbers
 * - Delta/change emphasis (the story is in the change)
 * - Consistent with Feature/Profile card aesthetics
 * - Staggered scroll animations
 */
import React, { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

// =============================================================================
// STAT CARD - Editorial treatment with background numbers
// =============================================================================
const StatCard = ({ stat, index, isHero, animationDelay = 0, inView = true }) => {
  // Extract numeric value for background display
  const bgNumber = stat.value.replace(/[^0-9]/g, '');

  // Check if this is a "change" stat (has "up from" or similar)
  const hasChange = stat.source && (
    stat.source.toLowerCase().includes('up from') ||
    stat.source.toLowerCase().includes('down from')
  );

  if (isHero) {
    // Hero stat - large, dark, prominent
    return (
      <div
        style={{
          position: 'relative',
          gridColumn: 'span 2',
          padding: `${SPACE[7]} ${SPACE[6]}`,
          background: COLORS.ink[900],
          borderRadius: EFFECTS.radius.lg,
          overflow: 'hidden',
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: `opacity 0.6s ease-out ${animationDelay}s, transform 0.6s ease-out ${animationDelay}s`,
        }}
      >
        {/* Large background number */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '5%',
            fontFamily: FONTS.display,
            fontSize: 'clamp(8rem, 20vw, 14rem)',
            fontWeight: 300,
            lineHeight: 1,
            color: COLORS.ink[800],
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {bgNumber}
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Value with gradient */}
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              background: `linear-gradient(135deg, #FFFFFF 0%, ${COLORS.accent.muted} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: SPACE[3],
            }}
          >
            {stat.value}
          </div>

          {/* Label */}
          <div
            style={{
              fontFamily: FONTS.ui,
              fontSize: TYPE_SCALE.ui.lg.size,
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: SPACE[2],
            }}
          >
            {stat.label}
          </div>

          {/* Source/Change - emphasized */}
          {stat.source && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: SPACE[2],
                padding: `${SPACE[1]} ${SPACE[3]}`,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: EFFECTS.radius.full,
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              {hasChange && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.semantic.success}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              )}
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: TYPE_SCALE.mono.sm.size,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.02em',
                }}
              >
                {stat.source}
              </span>
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${COLORS.accent.primary} 0%, ${COLORS.accent.light} 50%, transparent 100%)`,
          }}
        />
      </div>
    );
  }

  // Standard stat card
  return (
    <div
      style={{
        position: 'relative',
        padding: SPACE[5],
        background: COLORS.surface.elevated,
        borderRadius: EFFECTS.radius.lg,
        border: `1px solid ${COLORS.ink[200]}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '140px',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease-out ${animationDelay}s, transform 0.5s ease-out ${animationDelay}s`,
      }}
    >
      {/* Subtle background number */}
      <div
        style={{
          position: 'absolute',
          top: '-5%',
          right: '-5%',
          fontFamily: FONTS.display,
          fontSize: '6rem',
          fontWeight: 300,
          lineHeight: 1,
          color: COLORS.ink[100],
          userSelect: 'none',
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      >
        {bgNumber}
      </div>

      {/* Index indicator */}
      <div
        style={{
          position: 'absolute',
          top: SPACE[3],
          left: SPACE[3],
          fontFamily: FONTS.mono,
          fontSize: TYPE_SCALE.mono.sm.size,
          fontWeight: 500,
          color: COLORS.ink[300],
          letterSpacing: '0.05em',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Content - pushed to bottom */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
        {/* Value */}
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: COLORS.accent.primary,
            marginBottom: SPACE[2],
          }}
        >
          {stat.value}
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: FONTS.ui,
            fontSize: TYPE_SCALE.ui.sm.size,
            fontWeight: 600,
            lineHeight: 1.4,
            color: COLORS.ink[700],
            marginBottom: stat.source ? SPACE[2] : 0,
          }}
        >
          {stat.label}
        </div>

        {/* Source/Change */}
        {stat.source && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACE[1],
            }}
          >
            {hasChange && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.semantic.success}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: '0.6875rem',
                color: COLORS.ink[400],
                letterSpacing: '0.01em',
              }}
            >
              {stat.source}
            </span>
          </div>
        )}
      </div>

      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          top: SPACE[4],
          bottom: SPACE[4],
          left: 0,
          width: '3px',
          background: index === 1
            ? COLORS.accent.primary
            : COLORS.ink[200],
          borderRadius: `0 ${EFFECTS.radius.full} ${EFFECTS.radius.full} 0`,
        }}
      />
    </div>
  );
};

// =============================================================================
// STATS GRID - Editorial layout with scroll animations
// =============================================================================
const StatsGrid = ({ stats }) => {
  const [ref, inView] = useInView();

  if (!stats || stats.length === 0) return null;

  // For 4 stats: first is hero (spans 2), rest are in row below
  const hasHero = stats.length === 4;

  return (
    <div
      ref={ref}
      style={{
        marginTop: SPACE[6],
        marginBottom: SPACE[6],
      }}
    >
      {/* Section label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[3],
          marginBottom: SPACE[4],
        }}
      >
        <div
          style={{
            width: '24px',
            height: '2px',
            background: COLORS.accent.primary,
          }}
        />
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE_SCALE.mono.sm.size,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: COLORS.ink[400],
          }}
        >
          Key Metrics
        </span>
      </div>

      {hasHero ? (
        // 4-stat layout: hero + 3 below
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: SPACE[4],
          }}
        >
          {/* Hero stat spans first row */}
          <div style={{ gridColumn: 'span 2' }}>
            <StatCard stat={stats[0]} index={0} isHero={true} inView={inView} animationDelay={0} />
          </div>

          {/* Second stat in right column of first row */}
          <StatCard stat={stats[1]} index={1} isHero={false} inView={inView} animationDelay={0.1} />

          {/* Third stat */}
          <StatCard stat={stats[2]} index={2} isHero={false} inView={inView} animationDelay={0.2} />

          {/* Fourth stat spans remaining columns */}
          <div style={{ gridColumn: 'span 2' }}>
            <StatCard stat={stats[3]} index={3} isHero={false} inView={inView} animationDelay={0.3} />
          </div>
        </div>
      ) : (
        // Standard grid for other counts
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`,
            gap: SPACE[4],
          }}
        >
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} isHero={false} inView={inView} animationDelay={index * 0.1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsGrid;
