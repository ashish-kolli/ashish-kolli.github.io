/**
 * WorkList Component - "The Scholarly Disruptor"
 *
 * Technical portfolio showcase for hands-on work items
 * - Bold icon treatments with accent containers
 * - Editorial number badges
 * - Hover states with depth reveal
 * - Staggered scroll animations
 */
import React, { useState } from 'react';
import RichText from './RichText';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE, getIcon } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

// =============================================================================
// WORK ITEM - Individual portfolio entry
// =============================================================================
const WorkItem = ({ item, index, inView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const number = String(index + 1).padStart(2, '0');
  const animationDelay = index * 0.08;

  // Determine accent treatment - first item is "hero" style
  const isHero = index === 0;

  return (
    <div
      className={isHero ? 'work-item-hero' : 'work-item'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        gap: SPACE[4],
        padding: isHero ? SPACE[5] : `${SPACE[4]} ${SPACE[4]} ${SPACE[4]} 0`,
        background: isHero
          ? COLORS.ink[900]
          : (isHovered ? COLORS.surface.elevated : 'transparent'),
        borderRadius: isHero ? EFFECTS.radius.lg : EFFECTS.radius.md,
        border: isHero ? 'none' : `1px solid ${isHovered ? COLORS.ink[200] : 'transparent'}`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transform: isHovered && !isHero ? 'translateX(4px)' : 'translateX(0)',
        boxShadow: isHero ? EFFECTS.shadow.xl : (isHovered ? EFFECTS.shadow.sm : 'none'),
        transition: `all ${EFFECTS.transition.base}`,
        // Scroll animation
        opacity: inView ? 1 : 0,
        ...(inView ? {} : { transform: 'translateY(20px)' }),
        transitionDelay: `${animationDelay}s`,
      }}
    >
      {/* Hero accent line */}
      {isHero && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${COLORS.accent.primary} 0%, ${COLORS.accent.light} 50%, transparent 100%)`,
          }}
        />
      )}

      {/* Number badge - positioned absolutely for hero */}
      <div
        className="work-item-number-col"
        style={{
          position: isHero ? 'absolute' : 'relative',
          top: isHero ? SPACE[3] : 0,
          right: isHero ? SPACE[3] : 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: SPACE[1],
        }}
      >
        {/* Number */}
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: isHero ? TYPE_SCALE.mono.sm.size : '0.625rem',
            fontWeight: 600,
            color: isHero ? COLORS.accent.light : COLORS.ink[300],
            letterSpacing: '0.05em',
          }}
        >
          {number}
        </span>

        {/* Icon container - only for non-hero */}
        {!isHero && (
          <div
            className="work-item-icon"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: EFFECTS.radius.md,
              background: isHovered
                ? `linear-gradient(135deg, ${COLORS.accent.wash} 0%, ${COLORS.surface.elevated} 100%)`
                : COLORS.surface.inset,
              border: `1px solid ${isHovered ? COLORS.accent.primary + '40' : COLORS.ink[200]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: EFFECTS.transition.base,
              boxShadow: isHovered ? `0 0 16px ${COLORS.accent.primary}20` : 'none',
            }}
          >
            {getIcon(item.icon, isHovered ? COLORS.accent.primary : COLORS.ink[500])}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero layout - icon inline with title */}
        {isHero && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACE[4],
              marginBottom: SPACE[4],
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: EFFECTS.radius.lg,
                background: `linear-gradient(135deg, ${COLORS.accent.primary} 0%, ${COLORS.accent.light} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 16px ${COLORS.accent.primary}50`,
              }}
            >
              {getIcon(item.icon, '#FFFFFF')}
            </div>
            <h4
              style={{
                fontFamily: FONTS.headline,
                fontSize: TYPE_SCALE.headline.md.size,
                fontWeight: TYPE_SCALE.headline.md.weight,
                lineHeight: TYPE_SCALE.headline.md.lineHeight,
                color: '#FFFFFF',
                margin: 0,
                flex: 1,
              }}
            >
              {item.title}
            </h4>
          </div>
        )}

        {/* Non-hero title */}
        {!isHero && (
          <h4
            style={{
              fontFamily: FONTS.ui,
              fontSize: TYPE_SCALE.ui.lg.size,
              fontWeight: 600,
              lineHeight: 1.3,
              color: COLORS.ink[800],
              margin: 0,
              marginBottom: SPACE[2],
              transition: EFFECTS.transition.base,
              ...(isHovered ? { color: COLORS.ink[900] } : {}),
            }}
          >
            {item.title}
          </h4>
        )}

        {/* Description */}
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: TYPE_SCALE.body.sm.size,
            lineHeight: TYPE_SCALE.body.sm.lineHeight,
            color: isHero ? 'rgba(255,255,255,0.75)' : COLORS.ink[500],
            margin: 0,
            maxWidth: '65ch',
          }}
        >
          <RichText>{item.description}</RichText>
        </p>

        {/* Technologies badge row - if present */}
        {item.technologies && item.technologies.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: SPACE[2],
              marginTop: SPACE[3],
            }}
          >
            {item.technologies.map((tech, i) => (
              <span
                key={i}
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  color: isHero ? 'rgba(255,255,255,0.6)' : COLORS.ink[400],
                  background: isHero ? 'rgba(255,255,255,0.1)' : COLORS.surface.inset,
                  border: `1px solid ${isHero ? 'rgba(255,255,255,0.15)' : COLORS.ink[200]}`,
                  borderRadius: EFFECTS.radius.sm,
                  padding: `${SPACE[1]} ${SPACE[2]}`,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover accent bar for non-hero items */}
      {!isHero && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: isHovered ? '60%' : '0%',
            background: COLORS.accent.primary,
            borderRadius: EFFECTS.radius.full,
            transition: `height ${EFFECTS.transition.base}`,
          }}
        />
      )}
    </div>
  );
};

