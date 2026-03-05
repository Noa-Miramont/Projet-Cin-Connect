# Discussion: synchro des demandes d'amis

Fichier principal: `Discussion.tsx`

## Changement principal

La page ne maintient plus sa propre source de vérité pour les demandes reçues.
Elle consomme le `NotificationsContext`.

## Effets

- Liste des demandes cohérente avec le badge navbar
- Mise à jour immédiate après:
  - `acceptFriendRequest`
  - `declineFriendRequest`
  - événement socket `new_friend_request` (via refresh du contexte)
