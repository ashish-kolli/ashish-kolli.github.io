/**
 * ProjectCards Component
 *
 * Summary cards on the home page, each linking to a project's own page.
 *
 * Three layouts, chosen per section by the @projects marker:
 * - layout="row" (default): one horizontal row; more cards than fit scroll sideways
 *   (swipe, trackpad, or the arrow buttons), with the overflowing edge fading out
 * - layout="grid": cards wrap into `rows` rows instead of scrolling, dropping to
 *   3 columns on narrow desktops and a single column on mobile
 * - layout="stack": one card per row, margin to margin, each laid out left to right
 *   (icon and title, summary, then meta and the link cue); stacks on mobile
 *
 * Cards fade up in sequence when they scroll into view.
 */
import React, { useState, useEffect, useRef } from 'react';
import RichText from './RichText';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE, LAYOUT, getIcon } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

const PROJECT_CARD_WIDTH = 300;  // px - cards grow to fill short rows, never shrink below this
const PROJECT_CARD_MAX = 440;    // px - keeps two-card rows from stretching too wide
const PROJECT_ROW_GAP = 20;      // px
const PROJECT_ROW_BLEED = 12;    // px - room inside the scroll area so hover shadows aren't clipped

const injectProjectCardStyles = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      .project-row { scrollbar-width: none; }
      .project-row::-webkit-scrollbar { display: none; }
      .project-card:focus-visible { outline: 2px solid ${COLORS.accent.light}; outline-offset: 3px; }
      .project-row-arrows { display: none; }
      @media (hover: hover) and (pointer: fine) {
        .project-row-arrows { display: flex; }
      }
      .project-grid {
        display: grid;
        gap: ${PROJECT_ROW_GAP}px;
        grid-template-columns: repeat(var(--project-columns, 3), minmax(0, 1fr));
      }
      @media (max-width: 1080px) {
        .project-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }
      @media (max-width: 768px) {
        .project-grid { grid-template-columns: minmax(0, 1fr); }
      }
      .project-stack { display: grid; gap: ${PROJECT_ROW_GAP}px; }
      /* Full-width card: title block, summary, meta */
      .project-stack-card {
        display: grid;
        grid-template-columns: minmax(180px, 24%) 1fr auto;
        align-items: center;
        gap: ${SPACE[6]};
        padding: ${SPACE[5]} ${SPACE[6]};
      }
      @media (max-width: 860px) {
        .project-stack-card { grid-template-columns: 1fr; gap: ${SPACE[4]}; align-items: start; }
        .project-stack-card .project-stack-meta { justify-content: flex-start; }
      }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();

