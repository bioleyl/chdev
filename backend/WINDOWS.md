# Guide de développement sous Windows

Ce guide couvre tout ce que vous devez savoir pour développer le backend ChDev sous Windows.

## Prérequis

### 1. Node.js et npm

- Installez la dernière version LTS depuis [nodejs.org](https://nodejs.org/) ou via [nvm-windows](https://github.com/coreybutler/nvm-windows).
- Vérifiez l'installation:

```powershell
node -v   # Doit être v24 lts
npm -v    # Doit être 10+
```

## Mise en route

### 1. Installer les dépendances

Depuis la racine du projet :

```powershell
cd chdev
npm install
```

Cette commande compilera automatiquement `sqlite3` pour votre plateforme.

### 2. Configurer l'environnement

```powershell
cd backend
copy .env.example .env
```

Modifiez le fichier `.env` si nécessaire (les valeurs par défaut conviennent pour le développement).

### 3. Compiler le package commun

```powershell
npm run build -w common
```

### 4. Exécuter les migrations et charger les données d'exemple

```powershell
npm run db:migrate
npm run db:seed
```

### 5. Démarrer le serveur de développement

Depuis la racine du projet :

```powershell
npm run dev:api
```

Ou depuis le répertoire backend :

```powershell
npm run dev
```

L'API sera accessible à l'adresse `http://localhost:3000`.

## Remarques sur les chemins et la résolution des fichiers

### Chemin de la base de données (`DB_PATH`)

Si vous définissez un `DB_PATH` personnalisé, utilisez des **barres obliques** (/) ou des **barres obliques inverses échappées** (\\) :

```shell
DB_PATH=C:/Users/You/chdev/backend/data/chdev.db
# ou
DB_PATH=C:\\Users\\You\\chdev\\backend\\data\\chdev.db
```

Le code utilise `path.resolve()` en interne ; les deux formats sont donc pris en charge.

### Emplacement par défaut de la base de données

Par défaut, la base de données est créée dans `backend/data/chdev.db`, relatif à la racine du projet. Le chemin est résolu depuis cette racine à l'aide de `path.resolve()`, ce qui génère automatiquement le chemin correct sous Windows.

## Comportements spécifiques à Windows

### Séparateur dans les numéros de facture

Les numéros de facture utilisent `-` comme séparateur (par exemple `INV-2026-0001`) afin d'éviter les conflits avec les restrictions sur les noms de fichiers sous Windows. Le caractère `/` n'est **pas** utilisé.

### Téléchargement des PDF

Lors du téléchargement d'une facture au format PDF, le nom du fichier est nettoyé afin de supprimer les caractères non valides sous Windows (`< > : " / \ | ? *`).

### Fins de ligne

Le projet utilise systématiquement les fins de ligne LF (`\n`) (imposées via `.editorconfig`). Sous Windows, configurez Git comme suit :

```powershell
git config --global core.autocrlf input
```

Cela empêche Git de convertir les fins de ligne LF en CRLF lors des validations (commits).

### Sensibilité à la casse

Les systèmes de fichiers Windows ne sont généralement pas sensibles à la casse. Les imports des entités TypeORM utilisent l'extension `.js` (par exemple `./user.entity.js`). Cela fonctionne correctement sous Windows, mais assurez-vous que la casse utilisée dans vos imports correspond bien à celle des noms de fichiers.

## Dépannage

### Erreurs liées au chemin de la base de données

Si vous obtenez une erreur du type « unable to open database file » :

1. Vérifiez que le répertoire `backend/data/` existe :

```powershell
mkdir -Force backend\data
```

2. Vérifiez que `DB_PATH` dans le fichier `.env` pointe vers un chemin valide et accessible en écriture.

### Erreurs de résolution des imports

Si vous voyez des erreurs telles que « Cannot find module » :

1. Assurez-vous que le package commun est compilé : `npm run build -w common`
2. Vérifiez que tous les imports `.ts` utilisent une extension `.js` (obligatoire avec ESM).

## Commandes utiles

| Commande | Description |
| --------- | ------------ |
| `npm run dev` | Démarre le serveur de développement avec rechargement à chaud (hot reload) |
| `npm run build` | Compile le code TypeScript dans le répertoire `dist/` |
| `npm run start` | Exécute la version de production |
| `npm run db:migrate` | Exécute les migrations de la base de données |
| `npm run db:seed` | Charge les données d'exemple |
