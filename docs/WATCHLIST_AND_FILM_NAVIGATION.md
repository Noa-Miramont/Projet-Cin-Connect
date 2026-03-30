# Watchlist And Film Navigation

## Objectif

Deux comportements ont été sécurisés :

1. ajouter un film à la watchlist
2. cliquer sur un film de la watchlist pour aller sur sa page détail

## Fichiers concernés

- `frontend/src/services/watchlist.ts`
- `frontend/src/pages/Films.tsx`
- `frontend/src/pages/Discussion.tsx`
- `frontend/src/router/film/$id.tsx`
- `frontend/src/pages/FilmDetail.tsx`

## Comment fonctionne la watchlist

### Stockage

La watchlist est stockée dans `localStorage` avec la clé :

```txt
dollyzoom_watchlist_<userId>
```

Exemple :

```txt
dollyzoom_watchlist_user-1
```

### Service

Dans `frontend/src/services/watchlist.ts`, on utilise :

- `getWatchlist(userId)`
- `isFilmInWatchlist(userId, filmId)`
- `addFilmToWatchlist(userId, film)`
- `removeFilmFromWatchlist(userId, filmId)`

Un événement custom est aussi dispatché :

```txt
dollyzoom-watchlist-updated
```

Cet événement permet de mettre à jour l'UI dans le même onglet sans attendre un reload.

## Ajout à la watchlist

Dans `frontend/src/pages/Films.tsx` :

- le bouton "Ajouter à ma watchlist" appelle `addToWatchlist()`
- `addToWatchlist()` appelle `addFilmToWatchlist(...)`
- l'état local `isInWatchlist` est mis à jour immédiatement

Résultat :

- le clic fonctionne
- le bouton devient `Déjà dans ma watchlist`
- la page social/watchlist se resynchronise

## Navigation depuis la watchlist

Dans `frontend/src/pages/Discussion.tsx`, chaque film de la watchlist est maintenant cliquable.

La navigation passe par :

```ts
navigate({
  to: '/film/$id',
  params: { id: filmId }
})
```

La route existe bien dans :

- `frontend/src/router/film/$id.tsx`

et la page détail lit correctement l'id via :

```ts
useParams({ from: '/film/$id' })
```

## Pourquoi ça ne marchait pas avant

Le problème venait de deux points :

1. les cartes watchlist n'étaient pas reliées à une navigation
2. la watchlist mettait à jour `localStorage`, mais pas toujours l'UI du même onglet

## Tests ajoutés

- `frontend/src/services/watchlist.test.ts`
- `frontend/src/pages/Discussion.test.ts`

Ils vérifient :

- l'écriture correcte dans la watchlist
- l'émission de l'événement de synchro
- la navigation vers `/film/$id`

## Commandes utiles

```bash
pnpm --filter @cineconnect/frontend run test
pnpm --filter @cineconnect/frontend run build
```
