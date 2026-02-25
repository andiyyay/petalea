# Petaléa 🌸

Web toko bunga online — bouquet & rangkaian bunga segar.

## Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite |
| Backend | Laravel 12 (API) |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL |

## Struktur

```
petalea/
  backend/    ← Laravel 12 REST API
  frontend/   ← React 19 + Vite SPA
```

## Menjalankan lokal

**Backend**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# isi DB_* di .env, lalu:
php artisan migrate --seed
php artisan serve --port=5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Akun test

| Email | Password |
|---|---|
| test@gmail.com | 123456 |
| a@gmail.com | a |


- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
