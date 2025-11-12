#!/usr/bin/env node

/**
 * Master build script for all documentation
 * Automatically discovers and builds all documentation sections
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BUILD_SCRIPTS = [
  { name: 'Main Index', script: 'build-index.mjs' },
  { name: 'Architecture', script: 'build-architecture.mjs' },
  { name: 'ADRs', script: 'build-adr.mjs' },
];

function runScript(scriptPath) {
  try {
    execSync(`node ${scriptPath}`, {
      cwd: __dirname,
      stdio: 'inherit',
    });
    return true;
  } catch {
    globalThis.console.error(`Failed to run ${scriptPath}`);
    return false;
  }
}

async function buildAll() {
  globalThis.console.log('🚀 Building all documentation...\n');

  let successCount = 0;
  let failCount = 0;

  for (const { name, script } of BUILD_SCRIPTS) {
    globalThis.console.log(`\n📦 Building ${name}...`);
    globalThis.console.log('═'.repeat(50));

    const scriptPath = path.join(__dirname, script);
    const success = runScript(scriptPath);

    if (success) {
      successCount++;
      globalThis.console.log(`✅ ${name} built successfully`);
    } else {
      failCount++;
      globalThis.console.error(`❌ ${name} build failed`);
    }
  }

  globalThis.console.log('\n' + '═'.repeat(50));
  globalThis.console.log('\n📊 Build Summary:');
  globalThis.console.log(`   ✅ Success: ${successCount}`);
  globalThis.console.log(`   ❌ Failed: ${failCount}`);
  globalThis.console.log(`   📦 Total: ${BUILD_SCRIPTS.length}`);

  if (failCount > 0) {
    globalThis.console.log('\n⚠️  Some builds failed. Check the logs above.');
    globalThis.process.exit(1);
  } else {
    globalThis.console.log('\n🎉 All documentation built successfully!');
  }
}

buildAll();
