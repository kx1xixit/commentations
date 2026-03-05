#!/usr/bin/env node
/**
 * Runtime test for the built extension.
 * Uses createRequire to load build/extension.js as CommonJS so top-level
 * runtime errors (e.g. bare require calls, reference errors) are caught.
 * Also reports bundle size and block count.
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const BUILD_FILE = path.join(__dirname, '../build/extension.js');

// Provide a minimal Scratch stub so the extension IIFE can register
let registeredExtension = null;
globalThis.Scratch = {
  extensions: {
    register: ext => {
      registeredExtension = ext;
    },
  },
  translate: str => str,
};

require(BUILD_FILE);
console.log('Runtime check passed.');

// Report bundle size
const size = (fs.statSync(BUILD_FILE).size / 1024).toFixed(2);
console.log(`Bundle size:   ${size} KB`);

// Report block count via getInfo()
if (registeredExtension && typeof registeredExtension.getInfo === 'function') {
  try {
    const info = registeredExtension.getInfo();
    const blockCount = info?.blocks?.length ?? 0;
    console.log(`Blocks:        ${blockCount} (extension id: ${info?.id})`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`Could not call getInfo() on registered extension: ${detail}`);
  }
} else {
  console.warn('Could not retrieve block info from registered extension.');
}
