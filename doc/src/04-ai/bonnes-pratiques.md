# Bonnes pratiques — Utiliser l'IA avec ce projet

## Principes fondamentaux

### 1. L'IA est un assistant, pas un remplaçant

| ✅ Bonne attitude | ❌ Mauvaise attitude |
|------------------|---------------------|
| "Voici ce que je veux, aide-moi à le faire" | "Fais tout, je sais pas ce que je veux" |
| Vérifier le code généré avant de l'utiliser | Copier-coller sans lire |
| Comprendre ce que l'IA a fait | Accepter sans questionner |
| Corriger l'IA quand elle se trompe | Abandonner quand ça ne marche pas du premier coup |

> **Analogie WinDev** : L'IA est comme un **développeur junior motivé** qui connaît beaucoup de théorie mais qui a besoin de supervision. Vous êtes le senior qui valide, corrige, et guide.

### 2. Donnez toujours du contexte

L'IA ne devine rien. Plus vous donnez de contexte, meilleur sera le résultat.

```
❌ Mauvais : "Crée un endpoint"
✅ Bon : "Crée un endpoint GET /api/factures qui retourne la liste des factures avec pagination.
          Regarde backend/src/controllers/prestation.controller.ts pour le pattern à suivre."
```

### 3. Une tâche à la fois

Découpez les demandes complexes en étapes :

```
Étape 1 : "Crée l'entity Facture avec les colonnes : id, montant, date, clientId"
Étape 2 : "Crée le repository FactureRepository"
Étape 3 : "Crée le controller FactureController avec GET /api/factures"
Étape 4 : "Ajoute la route dans app.ts"
Étape 5 : "Crée la migration"
```

> **Règle importante** : Ne demandez pas "Crée tout le module factures" en une seule fois. L'IA risque de faire des erreurs ou d'oublier des étapes.

### 4. Vérifiez et testez

Après chaque modification générée par l'IA :

1. **Lisez** le code généré
2. **Lancez** le linter : `npm run lint`
3. **Testez** manuellement l'endpoint ou la fonctionnalité
4. **Vérifiez** que les imports sont corrects

## Guide par type de tâche

### Créer un nouveau module backend

```
1. "Regarde la structure de backend/src/ et explique-moi les dossiers"
2. "Crée l'entity pour [nom] avec ces colonnes : [...]"
3. "Crée le repository pour [nom]"
4. "Crée le controller pour [nom] avec ces endpoints : [...]"
5. "Ajoute les routes dans le fichier de routes"
6. "Crée la migration TypeORM"
7. "Lance npm run lint pour vérifier"
```

### Déboguer une erreur

```
1. Copiez-collez l'erreur complète
2. "Cette erreur vient de quel fichier ?"
3. "Quelle est la cause probable ?"
4. "Propose une correction"
5. Appliquez la correction et testez
```

### Comprendre un concept

```
1. "Explique-moi [concept] avec une analogie WinDev"
2. "Montre-moi un exemple concret dans ce projet"
3. "Quelles sont les alternatives ?"
```

### Modifier du code existant

```
1. "Lis le fichier [chemin] et explique-moi ce qu'il fait"
2. "Je veux ajouter [fonctionnalité]. Quel est le meilleur endroit pour le faire ?"
3. "Modifie le fichier en ajoutant [...]"
4. "Vérifie que tout est cohérent avec le reste du projet"
```

## Pièges courants

### Hallucinations

L'IA peut inventer du code, des noms de fonctions, ou des chemins de fichiers qui n'existent pas.

```
❌ L'IA dit : "Importe { createApp } de '@chdev/utils'"
   Mais le fichier '@chdev/utils' n'existe pas !

✅ Solution : Vérifiez toujours les imports. Demandez à l'IA de lire le fichier
   avant de proposer un import.
```

### Contexte perdu

Si la conversation est trop longue, l'IA "oublie" le début.

```
❌ Après 50 messages, l'IA ne se souvient plus de la structure du projet

✅ Solution : Utilisez /compact pour résumer, ou commencez une nouvelle session
   en donnant le contexte nécessaire
```

### Code qui compile mais ne fonctionne pas

L'IA peut générer du code syntaxiquement correct mais logiquement faux.

```
❌ Le code compile mais l'endpoint retourne une erreur 500

✅ Solution : Testez toujours manuellement. Lisez les logs du serveur.
   Demandez à l'IA de vérifier la logique métier.
```

### Modifications non cohérentes

L'IA peut modifier un fichier sans mettre à jour les fichiers dépendants.

