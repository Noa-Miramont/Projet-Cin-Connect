# Politique de mot de passe sécurisée

## Objectif

Le backend impose maintenant une politique de mot de passe forte pour :

- la création de compte
- le reset password

Les validations sont faites côté serveur, avant le hash `bcrypt`.

## Règles appliquées

Le mot de passe doit contenir :

- au moins 8 caractères
- au moins une lettre minuscule
- au moins une lettre majuscule
- au moins un chiffre
- au moins un caractère spécial

Exemple valide :

```txt
Password123!
```

Exemple invalide :

```txt
password123
```

## Fichiers modifiés

- `backend/src/utils/password.ts`
- `backend/src/services/auth.ts`
- `backend/src/controllers/auth.ts`
- `backend/src/routes/auth.ts`
- `frontend/src/lib/password.ts`
- `frontend/src/components/PasswordRequirements.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/pages/ResetPassword.tsx`

## Nouvelle fonction de validation

Le fichier `backend/src/utils/password.ts` contient la logique réutilisable :

```ts
const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:'"\\|,.<>/?`~]).{8,}$/

export function isStrongPassword(password: string) {
  return PASSWORD_POLICY_REGEX.test(password)
}
```

La fonction retourne :

- `true` si le mot de passe respecte les règles
- `false` sinon

Le message centralisé renvoyé au frontend est :

```json
{
  "message": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
}
```

## Affichage dynamique côté frontend

Le frontend affiche maintenant les règles du mot de passe en temps réel sous le champ de saisie.

Les fichiers concernés sont :

- `frontend/src/lib/password.ts`
- `frontend/src/components/PasswordRequirements.tsx`
- `frontend/src/pages/Register.tsx`
- `frontend/src/pages/ResetPassword.tsx`

### Utilitaire frontend

Le fichier `frontend/src/lib/password.ts` contient la même logique métier, mais pour l'affichage et le verrouillage du bouton côté client.

Fonctions utilisées :

- `getPasswordRequirementStatus(password)`
- `isStrongPassword(password)`

### Composant réutilisable

Le composant `PasswordRequirements` affiche chaque règle avec un état visuel :

- rouge si la règle n'est pas respectée
- vert si la règle est respectée
- mise à jour immédiate à chaque frappe

Exemple d'utilisation :

```tsx
<PasswordRequirements password={password} />
```

### Pages intégrées

Le composant est branché dans :

- la page d'inscription
- la page de reset password

Dans ces deux pages :

- les règles s'affichent sous le champ mot de passe
- le bouton est désactivé tant que le mot de passe n'est pas conforme
- la confirmation du mot de passe doit aussi correspondre

### Correctif d'integration

Une erreur runtime a aussi ete corrigee dans `frontend/src/pages/Register.tsx` :

```txt
Cannot access 'mutation' before initialization
```

Cause :

- `isSubmitDisabled` utilisait `mutation.isPending`
- mais `mutation` etait declare plus bas dans le composant

Correction appliquee :

- le `useMutation(...)` est maintenant declare avant le calcul de `isSubmitDisabled`

Effet :

- la page `/register` se charge normalement
- les conditions de mot de passe s'affichent bien
- le bouton d'inscription reste pilote par `mutation.isPending` sans crash

## Routes concernées

### `POST /api/auth/register`

La route vérifie maintenant :

- email présent
- pseudo présent
- mot de passe présent
- mot de passe conforme à la politique

Si tout est valide :

1. le mot de passe est hashé avec `bcrypt`
2. l'utilisateur est créé en base
3. les tokens JWT sont générés

### `POST /api/auth/signup`

Un alias `signup` a été ajouté. Il appelle exactement le même controller que `register`.

Cela permet de supporter les deux conventions :

- `/register`
- `/signup`

### `POST /api/auth/reset-password`

La route vérifie maintenant :

- token présent
- nouveau mot de passe présent
- nouveau mot de passe conforme à la politique

Si la validation passe :

1. le token est vérifié
2. le nouveau mot de passe est hashé avec `bcrypt`
3. le mot de passe est mis à jour en base
4. le token est invalidé

## Sécurité

La sécurité est assurée à deux niveaux :

### Validation

Le backend refuse les mots de passe trop faibles avant toute écriture en base.

### Hashage

Le backend continue d'utiliser `bcrypt` dans `backend/src/services/auth.ts` :

```ts
const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS)
```

et pour le reset :

```ts
const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)
```

Le mot de passe brut n'est jamais stocké.

## Réponses JSON attendues

### Mot de passe faible à l'inscription

```json
{
  "message": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
}
```

### Mot de passe faible au reset

```json
{
  "message": "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
}
```

### Mot de passe valide

```json
{
  "message": "Mot de passe mis à jour"
}
```

## Expérience utilisateur finale

Le fonctionnement complet est maintenant le suivant :

1. l'utilisateur tape son mot de passe
2. le frontend affiche les règles en direct
3. le bouton reste désactivé tant que les conditions ne sont pas remplies
4. au submit, le backend revalide la sécurité du mot de passe
5. si le mot de passe est valide, il est hashé avec `bcrypt`

Cela permet :

- une meilleure guidance utilisateur
- moins d'erreurs de soumission
- une sécurité conservée côté serveur

## Logs ajoutés

Le backend logue les refus liés aux mots de passe faibles :

- `register rejected: weak password`
- `reset-password rejected: weak password`

Ces logs servent au debug local sans exposer le mot de passe brut.
