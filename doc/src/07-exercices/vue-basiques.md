# Exercices — Fondamentaux Vue

> 💡 **Conseil** : Testez chaque exercice en créant un fichier `.vue` dans le dossier `frontend/src/components/` de votre projet CHDev. Lancez `npm run dev:web` pour voir les résultats en direct.

---

## Exercice 1 — Template et expressions

Créez un composant `Salutation.vue` qui affiche un message personnalisé. Le message dépend de l'heure de la journée :
- Avant 12h → "Bonjour"
- Entre 12h et 18h → "Bon après-midi"
- Après 18h → "Bonsoir"

Affichez le message dans un `<p>` avec la classe `text-h5` de Vuetify.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { computed } from 'vue';

function getMomentJour() {
  const heure = new Date().getHours();
  if (heure < 12) return 'Bonjour';
  if (heure < 18) return 'Bon après-midi';
  return 'Bonsoir';
}
</script>

<template>
  <p class="text-h5">{{ getMomentJour() }} !</p>
</template>
```

**Explications :**
- Les **expressions dans les templates** peuvent appeler des fonctions JavaScript — voir [la syntaxe des templates](https://fr.vuejs.org/guide/essentials/template-syntax).
- Ici, on utilise une fonction simple retournant une chaîne selon l'heure
- Le template se met à jour automatiquement quand les données réactives changent

</details>

---

## Exercice 2 — v-if et v-else

Créez un composant `StatusAffichage.vue` avec une variable booléenne `estConnecte`. Affichez :
- "Connecté" en vert (classe `text-success`) si `estConnecte` est `true`
- "Déconnecté" en gris (classe `text-grey`) si `estConnecte` est `false`

Ajoutez un bouton pour basculer entre les deux états.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref } from 'vue';

const estConnecte = ref(false);

function basculer() {
  estConnecte.value = !estConnecte.value;
}
</script>

<template>
  <div>
    <p v-if="estConnecte" class="text-success text-h6">Connecté</p>
    <p v-else class="text-grey text-h6">Déconnecté</p>
    <v-btn @click="basculer">Basculer</v-btn>
  </div>
</template>
```

**Explications :**
- `v-if` affiche/masque un élément selon une condition booléenne
- `v-else` doit immédiatement suivre un `v-if`
- `ref(false)` crée une variable réactive initialement à `false`
- `estConnecte.value` est le `.value` obligatoire dans le `<script>` (pas besoin dans le `<template>`)

</details>

---

## Exercice 3 — v-for

Créez un composant `ListePrenoms.vue` avec un tableau de prénoms. Affichez chaque prénom dans une liste Vuetify (`v-list-item`), et affichez un message si la liste est vide.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref } from 'vue';

const prenoms = ref(['Alice', 'Bob', 'Charlie', 'David']);

function ajouterPrenom() {
  const prenom = prompt('Prénom à ajouter :');
  if (prenom) {
    prenoms.value.push(prenom);
  }
}
</script>

<template>
  <div>
    <v-list>
      <v-list-item v-for="(prenom, index) in prenoms" :key="index">
        <template #title>{{ prenom }}</template>
      </v-list-item>
    </v-list>

    <p v-if="prenoms.length === 0" class="text-grey">Aucun prénom dans la liste</p>
    <v-btn @click="ajouterPrenom">Ajouter un prénom</v-btn>
  </div>
</template>
```

**Explications :**
- `v-for="(prenom, index) in prenoms"` parcourt le tableau, `prenom` est la valeur et `index` l'index
- `:key` est obligatoire avec `v-for` — c'est un identifiant unique pour que Vue puisse suivre les éléments
- `prenoms.value.push()` modifie le tableau réactif — Vue détecte le changement et met à jour le template
- `v-if` vérifie la longueur du tableau pour afficher un message d'invitation

</details>

---

## Exercice 4 — v-on (gestion d'événements)

Créez un composant `Compteur.vue` avec un compteur initialisé à 0 et 4 boutons :
- **+1** — incrémente de 1
- **+10** — incrémente de 10
- **−1** — décrémente de 1
- **−10** — décrémente de 10

Affichez la valeur du compteur dans un `<v-chip>` de Vuetify.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref } from 'vue';

const compteur = ref(0);

function incrementer(n: number) {
  compteur.value += n;
}

function decrementer(n: number) {
  compteur.value -= n;
}
</script>

<template>
  <div class="d-flex flex-column ga-4 align-center">
    <v-chip size="x-large" color="primary">{{ compteur }}</v-chip>

    <div class="d-flex ga-2">
      <v-btn @click="incrementer(1)">+1</v-btn>
      <v-btn @click="incrementer(10)">+10</v-btn>
    </div>
    <div class="d-flex ga-2">
      <v-btn @click="decrementer(1)">−1</v-btn>
      <v-btn @click="decrementer(10)">−10</v-btn>
    </div>
  </div>
</template>
```

