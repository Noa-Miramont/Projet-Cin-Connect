# Dev Checkout Merge Audit

## Base retenue

- `dev-maduzan` reste la source de vérité pour le frontend critique:
  - pages film
  - profil
  - auth
  - forgot password

## Fichiers de `dev-general` qui modifiaient `dev-maduzan`

- `frontend/src/pages/Home.tsx`
- `frontend/src/pages/Discussion.tsx`
- `frontend/src/pages/Films.tsx`
- `frontend/src/services/watchlist.ts`
- `frontend/src/components/Cubes/Cubes.tsx`
- `frontend/src/components/hero_section/MagicRings.tsx`
- `frontend/package.json`

## Régressions confirmées

### Branding

Des textes visibles avaient été renommés de `Dolly Zoom` vers `CineConnect` dans:

- `frontend/src/pages/Home.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/index.html`

Correction appliquée:

- restauration du nom visible `Dolly Zoom`
- conservation des apports UI utiles de `dev-general`

### Watchlist

La watchlist était bien présente dans `dev-checkout`, mais les clés locales avaient été renommées en `cineconnect_*`, ce qui cassait la continuité attendue avec les ajouts de `dev-general`.

Fichiers réalignés:

- `frontend/src/services/watchlist.ts`
- `frontend/src/pages/Films.tsx`
- `frontend/src/pages/Discussion.tsx`

Correction appliquée:

- retour à `dollyzoom_watchlist_*`
- retour à `dollyzoom_dm_draft`

### Reviews

Le système d'avis n'a pas été supprimé du code après merge:

- UI avis toujours présente dans `frontend/src/pages/Films.tsx`
- UI avis toujours présente dans `frontend/src/pages/FilmDetail.tsx`
- service frontend inchangé dans `frontend/src/services/reviews.ts`
- tests backend existants sur les routes/services reviews

Conclusion:

- aucune restauration lourde n'était nécessaire sur `reviews`
- le comportement stable de `dev-maduzan` a été conservé

## Vérifications ajoutées

- test frontend `frontend/src/services/watchlist.test.ts`
- test frontend `frontend/src/branding.test.ts`

## Vérifications à lancer

```bash
pnpm --filter @cineconnect/frontend run test
pnpm --filter @cineconnect/frontend run build
pnpm --filter @cineconnect/backend exec jest --runInBand
pnpm --filter @cineconnect/backend run build
```
