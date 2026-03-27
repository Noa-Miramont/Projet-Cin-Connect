# Correction de la boucle de requêtes sur le profil

## Problème observé

En ouvrant la page profil, le backend recevait des requêtes en continu :

- `GET /api/friends/requests/received`
- `GET /api/users/me/reviews`

Cela donnait l'impression que l'application "s'actualisait à l'infini".

## Cause du problème

Deux comportements se cumulaient :

1. Dans `frontend/src/contexts/NotificationsContext.tsx`, la requête des demandes d'amis utilisait :

```ts
refetchInterval: user ? 2000 : false
```

Ce paramètre relançait automatiquement la requête toutes les 2 secondes tant que l'utilisateur était connecté.

2. Dans `frontend/src/pages/Profil.tsx`, un `useEffect` invalidait les reviews et relançait les demandes d'amis :

```ts
useEffect(() => {
  if (!user) return
  void queryClient.invalidateQueries({
    queryKey: ['users', 'me', 'reviews', user.id]
  })
  void refreshFriendRequests()
}, [queryClient, refreshFriendRequests, user])
```

Le problème venait du fait que `refreshFriendRequests` n'était pas stable. La fonction était recréée à chaque render dans le contexte, ce qui faisait rerun le `useEffect`, puis réinvalidation, puis nouvelle requête, puis nouveau render, etc.

## Fichiers modifiés

- `frontend/src/contexts/NotificationsContext.tsx`
- `frontend/src/pages/Profil.tsx`

## Modifications appliquées

### 1. Stabilisation de `refreshFriendRequests`

Dans `NotificationsContext.tsx` :

- ajout de `useCallback`
- ajout d'une `queryKey` mémorisée avec `useMemo`
- `refreshFriendRequests` utilise maintenant une référence stable

Avant :

```ts
refreshFriendRequests: async () => {
  await queryClient.invalidateQueries({
    queryKey: ['friends', 'requests', 'received', user?.id]
  })
}
```

Après :

```ts
const friendRequestsQueryKey = useMemo(
  () => ['friends', 'requests', 'received', user?.id] as const,
  [user?.id]
)

const refreshFriendRequests = useCallback(async () => {
  await queryClient.invalidateQueries({
    queryKey: friendRequestsQueryKey
  })
}, [friendRequestsQueryKey, queryClient])
```

## 2. Suppression du polling automatique

Dans `NotificationsContext.tsx`, la ligne suivante a été supprimée :

```ts
refetchInterval: user ? 2000 : false
```

Effet :

- la requête `/api/friends/requests/received` ne tourne plus toutes les 2 secondes
- les demandes d'amis sont maintenant rafraîchies seulement quand c'est nécessaire

## 3. Suppression de l'effet qui relançait les reviews en boucle

Dans `Profil.tsx`, cet effet a été supprimé :

```ts
useEffect(() => {
  if (!user) return
  void queryClient.invalidateQueries({
    queryKey: ['users', 'me', 'reviews', user.id]
  })
  void refreshFriendRequests()
}, [queryClient, refreshFriendRequests, user])
```

Effet :

- `/api/users/me/reviews` ne reboucle plus
- les reviews sont chargées normalement via `useQuery`

## 4. Suppression des doubles refresh après mutation

Dans `Profil.tsx`, après `addFriend`, `acceptFriendRequest` et `declineFriendRequest`, il y avait à la fois :

- `queryClient.invalidateQueries(...)`
- `refreshFriendRequests()`

Cela faisait deux rafraîchissements pour la même donnée. Le code a été simplifié pour ne garder qu'une seule invalidation.

## Comportement après correction

Les requêtes sont maintenant relancées uniquement :

- au chargement initial de la page
- au focus de la fenêtre
- après une action utilisateur liée aux amis
- quand l'utilisateur clique sur le bouton `Actualiser`

## Vérification effectuée

Build frontend exécuté avec succès :

```bash
cd frontend
pnpm run build
```

Résultat :

- build OK
- aucun blocage de compilation
- warning existant sur `routeTree.gen.ts`, sans lien avec cette correction

## Résultat attendu

Après cette correction :

- plus de rafraîchissement infini sur la page profil
- moins de bruit dans les logs backend
- moins d'appels réseau inutiles
- comportement plus stable côté React Query
