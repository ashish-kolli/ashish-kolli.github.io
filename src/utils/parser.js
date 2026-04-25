#!/usr/bin/env node
/**
 * Enhanced Markdown Parser - v2
 * Extracts ALL content from Product_Engineer_Proposal.md into structured blocks
 * App.jsx renders purely from this parsed data - no hardcoded content
 *
 * Usage: node src/utils/parser.js
 * Output: src/content.js
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.resolve(__dirname, '../../Product_Engineer_Proposal.md');
const OUTPUT_FILE = path.resolve(__dirname, '../content.js');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function readMarkdown() {
  return fs.readFileSync(INPUT_FILE, 'utf-8');
}

function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function extractAttr(line, attrName) {
  const regex = new RegExp(`${attrName}="([^"]*)"`, 'i');
  const match = line.match(regex);
  return match ? match[1] : null;
}

// ============================================================================
// COMPONENT EXTRACTORS (for top-level component data)
// ============================================================================

function extractHeader(content) {
  const headerMatch = content.match(/<!-- @header -->[\s\S]*?<!-- \/@header -->/);
  if (!headerMatch) return null;

  const block = headerMatch[0];
  const fromMatch = block.match(/<!-- @from name="([^"]*)" email="([^"]*)"(?: linkedin="([^"]*)")?(?: github="([^"]*)")? -->/);
  const headshotMatch = block.match(/<!-- @headshot url="([^"]*)" -->/);
  const dateMatch = block.match(/<!-- @date value="([^"]*)" -->/);
  const titleMatch = block.match(/<!-- @title value="([^"]*)" -->/);
  const subtitleMatch = block.match(/<!-- @subtitle value="([^"]*)" -->/);

  return {
    from: fromMatch ? fromMatch[1] : '',
    fromEmail: fromMatch ? fromMatch[2] : '',
    linkedin: fromMatch && fromMatch[3] ? fromMatch[3] : '',
    github: fromMatch && fromMatch[4] ? fromMatch[4] : '',
    headshot: headshotMatch ? headshotMatch[1] : '',
    date: dateMatch ? dateMatch[1] : '',
    title: titleMatch ? titleMatch[1] : '',
    subtitle: subtitleMatch ? subtitleMatch[1] : '',
  };
}

function extractStats(content) {
  const statsMatch = content.match(/<!-- @stats -->[\s\S]*?<!-- \/@stats -->/);
  if (!statsMatch) return [];

  const block = statsMatch[0];
  const stats = [];
  const statRegex = /<!-- @stat value="([^"]*)" label="([^"]*)" source="([^"]*)" -->/g;
  let match;

  while ((match = statRegex.exec(block)) !== null) {
    stats.push({ value: match[1], label: match[2], source: match[3] });
  }
  return stats;
}

function extractCharts(content) {
  const charts = [];
  const chartRegex = /<!-- @chart type="([^"]*)"([^>]*) -->[\s\S]*?<!-- \/@chart -->/g;
  let match;

  while ((match = chartRegex.exec(content)) !== null) {
    const type = match[1];
    const attrs = match[2];
    const block = match[0];
    const title = extractAttr(attrs, 'title') || '';
    const subtitle = extractAttr(attrs, 'subtitle') || '';
    const chart = { type, title, subtitle };

    if (type === 'growth') {
      chart.series = [];
      const seriesRegex = /<!-- @series label="([^"]*)" -->[\s\S]*?<!-- \/@series -->/g;
      let seriesMatch;
      while ((seriesMatch = seriesRegex.exec(block)) !== null) {
        const series = { label: seriesMatch[1], points: [] };
        const pointRegex = /<!-- @point year="([^"]*)" value="([^"]*)" -->/g;
        let pointMatch;
        while ((pointMatch = pointRegex.exec(seriesMatch[0])) !== null) {
          series.points.push({ year: pointMatch[1], value: parseInt(pointMatch[2], 10) });
        }
        chart.series.push(series);
      }
    } else if (type === 'bar') {
      chart.bars = [];
      const barRegex = /<!-- @bar label="([^"]*)" value="([^"]*)" unit="([^"]*)"(?: source="([^"]*)")?(?: cite="([^"]*)")? -->/g;
      let barMatch;
      while ((barMatch = barRegex.exec(block)) !== null) {
        chart.bars.push({
          label: barMatch[1], value: parseFloat(barMatch[2]), unit: barMatch[3],
          source: barMatch[4] || '', cite: barMatch[5] || ''
        });
      }
    } else if (type === 'hierarchy') {
      chart.levels = [];
      const levelRegex = /<!-- @level from="([^"]*)" to="([^"]*)" -->/g;
      let levelMatch;
      while ((levelMatch = levelRegex.exec(block)) !== null) {
        chart.levels.push({ from: levelMatch[1], to: levelMatch[2] });
      }
    } else if (type === 'range') {
      chart.ranges = [];
      const rangeRegex = /<!-- @range label="([^"]*)" min="([^"]*)" max="([^"]*)" unit="([^"]*)"(?: highlight="([^"]*)")? -->/g;
      let rangeMatch;
      while ((rangeMatch = rangeRegex.exec(block)) !== null) {
        chart.ranges.push({
          label: rangeMatch[1], min: parseInt(rangeMatch[2], 10), max: parseInt(rangeMatch[3], 10),
          unit: rangeMatch[4], highlight: rangeMatch[5] === 'true'
        });
      }
    }
    charts.push(chart);
  }
  return charts;
}

function extractConvergence(content) {
  const convRegex = /<!-- @convergence(?: position="([^"]*)")? -->[\s\S]*?<!-- \/@convergence -->/g;
  const convMatch = convRegex.exec(content);
  if (!convMatch) return { position: 'after', roles: [] };

  const block = convMatch[0];
  const roles = [];
  const roleRegex = /<!-- @role from="([^"]*)" to="([^"]*)" description="([^"]*)" -->/g;
  let match;
  while ((match = roleRegex.exec(block)) !== null) {
    roles.push({ from: match[1], to: match[2], description: match[3] });
  }
  return { position: convMatch[1] || 'after', roles };
}

function extractQuotes(content) {
  const quotes = [];
  const blockRegex = /<!-- @quotes[^>]*-->[\s\S]*?<!-- \/@quotes -->/g;
  const blocks = content.match(blockRegex) || [];
  const quoteRegex = /<!-- @quote author="([^"]*)" title="([^"]*)"(?: cite="([^"]*)")? -->\s*([\s\S]*?)<!-- \/@quote -->/g;

  for (const block of blocks) {
    const sectionMatch = block.match(/<!-- @quotes[^>]*section="([^"]*)"[^>]*-->/);
    const section = sectionMatch ? sectionMatch[1] : '';
    quoteRegex.lastIndex = 0;
    let match;
    while ((match = quoteRegex.exec(block)) !== null) {
      quotes.push({ author: match[1], title: match[2], cite: match[3] || '', quote: cleanText(match[4]), section });
    }
  }
  return quotes;
}

function extractPullQuotes(content) {
  const pullquotes = [];
  const pqRegex = /<!-- @pullquote(?: author="([^"]*)")?(?: title="([^"]*)")? -->([\s\S]*?)<!-- \/@pullquote -->/g;
  let match;
  while ((match = pqRegex.exec(content)) !== null) {
    pullquotes.push({ author: match[1] || '', title: match[2] || '', quote: cleanText(match[3]) });
  }
  return pullquotes;
}

function extractCards(content) {
  const cardsGroups = [];
  const cardsRegex = /<!-- @cards type="([^"]*)"(?: columns="([^"]*)")?(?: section="([^"]*)")? -->[\s\S]*?<!-- \/@cards -->/g;
  let match;

  while ((match = cardsRegex.exec(content)) !== null) {
    const type = match[1];
    const columns = parseInt(match[2] || '3', 10);
    const section = match[3] || null;
    const block = match[0];
    const cards = [];
    const cardRegex = /<!-- @card icon="([^"]*)" title="([^"]*)"(?: audience="([^"]*)")? -->\s*([\s\S]*?)<!-- \/@card -->/g;
    let cardMatch;

    while ((cardMatch = cardRegex.exec(block)) !== null) {
      const cardContent = cardMatch[4];
      const expandedMatch = cardContent.match(/^([\s\S]*?)<!-- @expanded -->([\s\S]*?)$/);
      if (expandedMatch) {
        cards.push({
          icon: cardMatch[1], title: cardMatch[2], audience: cardMatch[3] || '',
          content: cleanText(expandedMatch[1]), expandedContent: cleanText(expandedMatch[2])
        });
      } else {
        cards.push({ icon: cardMatch[1], title: cardMatch[2], audience: cardMatch[3] || '', content: cleanText(cardContent) });
      }
    }
    cardsGroups.push({ type, columns, section, cards });
  }
  return cardsGroups;
}

function extractCredentials(content) {
  const credMatch = content.match(/<!-- @credentials -->[\s\S]*?<!-- \/@credentials -->/);
  if (!credMatch) return [];
  const block = credMatch[0];
  const credentials = [];
  const credRegex = /<!-- @credential value="([^"]*)" label="([^"]*)" -->/g;
  let match;
  while ((match = credRegex.exec(block)) !== null) {
    credentials.push({ value: match[1], label: match[2] });
  }
  return credentials;
}

function extractTimeline(content) {
  const timelineMatch = content.match(/<!-- @timeline -->[\s\S]*?<!-- \/@timeline -->/);
  if (!timelineMatch) return [];
  const block = timelineMatch[0];
  const entries = [];
  const entryRegex = /<!-- @entry year="([^"]*)" company="([^"]*)" title="([^"]*)" highlight="([^"]*)" -->\s*([\s\S]*?)<!-- \/@entry -->/g;
  let match;
  while ((match = entryRegex.exec(block)) !== null) {
    entries.push({ year: match[1], company: match[2], title: match[3], highlight: match[4] === 'true', content: cleanText(match[5]) });
  }
  return entries;
}

function extractTestimonials(content) {
  const testimonialGroups = [];
  const testRegex = /<!-- @testimonials type="([^"]*)"(?: source="([^"]*)")? -->[\s\S]*?<!-- \/@testimonials -->/g;
  let match;

  while ((match = testRegex.exec(content)) !== null) {
    const type = match[1];
    const source = match[2] || '';
    const block = match[0];
    const testimonials = [];
    const tRegex = /<!-- @testimonial(?: author="([^"]*)")?(?: title="([^"]*)")?(?: subtitle="([^"]*)")? -->\s*([\s\S]*?)<!-- \/@testimonial -->/g;
    let tMatch;
    while ((tMatch = tRegex.exec(block)) !== null) {
      testimonials.push({ author: tMatch[1] || '', title: tMatch[2] || '', subtitle: tMatch[3] || '', content: cleanText(tMatch[4]) });
    }
    testimonialGroups.push({ type, source, testimonials });
  }
  return testimonialGroups;
}

function extractTables(content) {
  const tables = [];
  const tableRegex = /\|([^\n]+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|[^\n]+\|\s*\n?)+)/g;
  let tableMatch;

  while ((tableMatch = tableRegex.exec(content)) !== null) {
    const headers = tableMatch[1].split('|').map(h => h.trim()).filter(h => h);
    const rowLines = tableMatch[2].trim().split('\n');
    const rows = rowLines.map(line => line.split('|').map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length));
    let variant = 'default';
    const tableStart = tableMatch.index;
    const hintCheck = content.substring(tableStart - 100, tableStart);
    const variantMatch = hintCheck.match(/<!-- @table variant="([^"]*)" -->/);
    if (variantMatch) variant = variantMatch[1];
    tables.push({ headers, rows, variant });
  }
  return tables;
}

function extractTerminals(content) {
  const terminals = [];
  const terminalRegex = /<!-- @terminal title="([^"]*)"(?: command="([^"]*)")?(?: variant="([^"]*)")? -->\s*([\s\S]*?)<!-- \/@terminal -->/g;
  let match;

  while ((match = terminalRegex.exec(content)) !== null) {
    const title = match[1];
    const command = match[2] || 'cat';
    const variant = match[3] || 'default';
    const contentBlock = match[4].trim();
    const lines = contentBlock.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('<!--'))
      .map(line => (line.startsWith('- ') || line.startsWith('* ')) ? '• ' + line.slice(2) : line);
    terminals.push({ title, command, variant, lines });
  }
  return terminals;
}

function extractWorkLists(content) {
  const workLists = [];
  const workListRegex = /<!-- @worklist section="([^"]*)" -->\s*([\s\S]*?)<!-- \/@worklist -->/g;
  let match;

  while ((match = workListRegex.exec(content)) !== null) {
    const section = match[1];
    const block = match[2];
    const items = [];

    // Extract individual work items
    const itemRegex = /<!-- @workitem icon="([^"]*)" title="([^"]*)"(?: technologies="([^"]*)")? -->\s*([\s\S]*?)<!-- \/@workitem -->/g;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(block)) !== null) {
      const icon = itemMatch[1];
      const title = itemMatch[2];
      const technologiesStr = itemMatch[3] || '';
      const description = cleanText(itemMatch[4]);

      const technologies = technologiesStr
        ? technologiesStr.split(',').map(t => t.trim()).filter(t => t)
        : [];

      items.push({ icon, title, technologies, description });
    }

    workLists.push({ section, items });
  }
  return workLists;
}

function extractCitations(content) {
  const citationsMatch = content.match(/## Citations\s*\n([\s\S]*?)$/);
  if (!citationsMatch) return [];
  const citationsText = citationsMatch[1].trim();
  const citations = [];
  const lines = citationsText.split('\n');
  let currentCitation = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('###')) continue;
    if (trimmed.match(/^\[\d+\]/)) {
      if (currentCitation) citations.push(cleanText(currentCitation));
      currentCitation = trimmed;
    } else if (currentCitation) {
      currentCitation += ' ' + trimmed;
    }
  }
  if (currentCitation) citations.push(cleanText(currentCitation));
  return citations;
}

// ============================================================================
// CONTENT BLOCK PARSER - Parses prose into structured blocks
// ============================================================================

function parseContentBlocks(text) {
  const blocks = [];
  if (!text || !text.trim()) return blocks;

  // Remove component markers (they'll be handled separately)
  let cleaned = text
    .replace(/<!-- @stats -->[\s\S]*?<!-- \/@stats -->/g, '<!--COMPONENT:stats-->')
    .replace(/<!-- @chart[^>]*-->[\s\S]*?<!-- \/@chart -->/g, (match) => {
      const typeMatch = match.match(/type="([^"]*)"/);
      return `<!--COMPONENT:chart:${typeMatch ? typeMatch[1] : 'unknown'}-->`;
    })
    .replace(/<!-- @convergence[^>]*-->[\s\S]*?<!-- \/@convergence -->/g, '<!--COMPONENT:convergence-->')
    .replace(/<!-- @quotes[^>]*-->[\s\S]*?<!-- \/@quotes -->/g, (match) => {
      const sectionMatch = match.match(/section="([^"]*)"/);
      return `<!--COMPONENT:quotes:${sectionMatch ? sectionMatch[1] : ''}-->`;
    })
    .replace(/<!-- @pullquote[^>]*-->([\s\S]*?)<!-- \/@pullquote -->/g, (match, content) => {
      return `<!--COMPONENT:pullquote:${cleanText(content).substring(0, 50)}-->`;
    })
    .replace(/<!-- @cards[^>]*-->[\s\S]*?<!-- \/@cards -->/g, (match) => {
      const sectionMatch = match.match(/section="([^"]*)"/);
      return `<!--COMPONENT:cards:${sectionMatch ? sectionMatch[1] : ''}-->`;
    })
    .replace(/<!-- @credentials -->[\s\S]*?<!-- \/@credentials -->/g, '<!--COMPONENT:credentials-->')
    .replace(/<!-- @timeline -->[\s\S]*?<!-- \/@timeline -->/g, '<!--COMPONENT:timeline-->')
    .replace(/<!-- @testimonials[^>]*-->[\s\S]*?<!-- \/@testimonials -->/g, (match) => {
      const typeMatch = match.match(/type="([^"]*)"/);
      return `<!--COMPONENT:testimonials:${typeMatch ? typeMatch[1] : ''}-->`;
    })
    .replace(/<!-- @terminal[^>]*-->[\s\S]*?<!-- \/@terminal -->/g, '<!--COMPONENT:terminal-->')
    .replace(/<!-- @worklist[^>]*-->[\s\S]*?<!-- \/@worklist -->/g, (match) => {
      const sectionMatch = match.match(/section="([^"]*)"/);
      return `<!--COMPONENT:worklist:${sectionMatch ? sectionMatch[1] : ''}-->`;
    })
    .replace(/<!-- @table[^>]*-->/g, '');

  // Split into paragraphs/elements
  const parts = cleaned.split(/\n\n+/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Component placeholder
    if (trimmed.startsWith('<!--COMPONENT:')) {
      const match = trimmed.match(/<!--COMPONENT:([^:>]+)(?::([^>]*))?-->/);
      if (match) {
        blocks.push({ type: 'component', component: match[1], param: match[2] || '' });
      }
      continue;
    }

    // Table (markdown table syntax)
    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      blocks.push({ type: 'table' });
      continue;
    }

    // Bullet list
    if (trimmed.match(/^[-*]\s/m)) {
      const items = trimmed.split(/\n/).filter(line => line.match(/^[-*]\s/)).map(line => line.replace(/^[-*]\s+/, '').trim());
      if (items.length > 0) {
        blocks.push({ type: 'bulletList', items });
      }
      continue;
    }

    // Regular paragraph
    const text = trimmed.replace(/\n/g, ' ').trim();
    if (text && !text.startsWith('<!--') && !text.startsWith('---')) {
      blocks.push({ type: 'paragraph', text });
    }
  }

  return blocks;
}

// ============================================================================
// SECTION EXTRACTOR - Extracts full document structure
// ============================================================================

function extractDocument(content) {
  const document = [];

  // Extract header section first
  const headerMatch = content.match(/<!-- @header -->[\s\S]*?<!-- \/@header -->/);
  if (headerMatch) {
    document.push({ type: 'header' });
  }

  // Find the main content (after header, before citations)
  const mainContent = content
    .replace(/<!-- @header -->[\s\S]*?<!-- \/@header -->/, '')
    .replace(/## Citations[\s\S]*$/, '')
    .trim();

  // Split by section headers (## N. Title)
  const sectionRegex = /## (\d+)\. ([^\n]+)/g;
  let match;
  const sectionMatches = [];

  while ((match = sectionRegex.exec(mainContent)) !== null) {
    sectionMatches.push({ index: match.index, number: match[1], title: match[2].trim(), fullMatch: match[0] });
  }

  // Process each section
  for (let i = 0; i < sectionMatches.length; i++) {
    const section = sectionMatches[i];
    const nextIndex = i < sectionMatches.length - 1 ? sectionMatches[i + 1].index : mainContent.length;
    const sectionContent = mainContent.substring(section.index + section.fullMatch.length, nextIndex).trim();

    const sectionData = {
      type: 'section',
      number: parseInt(section.number, 10),
      title: section.title,
      subsections: []
    };

    // Split section into subsections (### Title)
    const subsectionRegex = /### ([^\n]+)/g;
    const subsectionMatches = [];
    let subMatch;

    while ((subMatch = subsectionRegex.exec(sectionContent)) !== null) {
      subsectionMatches.push({ index: subMatch.index, title: subMatch[1].trim(), fullMatch: subMatch[0] });
    }

    // Content before first subsection (intro)
    const introEnd = subsectionMatches.length > 0 ? subsectionMatches[0].index : sectionContent.length;
    const introContent = sectionContent.substring(0, introEnd).trim();
    if (introContent) {
      sectionData.intro = parseContentBlocks(introContent);
    }

    // Process each subsection
    for (let j = 0; j < subsectionMatches.length; j++) {
      const subsection = subsectionMatches[j];
      const nextSubIndex = j < subsectionMatches.length - 1 ? subsectionMatches[j + 1].index : sectionContent.length;
      const subsectionContent = sectionContent.substring(subsection.index + subsection.fullMatch.length, nextSubIndex).trim();

      sectionData.subsections.push({
        title: subsection.title,
        blocks: parseContentBlocks(subsectionContent)
      });
    }

    document.push(sectionData);
  }

  // Add citations
  document.push({ type: 'citations' });

  return document;
}

// ============================================================================
// MAIN EXTRACTION
// ============================================================================

function extractContent(markdown) {
  return {
    header: extractHeader(markdown),
    stats: extractStats(markdown),
    charts: extractCharts(markdown),
    convergence: extractConvergence(markdown),
    quotes: extractQuotes(markdown),
    pullquotes: extractPullQuotes(markdown),
    cards: extractCards(markdown),
    credentials: extractCredentials(markdown),
    timeline: extractTimeline(markdown),
    testimonials: extractTestimonials(markdown),
    tables: extractTables(markdown),
    terminals: extractTerminals(markdown),
    workLists: extractWorkLists(markdown),
    citations: extractCitations(markdown),
    document: extractDocument(markdown),
  };
}

function generateOutput(content) {
  return `// Auto-generated from Product_Engineer_Proposal.md
// Generated: ${new Date().toISOString()}
// Run: node src/utils/parser.js

const CONTENT = ${JSON.stringify(content, null, 2)};

export default CONTENT;
`;
}

function main() {
  console.log('Reading markdown...');
  const markdown = readMarkdown();

  console.log('Extracting content...');
  const content = extractContent(markdown);

  console.log('Generating output...');
  const output = generateOutput(content);

  fs.writeFileSync(OUTPUT_FILE, output);
  console.log(`Done! Wrote ${OUTPUT_FILE}`);

  console.log('\nContent summary:');
  console.log(`- Header: ${content.header ? 'yes' : 'no'}`);
  console.log(`- Stats: ${content.stats.length}`);
  console.log(`- Charts: ${content.charts.length}`);
  console.log(`- Convergence roles: ${content.convergence.roles.length}`);
  console.log(`- Industry quotes: ${content.quotes.length}`);
  console.log(`- Pull quotes: ${content.pullquotes.length}`);
  console.log(`- Card groups: ${content.cards.length}`);
  console.log(`- Credentials: ${content.credentials.length}`);
  console.log(`- Timeline entries: ${content.timeline.length}`);
  console.log(`- Testimonial groups: ${content.testimonials.length}`);
  console.log(`- Tables: ${content.tables.length}`);
  console.log(`- Terminals: ${content.terminals.length}`);
  console.log(`- Work lists: ${content.workLists.length}`);
  console.log(`- Citations: ${content.citations.length}`);
  console.log(`- Document sections: ${content.document.filter(d => d.type === 'section').length}`);
}

main();
