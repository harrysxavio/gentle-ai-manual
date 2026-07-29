/**
 * Claims Validator RED—GREEN test suite.
 *
 * Tests every fixture against scripts/validate-claims.cjs::ClaimsValidator.
 * Uses bare node --test (TAP protocol).
 */

const path = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(ROOT, 'data', 'evidence', 'fixtures');
const MAIN_CLAIMS = path.join(ROOT, 'data', 'evidence', 'verified-claims.yml');

const { ClaimsValidator } = require(path.join(ROOT, 'scripts', 'validate-claims.cjs'));

const validator = new ClaimsValidator();

const VALID_MINIMAL = path.join(FIXTURES, 'valid-minimal.yml');
const VALID_FULL = path.join(FIXTURES, 'valid-full.yml');
const MISSING_ID = path.join(FIXTURES, 'invalid-missing-id.yml');
const DUPLICATE_ID = path.join(FIXTURES, 'invalid-duplicate-id.yml');
const VOLATILE_NO_DATE = path.join(FIXTURES, 'invalid-volatile-no-date.yml');
const NO_SOURCE = path.join(FIXTURES, 'invalid-no-source.yml');
const PENDING_REC = path.join(FIXTURES, 'invalid-pending-as-recommendation.yml');
const RETIRED_CURRENT = path.join(FIXTURES, 'invalid-retired-as-current.yml');
const INTERNAL_PUBLIC = path.join(FIXTURES, 'invalid-internal-as-public.yml');
const GO_V2_NOSLASH = path.join(FIXTURES, 'invalid-go-v2-without-slash.yml');
const TIER_LINES = path.join(FIXTURES, 'invalid-tier-by-lines.yml');
const DEFER_APPROVAL = path.join(FIXTURES, 'invalid-defer-as-approval.yml');
const SYNC_UPGRADE = path.join(FIXTURES, 'invalid-sync-as-upgrade.yml');
const DOCTOR_REPAIR = path.join(FIXTURES, 'invalid-doctor-as-repair.yml');
const EMPTY_CLAIMS = path.join(FIXTURES, 'invalid-empty-claims.yml');
const FALSE_FIELDS = path.join(FIXTURES, 'invalid-false-fields.yml');

/* ------------------------------------------------------------------ */
/*  Tests 1—14: individual fixture checks                             */
/* ------------------------------------------------------------------ */

test('1: valid minimal claim passes', () => {
  const result = validator.validateFile(VALID_MINIMAL);
  assert.strictEqual(result.errors.length, 0, 'Expected no errors for valid-minimal');
  assert.strictEqual(result.warnings.length, 0, 'Expected no warnings for valid-minimal');
});

test('2: claim without ID fails', () => {
  const result = validator.validateFile(MISSING_ID);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('missing required field "id"')), 'Expected error about missing id');
});

test('3: duplicate ID fails', () => {
  const result = validator.validateFile(DUPLICATE_ID);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('duplicate ID')), 'Expected error about duplicate ID');
});

test('4: volatile claim without date passes with warning', () => {
  const result = validator.validateFile(VOLATILE_NO_DATE);
  assert.strictEqual(result.errors.length, 0, 'Expected no errors — claim text triggers a warning, not an error');
  assert.ok(result.warnings.length > 0, 'Expected at least one warning');
  assert.ok(result.warnings.some(w => w.includes('latest/most recent')), 'Expected warning about missing snapshot reference');
});

test('5: claim without source fails', () => {
  const result = validator.validateFile(NO_SOURCE);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('must have a non-empty source')), 'Expected error about missing source');
});

test('6: pending as recommendation fails', () => {
  const result = validator.validateFile(PENDING_REC);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('reads as recommendation')), 'Expected error about pending-as-recommendation');
});

test('7: retired as current instruction fails', () => {
  const result = validator.validateFile(RETIRED_CURRENT);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('retired claim reads as current instruction')), 'Expected error about retired-as-current');
});

test('8: internal as public interface fails', () => {
  const result = validator.validateFile(INTERNAL_PUBLIC);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('internal claim reads as public interface')), 'Expected error about internal-as-public');
});

test('9: review finalize --result as current fails', () => {
  const result = validator.validateFile(RETIRED_CURRENT);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('review finalize --result')), 'Expected error about review finalize --result');
});

test('10: Go v2 path without /v2 fails', () => {
  const result = validator.validateFile(GO_V2_NOSLASH);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('Go v2 path missing /v2')), 'Expected error about missing /v2');
});

test('11: tier by lines fails', () => {
  const result = validator.validateFile(TIER_LINES);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('tier described by line count')), 'Expected error about tier-by-lines');
});

test('12: deference as approval fails', () => {
  const result = validator.validateFile(DEFER_APPROVAL);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('deference described as approval')), 'Expected error about defer-as-approval');
});

test('13: sync as upgrade fails', () => {
  const result = validator.validateFile(SYNC_UPGRADE);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('sync described as binary upgrade')), 'Expected error about sync-as-upgrade');
});

test('14: doctor as repair fails', () => {
  const result = validator.validateFile(DOCTOR_REPAIR);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('doctor described as automatic repair')), 'Expected error about doctor-as-repair');
});

/* ------------------------------------------------------------------ */
/*  Tests 15—16: valid / main pass                                    */
/* ------------------------------------------------------------------ */

test('15: full valid fixture passes', () => {
  const result = validator.validateFile(VALID_FULL);
  assert.strictEqual(result.errors.length, 0, 'Expected no errors for valid-full');
});

test('16: main claims file passes', () => {
  const result = validator.validateFile(MAIN_CLAIMS);
  assert.strictEqual(result.errors.length, 0, 'Expected no errors for verified-claims.yml');
});

/* ------------------------------------------------------------------ */
/*  Tests 17—18: regression — edge cases                              */
/* ------------------------------------------------------------------ */

test('17: empty claims array fails', () => {
  const result = validator.validateFile(EMPTY_CLAIMS);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('non-empty')), 'Expected error about empty claims');
});

test('18: all-false fields fail', () => {
  const result = validator.validateFile(FALSE_FIELDS);
  assert.ok(result.errors.length > 0, 'Expected errors but got none');
  assert.ok(result.errors.some(e => e.includes('missing required field')), 'Expected error about missing fields');
});
