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

| Script           | Description                                        |
| ---------------- | -------------------------------------------------- |
| `pnpm run dev`   | Lance frontend + backend (shared est buildé avant) |
| `pnpm run build` | Build shared puis tous les packages                |
| `pnpm run lint`  | Lint tous les packages                             |
| `pnpm run test`  | Tests dans tous les packages                       |

## Backend & Base de données

1. Créer un fichier `.env` dans `backend/` avec au minimum :
   - `DATABASE_URL=postgresql://localhost:5432/cineconnect` (ou votre URL PostgreSQL)
   - `JWT_SECRET=<secret>` (optionnel en dev)
   - `OMDB_API_KEY=c630a2cf` (clé API OMDb pour la liste des films)
   - `PORT=3000` (optionnel)

2. Créer la base et les tables avec Drizzle :

   ```bash
   cd backend && pnpm run db:push
   ```

3. Remplir les catégories et récupérer les films depuis l’API OMDb :
   ```bash
   cd backend && pnpm run seed
   ```
   Le seed crée les catégories puis interroge OMDb (recherches type « inception », « dark knight », etc.) et insère les films (titre, affiche, année, réalisateur, résumé, catégorie).

## Fonctionnalités implémentées

- **Auth** : inscription, connexion, JWT (localStorage)
- **Films** : liste avec pagination, filtres (catégorie, année, note min., recherche), détail avec note moyenne et avis
- **Avis** : ajout d’un avis (note 1–5 + commentaire) sur une fiche film (utilisateur connecté)
- **Profil** : infos utilisateur, mes avis, liste d’amis, ajout / retrait d’ami (recherche par pseudo)
- **Discussion** : chat en temps réel avec Socket.io entre amis (salles privées, messages persistés en base)
- **Swagger** : documentation des routes sous `/api-docs`
- **Tests** : Jest + Supertest sur les routes auth, films, reviews, friends, messages (nécessitent une base disponible pour les appels films/reviews)

## Développement par étapes

1. **React / UI** — Pages et composants dans `frontend/src/pages/` et `frontend/src/components/`.
2. **Shared** — Types dans `shared/src/types/`.
3. **DB** — Schéma Drizzle dans `backend/src/db/schema.ts`, migrations avec `pnpm run db:generate` / `pnpm run db:push`.
4. **Backend** — Contrôleurs, services, repositories dans `backend/src/`.
utilisateur test logins :

user name : test
email : noamiramont@gmail.com
password : test1234

user name : test2
email : noajoanps4@gmail.com
password : test1234

https://dribbble.com/tags/social-media-layout
