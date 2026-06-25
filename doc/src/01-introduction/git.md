# Git — Contrôle de version

## Qu'est-ce que Git ?

**Git** est un **système de contrôle de version** (VCS — Version Control System). Il permet de :

- **Suivre les modifications** de vos fichiers dans le temps
- **Revenir en arrière** si une modification casse quelque chose
- **Travailler en équipe** sans écraser le travail des autres
- **Créer des branches** pour développer des fonctionnalités en parallèle

> **Analogie WinDev** : Git ≈ la fonction **GDS (Gestionnaire de Sources)** de WinDev qui sauvegarde des copies de votre projet et historise vos modifications de code. Au lieu d'avoir `Projet_v1.hdp`, `Projet_v2.hdp`, `Projet_v2_bis.hdp`, Git garde une trace précise de chaque modification de chaque fichier, et vous permet de revenir à n'importe quel moment.

### Pourquoi Git est essentiel ?

| Sans Git | Avec Git |
|----------|----------|
| Vous ne pouvez pas revenir en arrière facilement | Vous pouvez annuler n'importe quelle modification |
| Travailler à plusieurs = conflits et pertes de données | Les modifications de chacun sont fusionnées proprement |
| Pas de trace de qui a modifié quoi | Historique complet avec auteurs et dates |
| Sauvegardes manuelles risquées | Chaque modification est sauvegardée automatiquement |

## Concepts fondamentaux

### Les trois états d'un fichier

Git gère les fichiers dans trois états :

```
Modifié → Ajouté au staging → Commité
  (working)   (staging)      (repository)
```

| État | Nom | Description |
|------|-----|-------------|
| 📝 **Working** | Modifié | Vous avez changé le fichier, mais Git ne l'a pas encore enregistré |
| 📋 **Staging** | Index | Vous avez dit à Git "je veux inclure ce changement dans le prochain commit" |
| ✅ **Committed** | Commit | Le changement est définitivement sauvegardé dans l'historique |

### Le dépôt (repository)

Un **dépôt Git** est un dossier qui contient vos fichiers ainsi que l'historique de toutes les modifications. Chaque dossier du projet CHDev qui contient un sous-dossier `.git` est un dépôt (ou fait partie d'un dépôt).

### Les branches

Une **branche** est une ligne de développement indépendante. Vous pouvez créer une branche pour une nouvelle fonctionnalité, travailler dessus, puis la fusionner avec la branche principale.

```
main:  A — B — C — D
                \
feature:         E — F — G
```

> **Analogie WinDev** : Une branche ≈ un clone de votre projet où vous pouvez expérimenter sans risquer de casser la version stable. Quand vous êtes satisfait, vous fusionnez les changements.

## Installation et configuration

### Vérifier l'installation

```bash
git --version
```

Si Git n'est pas installé, téléchargez-le depuis [git-scm.com](https://git-scm.com/).

### Configuration initiale

Avant de commencer, configurez votre identité :

```bash
# Votre nom (apparaîtra dans l'historique)
git config --global user.name "Votre Nom"

# Votre email (apparaîtra dans l'historique)
git config --global user.email "votre.email@example.com"
```

> **Note** : L'option `--global` applique la configuration à tous vos projets. Sans `--global`, la configuration s'applique uniquement au projet courant.

## Commandes essentielles

### Cloner un dépôt

Pour récupérer le projet CHDev depuis un dépôt distant (GitHub, GitLab, etc.) :

```bash
git clone https://github.com/bioleyl/chdev.git
cd chdev
npm install
```

> **Analogie WinDev** : `git clone` ≈ télécharger un projet partagé. Vous obtenez tous les fichiers ET tout l'historique.

### Voir l'état du projet

```bash
# Voir quels fichiers ont changé
git status
```

Exemple de sortie :

```
On branch main
Changes not staged for commit:
  modified:   backend/src/controllers/facture.controller.ts
Untracked files:
  backend/src/controllers/prestation.controller.ts
```

| Statut | Signification |
|--------|---------------|
| `modified` | Fichier existant qui a été modifié |
| `Untracked` | Nouveau fichier que Git ne suit pas encore |
| `deleted` | Fichier supprimé |

### Ajouter des fichiers au staging

```bash
# Ajouter un fichier spécifique
git add backend/src/controllers/prestation.controller.ts

# Ajouter tous les fichiers modifiés
git add .

# Ajouter tous les fichiers .ts modifiés
git add '*.ts'
```

### Créer un commit

