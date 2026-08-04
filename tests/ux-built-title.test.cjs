// tests/ux-built-title.test.cjs — RED/GREEN regression for Codex P3 finding
// (PR #17, reviewed 462a7d204d, comment id 3715536158):
//
//   validate-ux-built.cjs must require the home <title> to be EXACTLY the
//   canonical brand "Manual Gentil para IA", not merely "not containing a '|'
//   delimiter". A wrong title WITHOUT a '|' used to pass because the left side
//   of the `||` was true; only the duplicated-delimiter branch was detected.
//
// Invariant: a home <title> that is not the exact canonical brand MUST fail
// the UX built-site contract, regardless of whether it contains a '|'.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'validate-ux-built.cjs');

// Build a minimal but otherwise-valid dist fixture so that the only variable
// between cases is the home <title>. All other checks in validate-ux-built.cjs
// must already pass for the fixture.
function fixture(title) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ux-built-'));
  const write = (rel, content) => {
    const target = path.join(root, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  write(
    'index.html',
    '<html><head><title>' + title + '</title></head>' +
    '<body><h1>Manual Gentil para IA</h1>' +
    '<p>Ampliar diagrama</p><dialog></dialog>Manual Gentil para IA</body></html>'
  );
  write(
    '00-empezar-aqui/01-bienvenida/index.html',
    '<html><body><h1>Bienvenida</h1>pagination</body></html>'
  );
  write(
    '20-referencia/02-glosario/index.html',
    '<html><body><p data-pagefind-weight="10">glosario</p></body></html>'
  );
  return root;
}

function runOn(dir) {
  const res = cp.spawnSync(process.execPath, [SCRIPT, dir], { cwd: ROOT, encoding: 'utf8' });
  return { status: res.status, out: res.stdout + res.stderr };
}

test('canonical home title passes the UX built-site contract', () => {
  const { status } = runOn(fixture('Manual Gentil para IA'));
  assert.equal(status, 0, 'canonical title fixture should validate clean');
});

test('wrong home title without a pipe delimiter is rejected', () => {
  const { status, out } = runOn(fixture('Manual Gentil'));
  assert.notEqual(status, 0, 'wrong non-pipe title must fail the contract');
  assert.match(out, /FAIL: home <title>/);
});

test('duplicated home title (X | X) is rejected', () => {
  const { status, out } = runOn(fixture('Manual Gentil para IA | Manual Gentil para IA'));
  assert.notEqual(status, 0, 'duplicated delimiter title must fail the contract');
  assert.match(out, /FAIL: home <title>/);
});