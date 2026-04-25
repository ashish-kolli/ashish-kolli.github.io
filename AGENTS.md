<!-- Last updated: 2026-04-12 -->
<!-- SYNCED FILE: Edit any of CLAUDE.md, AGENTS.md, or GEMINI.md then run `npm run sync-docs` -->

# Northwestern Publishing System - Component Architecture

A modular React component system that separates content from presentation, enabling markdown-driven document generation with rich visual components. Powers two published pages:

1. **Product Engineer Proposal** (`index.html`) — pitch document with custom component markers
2. **Market Sizing Guide** (`market-sizing/index.html`) — course article for MPD-409

Both share the same design token system, React component library, and visual aesthetic (animated section headers, floating nav, scroll animations).

## Overview

### Proposal Pipeline (index.html)

```
Product_Engineer_Proposal.md  →  npm run parse  →  src/content.js
                                                          ↓
                              src/components/*.jsx + src/App.jsx
                                                          ↓
                              npm run build  →  dist/ProductEngineerProposal.jsx
                                                          ↓
                              npm run build  →  dist/index.html → index.html
```

### Article Pipeline (market-sizing/index.html)

```
articles/market-sizing/content.md + diagrams/*.svg + headshot.png
                                          ↓
                              npm run parse:article  →  src/article-content.js
                                                              ↓
                              src/components/*.jsx + src/ArticleApp.jsx
                                                              ↓
                              npm run build:article  →  dist/MarketSizingGuide.jsx
                                                              ↓
                                                        market-sizing/index.html
```

## Directory Structure

```
northwestern/
├── Product_Engineer_Proposal.md    # Proposal source (SINGLE SOURCE OF TRUTH)
├── package.json                    # npm scripts
├── CLAUDE.md                       # Agent docs (synced)
├── AGENTS.md                       # Agent docs (synced)
├── GEMINI.md                       # Agent docs (synced)
├── preview.html                    # Browser preview (uses UMD build)
├── index.html                      # Proposal output (GitHub Pages root)
│
├── articles/
│   └── market-sizing/
│       ├── content.md             # Article source markdown (SINGLE SOURCE OF TRUTH)
│       ├── headshot.png           # Author headshot (inlined as base64)
│       └── diagrams/             # SVG diagrams (inlined at build time)
│           ├── tam-sam-som.svg
│           ├── filtered-bottom-up.svg
│           ├── jiobit-waterfall.svg
│           ├── bowling-pins.svg
│           ├── interview-to-survey.svg
│           ├── workflow-steps.svg
│           └── assumptions-ledger.svg
│
├── market-sizing/
│   └── index.html                 # Article output (GitHub Pages /market-sizing/)
│
├── src/
│   ├── App.jsx                     # Proposal layout/composition
│   ├── ArticleApp.jsx              # Article layout/composition
│   ├── content.js                  # Generated proposal data (DO NOT EDIT)
│   ├── article-content.js          # Generated article data (DO NOT EDIT)
│   ├── design-tokens.js            # Colors, fonts, spacing, effects (SHARED)
│   ├── components/                 # Shared component library
│   │   ├── index.js               # Component exports
│   │   ├── RichText.jsx           # Markdown formatting parser
│   │   ├── Header.jsx             # Hero header (proposal)
│   │   ├── StatsGrid.jsx          # Statistics display
│   │   ├── Chart.jsx              # 4 chart types
│   │   ├── Convergence.jsx        # Role convergence diagram
│   │   ├── QuoteCarousel.jsx      # Industry quotes
│   │   ├── PullQuote.jsx          # Featured quotes
│   │   ├── CardGrid.jsx           # Card layouts (profile, feature, topic)
│   │   ├── Credentials.jsx        # Credential badges
│   │   ├── Timeline.jsx           # Career timeline
│   │   ├── Testimonials.jsx       # Testimonial cards
│   │   ├── Table.jsx              # Markdown tables
│   │   ├── Section.jsx            # Section/subsection layout + useInView hook
│   │   ├── SectionNav.jsx         # Floating section navigation (proposal)
│   │   ├── TerminalWindow.jsx     # macOS-style terminal window
│   │   ├── WorkList.jsx           # Work list items
│   │   └── Citations.jsx          # Citation formatting
│   └── utils/
│       ├── parser.js              # Proposal markdown → content.js
│       └── build.js               # Proposal bundle → single artifact
├── scripts/
│   ├── parse-article.js           # Article markdown → article-content.js
│   ├── build-article.js           # Article bundle → MarketSizingGuide.jsx
│   ├── update-article-preview.js  # Article bundle → market-sizing/index.html
│   ├── validate-build.js          # Build validation checks
│   ├── update-preview.js          # Proposal bundle → preview.html
│   ├── verify-artifact.js         # Claude artifact compatibility check
│   └── sync-agent-docs.js         # Bidirectional doc sync
└── dist/
    ├── ProductEngineerProposal.jsx # Proposal artifact
    ├── MarketSizingGuide.jsx       # Article artifact
    └── index.html                  # Proposal HTML output
```

