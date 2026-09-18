/**
 * PageIntro Component
 *
 * Brings the page into focus when it opens: content starts softly blurred and
 * slightly faded, then settles. Every page is its own document, so this plays on
 * first visit and again each time a card or link opens another page of the site.
 *
 * The blur is dropped entirely once it finishes — a lingering `filter` on an
 * ancestor would make `position: fixed` descendants position against it.
 * Reduced-motion users get the page already in focus.
 */
import React, { useEffect, useState } from 'react';

const INTRO_MS = 650;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const injectIntroStyles = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pageIntroFocus {
        from { filter: blur(10px); opacity: 0.55; transform: scale(1.006); }
        to   { filter: blur(0);    opacity: 1;    transform: scale(1); }
      }
      .page-intro {
        animation: pageIntroFocus ${INTRO_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
        will-change: filter, opacity;
      }
      @media (prefers-reduced-motion: reduce) {
        .page-intro { animation: none; }
      }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();

const PageIntro = ({ children }) => {
  const [settled, setSettled] = useState(prefersReducedMotion);

  useEffect(() => {
    if (settled) return undefined;
    injectIntroStyles();
    const timer = setTimeout(() => setSettled(true), INTRO_MS + 80);
    return () => clearTimeout(timer);
  }, [settled]);

  return <div className={settled ? undefined : 'page-intro'}>{children}</div>;
};

export default PageIntro;
