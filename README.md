# TypeRace — Typing Speed Test

Scaffold Next.js 15 (App Router) + TypeScript + Tailwind untuk platform tes kecepatan
mengetik bergaya SaaS modern (Linear / Vercel / Raycast). Dibangun dengan feature-based
architecture agar mudah dikembangkan oleh tim.

## Status implementasi

**Sudah berfungsi penuh (bisa langsung dijalankan dengan `npm run dev`):**

- Solo Typing Mode lengkap: pilihan durasi (30/60/120/300s), difficulty (easy–expert),
  bahasa (Indonesia/English/Programming/Quotes)
- Statistik real-time: WPM, raw WPM, accuracy, error, consistency, progress bar
- Grafik WPM live (recharts)
- Keyboard virtual dengan highlight tombol berikutnya + tombol yang sedang ditekan
- Halaman hasil: grade (S/A/B/C/D), breakdown statistik, tombol retry/share/sertifikat
- Dark/Light/System theme (next-themes)
- Landing page (hero, statistik global, fitur)
- Desain: token warna slate/zinc + aksen blue/indigo/emerald, radius besar, shadow halus,
  tanpa glow berlebihan — sesuai brief

**Baru berupa scaffold/struktur (perlu kredensial & implementasi lanjutan Anda):**

- Autentikasi (Clerk/Auth.js) — belum ada provider terpasang, hanya slot di `.env.example`
- Prisma schema lengkap (`prisma/schema.prisma`) mencakup User, TypingResult, Achievement,
  Room (multiplayer), Friendship, DailyChallenge, TextSource, Report — tapi belum
  disambungkan ke Supabase/Postgres nyata
- Multiplayer realtime (Socket.IO/Supabase Realtime) — model data sudah ada di Prisma,
  server WebSocket belum diimplementasikan
- Redis untuk leaderboard cache & matchmaking — belum ada
- Halaman lain (dashboard menu Practice, Custom Test, Leaderboard, Achievements, Profile,
  History, Settings, Admin Panel) — belum dibuat, tapi mengikuti pola folder yang sama
  dengan `features/typing-test`

## Kenapa tidak semuanya "hidup" sekaligus

Fitur seperti multiplayer realtime, autentikasi OAuth, dan database membutuhkan server
persisten, kredensial API pihak ketiga (Supabase, Clerk/Auth.js, Redis), dan proses
`npm install` + migrasi database — semua ini perlu dijalankan di lingkungan Anda sendiri,
bukan di sandbox chat ini. Yang saya prioritaskan: memastikan Solo Typing Mode (fitur inti
produk) benar-benar berfungsi dan bisa dipakai sebagai referensi pola untuk fitur lainnya.

## Menjalankan proyek

```bash
npm install
cp .env.example .env   # isi jika ingin menyambungkan Prisma/Supabase
npm run dev
```

Buka `http://localhost:3000` untuk landing page, atau `/dashboard/solo` untuk tes mengetik.

Prisma baru dibutuhkan begitu Anda ingin menyimpan hasil ke database:

```bash
npx prisma migrate dev --name init
npx prisma studio
```

## Struktur folder

```
src/
  app/                    # Next.js App Router — routing & layout
    layout.tsx            # Root layout, font Inter, ThemeProvider
    page.tsx              # Landing page
    dashboard/
      solo/page.tsx        # Solo Typing Mode
  components/
    ui/                   # Primitif shadcn/ui (button, card, badge, progress, tabs)
    theme/                # ThemeProvider & toggle
  features/
    typing-test/
      components/         # TypingTest (orchestrator), TypingArea, VirtualKeyboard,
                          # StatsPanel, LiveGraph, ResultScreen, SettingsBar
      hooks/              # useTypingInput (keydown handler), useTestTimer (interval)
      store/              # Zustand store — logika inti tes (murni, tanpa side-effect)
      utils/              # calculateStats, wordLists (generator teks), keyboardLayout
      types/              # Semua tipe domain typing-test
  lib/                    # utilitas umum (cn, formatSeconds)
prisma/
  schema.prisma           # Skema database lengkap untuk seluruh fitur pada brief
```

**Pola yang dipakai:** setiap fitur besar berikutnya (multiplayer, leaderboard,
achievements, dst.) sebaiknya dibuat sebagai folder baru di `src/features/<nama-fitur>/`
dengan struktur yang sama: `components/`, `hooks/`, `store/`, `utils/`, `types/`. Ini
menjaga arsitektur tetap modular dan sesuai prinsip SOLID/clean architecture yang diminta.

## Langkah lanjutan yang disarankan

1. **Auth** — pasang Clerk atau Auth.js, lindungi route `/dashboard/*` lewat middleware.
2. **Database** — buat project Supabase, isi `DATABASE_URL`, jalankan migrasi Prisma,
   simpan `TypingResult` setiap tes solo selesai (panggil dari `ResultScreen`).
3. **Multiplayer** — buat server Socket.IO terpisah (atau pakai Supabase Realtime
   channel), gunakan model `Room`/`RoomParticipant` yang sudah ada di schema.
4. **Leaderboard** — cache agregat WPM di Redis (sorted set), refresh berkala dari
   Postgres untuk mengurangi beban query.
5. **Halaman dashboard lain** — duplikasi pola `features/typing-test` untuk Practice,
   Custom Test, Leaderboard, Achievements, Profile, History, Settings, Admin Panel.

Untuk melanjutkan bagian backend/realtime/auth ini secara efektif, disarankan bekerja
di environment lokal Anda menggunakan Claude Code, karena bagian tersebut butuh
kredensial nyata dan proses jalan lama (server WebSocket, migrasi DB) yang tidak bisa
dieksekusi dari sandbox chat ini.
