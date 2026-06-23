# Skills et extensions

## Qu'est-ce qu'un skill ?

Un **skill** (compétence) est un paquet de connaissances spécialisé que l'agent charge **à la demande** quand la tâche correspond à son domaine. C'est un fichier Markdown (`SKILL.md`) avec des instructions précises que l'agent peut lire et suivre.

> **Analogie WinDev** : Un skill est comme un **module utilitaire** que vous incluez dans votre projet quand vous en avez besoin. Par exemple, le module "Export Excel" n'est chargé que quand vous faites une exportation. Ici, le skill "documentation" est chargé quand vous demandez de la documentation.

### Comment ça fonctionne

```
Démarrage de l'agent
    ↓
L'agent scanne les dossiers de skills
    ↓
Seuls les noms et descriptions sont chargés (léger)
    ↓
Vous demandez : "Écris la documentation du controller"
    ↓
L'agent reconnaît que le skill "chdev-doc" correspond
    ↓
L'agent charge le SKILL.md complet (instructions détaillées)
    ↓
L'agent suit les instructions du skill
```

C'est ce qu'on appelle la **divulgation progressive** : seules les descriptions sont toujours en mémoire, le contenu complet se charge uniquement quand c'est utile.

### Structure d'un skill

```
mon-skill/
├── SKILL.md              # Fichier principal (obligatoire)
├── scripts/              # Scripts utilitaires (optionnel)
│   └── process.sh
└── references/           # Documentation détaillée (optionnel)
    └── api-reference.md
```

### Exemple de SKILL.md

```markdown
---
name: chdev-doc
description: Règles pour écrire la documentation CHDev en français.
             Activer quand on crée ou modifie de la documentation.
---

# Rédaction de documentation CHDev

## Langue
Toute la documentation est en français.

## Analogies WinDev
Systématiquement, fournir une analogie WinDev pour chaque concept.

## Structure
Chaque page se termine par des exercices pratiques.
```

### Les skills du projet CHDev

Ce projet utilise plusieurs skills spécialisés :

| Skill | Description | Quand il s'active |
|-------|-------------|-------------------|
| **chdev-backend** | Conventions backend (Express + TypeORM + Zod) | Quand on crée/modifie du code backend |
| **chdev-doc** | Règles de documentation en français | Quand on écrit de la documentation |
| **plan-first** | Workflow de planification | Quand on demande un plan avant d'implémenter |
| **librarian** | Recherche de bibliothèques open-source | Quand on a besoin de détails sur une librairie |

### Emplacements des skills

Les skills peuvent être placés à différents niveaux de portée :

| Emplacement | Portée |
|-------------|--------|
| Dossier global de l'agent | Tous les projets |
| `.pi/skills/` dans le projet | Seulement ce projet |
| `.agents/skills/` | Projet (standard partagé) |

### Activer un skill manuellement

La plupart des agents chargent automatiquement les skills pertinents. Mais vous pouvez aussi forcer le chargement :

```
/skill:chdev-doc
```

Ou avec des arguments :

```
/skill:chdev-doc Écris la documentation pour le module de factures
```

## Qu'est-ce qu'une extension ?

Une **extension** est un module **code** (TypeScript, JavaScript, etc.) qui ajoute des fonctionnalités à l'agent: nouveaux outils, nouvelles commandes, interception d'événements, interface utilisateur personnalisée…

> **Analogie WinDev** : Une extension est comme une **procédure externe** ou un **contrôle personnalisé** que vous ajoutez à WinDev. Elle étend les capacités de base avec du code personnalisé.

### Différence entre skill et extension

| Aspect | Skill | Extension |
|--------|-------|-----------|
| **Format** | Markdown (texte) | TypeScript (code) |
| **Rôle** | Donne des instructions au modèle | Ajoute des fonctionnalités à l'agent |
| **Exécution** | Le modèle lit et suit les instructions | Le code s'exécute directement |
| **Complexité** | Simple — texte structuré | Avancé — programmation |
| **Exemple** | "Écris toujours en français" | "Ajoute un outil pour déployer en production" |

### Ce qu'une extension peut faire

| Capacité | Description | Analogie WinDev |
|----------|-------------|----------------|
| **Outils personnalisés** | Nouvelles actions que le modèle peut appeler | Ajouter une nouvelle fonction |
| **Commandes** | Commandes `/` personnalisées | Ajouter un menu personnalisé |
| **Interception** | Bloquer ou modifier des actions | Ajouter un contrôle de sécurité |
| **UI personnalisée** | Widgets, dialogues, notifications | Créer un formulaire personnalisé |
| **Événements** | Réagir au démarrage, à la fin, etc. | Les événements de fenêtre |

### Exemple d'extension simple

Les extensions suivent un pattern similaire selon l'agent utilisé :

```typescript
// Exemple générique d'extension
export default function (agent) {
  // Réagir au démarrage
  agent.on("session_start", async (event, ctx) => {
    ctx.ui.notify("Extension chargée !", "info");
  });

  // Bloquer les commandes dangereuses
  agent.on("tool_call", async (event, ctx) => {
    if (event.toolName === "bash" && event.input.command?.includes("rm -rf")) {
      const ok = await ctx.ui.confirm("Danger !", "Autoriser rm -rf ?");
      if (!ok) return { block: true, reason: "Bloqué par l'utilisateur" };
    }
  });

  // Ajouter un outil personnalisé
  agent.registerTool({
    name: "greet",
    label: "Saluer",
    description: "Saluer quelqu'un par son nom",
    async execute(_toolCallId, params) {
      return {
        content: [{ type: "text", text: `Bonjour, ${params.name} !` }],
      };
    },
  });
}
```

