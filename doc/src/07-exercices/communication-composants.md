# Exercices — Communication entre composants

> 💡 **Conseil** : Testez chaque exercice en créant un fichier `MonComposant.vue` et un fichier `ParentComposant.vue` dans le dossier `components/` de votre projet CHDev.

---

## Exercice 1 — Créer un composant enfant avec props

Créez un composant `Bonjour.vue` qui affiche "Bonjour, {nom} !" avec un style coloré. Le nom est passé via une prop.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- frontend/src/components/Bonjour.vue -->
<script setup lang="ts">
const props = defineProps<{
  nom: string;
}>();
</script>

<template>
  <p class="text-primary text-h6">Bonjour, {{ props.nom }} !</p>
</template>
```

**Explications :**
- `defineProps<{ nom: string }>()` déclare une prop obligatoire `nom`
- Dans le template, `props.nom` affiche la valeur passée par le parent
- Le composant est **pur** : il ne fait qu'afficher, pas de logique métier

</details>

---

## Exercice 2 — Passer des props depuis un parent

Créez un composant `App.vue` (ou une view) qui utilise `Bonjour.vue` avec différents prénoms.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<template>
  <v-container>
    <Bonjour nom="Alice" />
    <Bonjour nom="Bob" />
    <Bonjour :nom="prenomActuel" />
  </v-container>
</template>

<script setup lang="ts">
import Bonjour from './Bonjour.vue';

const prenomActuel = ref('Charlie');
</script>
```

**Explications :**
- `<Bonjour nom="Alice" />` passe la chaîne littérale `"Alice"`
- `<Bonjour :nom="prenomActuel" />` utilise `:` pour passer la variable réactive `prenomActuel`
- Si vous changez `prenomActuel.value` ailleurs, l'affichage se met à jour automatiquement (réactivité)

</details>

---

## Exercice 3 — Implémenter un compteur avec events

Créez un composant `Compteur.vue` avec des boutons +1 et -1. Quand on clique, l'enfant **émets** un événement avec le nouveau compteur. Le parent **affiche** le compteur courant.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- frontend/src/components/Compteur.vue -->
<script setup lang="ts">
const props = defineProps<{
  valeur: number;
}>();

const emit = defineEmits<{
  change: [nouvelleValeur: number];
}>();

const incrementer = () => {
  emit('change', props.valeur + 1);
};

const diminuer = () => {
  emit('change', props.valeur - 1);
};
</script>

<template>
  <div class="d-flex ga-2 align-center">
    <v-btn icon @click="diminuer">−</v-btn>
    <span class="text-h5">{{ props.valeur }}</span>
    <v-btn icon @click="incrementer">+</v-btn>
  </div>
</template>
```

```vue
<!-- Parent -->
<template>
  <Compteur :valeur="compteur" @change="compteur = $event" />
</template>

<script setup lang="ts">
import Compteur from './Compteur.vue';

const compteur = ref(0);
</script>
```

**Explications :**
- L'enfant **ne garde pas** son propre compteur — il lit `props.valeur` et émet `change` quand on clique
- Le parent **gère** le compteur (`ref(0)`) et le met à jour via `@change="compteur = $event"`
- C'est le pattern **controlled** : l'enfant est une "vue" contrôlée par le parent
- `$event` est une variable spéciale disponible dans les handlers d'événements — elle contient les données transmises par `emit()`

</details>

---

## Exercice 4 — Créer un champ avec v-model

Créez un composant `MonInput.vue` qui supporte `v-model`. Il doit afficher une valeur et notifier le parent à chaque changement.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- frontend/src/components/MonInput.vue -->
<script setup lang="ts">
// Version manuelle (props + emits)
const props = defineProps<{
  modelValue: string;
  label: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const onInput = (event: Event) => {
  const valeur = (event.target as HTMLInputElement).value;
  emit('update:modelValue', valeur);
};
</script>

<template>
  <div class="d-flex flex-column">
    <label class="text-subtitle-2">{{ label }}</label>
    <input
      :value="props.modelValue"
      @input="onInput"
      class="border rounded"
    />
  </div>
</template>
```

```vue
<!-- Parent -->
<template>
  <MonInput v-model="prenom" label="Prénom" />
  <MonInput v-model="nom" label="Nom" />
  <p>Salutation : {{ prenom }} {{ nom }}</p>
</template>

<script setup lang="ts">
import MonInput from './MonInput.vue';

const prenom = ref('Alice');
const nom = ref('Dupont');
</script>
```

**Explications :**
- `v-model="prenom"` est équivalent à `:modelValue="prenom"` + `@update:modelValue="prenom = $event"`
- À chaque `@input`, l'enfant émet `update:modelValue` avec la nouvelle valeur
- Le parent met à jour `prenom.value` et l'affichage se met à jour automatiquement
- Ce pattern est exactement ce que font les champs Vuetify (`v-text-field`, `v-number-input`) utilisés dans `GenericForm` et les formulaires de CHDev