// =============================================================================
// WORK LIST - Portfolio showcase grid
// =============================================================================
const WorkList = ({ items }) => {
  // Use lower threshold for tall component - trigger when just top edge is visible
  const [ref, inView] = useInView({ threshold: 0.05, rootMargin: '0px' });

  if (!items || items.length === 0) return null;

  return (
    <div
      ref={ref}
      style={{
        marginTop: SPACE[6],
        marginBottom: SPACE[6],
      }}
    >
      {/* Responsive styles for work items */}
      <style>{`
        .work-item {
          display: grid;
          grid-template-columns: 56px 1fr;
        }
        .work-item-hero {
          display: grid;
          grid-template-columns: 1fr;
        }
        @media (max-width: 600px) {
          .work-item,
          .work-item-hero {
            grid-template-columns: 1fr !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .work-item-number-col {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 10px !important;
            margin-bottom: 8px !important;
          }
          .work-item-number-col .work-item-icon {
            width: 36px !important;
            height: 36px !important;
          }
        }
      `}</style>
      {/* Section label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[3],
          marginBottom: SPACE[5],
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '3px',
            background: COLORS.accent.primary,
            borderRadius: EFFECTS.radius.full,
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
          Active Work
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            background: `linear-gradient(90deg, ${COLORS.ink[200]} 0%, transparent 100%)`,
            maxWidth: '120px',
          }}
        />
      </div>

      {/* Work items list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[2],
        }}
      >
        {items.map((item, i) => (
          <WorkItem key={i} item={item} index={i} inView={inView} />
        ))}
      </div>

      {/* Bottom flourish */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: SPACE[6],
          opacity: inView ? 1 : 0,
          transition: 'opacity 0.5s ease-out 0.5s',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[3],
          }}
        >
          <div
            style={{
              width: '24px',
              height: '1px',
              background: `linear-gradient(90deg, transparent 0%, ${COLORS.ink[300]} 100%)`,
            }}
          />
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '1px',
              background: COLORS.accent.primary,
              transform: 'rotate(45deg)',
            }}
          />
          <div
            style={{
              width: '24px',
              height: '1px',
              background: `linear-gradient(90deg, ${COLORS.ink[300]} 0%, transparent 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkList;
