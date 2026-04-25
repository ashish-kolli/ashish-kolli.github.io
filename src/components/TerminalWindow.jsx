/**
 * TerminalWindow Component - "macOS Terminal Summary Cards"
 *
 * macOS-style terminal window cards for presenting key content summaries
 * - Realistic window chrome with traffic light buttons
 * - Dark terminal aesthetic with glow effects
 * - Typewriter animation triggered on scroll
 * - Supports multi-line content with syntax highlighting
 */
import { useState, useEffect, useRef } from 'react';
import { COLORS, FONTS, SPACE, EFFECTS } from '../design-tokens';

// Inject keyframes for terminal animations
const injectTerminalKeyframes = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes terminalCursorBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      @keyframes terminalGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.15); }
        50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.25); }
      }
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();

// Intersection Observer Hook for scroll triggering
const useTerminalInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If element is already above or within viewport (mid-page refresh), show immediately
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
      { threshold: 0.15, rootMargin: '-30px', ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated, options]);

  return [ref, inView];
};

// Multi-line typewriter hook
const useMultiLineTypewriter = (lines, { speed = 35, lineDelay = 400, enabled = true } = {}) => {
  const [displayLines, setDisplayLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayLines(lines);
      setIsDone(true);
      return;
    }

    setDisplayLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsDone(false);
  }, [lines, enabled]);

  useEffect(() => {
    if (!enabled || isDone) return;
    if (currentLineIndex >= lines.length) {
      setIsDone(true);
      return;
    }

    const currentLine = lines[currentLineIndex];

    if (currentCharIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayLines(prev => {
          const newLines = [...prev];
          if (newLines.length <= currentLineIndex) {
            newLines.push('');
          }
          newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          return newLines;
        });
        setCurrentCharIndex(c => c + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Move to next line
      const timeout = setTimeout(() => {
        setCurrentLineIndex(i => i + 1);
        setCurrentCharIndex(0);
      }, lineDelay);
      return () => clearTimeout(timeout);
    }
  }, [enabled, isDone, currentLineIndex, currentCharIndex, lines, speed, lineDelay]);

  return { displayLines, isDone, currentLineIndex };
};

// Terminal cursor component
const TerminalWindowCursor = ({ visible = true }) => (
  <span
    style={{
      display: 'inline-block',
      width: SPACE[2],
      height: '1.1em',
      background: COLORS.accent.light,
      marginLeft: SPACE[1],
      verticalAlign: 'text-bottom',
      animation: visible ? 'terminalCursorBlink 0.9s step-end infinite' : 'none',
      opacity: visible ? 1 : 0,
      boxShadow: `0 0 ${SPACE[2]} ${COLORS.accent.light}60`,
    }}
  />
);

// Traffic light buttons
const TrafficLights = () => (
  <div style={{ display: 'flex', gap: SPACE[2], alignItems: 'center' }}>
    <div
      style={{
        width: SPACE[3],
        height: SPACE[3],
        borderRadius: EFFECTS.radius.full,
        background: '#FF5F57',
        boxShadow: EFFECTS.shadow.inset,
      }}
    />
    <div
      style={{
        width: SPACE[3],
        height: SPACE[3],
        borderRadius: EFFECTS.radius.full,
        background: '#FFBD2E',
        boxShadow: EFFECTS.shadow.inset,
      }}
    />
    <div
      style={{
        width: SPACE[3],
        height: SPACE[3],
        borderRadius: EFFECTS.radius.full,
        background: '#28CA41',
        boxShadow: EFFECTS.shadow.inset,
      }}
    />
  </div>
);

