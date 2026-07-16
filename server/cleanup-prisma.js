#!/usr/bin/env node
/**
 * Cleanup script to remove incorrect Prisma binaries
 * This ensures only the debian-openssl-3.0.x binary exists
 */

const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma', 'client');

console.log('🧹 Cleaning up Prisma binaries...');

// List of binaries to remove (anything that's not debian-openssl)
const binariesToRemove = [
  'libquery_engine-linux-musl.so.node',
  'libquery_engine-linux-musl-openssl-3.0.x.so.node',
  'libquery_engine-linux-musl-openssl-1.1.x.so.node',
  'libquery_engine-linux-arm64-openssl-3.0.x.so.node',
  'query_engine-linux-musl',
  'query_engine-linux-musl-openssl-3.0.x',
  'query_engine-linux-musl-openssl-1.1.x',
];

let removed = 0;
let kept = 0;

binariesToRemove.forEach(binary => {
  const binaryPath = path.join(prismaClientPath, binary);
  if (fs.existsSync(binaryPath)) {
    try {
      fs.unlinkSync(binaryPath);
      console.log(`  ❌ Removed: ${binary}`);
      removed++;
    } catch (error) {
      console.error(`  ⚠️  Failed to remove ${binary}:`, error.message);
    }
  }
});

// Check what binaries remain
console.log('\n📦 Remaining Prisma binaries:');
try {
  const files = fs.readdirSync(prismaClientPath);
  files.forEach(file => {
    if (file.includes('query_engine') || file.includes('libquery_engine')) {
      console.log(`  ✅ ${file}`);
      kept++;
    }
  });
} catch (error) {
  console.error('  ⚠️  Could not read Prisma client directory');
}

console.log(`\n✨ Cleanup complete! Removed: ${removed}, Kept: ${kept}`);

if (kept === 0) {
  console.error('⚠️  WARNING: No Prisma binaries found! This may cause runtime errors.');
  process.exit(1);
}