### Emplacements des extensions

| Emplacement | Portée |
|-------------|--------|
| Dossier global de l'agent | Tous les projets |
| `.pi/extensions/` dans le projet | Seulement ce projet |

## Context Files — Les fichiers de contexte

Les **context files** sont des fichiers Markdown que l'agent lit au démarrage pour comprendre le projet. Le plus courant est `AGENTS.md` (ou `CLAUDE.md`).

> **Analogie WinDev** : C'est comme les **commentaires d'en-tête** de vos fichiers WIN — des instructions qui s'appliquent à tout le projet.

### Rôle de AGENTS.md

```markdown
# Projet CHDev

## Technologies
- Backend : Express + TypeORM + SQLite
- Frontend : Vue 3 + Vuetify
- Validation : Zod

## Conventions
- Les noms de fichiers en anglais
- La documentation en français
- Un test par fonctionnalité
```

### Emplacements

| Emplacement | Portée |
|-------------|--------|
| `~/.pi/agent/AGENTS.md` | Global (tous les projets) |
| `AGENTS.md` (racine du projet) | Projet |
| `AGENTS.md` (dossiers parents) | Hérité |

## Prompt Templates — Les modèles de prompt

Un **prompt template** est un texte réutilisable avec des variables, lancé via une commande `/`.

> **Analogie WinDev** : C'est comme un **modèle de procédure** — un squelette de code que vous remplissez avec vos données.

### Exemple

Fichier `~/.pi/agent/prompts/review.md` :

```markdown
Reviewe ce code pour les bugs, problèmes de sécurité et performance.
Concentre-toi sur : {{focus}}
```

Utilisation :

```
/review focus=gestion des erreurs
```

Résultat envoyé au modèle :

```
Reviewe ce code pour les bugs, problèmes de sécurité et performance.
Concentre-toi sur : gestion des erreurs
```

## Résumé — Tous les concepts ensemble

```
Agent (pi)
├── Modèle (Claude, GPT…) ← Le "cerveau"
├── Outils (read, write, bash…) ← Les "mains"
├── Skills ← Les "manuels spécialisés" (chargés à la demande)
├── Extensions ← Les "outils personnalisés" (code TypeScript)
├── Context Files ← Les "instructions du projet" (AGENTS.md)
└── Prompt Templates ← Les "modèles de demande" (réutilisables)
```

| Concept | Format | Quand l'utiliser |
|---------|--------|-----------------|
| **Modèle** | Sélection dans l'agent | Choisir le "cerveau" |
| **Skill** | Markdown (`SKILL.md`) | Instructions spécialisées récurrentes |
| **Extension** | TypeScript (`.ts`) | Fonctionnalités avancées, outils custom |
| **Context File** | Markdown (`AGENTS.md`) | Instructions permanentes du projet |
| **Prompt Template** | Markdown avec `{{vars}}` | Demandes réutilisables |

## Exercices pratiques

> 💡 **Conseil** : Ces exercices nécessitent un agent de codage lancé dans le dossier du projet.

### Exercice 1 — Lister les skills disponibles

Dans pi, tapez : *"Quels skills sont disponibles pour ce projet ?"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent devrait lister les skills chargés : chdev-backend, chdev-doc, plan-first, librarian.

**Explications :**
- Les skills sont découverts automatiquement au démarrage
- Chaque skill a un nom et une description
- L'agent choisit quel skill charger en fonction de votre demande

</details>

---

### Exercice 2 — Activer un skill manuellement

Tapez : `/skill:chdev-doc`

<details>
<summary>🔽 Voir la solution</summary>

Le skill chdev-doc se charge et l'agent suit ses instructions pour la documentation.

**Explications :**
- `/skill:nom` force le chargement d'un skill spécifique
- Utile quand l'agent ne détecte pas automatiquement le bon skill
- Les arguments après le nom sont transmis au skill

</details>

---

### Exercice 3 — Créer un prompt template simple

Créez le fichier `~/.pi/agent/prompts/windev.md` :

```markdown
Explique ce concept JavaScript en utilisant une analogie WinDev.
Concept : {{concept}}
```

Puis dans pi, tapez : `/windev concept=middleware Express`

<details>
<summary>🔽 Voir la solution</summary>

L'agent reçoit le prompt rempli : *"Explique ce concept JavaScript en utilisant une analogie WinDev. Concept : middleware Express"*

**Explications :**
- Les templates utilisent `{{variable}}` pour les paramètres
- La commande `/nom` remplace les variables et envoie le résultat au modèle
- C'est un raccourci pour des demandes récurrentes

</details>

---

## Ressources pour aller plus loin

- [Spécification Agent Skills](https://agentskills.io/)
- [Anthropic - Agent Skills documentation](https://docs.anthropic.com/en/docs/build-with-claude/agent-skills-overview)
- [GitHub - Exemples d'extensions d'agents](https://github.com/topics/coding-agent-extension)
