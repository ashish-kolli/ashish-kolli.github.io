#!/usr/bin/env node
/**
 * Updates preview.html (development) and dist/index.html (production)
 *
 * - preview.html: Development React builds, for local debugging
 * - dist/index.html: Production React builds, for GitHub Pages deployment
 *
 * Project pages call this with --bundle, --output, --base, --title and --description
 * (see scripts/build-pages.js) and only get the production file.
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const argValue = (name) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : null;
};
const escapeAttr = (text) => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const pageOutput = argValue('--output');
const distFile = path.resolve(argValue('--bundle') || path.resolve(__dirname, '../dist/ProductEngineerProposal.jsx'));
// Relative path from the page back to the site root, so shared assets and links resolve on nested pages
const base = argValue('--base');
const DEFAULT_DESCRIPTION = 'Ashish Kolli — product manager. Accelerating and scaling product with agents.';
const description = argValue('--description') || DEFAULT_DESCRIPTION;
const previewFile = path.resolve(__dirname, '../preview.html');
const productionFile = path.resolve(__dirname, '../dist/index.html');

// Read the bundle
let bundle = fs.readFileSync(distFile, 'utf-8');

// Remove the ES module import line - HTML files use UMD globals
bundle = bundle.replace(/^import React.*from ['"]react['"];?\s*$/m, '');
bundle = bundle.replace(/^import.*from ['"]react['"];?\s*$/gm, '');

// Remove the export default line
bundle = bundle.replace(/^export default App;?\s*$/m, '');

// The whole app as one script: hooks off the React global, the bundle, then the render
const appSource = `const { useState, useEffect, useRef, useCallback, useMemo } = React;

${bundle}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`;

// JSX is compiled here, at build time. Nothing compiles in the browser, and nothing
// is fetched from a third-party CDN - React is served from this domain.
const compile = (minify) => esbuild.transformSync(appSource, {
  loader: 'jsx',
  target: 'es2019',
  minify,
  legalComments: 'none',
}).code.replace(/<\/script/gi, '<\\/script');

const compiled = { true: compile(true), false: compile(false) };

// Generate HTML with specified React builds
function generateHTML({ title, reactMode }) {
  const isProd = reactMode === 'production';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${base ? `<base href="${base}">\n  ` : ''}<title>${escapeAttr(title)}</title>
  <!-- Signature favicon (generated from assets/brand/signature.png) -->
  <link rel="icon" href="favicon.ico" sizes="48x48 32x32 16x16">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <meta name="description" content="${escapeAttr(description)}">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:type" content="website">

  <!-- React 18, served from this domain: no third-party CDN to go down -->
  <script src="assets/vendor/react.production.min.js"></script>
  <script src="assets/vendor/react-dom.production.min.js"></script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>${compiled[isProd]}</script>
</body>
</html>`;
}

if (pageOutput) {
  const outFile = path.resolve(pageOutput);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, generateHTML({ title: argValue('--title') || 'ASHISH KOLLI', reactMode: 'production' }));
  const size = (fs.statSync(outFile).size / 1024).toFixed(1);
  console.log(`✓ ${path.relative(path.resolve(__dirname, '..'), outFile)} (${size} KB)`);
  process.exit(0);
}

// Write development preview
const devHTML = generateHTML({
  title: 'ASHISH KOLLI (Dev)',
  reactMode: 'development'
});
fs.writeFileSync(previewFile, devHTML);
console.log('✓ preview.html updated (development build)');

// Write production build for GitHub Pages
const prodHTML = generateHTML({
  title: 'ASHISH KOLLI',
  reactMode: 'production'
});
fs.writeFileSync(productionFile, prodHTML);
const prodSize = (fs.statSync(productionFile).size / 1024).toFixed(1);
console.log(`✓ dist/index.html updated (production build, ${prodSize} KB)`);

// Also copy to root index.html for GitHub Pages (serves from repo root)
const rootIndexFile = path.resolve(__dirname, '../index.html');
fs.writeFileSync(rootIndexFile, prodHTML);
console.log(`✓ index.html updated (synced with dist)`);
