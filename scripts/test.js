#!/usr/bin/env node
/**
 * Runtime test for the built extension.
 * Executes build/extension.js inside a vm context so that:
 *  - The package "type": "module" declaration is irrelevant (no require/import).
 *  - Top-level runtime errors (reference errors, bare require calls, etc.) are caught.
 * Also reports bundle size and block count.
 */

import vm from 'node:vm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BUILD_FILE = path.join(__dirname, '../build/extension.js');

// Provide a minimal Scratch stub so the extension IIFE can register
let registeredExtension = null;
const context = vm.createContext({
  Scratch: {
    extensions: {
      register: ext => {
        registeredExtension = ext;
      },
    },
    translate: str => str,
    BlockType: {
      COMMAND: 'command',
      REPORTER: 'reporter',
      BOOLEAN: 'boolean',
      CONDITIONAL: 'conditional',
      HAT: 'hat',
      LOOP: 'loop',
    },
    ArgumentType: {
      STRING: 'string',
      BOOLEAN: 'boolean',
      NUMBER: 'number',
      COLOR: 'color',
      ANGLE: 'angle',
    },
  },
});

const code = fs.readFileSync(BUILD_FILE, 'utf8');
vm.runInContext(code, context);
console.log('Runtime check passed.');

// Report bundle size
const size = (fs.statSync(BUILD_FILE).size / 1024).toFixed(2);
console.log(`Bundle size:   ${size} KB`);

// Verify an extension was actually registered
if (!registeredExtension || typeof registeredExtension.getInfo !== 'function') {
  console.error('No extension was registered or getInfo() is missing — bundle is broken.');
  process.exit(1);
}

// Report block count via getInfo()
try {
  const info = registeredExtension.getInfo();
  if (!info || !Array.isArray(info.blocks)) {
    console.error('getInfo() returned invalid data (null/undefined or missing blocks array).');
    process.exit(1);
  }
  const blockCount = info.blocks.length;
  console.log(`Blocks:        ${blockCount} (extension id: ${info.id})`);
} catch (err) {
  const detail = err instanceof Error ? err.message : String(err);
  console.error(`getInfo() threw an error: ${detail}`);
  process.exit(1);
}
