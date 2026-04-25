/**
 * Section Component - "The Scholarly Disruptor"
 *
 * Editorial magazine aesthetic with distinctive chapter markers
 * - Asymmetric rule treatments inspired by print design
 * - Generous white space with purposeful rhythm
 * - Visual hierarchy through typographic and linear elements
 * - Terminal-style typewriter animations on scroll
 */
import { useState, useEffect, useRef } from 'react';
import RichText from './RichText';
import { COLORS, FONTS, TYPE_SCALE, LAYOUT, SPACE, EFFECTS } from '../design-tokens';

// Keyframes for cursor blink - injected once
const injectKeyframes = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes terminalBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      @keyframes lineGrow {
        from { width: 0; opacity: 0; }
        to { width: 100%; opacity: 1; }
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();

// Terminal Typewriter Hook
const useTypewriter = (text, { speed = 50, startDelay = 0, enabled = true } = {}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      setIsDone(true);
      return;
    }

    setDisplayText('');
    setIsTyping(false);
    setIsDone(false);

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          setIsDone(true);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay, enabled]);

  return { displayText, isTyping, isDone };
};

// Intersection Observer Hook
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If the element is already above or within the viewport on mount
    // (e.g. after a mid-page refresh), mark it visible immediately.
    const rect = element.getBoundingClientRect();
    if (rect.bottom < window.innerHeight + 100) {
      setInView(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setInView(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.2, rootMargin: '-50px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated, options]);

  return [ref, inView];
};

// Terminal Cursor Component - always blinks when visible
const TerminalCursor = ({ visible = true, blink = true, color = COLORS.accent.primary }) => (
  <span
    style={{
      display: 'inline-block',
      width: '3px',
      height: '1.15em',
      background: color,
      marginLeft: '3px',
      verticalAlign: 'text-bottom',
      animation: blink ? 'terminalBlink 0.8s step-end infinite' : 'none',
      opacity: visible ? 1 : 0,
      boxShadow: `0 0 4px ${color}40`,
    }}
  />
);

// Section Divider - Editorial chapter break with animation
const SectionDivider = ({ variant = 'default' }) => {
  const [ref, inView] = useInView({ threshold: 0.5 });

  if (variant === 'subtle') {
    // Minimal spacing divider
    return (
      <div
        ref={ref}
        style={{
          maxWidth: LAYOUT.maxWidth.content,
          margin: '0 auto',
          padding: `${SPACE[8]} ${LAYOUT.margin}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[4],
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              background: `linear-gradient(to right, ${COLORS.ink[200]}, transparent)`,
              transform: inView ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.6s ease-out',
            }}
          />
        </div>
      </div>
    );
  }

  // Default: Editorial chapter break with asymmetric flourish
  return (
    <div
      ref={ref}
      style={{
        maxWidth: LAYOUT.maxWidth.content,
        margin: '0 auto',
        padding: `${SPACE[10]} ${LAYOUT.margin}`,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[5],
        }}
      >
        {/* Left line - short, accent colored - grows in */}
        <div
          style={{
            width: inView ? '48px' : '0px',
            height: '2px',
            background: COLORS.accent.primary,
            borderRadius: EFFECTS.radius.sm,
            transition: 'width 0.4s ease-out',
          }}
        />
        {/* Center diamond marker - scales in */}
        <div
          style={{
            width: '6px',
            height: '6px',
            background: COLORS.accent.primary,
            transform: inView ? 'rotate(45deg) scale(1)' : 'rotate(45deg) scale(0)',
            flexShrink: 0,
            transition: 'transform 0.3s ease-out',
            transitionDelay: '0.3s',
          }}
        />
        {/* Right line - extends further, fades out - grows in */}
        <div
          style={{
            flex: 1,
            maxWidth: '200px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: `linear-gradient(to right, ${COLORS.ink[300]}, transparent)`,
              transform: inView ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.5s ease-out',
              transitionDelay: '0.4s',
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Section = ({ number, title, children, className = '' }) => {
  // Inject keyframes on mount
  useEffect(() => {
    injectKeyframes();
  }, []);

  // Intersection observer for scroll trigger
  const [headerRef, inView] = useInView();

  // Typewriter for section label - fast terminal typing
  const sectionLabel = `section_`;
  const { displayText: labelText } = useTypewriter(
    sectionLabel,
    { speed: 45, startDelay: 200, enabled: inView }
  );

  // Typewriter for section number - appears after label
  const sectionNum = String(number).padStart(2, '0');
  const { displayText: numText } = useTypewriter(
    sectionNum,
    { speed: 70, startDelay: 200 + sectionLabel.length * 45 + 100, enabled: inView }
  );

  // Typewriter for title - starts after terminal badge completes
  const terminalDuration = 200 + sectionLabel.length * 45 + 100 + sectionNum.length * 70;
  const { displayText: titleText } = useTypewriter(
    title,
    { speed: 28, startDelay: terminalDuration + 300, enabled: inView }
  );

  return (
    <section
      className={className}
      data-section={number}
      style={{
        background: COLORS.surface.paper,
        paddingTop: SPACE[10],
        paddingBottom: SPACE[10],
      }}
    >
      <div
        style={{
          maxWidth: LAYOUT.maxWidth.content,
          margin: '0 auto',
          padding: `0 ${LAYOUT.margin}`,
        }}
      >
        {/* Section header with editorial treatment */}
        <header
          ref={headerRef}
          style={{
            marginBottom: SPACE[7],
            position: 'relative',
          }}
        >
          {/* Top rule - asymmetric accent line */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: SPACE[5],
              gap: SPACE[4],
            }}
          >
            {/* Primary accent bar - animates in */}
            <div
              style={{
                width: EFFECTS.radius.md,
                height: inView ? '32px' : '0px',
                background: COLORS.accent.primary,
                borderRadius: EFFECTS.radius.sm,
                transition: 'height 0.3s ease-out',
              }}
            />
            {/* Section number badge - terminal style */}
            {number && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0',
                  background: COLORS.ink[900],
                  padding: `${SPACE[2]} ${SPACE[4]}`,
                  borderRadius: EFFECTS.radius.md,
                  border: `1px solid ${COLORS.ink[700]}`,
                  boxShadow: `${EFFECTS.shadow.md}, ${EFFECTS.shadow.inset}`,
                }}
              >
                {/* Terminal prompt */}
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: COLORS.accent.muted,
                    marginRight: SPACE[2],
                  }}
                >
                  {'> '}
                </span>
                {/* Section label - types out */}
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: COLORS.ink[300],
                    letterSpacing: '0.02em',
                  }}
                >
                  {labelText}
                </span>
                {/* Section number - types out */}
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: COLORS.accent.light,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {numText}
                </span>
                {/* Blinking cursor - stays blinking after done */}
                <TerminalCursor
                  visible={inView}
                  blink={true}
                  color={COLORS.accent.light}
                />
              </div>
            )}
            {/* Extending line - grows in */}
            <div
              style={{
                flex: 1,
                height: '1px',
                maxWidth: '300px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: inView ? '100%' : '0%',
                  height: '100%',
                  background: `linear-gradient(to right, ${COLORS.ink[200]} 0%, ${COLORS.ink[100]} 50%, transparent 100%)`,
                  transition: 'width 0.6s ease-out',
                  transitionDelay: '0.2s',
                }}
              />
            </div>
          </div>

          {/* Title with bottom rule - typewriter effect */}
          <h2
            style={{
              fontFamily: FONTS.headline,
              fontSize: TYPE_SCALE.headline.lg.size,
              fontWeight: TYPE_SCALE.headline.lg.weight,
              lineHeight: TYPE_SCALE.headline.lg.lineHeight,
              letterSpacing: TYPE_SCALE.headline.lg.letterSpacing,
              color: COLORS.ink[800],
              margin: 0,
              paddingBottom: SPACE[4],
              borderBottom: `1px solid ${COLORS.ink[100]}`,
              minHeight: '2.5rem', // Prevent layout shift
            }}
          >
            {titleText}
            <TerminalCursor
              visible={inView}
              blink={true}
              color={COLORS.ink[500]}
            />
          </h2>
        </header>

        {/* Section content - fades in when section is in view */}
        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: TYPE_SCALE.body.md.size,
            lineHeight: TYPE_SCALE.body.md.lineHeight,
            color: COLORS.ink[500],
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

// Subsection component for ### headers - simple fade-in, no typewriter
const Subsection = ({ title, children }) => {
  const [ref, inView] = useInView({ threshold: 0.05, rootMargin: '0px' });

  return (
    <div ref={ref} style={{ marginTop: SPACE[9], marginBottom: SPACE[6] }}>
      {/* Subsection header with inline marker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: SPACE[4],
          marginBottom: SPACE[5],
          opacity: inView ? 1 : 0.15,
          transform: inView ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        }}
      >
        {/* Vertical accent marker */}
        <div
          style={{
            width: EFFECTS.radius.sm,
            height: '1.5rem',
            background: `linear-gradient(to bottom, ${COLORS.accent.muted}, transparent)`,
            borderRadius: EFFECTS.radius.sm,
            flexShrink: 0,
            marginTop: '0.25rem',
          }}
        />
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontFamily: FONTS.headline,
              fontSize: TYPE_SCALE.headline.sm.size,
              fontWeight: TYPE_SCALE.headline.sm.weight,
              lineHeight: TYPE_SCALE.headline.sm.lineHeight,
              color: COLORS.ink[700],
              margin: 0,
              paddingBottom: SPACE[3],
              borderBottom: `1px solid ${COLORS.ink[100]}`,
            }}
          >
            {title}
          </h3>
        </div>
      </div>
      <div
        style={{
          opacity: inView ? 1 : 0.15,
          transform: inView ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.35s ease-out 0.1s, transform 0.35s ease-out 0.1s',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Paragraph component with rich text support
const Paragraph = ({ children }) => (
  <p
    style={{
      fontFamily: FONTS.body,
      fontSize: TYPE_SCALE.body.md.size,
      lineHeight: TYPE_SCALE.body.md.lineHeight,
      letterSpacing: TYPE_SCALE.body.md.letterSpacing,
      color: COLORS.ink[500],
      marginBottom: SPACE[5],
      maxWidth: LAYOUT.maxWidth.prose,
    }}
  >
    <RichText>{children}</RichText>
  </p>
);

// Bullet list component with styled markers
const BulletList = ({ items }) => (
  <ul
    style={{
      listStyle: 'none',
      padding: 0,
      margin: `${SPACE[5]} 0`,
      maxWidth: LAYOUT.maxWidth.prose,
    }}
  >
    {items.map((item, i) => (
      <li
        key={i}
        style={{
          display: 'flex',
          gap: SPACE[4],
          marginBottom: SPACE[4],
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: '0.75rem',
            color: COLORS.accent.primary,
            flexShrink: 0,
            marginTop: '0.125rem',
          }}
        >
          ·
        </span>
        <span
          style={{
            fontFamily: FONTS.body,
            fontSize: TYPE_SCALE.body.sm.size,
            lineHeight: TYPE_SCALE.body.sm.lineHeight,
            color: COLORS.ink[500],
          }}
        >
          <RichText>{item}</RichText>
        </span>
      </li>
    ))}
  </ul>
);

export default Section;
export { Section, SectionDivider, Subsection, Paragraph, BulletList };
