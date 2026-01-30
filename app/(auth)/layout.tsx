import type React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-glow-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Logo */}
      <div className="fixed top-6 left-6 z-50">
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
      </div>

      <div className="relative z-10 w-full max-w-md px-6">{children}</div>
    </div>
  );
}
