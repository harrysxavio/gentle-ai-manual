# Audience Levels

## Principle

Do not write three disconnected versions of the same lesson. Use progressive disclosure:

```text
simple answer
→ guided example
→ operational detail
→ internal mechanics
→ architecture and trade-offs
```

## Beginner layer

A beginner must understand:

- what the concept is;
- what problem it solves;
- where it lives or runs;
- how it connects to the previous lesson;
- what to remember;
- which new terms are essential.

Rules:

- expand an acronym on first use;
- define a term before relying on it;
- introduce no more than five essential new terms before a recap;
- pair every command with its purpose and expected result;
- distinguish an analogy from the actual mechanism.

## Operator layer

An operator must understand:

- how to use or configure it;
- which file, command, screen or service participates;
- what changes after an action;
- how to inspect state;
- how to diagnose failure;
- how Windows, WSL, macOS and Linux differ when relevant.

Every operational procedure includes:

```text
prerequisite
→ action
→ expected output
→ verification
→ recovery
```

## Architect layer

An architect must understand:

- responsibility boundaries;
- data and control flow;
- failure modes;
- security and privacy implications;
- scaling behavior;
- alternatives;
- trade-offs;
- when not to add the component;
- stable concept versus version-specific implementation.

## Reader simulation checklist

### Beginner review

- Were terms used before definition?
- Does the first section answer the title?
- Can the reader explain the diagram in their own words?
- Are commands labeled by shell?
- Is there a clear next action?

### Operator review

- Are prerequisites complete?
- Is expected output shown?
- Can the state be inspected?
- Is failure recovery bounded and safe?
- Are destructive actions identified?

### Architect review

- Are boundaries explicit?
- Are claims absolute without evidence?
- Are costs and alternatives present?
- Does the design avoid unnecessary complexity?
- Are current implementation details dated or sourced?
