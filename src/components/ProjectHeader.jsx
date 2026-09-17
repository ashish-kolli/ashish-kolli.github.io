/**
 * ProjectHeader Component
 *
 * Compact hero for a project page, driven by the page's <!-- @page --> marker.
 * - Top bar matches the home page Header: AK mark links home, plus a back link
 * - Eyebrow, project title (same Helvetica caps as the home page name), summary, meta line
 */
import React, { useEffect, useState } from 'react';
import RichText from './RichText';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, LAYOUT, SPACE } from '../design-tokens';

const ProjectHeader = ({ page }) => {
  const [loaded, setLoaded] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const reveal = (delay) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(12px)',
    transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
  });

  return (
    <header style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background at zIndex -2 so the CursorSpotlight (zIndex -1) draws above it */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -2,
          background: 'linear-gradient(170deg, #f8f9fc 0%, #eef1f8 45%, #f5f7fa 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-5%',
          width: '55%',
          height: '120%',
          zIndex: -2,
          background: 'radial-gradient(ellipse at center, #6366f120 0%, #8b5cf615 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top navigation bar */}
      <nav style={{ padding: '1.5rem 0', borderBottom: `1px solid ${COLORS.ink[200]}` }}>
        <div
          style={{
            maxWidth: LAYOUT.maxWidth.wide,
            margin: '0 auto',
            padding: `0 ${LAYOUT.margin}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: SPACE[4],
          }}
        >
          <a href="./" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: COLORS.accent.primary,
                borderRadius: EFFECTS.radius.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: EFFECTS.shadow.md,
              }}
            >
              <span style={{ color: 'white', fontFamily: FONTS.display, fontSize: '1.25rem', fontWeight: 500 }}>
                AK
              </span>
            </div>
            <div>
              <span
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.sm.size,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: COLORS.ink[700],
                  display: 'block',
                }}
              >
                Ashish Kolli
              </span>
              <span
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.xs.size,
                  letterSpacing: '0.05em',
                  color: COLORS.ink[400],
                  textTransform: 'uppercase',
                }}
              >
                Portfolio
              </span>
            </div>
          </a>

          <a
            href={page.backHref}
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACE[2],
              padding: '0.5rem 1rem',
              background: COLORS.surface.elevated,
              borderRadius: EFFECTS.radius.full,
              border: `1px solid ${backHovered ? COLORS.accent.primary : COLORS.ink[200]}`,
              boxShadow: EFFECTS.shadow.sm,
              fontFamily: FONTS.mono,
              fontSize: TYPE_SCALE.mono.sm.size,
              color: backHovered ? COLORS.accent.primary : COLORS.ink[600],
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: `all ${EFFECTS.transition.fast}`,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: backHovered ? 'translateX(-3px)' : 'translateX(0)',
                transition: `transform ${EFFECTS.transition.base}`,
              }}
            >
              ←
            </span>
            {page.back || 'Back'}
          </a>
        </div>
      </nav>

      {/* Title block */}
      <div
        style={{
          maxWidth: LAYOUT.maxWidth.content,
          margin: '0 auto',
          padding: `${SPACE[10]} ${LAYOUT.margin} ${SPACE[9]}`,
        }}
      >
        {page.eyebrow && (
          <div
            style={{
              ...reveal(0.05),
              fontFamily: FONTS.mono,
              fontSize: TYPE_SCALE.ui.xs.size,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: COLORS.accent.primary,
              marginBottom: SPACE[4],
            }}
          >
            {page.eyebrow}
          </div>
        )}
        <h1
          style={{
            ...reveal(0.12),
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: COLORS.ink[900],
            margin: 0,
            marginBottom: SPACE[6],
          }}
        >
          {page.title}
        </h1>
        {page.summary && (
          <p
            style={{
              ...reveal(0.2),
              maxWidth: LAYOUT.maxWidth.prose,
              fontFamily: FONTS.body,
              fontSize: TYPE_SCALE.body.lg.size,
              lineHeight: TYPE_SCALE.body.lg.lineHeight,
              color: COLORS.ink[600],
              margin: 0,
            }}
          >
            <RichText>{page.summary}</RichText>
          </p>
        )}
        {page.meta && (
          <div
            style={{
              ...reveal(0.28),
              display: 'flex',
              flexWrap: 'wrap',
              gap: `${SPACE[2]} ${SPACE[5]}`,
              marginTop: SPACE[6],
              fontFamily: FONTS.mono,
              fontSize: TYPE_SCALE.mono.sm.size,
              color: COLORS.ink[500],
            }}
          >
            {page.meta.split('·').map((item) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: SPACE[2] }}>
                <span
                  style={{ width: '6px', height: '6px', borderRadius: EFFECTS.radius.full, background: COLORS.accent.primary }}
                />
                {item.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default ProjectHeader;
