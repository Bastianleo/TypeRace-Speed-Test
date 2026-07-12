"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuthStore } from "@/features/auth/store/authStore";
import { LoginModal } from "@/features/auth/components/LoginModal";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/dashboard/solo", label: "Solo" },
  { href: "/dashboard/multiplayer", label: "Multiplayer" },
  { href: "/dashboard/leaderboard", label: "Leaderboard" },
  { href: "/dashboard/profile", label: "Profil" },
];

function XpBar({ xp }: { xp: number }) {
  const currentLevelXp = xp % 100;
  return (
    <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${currentLevelXp}%` }}
      />
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading, openModal, logout, checkSession } = useAuthStore();

  // Run once on mount to restore session from cookie
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 w-full items-center justify-between px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight hover:opacity-80"
          >
            TypeRace
          </Link>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-2 flex items-center gap-2 border-l border-border pl-2">
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
              ) : user ? (
                /* Logged-in user profile area */
                <div className="flex items-center gap-2">
                  {/* Country + username */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{user.country}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold leading-tight">{user.username}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          Lv.{user.level}
                        </span>
                        <XpBar xp={user.xp} />
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          {user.xp % 100}/100 XP
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                /* Guest: Login — same style as nav links */
                <Link
                  href="/login"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Login
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal — rendered outside nav scroll context */}
      <LoginModal />
    </>
  );
}
