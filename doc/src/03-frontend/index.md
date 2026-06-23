# Frontend — Vue d'ensemble

## Technologies utilisées

| Technologie | Rôle | Analogie WinDev |
|-------------|------|----------------|
| **Vue 3** | Framework UI (composants réactifs) | Les pages + les composants visuels |
| **Vite** | Build tool (compilation, dev server) | L'environnement de compilation WinDev |
| **Vuetify** | Bibliothèque de composants Material Design | Les contrôles standards (boutons, tableaux, formulaires) |
| **Vue Router** | Gestion de la navigation (SPA) | La navigation entre pages |
| **Zod + useZodForm** | Validation de formulaires | Les contrôles de saisie |

## Structure du frontend

```
frontend/src/
├── main.ts              # Point d'entrée (crée l'app Vue, monte Vuetify, Router)
├── App.vue              # Composant racine
├── router/              # Configuration de la navigation
├── views/               # Pages complètes (une par route)
├── components/          # Composants métier (formulaires, listes)
├── common/               # Composants UI communs (formulaires génériques, tableaux, dialogues)
├── services/            # Appels API (communication avec le backend)
├── composables/          # Logique réutilisable (composables Vue)
├── directives/           # Directives Vue personnalisées (permission)
```

## Comment ça fonctionne — Le flux d'une action utilisateur

```
Utilisateur clique → Vue Router → View → Service → API Backend
     ↑                                                        ↓
  Mise à jour UI ← Réponse JSON ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

1. L'utilisateur clique sur un lien ou un bouton
2. **Vue Router** charge la **View** correspondante (chargement paresseux)
3. La **View** utilise un **Service** pour appeler l'API
4. Le **Service** utilise `ApiService` pour faire la requête HTTP
5. La réponse met à jour les données réactives de Vue
6. L'interface se met à jour automatiquement (réactivité)

## Démarrer le frontend

```bash
# Mode développement (hot reload)
npm run dev:web

# Compiler pour la production
npm --workspace frontend run build

# Aperçu de la build
npm --workspace frontend run preview
```

## SPA — Single Page Application

Ce frontend est une **SPA** (Single Page Application) : une seule page HTML qui charge toute l'application JavaScript. La navigation entre "pages" se fait sans rechargement, gérée par Vue Router.

> **Analogie WinDev** : En WinDev, chaque page est un formulaire distinct qui se charge. Ici, tout est chargé une fois, et Vue Router fait apparaître/disparaître les composants comme des "pages virtuelles".

## Prochaines étapes

- **[CSS — Les bases](./css-bases.md)** — Flexbox, Grid et les fondamentaux du style
- **[Architecture](./architecture.md)** — Comprendre chaque dossier et son rôle
- **[Communication entre composants](./communication-composants.md)** — Props, évents et v-model : comment les composants parlent entre eux
- **[ref() vs reactive()](./ref-vs-reactive.md)** — Les deux façons de créer des données réactives
- **[Gestion d'état global](./etat-global.md)** — Composables et provide/inject : pourquoi les stores ne sont pas toujours nécessaires
- **[Ajouter une fonctionnalité](./ajouter-une-fonctionnalite.md)** — Guide pas-à-pas complet
