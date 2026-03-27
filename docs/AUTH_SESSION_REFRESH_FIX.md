# Auth Session Refresh Fix

Date: 2026-03-27

## Problème constaté

Après un refresh de page, l'application pouvait afficher un message de type `token expiré` puis rediriger l'utilisateur vers `/login`.

Effet visible:
- perte de session apparente
- obligation de se reconnecter
- pages protégées comme profil ou discussion renvoyées vers la connexion

## Cause exacte

Le backend renvoyait déjà:
- un `accessToken`
- un `refreshToken`

Mais le frontend ne stockait que l'access token.

Conséquence:
1. le navigateur recharge la page
2. `AuthContext` appelle `/api/auth/me`
3. si l'access token est expiré, le backend retourne `401`
4. le frontend vide le storage
5. `user` passe à `null`
6. les pages protégées redirigent vers `/login`

Le point bloquant n'était donc pas le backend, mais l'absence de refresh automatique côté frontend.

## Correction appliquée

### 1. Stockage de session centralisé

Ajout d'un module dédié:

- `frontend/src/services/authStorage.ts`

Il centralise:
- `cineconnect_token`
- `cineconnect_refresh_token`
- `cineconnect_user`

Il émet aussi un événement local pour resynchroniser l'état auth dans le même onglet quand le token est rafraîchi.

### 2. Refresh automatique sur `401`

Mise à jour de:

- `frontend/src/services/api.ts`

Comportement:
- si une requête retourne `401`
- et qu'un `refreshToken` existe
- le frontend appelle `POST /api/auth/refresh`
- met à jour l'access token
- rejoue automatiquement la requête initiale

Si le refresh échoue:
- la session est supprimée proprement
- la reconnexion reste nécessaire

### 3. AuthContext aligné avec le vrai flux de session

Mise à jour de:

- `frontend/src/contexts/AuthContext.tsx`

Changements:
- stockage de `refreshToken` au login
- stockage de `refreshToken` au register
- restauration de session via `/auth/me` avec possibilité de refresh transparent
- synchronisation du token et du user depuis le storage

## Fichiers modifiés

- `frontend/src/services/authStorage.ts` (nouveau)
- `frontend/src/services/api.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/services/api.test.ts`

## Résultat attendu

Après connexion:
- un refresh de page ne doit plus déconnecter l'utilisateur si seul l'access token a expiré
- la session reste valide tant que le `refreshToken` est encore valide

Si le `refreshToken` expire aussi:
- la déconnexion reste normale

## Important

Les anciennes sessions ouvertes avant ce correctif peuvent ne pas avoir de `refreshToken` stocké.

Dans ce cas, il faut:
1. se reconnecter une fois
2. laisser le nouveau couple `accessToken + refreshToken` être stocké

## Vérification locale exécutée

```bash
cd frontend
npm run test
npm run build

cd ../backend
npm run build
```

Résultat:
- frontend tests OK
- frontend build OK
- backend build OK
