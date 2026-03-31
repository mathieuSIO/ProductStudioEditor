# AGENTS.md

## Mission du projet

Ce repository contient la base front-end de **Mon Petit Matos**, une application React destinee a evoluer vers un **studio de personnalisation textile en ligne**, inspire des experiences type Spreadshirt.

L’objectif est de construire une interface **claire, moderne, maintenable, evolutive et orientee produit**, sans complexifier prematurement l’architecture.

La cible n’est pas seulement un editeur generique, mais une experience de personnalisation produit avec :
- selection de produit
- vues multiples du produit (devant, dos, cote, etc.)
- zone centrale de personnalisation
- zone imprimable visible
- ajout et manipulation d’elements sur le vetement
- panneau d’edition / proprietes
- base compatible avec une future logique e-commerce

Priorites :

* lisibilite du code
* typage strict
* modularite
* UX simple et efficace
* evolutivite sans refonte
* separation claire entre UI, logique produit et logique d’edition

---

## Stack technique

* React
* Vite
* TypeScript
* Tailwind CSS
* PostCSS
* Autoprefixer

---

## Organisation du projet

* `src/app` : point d’entree et composition globale
* `src/pages` : pages principales
* `src/components` : composants generiques reutilisables
* `src/components/layout` : layout et structure UI
* `src/components/ui` : primitives UI
* `src/features` : logique metier (prioritaire)
* `src/features/editor` : studio de personnalisation textile
* `src/shared` : utils, types, constantes
* `src/assets` : ressources statiques
* `src/styles` : styles globaux

### Regles de structure

* toute logique metier doit aller dans `features`
* `components` doit rester generique
* une feature doit etre isolee et autonome
* limiter les dependances entre features
* un fichier = une responsabilite claire
* creer un `index.ts` uniquement si utile
* separer clairement :
  * logique de layout / structure
  * logique produit
  * logique d’edition / manipulation

---

## Strategie de modification (OBLIGATOIRE)

Avant toute modification :

1. Identifier la feature concernee (`src/features` en priorite)
2. Verifier si un composant existant peut etre reutilise
3. Eviter de creer de nouveaux fichiers inutiles
4. Limiter les changements aux fichiers strictement necessaires
5. Comprendre l’impact global avant modification
6. Si la cible UX l’exige, une reorganisation ciblee est autorisee, mais elle doit rester justifiee, limitee et coherente avec l’existant

---

## Workflow de travail

Toujours suivre cet ordre :

1. Comprendre la demande
2. Identifier les fichiers impactes
3. Proposer un plan court
4. Appliquer le patch minimal ou la reorganisation ciblee necessaire
5. Verifier lint + build
6. Resumer les changements

---

## Regles de modification

* Toujours privilegier le **plus petit changement possible**
* Ne pas faire de refactor sans demande explicite, sauf si necessaire pour aligner la feature avec la cible produit
* Ne jamais casser un comportement existant sans le signaler
* Ne pas renommer fichiers/dossiers sans raison forte
* Ne pas ajouter de dependance sans justification
* Preferer le code existant aux nouvelles abstractions
* Reutiliser l’existant quand pertinent, mais ne pas conserver une structure inadaptee juste pour eviter un changement

---

## TypeScript

* Typage strict obligatoire
* Interdiction de `any` sans justification
* Preferer des types explicites
* Centraliser les types reutilises dans `shared`

---

## Composants

* Un composant = une responsabilite
* Eviter les composants trop volumineux
* Extraire la logique dans des hooks si necessaire
* Nommer clairement composants, props et hooks

---

## UI / Tailwind

* Utiliser Tailwind en priorite
* Eviter le CSS custom sauf necessite
* Reutiliser les composants `ui/`
* Respecter la coherence visuelle (spacing, typo, couleurs)
* Interface lisible desktop + mobile
* Prioriser une UX de studio de personnalisation claire et credible

---

## Features

Chaque feature doit :

* etre contenue dans `src/features`
* etre autonome
* exposer une interface claire
* eviter les dependances directes avec d’autres features

---

## Interdictions

* ne pas modifier `.env`
* ne pas ajouter de dependance sans raison
* ne pas supprimer de code sans verifier impact
* ne pas laisser de `console.log`
* ne pas introduire de code mort
* ne pas complexifier inutilement

---

## Commandes

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test