## Core Principle: Single Source of Truth

**All content lives in `Product_Engineer_Proposal.md`**. The markdown file is the authoritative source for:
- All text content, quotes, statistics, and data
- Component placement via section attributes
- Citations and references

**Never hardcode content in App.jsx or components.** If you need content to appear somewhere:
1. Add it to the markdown with appropriate markers
2. Use section/position attributes to control placement
3. Update parser.js if needed to extract new attributes
4. Use helper functions in App.jsx to filter content by section

## Build Commands

### Proposal (index.html)
```bash
npm run parse         # Extract content from markdown → src/content.js
npm run build         # Bundle components + validate → dist/ProductEngineerProposal.jsx
npm run all           # Run parse + build + verify in sequence
npm run verify        # Check artifact compatibility with Claude
```

### Article (market-sizing/index.html)
```bash
npm run parse:article   # Parse article markdown → src/article-content.js
npm run build:article   # Full pipeline: parse + bundle + HTML output
npm run build:all       # Build both proposal AND article
```

### Utilities
```bash
npm run sync-docs     # Sync CLAUDE.md, AGENTS.md, GEMINI.md (bidirectional)
```

## Component Marker Syntax

The markdown file uses HTML comments as component markers:

### Header
```markdown
<!-- @header -->
<!-- @from name="John Renaldi" email="jrenaldi@northwestern.edu" linkedin="https://linkedin.com/in/jrenaldi" github="https://github.com/jrenaldi" -->
<!-- @headshot url="https://example.com/photo.jpg" -->
<!-- @date value="February 2026" -->
<!-- @title value="The Product Engineer" -->
<!-- @subtitle value="Subtitle text here" -->
<!-- /@header -->
```

### Stats Grid
```markdown
<!-- @stats -->
<!-- @stat value="59%" label="Engineers Using AI" source="Anthropic 2025" -->
<!-- /@stats -->
```

### Charts
```markdown
<!-- @chart type="growth" title="AI Adoption" subtitle="Year-over-year" -->
<!-- @series label="Usage" -->
<!-- @point year="2024" value="28" -->
<!-- @point year="2025" value="59" -->
<!-- /@series -->
<!-- /@chart -->
```

Chart types: `growth`, `bar`, `hierarchy`, `range`

### Cards
```markdown
<!-- @cards type="profile" columns="3" section="2" -->
<!-- @card icon="briefcase" title="Executive Credibility" -->
Description content here
<!-- /@card -->
<!-- /@cards -->
```

Card types: `profile`, `feature`, `topic`

The `section` attribute associates the card group with a specific section number for proper rendering placement.

For `topic` cards, include an `audience` attribute and optional expanded content:
```markdown
<!-- @cards type="topic" columns="3" section="4" -->
<!-- @card icon="search" title="Discovery" audience="All engineering disciplines" -->
Short summary shown in collapsed state.
<!-- @expanded -->
Detailed content revealed when user expands the card. Supports **markdown** formatting.
<!-- /@card -->
<!-- /@cards -->
```

