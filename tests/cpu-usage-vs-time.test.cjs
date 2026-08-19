"use strict";

// RED/GREEN: lesson 01 must distinguish CURRENT CPU usage (a percentage, e.g.
// "% de uso de CPU") from ACCUMULATED CPU time (measured in seconds). These
// are two different measurements that appear together in task managers.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "src", "content", "docs", "01-fundamentos-tecnologicos", "01-como-funciona-una-computadora.md");

test("RED: lesson 01 distinguishes current CPU usage (%) from accumulated CPU time (s)", () => {
  const content = fs.readFileSync(FILE, "utf8");
  assert.match(content, /tiempo acumulado/i, "lesson 01 must mention accumulated CPU time");
  assert.match(content, /uso actual/i, "lesson 01 must mention current CPU usage");
  assert.match(content, /%/, "lesson 01 must express current usage as a percentage");
  assert.match(
    content,
    /(uso actual|tiempo acumulado)[\s\S]{0,250}(tiempo acumulado|uso actual)/i,
    "lesson 01 must contrast the two measurements",
  );
});