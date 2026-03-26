# Correction du crash frontend lie a PosterImage

## Probleme observe

En ouvrant :

```txt
http://localhost:5173/
```

le frontend affichait une page vide.

Dans la console navigateur, l'erreur etait :

```txt
Uncaught SyntaxError: The requested module '/src/components/PosterImage.tsx' does not provide an export named 'PosterImage'
```

## Cause

Les fichiers suivants importaient `PosterImage` :

- `frontend/src/components/FilmCard.tsx`
- `frontend/src/pages/FilmDetail.tsx`

Mais le fichier :

- `frontend/src/components/PosterImage.tsx`

etait vide, donc il n'exportait aucun composant `PosterImage`.

Resultat :

- Vite ne pouvait pas resoudre l'import
- le bundle frontend plantait au chargement
- l'application ne montait plus

## Correction appliquee

Le fichier `frontend/src/components/PosterImage.tsx` a ete recree avec :

- un export `PosterImage`
- un affichage normal si `src` existe
- un fallback `Affiche indisponible` si l'image est absente
- une gestion des erreurs d'image via `onError`

## Comportement du composant

Le composant fait maintenant :

1. affiche l'image si l'URL est valide
2. bascule sur un fallback si l'image renvoie une erreur
3. evite de casser toute l'application si une affiche Amazon renvoie `404`

## Fichier corrige

- `frontend/src/components/PosterImage.tsx`

## Verification effectuee

Build frontend execute :

```bash
cd frontend
pnpm run build
```

Resultat :

- build OK
- plus d'erreur d'export `PosterImage`

## Resultat attendu

Apres correction :

- `http://localhost:5173/` se charge normalement
- les cartes films et la page detail film ne plantent plus
- les affiches indisponibles affichent un message de remplacement au lieu de casser le frontend
