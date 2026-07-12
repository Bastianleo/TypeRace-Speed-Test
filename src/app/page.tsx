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
    title: "Statistik Real-time",
    desc: "WPM, akurasi, konsistensi, dan grafik live saat Anda mengetik.",
  },
  {
    title: "Multiplayer Realtime",
    desc: "Balapan mengetik langsung melawan pemain lain di seluruh dunia.",
  },
  {
    title: "Leaderboard Global",
    desc: "Peringkat mingguan, bulanan, per negara, hingga teman.",
  },
  {
    title: "Keyboard Virtual",
    desc: "Visualisasi tombol yang harus ditekan, mendukung layout TKL.",
  },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Ukur seberapa cepat Anda benar-benar mengetik
        </h1>
        <p className="max-w-xl text-balance text-muted-foreground">
          Tes kecepatan mengetik dengan statistik real-time, mode multiplayer, dan leaderboard
          global  dibangun untuk terasa cepat dan tenang, bukan ramai.
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

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex flex-col gap-1 rounded-lg border border-border p-4">
            <p className="font-medium">{f.title}</p>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TypeRace. Dibangun dengan Next.js.
      </footer>
    </main>
  );
}
