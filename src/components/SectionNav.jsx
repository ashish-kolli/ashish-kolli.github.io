/**
 * SectionNav Component - "The Scholarly Disruptor"
 *
 * Floating vertical navigation for jumping between document sections
 * - Editorial magazine aesthetic with refined typography
 * - Scroll-aware current section highlighting
 * - Smooth transitions and hover states
 * - Fixed position on left side, hidden on mobile
 */
import React, { useState, useEffect } from 'react';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE } from '../design-tokens';

// Section data - derived from document structure
const SECTIONS = [
  { number: 1, short: 'About', title: 'About' },
  { number: 2, short: 'Case', title: 'ReadyVault — Featured Case Study' },
  { number: 3, short: 'Works', title: 'Earlier Design Work' },
  { number: 4, short: 'Skills', title: 'Capabilities' },
  { number: 5, short: 'Marks', title: 'Highlights' },
  { number: 6, short: 'Reach', title: 'Contact' },
];

// Hook to track current section based on scroll position
const useCurrentSection = () => {
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      let current = 0;
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionNum = parseInt(section.getAttribute('data-section'), 10);
        if (scrollPosition >= sectionTop) {
          current = sectionNum;
        }
      });

      setCurrentSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return currentSection;
};

// Inject keyframes and media query styles for nav
const injectNavStyles = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes navFadeIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes navPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .section-nav-wrapper {
        display: none;
      }
      @media (min-width: 1280px) {
        .section-nav-wrapper {
          display: block;
        }
      }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();

const SectionNav = () => {
  const currentSection = useCurrentSection();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    injectNavStyles();

    // Show nav after scrolling past hero
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionNumber) => {
    const section = document.querySelector(`[data-section="${sectionNumber}"]`);
    if (section) {
      const offset = 100; // Account for any fixed headers
      const targetPosition = section.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav
      className="section-nav-wrapper"
      style={{
        position: 'fixed',
        left: SPACE[6],
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 100,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: `opacity ${EFFECTS.transition.slow}, transform ${EFFECTS.transition.slow}`,
        animation: isVisible ? 'navFadeIn 0.5s ease-out' : 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: SPACE[1],
          padding: `${SPACE[3]} ${SPACE[2]}`,
          background: `${COLORS.surface.elevated}F8`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: EFFECTS.radius.xl,
          border: `1px solid ${COLORS.ink[100]}`,
          boxShadow: EFFECTS.shadow.lg,
        }}
      >
        {/* Header label */}
        <div
          style={{
            padding: `${SPACE[1]} ${SPACE[3]}`,
            marginBottom: SPACE[1],
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: COLORS.ink[300],
            }}
          >
            Navigate
          </span>
        </div>

        {/* Section links */}
        {SECTIONS.map((section) => {
          const isActive = currentSection === section.number;
          const isHovered = hoveredSection === section.number;

          return (
            <button
              key={section.number}
              onClick={() => scrollToSection(section.number)}
              onMouseEnter={() => setHoveredSection(section.number)}
              onMouseLeave={() => setHoveredSection(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACE[3],
                padding: `${SPACE[2]} ${SPACE[3]}`,
                width: '100%',
                background: isActive
                  ? COLORS.accent.wash
                  : isHovered
                    ? COLORS.ink[50]
                    : 'transparent',
                border: 'none',
                borderRadius: EFFECTS.radius.lg,
                cursor: 'pointer',
                transition: `all ${EFFECTS.transition.fast}`,
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Active indicator bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px',
                  height: isActive ? '60%' : '0%',
                  background: COLORS.accent.primary,
                  borderRadius: EFFECTS.radius.full,
                  transition: `height ${EFFECTS.transition.base}`,
                }}
              />

              {/* Section number */}
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: TYPE_SCALE.mono.sm.size,
                  fontWeight: 600,
                  color: isActive ? COLORS.accent.primary : COLORS.ink[400],
                  minWidth: '1.5rem',
                  transition: `color ${EFFECTS.transition.fast}`,
                }}
              >
                {section.number}
              </span>

              {/* Section short name */}
              <span
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: TYPE_SCALE.ui.sm.size,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? COLORS.ink[800] : COLORS.ink[500],
                  transition: `color ${EFFECTS.transition.fast}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {section.short}
              </span>
            </button>
          );
        })}

        {/* Progress indicator */}
        <div
          style={{
            marginTop: SPACE[2],
            padding: `0 ${SPACE[3]}`,
            width: '100%',
          }}
        >
          <div
            style={{
              height: '2px',
              background: COLORS.ink[100],
              borderRadius: EFFECTS.radius.full,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(currentSection / SECTIONS.length) * 100}%`,
                background: `linear-gradient(90deg, ${COLORS.accent.primary} 0%, ${COLORS.accent.light} 100%)`,
                borderRadius: EFFECTS.radius.full,
                transition: `width ${EFFECTS.transition.base}`,
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SectionNav;
