# `ref()` vs `reactive()` — Les deux façons de créer des données réactives

## Qu'est-ce que la réactivité ?

Avant d'aborder `ref` et `reactive`, il faut comprendre **ce qu'elles ont en commun** : les deux créent des **données réactives** dans Vue 3.

> **Analogie WinDev** : La réactivité, c'est comme quand vous modifiez la valeur d'un champ texte — tous les endroits qui affichent cette valeur se mettent à jour automatiquement, sans que vous ayez à le demander. En WinDev, c'est le moteur visuel qui gère ça. En Vue, c'est le framework qui le fait pour vous.

Quand une donnée est réactive :
1. Vue **suit** toutes les lectures de cette donnée
2. Quand la donnée **change**, Vue **met à jour** l'interface automatiquement
3. Vue **relance** les calculs (`computed`) et les effets (`watch`) qui dépendent de cette donnée

---

## `ref()` — Une valeur unique, toujours avec `.value`

`ref()` crée une donnée réactive qui contient **une seule valeur**. Cette valeur peut être un nombre, une chaîne, un booléen, un objet, un tableau, ou même `null`.

```typescript
import { ref } from 'vue';

const compteur = ref(0);           // Nombre
const nom = ref('Alice');          // Chaîne
const estConnecte = ref(false);    // Booléen
const utilisateur = ref(null);     // null (sera remplacé plus tard)
```

**Comment on y accède ?** En utilisant `.value` dans le code TypeScript :

```typescript
compteur.value++;                    // Incrémente
nom.value = 'Bob';                   // Modifie
console.log(nom.value);              // Lecture
```

**Dans le template**, c'est automatique — pas besoin de `.value` :

```html
<p>Compteur : {{ compteur }}</p>     <!-- OK, pas de .value ici -->
<button @click="compteur++">+</button>
```

> **Règle importante** : `.value` est obligatoire **uniquement dans le `<script>`**. Dans le `<template>`, Vue le fait pour vous.

---

## `reactive()` — Un objet avec plusieurs propriétés

`reactive()` crée un **objet réactif** dont **toutes les propriétés** sont automatiquement réactives :

```typescript
import { reactive } from 'vue';

const utilisateur = reactive({
  nom: 'Alice',
  prenom: 'Dupont',
  age: 30,
});
```

**Comment on y accède ?** Comme un objet normal, **sans `.value`** :

```typescript
utilisateur.nom = 'Bob';             // Modification
console.log(utilisateur.prenom);     // Lecture
```

**Dans le template**, pareil — accès direct :

```html
<p>{{ utilisateur.nom }}</p>
<p>{{ utilisateur.age }}</p>
```

---

## Pourquoi il y a deux façons ?

C'est la question que tout le monde se pose. La réponse tient en une phrase :

> **`reactive()` ne fonctionne pas avec les primitives** (nombre, chaîne, booléen). `ref()` fonctionne avec **tout**.

Si vous voulez un compteur ou un booléen, `reactive()` est impossible :

```typescript
// ❌ Ça ne marche pas — reactive attend un objet
const compteur = reactive(0);

// ✅ Ça marche — ref accepte n'importe quoi
const compteur = ref(0);
```

Mais pour les objets, les deux approches fonctionnent (presque). C'est là que ça devient intéressant.

---

## Comparaison côte à côte

