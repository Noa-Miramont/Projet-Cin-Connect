# CinéConnect

Mono-repo full stack JavaScript (React + Express) pour la plateforme CinéConnect.

## Structure

- **frontend** — React + Vite + TypeScript, TanStack Router, TailwindCSS, React Query
- **backend** — Node.js + Express + TypeScript, JWT, Socket.io, Swagger, Drizzle
- **shared** — Types TypeScript partagés (User, Film, Review, Message)
- **docs** — Documentation

## Prérequis

- Node.js >= 18
- pnpm 9

## Installation

```bash
pnpm install
```

## Premier lancement

1. Builder le package shared (nécessaire pour frontend et backend) :

```bash
pnpm --filter @cineconnect/shared run build
```

2. Lancer le projet :

```bash
# Backend et frontend en parallèle (depuis la racine)
pnpm run dev
```

Ou lancer séparément :

```bash
pnpm run dev:frontend   # http://localhost:5173
pnpm run dev:backend    # http://localhost:3000
```

- **Frontend** : http://localhost:5173  
- **API** : http://localhost:3000  
- **Swagger** : http://localhost:3000/api-docs  

## Scripts racine

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Lance frontend + backend (shared est buildé avant) |
| `pnpm run build` | Build shared puis tous les packages |
| `pnpm run lint` | Lint tous les packages |
| `pnpm run test` | Tests dans tous les packages |

## Backend

- Créer un fichier `.env` à la racine de `backend/` à partir de `backend/.env.example`.
- Variables utiles : `PORT`, `JWT_SECRET`, `DATABASE_URL`.

## Développement par étapes

1. **React / UI** — Développer les pages et composants dans `frontend/`.
2. **Shared** — Enrichir les types dans `shared/` si besoin.
3. **DB** — Schémas et migrations Drizzle dans `backend/src/db/`.
4. **Backend** — Routes, contrôleurs, services dans `backend/src/`.
