# Design and UX Contract

## Principle

A documentation page is an interface. Its hierarchy, spacing, navigation and responsive behavior are part of correctness.

## Use Starlight first

Prefer built-in Starlight components:

- `Aside` for notes, tips, cautions and dangers;
- `Steps` for procedures;
- `Tabs` for PowerShell/Bash or interface variants;
- `CardGrid` and `LinkCard` for small navigational groups;
- badges for compact status;
- standard code blocks and file trees.

Create custom components only when behavior cannot be achieved with built-ins or CSS.

## Page hierarchy

A lesson uses:

```text
title
short purpose
learning outcome
simple answer
diagram/example
progressive sections
exercise
summary
sources
route continuation
```

Avoid:

- multiple competing hero blocks;
- nested cards inside cards;
- wide two-column tables;
- large empty regions;
- decorative gradients;
- icons without meaning;
- more than one primary action per section.

## Responsive rules

Test at:

- 390×844 mobile;
- 768px tablet;
- 1440×900 desktop;
- light and dark themes.

Requirements:

- no horizontal document overflow;
- 44×44px interactive target minimum;
- readable code blocks with controlled horizontal scroll;
- cards become one column on narrow screens;
- tables become definition lists, stacked cards or scroll regions with labels;
- images use `max-width: 100%` and preserved aspect ratio;
- sticky UI never covers content or browser controls.

## Accessibility

- semantic headings in order;
- visible `:focus-visible`;
- no nested links;
- no ARIA label that hides meaningful descendant text;
- accessible names and descriptions;
- text alternatives for screenshots and diagrams;
- reduced-motion support;
- route current step uses `aria-current="step"`;
- status is conveyed with text, not only color.

## Visual regression evidence

Every content-UI PR captures:

- representative lesson desktop dark;
- desktop light;
- mobile;
- active route navigation;
- exercise block;
- screenshot figure if added.

CI checks computed layout and dimensions, not only screenshots.
