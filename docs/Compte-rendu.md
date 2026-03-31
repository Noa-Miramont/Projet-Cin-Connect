## Rapport technique — CinéConnect (Dolly Zoom)

### I. Introduction

Le projet **CinéConnect (nom interne “Dolly Zoom”)** est un monorepo PNPM structuré en **`frontend/` (React + Vite + TypeScript)**, **`backend/` (Node.js + Express + Drizzle + PostgreSQL + Socket.io)** et **`shared/` (types/utilitaires partagés)**. L’objectif fonctionnel correspond globalement au cahier des charges (recherche/consultation de films, avis/notes, social/amis, messagerie temps réel), mais certains choix d’implémentation **diffèrent** du document (notamment **JWT en header plutôt qu’en cookie HttpOnly**, et **Google OAuth non trouvé dans le code**).

Ce rapport décrit l’architecture réelle, les flux principaux (auth, films, social, chat), la répartition des rôles via l’historique Git et les choix techniques (avantages/limites) à partir des fichiers et commits observés.

---

### II. Architecture du projet

#### 1) Vue d’ensemble (monorepo, couches, responsabilités)

**Organisation** (racine du repo)
- **`frontend/`** : application SPA Vite/React, routing typé TanStack Router, gestion de données réseau avec React Query, intégration Socket.io client
- **`backend/`** : API REST Express + Swagger, architecture “routes → controllers → services → repositories”, persistance via Drizzle ORM sur PostgreSQL, WebSocket via Socket.io
- **`shared/`** : paquet workspace exportant des **types** (`shared/src/types/*`) consommés des deux côtés

**Principe d’interaction**
- Le frontend appelle le backend via **Axios** sur **`/api`** (proxy Vite/serveur attendu), et authentifie les routes protégées via un **Bearer token**
- Le backend expose des routes REST sous **`/api/*`**, et un serveur Socket.io attaché au même serveur HTTP, authentifié via token

#### 2) Backend : “routes / controllers / services / repositories”

Le backend sépare clairement
- **Routes** : définition des endpoints et du middleware d’auth (`jwtAuth`)  
  Exemple : `backend/src/routes/friends.ts`, `backend/src/routes/messages.ts`, `backend/src/routes/reviews.ts`
- **Controllers** : validation “HTTP-level” + mapping erreurs → codes HTTP  
  Exemple : `backend/src/controllers/auth.ts`, `friend.ts`, `message.ts`
- **Services** : logique métier (ex : vérifier relation d’amitié avant chat)  
  Exemple : `backend/src/services/message.ts`, `friend.ts`, `auth.ts`
- **Repositories** : requêtes DB Drizzle (filtres/pagination/jointures)  
  Exemple : `backend/src/repositories/film.ts`, `friend.ts`, `message.ts`, `review.ts`

L’entrée backend montre le montage du serveur + sockets
- `backend/src/index.ts` : `createServer()` puis `initSockets(httpServer)`

#### 3) Frontend : router typé + providers (React Query, auth, notifications)

Le point d’entrée frontend installe
- **QueryClient** (staleTime 1 min)
- **TanStack Router** (`routeTree.gen`)
- **AuthProvider** (gestion session côté navigateur)
- **NotificationsProvider** (demandes d’amis “globalisées”)

Fichier clé : `frontend/src/main.tsx`

---

#### 4) Analyse des flux principaux

##### A. Authentification (JWT, refresh token, stockage côté client)

**Ce que fait réellement le projet**
- Le backend émet **accessToken + refreshToken** via `/api/auth/login` et `/api/auth/register` (`backend/src/services/auth.ts`)
- Le frontend stocke **accessToken + refreshToken + user** en **localStorage/sessionStorage** (via `frontend/src/services/authStorage.ts`, utilisé par `AuthContext`)
- Les requêtes API ajoutent `Authorization: Bearer <token>` via un **interceptor Axios** (`frontend/src/services/api.ts`)
- Le backend protège les endpoints via un middleware qui lit **le header Authorization** (pas de cookie)

**Refresh**
- L’interceptor gère un 401 et tente `/api/auth/refresh` avec le refreshToken stocké (anti “double refresh” via une promesse partagée)

**Écart avec le cahier des charges**
- La contrainte “**JWT via cookies HttpOnly**” n’apparaît pas dans le code backend (aucun usage `Set-Cookie`/`HttpOnly` repéré dans `backend/src` lors de l’analyse)
- Le modèle réel est **token en storage + header**, ce qui a des implications sécurité (voir axes d’amélioration)

**Google OAuth**
- Recherche `google`/`oauth` dans le repo : **aucune implémentation confirmée** dans le code analysé

##### B. Films / OMDb / “cache”

Dans le cahier des charges, l’API OMDb devait être consommée (et un cache mentionné). Dans le code
- L’intégration OMDb existe sous forme de service `backend/src/services/omdb.ts`
- Son usage principal observable est dans la **seed DB** (`backend/src/db/seed.ts`) pour remplir la table `films` (avec catégories)

Le backend runtime sert les films depuis PostgreSQL via Drizzle (`filmRepository.findAll`, `findById`).  
On n’observe pas de **cache mémoire TTL/LRU** ni de stratégie d’invalidation. En pratique, votre “cache” est plutôt **la persistance en base** (ingestion via seed).

##### C. Social / amis (demandes, acceptation, notifications)

Le flux amis est documenté (`docs/FRIEND_REQUEST_FLOW.md`) et implémenté avec
- `POST /api/friends` (ajout par pseudo)
- `GET /api/friends/requests/received` (demandes PENDING reçues)
- `POST /api/friends/requests/:id/accept`
- `DELETE /api/friends/requests/:id`