Un **commit** est une sauvegarde instantanée de vos changements :

```bash
# Commit avec un message descriptif
git commit -m "ajouter le contrôleur des prestations"
```

> **Règle importante** : Les messages de commit doivent être en français, commencer par un verbe à l'infinitif, et décrire clairement ce qui a changé.

#### Bonnes pratiques des messages de commit

| ✅ Bon | ❌ À éviter |
|--------|------------|
| `ajouter la gestion des factures` | `modifs` |
| `corriger le calcul du total HT` | `fix` |
| `ajouter la validation Zod pour les prestations` | `update stuff` |

### Voir l'historique

```bash
# Historique complet
git log

# Historique condensé (une ligne par commit)
git log --oneline

# Historique avec les fichiers modifiés
git log --stat
```

Exemple de sortie `git log --oneline` :

```
a1b2c3d ajouter la validation Zod pour les prestations
e4f5g6h corriger le calcul du total HT
7h8i9j0 ajouter la gestion des factures
```

### Les branches

```bash
# Voir les branches existantes
git branch

# Créer une nouvelle branche
git branch feature/prestation

# Basculer vers une branche
git checkout feature/prestation

# Créer et basculer en une commande
git checkout -b feature/prestation

# Revenir sur la branche principale
git checkout main

# Fusionner une branche dans la branche courante
git merge feature/prestation
```

> **Analogie WinDev** : `git branch` ≈ créer un sous-projet parallèle. `git merge` ≈ importer les modifications du sous-projet dans le projet principal.

### Synchroniser avec un dépôt distant

```bash
# Voir les dépôts distants configurés
git remote -v

# Récupérer les modifications du dépôt distant
git pull

# Envoyer vos commits au dépôt distant
git push

# Envoyer une nouvelle branche au dépôt distant
git push -u origin feature/prestation
```

### Annuler des modifications

```bash
# Annuler les modifications d'un fichier (avant commit)
git checkout -- backend/src/controllers/facture.controller.ts

# Annuler l'ajout au staging (sans perdre les modifications)
git reset backend/src/controllers/facture.controller.ts

# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1
```

> **Règle importante** : Une fois un commit envoyé (`push`), ne le modifiez pas. Préférez créer un nouveau commit de correction.

## Flux de travail typique

Voici le workflow que vous utiliserez le plus souvent :

```bash
# 1. Mettre à jour votre branche principale
git checkout main
git pull

# 2. Créer une branche pour votre fonctionnalité
git checkout -b feature/nom-de-la-fonctionnalite

# 3. Travailler, modifier des fichiers...

# 4. Ajouter les fichiers modifiés
git add .

# 5. Commiter avec un message clair
git commit -m "ajouter la fonctionnalité X"

# 6. Envoyer la branche au dépôt distant
git push -u origin feature/nom-de-la-fonctionnalite

# 7. Créer une Pull Request sur GitHub/GitLab
```

## Git dans le projet CHDev

### Fichiers ignorés (`.gitignore`)

Le fichier `.gitignore` indique à Git quels fichiers **ne pas** suivre :

```
node_modules/
dist/
*.log
.env
```

| Fichier ignoré | Pourquoi ? |
|----------------|------------|
| `node_modules/` | Régénéré par `npm install` — trop volumineux |
| `dist/` | Généré par le build — pas besoin de le versionner |
| `*.log` | Fichiers de log — temporaires |
| `.env` | Variables d'environnement — peuvent contenir des secrets |

> **Règle importante** : `package-lock.json` **n'est pas** ignoré. Il doit être commité pour garantir que tous les développeurs utilisent les mêmes versions de dépendances.

### Convention de nommage des branches

| Type de branche | Format | Exemple |
|-----------------|--------|---------|
| Fonctionnalité | `feature/<nom>` | `feature/gestion-prestations` |
| Correction | `fix/<description>` | `fix/calcul-total-ht` |
| Documentation | `docs/<sujet>` | `docs/ajouter-git` |

## Exercices pratiques

> 💡 **Conseil** : Ces exercices se font dans le terminal du projet CHDev. Si vous n'avez pas encore cloné le projet, commencez par `git clone`.

### Exercice 1 — Vérifier l'installation de Git

Ouvrez un terminal et tapez :

```bash
git --version
```

Vérifiez que la commande retourne un numéro de version (ex: `git version 2.43.0`).

<details>
<summary>🔽 Voir la solution</summary>

