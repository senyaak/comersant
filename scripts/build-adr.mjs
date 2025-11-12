import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { generateNavigation } from './generate-navigation.mjs';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const ADR_DOCS_DIR = path.join(__dirname, '..', 'docs', 'adr');
const DOCUMENTATION_DIR = path.join(__dirname, '..', 'documentation');
const TEMPLATE_PATH = path.join(__dirname, '..', 'src', 'static', 'adr.template.html');
const OUTPUT_DIR = path.join(DOCUMENTATION_DIR, 'adr');
const INDEX_OUTPUT_PATH = path.join(OUTPUT_DIR, 'index.html');

// Function to extract metadata from ADR
function extractAdrMetadata(mdContent, filename) {
  // Extract title (first # line)
  const titleMatch = mdContent.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';

  // Extract metadata from markdown
  const statusMatch = mdContent.match(/\*\*Status:\*\*\s*(.+)/);
  const dateMatch = mdContent.match(/\*\*Date:\*\*\s*(.+)/);
  const authorMatch = mdContent.match(/\*\*Author:\*\*\s*(.+)/);

  const status = statusMatch ? statusMatch[1].trim() : 'Unknown';
  const date = dateMatch ? dateMatch[1].trim() : '';
  const author = authorMatch ? authorMatch[1].trim() : '';

  // Extract ADR number from filename (e.g., ADR-001-monorepo-structure.md)
  const numberMatch = filename.match(/ADR-(\d+)/);
  const number = numberMatch ? numberMatch[1] : '000';

  return { title, status, date, author, number, filename };
}

