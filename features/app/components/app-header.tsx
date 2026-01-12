"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, History, ChevronDown } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { translations } from "@/lib/i18n/translations";

interface AppHeaderProps {
  user: SupabaseUser;
}

export function AppHeader({ user }: AppHeaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = translations;

  const handleSignOut = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        <Link
          href="/app"
          className="flex items-center gap-3 group focus-visible-ring rounded-lg"
          aria-label="TuVozGuía - Ir al inicio"
        >
          <div className="relative flex h-9 w-9 items-center justify-center">
            {/* <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent to-glow-secondary opacity-80 blur-sm group-hover:blur-md transition-all duration-300" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-glow-secondary">
              <svg
                className="h-4 w-4 text-accent-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div> */}
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            TuVozGuía
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground focus-visible-ring"
            asChild
          >
            <Link href="/app/history">
              <History className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>{t.nav.history}</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground focus-visible-ring"
            asChild
          >
            <Link href="/app/settings">
              <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">{t.nav.settings}</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground focus-visible-ring"
                aria-label={`Menú de usuario: ${displayName}`}
              >
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-glow-secondary flex items-center justify-center text-xs font-semibold text-accent-foreground"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <span className="hidden sm:inline">{displayName}</span>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 glass border-border/50"
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-border/30" />
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/app/settings#profile">
                  <User className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t.nav.profile}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/app/settings">
                  <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t.nav.settings}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/30" />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
                {isLoading ? t.nav.signingOut : t.nav.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