> 💡 **Version avec defineModel** :
> ```vue
> <script setup lang="ts">
> const modele = defineModel<string>();
> defineProps<{ label: string }>();
> </script>
> <template>
>   <div class="d-flex flex-column">
>     <label class="text-subtitle-2">{{ label }}</label>
>     <input v-model="modele" class="border rounded" />
>   </div>
> </template>
> ```
> La même chose en **5 lignes** au lieu de **20** — le résultat est identique.

</details>

---

## Exercice 5 (bonus) — Formulaire complet avec validation

Créez un formulaire d'inscription composé de :
- Un champ `v-model` pour le nom
- Un champ `v-model` pour l'email
- Un bouton "S'inscrire" qui émet un événement avec les données

Le parent affiche un résumé des informations saisies.

<details>
<summary>🔽 Voir la solution</summary>

```vue
<!-- frontend/src/components/FormInscription.vue -->
<script setup lang="ts">
const props = defineProps<{
  modele: {
    nom: string;
    email: string;
  };
}>();

const emit = defineEmits<{
  inscrit: [data: { nom: string; email: string }];
  annuler: [];
}>();

const onSoumettre = () => {
  if (props.modele.nom && props.modele.email) {
    emit('inscrit', { ...props.modele });
  }
};
</script>

<template>
  <v-card>
    <v-card-title>Inscription</v-card-title>
    <v-card-text>
      <v-text-field
        :modelValue="props.modele.nom"
        label="Nom"
        @update:modelValue="$emit('update:modele', { ...props.modele, nom: $event })"
      />
      <v-text-field
        :modelValue="props.modele.email"
        label="Email"
        type="email"
        @update:modelValue="$emit('update:modele', { ...props.modele, email: $event })"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="onSoumettre">S'inscrire</v-btn>
      <v-btn variant="text" @click="$emit('annuler')">Annuler</v-btn>
    </v-card-actions>
  </v-card>
</template>
```

```vue
<!-- Parent -->
<template>
  <FormInscription
    v-model:modele="inscription"
    @inscrit="afficherResume"
    @annuler="inscription = { nom: '', email: '' }"
  />

  <v-alert v-if="resume" type="success" class="mt-4">
    Merci {{ resume.nom }} ! Un email de confirmation a été envoyé à {{ resume.email }}.
  </v-alert>
</template>

<script setup lang="ts">
import FormInscription from './FormInscription.vue';

const inscription = ref({ nom: '', email: '' });
const resume = ref<{ nom: string; email: string } | null>(null);

const afficherResume = (data: { nom: string; email: string }) => {
  resume.value = data;
};
</script>
```

**Explications :**
- `v-model:modele` permet de passer un objet entier en v-model (pas seulement une primitive)
- À chaque changement de nom ou email, l'enfant émet `update:modele` avec un nouvel objet (spread `...props.modele`)
- Le bouton "S'inscrire" émet `inscrit` avec les données validées
- Le parent affiche un résumé après inscription
- **Astuce** : Le spread `...props.modele` crée un nouvel objet — c'est important pour que Vue détecte le changement

> 💡 **Version avec defineModel** pour les champs internes :
> ```vue
> <script setup lang="ts">
> const modele = defineModel<{
>   nom: string;
>   email: string;
> }>();
> </script>
> <template>
>   <v-card>
>     <v-card-title>Inscription</v-card-title>
>     <v-card-text>
>       <v-text-field v-model="modele.nom" label="Nom" />
>       <v-text-field v-model="modele.email" label="Email" type="email" />
>     </v-card-text>
>     <v-card-actions>
>       <v-btn color="primary" @click="onSoumettre">S'inscrire</v-btn>
>       <v-btn variant="text" @click="$emit('annuler')">Annuler</v-btn>
>     </v-card-actions>
>   </v-card>
> </template>
> ```
> Avec `defineModel`, l'objet `modele` est un ref réactif. Modifier `modele.nom` ou `modele.email` modifie automatiquement l'objet partagé avec le parent — pas besoin de spread ni d'émettre manuellement `update:modele`. Les champs internes utilisent `v-model` directement sur les propriétés de l'objet.

</details>

---

## Résumé des exercices

| Exercice | Concept |
|----------|---------|
| 1 | Props — créer un composant enfant avec des props |
| 2 | Props — passer des props depuis un parent (liaison dynamique) |
| 3 | Events — pattern contrôlé parent/enfant |
| 4 | v-model — version manuelle (props + emits) et `defineModel` |
| 5 (bonus) | v-model multiple + formulaire complet |

---

## Ressources pour aller plus loin

- [Vue 3 Documentation — Props](https://fr.vuejs.org/guide/components/props)
- [Vue 3 Documentation — Events](https://fr.vuejs.org/guide/components/events)
- [Vue 3 Documentation — v-model](https://fr.vuejs.org/guide/components/v-model)
- [Vue 3 Documentation — defineModel](https://fr.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)
- [Vue 3 Documentation — Composition API avec `<script setup>`](https://fr.vuejs.org/api/sfc-script-setup.html)
