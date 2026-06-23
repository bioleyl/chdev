# Intelligence Artificielle — Vue d'ensemble

## Pourquoi cette section ?

Si vous venez de WinDev, vous n'avez probablement jamais utilisé d'outil d'IA pour coder. C'est normal — WinDev est un environnement complet avec tout intégré. Dans l'écosystème JavaScript, l'IA est devenue un **assistant de développement** puissant, mais le vocabulaire peut être déroutant : *modèle*, *agent*, *MCP*, *skills*, *extensions*…

Cette section vous explique **ce que c'est**, **à quoi ça sert**, et **comment l'utiliser** efficacement avec le projet CHDev.

## Les concepts clés

| Concept | Rôle | Analogie WinDev |
|---------|------|----------------|
| **Modèle (LLM)** | Le "cerveau" — un réseau de neurones entraîné pour comprendre et générer du texte | Le moteur de langage 4D (comprend vos instructions) |
| **Agent** | L'environnement qui utilise le modèle + des outils (lire, écrire, exécuter) | WinDev lui-même (moteur + éditeur + débogueur) |
| **Skills** | Des paquets de compétences spécialisées chargées à la demande | Des modules ou classes utilitaires que vous incluez quand vous en avez besoin |
| **Extensions** | Du code TypeScript qui ajoute des fonctionnalités à l'agent | Des extensions WinDev ou des procédures personnalisées |
| **MCP** | Un protocole standard pour connecter des outils externes à l'IA | L'ODBC ou les connexions externes de WinDev |
| **Context Files** | Des fichiers de configuration qui guident l'agent (`AGENTS.md`) | Les commentaires d'en-tête de vos fichiers WIN |

## Comment ça marche — Le flux

```
Vous (l'utilisateur)
    ↓
Agent (l'environnement — pi, Claude Code, Cursor…)
    ↓
    ├─ Modèle (le "cerveau" — Claude, GPT, Gemini…)
    ├─ Outils (lire des fichiers, écrire, exécuter des commandes)
    ├─ Skills (compétences chargées selon le contexte)
    └─ Extensions (fonctionnalités personnalisées)
    ↓
Résultat (code généré, fichiers modifiés, explications)
```

## Ce que l'IA peut faire dans ce projet

- **Lire et comprendre** la structure du projet CHDev
- **Générer du code** (controllers, repositories, composants Vue)
- **Expliquer** des concepts JavaScript/Node.js avec des analogies WinDev
- **Déboguer** en analysant les erreurs et proposant des corrections
- **Créer des migrations** de base de données
- **Écrire de la documentation**

## Ce que l'IA ne fait PAS

- **Ne remplace pas votre jugement** — elle peut se tromper
- **Ne connaît pas WinDev** — c'est vous l'expert WinDev, pas elle
- **Ne devine pas** — elle a besoin de contexte (fichiers, erreurs, descriptions)
- **N'exécute pas sans demande** — elle attend vos instructions

## Prochaines étapes

1. **[Les modèles de langage](./modeles.md)** — Comprendre ce qu'est un LLM et comment en choisir un
2. **[Les agents de codage](./agents.md)** — L'environnement qui fait le lien entre vous et le modèle
3. **[Skills et extensions](./skills-extensions.md)** — Comment spécialiser et personnaliser l'agent
4. **[MCP et intégrations](./mcp.md)** — Connecter des outils externes à l'IA
5. **[Bonnes pratiques](./bonnes-pratiques.md)** — Utiliser l'IA efficacement avec ce projet
