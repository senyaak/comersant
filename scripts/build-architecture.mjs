import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { generateNavigation } from './generate-navigation.mjs';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const ARCH_DOCS_DIR = path.join(__dirname, '..', 'docs', 'architecture');
const DOCUMENTATION_DIR = path.join(__dirname, '..', 'documentation');
const TEMPLATE_PATH = path.join(__dirname, '..', 'src', 'static', 'architecture.template.html');
const OUTPUT_DIR = path.join(DOCUMENTATION_DIR, 'architecture');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'index.html');

// Function to extract components from markdown
function extractComponentsFromMarkdown(mdContent) {
  // Extract title (first # line)
  const titleMatch = mdContent.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';

  // Extract description (text between **Description:** and ```mermaid)
  const descMatch = mdContent.match(/\*\*Description:\*\* ([^]*?)(?=```mermaid)/);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extract mermaid diagram
  const mermaidMatch = mdContent.match(/```mermaid\n([\s\S]*?)\n```/);
  if (!mermaidMatch) {
    throw new Error('No mermaid diagram found in markdown');
  }
  const diagram = mermaidMatch[1].trim();

  // Extract features/notes (everything after the mermaid diagram)
  const afterMermaid = mdContent.split('```')[2]; // Get content after closing ```
  const features = afterMermaid ? afterMermaid.trim() : '';

  return { title, description, diagram, features };
}

// Function to generate HTML section from component
function generateSection(component) {
  return `
    <!-- ${component.title} -->
    <div class="diagram-section">
      <h2>${component.title}</h2>
      <div class="diagram-description">
        <strong>Description:</strong> ${component.description}
      </div>

      <div class="mermaid">
        ${component.diagram}
      </div>

      <div class="features">
        ${component.features}
      </div>
    </div>
  `;
}

// Main function
function buildArchitecturePage() {
  globalThis.console.log('🚀 Building architecture page from markdown files...');

  try {
    // Read all markdown files from directory (excluding README)
    const files = fs.readdirSync(ARCH_DOCS_DIR)
      .filter(file => file.endsWith('.md') && !file.toUpperCase().includes('README'))
      .sort(); // Sort files by name

    globalThis.console.log(`📁 Found ${files.length} markdown files`);

    // Process each file
    const sections = files.map(filename => {
      const filePath = path.join(ARCH_DOCS_DIR, filename);
      const mdContent = fs.readFileSync(filePath, 'utf8');
      try {
        const component = extractComponentsFromMarkdown(mdContent);
        globalThis.console.log(`  ✓ ${filename}`);
        return generateSection(component);
      } catch (error) {
        globalThis.console.error(`  ✗ ${filename}: ${error.message}`);
        throw new Error(`Failed to process ${filename}: ${error.message}`);
      }
    });

    // Read HTML template
    let htmlTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    // Generate dynamic navigation
    const navLinks = generateNavigation('architecture', true);

    // Insert all sections instead of placeholder
    const allSections = sections.join('\n');
    htmlTemplate = htmlTemplate
      .replace('{{DIAGRAM_SECTIONS}}', allSections)
      .replace('{{NAV_LINKS}}', navLinks);

    // Create directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write final HTML
    fs.writeFileSync(OUTPUT_PATH, htmlTemplate, 'utf8');

    globalThis.console.log('✅ Architecture page built successfully!');
    globalThis.console.log(`📝 Generated: ${OUTPUT_PATH}`);
    globalThis.console.log(`📊 Included ${files.length} diagrams`);

  } catch (error) {
    globalThis.console.error('❌ Error building architecture page:', error.message);
    globalThis.process.exit(1);
  }
}

// Run
buildArchitecturePage();
