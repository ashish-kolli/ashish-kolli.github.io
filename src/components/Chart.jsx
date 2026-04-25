/**
 * Chart Component - "The Scholarly Disruptor"
 *
 * Premium editorial data visualization
 * - Bloomberg/Economist-style charts
 * - Proper axis lines and grid
 * - Refined typography
 */
import React from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE, CHART_COLORS } from '../design-tokens';

// Growth Chart - Editorial comparison layout
const GrowthChart = ({ data }) => {
  const { title, subtitle, series } = data;

  return (
    <div
      style={{
        marginTop: SPACE[5],
        marginBottom: SPACE[5],
        padding: SPACE[5],
        background: COLORS.surface.elevated,
        borderRadius: EFFECTS.radius.lg,
        border: `1px solid ${COLORS.ink[200]}`,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: SPACE[5] }}>
        <h4
          style={{
            fontFamily: FONTS.headline,
            fontSize: TYPE_SCALE.headline.sm.size,
            fontWeight: TYPE_SCALE.headline.sm.weight,
            color: COLORS.ink[800],
            margin: 0,
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

      {/* Series rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
        {series.map((s, si) => {
          const startPoint = s.points[0];
          const endPoint = s.points[s.points.length - 1];
          const growth = endPoint.value - startPoint.value;
          const color = CHART_COLORS[si];

          return (
            <div
              key={si}
              style={{
                padding: SPACE[4],
                background: si === 0 ? COLORS.accent.wash : COLORS.surface.inset,
                borderRadius: EFFECTS.radius.md,
                border: `1px solid ${si === 0 ? COLORS.accent.primary + '20' : COLORS.ink[100]}`,
              }}
            >
              {/* Series label */}
              <div
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.sm.size,
                  fontWeight: 600,
                  color: COLORS.ink[600],
                  marginBottom: SPACE[3],
                  display: 'flex',
                  alignItems: 'center',
                  gap: SPACE[2],
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: color,
                  }}
                />
                {s.label}
              </div>

              {/* Values row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: SPACE[4],
                }}
              >
                {/* Start value */}
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: '0.6875rem',
                      color: COLORS.ink[400],
                      marginBottom: SPACE[1],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {startPoint.year}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: '1.75rem',
                      fontWeight: 400,
                      color: COLORS.ink[400],
                    }}
                  >
                    {startPoint.value}%
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <div
                    style={{
                      height: '8px',
                      background: COLORS.ink[100],
                      borderRadius: EFFECTS.radius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${endPoint.value}%`,
                        background: `linear-gradient(90deg, ${color}60 0%, ${color} 100%)`,
                        borderRadius: EFFECTS.radius.full,
                      }}
                    />
                  </div>
                  {/* Growth indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: COLORS.surface.elevated,
                      padding: `${SPACE[1]} ${SPACE[2]}`,
                      borderRadius: EFFECTS.radius.full,
                      border: `1px solid ${COLORS.ink[200]}`,
                      fontFamily: FONTS.mono,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: COLORS.semantic.success,
                    }}
                  >
                    +{growth}
                  </div>
                </div>

                {/* End value */}
                <div style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: '0.6875rem',
                      color: COLORS.ink[400],
                      marginBottom: SPACE[1],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {endPoint.year}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: '1.75rem',
                      fontWeight: 400,
                      fontStyle: 'italic',
                      color: color,
                    }}
                  >
                    {endPoint.value}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Bar Chart - Horizontal bars with refined styling
const BarChart = ({ data }) => {
  const { title, subtitle, bars } = data;
  const maxValue = Math.max(...bars.map(b => b.value));

  return (
    <div
      style={{
        marginTop: SPACE[5],
        marginBottom: SPACE[5],
        padding: SPACE[5],
        background: COLORS.surface.elevated,
        borderRadius: EFFECTS.radius.lg,
        border: `1px solid ${COLORS.ink[200]}`,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: SPACE[5] }}>
        <h4
          style={{
            fontFamily: FONTS.headline,
            fontSize: TYPE_SCALE.headline.sm.size,
            fontWeight: TYPE_SCALE.headline.sm.weight,
            color: COLORS.ink[800],
            margin: 0,
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

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
        {bars.map((bar, i) => {
          const color = CHART_COLORS[i % CHART_COLORS.length];
          const widthPercent = (bar.value / maxValue) * 100;

          return (
            <div key={i}>
              {/* Label row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: SPACE[2],
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.ui,
                    fontSize: TYPE_SCALE.ui.sm.size,
                    fontWeight: 500,
                    color: COLORS.ink[700],
                  }}
                >
                  {bar.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: color,
                  }}
                >
                  {bar.value}{bar.unit || '%'}
                </span>
              </div>

              {/* Bar track */}
              <div
                style={{
                  height: '8px',
                  background: COLORS.ink[100],
                  borderRadius: EFFECTS.radius.full,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    height: '100%',
                    width: `${widthPercent}%`,
                    background: color,
                    borderRadius: EFFECTS.radius.full,
                  }}
                />
              </div>

              {/* Source */}
              {bar.source && (
                <p
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: '0.6875rem',
                    color: COLORS.ink[400],
                    margin: 0,
                    marginTop: SPACE[2],
                  }}
                >
                  {bar.source}
                  {bar.cite && (
                    <sup style={{ color: COLORS.accent.primary, marginLeft: '4px' }}>
                      [{bar.cite}]
                    </sup>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Hierarchy Chart - Dramatic transformation visualization
const HierarchyChart = ({ data }) => {
  const { title, subtitle, levels } = data;

  return (
    <div
      style={{
        marginTop: SPACE[6],
        marginBottom: SPACE[6],
        padding: SPACE[6],
        background: COLORS.surface.paper,
        borderRadius: EFFECTS.radius.xl,
        border: `1px solid ${COLORS.ink[100]}`,
        boxShadow: EFFECTS.shadow.lg,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: SPACE[6], textAlign: 'center' }}>
        <h4
          style={{
            fontFamily: FONTS.headline,
            fontSize: TYPE_SCALE.headline.md.size,
            fontWeight: TYPE_SCALE.headline.md.weight,
            color: COLORS.ink[800],
            margin: 0,
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
              marginTop: SPACE[2],
              letterSpacing: '0.02em',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Transformation rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
        {levels.map((level, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: SPACE[4],
              padding: `${SPACE[4]} ${SPACE[5]}`,
              background: i === 0 ? COLORS.accent.wash : COLORS.surface.inset,
              borderRadius: EFFECTS.radius.lg,
              border: `1px solid ${i === 0 ? COLORS.accent.primary + '20' : COLORS.ink[100]}`,
            }}
          >
            {/* FROM - faded, crossed out style */}
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: SPACE[2],
                  padding: `${SPACE[2]} ${SPACE[4]}`,
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.md.size,
                  fontWeight: 400,
                  color: COLORS.ink[400],
                  textDecoration: 'line-through',
                  textDecorationColor: COLORS.ink[300],
                  opacity: 0.7,
                }}
              >
                {level.from}
              </span>
            </div>

            {/* Arrow - dramatic chevron */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                background: `linear-gradient(135deg, ${COLORS.accent.primary} 0%, ${COLORS.accent.deep} 100%)`,
                borderRadius: EFFECTS.radius.full,
                boxShadow: `${EFFECTS.shadow.md}, ${EFFECTS.shadow.inset}`,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: 'white' }}
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* TO - bold, emphasized */}
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: SPACE[2],
                  padding: `${SPACE[3]} ${SPACE[5]}`,
                  background: COLORS.surface.paper,
                  border: `2px solid ${COLORS.accent.primary}`,
                  borderRadius: EFFECTS.radius.md,
                  fontFamily: FONTS.headline,
                  fontSize: TYPE_SCALE.ui.lg.size,
                  fontWeight: 600,
                  color: COLORS.accent.deep,
                  boxShadow: EFFECTS.shadow.sm,
                }}
              >
                {level.to}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          marginTop: SPACE[5],
          height: '3px',
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.accent.primary}40 50%, transparent 100%)`,
          borderRadius: EFFECTS.radius.sm,
        }}
      />
    </div>
  );
};