const ProjectCard = ({ project, index, inView, layout }) => {
  const [isHovered, setIsHovered] = useState(false);
  const stacked = layout === 'stack';

  return (
    <a
      href={project.href}
      className={stacked ? 'project-card project-stack-card' : 'project-card'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // In a grid or stack the container sizes the card; in a row it sets its own width
        ...(layout === 'row' ? {
          flex: `1 0 ${PROJECT_CARD_WIDTH}px`,
          maxWidth: `${PROJECT_CARD_MAX}px`,
          scrollSnapAlign: 'start',
        } : {}),
        ...(stacked ? {} : {
          display: 'flex',
          flexDirection: 'column',
          gap: SPACE[4],
          padding: SPACE[6],
        }),
        background: COLORS.surface.elevated,
        border: `1px solid ${isHovered ? COLORS.accent.primary : COLORS.ink[200]}`,
        borderRadius: EFFECTS.radius.lg,
        boxShadow: isHovered ? EFFECTS.shadow.lg : EFFECTS.shadow.sm,
        textDecoration: 'none',
        color: 'inherit',
        opacity: inView ? 1 : 0,
        transform: inView ? `translateY(${isHovered ? -4 : 0}px)` : 'translateY(16px)',
        transition: `opacity 0.5s ease-out ${inView && !isHovered ? index * 0.08 : 0}s, transform ${EFFECTS.transition.base}, border-color ${EFFECTS.transition.base}, box-shadow ${EFFECTS.transition.base}`,
      }}
    >
      {/* Icon + eyebrow, with the title alongside when stacked */}
      <div style={{ display: 'flex', alignItems: 'center', gap: SPACE[3] }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            flexShrink: 0,
            borderRadius: EFFECTS.radius.md,
            background: isHovered ? COLORS.accent.primary : COLORS.surface.inset,
            border: `1px solid ${isHovered ? COLORS.accent.primary : COLORS.ink[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: EFFECTS.transition.base,
          }}
        >
          {getIcon(project.icon, isHovered ? '#FFFFFF' : COLORS.ink[500])}
        </div>
        <div style={{ minWidth: 0 }}>
          {project.eyebrow && (
            <span
              style={{
                display: 'block',
                fontFamily: FONTS.mono,
                fontSize: TYPE_SCALE.ui.xs.size,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: COLORS.accent.primary,
              }}
            >
              {project.eyebrow}
            </span>
          )}
          {stacked && (
            <h3
              style={{
                fontFamily: FONTS.ui,
                fontSize: TYPE_SCALE.headline.sm.size,
                fontWeight: 600,
                lineHeight: 1.25,
                color: COLORS.ink[800],
                margin: `${SPACE[1]} 0 0`,
              }}
            >
              {project.title}
            </h3>
          )}
        </div>
      </div>

      {/* Title (tiles only) + summary */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!stacked && (
          <h3
            style={{
              fontFamily: FONTS.ui,
              fontSize: TYPE_SCALE.headline.sm.size,
              fontWeight: 600,
              lineHeight: 1.25,
              color: COLORS.ink[800],
              margin: 0,
              marginBottom: SPACE[2],
            }}
          >
            {project.title}
          </h3>
        )}
        <p
          style={{
            fontFamily: FONTS.body,
            fontSize: TYPE_SCALE.body.sm.size,
            lineHeight: TYPE_SCALE.body.sm.lineHeight,
            color: COLORS.ink[500],
            margin: 0,
          }}
        >
          <RichText>{project.summary}</RichText>
        </p>
      </div>

      {/* Meta + link cue */}
      <div
        className={stacked ? 'project-stack-meta' : undefined}
        style={{
          display: 'flex',
          alignItems: stacked ? 'center' : 'flex-end',
          justifyContent: stacked ? 'flex-end' : 'space-between',
          gap: stacked ? SPACE[5] : SPACE[3],
          ...(stacked ? {} : { paddingTop: SPACE[4], borderTop: `1px solid ${COLORS.ink[100]}` }),
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE_SCALE.mono.sm.size,
            lineHeight: 1.4,
            color: COLORS.ink[400],
          }}
        >
          {project.meta}
        </span>
        <span
          style={{
            fontFamily: FONTS.ui,
            fontSize: TYPE_SCALE.ui.sm.size,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: isHovered ? COLORS.accent.primary : COLORS.ink[600],
            transition: `color ${EFFECTS.transition.fast}`,
          }}
        >
          View project{' '}
          <span
            style={{
              display: 'inline-block',
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              transition: `transform ${EFFECTS.transition.base}`,
            }}
          >
            →
          </span>
        </span>
      </div>
    </a>
  );
};

const ProjectRowArrow = ({ direction, enabled, onClick }) => (
  <button
    type="button"
    aria-label={direction === 'left' ? 'Scroll to previous projects' : 'Scroll to more projects'}
    onClick={onClick}
    disabled={!enabled}
    style={{
      width: '36px',
      height: '36px',
      borderRadius: EFFECTS.radius.full,
      border: `1px solid ${enabled ? COLORS.ink[300] : COLORS.ink[200]}`,
      background: COLORS.surface.elevated,
      color: enabled ? COLORS.ink[700] : COLORS.ink[300],
      cursor: enabled ? 'pointer' : 'default',
      fontFamily: FONTS.ui,
      fontSize: '1rem',
      lineHeight: 1,
      transition: `all ${EFFECTS.transition.fast}`,
    }}
  >
    {direction === 'left' ? '←' : '→'}
  </button>
);

const ProjectCards = ({ projects, layout = 'row', rows = 2 }) => {
  const rowRef = useRef(null);
  const [wrapRef, inView] = useInView();
  const [edges, setEdges] = useState({ left: false, right: false });
  const isGrid = layout === 'grid';
  const isStack = layout === 'stack';

  useEffect(() => {
    injectProjectCardStyles();
    const row = rowRef.current;
    if (!row || isGrid || isStack) return undefined;

    const update = () => {
      const maxScroll = row.scrollWidth - row.clientWidth;
      setEdges({ left: row.scrollLeft > 4, right: row.scrollLeft < maxScroll - 4 });
    };
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      row.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [projects.length, isGrid, isStack]);

  const scrollByCards = (direction) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * (PROJECT_CARD_WIDTH + PROJECT_ROW_GAP), behavior: 'smooth' });
  };

  const fade = (side) => (edges[side] ? 'transparent' : 'black');
  const mask = `linear-gradient(to right, ${fade('left')} 0, black ${SPACE[8]}, black calc(100% - ${SPACE[8]}), ${fade('right')} 100%)`;
  const scrollable = !isGrid && !isStack && (edges.left || edges.right);

  // Enough columns to fit every card in `rows` rows, e.g. 7 cards in 2 rows → 4 + 3
  const columns = Math.max(1, Math.ceil(projects.length / Math.max(rows, 1)));

  return (
    <div ref={wrapRef} style={{ margin: `${SPACE[6]} 0 ${SPACE[8]}` }}>
      <div
        ref={rowRef}
        className={isGrid ? 'project-grid' : (isStack ? 'project-stack' : 'project-row')}
        style={isStack ? {} : isGrid ? {
          '--project-columns': columns,
          // Extend toward the right edge so four columns still read comfortably. Only to the
          // right: the left stays aligned with the text, clear of the fixed SectionNav.
          marginRight: 'max(-16rem, calc(50% - 50vw + 2rem))',
        } : {
          display: 'flex',
          gap: `${PROJECT_ROW_GAP}px`,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollPaddingLeft: `${PROJECT_ROW_BLEED}px`,
          padding: `${PROJECT_ROW_BLEED}px`,
          margin: `-${PROJECT_ROW_BLEED}px`,
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {projects.map((project, i) => (
          <ProjectCard key={project.href} project={project} index={i} inView={inView} layout={layout} />
        ))}
      </div>

      {scrollable && (
        <div
          className="project-row-arrows"
          style={{ justifyContent: 'flex-end', gap: SPACE[2], marginTop: SPACE[5] }}
        >
          <ProjectRowArrow direction="left" enabled={edges.left} onClick={() => scrollByCards(-1)} />
          <ProjectRowArrow direction="right" enabled={edges.right} onClick={() => scrollByCards(1)} />
        </div>
      )}
    </div>
  );
};

export default ProjectCards;