**Explications :**
- `v-on:click` (ou `@click`) attache un gestionnaire d'événement au clic
- On peut passer des arguments à la fonction (`incrementer(1)` ou `incrementer(10)`)
- `ga-2` (gap-2) et `d-flex` sont des classes utilitaires de Vuetify pour l'espacement et le flexbox
- `v-chip` est un composant Vuetify pour afficher du texte dans une pastille arrondie

</details>

---

## Exercice 5 — v-bind (liaison de propriétés)

Créez un composant `Jauge.vue` avec un slider (`v-range-slider`) et un cercle coloré (`v-chip` avec `rounded="circle"`). La couleur du cercle change selon la valeur du slider :
- 0-33 : rouge (`color="error"`)
- 34-66 : orange (`color="warning"`)
- 67-100 : vert (`color="success"`)

Le texte à l'intérieur du cercle affiche la valeur actuelle.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const valeur = ref(50);

const couleur = computed(() => {
  if (valeur.value <= 33) return 'error';
  if (valeur.value <= 66) return 'warning';
  return 'success';
});
</script>

<template>
  <div class="d-flex flex-column ga-4 align-center">
    <v-chip
      size="x-large"
      :rounded="'circle'"
      :color="couleur"
      class="text-h4"
    >
      {{ valeur }}
    </v-chip>

    <v-range-slider
      v-model="valeur"
      :min="0"
      :max="100"
      label="Niveau"
      class="mx-4"
    />
  </div>
</template>
```

**Explications :**
- `v-bind:color="couleur"` (ou `:color="couleur"`) lie la prop `color` à la valeur réactive `couleur`
- `computed` recalcule automatiquement la couleur à chaque changement de `valeur`
- `v-model` sur `v-range-slider` lie le slider à la variable réactive
- Les props Vuetify comme `:rounded` peuvent être liées dynamiquement

</details>

---

## Exercice 6 — Computed properties

Créez un composant `StatsUtilisateur.vue` avec les données suivantes :
- `notes` : un tableau de nombres `[12, 15, 9, 14, 18, 11]`

Calculez et affichez :
- La **moyenne** des notes (avec 1 décimale)
- La **note la plus haute**
- La **note la plus basse**
- Le **nombre de notes**
- Un statut : "Excellent" (moyenne ≥ 15), "Bien" (moyenne ≥ 12), "À améliorer" (moyenne < 12)

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const notes = ref([12, 15, 9, 14, 18, 11]);

const moyenne = computed(() => {
  const total = notes.value.reduce((sum, n) => sum + n, 0);
  return (total / notes.value.length).toFixed(1);
});

const noteMax = computed(() => Math.max(...notes.value));
const noteMin = computed(() => Math.min(...notes.value));
const nombreNotes = computed(() => notes.value.length);

const statut = computed(() => {
  const m = parseFloat(moyenne.value);
  if (m >= 15) return 'Excellent';
  if (m >= 12) return 'Bien';
  return 'À améliorer';
});
</script>

<template>
  <v-card>
    <v-card-title>Statistiques</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item><template #title>Moyenne</template><template #subtitle>{{ moyenne }}/20</template></v-list-item>
        <v-list-item><template #title>Note max</template><template #subtitle>{{ noteMax }}/20</template></v-list-item>
        <v-list-item><template #title>Note min</template><template #subtitle>{{ noteMin }}/20</template></v-list-item>
        <v-list-item><template #title>Nombre de notes</template><template #subtitle>{{ nombreNotes }}</template></v-list-item>
        <v-list-item>
          <template #title>Statut</template>
          <template #subtitle>
            <v-chip :color="statut === 'Excellent' ? 'success' : statut === 'Bien' ? 'primary' : 'warning'">
              {{ statut }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
```

