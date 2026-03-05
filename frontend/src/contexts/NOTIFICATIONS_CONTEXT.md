# NotificationsContext

Fichier principal: `NotificationsContext.tsx`

## Rôle

Centraliser les demandes d'amis reçues (`PENDING`) pour toute l'application.

## Données exposées

- `friendRequests`
- `friendRequestsCount`
- `isLoadingFriendRequests`
- `hasFriendRequestsError`
- `friendRequestsError`
- `refreshFriendRequests()`

## Stratégie de rafraîchissement

- Fetch au montage si utilisateur connecté
- Polling toutes les 5 secondes
- Invalidation manuelle après accept/refuse
- Invalidation possible sur événement socket