// Simple markdown to HTML parser
function markdownToHtml(markdown) {
  // Remove metadata from the beginning (Status, Date, Author)
  let text = markdown;
  text = text.replace(/\*\*Status:\*\*\s*.+/g, '');
  text = text.replace(/\*\*Date:\*\*\s*.+/g, '');
  text = text.replace(/\*\*Author:\*\*\s*.+/g, '');

  const lines = text.split('\n');
  const result = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let inList = false;
  let listItems = [];
  let listType = null;
  let currentParagraph = [];

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      result.push(`<p>${currentParagraph.join(' ')}</p>`);
      currentParagraph = [];
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      const tag = listType === 'ordered' ? 'ol' : 'ul';
      result.push(`<${tag}>${listItems.join('')}</${tag}>`);
      listItems = [];
      listType = null;
      inList = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks with ```
    if (trimmed.startsWith('```')) {
      flushParagraph();
      flushList();

      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = [];
      } else {
        result.push(`<pre><code>${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`);
        inCodeBlock = false;
        codeBlockContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      result.push(`<h3>${processInline(trimmed.substring(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      result.push(`<h2>${processInline(trimmed.substring(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      result.push(`<h1>${processInline(trimmed.substring(2))}</h1>`);
      continue;
    }

    // Horizontal line
    if (trimmed === '---' || trimmed === '***') {
      flushParagraph();
      flushList();
      result.push('<hr>');
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushList();
      result.push(`<blockquote>${processInline(trimmed.substring(2))}</blockquote>`);
      continue;
    }

    // Lists
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    const unorderedMatch = trimmed.match(/^[-*+]\s+(.+)$/);

    if (orderedMatch || unorderedMatch) {
      flushParagraph();

      const newListType = orderedMatch ? 'ordered' : 'unordered';
      const content = orderedMatch ? orderedMatch[2] : unorderedMatch[1];

      if (!inList || listType !== newListType) {
        flushList();
        inList = true;
        listType = newListType;
      }

      listItems.push(`<li>${processInline(content)}</li>`);
      continue;
    }

    // Empty line
    if (trimmed === '') {
      flushParagraph();
      flushList();
      continue;
    }

    // Regular text - add to paragraph
    flushList();
    currentParagraph.push(processInline(trimmed));
  }

  // Finalize remaining content
  flushParagraph();
  flushList();

  return result.join('\n');
}

// Process inline elements (code, bold, italic, links)
function processInline(text) {
  // Inline code (do first to not touch inside)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold text
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic (only single *, not inside **)
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return text;
}// Escape HTML special characters
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Function to generate ADR card for list on main page
function generateAdrListItem(adr) {
  const statusClass = `status-${adr.status.toLowerCase()}`;
  const detailsLink = `./ADR-${adr.number}.html`;

  return `
    <div class="adr-card" id="adr-${adr.number}">
      <div class="adr-card-header">
        <span class="adr-number">ADR-${adr.number}</span>
        <span class="status ${statusClass}">${adr.status}</span>
      </div>
      <h3 class="adr-card-title">${adr.title}</h3>
      <div class="adr-card-meta">
        <span class="date">📅 ${adr.date}</span>
        <span class="author">👤 ${adr.author}</span>
      </div>
      <a href="${detailsLink}" class="adr-card-link">Read more →</a>
    </div>
  `;
}

// Function to generate ADR list for main page
function generateAdrList(adrs) {
  return adrs
    .map(adr => generateAdrListItem(adr))
    .join('\n');
}

// Function to generate single ADR page
function generateSingleAdrPage(adr, markdownContent, allAdrs) {
  const statusClass = `status-${adr.status.toLowerCase()}`;
  const htmlContent = markdownToHtml(markdownContent);

  // Navigation to previous and next ADR
  const currentIndex = allAdrs.findIndex(a => a.number === adr.number);
  const prevAdr = currentIndex > 0 ? allAdrs[currentIndex - 1] : null;
  const nextAdr = currentIndex < allAdrs.length - 1 ? allAdrs[currentIndex + 1] : null;

  const prevLink = prevAdr ? `<a href="./ADR-${prevAdr.number}.html">← ADR-${prevAdr.number}</a>` : '';
  const nextLink = nextAdr ? `<a href="./ADR-${nextAdr.number}.html">ADR-${nextAdr.number} →</a>` : '';

  // Generate dynamic navigation
  const navLinks = generateNavigation('adr', true);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${adr.title} - Comersant Platform</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f7fa;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      min-height: 100vh;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    }

    .header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 30px 40px;
    }

    .header h1 {
      font-size: 2em;
      font-weight: 300;
      margin-bottom: 10px;
    }

    .nav-links {
      background: #e9ecef;
      padding: 15px 40px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
    }

    .nav-links a {
      display: inline-block;
      padding: 8px 16px;
      background: white;
      color: #495057;
      text-decoration: none;
      border-radius: 4px;
      border: 1px solid #ced4da;
      transition: all 0.3s ease;
      font-size: 0.9em;
    }

    .nav-links a:hover {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .nav-prev-next {
      display: flex;
      gap: 10px;
    }

    .breadcrumb {
      padding: 15px 40px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      font-size: 0.9em;
    }

    .breadcrumb a {
      color: #007bff;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .adr-number {
      display: inline-block;
      background: #007bff;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.85em;
      font-weight: 600;
    }

    .adr-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin: 15px 40px;
      font-size: 0.9em;
    }

    .adr-meta span {
      padding: 5px 12px;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .status {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85em;
    }

    .status-accepted {
      background: #d4edda !important;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-proposed {
      background: #fff3cd !important;
      color: #856404;
      border: 1px solid #ffeaa7;
    }

    .status-deprecated {
      background: #f8d7da !important;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .status-superseded {
      background: #e2e3e5 !important;
      color: #383d41;
      border: 1px solid #d6d8db;
    }

    .adr-content {
      padding: 40px;
      color: #495057;
    }

    .adr-content h1 {
      color: #1e3c72;
      font-size: 1.8em;
      margin: 30px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }

    .adr-content h2 {
      color: #2a5298;
      font-size: 1.5em;
      margin: 25px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e9ecef;
    }

    .adr-content h3 {
      color: #495057;
      font-size: 1.2em;
      margin: 20px 0 10px 0;
    }

    .adr-content p {
      margin-bottom: 15px;
      text-align: justify;
    }

    .adr-content ul,
    .adr-content ol {
      margin-left: 30px;
      margin-bottom: 15px;
    }

    .adr-content li {
      margin-bottom: 8px;
    }

    .adr-content code {
      background: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #e83e8c;
    }

    .adr-content pre {
      background: #282c34;
      color: #abb2bf;
      padding: 20px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 20px 0;
      border: 1px solid #21252b;
    }

    .adr-content pre code {
      background: none;
      color: inherit;
      padding: 0;
      font-size: 0.9em;
      line-height: 1.5;
    }

    .adr-content strong {
      color: #2a5298;
      font-weight: 600;
    }

    .adr-content a {
      color: #007bff;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-bottom 0.2s;
    }

    .adr-content a:hover {
      border-bottom: 1px solid #007bff;
    }

    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #6c757d;
      border-top: 1px solid #e9ecef;
      margin-top: 40px;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="adr-number">ADR-${adr.number}</span>
      <h1>${adr.title}</h1>
    </div>

    <div class="nav-links">
      <div>
        <a href="./index.html">← All ADRs</a>
        ${navLinks}
      </div>
      <div class="nav-prev-next">
        ${prevLink}
        ${nextLink}
      </div>
    </div>

    <div class="breadcrumb">
      <a href="../index.html">Documentation</a> / <a href="./index.html">ADRs</a> / <strong>ADR-${adr.number}</strong>
    </div>

    <div class="adr-meta">
      <span class="status ${statusClass}">${adr.status}</span>
      <span class="date">📅 ${adr.date}</span>
      <span class="author">👤 ${adr.author}</span>
    </div>

    <div class="adr-content">
      ${htmlContent}
    </div>

    <div class="footer">
      <p>Comersant Platform © 2025</p>
    </div>
  </div>
</body>
</html>`;
}

// Main function
function buildAdrPages() {
  globalThis.console.log('🚀 Building ADR documentation...');

  try {
    // Read all markdown files from directory (excluding README)
    const files = fs.readdirSync(ADR_DOCS_DIR)
      .filter(file => file.endsWith('.md') && !file.toUpperCase().includes('README'))
      .sort(); // Sort files by name

    globalThis.console.log(`📁 Found ${files.length} ADR files`);

    // Process each file
    const adrs = [];

    // Create directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const filename of files) {
      const filePath = path.join(ADR_DOCS_DIR, filename);
      const mdContent = fs.readFileSync(filePath, 'utf8');

      try {
        const adr = extractAdrMetadata(mdContent, filename);
        adrs.push(adr);

        globalThis.console.log(`  ✓ ${filename}`);

        // Create separate page for ADR
        const singlePageHtml = generateSingleAdrPage(adr, mdContent, adrs);
        const singlePagePath = path.join(OUTPUT_DIR, `ADR-${adr.number}.html`);
        fs.writeFileSync(singlePagePath, singlePageHtml);

      } catch (error) {
        globalThis.console.error(`  ✗ ${filename}: ${error.message}`);
        throw new Error(`Failed to process ${filename}: ${error.message}`);
      }
    }

    // Read HTML template for main page
    let htmlTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    // Generate dynamic navigation
    const navLinks = generateNavigation('adr', true);

    // Replace placeholders
    const adrList = generateAdrList(adrs);
    const generationDate = new Date().toISOString().split('T')[0];

    htmlTemplate = htmlTemplate
      .replace('{{ADR_COUNT}}', adrs.length.toString())
      .replace('{{ADR_LIST}}', adrList)
      .replace('{{NAV_LINKS}}', navLinks)
      .replace('{{GENERATION_DATE}}', generationDate);

    // Write main page
    fs.writeFileSync(INDEX_OUTPUT_PATH, htmlTemplate);

    globalThis.console.log('✅ ADR documentation built successfully!');
    globalThis.console.log(`📝 Generated main page: ${INDEX_OUTPUT_PATH}`);
    globalThis.console.log(`📝 Generated ${adrs.length} individual ADR pages`);
    globalThis.console.log(`📊 Total ADRs: ${adrs.length}`);

  } catch (error) {
    globalThis.console.error('❌ Error building ADR documentation:', error.message);
    globalThis.process.exit(1);
  }
}

// Run
buildAdrPages();
