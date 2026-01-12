"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Youtube, ArrowUpRight } from "lucide-react";

const footerLinks = {
  Product: [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#" },
    { name: "API", href: "#" },
    { name: "Integrations", href: "#" },
    { name: "Enterprise", href: "#" },
  ],
  Company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#", badge: "Hiring" },
    { name: "Press Kit", href: "#" },
  ],
  Resources: [
    { name: "Documentation", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "Community", href: "#" },
    { name: "Status", href: "#" },
  ],
  Legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Security", href: "#" },
    { name: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "GitHub", icon: Github, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border/20 pt-20 pb-10 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Top section */}
        <div className="grid gap-12 lg:grid-cols-6 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent to-glow-secondary opacity-80 blur-sm group-hover:blur-md transition-all duration-300" />
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
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Voxera
              </span>
            </Link>

            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
              The future of search is your voice. AI-powered voice search that
              understands context, nuance, and you.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                    >
                      {link.name}
                      {"badge" in link && link.badge && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                          {link.badge}
                        </span>
                      )}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter section */}
        <div className="glass rounded-2xl p-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Stay in the loop
              </h3>
              <p className="text-sm text-muted-foreground">
                Get the latest updates on voice AI, product news, and more.
              </p>
            </div>
            <form className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 h-12 px-4 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TuVozGuía, Todos los derechos
            reservados.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All systems operational</span>
            </div>
            <div className="h-4 w-px bg-border/50" />
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