| Aspect | `ref()` | `reactive()` |
|--------|---------|--------------|
| **Type de valeur** | Tout (primitif + objet) | Uniquement objet / tableau |
| **Accès en TS** | `.value` | Direct, sans `.value` |
| **Accès dans le template** | Sans `.value` | Sans `.value` |
| **Réassigner l'objet entier** | Oui (`ref.value = {...}`) | Non — perte de réactivité |
| **Ajouter des propriétés après** | Oui (sur l'objet contenu) | Oui (mais pas en destructuration) |
| **Utilisation recommandée** | Par défaut dans tous les cas | Objets complexes, uniquement quand c'est justifié |

---

## Le piège de la réassignment avec `reactive()`

Avec `reactive()`, si vous **réassignez** l'objet entier, vous perdez la réactivité :

```typescript
const utilisateur = reactive({ nom: 'Alice', age: 30 });

// ✅ Ajout de propriété — réactif
utilisateur.age = 31;

// ❌ Réassignment — PERD la réactivité !
utilisateur = { nom: 'Bob', age: 31 };  // Erreur ou bug silencieux
```

Avec `ref()`, c'est plus sûr :

```typescript
const utilisateur = ref({ nom: 'Alice', age: 30 });

// ✅ Réassignment — la réactivité est préservée
utilisateur.value = { nom: 'Bob', age: 31 };
```

> **Analogie WinDev** : Avec `reactive()`, c'est comme si vous pouviez modifier les champs d'un enregistrement, mais pas remplacer l'enregistrement entier sans briser le lien avec l'interface. Avec `ref()`, vous pouvez remplacer l'enregistrement complet — le lien reste intact.

---

## Le piège de la destructuration avec `reactive()`

C'est l'erreur la plus courante avec `reactive()`. Quand on **déstructure** un objet `reactive`, on extrait les **valeurs** — pas la réactivité :

```typescript
const utilisateur = reactive({ nom: 'Alice', age: 30 });

const { nom, age } = utilisateur;  // nom et age sont des VARIABLES SIMPLES

age++;                               // ❌ Pas réactif ! L'interface ne se met pas à jour
console.log(age);                    // 31 — mais l'interface affiche encore 30
```

Pour garder la réactivité, il faut accéder aux propriétés **directement sur l'objet** :

```typescript
const utilisateur = reactive({ nom: 'Alice', age: 30 });

utilisateur.age++;                   // ✅ Réactif
console.log(utilisateur.age);        // 31 — l'interface se met à jour
```

Avec `ref()`, la destructuration fonctionne parfaitement :

```typescript
const utilisateur = ref({ nom: 'Alice', age: 30 });

const { nom, age } = utilisateur.value;  // Ce sont des copies — pas réactif, mais c'est normal
// Pour la réactivité, on utilise le ref entier :
utilisateur.value.age++;                   // ✅ Réactif
```

> **Analogie WinDev** : Quand vous déstructurez un objet `reactive`, c'est comme si vous copiez les valeurs dans des variables temporaires — elles ne sont plus liées à l'enregistrement d'origine. Pour les modifier et voir le changement reflété, il faut passer par l'objet original.

---

## Quand utiliser quoi ?

### Utilisez `ref()` dans tous ces cas

| Cas | Exemple |
|-----|---------|
| **Primitif** (nombre, chaîne, booléen) | `ref(0)`, `ref('')`, `ref(false)` |
| **null / undefined** au départ | `ref(null)`, `ref(undefined)` |
| **Réassignment fréquente** | `ref([])` pour un tableau qui change |
| **Vous n'êtes pas sûr** | `ref()` fonctionne toujours |

```typescript
const compteur = ref(0);
const email = ref('');
const chargement = ref(false);
const erreur = ref<string | null>(null);
const items = ref<Item[]>([]);
```

### Utilisez `reactive()` dans ce cas unique

| Cas | Exemple |
|-----|---------|
| **Objet complexe avec beaucoup de propriétés** qui sont **toujours** modifiées individuellement | `reactive({ ... })` |

```typescript
const formulaire = reactive({
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  adresse: '',
  ville: '',
  codePostal: '',
  message: '',
});
```

> 💡 **Conseil pratique** : Dans le projet CHDev, **on utilise uniquement `ref()`**. C'est plus simple, plus cohérent, et on évite les pièges de la destructuration.

---

## `reactive()` dans le projet CHDev

Dans CHDev, on utilise `ref()` dans tous les cas. Voici des exemples concrets :

**Fichier** : `frontend/src/views/LoginView.vue`

```typescript
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
```

**Fichier** : `frontend/src/views/InvoicesView.vue`

```typescript
const invoices = ref<Array<Invoice>>([]);
const pagination = ref({
  search: '',
  page: 1,
  itemsPerPage: 10,
});
```

**Fichier** : `frontend/src/composables/useLoading.ts`

```typescript
const isLoading = ref(false);
```

On utilise `ref()` même pour les objets, car :
1. C'est plus facile de réassigner l'objet entier (`pagination.value = {...}`)
2. Pas de piège avec la destructuration
3. C'est cohérent partout dans le projet

---

## `shallowRef()` — Le cousin léger

Vue propose aussi `shallowRef()` : une version optimisée qui **ne rend pas profond** l'objet contenu.

```typescript
import { shallowRef } from 'vue';

const utilisateur = shallowRef({ nom: 'Alice', age: 30 });
utilisateur.value = { nom: 'Bob', age: 31 };  // ✅ Notifié — réassignment
utilisateur.value.nom = 'Charlie';             // ❌ PAS notifié — modification interne
```

`shallowRef()` est utile pour les **grands objets ou tableaux** qu'on ne modifie pas souvent à l'intérieur, mais qu'on remplace entièrement.

> **Note** : Dans le projet CHDev, on n'utilise pas `shallowRef`. On utilise uniquement `ref()` pour rester cohérent.

---

## Exercices pratiques

> 💡 **Conseil** : Créez un nouveau composant `RefReactiveTest.vue` dans `frontend/src/components/` et testez les exemples ci-dessous.

### Exercice 1 — ref avec un primitif

Créez un compteur avec `ref()` qui s'incrémente quand on clique sur un bouton. Affichez la valeur dans le template.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref } from 'vue';

const compteur = ref(0);

function incrementer() {
  compteur.value++;
}
</script>

<template>
  <div>
    <p>Compteur : {{ compteur }}</p>
    <button @click="incrementer">+1</button>
  </div>
</template>
```

**Explications :**
- `ref(0)` crée un compteur initialisé à 0
- `.value` est obligatoire dans le `<script>` pour lire et modifier
- Dans le `<template>`, `{{ compteur }}` fonctionne directement

</details>

---

### Exercice 2 — reactive avec un objet

Créez un objet `utilisateur` avec `reactive()` contenant `nom` et `age`. Ajoutez un bouton qui incrémente l'âge.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { reactive } from 'vue';

const utilisateur = reactive({
  nom: 'Alice',
  age: 30,
});

function vieillir() {
  utilisateur.age++;  // Pas de .value ici !
}
</script>

<template>
  <div>
    <p>{{ utilisateur.nom }}, {{ utilisateur.age }} ans</p>
    <button @click="vieillir">Joyeux anniversaire !</button>
  </div>
</template>
```

**Explications :**
- `reactive()` crée un objet dont toutes les propriétés sont réactives
- On accède aux propriétés directement, sans `.value`
- `utilisateur.age++` est équivalent à `utilisateur.age = utilisateur.age + 1`

</details>

---

### Exercice 3 — Le piège de la destructuration

**Qu'affiche ce code ?**

```vue
<script setup lang="ts">
import { reactive } from 'vue';

const utilisateur = reactive({ age: 30 });
const { age } = utilisateur;

function vieillir() {
  age++;  // Modifie-t-il l'interface ?
}
</script>

<template>
  <p>Âge : {{ age }}</p>
  <button @click="vieillir">Vieillir</button>
</template>
```

<details>
<summary>🔽 Voir la solution</summary>

**La réponse : l'interface NE SE MET PAS À JOUR.**

`age` est une variable locale copiée depuis `utilisateur.age`. L'incrémentation modifie cette copie, pas l'objet `reactive` d'origine.

**Correction :**

```typescript
function vieillir() {
  utilisateur.age++;  // ✅ Modifie l'objet réactif
}
```

**Explications :**
- La destructuration crée une **copie** des valeurs — pas de lien avec l'objet original
- Pour garder la réactivité, il faut toujours passer par l'objet `reactive`
- C'est le piège le plus courant avec `reactive()`

</details>

---

### Exercice 4 — ref vs reactive pour un formulaire

Créez un formulaire avec 3 champs (nom, prénom, email) en utilisant **uniquement `ref()`**. Ensuite, refaites-le avec **uniquement `reactive()`**. Comparez les deux approches.

<details>
<summary>🔽 Voir la solution avec ref()</summary>

```vue
<script setup lang="ts">
import { ref } from 'vue';

const nom = ref('');
const prenom = ref('');
const email = ref('');

function soumettre() {
  console.log(nom.value, prenom.value, email.value);
}
</script>

<template>
  <div>
    <input v-model="nom" placeholder="Nom" />
    <input v-model="prenom" placeholder="Prénom" />
    <input v-model="email" placeholder="Email" />
    <button @click="soumettre">Soumettre</button>
  </div>
</template>
```

</details>

<details>
<summary>🔽 Voir la solution avec reactive()</summary>

```vue
<script setup lang="ts">
import { reactive } from 'vue';

const formulaire = reactive({
  nom: '',
  prenom: '',
  email: '',
});

function soumettre() {
  console.log(formulaire.nom, formulaire.prenom, formulaire.email);
}
</script>

<template>
  <div>
    <input v-model="formulaire.nom" placeholder="Nom" />
    <input v-model="formulaire.prenom" placeholder="Prénom" />
    <input v-model="formulaire.email" placeholder="Email" />
    <button @click="soumettre">Soumettre</button>
  </div>
</template>
```

</details>

**Explications :**
- Avec `ref()`, on a 3 variables séparées, chacune avec `.value`
- Avec `reactive()`, on a un seul objet regroupé, accès direct
- `v-model` fonctionne dans les deux cas (Vue gère `.value` ou accès direct automatiquement)
- Dans CHDev, on choisit `ref()` pour la cohérence

---

### Exercice 5 (bonus) — Quand `ref()` vaut mieux que `reactive()`

Simulez une réponse API : commencez avec un objet `ref(null)`, puis après un délai de 2 secondes, affectez un objet complet. Comparez avec `reactive()`.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref } from 'vue';

