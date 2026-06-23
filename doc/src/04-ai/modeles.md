# Les modèles de langage (LLM)

## Qu'est-ce qu'un modèle de langage ?

Un **LLM** (Large Language Model) est un réseau de neurones artificielles entraîné sur des quantités massives de texte — documentation, code source, articles, forums… Il a appris les **motifs** du langage : comment on écrit du code, comment on explique un concept, comment on répond à une question.

> **Analogie WinDev** : Imaginez que quelqu'un a lu **tous** les manuels WinDev, **tous** les forums, et **des millions** de fichiers source WIN. Ce "cerveau" peut maintenant répondre à vos questions, générer du code, et expliquer des concepts. C'est ça, un LLM.

### Comment ça fonctionne (simplifié)

```
Vous tapez : "Crée un controller pour les factures"
       ↓
Le modèle analyse le texte mot par mot (en fait, "token" par "token")
       ↓
Il calcule la suite la plus probable de caractères
       ↓
Il génère : "Voici un controller pour les factures..." + le code
```

Le modèle ne **comprend** pas vraiment — il prédit ce qui suit en fonction de ce qu'il a vu pendant son entraînement. Mais avec des milliards de paramètres, cette prédiction est remarquablement précise.

## Les principaux fournisseurs

| Fournisseur | Modèle phare | Force | Analogie |
|-------------|-------------|-------|----------|
| **Anthropic** | Claude (Sonnet, Opus) | Raisonnement, code complexe | L'expert senior qui réfléchit avant de répondre |
| **OpenAI** | GPT-4o, o3 | Polyvalent, rapide | Le développeur généraliste efficace |
| **Google** | Gemini | Intégration écosystème Google | Le spécialiste Google |
| **DeepSeek** | DeepSeek-V3 | Rapide, bon rapport qualité/prix | L'alternatif économique performant |

## Modèles avec et sans "raisonnement"

Certains modèles ont un mode **raisonnement** (ou "thinking") : avant de répondre, ils "réfléchissent" en interne. Cela prend plus de temps mais donne de meilleurs résultats sur les problèmes complexes.

| Mode | Quand l'utiliser | Vitesse | Qualité |
|------|-----------------|---------|---------|
| **Sans raisonnement** | Tâches simples, questions rapides | Rapide | Bonne |
| **Raisonnement faible** | Corrections mineures | Moyenne | Bonne |
| **Raisonnement élevé** | Architecture, bugs complexes | Lente | Excellente |

> **Analogie WinDev** : C'est comme la différence entre taper une procédure simple (rapide) et concevoir un algorithme complexe avec un schéma sur papier avant de coder (plus lent, mais meilleur résultat).

## Contexte — La "mémoire" du modèle

Un modèle n'a **aucune mémoire** entre deux conversations. Chaque session commence à zéro. Le **contexte** est tout ce que le modèle "voit" dans la conversation actuelle :

```
Contexte = Vos messages + Réponses du modèle + Contenu des fichiers lus + Historique
```

Chaque modèle a une **fenêtre de contexte** maximale (nombre de tokens) :

| Modèle | Fenêtre de contexte | Équivalent approximatif |
|--------|---------------------|------------------------|
| Claude Sonnet 4 | 200 000 tokens | ~150 000 mots |
| GPT-4o | 128 000 tokens | ~96 000 mots |
| Gemini Pro | 2 000 000 tokens | ~1 500 000 mots |

> **Note** : Un "token" ≈ 4 caractères ou ¾ de mot en anglais. En français, comptez environ 1 token = 1 mot court.

### Quand le contexte déborde

Si la conversation dépasse la fenêtre de contexte, le modèle "oublie" les premiers messages. La plupart des agents gèrent cela automatiquement via la **compaction** : ils résument l'historique ancien pour libérer de la place.

## Coût des modèles

Les modèles se facturent au **nombre de tokens** (entrée + sortie) :

| Modèle | Prix entrée (par million de tokens) | Prix sortie |
|--------|-------------------------------------|-------------|
| Claude Sonnet 4 | ~3 $ | ~15 $ |
| GPT-4o | ~2.50 $ | ~10 $ |
| Gemini Pro | ~0.50 $ | ~1.50 $ |

> **Conseil** : Pour un usage quotidien sur un projet, cela revient à quelques dollars par mois. Les abonnements (Claude Pro, ChatGPT Plus) offrent un forfait mensuel fixe.

## Choisir un modèle pour ce projet

Pour le projet CHDev, voici les recommandations :

| Tâche | Modèle recommandé | Niveau de raisonnement |
|-------|-------------------|----------------------|
| Créer un endpoint backend | Claude Sonnet ou GPT-4o | Moyen |
| Comprendre l'architecture | Claude Sonnet | Élevé |
| Déboguer une erreur | Claude Sonnet ou GPT-4o | Moyen |
| Écrire de la documentation | N'importe quel bon modèle | Faible |
| Questions rapides | N'importe quel modèle | Off |

## Exercices pratiques

> 💡 **Conseil** : Ces exercices se font dans l'agent de codage (pi ou autre). Ouvrez une session dans le dossier du projet.

### Exercice 1 — Poser une question simple

Demandez à l'agent : *"Quelles technologies utilise le backend de ce projet ?"*

<details>
<summary>🔽 Voir la solution</summary>

L'agent devrait lire les fichiers de configuration (`package.json`, `backend/src/index.ts`) et vous répondre avec la liste des technologies : Express, TypeORM, SQLite, Zod.

**Explications :**
- L'agent utilise ses outils (`read`, `bash`) pour explorer le projet
- Le modèle analyse le contenu et génère une réponse structurée
- C'est l'équivalent de chercher dans l'aide WinDev, mais l'agent fait la recherche pour vous

</details>

---

### Exercice 2 — Comparer deux modèles

Si vous avez accès à plusieurs modèles, posez la même question à deux modèles différents : *"Explique-moi la différence entre un controller et un repository dans ce projet."*

<details>
<summary>🔽 Voir la solution</summary>

Comparez les réponses :
- L'un est-il plus détaillé ?
- L'un utilise-t-il des analogies ?
- L'un fait-il référence au code du projet ?

**Explications :**
- Chaque modèle a son "style" de réponse
- Certains sont meilleurs pour le code, d'autres pour les explications
- Le niveau de raisonnement influence la profondeur de la réponse

</details>

---

### Exercice 3 — Tester le niveau de raisonnement (bonus)

Posez une question complexe avec et sans raisonnement : *"Propose une architecture pour ajouter un module de notifications dans ce projet."*

<details>
<summary>🔽 Voir la solution</summary>

Comparez les deux réponses :
- **Sans raisonnement** : Réponse rapide, peut-être moins structurée
- **Avec raisonnement élevé** : Réponse plus longue, mieux organisée, avec plus de détails techniques

**Explications :**
- Le raisonnement permet au modèle de "planifier" sa réponse avant de l'écrire
- Pour les tâches d'architecture, cela fait une vraie différence
- Pour les questions simples, c'est inutile

</details>

---

## Ressources pour aller plus loin

- [Site d'Anthropic (Claude)](https://www.anthropic.com/)
- [Site d'OpenAI (GPT)](https://openai.com/)
- [Site de Google (Gemini)](https://ai.google.dev/)
- [Artificial Intelligence Arena — Comparatif de modèles](https://artificialanalysis.ai/)
