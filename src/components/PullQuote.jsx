/**
 * PullQuote Component - "The Scholarly Disruptor"
 *
 * Editorial magazine aesthetic
 * - Confident serif typography
 * - Dramatic scale
 * - Print-inspired layout
 * - Optional author attribution for 3rd party quotes
 * - Scroll-triggered entrance animation
 */
import React, { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE, LAYOUT } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

const PullQuote = ({ children, quote, author, title, align = 'center' }) => {
  const [ref, inView] = useInView();

  // Support both string children (backwards compat) and quote object
  const quoteText = quote || children;
  const hasAttribution = author && author.length > 0;

  const isCenter = align === 'center';
  const isLeft = align === 'left';

  return (
    <aside
      ref={ref}
      style={{
        marginTop: SPACE[6],
        marginBottom: SPACE[6],
        paddingTop: SPACE[4],
        paddingBottom: SPACE[4],
        paddingLeft: isLeft ? SPACE[6] : 0,
        paddingRight: !isLeft && !isCenter ? SPACE[6] : 0,
        borderLeft: isLeft ? `2px solid ${COLORS.accent.primary}` : 'none',
        borderRight: !isLeft && !isCenter ? `2px solid ${COLORS.accent.primary}` : 'none',
        position: 'relative',
        maxWidth: LAYOUT.maxWidth.prose,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateX(0)' : (isLeft ? 'translateX(-20px)' : 'translateX(20px)'),
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {/* Centered top accent line */}
      {isCenter && (
        <div
          style={{
            width: '48px',
            height: '2px',
            background: COLORS.accent.primary,
            margin: `0 auto ${SPACE[4]}`,
          }}
        />
      )}

      <blockquote style={{ position: 'relative' }}>
        {/* Quote text - dramatic serif */}
        <p
          style={{
            fontFamily: FONTS.display,
            fontSize: TYPE_SCALE.display.md.size,
            fontWeight: TYPE_SCALE.display.md.weight,
            fontStyle: 'italic',
            color: COLORS.ink[800],
            lineHeight: TYPE_SCALE.display.md.lineHeight,
            letterSpacing: TYPE_SCALE.display.md.letterSpacing,
            textAlign: align,
            margin: 0,
          }}
        >
          "{quoteText}"
        </p>

        {/* Attribution */}
        {hasAttribution && (
          <footer
            style={{
              marginTop: SPACE[4],
              textAlign: align,
            }}
          >
            <cite
              style={{
                fontFamily: FONTS.ui,
                fontSize: TYPE_SCALE.ui.md.size,
                fontStyle: 'normal',
                color: COLORS.ink[600],
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCenter ? 'center' : isLeft ? 'flex-start' : 'flex-end',
                gap: SPACE[2],
              }}
            >
              <span
                style={{
                  width: '16px',
                  height: '1px',
                  background: COLORS.ink[300],
                }}
              />
              <span style={{ fontWeight: 600, color: COLORS.ink[700] }}>
                {author}
              </span>
              {title && (
                <>
                  <span style={{ color: COLORS.ink[400] }}>·</span>
                  <span style={{ color: COLORS.ink[500] }}>{title}</span>
                </>
              )}
            </cite>
          </footer>
        )}
      </blockquote>

      {/* Bottom accent line for center alignment (only if no attribution) */}
      {isCenter && !hasAttribution && (
        <div
          style={{
            width: '48px',
            height: '2px',
            background: COLORS.ink[200],
            margin: `${SPACE[4]} auto 0`,
          }}
        />
      )}
    </aside>
  );
};

export default PullQuote;
