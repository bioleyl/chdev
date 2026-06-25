import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/chdev/',
  ignoreDeadLinks: true,
  title: 'CHDev — Documentation',
  description: 'Documentation et guide de formation pour le projet CHDev',
  lastUpdated: true,
  vite: {
    server: {
      port: 2500,
      strictPort: true,
    },
  },
  themeConfig: {
    outline: { level: [2, 3] },
    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: 'Démarrage rapide', link: '/01-introduction/getting-started' },
          { text: 'Présentation du projet', link: '/01-introduction/' },
          { text: 'Git — Contrôle de version', link: '/01-introduction/git' },
          { text: 'Node.js et npm', link: '/01-introduction/node-js' },
          { text: 'TypeScript', link: '/01-introduction/typescript' },
          { text: 'Linting et Formatting', link: '/01-introduction/linting-formatting' },
          { text: 'Zod — Validation de schémas', link: '/01-introduction/zod' },
        ],
      },
      {
        text: 'Backend',
        collapsed: false,
        items: [
          { text: 'Vue d\'ensemble', link: '/02-backend/' },
          { text: 'Architecture', link: '/02-backend/architecture' },
          { text: 'Middlewares', link: '/02-backend/middlewares' },
          { text: 'Ajouter un endpoint', link: '/02-backend/ajouter-un-endpoint' },
        ],
      },
      {
        text: 'Frontend',
        collapsed: false,
        items: [
          { text: 'Vue d\'ensemble', link: '/03-frontend/' },
          { text: 'CSS — Les bases', link: '/03-frontend/css-bases' },
          { text: 'Architecture', link: '/03-frontend/architecture' },
          { text: 'Communication entre composants', link: '/03-frontend/communication-composants' },
          { text: 'Gestion d\'état global', link: '/03-frontend/etat-global' },
          { text: 'ref() vs reactive()', link: '/03-frontend/ref-vs-reactive' },
          { text: 'Ajouter une fonctionnalité', link: '/03-frontend/ajouter-une-fonctionnalite' },
        ],
      },
      {
        text: 'Intelligence Artificielle',
        collapsed: false,
        items: [
          { text: 'Vue d\'ensemble', link: '/04-ai/' },
          { text: 'Les modèles de langage (LLM)', link: '/04-ai/modeles' },
          { text: 'Les agents de codage', link: '/04-ai/agents' },
          { text: 'Skills et extensions', link: '/04-ai/skills-extensions' },
          { text: 'MCP et intégrations', link: '/04-ai/mcp' },
          { text: 'Bonnes pratiques', link: '/04-ai/bonnes-pratiques' },
        ],
      },
      {
        text: 'Electron',
        collapsed: false,
        items: [
          { text: 'Vue d\'ensemble', link: '/05-electron/' },
          { text: 'Architecture', link: '/05-electron/architecture' },
          { text: 'Builder et packaging', link: '/05-electron/packaging' },
        ],
      },
      {
        text: 'Exercices',
        collapsed: false,
        items: [
          { text: 'Vue d\'ensemble', link: '/07-exercices/' },
          { text: 'Communication entre composants', link: '/07-exercices/communication-composants' },
          { text: 'TypeScript', link: '/07-exercices/typescript' },
          { text: 'Vue.js de base', link: '/07-exercices/vue-basiques' },
        ],
      },
    ],
  },
});
