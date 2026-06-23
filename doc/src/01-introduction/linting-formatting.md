# Linting et Formatting

## Qu'est-ce que le linting ?

Le **linting** est l'analyse automatique du code pour détecter :

- Les **erreurs potentielles** (variable déclarée mais jamais utilisée, code mort)
- Les **mauvaises pratiques** (complexité excessive, patterns dangereux)
- Les **incohérences** (mélanges de styles)

> **Analogie WinDev** : Le linting ≈ l'analyseur de code WinDev qui détecte les variables non utilisées, les procédures sans appel, etc. Mais ici, il s'exécute en continu et est configurable.

## Qu'est-ce que le formatting ?

Le **formatting** (mise en forme) est l'application automatique de règles de style :

- Indentation (2 espaces dans ce projet)
- Guillemets simples vs doubles (simples ici)
- Points-virgules (toujours présents ici)
- Longueur maximale des lignes (115 caractères)
- Tri des imports

> **Analogie WinDev** : Le formatting ≈ l'outil de reformatage automatique du code. Plus de débats sur le style — la machine décide.

## Biome — L'outil utilisé dans ce projet

Ce projet utilise **[Biome](https://biomejs.dev/)**, un outil tout-en-un qui remplace à la fois un linter (ESLint) et un formateur (Prettier). Il est écrit en Rust et est extrêmement rapide.

### Configuration

La configuration est dans le fichier [`biome.json`](../../biome.json) à la racine du projet :

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 115
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "preset": "recommended"
    }
  }
}
```

### Commandes

```bash
# Linter + formater tout le projet (avec correction automatique)
npm run lint

# Équivalent explicite
npx biome check --fix
```

Le projet inclut une configuration VS Code (`.vscode/settings.json`) pour que Biome s'exécute **à chaque sauvegarde**. Pour tout savoir sur l'environnement de développement, consultez la page **[Visual Studio Code](./vscode.md)**.

## `.editorconfig` — Configuration partagée entre éditeurs

Le fichier `.editorconfig` définit des règles de base comprises par tous les éditeurs de code (VS Code, Vim, Sublime, etc.) :

```ini
[*]
insert_final_newline = true
indent_style = space
indent_size = 2
end_of_line = lf
```

Cela garantit une cohérence minimale même si un développeur utilise un éditeur différent.

## Bonnes pratiques

1. **Toujours lancer `npm run lint` avant de commit** — Cela corrige les problèmes de format automatiquement
2. **Ne pas désactiver les règles Biome** sans justification (commentez pourquoi)
3. **Configurer votre éditeur** pour formater à la sauvegarde
4. **Les imports sont triés automatiquement** par Biome — ne les trie pas à la main

## Ressources pour aller plus loin

- [Documentation Biome](https://biomejs.dev/)
- [Site EditorConfig](https://editorconfig.org/)
