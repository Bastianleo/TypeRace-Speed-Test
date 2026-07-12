"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";

const COUNTRIES = [
  { flag: "🇮🇩", name: "Indonesia" },
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇯🇵", name: "Japan" },
  { flag: "🇰🇷", name: "South Korea" },
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇨🇳", name: "China" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇷🇺", name: "Russia" },
  { flag: "🌍", name: "Lainnya" },
];

type Tab = "google" | "username";

export function LoginModal() {
  const { isModalOpen, isLoading, closeModal, login } = useAuthStore();
  const [tab, setTab] = useState<Tab>("google");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]!);
  const [error, setError] = useState("");

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError("Username tidak boleh kosong."); return; }
    if (username.trim().length < 3) { setError("Username minimal 3 karakter."); return; }
    setError("");
    await login(username.trim(), email.trim(), selectedCountry.flag);
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative rounded-2xl border border-border bg-card p-8 shadow-2xl">
              {/* Close */}
              <button
                onClick={closeModal}
                aria-label="Tutup"
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                ✕
              </button>

              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                  ⌨️
                </div>
                <h2 className="text-xl font-bold tracking-tight">Masuk ke TypeRace</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Simpan progres, XP, dan statistik mengetik Anda
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex rounded-lg border border-border bg-muted/40 p-1">
                {(["google", "username"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(""); }}
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                      tab === t
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "google" ? " Google" : " Username"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === "google" ? (
                  /* ── Google Tab ── */
                  <motion.div
                    key="google"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-4"
                  >
                    <p className="text-center text-sm text-muted-foreground">
                      Masuk menggunakan akun Google Anda. Data profil dan foto akan diambil otomatis.
                    </p>

                    <button
                      onClick={handleGoogleLogin}
                      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold transition hover:bg-accent"
                    >
                      {/* Google SVG icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Lanjutkan dengan Google
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                      Membutuhkan konfigurasi{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-[10px]">GOOGLE_CLIENT_ID</code>{" "}
                      di file <code className="rounded bg-muted px-1 py-0.5 text-[10px]">.env</code>
                    </p>
                  </motion.div>
                ) : (
                  /* ── Username Tab ── */
                  <motion.form
                    key="username"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    onSubmit={handleUsernameSubmit}
                    className="flex flex-col gap-4"
                  >
                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium" htmlFor="login-username">
                        Username <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="login-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="contoh: speedtyper"
                        maxLength={32}
                        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        autoComplete="off"
                        autoFocus
                      />
                    </div>

                    {/* Email (optional) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium" htmlFor="login-email">
                        Email{" "}
                        <span className="text-xs text-muted-foreground">(opsional)</span>
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="kamu@email.com"
                        className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Country */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium">Negara</label>
                      <div className="grid grid-cols-7 gap-1">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.flag}
                            type="button"
                            title={c.name}
                            onClick={() => setSelectedCountry(c)}
                            className={`flex items-center justify-center rounded-lg border py-1.5 text-lg transition-all ${
                              selectedCountry.flag === c.flag
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-muted-foreground/40"
                            }`}
                          >
                            {c.flag}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedCountry.flag} {selectedCountry.name}
                      </p>
                    </div>

                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {error}
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      ) : (
                        " Masuk & Mulai"
                      )}
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                      Tidak perlu password — username Anda adalah identitas Anda.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}