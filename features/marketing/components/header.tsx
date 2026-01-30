"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-border/20" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center">
            {/* <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent to-glow-secondary opacity-80 blur-sm group-hover:blur-md transition-all duration-300" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-glow-secondary">
              <svg
                className="h-5 w-5 text-accent-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </div> */}
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            TuVozGuía
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {["Características", "Cómo Funciona", "Demo", "Costos"].map(
            (item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="relative px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground group"
              >
                {item}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent rounded-full transition-all duration-300 group-hover:w-1/2" />
              </Link>
            )
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            asChild
          >
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>
          {/* <Button
            size="sm"
            className="relative overflow-hidden bg-foreground text-background hover:bg-foreground/90 group"
          >
            <span className="relative z-10">Get Early Access</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-glow-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button> */}
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass border-t border-border/20 px-6 py-6">
          <div className="flex flex-col gap-2">
            {["Features", "How It Works", "Showcase", "Pricing"].map(
              (item, i) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  {item}
                </Link>
              )
            )}
            <div className="flex gap-3 pt-4 mt-2 border-t border-border/20">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
              {/* <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-accent to-glow-secondary text-accent-foreground"
              >
                Get Early Access
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
