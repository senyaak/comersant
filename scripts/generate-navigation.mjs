import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCUMENTATION_DIR = path.join(__dirname, '..', 'documentation');
const DOCS_SOURCE_DIR = path.join(__dirname, '..', 'docs');

// Static documentation sections
const STATIC_SECTIONS = {
  'backend': { icon: '🔧', title: 'Backend API' },
  'frontend': { icon: '🎨', title: 'Frontend Docs' },
};

// Default icons for auto-discovered sections
const SECTION_ICONS = {
  'architecture': '📊',
  'adr': '📚',
};

/**
 * Automatically discover sections from docs/ directory
 */
function discoverDocsDirectories() {
  const sections = {};

  if (!fs.existsSync(DOCS_SOURCE_DIR)) {
    return sections;
  }

  const entries = fs.readdirSync(DOCS_SOURCE_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const sectionName = entry.name;
      sections[sectionName] = {
        icon: SECTION_ICONS[sectionName] || '�',
        title: sectionName.toUpperCase(),
      };
    }
  }

  return sections;
}

// Merge static and dynamic sections
const DOC_SECTIONS = {
  ...STATIC_SECTIONS,
  ...discoverDocsDirectories(),
};

/**
 * Scans documentation directory and returns available sections
 */
function getAvailableSections() {
  if (!fs.existsSync(DOCUMENTATION_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(DOCUMENTATION_DIR, { withFileTypes: true });
  const sections = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const sectionName = entry.name;
      const indexPath = path.join(DOCUMENTATION_DIR, sectionName, 'index.html');

      // Check if section has index.html
      if (fs.existsSync(indexPath)) {
        const config = DOC_SECTIONS[sectionName] || {
          icon: '📄',
          title: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
        };

        sections.push({
          name: sectionName,
          ...config,
        });
      }
    }
  }

  return sections;
}

/**
 * Generates navigation HTML for a specific location
 * @param {string} currentSection - Current section name (or 'home' for main page)
 * @param {boolean} includeBackHome - Whether to include "Back to Home" link
 */
export function generateNavigation(currentSection = null, includeBackHome = true) {
  const links = [];

  // Add "Back to Home" link if needed
  if (includeBackHome && currentSection !== 'home') {
    links.push('<a href="../index.html">← Back to Home</a>');
  }

  // Add links to all configured sections (not just existing ones)
  for (const [sectionName, sectionConfig] of Object.entries(DOC_SECTIONS)) {
    if (sectionName !== currentSection) {
      // Use absolute paths for backend and frontend (they have subdirs)
      let href;
      if (sectionName === 'backend' || sectionName === 'frontend') {
        href = `/docs/${sectionName}`;
      } else {
        href = `../${sectionName}/index.html`;
      }
      links.push(`<a href="${href}">${sectionConfig.icon} ${sectionConfig.title}</a>`);
    }
  }

  return links.join('\n      ');
}

/**
 * Generates navigation HTML for cards on main page
 * Uses configured sections (both static and auto-discovered)
 */
export function generateMainPageCards() {
  const descriptions = {
    'backend': 'NestJS backend documentation with modules, services, controllers, and game logic',
    'frontend': 'Angular application documentation with components, services, and modules',
    'architecture': 'C4 Model diagrams showing system architecture at different levels',
    'adr': 'Technical decisions, their context, alternatives considered, and consequences',
  };

  const cards = [];

  // Generate cards for all configured sections
  for (const [sectionName, sectionConfig] of Object.entries(DOC_SECTIONS)) {
    const description = descriptions[sectionName] || `Documentation for ${sectionConfig.title}`;

    // Use absolute paths for backend and frontend (they have subdirs)
    let href;
    if (sectionName === 'backend' || sectionName === 'frontend') {
      href = `/docs/${sectionName}`;
    } else {
      href = `./${sectionName}/index.html`;
    }

    cards.push(`      <div class="doc-card">
        <span class="doc-icon">${sectionConfig.icon}</span>
        <h2>${sectionConfig.title}</h2>
        <p>${description}</p>
        <a href="${href}" class="btn">View ${sectionConfig.title}</a>
      </div>`);
  }

  return cards.join('\n\n');
}

// Export for use in other scripts
export { getAvailableSections, DOC_SECTIONS };

// CLI usage
if (import.meta.url === `file://${globalThis.process.argv[1]}`) {
  globalThis.console.log('📋 Available documentation sections:');
  const sections = getAvailableSections();

  if (sections.length === 0) {
    globalThis.console.log('  No documentation found.');
  } else {
    for (const section of sections) {
      globalThis.console.log(`  ${section.icon} ${section.title} (${section.name}/)`);
    }
  }

  globalThis.console.log('\n🔗 Sample navigation HTML:');
  globalThis.console.log(generateNavigation('test', true));

  globalThis.console.log('\n📦 Sample main page cards:');
  globalThis.console.log(generateMainPageCards());
}
