# Copilot Instructions

## Project Overview
**Petaléa** — an Indonesian flower shop/bouquet e-commerce web app. Monorepo at `github.com/andiyyay/petalea`.

```
petalea/
  backend/    ← Laravel 12 API
  frontend/   ← React 19 + Vite
  .github/
```

Work on `backend/` for API and `frontend/` for UI.

## Architecture

### Backend (`backend/`)
- **Runtime**: PHP 8.3 + Laravel 12, MySQL via Eloquent ORM
- **Database**: `florist_db` (MySQL) — credentials in `backend/.env` (`DB_*`)
- **Auth**: Laravel Sanctum — token-based. `POST /api/auth/login` returns a `plainTextToken`. Users seeded via `UserSeeder` (`test@gmail.com`/`123456`, `a@gmail.com`/`a`).
- **Products**: `GET /api/products` → `Product::all()` via `ProductController@index`
- **Structure**: `routes/api.php` → `app/Http/Controllers/` → `app/Models/`
- **CORS**: `config/cors.php`, `allowed_origins = ['*']` (dev). Change to `['http://localhost:5173']` for production.
- **Run**: `php artisan serve` (default port 8000)
- **Re-seed**: `php artisan migrate:fresh --seed`

### Frontend (`frontend/`)
- **Stack**: React 19 + Vite, **ESM** (`"type": "module"`)
- **Routing**: No React Router — `App.jsx` manages views via conditional rendering and state flags (`showLogin`, `showRegister`)
- **Auth state**: `user` object lifted to `App.jsx`, passed as props; no global state manager (no Redux/Zustand/Context)
- **API layer**: Single Axios instance at `src/services/api.js` — has `Content-Type: application/json` and `Accept: application/json` headers, `baseURL` from `VITE_API_BASE_URL` env variable. Always import this for API calls — do not use raw `axios` directly.
- **Auth**: Sanctum token stored in `localStorage` as `token` after login. Pass as `Authorization: Bearer <token>` for protected routes.
- **Pages**: Auth modals (`login.jsx`, `register.jsx`) and page components (`home.jsx`) live in `src/pages/`. UI-only components live in `src/components/`. File naming is all-lowercase (e.g. `home.jsx`, `login.jsx`).
- **Product data**: Hardcoded array in `components/catalog.jsx` — not yet fetching from the backend `/api/products` endpoint.
- **Images**: Served from `frontend/public/` and referenced as `/filename.jpeg` (e.g. `/rose_bouquet.jpeg`)

## Developer Workflows

### Run backend (Laravel)
```bash
cd backend
php artisan serve --port=5000
```

### Run frontend
```bash
cd frontend
npm install
npm run dev          # Vite dev server (default http://localhost:5173)
```

### Database setup (first time)
```bash
# 1. Create DB in MySQL
mysql -u root -e "CREATE DATABASE IF NOT EXISTS florist_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
# 2. Copy backend/.env.example → backend/.env, fill in DB_* values
# 3. Migrate + seed
cd backend && php artisan migrate --seed
```

### Re-seed from scratch
```bash
cd backend && php artisan migrate:fresh --seed
```

No `.env` is committed — copy `backend/.env.example` and fill in `DB_*` values.

## Git Workflow

**Always create a new branch before making any code changes.** Never commit directly to `main`.

- Branch naming convention:
  - `feat/<short-description>` — new features
  - `fix/<short-description>` — bug fixes
  - `refactor/<short-description>` — refactoring without behavior change
  - `chore/<short-description>` — config, deps, tooling
- Create the branch as the **first step** before editing any file:
  ```bash
  git checkout -b feat/your-feature-name
  ```
- Commit changes with a clear message, then push and open a PR to `main`.

## Key Conventions

- **Language in UI**: Indonesian (`"Email dan password wajib diisi"`, `"Login berhasil"`, etc.). Keep new UI strings in Indonesian.
- **CSS co-location**: Each component has its own `.css` file in the same directory (e.g. `login.jsx` + `login.css`). Shared/page-level styles go in `styles/`.
- **Avatar initials**: `navbar.jsx` derives initials from `user.name` — ensure any `userData` object passed to `onLoginSuccess` includes a `name` field (see `login.jsx` fallback chain: `name || username || email[0]`).
- **Backend**: PHP/Laravel — use standard Laravel conventions (`app/Http/Controllers/`, `app/Models/`, `routes/api.php`). Do not add Express/Node files to `backend/`.
- **Frontend modules**: Use `import`/`export` — do not use `require` in frontend files.
- **Case sensitivity**: `navbar.jsx` imports `"./Navbar.css"` (capital N) but the file is `navbar.css`. On case-sensitive filesystems this will break — match the actual filename casing when editing.

## Integration Points

| Frontend call | Backend endpoint | Notes |
|---|---|---|
| `api.post("/auth/login")` | `POST /api/auth/login` | Returns Sanctum `token` + `user`; token saved to `localStorage` |
| `api.post("/auth/register")` | `POST /api/auth/register` | Creates user; validates unique email; returns token + user |
| `api.get("/products")` (not yet wired) | `GET /api/products` | DB query ready; frontend catalog still uses static data |
| Protected routes | `middleware('auth:sanctum')` | Pass token as `Authorization: Bearer <token>` |

## Notable Gaps / In-Progress Areas
- `catalog.jsx` product list is static; migrating to the API requires replacing the hardcoded `products` array with a `useEffect` + `api.get("/products")`
- No logout endpoint on backend (token is only removed from `localStorage` client-side)
- No password reset / forgot password flow
