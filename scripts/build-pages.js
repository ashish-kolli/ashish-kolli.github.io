#!/usr/bin/env node
/**
 * Project Pages Build
 *
 * Every markdown file in content/projects/ becomes its own page:
 *   content/projects/<slug>.md  →  projects/<slug>/index.html
 *
 * Each page runs through the same parser → bundler → HTML steps as the home page,
 * so project pages share every component. Intermediate files go to dist/pages/.
 *
 * Also checks that every project card link on the home page points at a page that exists.
 *
 * Usage: node scripts/build-pages.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'content/projects');
const WORK_DIR = path.join(ROOT, 'dist/pages');
const OUTPUT_DIR = path.join(ROOT, 'projects');

const run = (script, args) => {
  execFileSync(process.execPath, [path.join(ROOT, script), ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
};

const slugs = fs.readdirSync(SOURCE_DIR)
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''))
  .sort();

console.log(`Building ${slugs.length} project pages...\n`);
fs.mkdirSync(WORK_DIR, { recursive: true });

// Remove pages whose markdown was deleted or renamed
if (fs.existsSync(OUTPUT_DIR)) {
  fs.readdirSync(OUTPUT_DIR).forEach((dir) => {
    if (!slugs.includes(dir)) {
      fs.rmSync(path.join(OUTPUT_DIR, dir), { recursive: true });
      console.log(`  removed stale projects/${dir}/`);
    }
  });
}

slugs.forEach((slug) => {
  const input = path.join(SOURCE_DIR, `${slug}.md`);
  const contentFile = path.join(WORK_DIR, `${slug}.content.js`);
  const bundleFile = path.join(WORK_DIR, `${slug}.jsx`);
  const outputFile = path.join(OUTPUT_DIR, slug, 'index.html');

  run('src/utils/parser.js', ['--input', input, '--output', contentFile]);

  const markdown = fs.readFileSync(input, 'utf-8');
  const pageMatch = markdown.match(/<!-- @page ([^>]*?) -->\s*([\s\S]*?)<!-- \/@page -->/);
  if (!pageMatch) {
    console.error(`✗ content/projects/${slug}.md is missing its <!-- @page --> block`);
    process.exit(1);
  }
  const title = (pageMatch[1].match(/title="([^"]*)"/) || [])[1] || slug;
  const summary = pageMatch[2].replace(/\*\*|\*/g, '').replace(/\s+/g, ' ').trim();

  run('src/utils/build.js', ['--content', contentFile, '--output', bundleFile]);
  run('scripts/update-preview.js', [
    '--bundle', bundleFile,
    '--output', outputFile,
    '--base', '../../',
    '--title', `${title} — Ashish Kolli`,
    '--description', summary,
  ]);
  console.log(`  ✓ projects/${slug}/`);
});

// Every home page card must link to a page that was just built
const home = fs.readFileSync(path.join(ROOT, 'Product_Engineer_Proposal.md'), 'utf-8');
const links = [...home.matchAll(/<!-- @project [^>]*href="([^"]*)"/g)]
  .map((m) => m[1])
  // Cards can be unlinked, or point off-site / at a file rather than a page here
  .filter((href) => href && !/^https?:\/\//.test(href) && !/\.[a-z0-9]+$/i.test(href));
const broken = links.filter((href) => !fs.existsSync(path.join(ROOT, href, 'index.html')));
if (broken.length > 0) {
  console.error(`\n✗ Home page cards link to missing pages: ${broken.join(', ')}`);
  process.exit(1);
}
console.log(`\n✓ ${slugs.length} pages built, all ${links.length} home page card links resolve`);
