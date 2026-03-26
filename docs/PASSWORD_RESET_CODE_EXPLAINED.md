# Explication du code "Mot de passe oublie"

## Objectif

Ce document explique tout le code ajoute pour implementer le flow complet de reinitialisation de mot de passe dans CineConnect :

1. l'utilisateur saisit son email
2. le backend genere un token
3. le backend stocke ce token de maniere securisee
4. le backend envoie un email avec un lien de reset
5. l'utilisateur ouvre la page de reset
6. l'utilisateur entre un nouveau mot de passe
7. le backend met a jour le mot de passe en base

Le systeme est decoupe en backend, frontend, base de donnees et configuration email.

---

## Vue d'ensemble rapide

Le flow repose sur ces fichiers :

- `backend/src/routes/auth.ts`
- `backend/src/controllers/auth.ts`
- `backend/src/services/auth.ts`
- `backend/src/services/email.ts`
- `backend/src/repositories/passwordResetToken.ts`
- `backend/src/repositories/user.ts`
- `backend/src/db/schema.ts`
- `frontend/src/pages/ForgotPassword.tsx`
- `frontend/src/pages/ResetPassword.tsx`
- `frontend/src/services/auth.ts`

---

## Backend

### 1. `backend/src/routes/auth.ts`

Ce fichier declare les routes HTTP liees a l'authentification.

Pour le reset password, deux routes ont ete ajoutees :

- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Role de ce fichier :

- declarer les endpoints
- relier les endpoints aux controllers
- documenter les routes pour Swagger

Concretement :

- `forgot-password` attend un body JSON avec `{ email }`
- `reset-password` attend un body JSON avec `{ token, password }`

Important :

- ces routes sont des `POST`
- si on ouvre l'URL dans le navigateur, on aura `Cannot GET ...`
- il faut les appeler via Swagger, Postman, curl ou le frontend

---

### 2. `backend/src/controllers/auth.ts`

Le controller recoit la requete Express et renvoie la reponse HTTP.

#### `forgotPassword`

Cette methode :

1. recupere `email` dans `req.body`
2. verifie que l'email est present
3. appelle `authService.requestPasswordReset(email)`
4. renvoie `{ message: "Email envoye" }` si tout se passe bien
5. renvoie une erreur si l'envoi echoue

Pourquoi un controller existe :

- pour separer la logique HTTP de la logique metier
- pour garder des services plus propres

#### `resetPassword`

Cette methode :

1. recupere `token` et `password`
2. verifie qu'ils sont presents
3. appelle `authService.resetPassword(token, password)`
4. renvoie `{ message: "Mot de passe mis a jour" }`

---

### 3. `backend/src/services/auth.ts`

C'est le coeur du systeme.

Ce fichier contient la logique metier du reset password.

#### Variables importantes

- `SALT_ROUNDS = 10`
  utilise par bcrypt pour hasher les mots de passe

- `MIN_PASSWORD_LENGTH = 8`
  longueur minimale du nouveau mot de passe

- `PASSWORD_RESET_TOKEN_TTL_MINUTES`
  duree de validite du token

- `PASSWORD_RESET_URL_BASE`
  URL de base utilisee pour construire le lien de reset

En dev local, on utilise :

`http://localhost:5173/reset-password`

et non `3000`, car `3000` sert l'API backend et `5173` sert le frontend React.

#### Fonctions utilitaires

##### `generateResetToken()`

Genere un token aleatoire avec :

- `randomBytes(32).toString('hex')`

Avantage :

- token long
- imprevisible
- securise

##### `hashResetToken(token)`

Hash le token avec SHA-256.

Pourquoi hasher le token :

- on ne stocke jamais le token brut en base
- si la base fuit, le token ne peut pas etre reutilise directement

##### `buildResetLink(token)`

Construit l'URL finale de reset :

`PASSWORD_RESET_URL_BASE?token=...`

Exemple :

`http://localhost:5173/reset-password?token=abc123`

#### `requestPasswordReset(email)`

Cette methode fait tout le travail du "mot de passe oublie".

Etapes :

1. nettoie l'email
2. cherche l'utilisateur avec `userRepository.findByEmail`
3. si l'utilisateur n'existe pas :
   - log `[AUTH] forgot-password ignored: unknown email`
   - retourne sans planter
4. genere un token brut
5. hash le token
6. calcule la date d'expiration
7. invalide les anciens tokens encore actifs de cet utilisateur
8. enregistre le nouveau token en base
9. genere le lien de reset
10. log le token genere et le lien
11. appelle `emailService.sendResetEmail(...)`
12. log le resultat de l'envoi

Logs utiles :

- `[AUTH] reset token generated`
- `[AUTH] reset link generated`
- `[AUTH] reset email dispatch result`

#### `resetPassword(token, newPassword)`

Cette methode traite le changement de mot de passe.

Etapes :

1. verifie que le token n'est pas vide
2. verifie que le mot de passe fait au moins 8 caracteres
3. hash le token recu
4. cherche un token actif en base
5. si aucun token n'est trouve :
   - erreur `Token invalide ou expire`
