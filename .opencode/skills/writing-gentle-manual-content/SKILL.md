---
name: writing-gentle-manual-content
description: Use when creating, rewriting, reviewing, or expanding lessons, glossary entries, diagrams, examples, exercises, tool comparisons, screenshots, or technical explanations in the Gentle-AI manual.
license: MIT
compatibility: opencode
metadata:
  project: gentle-ai-manual
  language: es
  content-system: astro-starlight
---

# Writing Gentle Manual Content

## Core principle

Write one progressive explanation that a beginner can enter, an operator can apply, and an architect can interrogate. Every claim must be understandable, useful, and verifiable.

## Required workflow

1. Read the canonical curriculum entry and neighboring lessons.
2. Build a concept inventory: existing page, canonical page, source, audience and test.
3. Read:
   - `lesson-contract.md`
   - `audience-levels.md`
   - `source-and-evidence-policy.md`
   - `design-and-ux.md`
   - `route-continuity.md`
   - `diagrams-and-examples.md`
   - `exercises-and-labs.md`
   - `images-and-attribution.md`
   - `quality-rubric.md`
4. Write a failing content or built-site test before the lesson.
5. Draft the lesson using progressive depth.
6. Update curriculum, glossary and route membership from the single source.
7. Run the editorial validator and full site validation.
8. Score the page. A score below 90/100 blocks the PR.
9. Review as beginner, operator and architect.
10. Use the same PR repair loop until CI and review are green.

## Page contract

Every lesson marked `manual_contract: lesson-v1` includes:

- observable learning outcome;
- simple answer;
- mental model with limits;
- useful diagram or explicit reason why none is needed;
- one continuous example;
- practical walkthrough;
- internal technical explanation;
- use/avoid/trade-offs;
- common failures and diagnosis;
- verification or exercise;
- concise summary;
- sources and scope.

## Presentation contract

Use Starlight components before custom UI. Preserve readable width, keyboard navigation, light/dark themes and a 390px mobile viewport. Never use color as the only signal.

## Evidence contract

Video and books may organize or teach concepts. Current commands, versions, paths, capabilities and product behavior require first-party evidence.

## Stop conditions

Stop instead of guessing when:

- a command or configuration cannot be verified;
- the canonical page is ambiguous;
- an external image lacks clear provenance;
- a change requires moving an existing URL;
- a test fails or a review comment remains current.
