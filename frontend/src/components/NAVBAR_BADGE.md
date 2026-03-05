# Navbar Badge (Demandes d'amis)

Fichier principal: `Navbar.tsx`

## Comportement

- Le lien `Discussion` affiche un badge rouge.
- Le nombre affiché correspond à `friendRequestsCount` du `NotificationsContext`.
- Le badge est global (visible sur toutes les pages où la navbar est rendue).

## Pourquoi

Permettre à l'utilisateur de voir immédiatement les demandes d'amis, sans devoir aller d'abord sur la page Discussion.
