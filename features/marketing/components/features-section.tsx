"use client";

import { useRef, useEffect, useState } from "react";
import {
  Mic,
  Zap,
  Globe,
  Brain,
  Shield,
  Sparkles,
  Waves,
  Languages,
  Lock,
  Cpu,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Comandos de Voz Web",
    description:
      "Controla el navegador: 'Atrás', 'Buscar en Google', 'Ir a Youtube'. Olvídate del teclado y el mouse.",
    gradient: "from-accent to-glow-secondary",
  },
  {
    icon: Zap,
    title: "Resumidor de Sitios",
    description:
      "¿Páginas muy largas? Obtén un resumen instantáneo del contenido antes de decidir si quieres escucharlo todo.",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Brain,
    title: "Detector de Elementos",
    description:
      "La IA identifica botones, formularios y encabezados ocultos para que siempre sepas dónde estás en la página.",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: Globe,
    title: "40+ Languages",
    description:
      "Seamless multilingual support with automatic language detection and native-quality translation.",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    icon: Shield,
    title: "Modo Incógnito Real",
    description:
      "Navegación privada que no guarda historial de voz ni datos de formularios. Seguridad total.",
    gradient: "from-emerald-400 to-green-500",
  },
  {
    icon: Sparkles,
    title: "Descripción de Imágenes",
    description:
      "Si una web no tiene 'Alt Text', nuestra IA analiza la foto y te cuenta exactamente qué hay en ella.",
    gradient: "from-rose-400 to-red-500",
  },
];

export function FeaturesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  return (
    <section
      id="features"
      className="relative py-32 overflow-hidden"
      ref={sectionRef}
    >
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-glow-secondary/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-20">
          <div
            className={`inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Waves className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Capacidades</span>
          </div>

          <h2
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="text-foreground">Construido para la </span>
            <span className="gradient-text">era de la voz</span>
            {/* <span className="text-foreground"> era</span> */}
          </h2>

          <p
            className={`mt-6 text-lg text-muted-foreground max-w-xl mx-auto transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Cada función diseñada para hacer que la búsqueda por voz se sienta
            invisible, instantánea y sin esfuerzo.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Card */}
              <div className="relative h-full overflow-hidden rounded-2xl glass p-8 transition-all duration-500 hover:bg-white/[0.08] group-hover:border-accent/30 cursor-pointer">
                {/* Hover gradient background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Number */}
                <div className="absolute top-6 right-6 text-5xl font-bold text-foreground/[0.03] group-hover:text-foreground/[0.08] transition-colors duration-500">
                  0{index + 1}
                </div>

                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                  />
                  <div
                    className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} p-[1px]`}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-background/90 group-hover:bg-background/70 transition-colors duration-300">
                      <feature.icon className="h-6 w-6 text-foreground" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-foreground transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Animated line */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-accent to-glow-secondary group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom highlight */}
        <div
          className={`mt-20 text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "900ms" }}
        >
          <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3">
            <div className="flex -space-x-2">
              {[Cpu, Languages, Lock].map((Icon, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-background"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">
                Listo para empresas
              </span>{" "}
              — Cumple con SOC2, GDPR y HIPAA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
