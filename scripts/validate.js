#!/usr/bin/env node
/**
 * Validate the extension source and manifest.
 *
 * Checks performed:
 *  1. manifest.json – required fields, ID format, SemVer version
 *  2. Source JS files – basic syntax via `node --check`
 *  3. Block consistency – every opcode declared in getInfo() has a matching
 *     method implementation somewhere in the source files
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, '../src');

let errors = 0;
let warnings = 0;

function pass(msg) {
  console.log(`  [PASS] ${msg}`);
}

function fail(msg) {
  console.error(`  [FAIL] ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  [WARN] ${msg}`);
  warnings++;
}

// ---------------------------------------------------------------------------
// 1. Manifest validation
// ---------------------------------------------------------------------------
console.log('\n--- Manifest ---');

const manifestPath = path.join(SRC_DIR, 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  fail('manifest.json not found in src/');
} else {
  let manifest;
  let rawText;
  try {
    rawText = fs.readFileSync(manifestPath, 'utf8');
  } catch (e) {
    fail(`manifest.json could not be read: ${e.message}`);
  }

  if (rawText !== undefined) {
    try {
      manifest = JSON.parse(rawText);
    } catch (e) {
      fail(`manifest.json is not valid JSON: ${e.message}`);
    }
  }

  if (manifest) {
    const requiredFields = ['name', 'id', 'version'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        fail(`manifest.json is missing required field: "${field}"`);
      } else {
        pass(`Field "${field}" present: ${manifest[field]}`);
      }
    }

    if (manifest.id && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(manifest.id)) {
      fail(
        `manifest.json "id" is invalid: "${manifest.id}". Must start with a letter and contain only letters, digits, or underscores.`
      );
    }

    if (manifest.version && !/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?(?:\+[a-zA-Z0-9.-]+)?$/.test(manifest.version)) {
      fail(
        `manifest.json "version" is invalid: "${manifest.version}". Use SemVer (e.g. 1.0.0 or 1.0.0-beta.1).`
      );
    }

    if (!manifest.description) {
      warn('manifest.json is missing an optional but recommended field: "description"');
    }
    if (!manifest.author) {
      warn('manifest.json is missing an optional but recommended field: "author"');
    }
  }
}

// ---------------------------------------------------------------------------
// 2. JS syntax check
// ---------------------------------------------------------------------------
console.log('\n--- Source file syntax ---');

/**
 * Recursively collect all .js files under a directory, skipping dotfiles.
 * @param {string} dir - Absolute path to the directory to walk.
 * @returns {string[]} Sorted array of absolute paths to .js files found.
 */
function walkJs(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkJs(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

const jsFiles = fs.existsSync(SRC_DIR) && fs.statSync(SRC_DIR).isDirectory()
  ? walkJs(SRC_DIR)
  : [];

if (jsFiles.length === 0) {
  warn('No JS source files found in src/');
} else {
  for (const filePath of jsFiles) {
    const label = path.relative(SRC_DIR, filePath);
    try {
      execFileSync(process.execPath, ['--check', filePath], { stdio: 'pipe' });
      pass(`${label} – syntax OK`);
    } catch (err) {
      fail(`${label} – syntax error:\n    ${err.stderr?.toString().trim() ?? err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Block opcode / method consistency
// ---------------------------------------------------------------------------
console.log('\n--- Block consistency ---');

// Read all source file contents and strip comments once for all regex work
const allSource = jsFiles
  .map(f => fs.readFileSync(f, 'utf8'))
  .join('\n');

const strippedSource = allSource
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

// Extract opcodes from getInfo() blocks array using comment-stripped source
// Matches: opcode: 'myBlock'  or  opcode: "myBlock"
const opcodeMatches = [...strippedSource.matchAll(/opcode\s*:\s*['"]([^'"]+)['"]/g)];
const declaredOpcodes = opcodeMatches.map(m => m[1]);

if (declaredOpcodes.length === 0) {
  warn('No block opcodes found in source. Make sure getInfo() defines blocks with an "opcode" field.');
} else {
  // Extract method names defined in the source using \s* to match any indentation.
  // Covers: regular/async methods, regular/async function assignments, and arrow functions.
  // A negative lookahead excludes JS control-flow keywords from being captured.
  const JS_KEYWORDS = '(?!(?:if|for|while|switch|return|typeof|instanceof|in|of|new|delete|void|throw|catch|finally|case|default|import|export|from|async|await|yield|class|extends|super|static|let|const|var|function|do|else|try|break|continue|debugger)\\b)';
  const IDENT = `${JS_KEYWORDS}([a-zA-Z_$][a-zA-Z0-9_$]*)`;
  const methodMatches = [
    ...strippedSource.matchAll(new RegExp(`^\\s*(?:async\\s+)?${IDENT}\\s*\\(`, 'gm')),
    ...strippedSource.matchAll(new RegExp(`^\\s*${IDENT}\\s*=\\s*(?:async\\s+)?(?:function\\s*)?\\(`, 'gm')),
    ...strippedSource.matchAll(new RegExp(`^\\s*${IDENT}\\s*=\\s*(?:async\\s+)?(?:\\([^)]*\\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\\s*=>`, 'gm')),
  ];
  const definedMethods = new Set(methodMatches.map(m => m[1]));

  for (const opcode of declaredOpcodes) {
    if (definedMethods.has(opcode)) {
      pass(`Block "${opcode}" has a matching method implementation`);
    } else {
      fail(
        `Block opcode "${opcode}" is declared in getInfo() but no matching method was found in the source files`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n--- Summary ---');
console.log(`  Blocks declared: ${declaredOpcodes.length}`);
console.log(`  Errors:          ${errors}`);
console.log(`  Warnings:        ${warnings}`);

if (errors > 0) {
  console.error(`\nValidation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('\nValidation passed.');
}
