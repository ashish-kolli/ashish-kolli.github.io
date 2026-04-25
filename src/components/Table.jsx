/**
 * Table Component - "The Scholarly Disruptor"
 *
 * Editorial magazine aesthetic
 * - Clean, minimal tables
 * - Confident typography
 * - Print-inspired styling
 */
import React from 'react';
import RichText from './RichText';
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE } from '../design-tokens';

const Table = ({ headers, rows, variant = 'default' }) => {
  if (!headers || !rows || rows.length === 0) return null;

  // Normalize rows to match header count (trim extra empty columns)
  const numCols = headers.length;
  const normalizedRows = rows.map(row => {
    // Take only as many cells as there are headers
    return row.slice(0, numCols);
  });

  // Render cell content
  const renderCellContent = (content, cellIndex, totalCols) => {
    const isLastCol = cellIndex === totalCols - 1;

    // Handle checkmark patterns
    if (content === '✓' || content === '✔' || content.toLowerCase() === 'yes') {
      return (
        <td
          key={cellIndex}
          style={{
            padding: SPACE[4],
            textAlign: 'left',
            verticalAlign: 'top',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: EFFECTS.radius.full,
              background: COLORS.accent.wash,
              color: COLORS.accent.primary,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            ✓
          </span>
        </td>
      );
    }

    if (content === '✗' || content === '✘' || content.toLowerCase() === 'no') {
      return (
        <td
          key={cellIndex}
          style={{
            padding: SPACE[4],
            textAlign: 'left',
            verticalAlign: 'top',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: EFFECTS.radius.full,
              background: COLORS.ink[100],
              color: COLORS.ink[400],
              fontSize: '0.75rem',
            }}
          >
            ✗
          </span>
        </td>
      );
    }

    return (
      <td
        key={cellIndex}
        style={{
          padding: SPACE[4],
          fontFamily: FONTS.body,
          fontSize: TYPE_SCALE.body.sm.size,
          lineHeight: 1.5,
          color: isLastCol ? COLORS.ink[500] : COLORS.ink[700],
          textAlign: 'left',
          verticalAlign: 'top',
          fontWeight: isLastCol ? 400 : 500,
        }}
      >
        <RichText>{content}</RichText>
      </td>
    );
  };

  return (
    <div
      style={{
        marginTop: SPACE[6],
        marginBottom: SPACE[6],
        overflowX: 'auto',
        background: COLORS.surface.elevated,
        borderRadius: EFFECTS.radius.lg,
        border: `1px solid ${COLORS.ink[100]}`,
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              background: COLORS.surface.inset,
              borderBottom: `1px solid ${COLORS.ink[200]}`,
            }}
          >
            {headers.map((header, i) => {
              const isHighlighted = i === headers.length - 1;
              const colWidth = `${100 / headers.length}%`;

              return (
                <th
                  key={i}
                  style={{
                    width: colWidth,
                    padding: `${SPACE[3]} ${SPACE[4]}`,
                    fontFamily: FONTS.ui,
                    fontSize: TYPE_SCALE.ui.sm.size,
                    fontWeight: 600,
                    color: isHighlighted ? COLORS.accent.primary : COLORS.ink[700],
                    textAlign: 'left',
                    letterSpacing: '0.01em',
                    borderBottom: isHighlighted ? `2px solid ${COLORS.accent.primary}` : 'none',
                  }}
                >
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {normalizedRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                borderBottom: rowIndex < normalizedRows.length - 1 ? `1px solid ${COLORS.ink[100]}` : 'none',
              }}
            >
              {row.map((cell, cellIndex) => renderCellContent(cell, cellIndex, numCols))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
