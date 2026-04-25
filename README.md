# Portable React Documents

A system for creating rich, shareable web documents using React — without the complexity of web app deployment.

## The Problem

Modern web content is powerful but hard to share. Traditional React apps require hosting, build pipelines, and infrastructure. Meanwhile, static documents (PDFs, Word docs) lack interactivity and visual sophistication.

**What if you could create React-quality content that shares like a document?**

## The Solution

This project introduces **Portable React Documents** — self-contained files that combine the visual richness of React with the shareability of traditional documents.

```
┌─────────────────────────────────────────────────────────────────┐
│  Write content in Markdown                                      │
│  (with embedded component markers)                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Build system merges content + React components                 │
│  into a single self-contained file                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Share as:                                                      │
│  • HTML file (open in any browser)                              │
│  • Claude artifact (paste into conversation)                    │
│  • GitHub Pages (optional hosting)                              │
│  • Email attachment                                             │
└─────────────────────────────────────────────────────────────────┘
```

## How It Works

### 1. Content Layer (Markdown)

Write your content in Markdown with embedded component markers:

```markdown
# My Document

Introduction paragraph here.

<!-- @stats -->
<!-- @stat value="85%" label="Completion Rate" -->
<!-- @stat value="2.5x" label="Performance Gain" -->
<!-- /@stats -->

## Section Title

More content with **rich formatting** and [links](https://example.com).

<!-- @chart type="growth" title="Progress Over Time" -->
<!-- @series label="Metrics" -->
<!-- @point year="2024" value="45" -->
<!-- @point year="2025" value="78" -->
<!-- /@series -->
<!-- /@chart -->
```

### 2. Component Library

A curated set of React components optimized for document presentation:

| Component | Purpose |
|-----------|---------|
| `Header` | Document hero with author info |
| `StatsGrid` | Key metrics display |
| `Chart` | Data visualizations (growth, bar, hierarchy, range) |
| `CardGrid` | Feature cards, profiles, topics |
| `Timeline` | Chronological entries |
| `QuoteCarousel` | Rotating testimonials |
| `Table` | Styled data tables |
| `TerminalWindow` | Code/command displays |

### 3. Build Process

```bash
npm run build
```

This single command:
1. **Parses** markdown into structured content
2. **Bundles** React components + content into one file
3. **Generates** standalone HTML for browser viewing
4. **Validates** output integrity

### 4. Output

Two files, both self-contained:

- **`ProductEngineerProposal.jsx`** — Single React component (for artifact viewers)
- **`index.html`** — Standalone HTML (open directly in browser)

No server required. No deployment needed. Just share the file.

## Technical Architecture

### The Build Pipeline

```
Product_Engineer_Proposal.md
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│  PARSER (src/utils/parser.js)                                 │
│                                                               │
│  1. Reads markdown file                                       │
│  2. Extracts component markers (<!-- @stats -->, etc.)        │
│  3. Parses document structure (sections, subsections)         │
│  4. Outputs structured JSON → src/content.js                  │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│  BUNDLER (src/utils/build.js)                                 │
│                                                               │
│  1. Reads all React components from src/components/           │
│  2. Reads content.js (parsed data)                            │
│  3. Reads App.jsx (layout/composition)                        │
│  4. Merges everything into single self-contained file         │
│  5. Outputs → dist/ProductEngineerProposal.jsx                │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│  HTML GENERATOR (scripts/update-preview.js)                   │
│                                                               │
│  1. Wraps bundled JSX in HTML template                        │
│  2. Adds React/Babel via CDN for browser rendering            │
│  3. Outputs → dist/index.html (standalone, no server needed)  │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│  VALIDATOR (scripts/validate-build.js)                        │
│                                                               │
│  1. Checks content.js has required sections                   │
│  2. Verifies React imports and exports                        │
│  3. Validates JSX tag balance                                 │
│  4. Reports bundle size                                       │
└───────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**Why merge into a single file?**
Traditional React builds create multiple chunks for performance. But we optimize for *portability* — one file means one thing to share, no missing dependencies.

**Why HTML comments for markers?**
HTML comments (`<!-- @stats -->`) are invisible in rendered markdown but parseable by our system. This means the source file remains valid markdown that renders nicely on GitHub.

**Why inline all data?**
No fetch calls, no APIs, no CORS issues. The document works anywhere — local filesystem, email attachment, USB drive, air-gapped network.

**Why React instead of static HTML?**
React's component model allows sophisticated UI (expandable cards, carousels, charts) while keeping the source maintainable. The final output is still just HTML/JS.

## Why This Approach?

### For Content Creators

- **Write in Markdown** — familiar, version-controllable, diff-friendly
- **Rich output** — charts, cards, timelines, not just text
- **Single source of truth** — content lives in one place

### For Collaborators

- **No setup required** — recipients just open a file
- **Works offline** — no internet dependency after sharing
- **Version as files** — email v2, v3, or use git

### For LLM-Assisted Workflows

- **AI can generate content** — Markdown is LLM-friendly
- **AI can modify components** — React is well-understood by models
- **Artifact-compatible** — paste directly into Claude conversations

## Comparison

| Aspect | Traditional React App | PDF/Word Doc | Portable React Doc |
|--------|----------------------|--------------|-------------------|
| Visual richness | ✅ High | ⚠️ Limited | ✅ High |
| Interactivity | ✅ Full | ❌ None | ⚠️ View-only |
| Shareability | ❌ Needs hosting | ✅ Just send file | ✅ Just send file |
| Offline access | ❌ Usually no | ✅ Yes | ✅ Yes |
| Version control | ✅ Git-friendly | ❌ Binary | ✅ Git-friendly |
| AI-editable | ✅ Yes | ⚠️ Limited | ✅ Yes |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/jrenaldi79/northwestern.git
cd northwestern

# Install dependencies
npm install

# Edit content
# (modify Product_Engineer_Proposal.md)

# Build
npm run build

# View
open dist/index.html
```

## Project Structure

```
northwestern/
├── Product_Engineer_Proposal.md   # Your content (edit this)
├── src/
│   ├── components/                # React component library
│   ├── App.jsx                    # Document layout
│   ├── design-tokens.js           # Styling system
│   └── utils/
│       ├── parser.js              # Markdown → JSON
│       └── build.js               # Bundler
├── dist/
│   ├── ProductEngineerProposal.jsx  # Artifact output
│   └── index.html                   # Browser output
└── CLAUDE.md                      # Full technical docs
```

## Live Demo

**GitHub Pages**: https://jrenaldi79.github.io/northwestern/

## Use Cases

- **Proposals & Pitches** — Rich visuals without slide deck limitations
- **Reports & Analyses** — Interactive charts, expandable sections
- **Documentation** — Technical docs with live examples
- **Portfolios** — Showcase work with sophisticated presentation

## Philosophy

> "The best document format is one that's as easy to share as a PDF but as powerful as a web app."

This project bridges that gap by treating React not as an application framework, but as a **document rendering engine**.

## License

MIT

---

Built with React. Shared like a document.
