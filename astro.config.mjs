import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import starlightLinksValidator from 'starlight-links-validator';
import { autoImportComponents } from './src/plugins/auto-import-components.js';

export default defineConfig({
  site: 'https://harrysxavio.github.io',
  base: '/gentle-ai-manual/',
  integrations: [
    starlight({
      title: 'Gentle AI — Mega Manual',
      description: 'Manual pedagógico, técnico e interactivo del ecosistema Gentle-AI',
      logo: {
        src: '/public/logo.svg',
      },
      social: {
        github: 'https://github.com/Gentleman-Programming/gentle-ai-mega-manual-es',
        youtube: 'https://youtube.com/@gentlemanprogramming',
      },
      defaultLocale: 'root',
      locales: {
        root: {
          label: 'Español',
          lang: 'es',
        },
      },
      sidebar: [
        {
          label: 'Empezar aquí',
          autogenerate: { directory: '00-empezar-aqui' },
        },
        {
          label: 'Fundamentos tecnológicos',
          autogenerate: { directory: '01-fundamentos-tecnologicos' },
        },
        {
          label: 'Git y GitHub',
          autogenerate: { directory: '02-git-y-github' },
        },
        {
          label: 'Fundamentos de IA',
          autogenerate: { directory: '03-fundamentos-de-ia' },
        },
        {
          label: 'Ecosistema Gentle',
          autogenerate: { directory: '04-ecosistema-gentle' },
        },
        {
          label: 'Instalación',
          autogenerate: { directory: '05-instalacion' },
        },
        {
          label: 'Primer proyecto',
          autogenerate: { directory: '06-primer-proyecto' },
        },
        {
          label: 'Gentle-AI',
          autogenerate: { directory: '07-gentle-ai' },
        },
        {
          label: 'SDD — Spec-Driven Development',
          autogenerate: { directory: '08-sdd' },
        },
        {
          label: 'Engram — Memoria persistente',
          autogenerate: { directory: '09-engram' },
        },
        {
          label: 'Skills',
          autogenerate: { directory: '10-skills' },
        },
        {
          label: 'Calidad y revisión',
          autogenerate: { directory: '11-calidad-y-revision' },
        },
        {
          label: 'OpenCode',
          autogenerate: { directory: '12-opencode' },
        },
        {
          label: 'Codex',
          autogenerate: { directory: '13-codex' },
        },
        {
          label: 'Modelos y enrutamiento',
          autogenerate: { directory: '14-modelos-y-enrutamiento' },
        },
        {
          label: 'Terminal',
          autogenerate: { directory: '15-terminal' },
        },
        {
          label: 'Arquitectura técnica',
          autogenerate: { directory: '16-arquitectura-tecnica' },
        },
        {
          label: 'Seguridad, costos y gobierno',
          autogenerate: { directory: '17-seguridad-costos-y-gobierno' },
        },
        {
          label: 'Construcción de productos',
          autogenerate: { directory: '18-construccion-de-productos' },
        },
        {
          label: 'Laboratorios',
          autogenerate: { directory: '19-laboratorios' },
        },
        {
          label: 'Referencia',
          autogenerate: { directory: '20-referencia' },
        },
      ],
      components: {
        // Override for custom theme components
        // ThemeProvider: './src/components/theme-override.astro',
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
