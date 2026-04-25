/**
 * CardGrid Component - "The Scholarly Disruptor"
 *
 * Editorial magazine aesthetic with distinct card personalities:
 * - Feature: Bold editorial callouts with dramatic numbering
 * - Profile: Refined requirement cards with vertical rhythm
 * - Topic: Expandable curriculum cards with audience tags
 * - Staggered scroll animations for entrance effects
 */
import React, { useState } from 'react';
import RichText from './RichText';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE, getIcon } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

// =============================================================================
// FEATURE CARD - Bold editorial callouts for strategic pillars
// Large numbers, dramatic typography, asymmetric layout
// =============================================================================
const FeatureCard = ({ card, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const number = String(index + 1).padStart(2, '0');

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        background: COLORS.surface.elevated,
        borderRadius: EFFECTS.radius.lg,
        padding: `${SPACE[8]} ${SPACE[6]} ${SPACE[6]}`,
        border: `1px solid ${isHovered ? COLORS.ink[300] : COLORS.ink[200]}`,
        boxShadow: isHovered ? EFFECTS.shadow.lg : EFFECTS.shadow.md,
        overflow: 'hidden',
        minHeight: '280px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: `all ${EFFECTS.transition.base}`,
      }}
    >
      {/* Large background number */}
      <div
        style={{
          position: 'absolute',
          top: '-0.5rem',
          right: '0.5rem',
          fontFamily: FONTS.display,
          fontSize: '8rem',
          fontWeight: 300,
          lineHeight: 1,
          color: COLORS.ink[100],
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {number}
      </div>

      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '3px',
          background: index === 0
            ? COLORS.accent.primary
            : `linear-gradient(90deg, ${COLORS.ink[300]} 0%, ${COLORS.ink[200]} 100%)`,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <h4
          style={{
            fontFamily: FONTS.headline,
            fontWeight: TYPE_SCALE.headline.md.weight,
            fontSize: TYPE_SCALE.headline.md.size,
            lineHeight: TYPE_SCALE.headline.md.lineHeight,
            letterSpacing: TYPE_SCALE.headline.md.letterSpacing,
            color: COLORS.ink[800],
            marginBottom: SPACE[4],
            maxWidth: '85%',
          }}
        >
          {card.title}
        </h4>

        {/* Description */}
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: TYPE_SCALE.body.sm.size,
            lineHeight: TYPE_SCALE.body.sm.lineHeight,
            color: COLORS.ink[500],
            margin: 0,
            marginTop: 'auto',
          }}
        >
          <RichText>{card.content}</RichText>
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// PROFILE CARD - Refined requirement cards (expandable when has expandedContent)
// Aligned with TopicCard design: consistent expand button, structure, and styling
// =============================================================================
const ProfileCard = ({ card, index, isExpanded, onToggle, hasExpandedContent }) => {
  const [isHovered, setIsHovered] = useState(false);
  const canExpand = hasExpandedContent && card.expandedContent;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: COLORS.surface.elevated,
        borderRadius: EFFECTS.radius.md,
        border: `1px solid ${isExpanded ? COLORS.accent.primary : (isHovered ? COLORS.ink[300] : COLORS.ink[200])}`,
        overflow: 'hidden',
        boxShadow: isExpanded || isHovered ? EFFECTS.shadow.md : EFFECTS.shadow.sm,
        transform: isHovered && !isExpanded ? 'translateY(-1px)' : 'translateY(0)',
        transition: `all ${EFFECTS.transition.base}`,
      }}
    >
      {/* Header button - aligned with TopicCard */}
      <button
        onClick={canExpand ? onToggle : undefined}
        style={{
          width: '100%',
          padding: SPACE[5],
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[4],
          textAlign: 'left',
          background: isExpanded ? COLORS.accent.wash : 'transparent',
          border: 'none',
          cursor: canExpand ? 'pointer' : 'default',
          transition: EFFECTS.transition.base,
        }}
      >
        {/* Index number - matching TopicCard */}
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE_SCALE.mono.sm.size,
            fontWeight: 600,
            color: isExpanded ? COLORS.accent.primary : COLORS.ink[300],
            width: '24px',
            flexShrink: 0,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Icon */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: EFFECTS.radius.md,
            background: isExpanded ? COLORS.accent.primary : COLORS.surface.inset,
            border: `1px solid ${isExpanded ? COLORS.accent.primary : COLORS.ink[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: EFFECTS.transition.base,
          }}
        >
          {getIcon(card.icon, isExpanded ? '#FFFFFF' : COLORS.ink[500])}
        </div>

        {/* Title and summary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontFamily: FONTS.ui,
              fontWeight: 600,
              fontSize: TYPE_SCALE.ui.md.size,
              color: COLORS.ink[800],
              margin: 0,
              marginBottom: SPACE[1],
            }}
          >
            {card.title}
          </h4>
          <p
            style={{
              fontFamily: FONTS.body,
              fontSize: TYPE_SCALE.body.sm.size,
              lineHeight: TYPE_SCALE.body.sm.lineHeight,
              color: COLORS.ink[500],
              margin: 0,
            }}
          >
            <RichText>{card.content}</RichText>
          </p>
        </div>

        {/* Expand indicator - matching TopicCard */}
        {canExpand && (
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: EFFECTS.radius.full,
              background: isExpanded ? COLORS.accent.primary : COLORS.surface.inset,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: EFFECTS.transition.base,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isExpanded ? '#FFFFFF' : COLORS.ink[400]}
              strokeWidth="2"
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: EFFECTS.transition.base,
              }}
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </button>

      {/* Expanded content with smooth animation */}
      {canExpand && (
        <div
          style={{
            maxHeight: isExpanded ? '600px' : '0px',
            opacity: isExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: `max-height ${EFFECTS.transition.expand}, opacity ${EFFECTS.transition.base}`,
          }}
        >
          <div
            style={{
              padding: SPACE[5],
              paddingTop: SPACE[4],
              borderTop: `1px solid ${COLORS.ink[100]}`,
              background: COLORS.surface.paper,
            }}
          >
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: TYPE_SCALE.body.md.size,
                lineHeight: TYPE_SCALE.body.md.lineHeight,
                color: COLORS.ink[700],
                margin: 0,
              }}
            >
              <RichText>{card.expandedContent}</RichText>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// TOPIC CARD CONTENT PARSER
// Parses structured curriculum content into visual sections
// =============================================================================
const parseTopicContent = (content) => {
  if (!content) return { intro: '', teachings: [], technologies: '' };

  // Split content by the main sections
  const parts = {
    intro: '',
    teachings: [],
    technologies: '',
  };

  // Find "What I Teach:" or "What John Teaches:" section
  const teachMatch = content.match(/\*\*What (?:I|John) Teach(?:es)?:\*\*\s*([\s\S]*?)(?=\*\*Technologies:\*\*|$)/i);
  const techMatch = content.match(/\*\*Technologies:\*\*\s*([\s\S]*?)$/i);

  // Everything before "What I Teach" is intro
  const introEnd = content.search(/\*\*What (?:I|John) Teach/i);
  if (introEnd > 0) {
    parts.intro = content.substring(0, introEnd).trim();
  } else if (!teachMatch && !techMatch) {
    parts.intro = content;
  }

  // Parse teachings - handle both bullet points (•) and inline format
  if (teachMatch) {
    const teachContent = teachMatch[1].trim();
    // Check if it has bullet points
    if (teachContent.includes('•')) {
      parts.teachings = teachContent.split('•')
        .map(t => t.trim())
        .filter(t => t.length > 0);
    } else {
      // Single paragraph teaching description
      parts.teachings = [teachContent];
    }
  }

  // Parse technologies
  if (techMatch) {
    parts.technologies = techMatch[1].trim();
  }

  return parts;
};

// =============================================================================
// TOPIC CARD - Curriculum catalog with audience tags
// Expandable, tagged, informative
// =============================================================================
const TopicCard = ({ card, index, isExpanded, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const parsedContent = parseTopicContent(card.expandedContent || card.content);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: COLORS.surface.elevated,
        borderRadius: EFFECTS.radius.md,
        border: `1px solid ${isExpanded ? COLORS.accent.primary : (isHovered ? COLORS.ink[300] : COLORS.ink[200])}`,
        overflow: 'hidden',
        boxShadow: isExpanded || isHovered ? EFFECTS.shadow.md : EFFECTS.shadow.sm,
        transform: isHovered && !isExpanded ? 'translateY(-1px)' : 'translateY(0)',
        transition: `all ${EFFECTS.transition.base}`,
      }}
    >
      {/* Header button */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: SPACE[5],
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[4],
          textAlign: 'left',
          background: isExpanded ? COLORS.accent.wash : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: EFFECTS.transition.base,
        }}
      >
        {/* Index number */}
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE_SCALE.mono.sm.size,
            fontWeight: 600,
            color: isExpanded ? COLORS.accent.primary : COLORS.ink[300],
            width: '24px',
            flexShrink: 0,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Icon */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: EFFECTS.radius.md,
            background: isExpanded ? COLORS.accent.primary : COLORS.surface.inset,
            border: `1px solid ${isExpanded ? COLORS.accent.primary : COLORS.ink[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: EFFECTS.transition.base,
          }}
        >
          {getIcon(card.icon, isExpanded ? '#FFFFFF' : COLORS.ink[500])}
        </div>

        {/* Title and audience */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontFamily: FONTS.ui,
              fontWeight: 600,
              fontSize: TYPE_SCALE.ui.md.size,
              color: COLORS.ink[800],
              margin: 0,
              marginBottom: card.audience ? SPACE[1] : 0,
            }}
          >
            {card.title}
          </h4>
          {card.audience && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: TYPE_SCALE.mono.sm.size,
                color: COLORS.ink[400],
                letterSpacing: '0.02em',
              }}
            >
              {card.audience}
            </span>
          )}
        </div>

        {/* Expand indicator */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: EFFECTS.radius.full,
            background: isExpanded ? COLORS.accent.primary : COLORS.surface.inset,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: EFFECTS.transition.base,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isExpanded ? '#FFFFFF' : COLORS.ink[400]}
            strokeWidth="2"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: EFFECTS.transition.base,
            }}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Expanded content with smooth animation */}
      <div
        style={{
          maxHeight: isExpanded ? '1200px' : '0px',
          opacity: isExpanded ? 1 : 0,
          overflow: 'hidden',
          transition: `max-height ${EFFECTS.transition.expand}, opacity ${EFFECTS.transition.base}`,
        }}
      >
        <div
          style={{
            padding: SPACE[5],
            paddingTop: SPACE[4],
            borderTop: `1px solid ${COLORS.ink[100]}`,
            background: COLORS.surface.paper,
          }}
        >
          {/* Introduction paragraph */}
          {parsedContent.intro && (
            <p
              style={{
                fontFamily: FONTS.body,
                fontSize: TYPE_SCALE.body.md.size,
                lineHeight: TYPE_SCALE.body.md.lineHeight,
                color: COLORS.ink[700],
                margin: 0,
                marginBottom: (parsedContent.teachings.length > 0 || parsedContent.technologies) ? SPACE[5] : 0,
              }}
            >
              <RichText>{parsedContent.intro}</RichText>
            </p>
          )}

          {/* What I Teach section */}
          {parsedContent.teachings.length > 0 && (
            <div
              style={{
                background: COLORS.surface.elevated,
                borderRadius: EFFECTS.radius.md,
                border: `1px solid ${COLORS.ink[200]}`,
                padding: SPACE[4],
                marginBottom: parsedContent.technologies ? SPACE[4] : 0,
              }}
            >
              <h5
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.sm.size,
                  fontWeight: 600,
                  color: COLORS.accent.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0,
                  marginBottom: SPACE[3],
                  display: 'flex',
                  alignItems: 'center',
                  gap: SPACE[2],
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent.primary} strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                What I Teach
              </h5>
              {parsedContent.teachings.length === 1 ? (
                <p
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: TYPE_SCALE.body.sm.size,
                    lineHeight: TYPE_SCALE.body.sm.lineHeight,
                    color: COLORS.ink[600],
                    margin: 0,
                  }}
                >
                  <RichText>{parsedContent.teachings[0]}</RichText>
                </p>
              ) : (
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: SPACE[2],
                  }}
                >
                  {parsedContent.teachings.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: FONTS.body,
                        fontSize: TYPE_SCALE.body.sm.size,
                        lineHeight: TYPE_SCALE.body.sm.lineHeight,
                        color: COLORS.ink[600],
                        paddingLeft: SPACE[4],
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '0.5em',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: COLORS.accent.light,
                        }}
                      />
                      <RichText>{item}</RichText>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Technologies section */}
          {parsedContent.technologies && (
            <div
              style={{
                background: COLORS.ink[50],
                borderRadius: EFFECTS.radius.md,
                padding: SPACE[3],
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: SPACE[2],
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: TYPE_SCALE.mono.sm.size,
                  fontWeight: 600,
                  color: COLORS.ink[500],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginRight: SPACE[2],
                }}
              >
                Tech Stack:
              </span>
              {parsedContent.technologies.split(',').map((tech, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: TYPE_SCALE.mono.sm.size,
                    color: COLORS.ink[600],
                    background: COLORS.surface.elevated,
                    border: `1px solid ${COLORS.ink[200]}`,
                    borderRadius: EFFECTS.radius.sm,
                    padding: `${SPACE[1]} ${SPACE[2]}`,
                  }}
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// ANIMATED CARD WRAPPER
// =============================================================================
const AnimatedCard = ({ children, index, inView }) => (
  <div
    style={{
      height: '100%',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`,
    }}
  >
    {children}
  </div>
);

// =============================================================================
// MAIN CARD GRID
// =============================================================================
const CardGrid = ({ type = 'profile', columns = 3, cards }) => {
  const [expandedIndex, setExpandedIndex] = React.useState(0); // First expanded by default
  const [profileExpandedIndex, setProfileExpandedIndex] = React.useState(null);
  const [gridRef, inView] = useInView();

  if (!cards || cards.length === 0) return null;

  // Check if any profile cards have expanded content
  const hasExpandableProfiles = type === 'profile' && cards.some(c => c.expandedContent);

  // Grid configuration based on card type
  // Feature cards use a class for responsive behavior
  const gridConfig = {
    feature: {
      className: 'feature-card-grid',
      gap: SPACE[5],
    },
    profile: {
      // Single column for expandable profiles (like topic cards)
      gridTemplateColumns: hasExpandableProfiles ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: hasExpandableProfiles ? SPACE[3] : SPACE[4],
    },
    topic: {
      gridTemplateColumns: '1fr',
      gap: SPACE[3],
    },
  };

  const config = gridConfig[type] || gridConfig.profile;

  return (
    <div ref={gridRef} style={{ marginTop: SPACE[6], marginBottom: SPACE[6] }}>
      {/* Section label for topic cards */}
      {type === 'topic' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[3],
            marginBottom: SPACE[5],
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
            {cards.length} Cards
          </span>
        </div>
      )}

      {/* Section label for expandable profile cards - matching topic card style */}
      {hasExpandableProfiles && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[3],
            marginBottom: SPACE[5],
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
            {cards.length} Highlights
          </span>
        </div>
      )}

      {/* Responsive CSS for feature cards */}
      {type === 'feature' && (
        <style>{`
          .feature-card-grid {
            display: grid;
            grid-template-columns: repeat(${columns <= 2 ? 2 : 3}, 1fr);
          }
          @media (max-width: 900px) {
            .feature-card-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 600px) {
            .feature-card-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      )}

      <div
        className={config.className || ''}
        style={{
          display: 'grid',
          gridTemplateColumns: config.gridTemplateColumns,
          gap: config.gap,
          alignItems: hasExpandableProfiles ? 'start' : undefined,
        }}
      >
        {cards.map((card, i) => {
          switch (type) {
            case 'feature':
              return (
                <AnimatedCard key={i} index={i} inView={inView}>
                  <FeatureCard card={card} index={i} />
                </AnimatedCard>
              );
            case 'topic':
              return (
                <AnimatedCard key={i} index={i} inView={inView}>
                  <TopicCard
                    card={card}
                    index={i}
                    isExpanded={expandedIndex === i}
                    onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  />
                </AnimatedCard>
              );
            case 'profile':
            default:
              return (
                <AnimatedCard key={i} index={i} inView={inView}>
                  <ProfileCard
                    card={card}
                    index={i}
                    isExpanded={profileExpandedIndex === i}
                    onToggle={() => setProfileExpandedIndex(profileExpandedIndex === i ? null : i)}
                    hasExpandedContent={hasExpandableProfiles}
                  />
                </AnimatedCard>
              );
          }
        })}
      </div>
    </div>
  );
};

export default CardGrid;
export { ProfileCard, FeatureCard, TopicCard };
