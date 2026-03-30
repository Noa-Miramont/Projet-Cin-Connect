# Section scroll "A propos du projet"

## Ce qui a été récupéré

Depuis `dev-general`, un composant d'animation au scroll a été réintroduit sur la page d'accueil :

- `frontend/src/components/ScrollFillText.tsx`

Il est utilisé dans :
- `frontend/src/pages/Home.tsx`

## But du composant

Le texte n'apparaît pas d'un seul coup.

Le comportement est :
- au début, le texte est majoritairement gris
- au scroll, une portion de plus en plus grande devient visible
- l'effet repose sur la position du bloc dans le viewport

## Fonctionnement technique

Le composant :
- écoute l'événement `scroll`
- calcule la position du bloc avec `getBoundingClientRect()`
- transforme cette position en `progress` entre `0` et `1`
- découpe ensuite la chaîne :
  - partie visible
  - partie encore cachée

Code logique :
- `visibleLength = Math.floor(text.length * progress)`
- `revealedText = text.slice(0, visibleLength)`
- `hiddenText = text.slice(visibleLength)`

## Pourquoi cette implémentation est simple et robuste

- pas de dépendance externe supplémentaire
- pas de moteur d'animation complexe
- pas de state global
- un seul `useEffect`
- nettoyage propre du listener `scroll`

## Où la section a été branchée

Dans `Home.tsx`, la zone `A PROPOS DU PROJET` utilise maintenant :
- une structure timeline
- trois blocs de contenu
- `ScrollFillText` sur chaque paragraphe principal

## Branding

Le composant a été repris, mais le texte a été réaligné sur `Dolly Zoom` pour ne pas réintroduire le branding `CineConnect` dans la home.

## Validation faite

```bash
pnpm --filter @cineconnect/frontend run test
pnpm --filter @cineconnect/frontend run build
```

## Fichiers concernés

- `frontend/src/components/ScrollFillText.tsx`
- `frontend/src/pages/Home.tsx`
- `frontend/src/branding.test.ts`