**Explications :**
- `computed()` calcule une valeur dérivée et la **mémoïse** — elle n'est recalculée que si les données dépendantes changent
- `notes.value` est utilisé dans les computed car ils s'exécutent dans le `<script>`
- `.toFixed(1)` arrondit à 1 décimale pour l'affichage
- Les computed sont parfaits pour les dérivations de données — pas besoin de watcher

</details>

---

## Exercice 7 — Watchers

Créez un composant `Recherche.vue` avec :
- Un champ de texte (`v-text-field`) lié à `recherche` avec `v-model`
- Un texte qui affiche le **nombre de caractères** saisis en temps réel

Ensuite, ajoutez un compteur de **sauvegardes** : chaque fois que `recherche` change et que le champ contient au moins 3 caractères, incrémentez un compteur `sauvegardeCount`.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';

const recherche = ref('');
const sauvegardeCount = ref(0);

// Compteur de caractères — pas besoin de watcher, un computed suffit
const nombreCaracteres = computed(() => recherche.value.length);

// Compteur de sauvegardes automatiques
watch(recherche, (nouvelleValeur) => {
  if (nouvelleValeur.length >= 3) {
    sauvegardeCount.value++;
  }
}, { immediate: true }); // immediate: true → exécute aussi au montage
</script>

<template>
  <div>
    <v-text-field
      v-model="recherche"
      label="Rechercher..."
      prepend-inner-icon="mdi-magnify"
      clearable
    />
    <div class="d-flex ga-4 mt-4">
      <span>Caractères : {{ nombreCaracteres }}</span>
      <span>Sauvegardes auto : {{ sauvegardeCount }}</span>
    </div>
  </div>
</template>
```

**Explications :**
- `watch(source, callback)` écoute les changements d'une donnée réactive et exécute une fonction
- `{ immediate: true }` exécute le watcher immédiatement au montage du composant (utile pour l'initialisation)
- Pour un simple compteur de caractères, un `computed` suffit — pas besoin de watcher
- Le watcher est utile pour les effets de bord (sauvegarde auto, appels API, logs...)

</details>

---

## Exercice 8 — Cycle de vie

Créez un composant `ComposantCycle.vue` qui affiche un compteur et logue les différentes phases du cycle de vie dans le console :
- `onMounted` : affiche "Le composant est monté !"
- `onUnmounted` : affiche "Le composant va être détruit..."

Ajoutez un bouton pour détruire/remonter le composant en utilisant `v-if` (cela forcera le cycle complet).

<details>
<summary>🔽 Voir la solution</summary>

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const visible = ref(true);
const compteur = ref(0);

onMounted(() => {
  console.log('Le composant est monté !');
});

onUnmounted(() => {
  console.log('Le composant va être détruit...');
});

function basculer() {
  visible.value = !visible.value;
  if (visible.value) {
    compteur.value = 0;
  }
}
</script>

<template>
  <div>
    <v-btn @click="basculer">Basculer visibilité</v-btn>

    <div v-if="visible">
      <p class="text-h6 mt-4">Compteur : {{ compteur }}</p>
      <v-btn @click="compteur++" class="mt-2">Incrémenter</v-btn>
    </div>
  </div>
</template>
```

**Explications :**
- `onMounted()` s'exécute après que le composant a été inséré dans le DOM — idéal pour les appels API
- `onUnmounted()` s'exécute avant la destruction du composant — idéal pour nettoyer les listeners ou timers
- Utiliser `v-if` (au lieu de `v-show`) détruit/remonte le composant, ce qui déclenche le cycle de vie complet
- `v-show` ne détruit pas le composant — il change juste le CSS `display`

</details>

---

### Exercice 9 — Slots : contenu personnalisé

Créez un composant `Carte.vue` qui représente une carte générique avec :
- Un **slot par défaut** pour le contenu principal
- Un **slot nommé `#footer`** pour un pied de carte personnalisé

Ensuite, créez un composant `CarteExemple.vue` qui utilise `Carte.vue` pour afficher une carte avec un titre, du contenu, et un footer avec un bouton.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- Carte.vue — le composant réutilisable -->
<script setup lang="ts">
import { useSlots, computed } from 'vue';

