/**
 * Main Application Component - "The Scholarly Disruptor"
 *
 * Editorial magazine layout - all content driven by CONTENT.document
 * No hardcoded content - everything comes from the markdown via parser
 */
import React, { useEffect } from 'react';
import CONTENT from './content';
import { COLORS, FONTS, TYPE_SCALE, SPACE, LAYOUT } from './design-tokens';

// Inject global styles for smooth scrolling
const injectGlobalStyles = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
      * {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();
import {
  Header,
  StatsGrid,
  Chart,
  Convergence,
  QuoteCarousel,
  PullQuote,
  CardGrid,
  Credentials,
  Timeline,
  Testimonials,
  Table,
  Section,
  Subsection,
  Paragraph,
  BulletList,
  Citations,
  RichText,
  TerminalWindow,
  SectionNav,
  CursorSpotlight,
  WorkList,
  ProjectCards,
  ProjectHeader,
} from './components';


/**
 * BlockRenderer - Renders a single content block
 * Handles: paragraph, bulletList, component, table
 */
const BlockRenderer = ({ block, context }) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <Paragraph>
          <RichText>{block.text}</RichText>
        </Paragraph>
      );

    case 'bulletList':
      return <BulletList items={block.items} />;

    case 'table': {
      const table = CONTENT.tables[context.tableIndex.current];
      if (table) {
        context.tableIndex.current++;
        return <Table {...table} variant={table.variant || 'default'} />;
      }
      return null;
    }

    case 'component':
      return renderComponent(block, context);

    default:
      return null;
  }
};

/**
 * Render component markers (stats, charts, quotes, cards, etc.)
 */
const renderComponent = (block, context) => {
  const { chartsByType, getCardsBySection, getProjectsBySection, getQuotesBySection, terminalIndex } = context;

  switch (block.component) {
    case 'stats': {
      const statsGroup = CONTENT.stats.find(
        group => group.length > 0 && `${group[0].value}|${group[0].label}` === block.param
      ) || CONTENT.stats[0] || [];
      return statsGroup.length > 0 ? <StatsGrid stats={statsGroup} /> : null;
    }

    case 'chart':
      if (block.param === 'growth' && chartsByType.growth?.[0]) {
        return <Chart type="growth" data={chartsByType.growth[0]} />;
      }
      if (block.param === 'range' && chartsByType.range?.[0]) {
        return <Chart type="range" data={chartsByType.range[0]} />;
      }
      if (block.param === 'bar' && chartsByType.bar?.[0]) {
        return <Chart type="bar" data={chartsByType.bar[0]} />;
      }
      if (block.param === 'hierarchy' && chartsByType.hierarchy?.[0]) {
        return <Chart type="hierarchy" data={chartsByType.hierarchy[0]} />;
      }
      return null;

    case 'convergence':
      return CONTENT.convergence.roles.length > 0 ? (
        <Convergence roles={CONTENT.convergence.roles} />
      ) : null;

    case 'quotes':
      const quotes = getQuotesBySection(block.param);
      return quotes.length > 0 ? <QuoteCarousel quotes={quotes} /> : null;

    case 'pullquote':
      // Find pullquote by matching the param prefix to the quote text
      const matchingPullquote = CONTENT.pullquotes.find(pq =>
        pq.quote.startsWith(block.param)
      );
      if (matchingPullquote) {
        return (
          <PullQuote
            quote={matchingPullquote.quote}
            author={matchingPullquote.author}
            title={matchingPullquote.title}
          />
        );
      }
      return null;

    case 'cards':
      const cardGroup = getCardsBySection(block.param);
      if (cardGroup) {
        return (
          <CardGrid
            type={cardGroup.type}
            columns={cardGroup.columns}
            cards={cardGroup.cards}
          />
        );
      }
      return null;

    case 'projects': {
      const projectRow = getProjectsBySection(block.param);
      return projectRow && projectRow.projects.length > 0 ? (
        <ProjectCards projects={projectRow.projects} />
      ) : null;
    }

    case 'credentials':
      return CONTENT.credentials.length > 0 ? (
        <Credentials credentials={CONTENT.credentials} />
      ) : null;

    case 'timeline':
      return CONTENT.timeline.length > 0 ? <Timeline entries={CONTENT.timeline} /> : null;

    case 'terminal':
      const terminal = CONTENT.terminals?.[terminalIndex.current];
      if (terminal) {
        terminalIndex.current++;
        return (
          <TerminalWindow
            title={terminal.title}
            command={terminal.command}
            lines={terminal.lines}
            variant={terminal.variant}
          />
        );
      }
      return null;

    case 'testimonials':
      const testimonialGroup = CONTENT.testimonials.find(g => g.type === block.param);
      if (testimonialGroup) {
        return (
          <Testimonials
            type={testimonialGroup.type}
            testimonials={testimonialGroup.testimonials}
            source={testimonialGroup.source}
          />
        );
      }
      return null;

    case 'worklist':
      const workList = CONTENT.workLists?.find(w => w.section === block.param);
      if (workList && workList.items.length > 0) {
        return <WorkList items={workList.items} />;
      }
      return null;

    default:
      return null;
  }
};

/**
 * SubsectionRenderer - Renders a subsection with its blocks
 */
const SubsectionRenderer = ({ subsection, context }) => {
  return (
    <Subsection title={subsection.title}>
      {subsection.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} context={context} />
      ))}
    </Subsection>
  );
};

