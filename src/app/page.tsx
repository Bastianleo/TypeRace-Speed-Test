import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";

const GLOBAL_STATS = [
  { label: "Tes diselesaikan", value: "2.4M+" },
  { label: "Rata-rata WPM global", value: "58" },
  { label: "Pengguna aktif", value: "180K+" },
];

const FEATURES = [
  {
    icon: "📊",
    title: "Statistik Real-time",
    desc: "WPM, akurasi, konsistensi, dan grafik live saat Anda mengetik.",
  },
  {
    icon: "🏎️",
    title: "Multiplayer Realtime",
    desc: "Balapan mengetik langsung melawan pemain lain di seluruh dunia.",
  },
  {
    icon: "🏆",
    title: "Leaderboard Global",
    desc: "Peringkat mingguan, bulanan, per negara, hingga teman.",
  },
  {
    icon: "⌨️",
    title: "Keyboard Virtual",
    desc: "Visualisasi tombol yang harus ditekan, mendukung layout TKL.",
  },
];

const SOLO_STEPS = [
  {
    step: "01",
    title: "Pilih Pengaturan",
    desc: "Pilih durasi tes (15 detik hingga 5 menit), tingkat kesulitan, dan bahasa teks yang ingin Anda latih.",
  },
  {
    step: "02",
    title: "Mulai Mengetik",
    desc: "Klik area teks atau tekan sembarang tombol untuk memulai. Timer berjalan otomatis saat karakter pertama diketik.",
  },
  {
    step: "03",
    title: "Lihat Hasil",
    desc: "Setelah waktu habis, lihat WPM, akurasi, konsistensi, dan grafik kecepatan Anda dari waktu ke waktu.",
  },
  {
    step: "04",
    title: "Simpan & Bandingkan",
    desc: "Login untuk menyimpan hasil dan melihat perkembangan Anda di leaderboard global.",
  },
];

const MULTI_STEPS = [
  {
    step: "01",
    title: "Buat atau Gabung Room",
    desc: "Klik \"Buat Room\" untuk membuat sesi baru dan bagikan kode room kepada teman. Atau masukkan kode room untuk bergabung.",
  },
  {
    step: "02",
    title: "Tunggu Semua Siap",
    desc: "Setiap pemain harus menekan tombol \"Siap\". Setelah semua siap, hitungan mundur 3 detik dimulai otomatis.",
  },
  {
    step: "03",
    title: "Balapan Mengetik",
    desc: "Ketik teks secepatnya! Progress setiap pemain terlihat secara real-time sesuai durasi yang dipilih host room.",
  },
  {
    step: "04",
    title: "Lihat Podium",
    desc: "Saat waktu habis atau semua selesai, hasil langsung muncul dengan peringkat dan statistik masing-masing pemain.",
  },
];

const TIPS = [
  { icon: "🎯", tip: "Fokus pada akurasi dulu, kecepatan akan mengikuti secara alami seiring latihan." },
  { icon: "👀", tip: "Jangan melihat keyboard — latih mata untuk selalu fokus ke teks di layar." },
  { icon: "🧘", tip: "Jaga postur tubuh dan posisi tangan yang nyaman agar bisa mengetik lebih lama." },
  { icon: "🔄", tip: "Latihan rutin 10–15 menit sehari lebih efektif daripada satu sesi panjang." },
  { icon: "📈", tip: "Gunakan mode \"Sulit\" atau \"Expert\" untuk memaksa otak beradaptasi lebih cepat." },
  { icon: "⌨️", tip: "Manfaatkan keyboard virtual untuk mengetahui jari mana yang harus menekan tombol tertentu." },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Ukur seberapa cepat Anda benar-benar mengetik
        </h1>
        <p className="max-w-xl text-balance text-muted-foreground">
          Tes kecepatan mengetik dengan statistik real-time, mode multiplayer, dan leaderboard
          global — dibangun untuk terasa cepat dan tenang, bukan ramai.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard/solo">Mulai Mengetik</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/multiplayer">Multiplayer</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard/leaderboard">Leaderboard</Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-8 px-8 py-6">
          {GLOBAL_STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="font-mono text-2xl font-semibold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-16 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-3 rounded-xl border border-border p-5 transition-colors hover:border-primary/40 hover:bg-accent/30"
          >
            <span className="text-2xl">{f.icon}</span>
            <div>
              <p className="font-medium">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Tutorial Section */}
      <section className="border-t border-border bg-muted/20 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Tutorial</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Cara Menggunakan TypeRace
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Mulai dari nol hingga bisa mengetik dengan cepat dan akurat
            </p>
          </div>

          {/* Solo Mode */}
          <div className="mb-14">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                S
              </span>
              <h3 className="text-lg font-semibold">Mode Solo — Latihan Mandiri</h3>
              <Button asChild variant="outline" size="sm" className="ml-auto hidden sm:flex">
                <Link href="/dashboard/solo">Coba Sekarang →</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SOLO_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="relative rounded-xl border border-border bg-card p-5 flex flex-col gap-2"
                >
                  <span className="font-mono text-3xl font-bold text-primary/20 leading-none">
                    {s.step}
                  </span>
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:hidden">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/solo">Coba Mode Solo →</Link>
              </Button>
            </div>
          </div>

          {/* Multiplayer Mode */}
          <div className="mb-14">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold">
                M
              </span>
              <h3 className="text-lg font-semibold">Mode Multiplayer — Balapan Bersama</h3>
              <Button asChild variant="outline" size="sm" className="ml-auto hidden sm:flex">
                <Link href="/dashboard/multiplayer">Coba Sekarang →</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MULTI_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="relative rounded-xl border border-border bg-card p-5 flex flex-col gap-2"
                >
                  <span className="font-mono text-3xl font-bold text-blue-500/20 leading-none">
                    {s.step}
                  </span>
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:hidden">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/dashboard/multiplayer">Coba Mode Multiplayer →</Link>
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div>
            <div className="mb-5 text-center">
              <h3 className="text-lg font-semibold">Tips Agar Makin Cepat</h3>
              <p className="text-sm text-muted-foreground">
                Kiat-kiat dari para pemain berpengalaman
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TIPS.map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{t.icon}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Siap mulai berlatih?</h2>
          <p className="text-sm text-muted-foreground">
            Tidak perlu daftar untuk mulai mengetik. Login untuk menyimpan progres Anda.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard/solo">Mulai Sekarang</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Daftar Gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TypeRace. Dibangun dengan Next.js.
      </footer>
    </main>
  );
}