const utilisateur = ref<{ nom: string; age: number } | null>(null);

function chargerDonnees() {
  setTimeout(() => {
    // Avec ref() — la réactivité est préservée
    utilisateur.value = { nom: 'Alice', age: 30 };
  }, 2000);
}
</script>

<template>
  <div>
    <button @click="chargerDonnees" v-if="!utilisateur">Charger</button>
    <p v-else>Utilisateur : {{ utilisateur!.nom }}, {{ utilisateur!.age }} ans</p>
  </div>
</template>
```

**Explications :**
- `ref(null)` permet de commencer avec `null` (typage explicite)
- `utilisateur.value = {...}` réassigne tout l'objet — la réactivité est préservée
- Avec `reactive()`, on ne pourrait pas commencer à `null`
- C'est le pattern standard pour les réponses API dans CHDev

</details>

---

## Ressources pour aller plus loin

- [Vue 3 — Réactivité de base](https://fr.vuejs.org/guide/essentials/reactivity-fundamentals)
- [Vue 3 — Pourquoi `ref` et pas `reactive` pour tout ?](https://fr.vuejs.org/guide/essentials/reactivity-fundamentals#pourquoi-ref-et-pas-reactive-pour-tout)
- [Vue 3 — `shallowRef` vs `ref`](https://fr.vuejs.org/api/reactivity-core.html#shallowref)
- [Composition API FAQ — Quand utiliser `ref` vs `reactive`](https://fr.vuejs.org/guide/extras/composition-api-faq.html#why-do-we-need-both-ref-and-reactive)
