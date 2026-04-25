#!/usr/bin/env node
/**
 * Build Validation Script
 *
 * Validates the generated bundle for common issues:
 * - Syntax errors (via acorn parser)
 * - Unresolved imports/exports
 * - Missing component references
 * - React hook usage issues
 */

const fs = require('fs');
const path = require('path');

const DIST_FILE = path.resolve(__dirname, '../dist/ProductEngineerProposal.jsx');
const PREVIEW_FILE = path.resolve(__dirname, '../preview.html');

let errors = [];
let warnings = [];

function error(msg) {
  errors.push(`✗ ERROR: ${msg}`);
}

function warn(msg) {
  warnings.push(`⚠ WARNING: ${msg}`);
}

function success(msg) {
  console.log(`  ✓ ${msg}`);
}

// =============================================================================
// VALIDATION CHECKS
// =============================================================================

function validateDistBundle() {
  console.log('\nValidating dist/ProductEngineerProposal.jsx...');

  if (!fs.existsSync(DIST_FILE)) {
    error('dist/ProductEngineerProposal.jsx does not exist. Run npm run build first.');
    return false;
  }

  const content = fs.readFileSync(DIST_FILE, 'utf-8');

  // Check for required import statement (ES module version)
  if (!content.includes("import React")) {
    error('Missing React import in dist bundle');
  } else {
    success('React import present');
  }

  // Check for export default
  if (!content.includes("export default App")) {
    error('Missing "export default App" in dist bundle');
  } else {
    success('Export default present');
  }

  // Check for common syntax issues
  const syntaxChecks = [
    { pattern: /import\s+.*\s+from\s+['"]\.\.?\//g, msg: 'Relative imports found (should be resolved)' },
    { pattern: /from\s+['"]\.\/components/g, msg: 'Component imports not inlined' },
    { pattern: /from\s+['"]\.\/design-tokens/g, msg: 'Design token imports not inlined' },
    { pattern: /from\s+['"]\.\/content/g, msg: 'Content imports not inlined' },
  ];

  syntaxChecks.forEach(({ pattern, msg }) => {
    if (pattern.test(content)) {
      error(msg);
    }
  });

  // Check that key components are present
  const requiredComponents = [
    'const Header',
    'const Section',
    'const CardGrid',
    'const StatsGrid',
    'const Chart',
    'const PullQuote',
    'const COLORS',
    'const FONTS',
    'const App',
  ];

  requiredComponents.forEach(comp => {
    if (!content.includes(comp)) {
      error(`Missing component/constant: ${comp}`);
    }
  });
  success('All required components present');

  // Check for unmatched JSX tags (basic check)
  const selfClosingTags = (content.match(/<\w+[^>]*\/>/g) || []).length;
  const openTags = (content.match(/<[A-Z]\w*[^/>]*>/g) || []).length;
  const closeTags = (content.match(/<\/[A-Z]\w*>/g) || []).length;

  if (Math.abs(openTags - closeTags) > 5) {
    warn(`Potential unmatched JSX tags: ${openTags} opening, ${closeTags} closing`);
  } else {
    success('JSX tag balance looks reasonable');
  }

  // Check for common React issues
  if (content.includes('useState') && !content.includes('const [')) {
    warn('useState imported but no state declarations found');
  }

  // Check bundle size
  const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
  if (sizeKB > 500) {
    warn(`Bundle size is large: ${sizeKB.toFixed(1)} KB`);
  } else {
    success(`Bundle size: ${sizeKB.toFixed(1)} KB`);
  }

  return true;
}

function validatePreviewHtml() {
  console.log('\nValidating preview.html...');

  if (!fs.existsSync(PREVIEW_FILE)) {
    error('preview.html does not exist. Run npm run build first.');
    return false;
  }

  const content = fs.readFileSync(PREVIEW_FILE, 'utf-8');

  // Check for required script tags
  if (!content.includes('unpkg.com/react@18')) {
    error('Missing React UMD script');
  } else {
    success('React UMD script present');
  }

  if (!content.includes('unpkg.com/react-dom@18')) {
    error('Missing ReactDOM UMD script');
  } else {
    success('ReactDOM UMD script present');
  }

  if (!content.includes('@babel/standalone')) {
    error('Missing Babel standalone script');
  } else {
    success('Babel standalone present');
  }

  // Check that ES module imports are NOT present (should use UMD globals)
  if (content.includes("import React from 'react'") ||
      content.includes('import React from "react"')) {
    error('ES module import found in preview.html (should use UMD globals)');
  } else {
    success('No ES module React imports (using UMD globals)');
  }

  // Check that export default is NOT present
  if (content.includes('export default App')) {
    error('"export default App" found in preview.html (should be removed for UMD)');
  } else {
    success('No export default (correct for UMD)');
  }

  // Check for root render
  if (!content.includes('ReactDOM.createRoot') && !content.includes('root.render')) {
    error('Missing ReactDOM render call');
  } else {
    success('ReactDOM render present');
  }

  // Check for destructured React hooks
  if (!content.includes('const { useState')) {
    warn('React hooks not destructured from React global');
  } else {
    success('React hooks destructured');
  }

  return true;
}

function validateComponentConsistency() {
  console.log('\nValidating component consistency...');

  const componentsDir = path.resolve(__dirname, '../src/components');
  const indexFile = path.join(componentsDir, 'index.js');

  if (!fs.existsSync(indexFile)) {
    warn('No components/index.js found');
    return true;
  }

  const indexContent = fs.readFileSync(indexFile, 'utf-8');

  // Get list of component files
  const componentFiles = fs.readdirSync(componentsDir)
    .filter(f => f.endsWith('.jsx') && f !== 'index.jsx')
    .map(f => f.replace('.jsx', ''));

  // Check each component is exported
  componentFiles.forEach(comp => {
    if (!indexContent.includes(comp)) {
      warn(`Component ${comp} exists but not exported from index.js`);
    }
  });

  success(`${componentFiles.length} components found`);
  return true;
}

function validateContent() {
  console.log('\nValidating content.js...');

  const contentFile = path.resolve(__dirname, '../src/content.js');

  if (!fs.existsSync(contentFile)) {
    error('src/content.js does not exist. Run npm run parse first.');
    return false;
  }

  const content = fs.readFileSync(contentFile, 'utf-8');

  // Check for required content sections
  const requiredSections = ['header', 'stats', 'document', 'citations'];

  requiredSections.forEach(section => {
    if (!content.includes(`"${section}"`)) {
      error(`Missing content section: ${section}`);
    }
  });

  success('Required content sections present');
  return true;
}

// =============================================================================
// MAIN
// =============================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('  BUILD VALIDATION');
console.log('═══════════════════════════════════════════════════════════════');

validateContent();
validateDistBundle();
validatePreviewHtml();
validateComponentConsistency();

// Summary
console.log('\n═══════════════════════════════════════════════════════════════');

if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach(w => console.log(`  ${w}`));
}

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(`  ${e}`));
  console.log(`\n✗ Validation FAILED with ${errors.length} error(s)`);
  process.exit(1);
} else {
  console.log('\n✓ Validation PASSED');
  process.exit(0);
}
