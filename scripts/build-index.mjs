import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { generateMainPageCards } from './generate-navigation.mjs';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.join(__dirname, '..', 'src', 'assets', 'templates', 'index.html');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'static', 'index.html');

function buildIndexPage() {
  globalThis.console.log('🚀 Building main documentation index...');

  try {
    // Read template
    let htmlTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf8');

    // Generate cards dynamically
    const cards = generateMainPageCards();

    globalThis.console.log('Generated cards:', cards.substring(0, 100) + '...');
    globalThis.console.log('Cards length:', cards.length);

    // Replace placeholder
    htmlTemplate = htmlTemplate.replace('{{DOC_CARDS}}', cards);

    // Write output
    fs.writeFileSync(OUTPUT_PATH, htmlTemplate, 'utf8');

    globalThis.console.log('✅ Main index page built successfully!');
    globalThis.console.log(`📝 Generated: ${OUTPUT_PATH}`);

  } catch (error) {
    globalThis.console.error('❌ Error building index page:', error.message);
    globalThis.process.exit(1);
  }
}

// Run
buildIndexPage();
