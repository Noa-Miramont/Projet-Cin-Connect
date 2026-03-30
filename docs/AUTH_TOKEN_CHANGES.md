# Auth Token Changes

Date: 2026-03-23

## Objectif

Mettre en place un flux `accessToken` + `refreshToken` côté backend.

## Changements API

### 1. `POST /api/auth/login`

Retourne maintenant:

```json
{
  "user": { "...": "..." },
  "token": "<accessToken>",
  "accessToken": "<accessToken>",
  "refreshToken": "<refreshToken>"
}
```

Notes:
- `token` est conservé comme alias de compatibilité (même valeur que `accessToken`).

### 2. `POST /api/auth/refresh`

Payload attendu:

```json
{
  "refreshToken": "<refreshToken>"
}
```

Réponse succès:

```json
{
  "token": "<newAccessToken>",
  "accessToken": "<newAccessToken>"
}
```

Codes de retour:
- `200`: refresh réussi
- `400`: `refreshToken` manquant (`{ "error": "refreshToken requis" }`)
- `401`: `refreshToken` invalide (`{ "error": "Refresh token invalide" }`)

## Détails techniques

- Secrets:
  - `JWT_SECRET` pour l'access token
  - `REFRESH_TOKEN_SECRET` pour le refresh token
- Expirations configurables:
  - `ACCESS_TOKEN_EXPIRES_IN` (défaut: `15m`)
  - `REFRESH_TOKEN_EXPIRES_IN` (défaut: `7d`)
- Le refresh token est signé avec un payload contenant `type: "refresh"`.

## Fichiers modifiés

- `backend/src/services/auth.ts`
- `backend/src/controllers/auth.ts`
- `backend/src/routes/auth.ts`
- `backend/src/__tests__/auth.test.ts`
- `backend/src/__tests__/auth.controller.tokens.test.ts` (nouveau)

## Vérification locale exécutée

```bash
pnpm --filter @dollyzoom/backend run build
pnpm --filter @dollyzoom/backend run test -- auth.controller.tokens.test.ts jwt.test.ts
```

Note:
- Dans cet environnement, la suite intégration complète backend peut échouer sur `bcrypt` natif (`bcrypt_lib.node` manquant), indépendamment de cette feature.
