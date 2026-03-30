# Base de données PostgreSQL avec Docker et Drizzle

## Organisation

- **PostgreSQL** : tourne dans un conteneur Docker (défini à la racine du projet dans `docker-compose.yml`).
- **Drizzle** : ORM + schéma dans `src/db/schema.ts`, config dans `drizzle.config.ts`. Pas de dossiers de migrations pour l’instant : le schéma est appliqué avec `db:push`.

## Prérequis

- Docker (Desktop) installé et lancé.
- Fichier `backend/.env` avec une `DATABASE_URL` alignée sur le `docker-compose.yml` (voir `.env.example`).

## Workflow

### 1. Démarrer PostgreSQL

À la **racine du projet** (Dolly Zoom) :

```bash
docker compose up -d
```

La base `dollyzoom_db` est créée avec l’utilisateur `dollyzoom` / mot de passe `dollyzoom_pwd` sur le port `5432`.

### 2. Appliquer le schéma (Drizzle)

Dans `backend/` :

```bash
pnpm run db:push
```

Cela synchronise les tables (users, categories, films, reviews, friends, messages) avec la base.

### 3. (Optionnel) Données de test

```bash
pnpm run seed
```

Insère des catégories et des films (via l’API OMDb). Pense à définir `OMDB_API_KEY` dans `.env`.

### 4. Lancer le backend

```bash
pnpm run dev
```

Le serveur utilise `DATABASE_URL` du `.env` pour se connecter au Postgres du conteneur.

### 5. Arrêter la base

À la racine du projet :

```bash
docker compose down
```

Avec `docker compose down -v` tu supprimes aussi le volume (données effacées).

## Fichiers importants

| Fichier | Rôle |
|--------|------|
| `../docker-compose.yml` | Service Postgres (image, credentials, port, volume) |
| `backend/.env` | `DATABASE_URL` (et autres variables) pour l’app et Drizzle |
| `drizzle.config.ts` | Config Drizzle Kit (schéma, dialect postgresql, `DATABASE_URL`) |
| `src/db/index.ts` | Pool `pg` + instance `drizzle` avec le schéma |
| `src/db/schema.ts` | Définition des tables et relations |

## Commandes utiles

- `pnpm run db:push` — applique le schéma Drizzle à la base (sans migrations).
- `pnpm run db:generate` — génère des migrations (si tu passes en mode migrations plus tard).
- `pnpm run seed` — exécute `src/db/seed.ts`.
