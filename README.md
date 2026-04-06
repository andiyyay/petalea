# Petaléa

Petaléa adalah monorepo toko bunga yang berisi frontend React + Vite dan backend Laravel 12.

## Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Axios |
| Backend | Laravel 12, Laravel Sanctum |
| Database | MySQL |
| Payment | Xendit PHP SDK |

## Struktur Repo

```text
petalea/
├── backend/
├── frontend/
```

## Prasyarat

- PHP 8.2+
- Composer
- Node.js dan npm
- MySQL
- Akun Xendit sandbox jika ingin menguji flow pembayaran end-to-end

## Setup Backend

Masuk ke folder backend lalu install dependency PHP:

```bash
cd backend
composer install
```

Salin file environment:

```bash
cp .env.example .env
```

Atur koneksi database di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=florist_db
DB_USERNAME=root
DB_PASSWORD=

XENDIT_SECRET_KEY=xnd_development_...
XENDIT_WEBHOOK_TOKEN=your_webhook_token
XENDIT_ENV=sandbox
XENDIT_SUCCESS_REDIRECT_URL=http://localhost:5173/payment/success
XENDIT_FAILURE_REDIRECT_URL=http://localhost:5173/payment/failed
```

Buat app key, siapkan database, lalu jalankan migrasi, seeder, dan storage link:

```bash
php artisan key:generate
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS florist_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate --seed
php artisan storage:link
```

Jalankan server Laravel:

```bash
php artisan serve
```

Backend akan aktif di `http://localhost:8000`.

Jika kamu juga ingin menjalankan tooling frontend bawaan Laravel di folder backend, install dependency JS backend lalu jalankan:

```bash
npm install
composer run dev
```

## Setup Frontend

Masuk ke folder frontend:

```bash
cd frontend
npm install
cp .env.example .env
```

Isi `.env` frontend:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Jalankan frontend:

```bash
npm run dev
```

Frontend akan aktif di `http://localhost:5173`.

## Akun Seed

Setelah menjalankan `php artisan migrate --seed`, akun berikut akan tersedia:

| Role | Email | Password |
|---|---|---|
| User | `test@gmail.com` | `123456` |
| Admin | `a@gmail.com` | `a` |

## Endpoint API yang Tersedia

### Public

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/auth/register` | - | Registrasi user baru |
| POST | `/api/auth/login` | - | Login dan menghasilkan token Sanctum |
| GET | `/api/products` | - | Mengambil semua produk |
| POST | `/api/payment/webhook` | - | Webhook callback dari Xendit |

### Authenticated User

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/user` | Bearer token | Mengambil user yang sedang login |
| GET | `/api/payment/methods` | Bearer token | Mengambil daftar metode pembayaran |
| POST | `/api/payment/create` | Bearer token | Membuat order dan invoice Xendit |
| GET | `/api/payment/{id}/status` | Bearer token | Mengecek status pembayaran |
| GET | `/api/orders` | Bearer token | Riwayat pesanan user |
| GET | `/api/orders/active` | Bearer token | Pesanan aktif user |
| GET | `/api/orders/{id}` | Bearer token | Detail pesanan user |
| POST | `/api/orders` | Bearer token | Membuat order manual |
| POST | `/api/orders/{id}/cancel` | Bearer token | Membatalkan order user |

### Admin

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/admin/products` | Admin bearer token | Daftar produk untuk admin |
| POST | `/api/admin/products` | Admin bearer token | Tambah produk |
| GET | `/api/admin/products/{id}` | Admin bearer token | Detail produk |
| PUT | `/api/admin/products/{id}` | Admin bearer token | Update produk |
| DELETE | `/api/admin/products/{id}` | Admin bearer token | Hapus produk |
| GET | `/api/admin/orders` | Admin bearer token | Daftar semua pesanan |
| GET | `/api/admin/orders/{id}` | Admin bearer token | Detail pesanan |
| PUT | `/api/admin/orders/{id}/status` | Admin bearer token | Update status generik |
| PUT | `/api/admin/orders/{id}/process` | Admin bearer token | Ubah ke `PROCESSED` |
| PUT | `/api/admin/orders/{id}/ready` | Admin bearer token | Ubah ke `READY_FOR_PICKUP` |
| PUT | `/api/admin/orders/{id}/complete` | Admin bearer token | Ubah ke `COMPLETED` |
| PUT | `/api/admin/orders/{id}/cancel` | Admin bearer token | Batalkan pesanan |

Contoh header untuk endpoint yang butuh auth:

```http
Authorization: Bearer <token>
Accept: application/json
```

## Flow Lokal Singkat

1. Jalankan backend di `http://localhost:8000`.
2. Jalankan frontend di `http://localhost:5173`.
3. Login dengan akun user atau admin.
4. User bisa menambah produk ke cart lalu checkout.
5. Admin bisa membuka admin panel dari menu profil.

## Catatan Penting

- Frontend akan error saat startup jika `VITE_API_BASE_URL` belum diisi.
- Backend memakai session, cache, dan queue berbasis database, jadi migrasi wajib dijalankan.
- `php artisan storage:link` diperlukan untuk fitur upload gambar produk dari admin panel.
- Untuk menguji webhook Xendit secara lokal, endpoint `/api/payment/webhook` perlu bisa diakses dari internet melalui tunnel seperti ngrok atau sejenisnya.
- Redirect URL Xendit di `.env.example` masih perlu disesuaikan jika flow redirect frontend berubah, karena frontend saat ini masih berbasis modal dan bukan route penuh.
- `backend/package.json` dipakai untuk asset bawaan Laravel dan helper `composer run dev`, tetapi API utama tetap bisa berjalan hanya dengan `php artisan serve`.

## Perintah yang Sering Dipakai

### Backend

```bash
composer test
php artisan serve
php artisan migrate --seed
php artisan storage:link
composer run dev
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
```
