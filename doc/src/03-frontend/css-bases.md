# CSS — Les bases du style

## Qu'est-ce que le CSS ?

**CSS** (Cascading Style Sheets) est le langage qui contrôle **l'apparence visuelle** d'une page web : couleurs, tailles, espacements, dispositions, polices, etc.

> **Analogie WinDev** : Le CSS ≈ les propriétés de présentation des contrôles WinDev (couleur de fond, police, taille, position). Mais au lieu de cliquer dans un éditeur visuel, on écrit du texte.

### HTML vs CSS

| HTML | CSS |
|------|-----|
| Définit la **structure** (titres, paragraphes, boutons) | Définit **l'apparence** (couleurs, tailles, disposition) |
| `"<h1>Titre</h1>"` | `"h1 { color: blue; }"` |

### Le CSS dans les composants Vue

Dans ce projet, le CSS est écrit dans les fichiers `.vue` via la balise `<style scoped>` :

```vue
<style scoped>
.container {
  display: flex;
  gap: 16px;
}
</style>
```

L'attribut `scoped` isole le CSS au composant courant — il ne fuit pas vers les autres composants.

> **Note** : Ce projet utilise **Vuetify** pour la plupart des composants UI, donc vous utiliserez rarement du CSS pur. Mais comprendre les bases est essentiel pour les mises en page personnalisées.

## Les sélecteurs

Un **sélecteur** cible les éléments HTML à styliser :

```css
/* Sélecteur d'élément — tous les <p> */
p {
  color: gray;
}

/* Sélecteur de classe — les éléments avec class="titre" */
.titre {
  font-size: 24px;
}

/* Sélecteur d'ID — l'élément avec id="header" */
#header {
  background: blue;
}
```

| Sélecteur | Syntaxe | Usage |
|-----------|---------|-------|
| Élément | `div`, `p`, `h1` | Tous les éléments de ce type |
| Classe | `.nom` | Élément avec `class="nom"` — **le plus utilisé** |
| ID | `#nom` | Élément avec `id="nom"` — unique dans la page |

## Les unités de mesure

| Unité | Signification | Usage |
|-------|---------------|-------|
| `px` | Pixels — taille fixe | Bordures, espacements précis |
| `%` | Pourcentage du parent | Largeurs relatives |
| `rem` | Taille de police racine (généralement 16px) | Tailles de police, espacements |
| `vh` / `vw` | % de la hauteur / largeur de l'écran | Tailles plein écran |
| `auto` | Calculé automatiquement | Centrage, flexbox |

## Les propriétés essentielles

### Taille et espacement

```css
.box {
  width: 300px;        /* Largeur */
  height: 200px;       /* Hauteur */
  max-width: 100%;     /* Largeur maximale */
  padding: 16px;       /* Espace intérieur (haut, droite, bas, gauche) */
  margin: 24px;        /* Espace extérieur */
  margin-top: 12px;    /* Espace extérieur — haut seulement */
}
```

### Le modèle de boîte (Box Model)

Chaque élément HTML est une **boîte** composée de 4 couches :

```
┌─────────────────────────────────┐  ← border
│  ┌───────────────────────────┐  │
│  │  ┌─────────────────────┐  │  │  ← padding
│  │  │                     │  │  │
│  │  │      contenu        │  │  │
│  │  │                     │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘  ← margin
```

```css
.box {
  width: 200px;
  padding: 20px;    /* +40px de largeur totale (20px × 2) */
  border: 2px solid black;  /* +4px de largeur totale */
  margin: 10px;     /* Espace extérieur */
}
/* Largeur totale = 200 + 40 + 4 + 20 = 264px */
```

> **Règle importante** : Par défaut, `padding` et `border` s'ajoutent à la `width`. Avec `box-sizing: border-box` (activé par défaut dans ce projet), `width` inclut tout — ce qui est plus intuitif.

### Arrière-plan et bordures

