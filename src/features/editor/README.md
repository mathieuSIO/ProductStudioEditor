# Editor Feature

## But de la feature

Cette feature porte le MVP du studio de personnalisation textile.

Aujourd'hui, elle gere :
- la selection produit / couleur / vue
- l'affichage du mockup actif
- l'ajout d'un logo
- la manipulation du logo sur la zone imprimable
- la saisie d'un placement custom
- les quantites par taille

Elle ne gere pas encore la logique e-commerce complete, le pricing, le recap detaille ou le multi-logo.

## Structure rapide

- `components/layout` : composition de la page editor et zones principales
- `components/canvas` : rendu du mockup, zone imprimable, preview du logo
- `components/panels` : cartes et panneaux annexes de l'editeur
- `components/selectors` : selecteurs UI lies a l'editor
- `hooks` : orchestration d'etat de la feature
- `data` : donnees mock locales
- `constants` : regles et constantes de placement / upload
- `types` : types de la feature editor
- `utils` : utilitaires locaux

## Fichiers cles

- `hooks/useEditorStudio.ts` : hook principal, etat central, derivees et handlers publics
- `components/layout/EditorLayout.tsx` : composition globale de l'ecran editor
- `components/layout/EditorCanvasArea.tsx` : zone centrale studio, preview active et navigation entre vues
- `components/canvas/ProductMockupPreview.tsx` : rendu du mockup produit, overlay imprimable et edition du logo
- `data/mockProducts.ts` : catalogue mock produit/couleur/vue/taille

## Flux actuel

- Le hook `useEditorStudio.ts` porte l'etat principal de la feature.
- Le produit selectionne determine la couleur active, les vues disponibles et les quantites.
- La vue active affiche soit un mockup produit, soit une carte de placement custom.
- L'upload cree un logo unique pour la vue active.
- Le logo peut etre selectionne, deplace et redimensionne dans la zone imprimable.
- Les quantites sont stockees par produit puis par taille.

## Points d'extension

- `pricing` : brancher apres les quantites et la selection produit, idealement a partir des derivees exposees par `useEditorStudio.ts`
- `recap` : brancher dans le layout global, en lisant produit, couleur, vue, logo et quantites depuis le hook
- `multi-logo` : partir de `elementsByView` dans `useEditorStudio.ts`, qui est aujourd'hui limite a un seul element par vue
- `catalogue reel / API` : remplacer `data/mockProducts.ts` par une source produit reelle sans casser le contrat attendu par les composants
- `e-commerce` : brancher apres stabilisation du recap et des quantites, pas directement dans les composants canvas

## Points sensibles

- `useEditorStudio.ts` reste le point central : eviter d'eparpiller l'etat de l'editor ailleurs sans raison forte.
- La synchronisation produit / couleur / vue active est sensible : verifier les fallbacks avant toute evolution.
- Le cleanup de `URL.revokeObjectURL` est important lors du remplacement ou retrait du logo.
- `ProductMockupPreview.tsx` gere deux chemins de rendu : mockup image reel et fallback visuel.
- Le multi-logo demandera de revoir la forme de `elementsByView`, pas seulement le rendu canvas.
