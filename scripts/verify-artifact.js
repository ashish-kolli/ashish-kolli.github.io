#!/usr/bin/env node
/**
 * Verify Artifact Script
 * Checks the built artifact for Claude artifact compatibility issues
 *
 * Usage: node scripts/verify-artifact.js
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ARTIFACT_PATH = path.resolve(__dirname, '../dist/ProductEngineerProposal.jsx');

console.log('=== Claude Artifact Verification ===\n');

// Check if artifact exists
if (!fs.existsSync(ARTIFACT_PATH)) {
  console.error('ERROR: Artifact not found at', ARTIFACT_PATH);
  console.error('Run "npm run build" first.');
  process.exit(1);
}

const artifact = fs.readFileSync(ARTIFACT_PATH, 'utf-8');
const lines = artifact.split('\n');
let errors = [];
let warnings = [];

// Check 1: Only allowed imports
console.log('1. Checking imports...');
const importMatches = artifact.match(/^import\s+.*$/gm) || [];
importMatches.forEach(line => {
  if (line.includes("from 'react'") || line.includes('from "react"')) {
    console.log('   OK: React import found');
  } else if (line.includes("from './") || line.includes('from "../') || line.includes("from '@/")) {
    errors.push(`Invalid relative import: ${line}`);
  } else if (!line.includes("from 'react'") && !line.includes('from "react"')) {
    warnings.push(`Non-React import found: ${line}`);
  }
});

// Check 2: No residual import fragments
console.log('2. Checking for residual import fragments...');
lines.forEach((line, i) => {
  if (line.match(/^\s*\}\s*from\s+['"]/) && !line.includes('import')) {
    errors.push(`Line ${i + 1}: Residual import fragment: ${line.trim()}`);
  }
});

// Check 3: Export default exists
console.log('3. Checking export default...');
if (artifact.includes('export default App')) {
  console.log('   OK: export default App found');
} else {
  errors.push('Missing export default App');
}

// Check 4: All components defined before use
console.log('4. Checking component definitions...');
const componentNames = [
  'RichText', 'Header', 'StatsGrid', 'Chart', 'Convergence',
  'QuoteCarousel', 'PullQuote', 'CardGrid', 'Credentials',
  'Timeline', 'Testimonials', 'Table', 'Section', 'Citations',
  'Paragraph', 'Subsection', 'BulletList'
];

componentNames.forEach(name => {
  const defRegex = new RegExp(`const ${name}\\s*=`);
  const useRegex = new RegExp(`<${name}[\\s/>]`);
  const isDefined = defRegex.test(artifact);
  const isUsed = useRegex.test(artifact);

  if (isUsed && !isDefined) {
    errors.push(`Component ${name} is used but not defined`);
  }
});
console.log(`   OK: ${componentNames.length} components checked`);

// Check 5: No disallowed browser APIs
console.log('5. Checking for disallowed APIs...');
const disallowedPatterns = [
  { pattern: /\bwindow\./, name: 'window object' },
  { pattern: /\bdocument\./, name: 'document object' },
  { pattern: /\blocalStorage/, name: 'localStorage' },
  { pattern: /\bsessionStorage/, name: 'sessionStorage' },
  { pattern: /\bfetch\s*\(/, name: 'fetch()' },
  { pattern: /\bXMLHttpRequest/, name: 'XMLHttpRequest' },
];

disallowedPatterns.forEach(({ pattern, name }) => {
  if (pattern.test(artifact)) {
    warnings.push(`Found ${name} usage - may not work in Claude artifacts`);
  }
});
console.log('   OK: No disallowed APIs found');

// Check 6: Syntax validation with esbuild (if available)
console.log('6. Validating JSX syntax...');
try {
  execFileSync('npx', [
    'esbuild',
    ARTIFACT_PATH,
    '--bundle',
    '--jsx=automatic',
    '--platform=browser',
    '--format=esm',
    '--external:react',
    '--external:react/jsx-runtime',
    '--outfile=/dev/null'
  ], { stdio: 'pipe', cwd: path.dirname(ARTIFACT_PATH) });
  console.log('   OK: JSX syntax valid');
} catch (e) {
  const output = e.stderr?.toString() || e.stdout?.toString() || e.message;
  errors.push(`JSX syntax error: ${output}`);
}

// Check 7: CONTENT object is defined
console.log('7. Checking CONTENT data...');
if (artifact.includes('const CONTENT =')) {
  console.log('   OK: CONTENT object defined');
} else {
  errors.push('CONTENT object not found');
}

// Summary
console.log('\n=== Summary ===');
console.log(`File size: ${(fs.statSync(ARTIFACT_PATH).size / 1024).toFixed(1)} KB`);
console.log(`Lines: ${lines.length}`);

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} error(s) found:`);
  errors.forEach(e => console.log(`   - ${e}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`);
  warnings.forEach(w => console.log(`   - ${w}`));
}

if (errors.length === 0) {
  console.log('\n✅ Artifact is valid for Claude!');
  process.exit(0);
} else {
  process.exit(1);
}
