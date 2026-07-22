# Exercises and Labs Contract

## Exercise purpose

Exercises prove a capability. They do not merely repeat commands.

## Exercise levels

### Checkpoint

5–10 minutes. One concept.

### Guided practice

20–45 minutes. A controlled change with exact verification.

### Challenge

45–90 minutes. The learner chooses among alternatives and justifies the decision.

### Capstone

Multi-module project with artifacts, review and deployment evidence.

## Required lab structure

```yaml
manual_contract: lab-v1
```

Sections:

1. Capability demonstrated.
2. Scenario.
3. Prerequisites.
4. Safety boundary.
5. Starting state.
6. Task.
7. Constraints.
8. Expected artifacts.
9. Verification commands.
10. Evidence to save.
11. Rubric.
12. Recovery/reset.
13. Advanced extension.

## OpenCode + Gentle-AI maximum-expression labs

The progression should eventually exercise:

1. initialize a disposable Git repository;
2. inspect `AGENTS.md`;
3. load the editorial or project skill;
4. choose Plan mode before a non-trivial change;
5. use a Gentle-AI configured SDD route when verified;
6. use Engram memory when available;
7. assign or confirm a model profile;
8. execute in an isolated branch/worktree;
9. run tests;
10. review the diff;
11. produce a receipt or evidence record;
12. open a PR;
13. diagnose CI;
14. deploy and verify the same SHA.

## Tool capability preflight

Before an exercise uses a capability, the learner checks:

- installed tool and version;
- surface: desktop, TUI, CLI or IDE;
- model supports required tools;
- permission allows skill/MCP/tool;
- repository is disposable or backed up;
- no secret will be committed.

Exercises must include a fallback path that does not require a paid provider.

## Evidence artifacts

Examples:

- architecture diagram;
- `AGENTS.md`;
- plan;
- changed files;
- test log;
- screenshot;
- PR URL;
- HEAD SHA;
- CI check;
- deployment URL;
- short decision record.

## Rubric

Score:

- result;
- safety;
- reasoning;
- verification;
- evidence;
- ability to explain trade-offs.

A successful command without understanding does not receive full credit.