Backend
- Table `friends` avec enum `PENDING|ACCEPTED|DECLINED` (`backend/src/db/schema.ts`)
- Sécurisation via `jwtAuth`
- Émission Socket.io `new_friend_request` vers la room utilisateur

Frontend
- Centralisation des demandes dans `frontend/src/contexts/NotificationsContext.tsx` (React Query, refetch focus)
- Affichage et actions dans `frontend/src/pages/Discussion.tsx`

##### D. Chat temps réel (Socket.io + persistance DB)

Backend Socket.io
- Authentification au handshake via token
- Rooms déterministes `chat-<sorted user ids>` pour une conversation 1-1
- Persistance DB via `messageService.send` avant d’émettre

Frontend
- Connexion socket avec `auth: { token }`
- `join_room`/`leave_room` selon l’ami sélectionné
- Historique initial via REST (`GET /api/messages?userId=...`) puis messages live via socket

---

### III. Répartition des rôles (analyse Git)

#### 1) Contributeurs et volumes

D’après `git shortlog -sne`
- **Noa-Miramont** : **23 commits**
- **MMaduzan** : **7 commits**

(Aucun autre auteur visible dans l’historique local analysé)

#### 2) Nature des contributions et zones modifiées

**MMaduzan**
- Orientation forte **auth / sécurité session / tests / mot de passe & reset password**
- Commits typiques : `feat(auth)`, `test`, correctifs session/401
- Fichiers touchés (exemples) : `backend/src/services/auth.ts`, `backend/src/middlewares/jwt.ts`, `backend/src/services/email.ts`, `backend/src/__tests__/*`, et côté front `AuthContext`, `api.ts`, `authStorage`

**Déduction raisonnable**
- Rôle majeur sur **auth access/refresh**, **robustesse session**, **tests backend**, **password policy / reset**

**Noa-Miramont**
- Dominante **frontend/UI/UX** et intégration globale, plus corrections backend ponctuelles
- Commits typiques : refontes pages home/film/profil, composants UI, watchlist, intégration monorepo et docker
- Fichiers touchés (exemples) : pages React, composants Navbar/wall_of_movies, styles Tailwind, scripts racine, docs, et quelques fichiers backend (wiring, fixes reviews)

**Déduction raisonnable**
- Rôle majeur sur **UI/pages/composants**, **expérience utilisateur**, **intégration monorepo** et features visibles

#### 3) Points à noter sur la collaboration Git
- Messages de commits hétérogènes (descriptifs libres vs `feat/fix/test`)
- Merges de branches indiquant une organisation par features mais une discipline de message non uniforme

---

### IV. Choix techniques

#### React + Vite
- **Rôle** : SPA, dev rapide, bundling moderne
- **Pertinent** : itérations UI rapides, stack pédagogique
- **Avantages** : vitesse, DX, écosystème
- **Limites** : SEO/SSR non adressés (hors scope)

#### TanStack Router
- **Rôle** : routing typé
- **Pertinent** : objectif pédagogique explicite
- **Avantages** : typesafety, structure, devtools
- **Limites** : courbe d’apprentissage et dépendance à la génération

#### React Query
- **Rôle** : gestion des requêtes, cache, invalidation
- **Pertinent** : écrans dynamiques (amis/messages/films)
- **Avantages** : simplifie l’état réseau, cohérence des refresh
- **Limites** : nécessite discipline sur `queryKey` et invalidations

#### Express
- **Rôle** : API REST + middleware + Swagger
- **Pertinent** : MVP clair, rapide à livrer
- **Avantages** : simple, flexible
- **Limites** : conventions à maintenir pour éviter l’entropie

#### Drizzle ORM + PostgreSQL
- **Rôle** : modèle relationnel (users, friends, messages, reviews, films)
- **Pertinent** : relations et intégrité
- **Avantages** : typage TS, requêtes explicites, bon compromis
- **Limites** : certaines logiques (ex filtre rating) mériteraient un calcul SQL plus direct à l’échelle

#### JWT (implémentation actuelle) : Bearer token + refresh token
- **Rôle** : auth API + socket
- **Avantages** : standard, stateless, facile avec Socket.io
- **Limites / sécurité** : tokens en storage exposent au XSS  
  Le cahier des charges demandait plutôt **cookie HttpOnly**, non observé dans l’implémentation

#### Socket.io
- **Rôle** : chat temps réel + notifications
- **Avantages** : rooms, reconnexion, simplicité
- **Limites** : scalabilité multi-instances à prévoir si besoin (adapter, sticky sessions)

#### OMDb API
- **Rôle** : bootstrap catalogue (seed)
- **Avantages** : dataset rapide
- **Limites** : pas de cache TTL observé, clé fallback en dur dans `omdb.ts` (à éviter en prod)

---

### V. Conclusion

#### Points forts
- Architecture backend claire (routes/controllers/services/repositories)
- Flux social + chat cohérents : amitié requise pour discuter, persistance DB
- Swagger + docs + tests backend, bonne maturité pour un projet étudiant
- Bon couplage React Query + contexts pour synchronisation UI

#### Axes d’amélioration (priorisés)
1) Aligner l’auth sur le cahier des charges : **cookie HttpOnly** ou durcissement XSS (CSP, audit)
2) Clarifier “Google OAuth” : **non trouvé** dans le code analysé
3) Formaliser OMDb/cache : seed = ingestion, ou ajouter une stratégie TTL/invalidation si requis
4) Optimiser certaines requêtes DB si volumétrie augmente (agrégats côté SQL)
5) Uniformiser la convention de commits et lier features à des issues