// Range Chart - Salary/range bands
const RangeChart = ({ data }) => {
  const { title, subtitle, ranges } = data;
  const allValues = ranges.flatMap(r => [r.min, r.max]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  return (
    <div
      style={{
        marginTop: SPACE[5],
        marginBottom: SPACE[5],
        padding: SPACE[5],
        background: COLORS.surface.elevated,
        borderRadius: EFFECTS.radius.lg,
        border: `1px solid ${COLORS.ink[200]}`,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: SPACE[5] }}>
        <h4
          style={{
            fontFamily: FONTS.headline,
            fontSize: TYPE_SCALE.headline.sm.size,
            fontWeight: TYPE_SCALE.headline.sm.weight,
            color: COLORS.ink[800],
            margin: 0,
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

      {/* Ranges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[4] }}>
        {ranges.map((range, i) => {
          const leftPercent = ((range.min - minVal) / (maxVal - minVal)) * 100;
          const widthPercent = ((range.max - range.min) / (maxVal - minVal)) * 100;

          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: SPACE[2],
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.ui,
                    fontSize: TYPE_SCALE.ui.sm.size,
                    fontWeight: 600,
                    color: range.highlight ? COLORS.accent.primary : COLORS.ink[700],
                  }}
                >
                  {range.label}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: TYPE_SCALE.mono.sm.size,
                    color: COLORS.ink[500],
                  }}
                >
                  ${range.min}{range.unit} – ${range.max}{range.unit}
                </span>
              </div>
              <div
                style={{
                  height: '20px',
                  background: COLORS.ink[100],
                  borderRadius: EFFECTS.radius.md,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    height: '100%',
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    background: range.highlight
                      ? `linear-gradient(90deg, ${COLORS.accent.primary} 0%, ${COLORS.accent.light} 100%)`
                      : COLORS.ink[300],
                    borderRadius: EFFECTS.radius.md,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONTS.mono,
          fontSize: '0.6875rem',
          color: COLORS.ink[400],
          marginTop: SPACE[2],
        }}
      >
        <span>${minVal}k</span>
        <span>${maxVal}k</span>
      </div>
    </div>
  );
};

// Main Chart router
const Chart = ({ type, data }) => {
  switch (type) {
    case 'growth':
      return <GrowthChart data={data} />;
    case 'bar':
      return <BarChart data={data} />;
    case 'hierarchy':
      return <HierarchyChart data={data} />;
    case 'range':
      return <RangeChart data={data} />;
    default:
      return null;
  }
};

export default Chart;
export { GrowthChart, BarChart, HierarchyChart, RangeChart };