/**
 * SectionRenderer - Renders a full section with intro and subsections
 */
const SectionRenderer = ({ section, context }) => {
  return (
    <Section number={section.number} title={section.title}>
      {/* Intro blocks */}
      {section.intro?.map((block, i) => (
        <BlockRenderer key={`intro-${i}`} block={block} context={context} />
      ))}

      {/* Subsections */}
      {section.subsections?.map((subsection, i) => (
        <SubsectionRenderer
          key={`subsection-${i}`}
          subsection={subsection}
          context={context}
        />
      ))}
    </Section>
  );
};

/**
 * Main App component - renders from CONTENT.document
 */
const App = () => {
  // Inject global smooth scrolling styles on mount
  useEffect(() => {
    injectGlobalStyles();

    // Links like "./#maker" (the back link on project pages) land on their section.
    // The browser can't do this itself because sections don't exist until React renders.
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) {
      window.scrollTo({ top: target.offsetTop - 40, behavior: 'instant' });
    }
  }, []);

  // Index refs for sequential components (tables, terminals, pullquotes)
  const tableIndex = { current: 0 };
  const terminalIndex = { current: 0 };
  const pullquoteIndex = { current: 0 };

  // Component lookup by type
  const chartsByType = {};
  CONTENT.charts.forEach(chart => {
    if (!chartsByType[chart.type]) chartsByType[chart.type] = [];
    chartsByType[chart.type].push(chart);
  });

  // Helper to get cards by section
  const getCardsBySection = (sectionNum) => {
    return CONTENT.cards.find(group => group.section === String(sectionNum));
  };

  // Helper to get a row of project cards by section name
  const getProjectsBySection = (sectionName) => {
    return CONTENT.projects?.find(group => group.section === sectionName);
  };

  // Helper to get quotes by section
  const getQuotesBySection = (sectionName) => {
    return CONTENT.quotes.filter(q => q.section === sectionName);
  };

  // Context object passed to renderers
  const context = {
    chartsByType,
    getCardsBySection,
    getProjectsBySection,
    getQuotesBySection,
    pullquoteIndex,
    tableIndex,
    terminalIndex,
  };

  return (
    <div
      style={{
        position: 'relative',
        isolation: 'isolate', // own layer stack: page background < CursorSpotlight < content
        minHeight: '100vh',
        background: COLORS.surface.paper,
        overflowX: 'hidden',
      }}
    >
      {/* Section Navigation */}
      <SectionNav sections={CONTENT.document.filter(item => item.type === 'section')} />
      <CursorSpotlight />

      {/* Render document from CONTENT.document */}
      {CONTENT.document.map((item, i) => {
        switch (item.type) {
          case 'header':
            return CONTENT.header ? (
              <Header
                key={`header-${i}`}
                data={CONTENT.header}
                heroQuote={CONTENT.pullquotes[0]}
              />
            ) : null;

          case 'page':
            return CONTENT.page ? <ProjectHeader key={`page-${i}`} page={CONTENT.page} /> : null;

          case 'section':
            return (
              <SectionRenderer
                key={`section-${item.number}-${i}`}
                section={item}
                context={context}
              />
            );

          case 'citations':
            return (
              <div
                key={`citations-${i}`}
                style={{
                  maxWidth: LAYOUT.maxWidth.content,
                  margin: '0 auto',
                  padding: `0 ${LAYOUT.margin}`,
                }}
              >
                {CONTENT.citations.length > 0 && <Citations citations={CONTENT.citations} />}
              </div>
            );

          default:
            return null;
        }
      })}

      {/* Project pages end with a way back to the rest of the work */}
      {CONTENT.page && (
        <div
          style={{
            maxWidth: LAYOUT.maxWidth.content,
            margin: '0 auto',
            padding: `0 ${LAYOUT.margin} ${SPACE[10]}`,
          }}
        >
          <a
            href={CONTENT.page.backHref}
            style={{
              fontFamily: FONTS.ui,
              fontSize: TYPE_SCALE.ui.lg.size,
              fontWeight: 600,
              color: COLORS.accent.primary,
              textDecoration: 'none',
            }}
          >
            ← {CONTENT.page.back || 'Back'}
          </a>
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
          maxWidth: LAYOUT.maxWidth.content,
          margin: '0 auto',
          padding: `${SPACE[10]} ${LAYOUT.margin}`,
          textAlign: 'center',
          borderTop: `1px solid ${COLORS.ink[100]}`,
        }}
      >
        <p
          style={{
            fontFamily: FONTS.ui,
            fontSize: TYPE_SCALE.ui.sm.size,
            color: COLORS.ink[400],
            marginBottom: SPACE[1],
          }}
        >
          Ashish Kolli · Selected Works
        </p>
        <p
          style={{
            fontFamily: FONTS.mono,
            fontSize: TYPE_SCALE.mono.sm.size,
            color: COLORS.ink[400],
          }}
        >
          Northwestern · Master of Product Design '26
        </p>
        {/* Only the home page carries a date; project pages have no @header block */}
        {CONTENT.header?.date && (
          <p
            style={{
              fontFamily: FONTS.mono,
              fontSize: TYPE_SCALE.mono.sm.size,
              color: COLORS.accent.muted,
              marginTop: SPACE[3],
            }}
          >
            {CONTENT.header.date}
          </p>
        )}
      </footer>
    </div>
  );
};

export default App;
