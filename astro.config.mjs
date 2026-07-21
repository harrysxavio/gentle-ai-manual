import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import starlightLinksValidator from 'starlight-links-validator';
import rehypeMermaid from 'rehype-mermaid';
import { autoImportComponents } from './src/plugins/auto-import-components.js';
import { buildSidebar } from './src/data/curriculum.mjs';

export default defineConfig({
  site: 'https://harrysxavio.github.io',
  base: '/gentle-ai-manual/',
  markdown: {
    rehypePlugins: [[rehypeMermaid, { strategy: 'inline-svg' }]],
  },
  integrations: [
    starlight({
      title: 'Gentle AI — Mega Manual',
      description: 'Manual pedagógico, técnico e interactivo del ecosistema Gentle-AI',
      logo: {
        src: '/public/logo.svg',
      },
      favicon: '/logo.svg',
      social: {
        github: 'https://github.com/harrysxavio/gentle-ai-manual',
        youtube: 'https://youtube.com/@gentlemanprogramming',
      },
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'Español',
          lang: 'es',
        },
      },
      sidebar: buildSidebar(),
      components: {
        Footer: './src/components/curriculum/StarlightFooterOverride.astro',
      },
      customCss: [
        './src/styles/custom.css',
      ],
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'description',
            content: 'Manual completo del ecosistema Gentle-AI para OpenCode y Codex',
          },
        },
      ],
    }),
    mdx(),
    sitemap(),
    starlightLinksValidator(),
  ],
  vite: {
    plugins: [autoImportComponents()],
  },
});