const slots = useSlots();
const hasFooter = computed(() => !!slots.footer);
</script>

<template>
  <v-card class="mx-auto" max-width="400">
    <!-- Slot par défaut : contenu principal -->
    <slot />

    <!-- Footer optionnel : visible uniquement si le parent fournit #footer -->
    <v-card-actions v-if="hasFooter">
      <slot name="footer" />
    </v-card-actions>
  </v-card>
</template>
```

```vue
<!-- CarteExemple.vue — l'utilisation -->
<script setup lang="ts">
function supprimer() {
  console.log('Supprimer la carte !');
}
</script>

<template>
  <Carte>
    <v-card-title>Titre de la carte</v-card-title>
    <v-card-text>
      Ceci est le contenu principal de la carte.
      Il peut contenir n'importe quel contenu HTML ou composants Vue.
    </v-card-text>

    <template #footer>
      <v-spacer />
      <v-btn color="error" @click="supprimer">Supprimer</v-btn>
      <v-btn color="primary" @click="supprimer">Modifier</v-btn>
    </template>
  </Carte>
</template>
```

**Explications :**
- `useSlots()` permet de détecter si un slot nommé existe (`slots.footer !== undefined`)
- Le **slot par défaut** contient tout le texte entre les balises du composant
- Le **slot nommé `#footer`** est injecté à un endroit précis
- `v-if="hasFooter"` rend le footer optionnel : si le parent ne fournit pas `#footer`, il n'est pas affiché
- `v-spacer` pousse les boutons à droite — c'est un utilitaire Vuetify

</details>

---

### Exercice 10 — Slots avec contexte (scoped slots)

Créez un composant `ListeItem.vue` qui affiche une liste d'éléments et permet au parent de personnaliser l'affichage de chaque item via un **slot avec contexte**. Le slot passera l'item et son index au parent.