For expandable `profile` cards with additional detail, use the `@expanded` marker:
```markdown
<!-- @cards type="profile" columns="3" section="3" -->
<!-- @card icon="briefcase" title="Executive Credibility" -->
Short summary shown by default.
<!-- @expanded -->
Longer detailed content revealed when user clicks to expand.
<!-- /@card -->
<!-- /@cards -->
```

Icons: `briefcase`, `code`, `rocket`, `palette`, `network`, `graduation`, `lightbulb`, `chart`, `users`, `shield`, `zap`, `target`, `layers`, `cpu`, `database`, `search`, `compass`

### Terminal
macOS-style terminal window for section summaries:
```markdown
<!-- @terminal title="filename.md" command="cat" variant="compact" -->
- Line 1 content
- Line 2 content
- Line 3 content
<!-- /@terminal -->
```

Variants: `default`, `compact`

### Pull Quotes
```markdown
<!-- @pullquote -->The featured quote text here<!-- /@pullquote -->
```

For 3rd party quotes, add author and title attribution:
```markdown
<!-- @pullquote author="Jensen Huang" title="NVIDIA CEO" -->There's a new programming language. It's called 'human.'<!-- /@pullquote -->
```

### Quote Carousel
```markdown
<!-- @quotes type="carousel" section="triad" -->
<!-- @quote author="Name" title="Title" cite="7" -->
Quote content
<!-- /@quote -->
<!-- /@quotes -->
```

The `section` attribute controls where the carousel renders. App.jsx uses `getQuotesBySection('sectionName')` to filter quotes. Multiple carousels can exist in the document with different section names.

### Convergence Diagram
```markdown
<!-- @convergence -->
<!-- @role from="PMs" to="Engineering" description="Description here" -->
<!-- /@convergence -->
```

### Credentials
```markdown
<!-- @credentials -->
<!-- @credential value="9+" label="U.S. Patents" -->
<!-- /@credentials -->
```

### Timeline
```markdown
<!-- @timeline -->
<!-- @entry year="2021" company="Jiobit" title="Acquired" highlight="true" -->
Entry description
<!-- /@entry -->
<!-- /@timeline -->
```

### Testimonials
```markdown
<!-- @testimonials type="leadership" -->
<!-- @testimonial author="Name" title="Title" subtitle="Context" -->
Quote content
<!-- /@testimonial -->
<!-- /@testimonials -->
```

Testimonial types: `leadership`, `teaching`, `students`

### Tables
Standard markdown tables are automatically parsed:

```markdown
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

Optional variant hint:
```markdown
<!-- @table variant="comparison" -->
```

Table variants: `default`, `comparison`, `data`, `checklist`, `timeline`

## Article System (Market Sizing Guide)

The article pipeline uses **standard markdown** (no custom component markers) processed by a custom parser.

### Content Editing Workflow

1. Edit `articles/market-sizing/content.md` (the single source of truth)
2. Run `npm run build:article` to rebuild
3. Open `market-sizing/index.html` in browser to verify

### Markdown Conventions

The article parser (`scripts/parse-article.js`) handles:
- `# Title` → article title (first H1)
- `## Section Title` → sections (split into numbered sections)
- `### Subsection` → grouped subsections within sections
- Standard markdown tables → `Table` component
- `> blockquote` → `ArticleBlockquote` (styled pull-quote-like)
- `- bullet list` → `BulletList`
- `1. numbered list` → `NumberedList`
- `![caption](diagrams/file.svg)` → inlined SVG with figure/caption
- Bold, italic, links → handled by `RichText` at render time

### ArticleApp.jsx Components

`ArticleApp.jsx` contains article-specific components that extend the shared library:

| Component | Purpose |
|-----------|---------|
| `ArticleHeader` | Light background header matching proposal Header.jsx aesthetic — gradient shapes, McCormick nav bar, headshot, hero quote card |
| `ArticleSectionNav` | Data-driven floating nav (reads sections from CONTENT.sections instead of hardcoded array) |
| `SVGFigure` | Renders inlined SVGs with figure/figcaption, shadow, responsive sizing, scroll fade-in |
| `NumberedList` | Styled ordered list (base components only have BulletList) |
| `ArticleBlockquote` | Blockquote styling with accent border |
| `BlockRenderer` | Maps content blocks → components (paragraph, bulletList, numberedList, table, svg, blockquote, subsection) |
| `ArticleFooter` | Course attribution footer |