Si la commande fonctionne, Git est installé. Si vous obtenez une erreur, installez Git depuis [git-scm.com](https://git-scm.com/).

**Explications :**
- `git --version` est la commande la plus simple pour vérifier que Git est accessible depuis votre terminal.
- La version exacte n'a pas d'importance tant qu'elle est récente (2.x ou supérieur).

</details>

---

### Exercice 2 — Configurer votre identité Git

Configurez votre nom et email pour Git :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

Vérifiez la configuration :

```bash
git config --global --list
```

<details>
<summary>🔽 Voir la solution</summary>

```bash
# Configuration
git config --global user.name "Jean Dupont"
git config --global user.email "jean.dupont@example.com"

# Vérification
git config --global --list
# Devrait afficher :
# user.name=Jean Dupont
# user.email=jean.dupont@example.com
```

**Explications :**
- Cette configuration est utilisée pour signer chaque commit.
- L'email n'a pas besoin d'être lié à un compte, mais c'est recommandé si vous utilisez GitHub/GitLab.
- L'option `--global` écrit dans `~/.gitconfig` (votre configuration personnelle).

</details>

---

### Exercice 3 — Explorer l'état du projet

Dans le dossier du projet CHDev, tapez :

```bash
git status
git log --oneline
```

<details>
<summary>🔽 Voir la solution</summary>

```bash
# Voir l'état actuel
git status
# Affiche les fichiers modifiés, nouveaux, ou supprimés

# Voir l'historique
git log --oneline
# Affiche les commits récents avec leur message
```

**Explications :**
- `git status` est la commande la plus utilisée — elle vous dit où vous en êtes.
- `git log --oneline` donne une vue rapide de l'historique sans surcharge.
- Dans le projet CHDev, vous devriez voir les commits liés à la mise en place du backend et du frontend.

</details>

---

### Exercice 4 — Créer une branche et faire un premier commit

Créez une branche de test, modifiez un fichier, et committez :

```bash
# Créer une branche de test
git checkout -b docs/test-git-doc

# Modifier un fichier (par exemple, ajouter un commentaire dans un fichier)
# ... (ouvrez un fichier et faites une petite modification)

# Ajouter et commiter
git add .
git commit -m "test: ajouter un commentaire de test"
```

Puis revenez sur la branche principale :

```bash
git checkout main
```

<details>
<summary>🔽 Voir la solution</summary>

```bash
# 1. Créer la branche
git checkout -b docs/test-git-doc

# 2. Modifier un fichier (exemple : ajouter un commentaire dans un fichier TypeScript)
# Ouvrez backend/src/index.ts et ajoutez en haut :
// Test de la documentation Git

# 3. Vérifier l'état
git status
# Devrait montrer le fichier modifié

# 4. Ajouter au staging
git add .

# 5. Commiter
git commit -m "test: ajouter un commentaire de test"

# 6. Revenir sur main
git checkout main

# 7. Vérifier que le commentaire n'apparaît plus (il est sur l'autre branche)
# Le fichier backend/src/index.ts ne montre plus la modification
```

**Explications :**
- `git checkout -b` crée la branche ET y bascule en une seule commande.
- La modification existe uniquement sur la branche `docs/test-git-doc`.
- Quand on revient sur `main`, le fichier est tel qu'il était avant la modification.
- C'est la puissance des branches : travailler sans affecter la version stable.

</details>

---

### Exercice 5 (bonus) — Nettoyer la branche de test

Supprimez la branche de test créée à l'exercice précédent :

```bash
git branch -d docs/test-git-doc
```

<details>
<summary>🔽 Voir la solution</summary>

```bash
# Supprimer la branche de test
git branch -d docs/test-git-doc

# Vérifier qu'elle n'existe plus
git branch
# Ne devrait plus lister docs/test-git-doc
```

**Explications :**
- `git branch -d` supprime une branche locale.
- L'option `-d` (delete) refuse de supprimer si la branche n'a pas été fusionnée.
- Pour forcer la suppression : `git branch -D` (majuscule).
- Dans un vrai projet, on ne supprime pas les branches avant qu'elles ne soient fusionnées via une Pull Request.

</details>

---

## Ressources pour aller plus loin

- [Documentation officielle Git](https://git-scm.com/doc)
- [Git - Le Petit Livre (gratuit)](https://progit.fr/)
- [Atlassian Git Tutorial](https://www.atlassian.com/fr/git/tutorials)
- [Oh Shit, Git!?! — Sortir des situations complexes](https://ohshitgit.com/fr)
