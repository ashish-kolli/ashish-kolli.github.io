/**
 * Testimonials Component - "The Scholarly Disruptor"
 *
 * Editorial magazine aesthetic
 * - Clean card layouts
 * - Confident typography
 * - Restrained visual hierarchy
 */
import React from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE } from '../design-tokens';

// Leadership testimonials - larger, more prominent
const LeadershipTestimonials = ({ testimonials }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[5], marginTop: SPACE[8], marginBottom: SPACE[8] }}>
    {testimonials.map((t, i) => (
      <div
        key={i}
        style={{
          background: COLORS.surface.elevated,
          borderRadius: EFFECTS.radius.lg,
          border: `1px solid ${COLORS.ink[100]}`,
          padding: SPACE[7],
          boxShadow: EFFECTS.shadow.sm,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACE[5] }}>
          {/* Initial avatar */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: EFFECTS.radius.full,
              background: COLORS.accent.wash,
              border: `1px solid ${COLORS.accent.glow}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.accent.primary,
              fontFamily: FONTS.display,
              fontWeight: 600,
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            {t.author?.charAt(0) || '?'}
          </div>

          <div style={{ flex: 1 }}>
            {/* Quote */}
            <blockquote
              style={{
                fontFamily: FONTS.body,
                fontSize: TYPE_SCALE.body.md.size,
                color: COLORS.ink[500],
                lineHeight: TYPE_SCALE.body.md.lineHeight,
                marginBottom: SPACE[4],
                fontStyle: 'italic',
              }}
            >
              "{t.content}"
            </blockquote>

            {/* Attribution */}
            <div>
              <p
                style={{
                  fontFamily: FONTS.ui,
                  fontWeight: 600,
                  fontSize: TYPE_SCALE.ui.md.size,
                  color: COLORS.ink[700],
                  marginBottom: SPACE[1],
                }}
              >
                {t.author}
              </p>
              <p
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.sm.size,
                  color: COLORS.ink[400],
                }}
              >
                {t.title}
              </p>
              {t.subtitle && (
                <p
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: TYPE_SCALE.mono.sm.size,
                    color: COLORS.accent.muted,
                    marginTop: SPACE[1],
                  }}
                >
                  {t.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Teaching testimonials - medium size, professional
const TeachingTestimonials = ({ testimonials }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: SPACE[5],
      marginTop: SPACE[8],
      marginBottom: SPACE[8],
    }}
  >
    {testimonials.map((t, i) => (
      <div
        key={i}
        style={{
          background: i % 2 === 0 ? COLORS.surface.elevated : COLORS.surface.inset,
          borderRadius: EFFECTS.radius.lg,
          border: `1px solid ${COLORS.ink[100]}`,
          padding: SPACE[6],
        }}
      >
        {/* Quote */}
        <blockquote
          style={{
            fontFamily: FONTS.body,
            fontSize: TYPE_SCALE.body.sm.size,
            color: COLORS.ink[500],
            lineHeight: TYPE_SCALE.body.sm.lineHeight,
            marginBottom: SPACE[5],
            fontStyle: 'italic',
          }}
        >
          "{t.content}"
        </blockquote>

        {/* Attribution */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: EFFECTS.radius.md,
              background: COLORS.accent.wash,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.accent.primary,
              fontFamily: FONTS.ui,
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {t.author?.charAt(0) || '?'}
          </div>
          <div>
            <p
              style={{
                fontFamily: FONTS.ui,
                fontWeight: 600,
                fontSize: TYPE_SCALE.ui.sm.size,
                color: COLORS.ink[700],
              }}
            >
              {t.author}
            </p>
            <p
              style={{
                fontFamily: FONTS.mono,
                fontSize: TYPE_SCALE.mono.sm.size,
                color: COLORS.ink[400],
              }}
            >
              {t.title}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Student testimonials - compact, grid layout with enhanced card styling
const StudentTestimonials = ({ testimonials, source }) => (
  <div
    style={{
      marginTop: SPACE[8],
      marginBottom: SPACE[8],
      background: COLORS.surface.inset,
      borderRadius: EFFECTS.radius.lg,
      padding: SPACE[7],
      border: `1px solid ${COLORS.ink[100]}`,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Subtle gradient accent at top */}
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${COLORS.accent.primary}40 0%, ${COLORS.accent.muted}40 50%, transparent 100%)`,
      }}
    />

    {source && (
      <h4
        style={{
          textAlign: 'center',
          fontFamily: FONTS.mono,
          fontSize: TYPE_SCALE.mono.sm.size,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: COLORS.ink[400],
          marginBottom: SPACE[6],
        }}
      >
        Student Feedback — {source}
      </h4>
    )}

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: SPACE[5],
      }}
    >
      {testimonials.map((t, i) => (
        <div
          key={i}
          style={{
            background: COLORS.surface.elevated,
            borderRadius: EFFECTS.radius.lg,
            padding: SPACE[6],
            border: `1px solid ${COLORS.ink[150] || COLORS.ink[100]}`,
            boxShadow: EFFECTS.shadow.sm,
            position: 'relative',
            transition: 'all 0.2s ease',
          }}
        >
          {/* Purple accent line at top of each card */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: SPACE[4],
              width: '24px',
              height: '3px',
              background: COLORS.accent.primary,
              borderRadius: '0 0 2px 2px',
            }}
          />

          {/* Em dash quote indicator */}
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: '1rem',
              color: COLORS.accent.primary,
              marginBottom: SPACE[3],
              marginTop: SPACE[2],
            }}
          >
            —
          </div>

          <blockquote
            style={{
              fontFamily: FONTS.body,
              fontSize: TYPE_SCALE.body.sm.size,
              color: COLORS.ink[500],
              lineHeight: TYPE_SCALE.body.sm.lineHeight,
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            "{t.content}"
          </blockquote>
        </div>
      ))}
    </div>
  </div>
);

// Main Testimonials component
const Testimonials = ({ type = 'leadership', testimonials, source }) => {
  if (!testimonials || testimonials.length === 0) return null;

  switch (type) {
    case 'teaching':
      return <TeachingTestimonials testimonials={testimonials} />;
    case 'students':
      return <StudentTestimonials testimonials={testimonials} source={source} />;
    case 'leadership':
    default:
      return <LeadershipTestimonials testimonials={testimonials} />;
  }
};

export default Testimonials;
export { LeadershipTestimonials, TeachingTestimonials, StudentTestimonials };
