"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Mic } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className="relative py-32 overflow-hidden" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className={`relative overflow-hidden rounded-[2.5rem] transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-[2.5rem] p-[1px] bg-gradient-to-r from-accent via-glow-secondary to-accent bg-[length:200%_100%] animate-gradient" />

          {/* Inner card */}
          <div className="relative rounded-[2.5rem] bg-background/95 px-8 py-20 sm:px-16 sm:py-28 overflow-hidden">
            {/* Mouse follow gradient */}
            <div
              className="absolute w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px] pointer-events-none transition-all duration-300 ease-out"
              style={{
                left: mousePosition.x - 250,
                top: mousePosition.y - 250,
              }}
            />

            {/* Background patterns */}
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-glow-secondary/10 blur-[100px] rounded-full" />

            {/* Floating orbs */}
            <div className="absolute top-20 left-20 w-4 h-4 rounded-full bg-accent/30 animate-float" />
            <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-glow-secondary/30 animate-float delay-200" />
            <div className="absolute bottom-32 left-1/4 w-2 h-2 rounded-full bg-accent/40 animate-float delay-400" />
            <div className="absolute bottom-20 right-20 w-5 h-5 rounded-full bg-glow-secondary/20 animate-float delay-300" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-sm mb-8 animate-bounce-subtle">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">
                  Empiza cuando quieras, sin tarjeta de crédito
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="text-foreground">¿Listo para </span>
                <span className="gradient-text glow-text">navegar</span>
                <br />
                <span className="text-foreground">sin barreras?</span>
              </h2>

              {/* Description */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                Únete a la comunidad que está haciendo de internet un lugar
                accesible para todos. Tu voz es la única herramienta que
                necesitas.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  size="lg"
                  className="group relative overflow-hidden h-14 px-8 text-base rounded-full bg-foreground text-background hover:bg-foreground"
                  asChild
                >
                  <Link href="/auth/login">
                    <span className="relative z-10 flex items-center gap-2">
                      <Mic className="w-5 h-5" />
                      Empieza Ahora
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-glow-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base rounded-full border-border/50 bg-white/5 hover:bg-white/10 hover:border-accent/50 transition-all duration-300"
                >
                  Contáctanos
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>99.9% de tiempo activo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Certificado SOC2 Tipo II</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-glow-secondary" />
                  <span>Cumple con RGPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