6. hash le nouveau mot de passe avec bcrypt
7. met a jour le mot de passe utilisateur en base
8. marque le token comme utilise
9. invalide les autres tokens encore actifs pour cet utilisateur

Resultat :

- le mot de passe est vraiment change en base
- le token devient inutilisable

---

### 4. `backend/src/services/email.ts`

Ce fichier gere l'envoi d'emails.

Il supporte plusieurs providers :

- `mailgun`
- `ses`
- `gmail`
- `console`

Dans ton cas, le provider vise est `mailgun`.

#### `buildPasswordResetEmail(input)`

Construit le contenu de l'email :

- sujet : `Reinitialisation du mot de passe`
- version texte
- version HTML avec bouton et lien cliquable

#### `sendWithMailgun(input)`

Cette fonction utilise :

- `mailgun.js`
- `form-data`

Et lit la configuration depuis :

- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_BASE_URL`
- `MAILGUN_FROM`

Etapes :

1. verifie que la cle API et le domaine existent
2. cree le client Mailgun
3. construit le sujet, le texte et le HTML
4. appelle `mg.messages.create(...)`
5. log l'envoi si succes
6. log l'erreur si echec
7. renvoie une erreur metier standard si Mailgun echoue

Logs utiles :

- `[EMAIL:MAILGUN] Email envoye`
- `[EMAIL:MAILGUN] Envoi echoue`

#### `sendResetEmail(...)`

Alias pratique qui appelle le dispatch principal de l'email de reset.

Cela permet de lire clairement l'intention dans `authService` :

- `emailService.sendResetEmail(...)`

---

### 5. `backend/src/repositories/passwordResetToken.ts`

Ce repository parle a la table `password_reset_tokens`.

Il contient :

#### `create(...)`

Enregistre un token de reset avec :

- `user_id`
- `token_hash`
- `expires_at`

#### `findActiveByTokenHash(tokenHash)`

Recherche un token :

- avec le bon hash
- non utilise (`used_at IS NULL`)
- non expire (`expires_at > now`)

#### `invalidateActiveForUser(userId)`

Marque comme utilises tous les tokens encore actifs pour un utilisateur.

Pourquoi :

- on evite qu'un utilisateur ait plusieurs liens encore valides

#### `markUsed(id)`

Marque un token comme consomme apres usage.

---

### 6. `backend/src/repositories/user.ts`

Ce repository s'occupe des utilisateurs.

La methode importante ajoutee pour le reset est :

#### `updatePassword(id, passwordHash)`

Elle :

1. fait un `UPDATE users`
2. remplace le mot de passe par le hash bcrypt
3. renvoie l'utilisateur mis a jour

---

### 7. `backend/src/db/schema.ts`

Le schema Drizzle definit les tables SQL.

La table importante ajoutee est :

#### `password_reset_tokens`

Colonnes :

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

Pourquoi une table separee :

- elle permet de suivre plusieurs demandes dans le temps
- elle isole la logique de reset du modele utilisateur
- elle permet de marquer un token comme utilise

Une relation a aussi ete ajoutee dans `usersRelations`.

---

### 8. `backend/src/server.ts`

Ce fichier cree l'application Express.

J'y ai ajoute :

- un log HTTP simple : `[HTTP] METHOD URL`
- une route `GET /`

Pourquoi :

- pour eviter `Cannot GET /`
- pour tester rapidement si le backend tourne

La route `GET /` renvoie un JSON avec les routes principales du serveur.

---

### 9. `backend/src/index.ts`

Ce fichier demarre le serveur.

Il lit :

- `process.env.PORT ?? 3000`

Puis il fait :

- `app.listen(PORT, ...)`

Donc le serveur backend ecoute bien sur `3000`, sauf si une autre valeur est definie dans `.env`.

---

## Frontend

### 10. `frontend/src/pages/Login.tsx`

J'ai ajoute un lien :

- `Mot de passe oublie ?`

Ce lien pointe vers :

- `/forgot-password`

But :

- offrir un acces clair au flow depuis la page de connexion

---

### 11. `frontend/src/pages/ForgotPassword.tsx`

Cette page affiche :

- un champ email
- un bouton d'envoi
- un message de succes
- un message d'erreur si l'API echoue

Fonctionnement :

1. l'utilisateur saisit son email
2. `useMutation` appelle `forgotPassword(email)`
3. le service frontend fait un POST vers `/api/auth/forgot-password`
4. si succes : message "Email envoye"
5. si erreur : affichage de l'erreur

Cette page ne genere rien elle-meme :

- elle delegue toute la logique au backend

---

### 12. `frontend/src/pages/ResetPassword.tsx`

Cette page sert a saisir le nouveau mot de passe.

Fonctionnement :

1. recupere le token dans l'URL avec `useSearch`
2. stocke ce token dans un state local
3. affiche deux champs :
   - nouveau mot de passe
   - confirmation
4. verifie que les deux mots de passe correspondent
5. appelle `resetPassword(token, password)`
6. affiche succes ou erreur

Validation :

- bouton desactive si les champs sont invalides
- erreur si les mots de passe ne correspondent pas
- rappel visuel sur le minimum de 8 caracteres

---

### 13. `frontend/src/services/auth.ts`

Ce fichier centralise les appels API frontend pour ce flow.

Il contient :

#### `forgotPassword(email)`

Envoie :

```json
{ "email": "..." }
```

vers :

`POST /api/auth/forgot-password`

#### `resetPassword(token, password)`

Envoie :

```json
{ "token": "...", "password": "..." }
```

vers :

`POST /api/auth/reset-password`

Pourquoi ce fichier est utile :

- les pages React restent simples
- la logique API reste centralisee

---

### 14. `frontend/src/router/forgot-password.tsx` et `frontend/src/router/reset-password.tsx`

Ces fichiers declarent les routes frontend TanStack Router :

- `/forgot-password`
- `/reset-password`

Sans eux, les pages React ne seraient pas accessibles via URL.

---

## Parcours complet du reset password

### Etape 1 : demande de reset

L'utilisateur ouvre :

- `http://localhost:5173/forgot-password`

