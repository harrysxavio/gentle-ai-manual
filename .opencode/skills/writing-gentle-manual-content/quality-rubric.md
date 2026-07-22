# Quality Rubric

A lesson requires at least 90/100 before review.

| Dimension | Points |
|---|---:|
| Technical accuracy | 20 |
| Beginner clarity | 15 |
| Operational usefulness | 10 |
| Architectural depth | 10 |
| Continuous example | 8 |
| Diagram or justified omission | 8 |
| Trade-offs and limits | 8 |
| Exercise and verification | 7 |
| Sources and evidence | 6 |
| Route, glossary and navigation integration | 4 |
| Web/mobile presentation and accessibility | 4 |

## Hard failures

Regardless of score, the page fails when it contains:

- an invented command;
- current product behavior without first-party evidence;
- a broken internal link;
- a Mermaid error;
- an external image without provenance;
- a screenshot with empty alt text;
- an inaccessible primary interaction;
- an omitted route/curriculum registration;
- `@ts-nocheck`;
- a failing CI check;
- a current review finding left unresolved.

## Required score report

```text
Technical accuracy: x/20 — evidence
Beginner clarity: x/15 — evidence
...
Total: x/100
Hard failures: none/list
```

The author cannot award full points without naming evidence. An independent reviewer evaluates specification compliance, technical truth, clarity, web/mobile presentation and evidence.
