# Tests de la politique de mot de passe

## Tests automatisés

Des tests ont été ajoutés ou mis à jour pour couvrir la validation des mots de passe :

- `backend/src/__tests__/password.test.ts`
- `backend/src/__tests__/auth.password-reset.controller.test.ts`
- `backend/src/__tests__/auth.password-reset.routes.test.ts`
- `backend/src/__tests__/auth.test.ts`

Le frontend a aussi été mis à jour pour afficher la politique de mot de passe en temps réel dans :

- `frontend/src/lib/password.ts`
- `frontend/src/components/PasswordRequirements.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/pages/ResetPassword.tsx`

Un correctif d'integration a aussi ete applique sur `frontend/src/pages/Register.tsx` pour supprimer l'erreur :

```txt
Cannot access 'mutation' before initialization
```

## Ce que les tests vérifient

### `password.test.ts`

Valide la fonction utilitaire :

- accepte un mot de passe fort
- rejette l'absence de majuscule
- rejette l'absence de minuscule
- rejette l'absence de chiffre
- rejette l'absence de caractère spécial

### `auth.test.ts`

Vérifie côté routes réelles :

- `POST /api/auth/signup` refuse un mot de passe faible
- `POST /api/auth/register` accepte un mot de passe fort

### `auth.password-reset.controller.test.ts`

Vérifie côté controller :

- erreur si mot de passe manquant
- erreur si mot de passe trop faible
- succès si le service retourne une réponse valide

### `auth.password-reset.routes.test.ts`

Vérifie côté HTTP :

- `POST /api/auth/reset-password` refuse un mot de passe faible
- `POST /api/auth/reset-password` accepte un mot de passe valide si le service réussit

## Commande pour lancer les tests

Depuis le dossier `backend` :

```bash
pnpm test -- password.test.ts auth.password-reset.controller.test.ts auth.password-reset.routes.test.ts auth.test.ts
```

## Build de vérification

Toujours depuis `backend` :

```bash
pnpm run build
```

Pour le frontend :

```bash
cd frontend
pnpm run build
```

Ce build permet aussi de verifier que la page `RegisterPage` compile correctement apres le correctif sur l'ordre de declaration de `mutation`.

## Tests manuels avec curl

### Inscription avec mot de passe faible

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"maduzan","password":"weakpass"}'
```

Réponse attendue :

```json
{
  "message": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
}
```

### Inscription avec mot de passe fort

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"maduzan","password":"Password123!"}'
```

Réponse attendue :

- statut `201`
- création du compte
- retour de l'utilisateur et du token

### Reset password avec mot de passe faible

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_ICI","password":"weakpass"}'
```

Réponse attendue :

```json
{
  "message": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
}
```

### Reset password avec mot de passe fort

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_ICI","password":"Password123!"}'
```

Réponse attendue :

```json
{
  "message": "Mot de passe mis à jour"
}
```

## Tests manuels côté frontend

### Page inscription

Ouvre :

```txt
http://localhost:5173/register
```

Vérifie que :

- les 5 règles apparaissent sous le champ mot de passe
- chaque règle passe au vert au fur et à mesure
- le bouton d'inscription reste désactivé tant que toutes les règles ne sont pas valides
- le bouton reste désactivé si la confirmation ne correspond pas

### Page reset password

Ouvre :

```txt
http://localhost:5173/reset-password?token=TOKEN_DE_TEST
```

Vérifie que :

- les 5 règles apparaissent sous le champ "Nouveau mot de passe"
- chaque règle se met à jour en direct
- le bouton reste désactivé tant que le mot de passe est faible
- le bouton reste désactivé si la confirmation ne correspond pas

## Résultat attendu dans l'UI

### Mot de passe faible

- plusieurs règles restent en rouge
- le bouton de soumission est désactivé

### Mot de passe fort

Avec par exemple :

```txt
Password123!
```

- toutes les règles passent au vert
- le bouton devient cliquable si la confirmation est correcte

## Conseils

- utilise toujours un mot de passe de test qui respecte la politique si tu veux atteindre la logique métier suivante
- si tu obtiens une erreur `400`, regarde le champ `message` dans la réponse JSON
- pour le frontend, affiche toujours `response.data.message` plutôt que le message générique Axios
- garde la validation backend même si le frontend bloque déjà les mots de passe faibles