### Enrichments

ArticleApp.jsx includes inline data for visual enrichments not in the markdown:
- `SEGMENTATION_CARDS` — CardGrid in Section 3 (Five Segmentation Lenses)
- `BOTTOMUP_TERMINAL` — TerminalWindow in Section 6 (Bottom-Up recipe)
- `JIOBIT_STATS` — StatsGrid in Section 7 (Jiobit metrics)
- `BEACHHEAD_CARDS` — CardGrid in Section 8 (7-Point Checklist)
- `WORKFLOW_TERMINAL` — TerminalWindow in Section 13 (workflow steps)

### Article Build Pipeline Details

1. **parse-article.js** — Reads `content.md`, splits on `## ` headers, parses blocks, inlines SVGs from `diagrams/`, base64-encodes `headshot.png`. Output: `src/article-content.js`
2. **build-article.js** — Strips ES imports/exports, concatenates: article-content.js + design-tokens.js + components (Section, RichText, Table, PullQuote, TerminalWindow, CardGrid, StatsGrid) + ArticleApp.jsx. Output: `dist/MarketSizingGuide.jsx`
3. **update-article-preview.js** — Wraps bundle in HTML with React 18 CDN + Babel Standalone (no Google Fonts — uses system font fallbacks matching the proposal). Output: `market-sizing/index.html`

### Shared Components Used by Article

The article reuses these components from `src/components/`:
- `Section` — animated section headers with terminal-style typewriter effect + `useInView` hook
- `RichText` — inline markdown parsing (bold, italic, links)
- `Table` — editorial table styling
- `PullQuote` — quote display with scroll animation
- `TerminalWindow` — macOS-style terminal for recipe/workflow summaries
- `CardGrid` — profile cards for checklists and lenses
- `StatsGrid` — statistics display for Jiobit metrics

## Component Details (Proposal)

### Header
Hero header component with author info and document metadata:
- **@from**: Author name, email, linkedin URL, github URL
- **@headshot**: Profile photo URL
- **@date**: Document date
- **@title**: Main title
- **@subtitle**: Subtitle/tagline

### RichText
Parses inline markdown formatting:
- `**bold**` → `<strong>`
- `*italic*` → `<em>`
- `[text](url)` → `<a href>`
- `[N]` → citation superscript

### Chart Types
- **growth**: Line/area chart with series and points
- **bar**: Horizontal bars with values and sources
- **hierarchy**: Arrow diagram showing transformations
- **range**: Range bands (e.g., salary ranges)

### CardGrid Types
- **profile**: Icon + title + description (3-column default)
- **feature**: Larger emphasized cards
- **topic**: Expandable accordion-style cards

### Testimonials Types
- **leadership**: Full-width cards with avatar
- **teaching**: 2-column grid
- **students**: Compact grid with source attribution

### Terminal
macOS-style terminal window that provides visual summaries:
- **title**: Filename displayed in terminal title bar
- **command**: Command shown (e.g., `cat`, `tree`)
- **variant**: `default` or `compact`
- Content is rendered as bullet points inside the terminal

## Extending

### Adding a New Component

1. Create `src/components/NewComponent.jsx`
2. Export from `src/components/index.js`
3. Add marker extraction to `src/utils/parser.js`
4. Use in `src/App.jsx`
5. Run `npm run all` to rebuild

### Adding a New Marker Type

1. Define the marker syntax in the markdown documentation block
2. Add extraction regex to `parser.js`
3. Create or modify component to render the data
4. Update App.jsx to include the component

### Content Filtering in App.jsx

App.jsx uses helper functions to retrieve content by section:

```javascript
// Get cards for a specific section number
const getCardsBySection = (sectionNum) => {
  return CONTENT.cards.find(group => group.section === String(sectionNum));
};

// Get quotes for a specific section name
const getQuotesBySection = (sectionName) => {
  return CONTENT.quotes.filter(q => q.section === sectionName);
};
```

