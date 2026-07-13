# TypeRace Speed Test

TypeRace Speed Test adalah aplikasi tes kecepatan mengetik yang dibuat menggunakan Next.js, TypeScript, Prisma, dan PostgreSQL.

## Persyaratan

Pastikan sudah menginstal:

* Node.js
* npm
* Git

## Clone Repository

```bash
git clone https://github.com/Bastianleo/TypeRace-Speed-Test.git
cd typing-speed-test
```

## Install Dependency

```bash
npm install
```

## Konfigurasi Environment

Buat file `.env` di root project dan tambahkan koneksi database.

Contoh:

```env
DATABASE_URL="postgresql://username:password@host:5432/database"
```

## Setup Database

Generate Prisma Client:

```bash
npx prisma generate
```

Sinkronkan schema ke database:

```bash
npx prisma db push
```

## Menjalankan Project

```bash
npm run dev
```

Buka browser dan akses:

```
http://localhost:3000
```

## Build Production

```bash
npm run build
npm start
```

## Struktur Folder

```text
app/
components/
prisma/
public/
.env
package.json
README.md
```


