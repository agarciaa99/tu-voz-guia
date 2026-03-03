"use client";

import { useSettings } from "@/lib/settings-context";
import Link from "next/link";
import {
  Mic,
  Settings,
  History,
  Command,
  ArrowRight,
  Globe,
  Youtube,
  Map,
  BookOpen,
  Cloud,
  Languages,
  Music,
  Sparkles,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickActions = [
  {
    icon: Youtube,
    label: "YouTube",
    example: '"Pon musica relajante en YouTube"',
    color: "text-red-500 bg-red-500/10",
  },
  {
    icon: Globe,
    label: "Google",
    example: '"Busca las noticias de hoy"',
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Map,
    label: "Maps",
    example: '"Como llego al aeropuerto"',
    color: "text-green-500 bg-green-500/10",
  },
  {
    icon: BookOpen,
    label: "Wikipedia",
    example: '"Que es la inteligencia artificial"',
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    icon: Cloud,
    label: "Clima",
    example: '"Como esta el clima hoy"',
    color: "text-cyan-500 bg-cyan-500/10",
  },
  {
    icon: Languages,
    label: "Traductor",
    example: '"Traduce hola mundo al ingles"',
    color: "text-violet-500 bg-violet-500/10",
  },
  {
    icon: Music,
    label: "Spotify",
    example: '"Pon Bad Bunny en Spotify"',
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: Globe,
    label: "Sitios Web",
    example: '"Abre la pagina de Google"',
    color: "text-orange-500 bg-orange-500/10",
  },
];

const tips = [
  {
    icon: Mic,
    title: "Habla naturalmente",
    description:
      'Di las cosas como las dirias a una persona: "Quiero escuchar musica en YouTube" funciona perfectamente.',
  },
  {
    icon: Command,
    title: "Comandos personalizados",
    description:
      "Crea accesos rapidos de voz para tus sitios y acciones favoritas desde Configuracion.",
  },
  {
    icon: Keyboard,
    title: "Ctrl + Espacio",
    description:
      "Activa el microfono desde cualquier lugar con este atajo de teclado. Esc cierra el asistente.",
  },
];

export function AppDashboard() {
  const { settings } = useSettings();
  const activeCommands = settings.customCommands.filter(
    (c) => c.enabled,
  ).length;

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Hero area */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Asistente con IA siempre disponible</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground">
            Hola, {"bienvenido a "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Voxera
            </span>
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed">
            Tu asistente inteligente esta listo. Haz clic en el boton flotante o
            presiona{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono">
              Ctrl+Espacio
            </kbd>{" "}
            para comenzar a hablar.
          </p>
        </div>

        {/* Quick actions grid */}
        <section aria-labelledby="quick-actions-title">
          <h2
            id="quick-actions-title"
            className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4"
          >
            Lo que puedes hacer
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <div
                key={action.label}
                className="group rounded-xl border border-border bg-card p-4 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-default"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}
                >
                  <action.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {action.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {action.example}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips section */}
        <section aria-labelledby="tips-title">
          <h2
            id="tips-title"
            className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4"
          >
            Consejos
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {tips.map((tip) => (
              <div
                key={tip.title}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <tip.icon className="w-4 h-4 text-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {tip.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full bg-transparent"
          >
            <Link href="/app/settings">
              <Settings className="w-4 h-4 mr-2" />
              Configuracion
              {activeCommands > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-medium">
                  {activeCommands} comandos
                </span>
              )}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-full bg-transparent"
          >
            <Link href="/app/history">
              <History className="w-4 h-4 mr-2" />
              Historial
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
            <span>
              {settings.language === "es-ES" ? "Espanol" : "English"} |{" "}
              {settings.voiceFeedback ? "Audio activo" : "Audio inactivo"}
            </span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </section>
      </div>
    </div>
  );
}
