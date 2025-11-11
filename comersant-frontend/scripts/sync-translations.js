#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const I18N_DIR = path.join(ROOT, 'src/assets/i18n');
const BASE_FILE = path.join(I18N_DIR, 'messages.json');
const DE_FILE = path.join(I18N_DIR, 'messages.de.json');
const RU_FILE = path.join(I18N_DIR, 'messages.ru.json');

console.log('🔄 Syncing translations...\n');

// 1. Read base file
const base = JSON.parse(fs.readFileSync(BASE_FILE, 'utf8'));
const baseKeys = Object.keys(base.translations);

console.log(`📄 Base file: ${baseKeys.length} keys\n`);

// Sync function
function syncTranslations(filePath, locale) {
  console.log(`🌍 Processing: ${path.basename(filePath)} (${locale})`);

  let target;
  if (fs.existsSync(filePath)) {
    target = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    target = { locale, translations: {} };
    console.log('   ⚠️  File does not exist, creating new one');
  }

  const targetKeys = Object.keys(target.translations);

  // Find missing keys
  const missingKeys = baseKeys.filter(key => !(key in target.translations));

  // Find extra keys (not in base)
  const extraKeys = targetKeys.filter(key => !(key in base.translations));

  // Add missing keys
  missingKeys.forEach(key => {
    // Use English text as placeholder
    target.translations[key] = base.translations[key];
  });

  // Remove extra keys
  extraKeys.forEach(key => {
    delete target.translations[key];
  });

  // Re-sort keys in the same order as base
  const sortedTranslations = {};
  baseKeys.forEach(key => {
    if (key in target.translations) {
      sortedTranslations[key] = target.translations[key];
    }
  });
  target.translations = sortedTranslations;

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(target, null, 2) + '\n', 'utf8');

  // Output statistics
  if (missingKeys.length > 0) {
    console.log(`   ➕ Added keys: ${missingKeys.length}`);
    missingKeys.forEach(key => console.log(`      • ${key}`));
  }

  if (extraKeys.length > 0) {
    console.log(`   ➖ Removed keys: ${extraKeys.length}`);
    extraKeys.forEach(key => console.log(`      • ${key}`));
  }

  if (missingKeys.length === 0 && extraKeys.length === 0) {
    console.log('   ✅ All synchronized');
  }

  console.log('');
}

// 2. Sync DE
syncTranslations(DE_FILE, 'de');

// 3. Sync RU
syncTranslations(RU_FILE, 'ru');

console.log('✨ Done!\n');
console.log('⚠️  Don\'t forget to translate new keys (they were added with English text)');

