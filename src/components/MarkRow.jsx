/**
 * MarkRow Component
 *
 * A row of institution marks (@marks / @mark): first mark on the text's left
 * margin, last on its right, any others spaced between. The row is capped to the
 * prose width so the outer marks line up with the paragraphs above them. Shrinks on narrow screens.
 */
import React from 'react';
import { SPACE } from '../design-tokens';

const MARK_ROW_HEIGHT = 200; // px - big enough that the engraving reads as a seal

const injectMarkRowStyles = (() => {
  let injected = false;
  return () => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `
      .mark-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${SPACE[6]};
        max-width: 832px; /* matches the paragraph max-width above */
        margin: ${SPACE[8]} 0 ${SPACE[4]};
      }
      .mark-row img {
        height: ${MARK_ROW_HEIGHT}px;
        width: auto;
        max-width: 42%;
        object-fit: contain;
      }
      @media (max-width: 640px) {
        .mark-row { gap: ${SPACE[5]}; }
        .mark-row img { height: 140px; }
      }
    `;
    document.head.appendChild(style);
    injected = true;
  };
})();

const MarkRow = ({ marks = [] }) => {
  React.useEffect(() => {
    injectMarkRowStyles();
  }, []);

  if (!marks.length) return null;

  return (
    <div className="mark-row">
      {marks.map((mark, i) => (
        <img key={mark.src || i} src={mark.src} alt={mark.alt || ''} loading="lazy" />
      ))}
    </div>
  );
};

export default MarkRow;
