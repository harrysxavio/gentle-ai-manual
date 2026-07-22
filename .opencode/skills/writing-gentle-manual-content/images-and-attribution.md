# Images and Attribution

## Principle

Use an image only when it helps the learner recognize a real interface, locate a control or compare product surfaces.

Never use AI-generated screenshots of real tools.

## Source preference

1. Official first-party product documentation or repository.
2. Screenshot captured by the project owner from the installed tool.
3. Third-party source only with clear permission and unique pedagogical value.

## Do not hotlink

When reuse is permitted:

1. download the asset into the repository;
2. optimize it without changing meaning;
3. record provenance in `data/media/tool-screenshot-sources.yml`;
4. use a stable local path;
5. retain the official source link in the caption or sources section.

If permission is unclear, do not copy the image. Use a `LinkCard` to the official page or capture a user-owned screenshot.

## File layout

```text
public/images/tools/
├── opencode/
├── codex/
├── gentle-ai/
└── engram/
```

Names:

```text
tool-surface-purpose-observed-date.webp
```

Example:

```text
opencode-tui-build-mode-2026-07-21.webp
```

## Required manifest fields

```yaml
id:
tool:
surface:
local_path:
source_page:
source_asset:
source_owner:
observed_at:
observed_version:
reuse_basis:
alt:
caption:
features_visible:
sha256:
```

`reuse_basis` must be one of:

- official-doc-asset-reviewed;
- repository-license-reviewed;
- owner-captured;
- link-only.

## Figure contract

```html
<figure class="tool-figure">
  <img
    src="/gentle-ai-manual/images/tools/opencode/example.webp"
    alt="..."
    width="..."
    height="..."
    loading="lazy"
    decoding="async"
  />
  <figcaption>
    OpenCode en modo Build. Fuente oficial consultada el 21-07-2026.
  </figcaption>
</figure>
```

For the first meaningful above-the-fold image, omit lazy loading only after measuring.

## Alt text

Describe what the learner needs to notice, not every pixel.

Bad:

```text
Screenshot of OpenCode.
```

Good:

```text
OpenCode TUI showing the conversation, Build mode selector, active model and command hints along the bottom.
```

## Current candidate first-party sources

### OpenCode

- Source page: `https://opencode.ai/docs/`
- Official TUI asset:
  `https://dev.opencode.ai/docs/_astro/screenshot.CQjBbRyJ_1dLadc.webp`

The asset demonstrates the terminal interface. Verify the current page and provenance before committing.

### Codex

- Source page: `https://openai.com/codex/`
- Official app surface:
  `https://images.ctfassets.net/kftzwdyauwt9/4VICAqwJvjaSSJZpERHfXo/12fec864cec9d3fa3b6dd47dd8c5059b/codex-landing-product-surfaces-app.png?fm=webp&q=90&w=3840`
- Official editor surface:
  `https://images.ctfassets.net/kftzwdyauwt9/67q8M6lUey7LslnSRTQD5o/0c08babf51e4b3615ff928cd6c380abb/codex-landing-product-surfaces-editor.png?fm=webp&q=90&w=3840`
- Official terminal surface:
  `https://images.ctfassets.net/kftzwdyauwt9/5zIp2sCdBS7Dwx6XEb6pUk/ab9cf89ace5573d99c8ed2712709e3bc/codex-landing-product-surfaces-terminal.png?fm=webp&q=90&w=3840`

Do not infer availability, version or capability solely from text visible in a marketing screenshot.

### Gentle-AI

- Source page: `https://github.com/Gentleman-Programming/gentle-ai`
- Official banner:
  `https://github.com/Gentleman-Programming/gentle-ai/raw/main/docs/assets/brand/gentle-ai-banner.png`

The banner is branding, not an interface screenshot. For the TUI, prefer a project-owner screenshot from the actual installed version unless a first-party TUI asset with clear provenance is found.

## Screenshot comparison lesson

A tool comparison should show:

- surface name;
- what the screenshot demonstrates;
- what the tool owns;
- what it delegates;
- controls visible;
- limitations of the screenshot;
- link to current official documentation.
