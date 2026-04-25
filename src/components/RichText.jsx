/**
 * RichText Component
 * Parses markdown-style formatting into React elements
 */
import React from 'react';

const RichText = ({ children, className = '' }) => {
  if (!children || typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  const parseText = (text) => {
    const elements = [];
    let key = 0;

    // Simple sequential parsing - process bold first, then italic
    let result = text;

    // Replace bold first (** **) - must come before italic
    result = result.replace(/\*\*([^*]+)\*\*/g, '___BOLD_START___$1___BOLD_END___');

    // Replace italic (* *) - simple version without lookbehind
    // This regex matches single asterisks that aren't part of bold markers
    result = result.replace(/\*([^*_]+)\*/g, '___ITALIC_START___$1___ITALIC_END___');

    // Replace links
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '___LINK_START___$1___LINK_SEP___$2___LINK_END___');

    // Replace citations
    result = result.replace(/\[(\d+)\]/g, '___CITE_START___$1___CITE_END___');

    // Now parse the marked string into React elements.
    // Use an explicit alternation of known markers so uppercase content
    // inside italic/bold (e.g. *AI*, *NASA*) is not absorbed by a greedy [A-Z_]+.
    const parts = result.split(/(___(?:BOLD_START|BOLD_END|ITALIC_START|ITALIC_END|LINK_START|LINK_SEP|LINK_END|CITE_START|CITE_END)___)/);

    let inBold = false;
    let inItalic = false;
    let linkText = '';
    let linkUrl = '';
    let inLink = false;
    let inLinkUrl = false;
    let citeNum = '';
    let inCite = false;

    parts.forEach((part) => {
      if (part === '___BOLD_START___') {
        inBold = true;
      } else if (part === '___BOLD_END___') {
        inBold = false;
      } else if (part === '___ITALIC_START___') {
        inItalic = true;
      } else if (part === '___ITALIC_END___') {
        inItalic = false;
      } else if (part === '___LINK_START___') {
        inLink = true;
        linkText = '';
      } else if (part === '___LINK_SEP___') {
        inLinkUrl = true;
        linkUrl = '';
      } else if (part === '___LINK_END___') {
        elements.push(
          <a key={key++} href={linkUrl} className="text-indigo-600 hover:text-indigo-800 underline" target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {linkText}
          </a>
        );
        inLink = false;
        inLinkUrl = false;
      } else if (part === '___CITE_START___') {
        inCite = true;
        citeNum = '';
      } else if (part === '___CITE_END___') {
        elements.push(
          <a key={key++} href={`#citation-${citeNum}`} className="text-indigo-600 cursor-pointer hover:text-indigo-800 ml-0.5 no-underline">
            <sup>[{citeNum}]</sup>
          </a>
        );
        inCite = false;
      } else if (part) {
        if (inCite) {
          citeNum = part;
        } else if (inLink && !inLinkUrl) {
          linkText = part;
        } else if (inLinkUrl) {
          linkUrl = part;
        } else if (inBold) {
          elements.push(<strong key={key++}>{part}</strong>);
        } else if (inItalic) {
          elements.push(<em key={key++}>{part}</em>);
        } else {
          elements.push(part);
        }
      }
    });

    return elements;
  };

  return <span className={className}>{parseText(children)}</span>;
};

export default RichText;