```css
.box {
  background-color: #f5f5f5;
  border-radius: 8px;        /* Coins arrondis */
  border: 1px solid #ddd;    /* Bordure : épaisseur style couleur */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  /* Ombre */
}
```

---

## Flexbox — Disposition flexible

**Flexbox** est un système de disposition en **une dimension** (ligne OU colonne). C'est l'outil le plus utilisé pour aligner et distribuer des éléments.

> **Analogie WinDev** : Flexbox ≈ un conteneur avec des contrôles qui s'alignent automatiquement, comme un groupe de boutons qui se répartissent sur une ligne.

### Activer Flexbox

```css
.container {
  display: flex;
}
```

Cela transforme les enfants directs en **éléments flex** :

```html
<div class="container">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
<!-- Items alignés horizontalement par défaut -->
```

### Direction

```css
.container {
  display: flex;
  flex-direction: row;       /* Horizontal (défaut) : ← → */
  flex-direction: column;    /* Vertical : ↑ ↓ */
}
```

### Alignement

```css
.container {
  display: flex;

  /* Alignement sur l'axe principal (horizontal par défaut) */
  justify-content: flex-start;  /* Gauche (défaut) */
  justify-content: center;      /* Centré */
  justify-content: flex-end;    /* Droite */
  justify-content: space-between; /* Espacé — premier à gauche, dernier à droite */
  justify-content: space-around;  /* Espacé — marges égales autour de chaque item */
  justify-content: space-evenly;  /* Espacé — espaces parfaitement égaux */

  /* Alignement sur l'axe croisé (vertical par défaut) */
  align-items: stretch;     /* Étirer pour remplir la hauteur (défaut) */
  align-items: flex-start;  /* Haut */
  align-items: center;      /* Centré verticalement */
  align-items: flex-end;    /* Bas */
}
```

### Gap — Espacement entre les items

```css
.container {
  display: flex;
  gap: 16px;        /* Espace entre chaque item */
  gap: 8px 16px;    /* 8px vertical, 16px horizontal */
}
```

### Wrap — Passage à la ligne

```css
.container {
  display: flex;
  flex-wrap: wrap;  /* Les items passent à la ligne s'il n'y a pas assez de place */
}
```

Sans `flex-wrap`, les items sont compressés pour tenir sur une seule ligne.

### Propriétés sur les enfants (items flex)

```css
.item {
  flex: 1;           /* Prend l'espace disponible équitablement */
  flex: 2;           /* Prend 2× plus d'espace que flex: 1 */
  flex-shrink: 0;    /* Ne se rétrécit pas */
  flex-grow: 1;      /* Grandit pour remplir l'espace restant */
  flex-basis: 200px; /* Taille de départ avant distribution */
  align-self: center; /* Surcharge align-items pour cet item seul */
}
```

### Les combinaisons les plus utiles

#### Centrer parfaitement (horizontalement + verticalement)

```css
.center-all {
  display: flex;
  justify-content: center;  /* Centre horizontal */
  align-items: center;      /* Centre vertical */
  height: 100vh;            /* Pleine hauteur d'écran */
}
```

#### Barre de navigation

```css
.navbar {
  display: flex;
  justify-content: space-between;  /* Logo à gauche, liens à droite */
  align-items: center;
  padding: 0 24px;
}
```

#### Liste d'items avec espacement

```css
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card-list .card {
  flex: 1 1 300px;  /* Croît, rétrécit, base 300px */
}
```

---

## Grid — Disposition en grille

**CSS Grid** est un système de disposition en **deux dimensions** (lignes ET colonnes simultanément). Il est idéal pour les mises en page complexes.

> **Analogie WinDev** : Grid ≈ un tableau de zones où vous placez vos contrôles en précisant la ligne et la colonne.

### Activer Grid

```css
.container {
  display: grid;
}
```

