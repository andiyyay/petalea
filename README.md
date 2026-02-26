# Petaléa 🌸

Web toko bunga online — bouquet & rangkaian bunga segar.

## Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite + React Router v6 |
| Backend | Laravel 12 (REST API) |
| Auth | Laravel Sanctum (token-based) |
| Database | MySQL |
| Payment | Xendit (Invoice/Virtual Account) |

## Struktur

```
petalea/
  backend/    ← Laravel 12 REST API
  frontend/   ← React 19 + Vite SPA
```

## Setup Lokal

### 1. Clone repo

```bash
git clone https://github.com/andiyyay/petalea.git
cd petalea
```

### 2. Backend (Laravel)

```bash
cd backend
composer install

# Salin dan isi environment
cp .env.example .env
php artisan key:generate
```

Isi variabel berikut di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=florist_db
DB_USERNAME=root
DB_PASSWORD=your_password

XENDIT_SECRET_KEY=xnd_development_...
XENDIT_WEBHOOK_TOKEN=your_webhook_token
```

Buat database, lalu jalankan migrasi:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS florist_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Akun test

| Email | Password | Role |
|---|---|---|
| admin@petalea.com | password | admin |
| customer@petalea.com | password | customer |

## API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/register` | - | Daftar akun baru |
| POST | `/api/auth/login` | - | Login, returns Sanctum token |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/products` | - | Daftar produk |
| GET | `/api/categories` | - | Daftar kategori |
| GET | `/api/cart` | ✅ | Isi cart customer |
| POST | `/api/cart` | ✅ | Tambah item ke cart |
| DELETE | `/api/cart/{id}` | ✅ | Hapus item dari cart |
| POST | `/api/orders` | ✅ | Buat order dari cart |
| GET | `/api/orders` | ✅ | Riwayat order customer |
| GET | `/api/orders/{id}` | ✅ | Detail order |
| POST | `/api/payments/{orderId}` | ✅ | Generate Xendit invoice |
| POST | `/api/webhook/xendit` | - | Xendit webhook callback |
| GET | `/api/admin/dashboard` | Admin | Ringkasan pesanan |
| GET | `/api/admin/orders` | Admin | Semua order |
| PATCH | `/api/admin/orders/{id}/status` | Admin | Update status order |
| GET | `/api/admin/products` | Admin | Kelola produk |
| POST | `/api/admin/products` | Admin | Tambah produk |
| PUT | `/api/admin/products/{id}` | Admin | Edit produk |
| DELETE | `/api/admin/products/{id}` | Admin | Hapus produk |
| GET | `/api/admin/categories` | Admin | Kelola kategori |
| POST | `/api/admin/categories` | Admin | Tambah kategori |
| PUT | `/api/admin/categories/{id}` | Admin | Edit kategori |
| DELETE | `/api/admin/categories/{id}` | Admin | Hapus kategori |

## Branching Strategy

- `feat/` — fitur baru
- `chore/` — setup, config, tooling
- `fix/` — perbaikan bug
- `refactor/` — restrukturisasi kode
- `db/` — perubahan database (migration, seeder)
