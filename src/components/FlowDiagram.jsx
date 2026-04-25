/**
 * FlowDiagram Component - "The Scholarly Disruptor"
 *
 * Tabbed, interactive architecture flow diagrams showing ingestion/query
 * paths for AI memory systems. Vertical flow with SVG arrows between stages.
 * Parallel lanes for stages that run side-by-side.
 *
 * Props:
 *   systemName  — e.g., "Hindsight", "Zep / Graphiti"
 *   accentColor — hex color for the system (active tab underline, node borders)
 *   tabs        — array of { label, stages[] }
 *   callouts    — optional array of { title, text }
 */
import React, { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

// =============================================================================
// NODE TYPE COLOR MAP
// =============================================================================
const NODE_COLORS = {
  input:   { bg: COLORS.ink[50],  border: COLORS.ink[200] },
  process: { bg: '#dbeafe',       border: '#3b82f6' },
  llm:     { bg: '#ffedd5',       border: '#f97316' },
  store:   { bg: '#dcfce7',       border: '#22c55e' },
  search:  { bg: '#ede9fe',       border: '#8b5cf6' },
  output:  { bg: COLORS.ink[50],  border: COLORS.ink[300] },
  // "unique" is handled inline — uses accentColor with dashed border
};

const getNodeColors = (type, accentColor) => {
  if (type === 'unique') {
    return { bg: '#ffffff', border: accentColor };
  }
  return NODE_COLORS[type] || NODE_COLORS.process;
};

// =============================================================================
// DOWN ARROW SVG — simple path between stages
// =============================================================================
const DownArrow = () => (
  <svg
    width="20"
    height="24"
    viewBox="0 0 20 24"
    fill="none"
    style={{ display: 'block', margin: '0 auto' }}
  >
    <line x1="10" y1="0" x2="10" y2="18" stroke={COLORS.ink[300]} strokeWidth="1.5" />
    <path d="M5 14 L10 20 L15 14" stroke={COLORS.ink[300]} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// =============================================================================
// STAGE NODE — single rounded rectangle
// =============================================================================
const StageNode = ({ label, description, type, accentColor }) => {
  const colors = getNodeColors(type, accentColor);
  const isUnique = type === 'unique';

  return (
    <div
      style={{
        background: colors.bg,
        border: `${isUnique ? '1.5px dashed' : '1.5px solid'} ${colors.border}`,
        borderRadius: EFFECTS.radius.lg,
        padding: `${SPACE[3]} ${SPACE[4]}`,
        textAlign: 'center',
        minWidth: '120px',
        flex: 1,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.ui,
          fontSize: TYPE_SCALE.ui.sm.size,
          fontWeight: 600,
          color: COLORS.ink[800],
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </div>
      {description && (
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: TYPE_SCALE.ui.xs.size,
            color: COLORS.ink[500],
            marginTop: SPACE[1],
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// LANE NODE — smaller node used inside parallel lanes
// =============================================================================
const LaneNode = ({ label, type, accentColor }) => {
  const colors = getNodeColors(type, accentColor);
  const isUnique = type === 'unique';

  return (
    <div
      style={{
        background: colors.bg,
        border: `${isUnique ? '1.5px dashed' : '1.5px solid'} ${colors.border}`,
        borderRadius: EFFECTS.radius.md,
        padding: `${SPACE[2]} ${SPACE[3]}`,
        textAlign: 'center',
        flex: 1,
        minWidth: '80px',
      }}
    >
      <div
        style={{
          fontFamily: FONTS.ui,
          fontSize: TYPE_SCALE.ui.xs.size,
          fontWeight: 600,
          color: COLORS.ink[700],
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// =============================================================================
// FLOW TAB PANEL — vertical flow of stages
// =============================================================================
const FlowTabPanel = ({ stages, accentColor }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `${SPACE[5]} ${SPACE[4]}`,
      gap: '0',
    }}
  >
    {stages.map((stage, idx) => (
      <React.Fragment key={idx}>
        {/* Arrow between stages (not before the first) */}
        {idx > 0 && <DownArrow />}

        {/* If stage has lanes, render parallel nodes */}
        {stage.lanes ? (
          <div style={{ width: '100%' }}>
            {/* Stage label above lanes */}
            {stage.label && (
              <div
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: TYPE_SCALE.mono.sm.size,
                  fontWeight: 600,
                  color: COLORS.ink[400],
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textAlign: 'center',
                  marginBottom: SPACE[2],
                }}
              >
                {stage.label}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: SPACE[2],
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {stage.lanes.map((lane, lIdx) => (
                <LaneNode key={lIdx} label={lane.label} type={lane.type} accentColor={accentColor} />
              ))}
            </div>
          </div>
        ) : (
          <StageNode
            label={stage.label}
            description={stage.description}
            type={stage.type}
            accentColor={accentColor}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// =============================================================================
// MAIN FLOW DIAGRAM
// =============================================================================
const FlowDiagram = ({ systemName, accentColor, tabs, callouts }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [containerRef, inView] = useInView();

  if (!tabs || tabs.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: SPACE[6],
        marginBottom: SPACE[6],
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease-out, transform 0.5s ease-out`,
      }}
    >
      {/* Outer card container */}
      <div
        style={{
          background: COLORS.surface.elevated,
          borderRadius: EFFECTS.radius.xl,
          boxShadow: EFFECTS.shadow.md,
          border: `1px solid ${COLORS.ink[200]}`,
          overflow: 'hidden',
        }}
      >
        {/* System badge + tab bar row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[4],
            padding: `0 ${SPACE[5]}`,
            borderBottom: `1px solid ${COLORS.ink[200]}`,
            background: COLORS.surface.paper,
          }}
        >
          {/* System badge pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACE[2],
              padding: `${SPACE[1]} ${SPACE[3]}`,
              background: COLORS.ink[50],
              borderRadius: EFFECTS.radius.full,
              border: `1px solid ${COLORS.ink[200]}`,
              flexShrink: 0,
              marginTop: SPACE[2],
              marginBottom: SPACE[2],
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: EFFECTS.radius.full,
                background: accentColor,
              }}
            />
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: TYPE_SCALE.mono.sm.size,
                fontWeight: 600,
                color: COLORS.ink[600],
                letterSpacing: '0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              {systemName}
            </span>
          </div>

          {/* Tab buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0',
              flex: 1,
              overflow: 'auto',
            }}
          >
            {tabs.map((tab, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    padding: `${SPACE[3]} ${SPACE[4]}`,
                    fontFamily: FONTS.ui,
                    fontSize: TYPE_SCALE.ui.sm.size,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? accentColor : COLORS.ink[400],
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: EFFECTS.transition.fast,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active tab content */}
        <FlowTabPanel
          stages={tabs[activeTab].stages}
          accentColor={accentColor}
        />
      </div>

      {/* Callout boxes */}
      {callouts && callouts.length > 0 && (
        <div style={{ marginTop: SPACE[4], display: 'flex', flexDirection: 'column', gap: SPACE[3] }}>
          {callouts.map((callout, idx) => (
            <div
              key={idx}
              style={{
                background: COLORS.surface.elevated,
                borderRadius: EFFECTS.radius.md,
                border: `1px solid ${COLORS.ink[200]}`,
                borderLeft: `3px solid ${accentColor}`,
                padding: `${SPACE[3]} ${SPACE[4]}`,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.sm.size,
                  fontWeight: 600,
                  color: COLORS.ink[800],
                  marginBottom: SPACE[1],
                }}
              >
                {callout.title}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: TYPE_SCALE.body.sm.size,
                  lineHeight: TYPE_SCALE.body.sm.lineHeight,
                  color: COLORS.ink[500],
                }}
              >
                {callout.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlowDiagram;