Use these patterns when adding new section-aware content types.

## Output

### Proposal
**`dist/ProductEngineerProposal.jsx`** - Self-contained React component (Claude artifact compatible)
**`dist/index.html`** → copied to `index.html` (GitHub Pages root)

### Article
**`dist/MarketSizingGuide.jsx`** - Self-contained React bundle (~850 KB, includes base64 headshot + inlined SVGs)
**`market-sizing/index.html`** - Standalone HTML (GitHub Pages `/market-sizing/`)

### Workflows
```bash
# Proposal
npm run build          # Parse + bundle + generate HTML
open dist/index.html   # Preview in browser

# Article
npm run build:article  # Parse + bundle + generate HTML
open market-sizing/index.html  # Preview in browser

# Both
npm run build:all
```

## Styling

All components use a **design token system** defined in `src/design-tokens.js`:

```javascript
import { COLORS, FONTS, TYPE_SCALE, EFFECTS, SPACE, LAYOUT } from './design-tokens';
```

- **COLORS**: `ink` (text), `surface` (backgrounds), `accent` (primary/light/wash)
- **FONTS**: `display`, `body`, `ui`, `mono`
- **TYPE_SCALE**: Predefined sizes for display, body, ui, mono
- **EFFECTS**: `shadow`, `radius`, `transition`
- **SPACE**: Spacing scale (SPACE[1] through SPACE[12])

Design aesthetic: "The Scholarly Disruptor" - editorial magazine style with:
- Clean, print-inspired sections
- Confident white space
- Professional hierarchy
- Subtle animations on interaction

## Scroll Animation Pattern (IntersectionObserver)

Most components use `IntersectionObserver` to trigger fade-in / slide-up animations when the user scrolls them into view. The shared hook (`useInView` in `Section.jsx`, similar hooks in `TerminalWindow.jsx`, `QuadrantChart.jsx`, etc.) follows this pattern:

```javascript
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // ── CRITICAL: Mount-check for mid-page refresh ──
    // If the element is already above or within the viewport on mount
    // (e.g. after a mid-page refresh), mark it visible immediately.
    // Without this, elements above the scroll position never intersect
    // and stay invisible (opacity: 0) permanently.
    const rect = element.getBoundingClientRect();
    if (rect.bottom < window.innerHeight + 100) {
      setInView(true);
      setHasAnimated(true);
      return; // No observer needed — already passed
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setInView(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.2, rootMargin: '-50px', ...options }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated, options]);

  return [ref, inView];
};
```

### Why the mount-check matters

When a user refreshes the page while scrolled partway down, the browser restores the scroll position *after* React mounts. Elements that are above the viewport at mount time will never scroll into view (the user already passed them), so the `IntersectionObserver` callback never fires and those elements stay at `opacity: 0` / `translateY(...)` forever.

The mount-check (`rect.bottom < window.innerHeight + 100`) catches these elements on initial render and immediately marks them visible. The `+ 100` buffer accounts for elements that are just barely above the fold.

### Where to apply this

**Every component that uses `IntersectionObserver` for scroll-reveal must include the mount-check.** Currently applied in:
- `Section.jsx` → `useInView` hook (used by `Section`, `Subsection`, `SectionDivider`)
- `TerminalWindow.jsx` → `useTerminalInView` hook
- `QuadrantChart.jsx` → inline `useEffect`
- `MemoryArticleApp.jsx` → `SVGFigure`, `YouTubeEmbed` components
- `ArticleApp.jsx` → `SVGFigure` component

When adding a new component with scroll-triggered animation, copy the pattern above — don't create a bare `IntersectionObserver` without the mount-check.

## Testing Strategy

**Automated validation (`npm run build` includes `validate-build.js`):**
- Content structure — required sections present
- Build integrity — React imports, component exports, JSX balance
- Bundle size monitoring

**Visual verification:**
- Component rendering → open `dist/index.html`
- Layout and styling → manual review in browser
- Content accuracy → compare against markdown source