### Définir les colonnes et lignes

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;    /* 3 colonnes : fixe + 2 égales */
  grid-template-rows: auto 1fr auto;        /* 3 lignes */
  gap: 16px;                                /* Espacement entre cellules */
}
```

| Valeur | Signification |
|--------|---------------|
| `200px` | Largeur fixe de 200px |
| `1fr` | 1 fraction de l'espace disponible |
| `auto` | Taille automatique selon le contenu |
| `minmax(100px, 1fr)` | Entre 100px et 1 fraction |
| `repeat(3, 1fr)` | Répéter 3 fois (raccourci) |

### La fonction `fr`

L'unité `fr` (fraction) répartit l'espace disponible proportionnellement :

```css
/* 3 colonnes égales */
grid-template-columns: 1fr 1fr 1fr;

/* Colonne centrale 2× plus large */
grid-template-columns: 1fr 2fr 1fr;

/* Sidebar fixe + contenu flexible */
grid-template-columns: 250px 1fr;
```

### Placement des éléments

#### Par ordre naturel

Les éléments se placent automatiquement de gauche à droite, de haut en bas :

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
<!-- 6 enfants = 2 lignes de 3 colonnes automatiquement -->
```

#### Placement explicite

```css
.item {
  grid-column: 1 / 3;    /* De la colonne 1 à la colonne 3 (span 2) */
  grid-row: 1 / 2;       /* De la ligne 1 à la ligne 2 */
  grid-column: span 2;   /* Couvre 2 colonnes à partir de la position automatique */
}
```

### Les layouts les plus courants

#### Layout classique (sidebar + contenu)

```css
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

#### Grille de cartes responsive

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
```

`auto-fill` + `minmax(280px, 1fr)` = les cartes font au moins 280px et se répartissent automatiquement selon la largeur de l'écran. **Pas de media queries nécessaires.**

#### Formulaire en grille

```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-grid .full-width {
  grid-column: 1 / -1;  /* Toute la largeur */
}
```

### Grid vs Flexbox — Quand utiliser quoi ?

| Situation | Outil |
|-----------|-------|
| Aligner des éléments sur une ligne | **Flexbox** |
| Centrer du contenu | **Flexbox** |
| Barre de navigation | **Flexbox** |
| Disposition globale de la page | **Grid** |
| Grille de cartes | **Grid** |
| Formulaire en colonnes | **Grid** |
| Sidebar + contenu principal | **Grid** |
| Les deux dimensions en même temps | **Grid** |

> **Règle pratique** : Flexbox pour les composants (une dimension), Grid pour les layouts (deux dimensions). On les combine souvent : Grid pour la page, Flexbox à l'intérieur des cellules.

## Exercices pratiques

> 💡 **Conseil** : Créez un fichier HTML simple pour tester vos styles, ou utilisez les [DevTools du navigateur](https://developer.chrome.com/docs/devtools) pour expérimenter en direct.

### Exercice 1 — Centrer un élément avec Flexbox

Créez un conteneur qui centre son contenu horizontalement et verticalement.

<details>
<summary>🔽 Voir la solution</summary>

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

**Explications :**
- `display: flex` active Flexbox
- `justify-content: center` centre sur l'axe principal (horizontal)
- `align-items: center` centre sur l'axe croisé (vertical)
- `height: 100vh` donne au conteneur la hauteur totale de l'écran

</details>

---

### Exercice 2 — Barre de navigation avec Flexbox

Créez une barre de navigation avec un logo à gauche et des liens à droite, alignés verticalement au centre.

<details>
<summary>🔽 Voir la solution</summary>

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #1a1a2e;
  color: white;
}

.nav-links {
  display: flex;
  gap: 24px;
  list-style: none;
  margin: 0;
}
```

```html
<nav class="navbar">
  <div class="logo">MonApp</div>
  <ul class="nav-links">
    <li>Accueil</li>
    <li>Factures</li>
    <li>Prestations</li>
  </ul>
