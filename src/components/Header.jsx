/**
 * Header Component - "The Scholarly Disruptor"
 *
 * Editorial magazine aesthetic - lighter, more compelling
 * - Cream/paper background with subtle warmth
 * - Bold asymmetric typography
 * - Geometric accent elements
 * - Magazine cover composition
 */
import React, { useState, useEffect, useRef } from 'react';
import FilmScreen from './FilmScreen';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, LAYOUT, SPACE } from '../design-tokens';

// Soft see-through orange-to-purple wash for the Resume button, echoing the header's
// amber and violet glows. `strength` is each color's opacity; a little white underneath
// keeps it light.
const RESUME_GRADIENT = [
  [249, 115, 22],  // orange
  [139, 92, 246],  // purple
];
const resumeGradient = (strength) => {
  const stops = RESUME_GRADIENT
    .map(([r, g, b], i) => `rgba(${r}, ${g}, ${b}, ${strength}) ${Math.round((i / (RESUME_GRADIENT.length - 1)) * 100)}%`)
    .join(', ');
  return `linear-gradient(115deg, ${stops}), rgba(255, 255, 255, 0.55)`;
};

const Header = ({ data }) => {
  const { from, fromEmail, linkedin, github, instagram, headshot, subtitle, title, resume, resumeLabel, reel = [] } = data;
  const [imageError, setImageError] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const [resumeHovered, setResumeHovered] = useState(false);

  // The film strip's leader runs behind the hero text; it needs to be gone before it reaches
  // each piece of text on its row. Measure where the title, the subtitle (as it will read once
  // fully typed), and the contact card end, relative to the leader's top-left corner.
  const heroGridRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const contactRef = useRef(null);
  const reelRef = useRef(null);
  const [keepOuts, setKeepOuts] = useState([]);

  useEffect(() => {
    const measure = () => {
      const leader = reelRef.current?.querySelector('.film-leader');
      if (!leader || leader.offsetParent === null) return; // hidden on phones
      const origin = leader.getBoundingClientRect();
      const rects = [];
      if (titleRef.current) rects.push(titleRef.current.getBoundingClientRect());
      if (contactRef.current) rects.push(contactRef.current.getBoundingClientRect());

      // The subtitle types out over a couple of seconds, so lay out its finished text in an
      // invisible copy and measure each line of that instead
      const subtitleEl = subtitleRef.current;
      if (subtitleEl && subtitle) {
        const copy = subtitleEl.cloneNode(false);
        copy.style.position = 'absolute';
        copy.style.visibility = 'hidden';
        copy.style.left = `${subtitleEl.offsetLeft}px`;
        copy.style.top = `${subtitleEl.offsetTop}px`;
        copy.style.width = `${subtitleEl.offsetWidth}px`;
        copy.style.margin = '0';
        const prompt = document.createElement('span');
        prompt.textContent = '>';
        prompt.style.marginRight = '0.5rem';
        copy.append(prompt, document.createTextNode(`${subtitle}\u00a0\u00a0`));
        subtitleEl.parentNode.appendChild(copy);
        const range = document.createRange();
        range.selectNodeContents(copy);
        rects.push(...range.getClientRects());
        copy.remove();
      }

      setKeepOuts(rects
        .map((r) => ({ right: Math.round(r.right - origin.left), top: Math.round(r.top - origin.top), bottom: Math.round(r.bottom - origin.top) }))
        .filter((k) => k.bottom > 0 && k.top < origin.height && k.right > 0));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (heroGridRef.current) observer.observe(heroGridRef.current);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [subtitle]);

  // The contact card is a shortcut into the About section
  const goToAbout = () => {
    const about = document.getElementById('about');
    if (about) {
      window.scrollTo({ top: about.offsetTop - 100, behavior: 'smooth' });
    }
  };

  // Typewriter animation state
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect for subtitle
  useEffect(() => {
    if (!subtitle) return;

    let currentIndex = 0;
    const typingSpeed = 35; // milliseconds per character

    // Start typing after a short delay
    const startDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (currentIndex < subtitle.length) {
          setTypedText(subtitle.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, typingSpeed);

      return () => clearInterval(typeInterval);
    }, 800);

    return () => clearTimeout(startDelay);
  }, [subtitle]);

  // Get initials for fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/*
        Background layers sit at zIndex -2 so the CursorSpotlight (zIndex -1)
        draws above them but below the header content (zIndex 10).
      */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -2,
          background: `linear-gradient(170deg, #f8f9fc 0%, #eef1f8 30%, #e8edf5 60%, #f5f7fa 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Gradient accent shapes - colorful */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-5%',
          width: '55%',
          height: '70%',
          zIndex: -2,
          background: `radial-gradient(ellipse at center, #6366f120 0%, #8b5cf615 40%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '-10%',
          width: '45%',
          height: '50%',
          zIndex: -2,
          background: `radial-gradient(ellipse at center, #3b82f615 0%, #06b6d410 50%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-5%',
          right: '20%',
          width: '40%',
          height: '45%',
          zIndex: -2,
          background: `radial-gradient(ellipse at center, #f59e0b10 0%, #f9731608 50%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />


      {/* Top navigation bar */}
      <nav
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '1.5rem 0',
        }}
      >
        <div
          style={{
            maxWidth: LAYOUT.maxWidth.wide,
            margin: '0 auto',
            padding: `0 ${LAYOUT.margin}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Signature mark */}
          <img
            src="assets/brand/signature.png"
            alt="Ashish Kolli"
            style={{ display: 'block', height: '34px', width: 'auto' }}
          />

          {/* Resume button */}
          {resume && (
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setResumeHovered(true)}
              onMouseLeave={() => setResumeHovered(false)}
              style={{
                // Card treatment like the project and contact cards (hairline border, purple
                // outline and a small lift on hover), over a translucent orange-to-purple wash instead of white
                padding: '0.625rem 1.5rem',
                background: resumeGradient(resumeHovered ? 0.34 : 0.24),
                color: resumeHovered ? COLORS.accent.primary : COLORS.ink[900],
                border: `1px solid ${resumeHovered ? COLORS.accent.primary : COLORS.ink[400]}`,
                borderRadius: EFFECTS.radius.lg,
                fontFamily: FONTS.ui,
                fontSize: TYPE_SCALE.ui.md.size,
                fontWeight: 400,
                letterSpacing: '0.02em',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: resumeHovered ? EFFECTS.shadow.lg : EFFECTS.shadow.sm,
                transform: resumeHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: `all ${EFFECTS.transition.base}`,
              }}
            >
              {resumeLabel}
            </a>
          )}
        </div>
      </nav>

      {/* Main hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          maxWidth: LAYOUT.maxWidth.wide,
          width: '100%',
          margin: '0 auto',
          padding: `${SPACE[10]} ${LAYOUT.margin}`,
        }}
      >
        <div
          ref={heroGridRef}
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '2rem',
            width: '100%',
            alignItems: 'center',
          }}
        >
          {/* Left column - Main content */}
          <div className="hero-main" style={{ gridColumn: 'span 8', position: 'relative', zIndex: 2 }}>
            {/* Main title */}
            <h1
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: COLORS.ink[900],
                marginBottom: '1.5rem',
                textTransform: 'uppercase',
              }}
            >
              <span ref={titleRef}>Ashish Kolli</span>
            </h1>

            {/* Subtitle/Dek - Typewriter animation */}
            <p
              ref={subtitleRef}
              style={{
                fontFamily: FONTS.mono,
                fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                lineHeight: 1.6,
                color: COLORS.ink[600],
                maxWidth: '38rem',
                marginBottom: '3rem',
                minHeight: '3.5rem',
              }}
            >
              <span style={{ color: COLORS.accent.primary, marginRight: '0.5rem' }}>{'>'}</span>
              {typedText}
              <span
                className="typing-cursor"
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1.2em',
                  background: isTyping ? COLORS.accent.primary : COLORS.ink[400],
                  marginLeft: '2px',
                  verticalAlign: 'text-bottom',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            </p>

            {/* Author info - horizontal card, links through to the About section */}
            <div
              ref={contactRef}
              role="link"
              tabIndex={0}
              aria-label="Read the about section"
              onClick={goToAbout}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToAbout();
                }
              }}
              onMouseEnter={() => setCardHovered(true)}
              onMouseLeave={() => setCardHovered(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1rem 1.5rem',
                background: COLORS.ink[600], // dark gray
                borderRadius: EFFECTS.radius.xl,
                border: `1px solid ${cardHovered ? COLORS.accent.primary : COLORS.ink[700]}`,
                boxShadow: EFFECTS.shadow.lg,
                cursor: 'pointer',
                transform: cardHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: `transform ${EFFECTS.transition.base}, border-color ${EFFECTS.transition.base}`,
              }}
            >
              {/* Headshot with fallback */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: EFFECTS.radius.full,
                  overflow: 'hidden',
                  border: `3px solid ${COLORS.accent.primary}`,
                  background: imageError
                    ? `linear-gradient(135deg, ${COLORS.accent.primary} 0%, ${COLORS.accent.light} 100%)`
                    : COLORS.ink[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {!imageError && headshot ? (
                  <img
                    src={headshot}
                    alt={from}
                    onError={() => setImageError(true)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: FONTS.ui,
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    {getInitials(from)}
                  </span>
                )}
              </div>

              <div>
                {/* Contact + social links */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {fromEmail && (
                    <a
                      href={`mailto:${fromEmail}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: EFFECTS.radius.md,
                        background: COLORS.surface.elevated,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: COLORS.ink[500],
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      title={`Email ${fromEmail}`}
                      aria-label={`Email ${fromEmail}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-10 6L2 7" />
                      </svg>
                    </a>
                  )}
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      rel="noopener noreferrer"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: EFFECTS.radius.md,
                        background: COLORS.surface.elevated,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: COLORS.ink[500],
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      title="LinkedIn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      rel="noopener noreferrer"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: EFFECTS.radius.md,
                        background: COLORS.surface.elevated,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: COLORS.ink[500],
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      title="GitHub"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      rel="noopener noreferrer"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: EFFECTS.radius.md,
                        background: COLORS.surface.elevated,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: COLORS.ink[500],
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      title="Instagram"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - film reel of photos, as tall as the text beside it (title top to
              contact card bottom) */}
          <div
            ref={reelRef}
            className="hero-reel"
            style={{
              gridColumn: 'span 4',
              alignSelf: 'stretch',
              display: 'flex',
              position: 'relative',
              zIndex: 1,
              // A drop shadow follows the strip's fading edge, where a box shadow on the frame
              // would draw a hard line where the strip meets it
              filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.08))',
            }}
          >
            <FilmScreen images={reel} keepOuts={keepOuts} />
          </div>
        </div>
      </div>

      {/* Scroll indicator - centered */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: `0 ${LAYOUT.margin} 3rem`,
        }}
      >
        <div
          style={{
            maxWidth: LAYOUT.maxWidth.wide,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '1px',
              height: '40px',
              background: `linear-gradient(to bottom, ${COLORS.accent.primary}, transparent)`,
            }}
          />
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: EFFECTS.radius.full,
              background: COLORS.accent.primary,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: TYPE_SCALE.mono.sm.size,
              color: COLORS.ink[400],
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Scroll to explore
          </span>
        </div>
      </div>

      {/* CSS animation and responsive styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        /* Mobile responsive styles */
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .hero-main {
            grid-column: span 1 !important;
          }
          /* Phones: the film reel drops below the contact card */
          .hero-reel {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