Il saisit son email.

Le frontend appelle :

- `POST http://localhost:5173/api/auth/forgot-password`

Grace au proxy Vite, cet appel va en realite vers :

- `http://localhost:3000/api/auth/forgot-password`

### Etape 2 : backend forgot-password

Le backend :

1. recupere l'email
2. cherche l'utilisateur
3. cree un token
4. hash le token
5. le stocke en base
6. construit le lien de reset
7. envoie l'email avec Mailgun

### Etape 3 : utilisateur clique le lien

Le mail contient un lien de type :

- `http://localhost:5173/reset-password?token=...`

Le frontend ouvre la page `ResetPassword`.

### Etape 4 : utilisateur choisit un nouveau mot de passe

Le frontend envoie :

- `POST /api/auth/reset-password`

avec :

```json
{
  "token": "...",
  "password": "NouveauMotDePasse123"
}
```

### Etape 5 : backend reset-password

Le backend :

1. hash le token recu
2. verifie qu'il existe et n'est pas expire
3. hash le nouveau mot de passe avec bcrypt
4. met a jour l'utilisateur
5. invalide le token

---

## Pourquoi on a eu `Cannot GET /`

Au debut, le backend n'avait pas de route `GET /`.

Donc aller sur :

- `http://localhost:3000/`

renvoyait une 404 Express.

Correction faite :

- ajout d'une route `GET /` dans `server.ts`

Autre confusion frequente :

- `3000` = backend API
- `5173` = frontend React

Donc :

- les pages `/forgot-password` et `/reset-password` doivent etre ouvertes sur `5173`
- les routes API `/api/auth/...` doivent etre appelees en POST vers `3000`

---

## Configuration `.env`

Le code ne hardcode pas les secrets. Il lit les valeurs via `process.env`.

Variables Mailgun importantes :

- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN`
- `MAILGUN_BASE_URL`
- `MAILGUN_FROM`

Variable importante pour le frontend :

- `PASSWORD_RESET_URL_BASE=http://localhost:5173/reset-password`

Pourquoi `5173` :

- parce que c'est la page React qui doit afficher le formulaire de reset

---

## Etat actuel du blocage Mailgun

Le code fonctionne, mais l'envoi reel est actuellement bloque par Mailgun.

Erreur obtenue :

- `403 Forbidden`
- `Domain ... is not allowed to send: Account disabled`

Cela signifie :

- le code backend est correct
- la configuration est lue
- l'appel a Mailgun part bien
- mais Mailgun refuse l'envoi a cause du compte

Ce n'est donc pas un bug Express ou React.

---

## Comment tester

### Backend simple

Dans le navigateur :

- `http://localhost:3000/`
- `http://localhost:3000/health`
- `http://localhost:3000/api`
- `http://localhost:3000/api-docs`

### Forgot password via Swagger

Ouvrir :

- `http://localhost:3000/api-docs`

Tester :

- `POST /auth/forgot-password`

Body :

```json
{
  "email": "maduzan.manmatharajah@gmail.com"
}
```

### Reset password via Swagger

Tester :

- `POST /auth/reset-password`

Body :

```json
{
  "token": "TOKEN_RECU_PAR_EMAIL",
  "password": "NouveauMotDePasse123"
}
```

### Frontend

Ouvrir :

- `http://localhost:5173/login`
- `http://localhost:5173/forgot-password`

---

## Resume tres simple

- `routes` : declarent les endpoints
- `controllers` : gerent la requete HTTP
- `services` : contiennent la logique metier
- `repositories` : parlent a la base
- `schema` : definit les tables
- `frontend pages` : affichent les formulaires
- `frontend services` : appellent l'API
- `Mailgun` : envoie l'email reel

Le reset password n'est donc pas "un seul fichier", mais une chaine complete entre frontend, backend, base et provider email.