</nav>
```

**Explications :**
- `justify-content: space-between` pousse le logo à gauche et les liens à droite
- `align-items: center` aligne tout verticalement au centre
- `gap: 24px` espace les liens entre eux
- Le `nav` utilise Flexbox, et `ul.nav-links` utilise aussi Flexbox pour ses enfants

</details>

---

### Exercice 3 — Grille de cartes responsive

Créez une grille de cartes qui s'adapte automatiquement à la largeur de l'écran (minimum 280px par carte).

<details>
<summary>🔽 Voir la solution</summary>

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
```

**Explications :**
- `repeat(auto-fill, minmax(280px, 1fr))` est la formule magique :
  - `minmax(280px, 1fr)` : chaque colonne fait entre 280px et 1 fraction
  - `auto-fill` : Grid crée autant de colonnes que possible
- Sur grand écran : 3-4 colonnes. Sur mobile : 1 colonne. **Sans media query.**
- `gap: 16px` espace les cartes uniformément

</details>

---

### Exercice 4 — Layout page avec Grid

Créez un layout avec un header, une sidebar, un contenu principal et un footer en utilisant `grid-template-areas`.

<details>
<summary>🔽 Voir la solution</summary>

```css
.page {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header  header"
    "sidebar main"
    "footer  footer";
  height: 100vh;
}

.header  { grid-area: header;  background: #1a1a2e; color: white; }
.sidebar { grid-area: sidebar; background: #f5f5f5; }
.main    { grid-area: main;    padding: 24px; }
.footer  { grid-area: footer;  background: #eee; }
```

```html
<div class="page">
  <header class="header">Header</header>
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Contenu principal</main>
  <footer class="footer">Footer</footer>
</div>
```

**Explications :**
- `grid-template-areas` définit un plan visuel de la page
- `"header header"` = le header occupe les 2 colonnes
- `"sidebar main"` = sidebar à gauche, contenu à droite
- `1fr` sur `grid-template-rows` = le contenu prend tout l'espace restant
- `height: 100vh` = la page occupe toute la hauteur de l'écran

</details>

---

### Exercice 5 — Combinaison Flexbox + Grid

Créez une grille de 2 colonnes où chaque cellule contient des éléments centrés avec Flexbox.

<details>
<summary>🔽 Voir la solution</summary>

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
```

```html
<div class="grid">
  <div class="cell">Cellule 1</div>
  <div class="cell">Cellule 2</div>
  <div class="cell">Cellule 3</div>
  <div class="cell">Cellule 4</div>
</div>
```

**Explications :**
- **Grid** gère la disposition globale (2 colonnes)
- **Flexbox** gère l'alignement à l'intérieur de chaque cellule
- C'est le pattern le plus courant : Grid pour le layout, Flexbox pour le contenu

</details>

---

### Exercice 6 (bonus) — Formulaire responsive en grille

Créez un formulaire en 2 colonnes où certains champs prennent toute la largeur.

<details>
<summary>🔽 Voir la solution</summary>

```css
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-grid .full-width {
  grid-column: 1 / -1;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}
```

```html
<form class="form-grid">
  <label>Nom <input type="text" /></label>
  <label>Prénom <input type="text" /></label>
  <label class="full-width">Adresse <input type="text" /></label>
  <label>Code postal <input type="text" /></label>
  <label>Ville <input type="text" /></label>
</form>
```

**Explications :**
- `grid-template-columns: 1fr 1fr` = 2 colonnes égales
- `grid-column: 1 / -1` = le champ occupe de la colonne 1 à la dernière colonne
- Chaque `label` utilise Flexbox en colonne pour empiler le texte et l'input
- Mélange parfait de Grid (layout du formulaire) et Flexbox (layout des champs)

</details>

---

## Ressources pour aller plus loin

- [CSS-Tricks — A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [CSS-Tricks — A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Froggy — Jeu pour apprendre Flexbox](https://flexboxfroggy.com/)
- [Grid Garden — Jeu pour apprendre Grid](https://cssgridgarden.com/)
- [MDN — CSS Layout](https://developer.mozilla.org/fr/docs/Web/CSS/CSS_layout)
