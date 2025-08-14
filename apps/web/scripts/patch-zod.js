#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to node_modules/zod
const zodPath = path.join(__dirname, '..', 'node_modules', 'zod');

console.log('🔧 Starting Zod v4 compatibility patch...');

// Ensure zod directory exists
if (!fs.existsSync(zodPath)) {
  console.error('❌ Zod not found at:', zodPath);
  process.exit(1);
}

// Create v4.js file as a complete mirror with email compatibility
const v4JsContent = `// Complete compatibility shim - re-export everything from zod
const zod = require('./lib/index.js');
module.exports = zod;

// Add the email function that BetterAuth expects
module.exports.email = () => zod.string().email();`;

const v4JsPath = path.join(zodPath, 'v4.js');
fs.writeFileSync(v4JsPath, v4JsContent);
console.log('✅ Created v4.js file');

// Create v4.mjs file as a complete mirror with email compatibility
const v4MjsContent = `// Complete compatibility shim - re-export everything from zod
export * from './lib/index.mjs';

// Import the string function to create email validator
import { string as stringType } from './lib/index.mjs';

// Add the email function that BetterAuth expects
export const email = () => stringType().email();

// Also provide default export for compatibility
import zodDefault from './lib/index.mjs';
export default zodDefault;`;

const v4MjsPath = path.join(zodPath, 'v4.mjs');
fs.writeFileSync(v4MjsPath, v4MjsContent);
console.log('✅ Created v4.mjs file');

// Read and modify package.json
const packageJsonPath = path.join(zodPath, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Ensure exports exists
if (!packageJson.exports) {
  packageJson.exports = {};
}

// Always add/update v4 export
packageJson.exports['./v4'] = {
  types: './index.d.ts',
  require: './v4.js',
  import: './v4.mjs'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json exports');

// Verify the files were created
if (fs.existsSync(v4JsPath) && fs.existsSync(v4MjsPath)) {
  console.log('✅ Zod v4 compatibility patch applied successfully');
} else {
  console.error('❌ Failed to create v4 compatibility files');
  process.exit(1);
}