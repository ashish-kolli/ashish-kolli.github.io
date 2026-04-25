/**
 * QuadrantChart Component - "The Scholarly Disruptor"
 *
 * 2x2 quadrant scatter chart for strategic positioning maps.
 * Uses IntersectionObserver for scroll-based fade-in animation.
 */
import React, { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE, LAYOUT } from '../design-tokens';

const QuadrantChart = ({ title, subtitle, xAxisLow, xAxisHigh, yAxisLow, yAxisHigh, quadrantLabels, dots }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < window.innerHeight + 100) { setInView(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1, rootMargin: '-30px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Quadrant background colors — very light washes
  const quadrantColors = [
    'rgba(91, 33, 182, 0.05)',   // top-left: accent wash
    'rgba(99, 102, 241, 0.06)',  // top-right: indigo wash
    'rgba(113, 113, 122, 0.04)', // bottom-left: neutral wash
    'rgba(161, 161, 170, 0.05)', // bottom-right: gray wash
  ];

  const CHART_HEIGHT = 340;
  const CHART_PADDING = 48;

  return (
    <figure
      ref={ref}
      style={{
        margin: `${SPACE[7]} 0`,
        padding: 0,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        maxWidth: LAYOUT.maxWidth.prose,
      }}
    >
      <div
        style={{
          background: COLORS.surface.elevated,
          borderRadius: EFFECTS.radius.xl,
          boxShadow: EFFECTS.shadow.md,
          border: `1px solid ${COLORS.ink[100]}`,
          padding: SPACE[6],
          overflow: 'hidden',
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: SPACE[5] }}>
          <h4
            style={{
              fontFamily: FONTS.display,
              fontSize: TYPE_SCALE.headline.sm.size,
              fontWeight: TYPE_SCALE.headline.sm.weight,
              color: COLORS.ink[800],
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h4>
          {subtitle && (
            <p
              style={{
                fontFamily: FONTS.mono,
                fontSize: TYPE_SCALE.mono.sm.size,
                color: COLORS.ink[400],
                margin: 0,
                marginTop: SPACE[1],
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Chart area with axes */}
        <div style={{ position: 'relative' }}>
          {/* Y-axis labels - each centered at 25% and 75% of chart height */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: CHART_HEIGHT,
              width: CHART_PADDING,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '25%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(180deg)',
                fontFamily: FONTS.mono,
                fontSize: '0.625rem',
                color: COLORS.ink[400],
                writingMode: 'vertical-rl',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {yAxisHigh}
            </span>
            <span
              style={{
                position: 'absolute',
                top: '75%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(180deg)',
                fontFamily: FONTS.mono,
                fontSize: '0.625rem',
                color: COLORS.ink[400],
                writingMode: 'vertical-rl',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {yAxisLow}
            </span>
          </div>

          {/* Main quadrant grid */}
          <div
            style={{
              marginLeft: CHART_PADDING,
              position: 'relative',
              height: CHART_HEIGHT,
              borderRadius: EFFECTS.radius.lg,
              overflow: 'hidden',
              border: `1px solid ${COLORS.ink[200]}`,
            }}
          >
            {/* Four quadrant backgrounds */}
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' }}>
              <div style={{ background: quadrantColors[0] }} />
              <div style={{ background: quadrantColors[1] }} />
              <div style={{ background: quadrantColors[2] }} />
              <div style={{ background: quadrantColors[3] }} />
            </div>

            {/* Divider lines at 50% */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '1px',
                background: COLORS.ink[200],
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '1px',
                background: COLORS.ink[200],
                zIndex: 1,
              }}
            />

            {/* Quadrant labels */}
            {quadrantLabels && quadrantLabels.length === 4 && (
              <>
                {/* Top-left */}
                <div style={{ position: 'absolute', left: '25%', top: '12%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center', maxWidth: '42%', padding: `0 ${SPACE[2]}` }}>
                  <span style={{ fontFamily: FONTS.ui, fontSize: '0.625rem', fontWeight: 500, color: COLORS.ink[300], letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.3, display: 'block' }}>
                    {quadrantLabels[0]}
                  </span>
                </div>
                {/* Top-right */}
                <div style={{ position: 'absolute', left: '75%', top: '12%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center', maxWidth: '42%', padding: `0 ${SPACE[2]}` }}>
                  <span style={{ fontFamily: FONTS.ui, fontSize: '0.625rem', fontWeight: 500, color: COLORS.ink[300], letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.3, display: 'block' }}>
                    {quadrantLabels[1]}
                  </span>
                </div>
                {/* Bottom-left */}
                <div style={{ position: 'absolute', left: '25%', top: '88%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center', maxWidth: '42%', padding: `0 ${SPACE[2]}` }}>
                  <span style={{ fontFamily: FONTS.ui, fontSize: '0.625rem', fontWeight: 500, color: COLORS.ink[300], letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.3, display: 'block' }}>
                    {quadrantLabels[2]}
                  </span>
                </div>
                {/* Bottom-right */}
                <div style={{ position: 'absolute', left: '75%', top: '88%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center', maxWidth: '42%', padding: `0 ${SPACE[2]}` }}>
                  <span style={{ fontFamily: FONTS.ui, fontSize: '0.625rem', fontWeight: 500, color: COLORS.ink[300], letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.3, display: 'block' }}>
                    {quadrantLabels[3]}
                  </span>
                </div>
              </>
            )}

            {/* Dots */}
            {dots && dots.map((dot, i) => {
              // x: 0=left, 100=right; y: 0=bottom, 100=top
              const leftPct = dot.x;
              const topPct = 100 - dot.y;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: EFFECTS.radius.full,
                      background: dot.color,
                      border: `2px solid ${COLORS.surface.elevated}`,
                      boxShadow: `0 1px 4px ${dot.color}40, ${EFFECTS.shadow.sm}`,
                      transition: `transform ${EFFECTS.transition.fast}`,
                    }}
                  />
                  {/* Label */}
                  <span
                    style={{
                      fontFamily: FONTS.ui,
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: COLORS.ink[700],
                      whiteSpace: 'nowrap',
                      background: `${COLORS.surface.elevated}E6`,
                      padding: '1px 6px',
                      borderRadius: EFFECTS.radius.sm,
                      border: `1px solid ${COLORS.ink[100]}`,
                      lineHeight: 1.4,
                    }}
                  >
                    {dot.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div
            style={{
              marginLeft: CHART_PADDING,
              marginTop: SPACE[2],
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: '0.625rem',
                color: COLORS.ink[400],
                letterSpacing: '0.02em',
              }}
            >
              {xAxisLow}
            </span>
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: '0.625rem',
                color: COLORS.ink[400],
                letterSpacing: '0.02em',
              }}
            >
              {xAxisHigh}
            </span>
          </div>
        </div>

        {/* Legend */}
        {dots && dots.length > 0 && (
          <div
            style={{
              marginTop: SPACE[4],
              paddingTop: SPACE[3],
              borderTop: `1px solid ${COLORS.ink[100]}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: SPACE[4],
              justifyContent: 'center',
            }}
          >
            {dots.map((dot, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: SPACE[2],
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: EFFECTS.radius.full,
                    background: dot.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONTS.ui,
                    fontSize: TYPE_SCALE.ui.sm.size,
                    fontWeight: 500,
                    color: COLORS.ink[600],
                  }}
                >
                  {dot.label}
                </span>
                {dot.note && (
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: '0.625rem',
                      color: COLORS.ink[400],
                    }}
                  >
                    {dot.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
};

export default QuadrantChart;
