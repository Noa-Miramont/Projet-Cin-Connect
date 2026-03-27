# Friend Request Flow

Ce document résume le flux des demandes d'amis dans le projet.

## Backend

- Route d'envoi: `POST /api/friends`
- Route de lecture (demandes reçues): `GET /api/friends/requests/received`
- Vérification JWT: `backend/src/middlewares/jwt.ts`
- Statut utilisé: `PENDING` (enum DB)

## Frontend

- Source globale des demandes: `frontend/src/contexts/NotificationsContext.tsx`
- Affichage liste + actions: `frontend/src/pages/Discussion.tsx`
- Badge global dans header: `frontend/src/components/Navbar.tsx`

## Points de debug

- Activer logs backend:
  - `FRIEND_FLOW_DEBUG=1 pnpm run dev`
- Vérifier session active dans le navigateur:
  - `localStorage.getItem('dollyzoom_user')`
- Éviter les sessions mélangées:
  - Utiliser 2 navigateurs différents (ou normal + incognito)
