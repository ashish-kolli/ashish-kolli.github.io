#!/usr/bin/env node
/**
 * Generates the article HTML page for GitHub Pages deployment.
 * Same approach as update-preview.js but for the article bundle.
 *
 * Usage:
 *   node scripts/update-article-preview.js                          # default: market-sizing
 *   node scripts/update-article-preview.js --article ai-memory-architectures
 *
 * Output: <slug>/index.html
 */
const fs = require('fs');
const path = require('path');

// ── Article preview configs ─────────────────────────────────────────────────────
const PREVIEW_CONFIGS = {
  'market-sizing': {
    distFile: 'MarketSizingGuide.jsx',
    outputDir: 'market-sizing',
    pageTitle: 'Market Sizing &amp; Beachhead Strategy Guide | MPD-409',
    ogTitle: 'Market Sizing & Beachhead Strategy Guide',
    ogDescription: 'From customer discovery to market sizing: TAM, SAM, SOM, bottom-up analysis, and beachhead selection.',
    metaDescription: 'A practical guide to TAM analysis and beachhead strategy for Masters of Product Development & Design students.',
  },
  'ai-memory-architectures': {
    distFile: 'AIMemoryArchitectures.jsx',
    outputDir: 'ai-memory-architectures',
    pageTitle: 'Building a Company Brain | Applied AI Field Guide',
    ogTitle: 'Building a Company Brain',
    ogDescription: 'Every AI agent forgets everything the moment the conversation ends. Here\'s how to give yours forever memory, and the four systems making it possible. Zep, Hindsight, Supermemory, LLM Wiki.',
    metaDescription: 'Every AI agent forgets everything between sessions. How to build a Company Brain with forever memory, and the four systems that make it possible.',
  },
};

const args = process.argv.slice(2);
const articleIdx = args.indexOf('--article');
const ARTICLE_SLUG = (articleIdx !== -1 && args[articleIdx + 1]) ? args[articleIdx + 1] : 'market-sizing';

if (!PREVIEW_CONFIGS[ARTICLE_SLUG]) {
  console.error(`Error: Unknown article "${ARTICLE_SLUG}". Available: ${Object.keys(PREVIEW_CONFIGS).join(', ')}`);
  process.exit(1);
}

const PCONFIG = PREVIEW_CONFIGS[ARTICLE_SLUG];
const distFile = path.resolve(__dirname, `../dist/${PCONFIG.distFile}`);
const outputFile = path.resolve(__dirname, `../${PCONFIG.outputDir}/index.html`);

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the bundle
let bundle = fs.readFileSync(distFile, 'utf-8');

// Remove ES module syntax for UMD/browser globals
bundle = bundle.replace(/^import React.*from ['"]react['"];?\s*$/m, '');
bundle = bundle.replace(/^import.*from ['"]react['"];?\s*$/gm, '');
bundle = bundle.replace(/^export default App;?\s*$/m, '');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${PCONFIG.pageTitle}</title>
  <meta name="description" content="${PCONFIG.metaDescription}">
  <meta property="og:title" content="${PCONFIG.ogTitle}">
  <meta property="og:description" content="${PCONFIG.ogDescription}">
  <meta property="og:type" content="article">

  <!-- React production builds -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;

${bundle}

    // Render the app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

fs.writeFileSync(outputFile, html);
const size = (fs.statSync(outputFile).size / 1024).toFixed(1);
console.log(`✓ ${PCONFIG.outputDir}/index.html updated (${size} KB)`);