Ensuite, affichez une liste de prénoms en utilisant ce composant, avec un style différent pour chaque item (fond coloré selon l'index).

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- ListeItem.vue — le composant générique -->
<script setup lang="ts">
interface Props {
  items: string[];
}

const props = defineProps<Props>();

function getCouleur(index: number): string {
  const couleurs = ['bg-blue-lighten-4', 'bg-green-lighten-4', 'bg-orange-lighten-4', 'bg-purple-lighten-4'];
  return couleurs[index % couleurs.length];
}
</script>

<template>
  <v-list>
    <v-list-item
      v-for="(item, index) in props.items"
      :key="index"
    >
      <!-- Le slot reçoit l'item et l'index via v-bind -->
      <slot :item="item" :index="index" :couleur="couleur(index)" />
    </v-list-item>
  </v-list>
</template>
```

```vue
<!-- Parent -->
<script setup lang="ts">
import ListeItem from './ListeItem.vue';

const prenoms = ['Alice', 'Bob', 'Charlie', 'David', 'Emma'];
</script>

<template>
  <ListeItem :items="prenoms">
    <template #default="{ item, index, couleur }">
      <v-list-item-title :class="['text-subtitle-1', couleur]">
        {{ index + 1 }}. {{ item }}
      </v-list-item-title>
    </template>
  </ListeItem>
</template>
```

**Explications :**
- `slot :item="item" :index="index" :couleur="..."` passe des données du composant enfant au parent
- `#default="{ item, index, couleur }"` reçoit ces données et les déstructure
- Le parent a **contrôle total** sur l'affichage de chaque item
- C'est le pattern utilisé par `PaginatedTable` dans CHDev : chaque colonne est un slot qui reçoit les données de la ligne
- `useSlots()` dans l'enfant permet de détecter quels slots sont fournis par le parent

</details>

---

### Exercice 11 — Slot de repli (fallback) et composition

Créez un composant `BoiteDialogue.vue` qui affiche une boîte avec un titre, un contenu (via slot), et un bouton de confirmation. Le slot de contenu doit avoir un **contenu de repli** (texte par défaut si le parent ne fournit rien). Le bouton doit avoir un **slot nommé `#actions`** pour les actions personnalisées.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- BoiteDialogue.vue -->
<script setup lang="ts">
import { computed, useSlots } from 'vue';

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const slots = useSlots();
const hasActions = computed(() => !!slots.actions);
</script>

<template>
  <v-card class="mx-auto" max-width="500">
    <v-card-title class="text-h5">Boîte de dialogue</v-card-title>
    <v-card-text>
      <!-- Slot par défaut avec contenu de repli -->
      <slot>
        <p class="text-grey">Aucun contenu fourni. Insérez votre contenu ici.</p>
      </slot>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" @click="emit('cancel')">Annuler</v-btn>
      <v-spacer />
      <!-- Actions personnalisées ou bouton par défaut -->
      <template v-if="hasActions">
        <slot name="actions" />
      </template>
      <v-btn
        v-else
        color="primary"
        @click="emit('confirm')"
      >
        Confirmer
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
```

```vue
<!-- Utilisation sans actions personnalisées -->
<BoiteDialogue @confirm="onConfirm" @cancel="onCancel">
  <p>Êtes-vous sûr de vouloir continuer ?</p>
</BoiteDialogue>
```

```vue
<!-- Utilisation avec actions personnalisées -->
<BoiteDialogue @confirm="onConfirm" @cancel="onCancel">
  <p>Voulez-vous vraiment supprimer cet élément ?</p>
  <template #actions>
    <v-btn color="error">Oui, supprimer</v-btn>
    <v-btn color="primary">Non, annuler</v-btn>
  </template>
</BoiteDialogue>
```

**Explications :**
- `<slot>...contenu de repli...</slot>` : affiché si le parent ne fournit rien
- `hasActions` détecte si `#actions` existe via `useSlots()`
- `v-if="hasActions"` / `v-else` : bouton par défaut ou actions personnalisées
- Le slot de repli est parfait pour les composants qui ont un comportement raisonnable par défaut
- Ce pattern est exactement celui utilisé par `GenericForm`, `GenericDrawer` et `ConfirmDialog` dans CHDev

</details>

---

## Résumé des exercices

| Exercice | Concept |
|----------|---------|
| 1 | Templates et expressions |
| 2 | `v-if` / `v-else` — affichage conditionnel |
| 3 | `v-for` — boucler sur un tableau |
| 4 | `v-on` (`@`) — gestion d'événements |
| 5 | `v-bind` (`:`) — liaison de propriétés dynamiques |
| 6 | `computed` — valeurs dérivées mémoïsées |
| 7 | `watch` — effets de bord sur changement de donnée |
| 8 | Cycle de vie (`onMounted`, `onUnmounted`) |
| 9 | Slots : contenu personnalisé (slot par défaut + slot nommé) |
| 10 | Slots avec contexte (scoped slots) |
| 11 | Slot de repli (fallback) et composition |

---

## Ressources pour aller plus loin

- [Vue 3 — Template syntax](https://fr.vuejs.org/guide/essentials/template-syntax)
- [Vue 3 — Conditional rendering](https://fr.vuejs.org/guide/essentials/conditional)
- [Vue 3 — List rendering](https://fr.vuejs.org/guide/essentials/list)
- [Vue 3 — Event handling](https://fr.vuejs.org/guide/essentials/event-handling)
- [Vue 3 — Computed properties](https://fr.vuejs.org/guide/essentials/computed)
- [Vue 3 — Watchers](https://fr.vuejs.org/guide/essentials/watchers)
- [Vue 3 — Lifecycle hooks](https://fr.vuejs.org/guide/essentials/lifecycle)
- [Vue 3 — Slots](https://fr.vuejs.org/guide/components/slots)

- [Vue 3 — Template syntax](https://fr.vuejs.org/guide/essentials/template-syntax)
- [Vue 3 — Conditional rendering](https://fr.vuejs.org/guide/essentials/conditional)
- [Vue 3 — List rendering](https://fr.vuejs.org/guide/essentials/list)
- [Vue 3 — Event handling](https://fr.vuejs.org/guide/essentials/event-handling)
- [Vue 3 — Computed properties](https://fr.vuejs.org/guide/essentials/computed)
- [Vue 3 — Watchers](https://fr.vuejs.org/guide/essentials/watchers)
- [Vue 3 — Lifecycle hooks](https://fr.vuejs.org/guide/essentials/lifecycle)