// Main TerminalWindow component
const TerminalWindow = ({
  title = 'summary.md',
  command = 'cat',
  lines = [],
  variant = 'default'
}) => {
  const [ref, inView] = useTerminalInView();

  useEffect(() => {
    injectTerminalKeyframes();
  }, []);

  // Convert single string to lines array if needed
  const contentLines = Array.isArray(lines) ? lines : [lines];

  const { displayLines, isDone, currentLineIndex } = useMultiLineTypewriter(
    contentLines,
    { speed: 12, lineDelay: 80, enabled: inView }
  );

  const isCompact = variant === 'compact';

  return (
    <div
      ref={ref}
      style={{
        maxWidth: isCompact ? '720px' : '100%',
        width: '100%',
        margin: `${SPACE[7]} auto`,
        borderRadius: EFFECTS.radius.xl,
        overflow: 'hidden',
        background: '#1a1b26',
        boxShadow: inView
          ? `${EFFECTS.shadow.xl}, 0 0 0 1px rgba(255,255,255,0.05), 0 0 30px ${COLORS.accent.primary}20`
          : EFFECTS.shadow.lg,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        opacity: inView ? 1 : 0,
        transition: 'all 0.5s ease-out',
        position: 'relative',
      }}
    >
      {/* Window title bar */}
      <div
        style={{
          background: 'linear-gradient(180deg, #3d3d4a 0%, #2d2d3a 100%)',
          padding: `${SPACE[3]} ${SPACE[4]}`,
          display: 'flex',
          alignItems: 'center',
          gap: SPACE[3],
          borderBottom: '1px solid rgba(0,0,0,0.3)',
        }}
      >
        <TrafficLights />
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: FONTS.ui,
            fontSize: '13px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.01em',
          }}
        >
          {title}
        </div>
        {/* Spacer for symmetry */}
        <div style={{ width: '52px' }} />
      </div>

      {/* Terminal content area */}
      <div
        style={{
          padding: isCompact ? `${SPACE[4]} ${SPACE[5]}` : `${SPACE[5]} ${SPACE[5]}`,
          minHeight: isCompact ? '100px' : '140px',
          position: 'relative',
          background: 'linear-gradient(180deg, #1a1b26 0%, #16161e 100%)',
        }}
      >
        {/* Subtle scanline effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
            pointerEvents: 'none',
          }}
        />

        {/* Command prompt - only show if command is provided */}
        {command && (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: '14px',
              marginBottom: SPACE[3],
              display: 'flex',
              alignItems: 'center',
              gap: SPACE[2],
            }}
          >
            <span style={{ color: COLORS.accent.muted }}>❯</span>
            <span style={{ color: COLORS.accent.light }}>{command}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{title}</span>
          </div>
        )}

        {/* Content lines */}
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: '13px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {displayLines.map((line, index) => (
            <div
              key={index}
              style={{
                marginBottom: SPACE[1],
                opacity: index <= currentLineIndex ? 1 : 0,
                transform: index <= currentLineIndex ? 'translateX(0)' : `translateX(-${SPACE[2]})`,
                transition: 'opacity 0.2s, transform 0.2s',
                wordBreak: 'break-all',
              }}
            >
              {/* Line content with syntax highlighting */}
              <span>
                {highlightSyntax(line)}
              </span>
              {/* Cursor on current line */}
              {index === currentLineIndex && !isDone && (
                <TerminalWindowCursor visible={true} />
              )}
            </div>
          ))}
          {/* Final cursor after all lines complete - only show if command mode */}
          {isDone && command && (
            <div style={{ display: 'flex', marginTop: SPACE[2] }}>
              <span style={{ color: COLORS.accent.muted }}>❯</span>
              <TerminalWindowCursor visible={true} />
            </div>
          )}
          {/* Simple done indicator when no command mode */}
          {isDone && !command && (
            <div style={{ marginTop: SPACE[3], opacity: 0.4 }}>
              <span style={{
                fontFamily: FONTS.mono,
                fontSize: '11px',
                color: COLORS.accent.muted,
                letterSpacing: '0.05em',
              }}>
                ✓ summary
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple syntax highlighting for terminal content
function highlightSyntax(text) {
  if (!text) return text;

  // Split into parts and apply highlighting
  const parts = [];
  let remaining = text;
  let key = 0;

  // Highlight patterns:
  // - **bold** → accent color
  // - `code` → muted accent
  // - Numbers → green tint
  // - Arrows (→, ->) → accent
  // - Bullet points (•, -, *) at start → accent

  // Handle bold
  const boldRegex = /\*\*([^*]+)\*\*/g;
  remaining = remaining.replace(boldRegex, (_, content) => `__BOLD_START__${content}__BOLD_END__`);

  // Handle code
  const codeRegex = /`([^`]+)`/g;
  remaining = remaining.replace(codeRegex, (_, content) => `__CODE_START__${content}__CODE_END__`);

  // Now parse the string
  const tokens = remaining.split(/(__BOLD_START__|__BOLD_END__|__CODE_START__|__CODE_END__)/);
  let inBold = false;
  let inCode = false;

  for (const token of tokens) {
    if (token === '__BOLD_START__') {
      inBold = true;
      continue;
    }
    if (token === '__BOLD_END__') {
      inBold = false;
      continue;
    }
    if (token === '__CODE_START__') {
      inCode = true;
      continue;
    }
    if (token === '__CODE_END__') {
      inCode = false;
      continue;
    }

    if (inBold) {
      parts.push(
        <span key={key++} style={{ color: COLORS.accent.light, fontWeight: 600 }}>
          {token}
        </span>
      );
    } else if (inCode) {
      parts.push(
        <span
          key={key++}
          style={{
            color: COLORS.accent.muted,
            background: 'rgba(139, 92, 246, 0.15)',
            padding: `${SPACE[0]} ${SPACE[1]}`,
            borderRadius: EFFECTS.radius.sm,
          }}
        >
          {token}
        </span>
      );
    } else {
      // Apply additional highlighting to regular text
      let processed = token;

      // Highlight arrows
      processed = processed.replace(/(→|->|=>)/g, '___ARROW___$1___/ARROW___');

      // Highlight numbers with % or units
      processed = processed.replace(/(\d+(?:\.\d+)?(?:%|x|K|M|B)?)/g, '___NUM___$1___/NUM___');

      // Highlight bullet points at start
      processed = processed.replace(/^([•\-\*])\s/, '___BULLET___$1___/BULLET___ ');

      const subTokens = processed.split(/(___ARROW___|___\/ARROW___|___NUM___|___\/NUM___|___BULLET___|___\/BULLET___)/);
      let inArrow = false;
      let inNum = false;
      let inBullet = false;

      for (const subToken of subTokens) {
        if (subToken === '___ARROW___') { inArrow = true; continue; }
        if (subToken === '___/ARROW___') { inArrow = false; continue; }
        if (subToken === '___NUM___') { inNum = true; continue; }
        if (subToken === '___/NUM___') { inNum = false; continue; }
        if (subToken === '___BULLET___') { inBullet = true; continue; }
        if (subToken === '___/BULLET___') { inBullet = false; continue; }

        if (inArrow) {
          parts.push(<span key={key++} style={{ color: COLORS.accent.muted }}>{subToken}</span>);
        } else if (inNum) {
          parts.push(<span key={key++} style={{ color: '#7dd3fc' }}>{subToken}</span>);
        } else if (inBullet) {
          parts.push(<span key={key++} style={{ color: COLORS.accent.muted }}>{subToken}</span>);
        } else if (subToken) {
          parts.push(<span key={key++}>{subToken}</span>);
        }
      }
    }
  }

  return parts;
}

export default TerminalWindow;
export { TerminalWindow };
