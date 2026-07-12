"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";

const COUNTRIES = [
  { flag: "🇦🇫", name: "Afghanistan" },
  { flag: "🇦🇱", name: "Albania" },
  { flag: "🇩🇿", name: "Algeria" },
  { flag: "🇦🇩", name: "Andorra" },
  { flag: "🇦🇴", name: "Angola" },
  { flag: "🇦🇬", name: "Antigua & Barbuda" },
  { flag: "🇦🇷", name: "Argentina" },
  { flag: "🇦🇲", name: "Armenia" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇦🇹", name: "Austria" },
  { flag: "🇦🇿", name: "Azerbaijan" },
  { flag: "🇧🇸", name: "Bahamas" },
  { flag: "🇧🇭", name: "Bahrain" },
  { flag: "🇧🇩", name: "Bangladesh" },
  { flag: "🇧🇧", name: "Barbados" },
  { flag: "🇧🇾", name: "Belarus" },
  { flag: "🇧🇪", name: "Belgium" },
  { flag: "🇧🇿", name: "Belize" },
  { flag: "🇧🇯", name: "Benin" },
  { flag: "🇧🇹", name: "Bhutan" },
  { flag: "🇧🇴", name: "Bolivia" },
  { flag: "🇧🇦", name: "Bosnia & Herzegovina" },
  { flag: "🇧🇼", name: "Botswana" },
  { flag: "🇧🇷", name: "Brazil" },
  { flag: "🇧🇳", name: "Brunei" },
  { flag: "🇧🇬", name: "Bulgaria" },
  { flag: "🇧🇫", name: "Burkina Faso" },
  { flag: "🇧🇮", name: "Burundi" },
  { flag: "🇨🇻", name: "Cabo Verde" },
  { flag: "🇰🇭", name: "Cambodia" },
  { flag: "🇨🇲", name: "Cameroon" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇨🇫", name: "Central African Republic" },
  { flag: "🇹🇩", name: "Chad" },
  { flag: "🇨🇱", name: "Chile" },
  { flag: "🇨🇳", name: "China" },
  { flag: "🇨🇴", name: "Colombia" },
  { flag: "🇰🇲", name: "Comoros" },
  { flag: "🇨🇬", name: "Congo" },
  { flag: "🇨🇷", name: "Costa Rica" },
  { flag: "🇭🇷", name: "Croatia" },
  { flag: "🇨🇺", name: "Cuba" },
  { flag: "🇨🇾", name: "Cyprus" },
  { flag: "🇨🇿", name: "Czech Republic" },
  { flag: "🇩🇰", name: "Denmark" },
  { flag: "🇩🇯", name: "Djibouti" },
  { flag: "🇩🇲", name: "Dominica" },
  { flag: "🇩🇴", name: "Dominican Republic" },
  { flag: "🇪🇨", name: "Ecuador" },
  { flag: "🇪🇬", name: "Egypt" },
  { flag: "🇸🇻", name: "El Salvador" },
  { flag: "🇬🇶", name: "Equatorial Guinea" },
  { flag: "🇪🇷", name: "Eritrea" },
  { flag: "🇪🇪", name: "Estonia" },
  { flag: "🇸🇿", name: "Eswatini" },
  { flag: "🇪🇹", name: "Ethiopia" },
  { flag: "🇫🇯", name: "Fiji" },
  { flag: "🇫🇮", name: "Finland" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇬🇦", name: "Gabon" },
  { flag: "🇬🇲", name: "Gambia" },
  { flag: "🇬🇪", name: "Georgia" },
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇬🇭", name: "Ghana" },
  { flag: "🇬🇷", name: "Greece" },
  { flag: "🇬🇩", name: "Grenada" },
  { flag: "🇬🇹", name: "Guatemala" },
  { flag: "🇬🇳", name: "Guinea" },
  { flag: "🇬🇼", name: "Guinea-Bissau" },
  { flag: "🇬🇾", name: "Guyana" },
  { flag: "🇭🇹", name: "Haiti" },
  { flag: "🇭🇳", name: "Honduras" },
  { flag: "🇭🇺", name: "Hungary" },
  { flag: "🇮🇸", name: "Iceland" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇮🇩", name: "Indonesia" },
  { flag: "🇮🇷", name: "Iran" },
  { flag: "🇮🇶", name: "Iraq" },
  { flag: "🇮🇪", name: "Ireland" },
  { flag: "🇮🇱", name: "Israel" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🇯🇲", name: "Jamaica" },
  { flag: "🇯🇵", name: "Japan" },
  { flag: "🇯🇴", name: "Jordan" },
  { flag: "🇰🇿", name: "Kazakhstan" },
  { flag: "🇰🇪", name: "Kenya" },
  { flag: "🇰🇮", name: "Kiribati" },
  { flag: "🇰🇼", name: "Kuwait" },
  { flag: "🇰🇬", name: "Kyrgyzstan" },
  { flag: "🇱🇦", name: "Laos" },
  { flag: "🇱🇻", name: "Latvia" },
  { flag: "🇱🇧", name: "Lebanon" },
  { flag: "🇱🇸", name: "Lesotho" },
  { flag: "🇱🇷", name: "Liberia" },
  { flag: "🇱🇾", name: "Libya" },
  { flag: "🇱🇮", name: "Liechtenstein" },
  { flag: "🇱🇹", name: "Lithuania" },
  { flag: "🇱🇺", name: "Luxembourg" },
  { flag: "🇲🇬", name: "Madagascar" },
  { flag: "🇲🇼", name: "Malawi" },
  { flag: "🇲🇾", name: "Malaysia" },
  { flag: "🇲🇻", name: "Maldives" },
  { flag: "🇲🇱", name: "Mali" },
  { flag: "🇲🇹", name: "Malta" },
  { flag: "🇲🇭", name: "Marshall Islands" },
  { flag: "🇲🇷", name: "Mauritania" },
  { flag: "🇲🇺", name: "Mauritius" },
  { flag: "🇲🇽", name: "Mexico" },
  { flag: "🇫🇲", name: "Micronesia" },
  { flag: "🇲🇩", name: "Moldova" },
  { flag: "🇲🇨", name: "Monaco" },
  { flag: "🇲🇳", name: "Mongolia" },
  { flag: "🇲🇪", name: "Montenegro" },
  { flag: "🇲🇦", name: "Morocco" },
  { flag: "🇲🇿", name: "Mozambique" },
  { flag: "🇲🇲", name: "Myanmar" },
  { flag: "🇳🇦", name: "Namibia" },
  { flag: "🇳🇷", name: "Nauru" },
  { flag: "🇳🇵", name: "Nepal" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇳🇿", name: "New Zealand" },
  { flag: "🇳🇮", name: "Nicaragua" },
  { flag: "🇳🇪", name: "Niger" },
  { flag: "🇳🇬", name: "Nigeria" },
  { flag: "🇳🇴", name: "Norway" },
  { flag: "🇴🇲", name: "Oman" },
  { flag: "🇵🇰", name: "Pakistan" },
  { flag: "🇵🇼", name: "Palau" },
  { flag: "🇵🇦", name: "Panama" },
  { flag: "🇵🇬", name: "Papua New Guinea" },
  { flag: "🇵🇾", name: "Paraguay" },
  { flag: "🇵🇪", name: "Peru" },
  { flag: "🇵🇭", name: "Philippines" },
  { flag: "🇵🇱", name: "Poland" },
  { flag: "🇵🇹", name: "Portugal" },
  { flag: "🇶🇦", name: "Qatar" },
  { flag: "🇷🇴", name: "Romania" },
  { flag: "🇷🇺", name: "Russia" },
  { flag: "🇷🇼", name: "Rwanda" },
  { flag: "🇰🇳", name: "Saint Kitts & Nevis" },
  { flag: "🇱🇨", name: "Saint Lucia" },
  { flag: "🇻🇨", name: "Saint Vincent" },
  { flag: "🇼🇸", name: "Samoa" },
  { flag: "🇸🇲", name: "San Marino" },
  { flag: "🇸🇹", name: "São Tomé & Príncipe" },
  { flag: "🇸🇦", name: "Saudi Arabia" },
  { flag: "🇸🇳", name: "Senegal" },
  { flag: "🇷🇸", name: "Serbia" },
  { flag: "🇸🇨", name: "Seychelles" },
  { flag: "🇸🇱", name: "Sierra Leone" },
  { flag: "🇸🇬", name: "Singapore" },
  { flag: "🇸🇰", name: "Slovakia" },
  { flag: "🇸🇮", name: "Slovenia" },
  { flag: "🇸🇧", name: "Solomon Islands" },
  { flag: "🇸🇴", name: "Somalia" },
  { flag: "🇿🇦", name: "South Africa" },
  { flag: "🇸🇸", name: "South Sudan" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇱🇰", name: "Sri Lanka" },
  { flag: "🇸🇩", name: "Sudan" },
  { flag: "🇸🇷", name: "Suriname" },
  { flag: "🇸🇪", name: "Sweden" },
  { flag: "🇨🇭", name: "Switzerland" },
  { flag: "🇸🇾", name: "Syria" },
  { flag: "🇹🇼", name: "Taiwan" },
  { flag: "🇹🇯", name: "Tajikistan" },
  { flag: "🇹🇿", name: "Tanzania" },
  { flag: "🇹🇭", name: "Thailand" },
  { flag: "🇹🇱", name: "Timor-Leste" },
  { flag: "🇹🇬", name: "Togo" },
  { flag: "🇹🇴", name: "Tonga" },
  { flag: "🇹🇹", name: "Trinidad & Tobago" },
  { flag: "🇹🇳", name: "Tunisia" },
  { flag: "🇹🇷", name: "Turkey" },
  { flag: "🇹🇲", name: "Turkmenistan" },
  { flag: "🇹🇻", name: "Tuvalu" },
  { flag: "🇺🇬", name: "Uganda" },
  { flag: "🇺🇦", name: "Ukraine" },
  { flag: "🇦🇪", name: "United Arab Emirates" },
  { flag: "🇬🇧", name: "United Kingdom" },
  { flag: "🇺🇸", name: "United States" },
  { flag: "🇺🇾", name: "Uruguay" },
  { flag: "🇺🇿", name: "Uzbekistan" },
  { flag: "🇻🇺", name: "Vanuatu" },
  { flag: "🇻🇦", name: "Vatican City" },
  { flag: "🇻🇪", name: "Venezuela" },
  { flag: "🇻🇳", name: "Vietnam" },
  { flag: "🇾🇪", name: "Yemen" },
  { flag: "🇿🇲", name: "Zambia" },
  { flag: "🇿🇼", name: "Zimbabwe" },
];

type ActiveTab = "login" | "register";

export default function LoginPage() {
  const { user, isLoading, login, checkSession } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("login");
  
  // Login Form States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [registerError, setRegisterError] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = countrySearch.trim()
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : COUNTRIES;

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      setLoginError("Username tidak boleh kosong.");
      return;
    }
    if (loginUsername.trim().length < 3) {
      setLoginError("Username minimal 3 karakter.");
      return;
    }
    if (!loginPassword) {
      setLoginError("Password tidak boleh kosong.");
      return;
    }
    setLoginError("");
    const res = await login(loginUsername.trim(), "", "", loginPassword, "login");
    if (res && !res.success) {
      setLoginError(res.error || "Login gagal.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerUsername.trim()) {
      setRegisterError("Username tidak boleh kosong.");
      return;
    }
    if (registerUsername.trim().length < 3) {
      setRegisterError("Username minimal 3 karakter.");
      return;
    }
    if (!registerPassword) {
      setRegisterError("Password tidak boleh kosong.");
      return;
    }
    if (registerPassword.length < 6) {
      setRegisterError("Password minimal 6 karakter.");
      return;
    }
    setRegisterError("");
    const res = await login(registerUsername.trim(), registerEmail.trim(), selectedCountry.flag, registerPassword, "register");
    if (res && !res.success) {
      setRegisterError(res.error || "Pendaftaran gagal.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12 md:py-20">
        <div className="relative w-full max-w-md">
          {/* Subtle decorative glowing background circle */}
          <div className="absolute -inset-0.5 -z-10 rounded-2xl bg-gradient-to-r from-primary/30 to-muted-foreground/30 opacity-30 blur-2xl transition duration-1000 group-hover:duration-200" />
          
          <Card className="border border-border bg-card/75 backdrop-blur-md shadow-2xl">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Selamat Datang di TypeRace
              </CardTitle>
              <CardDescription>
                Ukur dan tingkatkan kecepatan mengetik Anda
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Tab Toggles */}
              <div className="mb-6 flex rounded-lg border border-border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setLoginError("");
                  }}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === "login"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setRegisterError("");
                  }}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === "register"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Daftar
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "login" ? (
                  /* ── Login Form ── */
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" htmlFor="login-username">
                        Username
                      </label>
                      <input
                        id="login-username"
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Masukkan username Anda"
                        maxLength={32}
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" htmlFor="login-password">
                        Password
                      </label>
                      <input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    {loginError && (
                      <p className="text-sm text-destructive font-medium">{loginError}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      ) : (
                        "Masuk"
                      )}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Atau gunakan</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold transition hover:bg-accent"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" className="mr-1">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Masuk dengan Google
                    </Button>
                  </motion.form>
                ) : (
                  /* ── Register Form ── */
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" htmlFor="register-username">
                        Username
                      </label>
                      <input
                        id="register-username"
                        type="text"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        placeholder="contoh: speedtyper"
                        maxLength={32}
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" htmlFor="register-email">
                        Email <span className="text-muted-foreground text-xs">(opsional)</span>
                      </label>
                      <input
                        id="register-email"
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" htmlFor="register-password">
                        Password
                      </label>
                      <input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div className="space-y-1.5" ref={countryDropdownRef}>
                      <label className="text-sm font-medium">Negara asal</label>
                      {/* Searchable country dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setCountryDropdownOpen((prev) => !prev)}
                          className="w-full flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-left outline-none transition hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <span className="text-base">{selectedCountry.flag}</span>
                          <span className="flex-1">{selectedCountry.name}</span>
                          <svg
                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                              countryDropdownOpen ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        <AnimatePresence>
                          {countryDropdownOpen && (
                            <motion.div
                              key="country-dropdown"
                              initial={{ opacity: 0, y: -6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-xl overflow-hidden"
                            >
                              {/* Search input */}
                              <div className="p-2 border-b border-border">
                                <input
                                  type="text"
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  placeholder="Cari negara..."
                                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/20"
                                  autoFocus
                                />
                              </div>
                              {/* Country list */}
                              <ul className="max-h-48 overflow-y-auto py-1">
                                {filteredCountries.length > 0 ? (
                                  filteredCountries.map((c) => (
                                    <li key={`${c.flag}-${c.name}`}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedCountry(c);
                                          setCountryDropdownOpen(false);
                                          setCountrySearch("");
                                        }}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent ${
                                          selectedCountry.name === c.name
                                            ? "bg-primary/10 text-foreground font-medium"
                                            : "text-foreground"
                                        }`}
                                      >
                                        <span className="text-base">{c.flag}</span>
                                        <span>{c.name}</span>
                                        {selectedCountry.name === c.name && (
                                          <svg className="ml-auto w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </button>
                                    </li>
                                  ))
                                ) : (
                                  <li className="px-3 py-4 text-sm text-center text-muted-foreground">
                                    Negara tidak ditemukan
                                  </li>
                                )}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {registerError && (
                      <p className="text-sm text-destructive font-medium">{registerError}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      ) : (
                        "Daftar & Masuk"
                      )}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Atau gunakan</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold transition hover:bg-accent"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" className="mr-1">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Daftar dengan Google
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
