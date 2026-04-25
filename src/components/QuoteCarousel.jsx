/**
 * QuoteCarousel Component - "The Scholarly Disruptor"
 *
 * Compact editorial quote panel
 * - Horizontal author tabs for navigation
 * - Slim, space-efficient layout
 * - Magazine sidebar aesthetic
 * - Scroll-triggered entrance animation
 */
import React, { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

const QuoteCarousel = ({ quotes }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ref, inView] = useInView();

  if (!quotes || quotes.length === 0) return null;

  const activeQuote = quotes[activeIndex];

  return (
    <div
      ref={ref}
      style={{
        marginTop: SPACE[6],
        marginBottom: SPACE[6],
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {/* Section label - inline with accent */}
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
            fontSize: '0.6875rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: COLORS.ink[400],
          }}
        >
          Industry Perspectives
        </span>
      </div>

      {/* Main panel - compact dark strip */}
      <div
        style={{
          background: COLORS.surface.dark,
          borderRadius: EFFECTS.radius.lg,
          overflow: 'hidden',
        }}
      >
        {/* Author tabs - horizontal navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${COLORS.ink[700]}`,
          }}
        >
          {quotes.map((quote, i) => {
            const isActive = i === activeIndex;
            // Show last name for cleaner tabs
            const nameParts = quote.author.split(' ');
            const displayName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
            // Extract company/org from title (usually after comma or the whole thing)
            const titleParts = quote.title.split(',').map(s => s.trim());
            const shortTitle = titleParts.length > 1 ? titleParts[titleParts.length - 1] : titleParts[0];

            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                style={{
                  flex: 1,
                  padding: `${SPACE[3]} ${SPACE[3]}`,
                  background: isActive ? COLORS.ink[800] : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${COLORS.accent.primary}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: EFFECTS.transition.base,
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = COLORS.ink[800] + '80';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.ui,
                    fontSize: TYPE_SCALE.ui.sm.size,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? COLORS.ink[50] : COLORS.ink[300],
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: '0.6875rem',
                    color: isActive ? COLORS.accent.light : COLORS.ink[400],
                    display: 'block',
                    marginTop: SPACE[1],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quote content - fixed height to prevent layout shift */}
        <div
          style={{
            padding: `${SPACE[6]} ${SPACE[7]}`,
            display: 'flex',
            gap: SPACE[5],
            alignItems: 'flex-start',
            minHeight: '180px',
          }}
        >
          {/* Large quote mark */}
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: '4.5rem',
              lineHeight: 1,
              color: COLORS.accent.primary,
              opacity: 0.8,
              marginTop: '-0.75rem',
              flexShrink: 0,
            }}
          >
            "
          </div>

          {/* Quote text and attribution */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <blockquote
              style={{
                fontFamily: FONTS.body,
                fontSize: TYPE_SCALE.body.lg.size,
                fontStyle: 'italic',
                lineHeight: 1.7,
                color: COLORS.ink[50],
                margin: 0,
                marginBottom: SPACE[4],
              }}
            >
              {activeQuote.quote}
            </blockquote>

            {/* Attribution row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: SPACE[3],
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.md.size,
                  fontWeight: 600,
                  color: COLORS.ink[100],
                }}
              >
                {activeQuote.author}
              </span>
              <span
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.sm.size,
                  color: COLORS.ink[300],
                }}
              >
                {activeQuote.title}
              </span>
              {activeQuote.cite && (
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: TYPE_SCALE.mono.sm.size,
                    color: COLORS.accent.muted,
                    marginLeft: 'auto',
                  }}
                >
                  [{activeQuote.cite}]
                </span>
              )}
            </div>
          </div>

          {/* Navigation arrows */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: SPACE[1],
              flexShrink: 0,
              alignSelf: 'center',
            }}
          >
            <button
              onClick={() => setActiveIndex(i => (i - 1 + quotes.length) % quotes.length)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: EFFECTS.radius.md,
                background: COLORS.ink[800],
                border: `1px solid ${COLORS.ink[600]}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: EFFECTS.transition.base,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.ink[700];
                e.currentTarget.style.borderColor = COLORS.ink[500];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.ink[800];
                e.currentTarget.style.borderColor = COLORS.ink[600];
              }}
              aria-label="Previous quote"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.ink[300]} strokeWidth="2">
                <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => setActiveIndex(i => (i + 1) % quotes.length)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: EFFECTS.radius.md,
                background: COLORS.ink[800],
                border: `1px solid ${COLORS.ink[600]}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: EFFECTS.transition.base,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.ink[700];
                e.currentTarget.style.borderColor = COLORS.ink[500];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.ink[800];
                e.currentTarget.style.borderColor = COLORS.ink[600];
              }}
              aria-label="Next quote"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.ink[300]} strokeWidth="2">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteCarousel;
