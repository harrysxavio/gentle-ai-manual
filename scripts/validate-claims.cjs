#!/usr/bin/env node
/**
 * validate-claims.cjs
 *
 * Validates data/evidence/verified-claims.yml and optional fixtures.
 *
 * Usage:
 *   node scripts/validate-claims.cjs                    # validates main claims file
 *   node scripts/validate-claims.cjs --fixtures         # validates + all fixtures
 *   node scripts/validate-claims.cjs --file PATH        # validates one file
 *
 * Checks:
 *   1. All required fields present
 *   2. No duplicate IDs
 *   3. status is one of: verified, documented, experimental, pending, retired, internal
 *   4. Volatile claims (verified/documented/experimental without pending) have source
 *   5. Volatile claims have observed_commit and verified_at
 *   6. retired claims: claim text does NOT read as current instruction
 *   7. internal claims: claim text does NOT read as public interface
 *   8. Go v2 path includes /v2
 *   9. Tier is NOT described by line count
 *   10. Deference is NOT described as authorization/approval
 *   11. sync is NOT described as binary upgrade
 *   12. doctor is NOT described as automatic repair
 *   13. receipt is NOT described as narrative report
 *   14. check green is NOT described as production proof
 *   15. pending status: claim text does NOT read as recommendation
 *   16. review finalize --result is NOT described as current
 *   17. main described as release
 *   18. "latest version" without snapshot reference
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const CLAIMS_FILE = path.join(ROOT, 'data', 'evidence', 'verified-claims.yml');
const FIXTURES_DIR = path.join(ROOT, 'data', 'evidence', 'fixtures');

const REQUIRED_FIELDS = [
  'id', 'component', 'claim', 'observed_version',
  'observed_commit', 'verified_at', 'source', 'status',
  'scope', 'platform', 'channel', 'canonical_page'
];

const VALID_STATUSES = ['verified', 'documented', 'experimental', 'pending', 'retired', 'internal'];

// Patterns that indicate a claim reads as current instruction (for retired)
const RETIRED_CURRENT_PATTERNS = [
  /\buse\s+review\s+finalize\s+--result\b/i,
  /\breview\s+finalize\s+--result\b(?!.*\b(RETIRED|retired|removed|legacy|Replaced|replaced)\b)/i,
];

// Patterns that indicate a claim reads as public interface (for internal)
const INTERNAL_PUBLIC_PATTERNS = [
  /\bdirect_inline\b(?=.*\b(configure|set\s+up|add\s+to|use\s+in|your\s+opencode\.json)\b)/i,
  /\bdelegated_direct\b(?=.*\b(configure|set\s+up|add\s+to|use\s+in|your\s+opencode\.json)\b)/i,
  /\bconfigure\s+(your\s+)?(opencode\.json|config)\b/i,
];

// Patterns that indicate deprecated anti-patterns
const GO_V2_WITHOUT_SLASH = /(?:go\s+install|go\s+get|import\s+)\s+["']?github\.com\/gentleman-programming\/gentle-ai(?!\/v2)(?:@v2|\/v2[\s,;.])/i;
const TIER_BY_LINES = /\b(tier|review\s+level|lens\s+selection)\s+(depends?\s+on|by|based\s+on)\s+(the\s+)?(number\s+of\s+)?(lines|changed\s+lines|size)/i;
const DEFER_AS_APPROVAL = /\b(deference|defer|abstain)\s+(means?|is|equals?)\b(?:\s+(?!(?:not|no|n't)\b)\w+)*?\s+(approval|authorization|accepted|approved)\b/i;
const SYNC_AS_UPGRADE = /\b(sync|synchronize)\s+(to\s+upgrade|upgrades?|is\s+an?\s+upgrade|as\s+an?\s+upgrade)\b/i;
const DOCTOR_AS_REPAIR = /\b(doctor)\b(?:\s+(?!(?:not|no|n't|does)\b)\w+)*?\s+(fix(es)?|repair(s)?|automatically|resolv(e|es))\b/i;
const RECEIPT_AS_NARRATIVE = /\b(receipt)\s+(is\s+(a\s+)?(narrative|report|summary|description)|as\s+a\s+report)\b/i;
const CHECK_GREEN_AS_PRODUCTION = /\b(a\s+)?(green|passing)\s+check\s+(proves?|means?|confirms?)\s+(production\s+)?read(y|iness)\b/i;
const PENDING_AS_RECOMMENDATION = /\b(y(ou\s+)?(should|can|must)\s+use\b|recommend(ed|ation))\b/i;
const REVIEW_FINALIZE_RESULT_CURRENT = /\breview\s+finalize\s+--result\s+(is\s+(current|available|the\s+way|how\s+to)|use\s+--result\s+to)/i;
const MAIN_AS_RELEASE = /\bmain\s+(branch\s+)?(is\s+(the\s+)?)?(release|published|stable|latest)\b/i;
const LATEST_WITHOUT_SNAPSHOT = /\b(latest|most\s+recent|newest|last)\s+(version|release)\b(?!.*\b(v\d+\.\d+|commit|sha|tag|snapshot)\b)/i;

class ClaimsValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.seenIds = new Set();
  }

  validateFile(filePath) {
    this.errors = [];
    this.warnings = [];
    this.seenIds = new Set();
    this.filePath = filePath;

    if (!fs.existsSync(filePath)) {
      this.errors.push(`File not found: ${filePath}`);
      return { errors: this.errors, warnings: this.warnings };
    }

    let data;
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      data = yaml.load(content);
    } catch (err) {
      this.errors.push(`YAML parse error: ${err.message}`);
      return { errors: this.errors, warnings: this.warnings };
    }

    if (!data || !Array.isArray(data.claims) || data.claims.length === 0) {
      this.errors.push('Root key "claims" must be a non-empty array');
      return { errors: this.errors, warnings: this.warnings };
    }

    for (let i = 0; i < data.claims.length; i++) {
      this.validateClaim(data.claims[i], i);
    }

    return { errors: this.errors, warnings: this.warnings };
  }

  validateClaim(claim, index) {
    const prefix = `Claim #${index + 1} (${claim.id || 'no-id'})`;

    // 1. Required fields
    for (const field of REQUIRED_FIELDS) {
      if (!claim[field] || claim[field] === false) {
        this.errors.push(`${prefix}: missing required field "${field}"`);
      }
    }

    // 2. No duplicate IDs
    if (claim.id) {
      if (this.seenIds.has(claim.id)) {
        this.errors.push(`${prefix}: duplicate ID "${claim.id}"`);
      }
      this.seenIds.add(claim.id);
    }

    // 3. Valid status
    if (claim.status && !VALID_STATUSES.includes(claim.status)) {
      this.errors.push(`${prefix}: invalid status "${claim.status}". Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    // 4. Volatile claims need source
    const volatileStatuses = ['verified', 'documented', 'experimental'];
    if (volatileStatuses.includes(claim.status) && (!claim.source || claim.source === '')) {
      this.errors.push(`${prefix}: volatile claim (${claim.status}) must have a non-empty source URL`);
    }

    // 5. Volatile claims need observed_commit and verified_at
    if (volatileStatuses.includes(claim.status)) {
      if (!claim.observed_commit || claim.observed_commit === '') {
        this.errors.push(`${prefix}: volatile claim (${claim.status}) must have observed_commit`);
      }
      if (!claim.verified_at || claim.verified_at === '') {
        this.errors.push(`${prefix}: volatile claim (${claim.status}) must have verified_at date`);
      }
    }

    // 6. Retired claims must not read as current instruction
    if (claim.status === 'retired' && claim.claim) {
      for (const pattern of RETIRED_CURRENT_PATTERNS) {
        if (pattern.test(claim.claim)) {
          this.errors.push(`${prefix}: retired claim reads as current instruction: "${claim.claim}"`);
        }
      }
    }

    // 7. Internal claims must not read as public interface
    if (claim.status === 'internal' && claim.claim) {
      for (const pattern of INTERNAL_PUBLIC_PATTERNS) {
        if (pattern.test(claim.claim)) {
          this.errors.push(`${prefix}: internal claim reads as public interface: "${claim.claim}"`);
        }
      }
    }

    // 8. Go v2 path without /v2
    if (claim.claim && GO_V2_WITHOUT_SLASH.test(claim.claim)) {
      this.errors.push(`${prefix}: Go v2 path missing /v2: "${claim.claim}"`);
    }

    // 9. Tier by lines
    if (claim.claim && TIER_BY_LINES.test(claim.claim)) {
      this.errors.push(`${prefix}: tier described by line count: "${claim.claim}"`);
    }

    // 10. Deference as approval
    if (claim.claim && DEFER_AS_APPROVAL.test(claim.claim)) {
      this.errors.push(`${prefix}: deference described as approval: "${claim.claim}"`);
    }

    // 11. Sync as upgrade
    if (claim.claim && SYNC_AS_UPGRADE.test(claim.claim)) {
      this.errors.push(`${prefix}: sync described as binary upgrade: "${claim.claim}"`);
    }

    // 12. Doctor as repair
    if (claim.claim && DOCTOR_AS_REPAIR.test(claim.claim)) {
      this.errors.push(`${prefix}: doctor described as automatic repair: "${claim.claim}"`);
    }

    // 13. Receipt as narrative
    if (claim.claim && RECEIPT_AS_NARRATIVE.test(claim.claim)) {
      this.errors.push(`${prefix}: receipt described as narrative report: "${claim.claim}"`);
    }

    // 14. Check green as production proof
    if (claim.claim && CHECK_GREEN_AS_PRODUCTION.test(claim.claim)) {
      this.errors.push(`${prefix}: green check described as production proof: "${claim.claim}"`);
    }

    // 15. Pending as recommendation
    if (claim.status === 'pending' && claim.claim && PENDING_AS_RECOMMENDATION.test(claim.claim)) {
      this.errors.push(`${prefix}: pending claim reads as recommendation: "${claim.claim}"`);
    }

    // 16. review finalize --result as current
    if (claim.claim && REVIEW_FINALIZE_RESULT_CURRENT.test(claim.claim)) {
      this.errors.push(`${prefix}: review finalize --result described as current: "${claim.claim}"`);
    }

    // 17. main as release
    if (claim.claim && MAIN_AS_RELEASE.test(claim.claim)) {
      this.errors.push(`${prefix}: main branch described as release: "${claim.claim}"`);
    }

    // 18. "latest version" without snapshot
    if (claim.claim && LATEST_WITHOUT_SNAPSHOT.test(claim.claim)) {
      this.warnings.push(`${prefix}: "latest/most recent" without snapshot reference: "${claim.claim}"`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const runFixtures = args.includes('--fixtures');
  const customFile = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

  const validator = new ClaimsValidator();
  let totalErrors = 0;
  let totalWarnings = 0;

  if (customFile) {
    const result = validator.validateFile(customFile);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    printResults(path.basename(customFile), result);
    process.exit(totalErrors > 0 ? 1 : 0);
    return;
  }

  // Validate main claims file
  const mainResult = validator.validateFile(CLAIMS_FILE);
  totalErrors += mainResult.errors.length;
  totalWarnings += mainResult.warnings.length;
  const mainClaimCount = countClaims(CLAIMS_FILE);
  printResults(`verified-claims.yml (${mainClaimCount} claims)`, mainResult);

  if (runFixtures) {
    console.log('\n--- Fixtures ---\n');

    const fixtureFiles = fs.readdirSync(FIXTURES_DIR)
      .filter(f => f.endsWith('.yml'))
      .sort();

    for (const file of fixtureFiles) {
      const filePath = path.join(FIXTURES_DIR, file);
      const result = validator.validateFile(filePath);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
      printResults(file, result);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Total: ${totalErrors} error(s), ${totalWarnings} warning(s)`);

  if (totalErrors > 0) {
    process.exit(1);
  }
}

function countClaims(filePath) {
  try {
    const data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
    return data && Array.isArray(data.claims) ? data.claims.length : 0;
  } catch {
    return 0;
  }
}

function printResults(label, result) {
  const status = result.errors.length === 0 ? 'PASS' : 'FAIL';
  const icon = result.errors.length === 0 ? '✅' : '❌';
  console.log(`${icon} ${label}: ${status}`);
  if (result.errors.length > 0) {
    console.log(`   Errors (${result.errors.length}):`);
    for (const err of result.errors) {
      console.log(`     • ${err}`);
    }
  }
  if (result.warnings.length > 0) {
    console.log(`   Warnings (${result.warnings.length}):`);
    for (const warn of result.warnings) {
      console.log(`     • ${warn}`);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { ClaimsValidator };
