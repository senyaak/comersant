#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Config
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEX_SOURCE = 'doc.tex';
const OUTPUT_DIR = './documentation/design';
const LATEXMK_ARGS = [
  '-pdf',
  '-file-line-error',
  '-interaction=nonstopmode',
  '-halt-on-error',
  `-output-directory=${path.resolve(PROJECT_ROOT, OUTPUT_DIR)}`,
];

// Helper: Check if command exists
function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Helper: Clean directory
function ensureCleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir);
}

// Main compilation
async function compile() {
  try {
    // 1. Verify latexmk exists
    if (!commandExists('latexmk')) {
      throw new Error(
        'latexmk not found. Install with:\n  sudo pacman -S texlive-bin',
      );
    }

    // 2. Verify source file exists
    if (!fs.existsSync(TEX_SOURCE)) {
      throw new Error(`Source file not found: ${TEX_SOURCE}`);
    }

    // 3. Prepare build directory
    ensureCleanDir(OUTPUT_DIR);
    console.log(`📦 Building in: ${path.resolve(OUTPUT_DIR)}`);

    // 4. Run latexmk
    const proc = spawn('latexmk', [...LATEXMK_ARGS, TEX_SOURCE], {
      stdio: 'pipe',
    });

    // Live output handling
    proc.stdout.on('data', data => {
      process.stdout.write(`[latex] ${data}`);
    });

    proc.stderr.on('data', data => {
      process.stderr.write(`[ERROR] ${data}`);
    });

    // Wait for completion
    const exitCode = await new Promise(resolve => {
      proc.on('close', resolve);
    });

    // 5. Handle result
    const pdfPath = path.join(OUTPUT_DIR, TEX_SOURCE.replace('.tex', '.pdf'));
    if (exitCode === 0 && fs.existsSync(pdfPath)) {
      console.log(`\n✅ Success: ${pdfPath}`);
      return pdfPath;
    } else {
      throw new Error(`Compilation failed (code ${exitCode})`);
    }
  } catch (err) {
    console.error('\n❌ ' + err.message);
    process.exit(1);
  }
}

// Execute
compile();
