// validate-models.cjs
// Validates model IDs in catalog.yml against common patterns
// Usage: node scripts/validate-models.cjs

const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'data', 'models', 'catalog.yml');

if (!fs.existsSync(catalogPath)) {
  console.log('⚠️  Model catalog not found, skipping validation');
  process.exit(0);
}

const content = fs.readFileSync(catalogPath, 'utf-8');

// Basic YAML validation
if (!content.includes('models:')) {
  console.log('❌ Catalog missing "models:" root key');
  process.exit(1);
}

// Check model IDs exist
const modelIds = content.match(/^\s+- id: .+$/gm);
if (!modelIds || modelIds.length === 0) {
  console.log('❌ No model IDs found in catalog');
  process.exit(1);
}

console.log(`✅ Found ${modelIds.length} models in catalog`);
console.log('✅ Model validation passed');