**What we don't unit test (and why):**
- Component rendering — visual output is the real test, DOM mocks give false confidence
- Build bundling — validated by the build process itself
- Styling — must be verified visually

## Verification Approach

When verifying UI changes, use a **smoke test** approach:

**Proposal:**
1. Run `npm run build`
2. Open `dist/index.html` in browser

**Article:**
1. Run `npm run build:article`
2. Open `market-sizing/index.html` in browser

**Scope**: Only verify the specific component or section that was modified. Trust that unchanged components still work.

## Pre-Commit Checklist

### Proposal changes
- [ ] Content changes made in `Product_Engineer_Proposal.md` (not hardcoded in App.jsx)
- [ ] Ran `npm run build` successfully
- [ ] Verified change in `dist/index.html`

### Article changes
- [ ] Content changes made in `articles/market-sizing/content.md` (not hardcoded in ArticleApp.jsx)
- [ ] Ran `npm run build:article` successfully
- [ ] Verified change in `market-sizing/index.html`

### General
- [ ] No hardcoded content in components
- [ ] Ran `npm run sync-docs` if agent docs were modified

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails with rollup/module error | Corrupted node_modules | `rm -rf node_modules package-lock.json && npm install` |
| Content not updating in output | Forgot to rebuild | Run `npm run build` or `npm run build:article` |
| Component not rendering | Missing export in index.js | Add export to `src/components/index.js` |
| Parser not extracting content | Malformed marker syntax | Check marker matches documented syntax in this file |
| "CONTENT is not defined" error | content.js not generated | Run `npm run parse` first, or `npm run build` |
| Agent docs out of sync | Edited one file only | Run `npm run sync-docs` |
| Article headshot not showing | headshot.png missing or moved | Place PNG at `articles/market-sizing/headshot.png` and rebuild |
| Article SVG not rendering | SVG file missing from diagrams/ | Check `articles/market-sizing/diagrams/` for the referenced SVG filename |
| Article bundle too large | Base64 headshot (~700KB) | Normal — headshot is inlined to avoid hotlinking issues |
| Content invisible after mid-page refresh | IntersectionObserver never fires for elements above viewport | Add mount-check to `useInView` / observer hook — see "Scroll Animation Pattern" section above |

## Validation Commands

```bash
# Verify component count matches docs (should be 17)
ls src/components/*.jsx | wc -l

# Check proposal content was generated
ls -la src/content.js

# Check article content was generated
ls -la src/article-content.js

# Verify all build outputs exist
ls -la dist/index.html dist/ProductEngineerProposal.jsx
ls -la dist/MarketSizingGuide.jsx market-sizing/index.html

# Check bundle sizes
wc -c dist/ProductEngineerProposal.jsx dist/MarketSizingGuide.jsx
```

## When to Update This Document

| Change Type | Sections to Update |
|-------------|-------------------|
| New shared component added | Directory Structure, add to components list |
| New proposal marker type | Component Marker Syntax, Component Details (Proposal) |
| New article enrichment | Article System → Enrichments |
| New article added | Overview, Directory Structure, Build Commands, Output, GitHub Access |
| Build process change | Build Commands, Output |
| New design token | Styling section |
| Architecture change | Overview diagram, Directory Structure |

**After editing**: Run `npm run sync-docs` to keep CLAUDE.md, AGENTS.md, and GEMINI.md in sync.

## GitHub Access

**Use Desktop Commander for all git/gh operations.** The project lives at:
```
/Users/john_renaldi/Documents/ClaudeCowork/northwestern
```

Common commands (run via Desktop Commander):
```bash
# Push changes
cd /Users/john_renaldi/Documents/ClaudeCowork/northwestern && git push

# Check GitHub Pages status
cd /Users/john_renaldi/Documents/ClaudeCowork/northwestern && gh api repos/jrenaldi79/northwestern/pages

# View deployment status
cd /Users/john_renaldi/Documents/ClaudeCowork/northwestern && gh run list --limit 5
```

**Live site**:
- Proposal: https://jrenaldi79.github.io/northwestern/
- Article: https://jrenaldi79.github.io/northwestern/market-sizing/
