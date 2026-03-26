# PASSWORD_RESET_MAILGUN

## Objectif

Mettre en place un flow "Mot de passe oublié" complet avec Mailgun :

1. L'utilisateur saisit son email.
2. Le backend génère un token sécurisé et l'enregistre hashé en base.
3. Le backend construit un lien `http://localhost:5173/reset-password?token=...`.
4. Mailgun envoie un vrai email contenant ce lien.
5. L'utilisateur choisit un nouveau mot de passe.
6. Le backend vérifie le token, met à jour le mot de passe et invalide le token.

## Variables d'environnement

Dans `backend/.env` :

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=change-me-in-production
REFRESH_TOKEN_SECRET=change-me-refresh-in-production
DATABASE_URL=postgresql://cineconnect:cineconnect_pwd@localhost:5432/cineconnect_db
OMDB_API_KEY=your_omdb_api_key

PASSWORD_RESET_TOKEN_TTL_MINUTES=60
PASSWORD_RESET_URL_BASE=http://localhost:5173/reset-password

EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=sandboxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.mailgun.org
MAILGUN_BASE_URL=https://api.mailgun.net
MAILGUN_FROM=Mailgun Sandbox <postmaster@sandboxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.mailgun.org>
```

## Mailgun sandbox

Si vous utilisez un domaine sandbox Mailgun, il faut autoriser les destinataires manuellement :

1. Ouvrir le dashboard Mailgun.
2. Aller dans le domaine sandbox.
3. Ouvrir la section `Authorized Recipients`.
4. Ajouter `maduzan.manmatharajah@gmail.com`.
5. Valider l'invitation reçue par email.

Sans cette validation, Mailgun refusera l'envoi avec une erreur `403 Forbidden`.

## Logs utiles

Le backend affiche :

- `[AUTH] reset token generated`
- `[AUTH] reset link generated`
- `[EMAIL:MAILGUN] Email envoyé`
- `[EMAIL:MAILGUN] Envoi échoué`
- `[AUTH] reset email dispatch result`

## Test local

1. Appliquer le schema :

```bash
cd backend
pnpm run db:push
```

2. Lancer le backend :

```bash
pnpm run dev
```

3. Lancer le frontend :

```bash
cd ../frontend
pnpm run dev
```

4. Tester l'envoi :

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"maduzan.manmatharajah@gmail.com"}'
```

Reponse attendue :

```json
{ "message": "Email envoyé" }
```

5. Ouvrir l'email recu, cliquer sur le lien de reset, puis soumettre un nouveau mot de passe.

6. Tester la mise a jour du mot de passe :

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_RECU_PAR_EMAIL","password":"nouveauMotDePasse123"}'
```

Reponse attendue :

```json
{ "message": "Mot de passe mis à jour" }
```
