#!/usr/bin/env node
"use strict";

// Deterministic test runner for every supported Node release (>=18).
// Enumerates tests/*.test.cjs explicitly — no shell glob expansion — so
// `npm test` behaves identically on Windows and Linux CI. Node 18 and
// Node 20 pass a quoted glob to --test literally and fail, so the runner
// resolves the files itself and invokes Node with explicit paths.

const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const TESTS_DIR = path.join(ROOT, "tests");

function discoverTestFiles() {
  return fs
    .readdirSync(TESTS_DIR)
    .filter((name) => name.endsWith(".test.cjs"))
    .sort()
    .map((name) => path.join(TESTS_DIR, name));
}

const args = process.argv.slice(2);
if (args.includes("--list-files")) {
  for (const file of discoverTestFiles()) process.stdout.write(file + "\n");
  process.exit(0);
}

const files = discoverTestFiles();
if (files.length === 0) {
  console.error("run-tests: no test files found under tests/");
  process.exit(1);
}

const result = cp.spawnSync(process.execPath, ["--test", ...files], {
  cwd: ROOT,
  stdio: "inherit",
});
process.exit(result.status === null ? 1 : result.status);
