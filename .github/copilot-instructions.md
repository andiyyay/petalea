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
- **Run**: `php artisan serve --port=5000` (keeps frontend Axios config unchanged)
- **Re-seed**: `php artisan migrate:fresh --seed`

### Frontend (`frontend/`)
- **Stack**: React 19 + Vite, **ESM** (`"type": "module"`)
- **Routing**: No React Router — `App.jsx` manages views via conditional rendering and state flags (`showLogin`, `showRegister`)
- **Auth state**: `user` object lifted to `App.jsx`, passed as props; no global state manager (no Redux/Zustand/Context)
- **API layer**: Two Axios instances both pointing to `http://localhost:5000/api`:
  - `src/api/axios.js` — bare instance
  - `src/services/api.js` — instance with `Content-Type: application/json` header
  Prefer `src/services/api.js` for new service calls; `login.jsx` currently calls Axios directly.
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
| `axios.post(".../api/auth/login")` | `POST /api/auth/login` | Returns Sanctum `plainTextToken` + `user.name` |
| `api.get(".../api/products")` (not yet wired) | `GET /api/products` | DB query ready; frontend catalog still uses static data |
| Protected routes | `middleware('auth:sanctum')` | Pass token as `Authorization: Bearer <token>` |

## Notable Gaps / In-Progress Areas
- `catalog.jsx` product list is static; migrating to the API requires replacing the hardcoded `products` array with a `useEffect` + `api.get("/products")`
- `register.jsx` has no corresponding backend endpoint
- Frontend `login.jsx` does not persist the Sanctum token (no localStorage/sessionStorage)
