# Verification Procedure

## RED

1. Move the candidate skill outside all discovery paths.
2. Start a fresh OpenCode session.
3. Run every baseline scenario.
4. Save and score outputs.
5. Confirm targeted failures occur.

## GREEN

1. Restore `.opencode/skills/writing-gentle-manual-content/SKILL.md`.
2. Confirm permission and discovery.
3. Start a fresh session.
4. Load the skill.
5. Repeat and score every scenario.

## REFACTOR

For every failure, change the smallest relevant skill section and rerun in fresh context.

Store evidence in:

```text
docs/implementation/next-roadmap/skill-verification-report.md
```
