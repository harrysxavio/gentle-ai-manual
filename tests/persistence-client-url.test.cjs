"use strict";

// RED/GREEN: lesson 04 must:
//   - explain that persistence is NOT exclusive to the backend (the browser
//     also persists data with localStorage/IndexedDB);
//   - show a full development URL WITH a port in prose (http://localhost:4321/),
//     not only inside code blocks;
//   - define the client as a program (a browser), not as "the computer".

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "src", "content", "docs", "01-fundamentos-tecnologicos", "04-frontend-backend.md");

test("RED: lesson 04 says persistence is not exclusive to the backend (localStorage/IndexedDB)", () => {
  const content = fs.readFileSync(FILE, "utf8");
  assert.match(content, /localStorage|IndexedDB/i, "lesson 04 must mention client-side persistence");
});

test("RED: lesson 04 shows a full URL with port in prose (not only inside code fences)", () => {
  const content = fs.readFileSync(FILE, "utf8");
  const prose = content.replace(/```[\s\S]*?```/g, "");
  assert.match(prose, /https?:\/\/[a-z0-9.-]+:\d+\//i, "prose must contain a URL with a port");
});

test("RED: lesson 04 defines the client as a browser or a program", () => {
  const content = fs.readFileSync(FILE, "utf8");
  assert.match(content, /cliente[\s\S]{0,140}(navegador|programa)/i, "client must be defined as a browser/program");
});