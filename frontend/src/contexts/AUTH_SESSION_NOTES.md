# Auth / Session Notes

Fichier principal: `AuthContext.tsx`

## Objectif

Éviter les sessions fantômes entre utilisateurs de test.

## Règles appliquées

- Nettoyage stockage au logout
- Vérification `/auth/me` au chargement
- Synchronisation inter-onglets avec l'événement `storage`
- Possibilité de logout avec ou sans redirection:
  - `logout()`
  - `logout({ redirect: false })`

## Recommandation de test

Toujours tester `test1` et `test2` dans des navigateurs séparés.
