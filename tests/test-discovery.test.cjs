"use strict";

// P1: the test runner must enumerate tests/*.test.cjs explicitly (no shell
// glob expansion) so `npm test` works on every supported Node release
// (>=18) and never scans directories outside tests/.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

const runner = path.resolve(__dirname, "..", "scripts", "run-tests.cjs");

test("RED: test runner lists every tests/*.test.cjs file", () => {
  const result = cp.spawnSync(process.execPath, [runner, "--list-files"], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `Runner must exit 0:\n${result.stderr}`);
  const listed = result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((p) => path.resolve(p))
    .sort();
  const expected = fs
    .readdirSync(__dirname)
    .filter((name) => name.endsWith(".test.cjs"))
    .map((name) => path.resolve(__dirname, name))
    .sort();
  assert.deepEqual(listed, expected);
});

test("RED: test runner never scans files outside tests/", () => {
  const result = cp.spawnSync(process.execPath, [runner, "--list-files"], {
    cwd: path.resolve(__dirname, ".."),
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `Runner must exit 0:\n${result.stderr}`);
  const listed = result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((p) => path.resolve(p));
  assert.ok(listed.length > 0, "Expected at least one test file");
  for (const file of listed) {
    assert.equal(path.dirname(file), __dirname, `Unexpected path outside tests/: ${file}`);
  }
});
