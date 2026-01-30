"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";

const typingPhrases = [
  "Léeme las noticias de hoy...",
  "Busca una receta de pasta y léeme los pasos...",
  "Resume el contenido de esta página web...",
  "¿Qué dice la imagen que está en el artículo?",
  "Llena este formualrio con mis datos...",
];

export function HeroSection() {
  const [isListening, setIsListening] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Typing effect
  useEffect(() => {
    const phrase = typingPhrases[currentPhrase];
    let charIndex = 0;
    setIsTyping(true);
    setDisplayText("");

    const typeInterval = setInterval(() => {
      if (charIndex <= phrase.length) {
        setDisplayText(phrase.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setCurrentPhrase((prev) => (prev + 1) % typingPhrases.length);
        }, 2000);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentPhrase]);

  // Toggle listening state
  useEffect(() => {
    const interval = setInterval(() => {
      setIsListening((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-glow-secondary/10 rounded-full blur-[100px] animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-4xl text-center" ref={containerRef}>
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-sm animate-fade-up">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">
              Navegación web accesible e inteligente
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-fade-up delay-100">
            <span className="block text-foreground">Internet</span>
            <span className="block gradient-text glow-text">a tu manera.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200 text-pretty">
            El primer navegador controlado 100% por voz. Eliminamos el ruido
            visual, bloqueamos anuncios y te leemos solo lo que importa. La web,
            finalmente accesible.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-foreground text-background hover:bg-foreground h-14 px-8 text-base rounded-full"
              asChild
            >
              <Link href="/auth/login">
                <span className="relative z-10 flex items-center gap-2">
                  Empieza a Hablar
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent to-glow-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </Button>
          </div>

          {/* Interactive Voice Demo */}
          <div className="mt-20 animate-fade-up delay-400">
            <div className="relative mx-auto max-w-3xl">
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-glow-secondary/20 to-accent/20 blur-3xl opacity-50 rounded-3xl" />

              {/* Main card */}
              <div className="relative glass rounded-3xl p-8 sm:p-10 glow-border overflow-hidden">
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div
                    className="absolute inset-[-2px] bg-gradient-to-r from-accent via-glow-secondary to-accent opacity-20 animate-spin-slow"
                    style={{ animationDuration: "8s" }}
                  />
                </div>

                {/* Voice visualization */}
                <div className="relative flex flex-col items-center gap-8">
                  {/* Microphone button with rings */}
                  <button
                    onClick={() => setIsListening(!isListening)}
                    className="relative group"
                  >
                    {/* Pulse rings */}
                    {isListening && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
                        <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse-ring delay-300" />
                        <div className="absolute inset-0 rounded-full bg-accent/10 animate-pulse-ring delay-600" />
                      </>
                    )}

                    {/* Main button */}
                    <div
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isListening
                          ? "bg-gradient-to-br from-accent to-glow-secondary shadow-lg shadow-accent/30"
                          : "bg-secondary/80 group-hover:bg-secondary"
                      }`}
                    >
                      <svg
                        className={`w-10 h-10 transition-colors duration-300 ${
                          isListening
                            ? "text-accent-foreground"
                            : "text-foreground"
                        }`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </div>
                  </button>

                  {/* Sound wave visualization */}
                  <div className="flex items-center justify-center gap-1 h-16">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-150 ${
                          isListening ? "bg-accent" : "bg-muted-foreground/30"
                        }`}
                        style={{
                          height: isListening
                            ? `${
                                Math.sin((i + Date.now() / 100) * 0.5) * 30 + 35
                              }px`
                            : "4px",
                          opacity: isListening
                            ? 0.5 + Math.sin((i + Date.now() / 100) * 0.5) * 0.5
                            : 0.3,
                          animationDelay: `${i * 30}ms`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Voice query display */}
                  <div className="w-full max-w-xl">
                    <div className="glass rounded-2xl px-6 py-4 min-h-[60px] flex items-center justify-center">
                      {isListening ? (
                        <p className="text-lg text-foreground font-medium">
                          "{displayText}"
                          <span
                            className={`inline-block w-0.5 h-5 bg-accent ml-1 ${
                              isTyping ? "animate-blink" : "opacity-0"
                            }`}
                          />
                        </p>
                      ) : (
                        <p className="text-muted-foreground">
                          Pulsa el micrófono para empezar...
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick results preview */}
                  <div
                    className={`w-full grid grid-cols-1 sm:grid-cols-3 gap-3 transition-all duration-500 ${
                      isListening
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                  >
                    {[
                      {
                        name: "Pasta Boloñesa",
                        distance: "30 min",
                        rating: "4.9",
                      },
                      {
                        name: "Pasta Primavera",
                        distance: "20 min",
                        rating: "4.9",
                      },
                      {
                        name: "Pasta Carbonara",
                        distance: "25 min",
                        rating: "4.8",
                      },
                    ].map((result, i) => (
                      <div
                        key={result.name}
                        className="glass-hover rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <span className="text-xs text-accent">
                            {result.rating} ★
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {result.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.distance} away
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-up delay-500">
            {[
              { value: "50ms", label: "Tiempo de respuesta" },
              { value: "99.2%", label: "Precisión" },
              { value: "40+", label: "Idiomas" },
              { value: "10mil+", label: "Peticiones diarias" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center"
                style={{ animationDelay: `${500 + i * 100}ms` }}
              >
                <p className="text-3xl sm:text-4xl font-bold gradient-text">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
