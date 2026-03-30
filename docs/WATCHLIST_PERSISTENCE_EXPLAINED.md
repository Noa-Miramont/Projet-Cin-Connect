# Watchlist persistante

## Problème initial

La watchlist était stockée uniquement dans le `localStorage` du navigateur.

Conséquences :
- pas de persistance fiable côté serveur
- comportement différent des avis
- perte ou divergence possible selon le navigateur, le storage ou la session

Les avis, eux, étaient déjà enregistrés en base de données.  
L'objectif a donc été de faire fonctionner la watchlist avec la même logique.

## Nouvelle architecture

La watchlist passe maintenant par le backend :

- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:filmId`

Structure backend ajoutée :
- `backend/src/routes/watchlist.ts`
- `backend/src/controllers/watchlist.ts`
- `backend/src/services/watchlist.ts`
- `backend/src/repositories/watchlist.ts`

Table ajoutée :
- `watchlist_items`

Définition :
- un utilisateur peut avoir plusieurs films dans sa watchlist
- un film peut être dans plusieurs watchlists
- une contrainte d'unicité empêche les doublons `user_id + film_id`

## Fonctionnement métier

### Lire la watchlist

Le frontend appelle `GET /api/watchlist`.

Le backend :
- récupère l'utilisateur connecté via le JWT
- charge les films liés à sa watchlist
- renvoie une liste triée par date d'ajout décroissante

### Ajouter un film

Le frontend appelle `POST /api/watchlist` avec `filmId`.

Le backend :
- vérifie que l'utilisateur est connecté
- vérifie que le film existe
- vérifie qu'il n'est pas déjà dans la watchlist
- crée l'entrée en base
- renvoie l'élément ajouté

### Supprimer un film

Le frontend appelle `DELETE /api/watchlist/:filmId`.

Le backend :
- vérifie que l'utilisateur est connecté
- vérifie que le film est bien dans sa watchlist
- supprime l'entrée en base

## Fichiers frontend modifiés

- `frontend/src/services/watchlist.ts`
- `frontend/src/pages/Films.tsx`
- `frontend/src/pages/Discussion.tsx`

## Différence importante par rapport à avant

Avant :
- `addFilmToWatchlist(userId, filmData)`
- lecture locale via `getWatchlist(userId)`

Maintenant :
- `addFilmToWatchlist(filmId)`
- lecture via React Query avec `fetchWatchlist()`

Le frontend n'est plus la source de vérité.
La base de données l'est.

## Pourquoi c'est mieux

- cohérent avec les avis
- persistant entre redémarrages du serveur et rechargements de page
- pas dépendant du `localStorage`
- évite les divergences entre plusieurs onglets ou plusieurs appareils

## Tests ajoutés

Backend :
- `backend/src/__tests__/watchlist.test.ts`
- `backend/src/__tests__/watchlist.service.test.ts`

Frontend :
- `frontend/src/services/watchlist.test.ts`
- ajustement de `frontend/src/pages/Films.test.tsx`

## Commandes de validation exécutées

```bash
pnpm test
pnpm build
pnpm --filter @cineconnect/backend run db:push
```

## Point d'attention

Les anciennes watchlists déjà enregistrées uniquement dans le `localStorage` ne sont pas migrées automatiquement vers la base.  
À partir de ce changement, tous les nouveaux ajouts passent bien par la base de données.
