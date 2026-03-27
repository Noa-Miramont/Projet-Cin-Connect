# Test Changes

Date: 2026-03-23

## Resume

Ajout de nouveaux tests sans modifier le code applicatif existant.

## Fichiers ajoutes

1. `backend/src/__tests__/jwt.test.ts`
- Tests unitaires du middleware `jwtAuth`.
- Couvre:
  - cas nominal: token valide
  - cas limites: header Authorization absent ou mal forme
  - erreurs: token invalide

2. `frontend/src/services/api.test.ts`
- Tests unitaires de l'intercepteur Axios (`frontend/src/services/api.ts`).
- Couvre:
  - cas nominal: ajout du header `Authorization` quand un token existe
  - cas limites: objet `headers` absent
  - erreurs logiques: absence de token (pas de header ajoute)

3. `frontend/src/services/friends.test.ts`
- Tests unitaires des services amis (`frontend/src/services/friends.ts`) avec mock de `api`.
- Couvre:
  - cas nominaux: `fetchFriends`, `addFriend`, `removeFriend`, `acceptFriendRequest`, `declineFriendRequest`
  - cas limites: liste vide sur `fetchReceivedFriendRequests`
  - gestion des erreurs: propagation des erreurs API dans `addFriend`

## Execution

Depuis la racine du repository:

```bash
pnpm --filter @dollyzoom/frontend run test
pnpm --filter @dollyzoom/backend run test -- jwt.test.ts
```

## Notes

- Les nouveaux tests frontend passent (`2 files`, `9 tests`).
- Le test backend cible `jwt.test.ts` passe (`1 file`, `4 tests`).
- Si la suite backend complete echoue localement avec `bcrypt_lib.node` manquant, cela vient de l'environnement natif (bcrypt), pas des nouveaux tests.
