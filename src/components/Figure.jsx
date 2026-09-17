/**
 * Figure Component
 *
 * An image with an optional caption, driven by the @image marker.
 * - With a src: the image, rounded and shadowed, fading in on scroll
 * - Without a src: a dashed placeholder frame showing where the image goes and
 *   what it should be, so a page can be laid out before the photos exist
 * - width="wide" breaks out past the prose column; "full" fills the content column
 */
import React, { useState } from 'react';
import RichText from './RichText';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE, LAYOUT } from '../design-tokens';

// useInView hook is defined in Section.jsx and shared across all components

const FIGURE_WIDTHS = {
  prose: LAYOUT.maxWidth.prose,
  wide: LAYOUT.maxWidth.content,
  full: '100%',
};

const FigurePlaceholder = ({ caption, ratio }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      aspectRatio: ratio,
      borderRadius: EFFECTS.radius.lg,
      border: `2px dashed ${COLORS.ink[200]}`,
      background: COLORS.surface.inset,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACE[3],
      padding: SPACE[6],
      textAlign: 'center',
    }}
  >
    <span
      style={{
        fontFamily: FONTS.mono,
        fontSize: TYPE_SCALE.ui.xs.size,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: COLORS.accent.primary,
      }}
    >
      Image
    </span>
    <span
      style={{
        maxWidth: '38ch',
        fontFamily: FONTS.ui,
        fontSize: TYPE_SCALE.ui.md.size,
        lineHeight: 1.5,
        color: COLORS.ink[400],
      }}
    >
      {caption || 'Add src="assets/photos/your-image.jpg" to this @image marker'}
    </span>
  </div>
);

const Figure = ({ src, alt, caption, width = 'wide', ratio = '16 / 10' }) => {
  const [ref, inView] = useInView();
  const [failed, setFailed] = useState(false);

  return (
    <figure
      ref={ref}
      style={{
        maxWidth: FIGURE_WIDTHS[width] || FIGURE_WIDTHS.wide,
        margin: `${SPACE[8]} auto`,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt || caption || ''}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            borderRadius: EFFECTS.radius.lg,
            border: `1px solid ${COLORS.ink[100]}`,
            boxShadow: EFFECTS.shadow.lg,
          }}
        />
      ) : (
        <FigurePlaceholder caption={caption} ratio={ratio} />
      )}

      {caption && src && !failed && (
        <figcaption
          style={{
            marginTop: SPACE[4],
            fontFamily: FONTS.ui,
            fontSize: TYPE_SCALE.ui.sm.size,
            lineHeight: 1.6,
            color: COLORS.ink[400],
          }}
        >
          <RichText>{caption}</RichText>
        </figcaption>
      )}
    </figure>
  );
};

export default Figure;
