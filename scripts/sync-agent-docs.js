#!/usr/bin/env node
/**
 * Bidirectional Agent Documentation Sync
 *
 * Keeps CLAUDE.md, AGENTS.md, and GEMINI.md in sync.
 * Detects which file was most recently modified and syncs others to match.
 *
 * Usage: npm run sync-docs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md'];

// Get file stats
function getFileStats(filename) {
  const filepath = path.join(ROOT, filename);
  try {
    const stats = fs.statSync(filepath);
    return {
      filename,
      filepath,
      exists: true,
      mtime: stats.mtime,
      size: stats.size
    };
  } catch (e) {
    return {
      filename,
      filepath,
      exists: false,
      mtime: new Date(0),
      size: 0
    };
  }
}

// Update timestamp in file content
function updateTimestamp(content) {
  const now = new Date().toISOString().split('T')[0];
  const timestampRegex = /^<!-- Last updated: .* -->/m;

  if (timestampRegex.test(content)) {
    return content.replace(timestampRegex, `<!-- Last updated: ${now} -->`);
  } else {
    return `<!-- Last updated: ${now} -->\n${content}`;
  }
}

// Ensure sync header exists
function ensureSyncHeader(content) {
  const syncHeader = '<!-- SYNCED FILE: Edit any of CLAUDE.md, AGENTS.md, or GEMINI.md then run `npm run sync-docs` -->';

  if (content.includes('SYNCED FILE:')) {
    return content;
  }

  // Add after timestamp line
  const lines = content.split('\n');
  const timestampIndex = lines.findIndex(l => l.startsWith('<!-- Last updated:'));

  if (timestampIndex >= 0) {
    lines.splice(timestampIndex + 1, 0, syncHeader);
    return lines.join('\n');
  }

  return `${syncHeader}\n${content}`;
}

// Main sync logic
function sync() {
  console.log('🔄 Syncing agent documentation...\n');

  // Get stats for all files
  const fileStats = FILES.map(getFileStats);
  const existingFiles = fileStats.filter(f => f.exists);

  if (existingFiles.length === 0) {
    console.error('❌ No agent documentation files found!');
    process.exit(1);
  }

  // Find most recently modified file
  const source = existingFiles.reduce((newest, file) =>
    file.mtime > newest.mtime ? file : newest
  );

  console.log(`📄 Source (most recent): ${source.filename}`);
  console.log(`   Modified: ${source.mtime.toISOString()}`);
  console.log(`   Size: ${(source.size / 1024).toFixed(1)} KB\n`);

  // Read source content
  let content = fs.readFileSync(source.filepath, 'utf8');

  // Update timestamp and ensure sync header
  content = updateTimestamp(content);
  content = ensureSyncHeader(content);

  // Sync to all files (including source to update timestamp)
  let synced = 0;
  for (const file of fileStats) {
    const targetPath = file.filepath;

    // Check if content differs
    const existingContent = file.exists ? fs.readFileSync(targetPath, 'utf8') : '';

    if (existingContent !== content) {
      fs.writeFileSync(targetPath, content);
      console.log(`✓ ${file.filename} ${file.exists ? 'updated' : 'created'}`);
      synced++;
    } else {
      console.log(`· ${file.filename} already in sync`);
    }
  }

  console.log(`\n✅ Sync complete. ${synced} file(s) updated.`);
}

// Run
sync();
