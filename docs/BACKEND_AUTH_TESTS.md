# Tests backend auth et mot de passe

## Objectif

Ce document recapitule les tests backend ajoutes ou modifies pour couvrir :

- l'authentification
- le forgot password
- le reset password
- la politique de mot de passe
- les erreurs applicatives

## Fichiers de test crees

- `backend/src/__tests__/appError.test.ts`
- `backend/src/__tests__/auth.service.test.ts`
- `backend/src/__tests__/password.test.ts`

## Fichiers de test modifies

- `backend/src/__tests__/auth.test.ts`
- `backend/src/__tests__/auth.password-reset.controller.test.ts`
- `backend/src/__tests__/auth.password-reset.routes.test.ts`
- `backend/src/__tests__/jwt.test.ts`

## Ce que chaque fichier verifie

### `appError.test.ts`

Verifie :

- qu'un `AppError` conserve bien `status` et `message`
- que `isAppError(...)` detecte correctement une erreur applicative

### `password.test.ts`

Verifie la politique de mot de passe :

- mot de passe fort accepte
- absence de majuscule refusee
- absence de minuscule refusee
- absence de chiffre refusee
- absence de caractere special refusee
- message de politique partage correct

### `auth.service.test.ts`

Tests unitaires du service `authService` avec mocks sur :

- `userRepository`
- `passwordResetTokenRepository`
- `emailService`

Verifie :

- `register` refuse un mot de passe faible
- `register` normalise email et pseudo
- `register` hash le mot de passe avant creation
- `login` refuse un email inconnu
- `login` refuse un mot de passe incorrect
- `login` retourne les tokens si les identifiants sont corrects
- `requestPasswordReset` refuse un email inconnu
- `requestPasswordReset` cree un token et envoie un email
- `requestPasswordReset` transforme une erreur provider en erreur applicative `500`
- `resetPassword` refuse un mot de passe faible
- `resetPassword` refuse un token invalide
- `resetPassword` hash le nouveau mot de passe et invalide le token

### `auth.password-reset.controller.test.ts`

Tests unitaires des controllers auth :

- `register`
- `login`
- `forgotPassword`
- `resetPassword`

Verifie :

- champs manquants
- messages d'erreur explicites
- codes HTTP attendus
- succes nominal

### `auth.password-reset.routes.test.ts`

Tests de routes Express avec `supertest` sur :

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Verifie :

- format des reponses JSON
- statuts HTTP
- gestion des cas d'erreur et de succes

### `auth.test.ts`

Tests reels de routes auth existantes :

- `POST /api/auth/register`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

Verifie :

- corps incomplets
- mot de passe faible refuse
- inscription valide
- login invalide
- refresh token invalide et valide

### `jwt.test.ts`

Verifie le middleware JWT :

- token manquant
- token invalide
- token sans `id`
- token correct

## Commandes executees

### Suite backend complete

```bash
cd backend
pnpm test
```

### Build TypeScript backend

```bash
cd backend
pnpm run build
```

## Resultat

Resultat de la derniere verification :

- `12` suites de tests
- `78` tests
- tout passe

## Remarques

Pendant l'execution, il reste des warnings non bloquants :

- logs `console.warn` et `console.error` attendus sur les cas d'erreur testes
- warning Node `DEP0169` sur `url.parse`
- warning Jest indiquant qu'un worker ne se ferme pas proprement

Ces warnings n'empechent pas la validation des tests.

## Commandes utiles

### Relancer seulement les tests auth

```bash
cd backend
pnpm test -- auth.test.ts auth.password-reset.controller.test.ts auth.password-reset.routes.test.ts auth.service.test.ts password.test.ts appError.test.ts jwt.test.ts
```

### Lancer un seul fichier

```bash
cd backend
pnpm test -- auth.service.test.ts
```