```
❌ L'IA modifie l'entity mais oublie de mettre à jour le repository

✅ Solution : Demandez à l'IA de vérifier l'impact sur les autres fichiers.
   Utilisez la commande "Vérifie que tout est cohérent" après chaque modification.
```

## Astuces pour de meilleurs résultats

### Référencer des fichiers existants

```
@backend/src/controllers/prestation.controller.ts
Crée un controller similaire pour les factures.
```

### Demander des explications progressives

```
1. "Donne-moi un résumé de ce fichier"
2. "Explique la fonction X en détail"
3. "Pourquoi utilise-t-on ce pattern ici ?"
```

### Utiliser le niveau de raisonnement

| Tâche | Niveau de raisonnement |
|-------|----------------------|
| Question simple | Off |
| Modification de code | Low |
| Création de nouveau code | Medium |
| Architecture / Refactoring | High |
| Débogage complexe | High |

### Sauvegarder avant de modifier

```
git stash          # Sauvegarde vos modifications
# → Faire modifier l'IA
git diff           # Voir ce que l'IA a changé
git stash pop      # Restaurer si besoin
```

## Checklist avant de valider le code de l'IA

- [ ] Le code compile (`npm run build` ou `npx tsc --noEmit`)
- [ ] Le linter est propre (`npm run lint`)
- [ ] Les imports existent et sont corrects
- [ ] Les types TypeScript sont cohérents
- [ ] La logique métier est correcte (test manuel)
- [ ] Les fichiers dépendants sont mis à jour
- [ ] Les migrations sont créées (si modification de la base)
- [ ] Le code suit les conventions du projet

## Exercices pratiques

> 💡 **Conseil** : Ces exercices vous font pratiquer les bonnes pratiques avec ce projet.

### Exercice 1 — Demander avec contexte

Au lieu de dire "Crée un endpoint", essayez :

*"Regarde `backend/src/controllers/prestation.controller.ts` et `backend/src/routes/prestation.routes.ts`. Crée un controller et des routes similaires pour un module 'produit' avec les champs : id, nom, prix, stock."*

<details>
<summary>🔽 Voir la solution</summary>

L'agent lit les fichiers de référence, comprend le pattern, et crée le nouveau code en suivant les conventions du projet.

**Explications :**
- Référencer des fichiers existants donne à l'IA un modèle à suivre
- Préciser les champs évite les hallucinations
- L'agent utilise les skills du projet (chdev-backend) automatiquement

</details>

---

### Exercice 2 — Déboguer une erreur

1. Modifiez un fichier pour introduire une erreur (ex: supprimez un import)
2. Lancez `npm run lint`
3. Copiez l'erreur et demandez à l'IA de la corriger

<details>
<summary>🔽 Voir la solution</summary>

L'agent analyse l'erreur, identifie le problème, et propose la correction.

**Explications :**
- Toujours copier l'erreur complète (pas juste le début)
- L'IA peut identifier le fichier et la ligne problématique
- Vérifiez que la correction est correcte avant d'appliquer

</details>

---

### Exercice 3 — Workflow complet

Créez un petit module complet en suivant les étapes :

1. *"Quels sont les dossiers dans backend/src/ ?"*
2. *"Crée une entity 'Categorie' avec id, nom, description"*
3. *"Crée le repository CategorieRepository"*
4. *"Crée le controller avec GET /api/categories et POST /api/categories"*
5. *"Vérifie que tout est cohérent"*
6. *"Lance npm run lint"*

<details>
<summary>🔽 Voir la solution</summary>

Suivez chaque étape une par une. Après chaque étape, vérifiez le résultat avant de passer à la suivante.

**Explications :**
- Découper en étapes évite les erreurs d'accumulation
- La vérification à chaque étape permet de corriger tôt
- C'est le workflow recommandé pour tout nouveau module

</details>

---

### Exercice 4 — Nettoyer après les exercices

Supprimez les fichiers créés pendant les exercices :

*"Supprime les fichiers créés pendant les exercices (controller produit, entity Categorie, etc.) et restore l'état initial du projet."*

<details>
<summary>🔽 Voir la solution</summary>

L'agent identifie les fichiers à supprimer et les retire proprement.

**Explications :**
- Toujours nettoyer après les exercices
- Vous pouvez aussi utiliser `git checkout -- .` pour tout restaurer
- Gardez le projet propre pour les prochains exercices

</details>

---

## Ressources pour aller plus loin

- [Prompts efficaces pour le code](https://www.anthropic.com/engineering/prompts)
- [OpenAI Cookbook — Exemples de prompts](https://github.com/openai/openai-cookbook)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
