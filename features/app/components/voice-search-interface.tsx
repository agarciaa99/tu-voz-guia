"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { useVoiceRecognition } from "@/features/app/hooks/use-voice-recognition"
import { useSettings } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Mic,
  MicOff,
  Search,
  Loader2,
  Sparkles,
  Volume2,
  X,
  AlertCircle,
  VolumeX,
  ExternalLink,
  Settings,
  Command,
  Keyboard,
} from "lucide-react"
import { translations } from "@/lib/i18n/translations"

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  type: "web" | "action" | "answer"
}

interface AIResponse {
  interpretation: string
  intent: string
  results: SearchResult[]
  suggestions: string[]
  customCommandTriggered?: boolean
  commandUrl?: string
}

export function VoiceSearchInterface() {
  const { settings } = useSettings()
  const [query, setQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [feedback, setFeedback] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"info" | "success" | "error">("info")
  const inputRef = useRef<HTMLInputElement>(null)
  const t = translations.voiceSearch

  const showFeedback = useCallback((message: string, type: "info" | "success" | "error" = "info") => {
    setFeedback(message)
    setFeedbackType(type)
    setTimeout(() => setFeedback(""), 3000)
  }, [])

  const getVoiceRate = useCallback(() => {
    switch (settings.voiceSpeed) {
      case "slow":
        return 0.7
      case "fast":
        return 1.3
      default:
        return 1
    }
  }, [settings.voiceSpeed])

  const speak = useCallback(
    (text: string) => {
      if (!settings.voiceFeedback || !("speechSynthesis" in window)) return
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = settings.language
      utterance.rate = getVoiceRate()
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    },
    [settings.voiceFeedback, settings.language, getVoiceRate],
  )

  const processWithAI = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      setIsProcessing(true)
      showFeedback(t.processing, "info")

      try {
        const response = await fetch("/api/voice-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: text,
            customCommands: settings.customCommands,
            language: settings.language,
          }),
        })

        if (!response.ok) throw new Error("Failed to process query")

        const data: AIResponse = await response.json()
        setAiResponse(data)
        showFeedback(t.resultsReady, "success")

        if (settings.voiceFeedback && "speechSynthesis" in window && data.interpretation) {
          speak(data.interpretation)
        }

        if (data.customCommandTriggered && data.commandUrl) {
          window.open(data.commandUrl, "_blank", "noopener,noreferrer")
        }
      } catch (error) {
        console.error("AI processing error:", error)
        showFeedback(t.processingError, "error")
        speak(t.processingError)
      } finally {
        setIsProcessing(false)
      }
    },
    [showFeedback, speak, settings.voiceFeedback, settings.customCommands, settings.language, t],
  )

  const handleTranscript = useCallback(
    (transcript: string) => {
      setQuery(transcript)
      if (transcript) {
        processWithAI(transcript)
      }
    },
    [processWithAI],
  )

  const { isListening, isSupported, startListening, stopListening } = useVoiceRecognition({
    onTranscript: handleTranscript,
    onListeningChange: (listening) => {
      if (listening) {
        showFeedback(t.listeningSpeak, "info")
        speak(t.listeningSpeak)
      }
    },
    onError: (error) => {
      showFeedback(error, "error")
      speak(error)
    },
    language: settings.language,
    continuous: settings.continuousListening,
  })

  useEffect(() => {
    if (settings.autoListen && isSupported && !isListening) {
      const timer = setTimeout(() => {
        startListening()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [settings.autoListen, isSupported, isListening, startListening])

  // Keyboard shortcut for voice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && e.ctrlKey) {
        e.preventDefault()
        if (isListening) {
          stopListening()
        } else {
          startListening()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isListening, startListening, stopListening])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      processWithAI(query)
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
      showFeedback(t.stoppedListening, "info")
    } else {
      startListening()
    }
  }

  const clearResults = () => {
    setQuery("")
    setAiResponse(null)
    inputRef.current?.focus()
  }

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case "answer":
        return t.typeAnswer
      case "action":
        return t.typeAction
      default:
        return t.typeWeb
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-balance">
              <span className="text-foreground">{t.title} </span>
              <span className="gradient-text">{t.titleHighlight}</span>
              <span className="text-foreground"> {t.titleEnd}</span>
            </h1>
            <p className="text-muted-foreground text-base">{t.subtitle}</p>
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-6 p-3 rounded-xl flex items-center gap-3 animate-fade-up ${
                feedbackType === "error"
                  ? "bg-destructive/10 border border-destructive/20 text-destructive"
                  : feedbackType === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-accent/10 border border-accent/20 text-accent"
              }`}
            >
              {feedbackType === "error" ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              ) : feedbackType === "success" ? (
                <Sparkles className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              ) : (
                <Volume2 className="w-4 h-4 flex-shrink-0 animate-pulse" aria-hidden="true" />
              )}
              <span className="text-sm">{feedback}</span>
            </div>
          )}

          {/* Voice Button - Prominent and Centered */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={handleVoiceToggle}
              disabled={!isSupported || isProcessing}
              className="relative group focus-visible-ring rounded-full mb-4"
              aria-label={isListening ? t.stopListening : t.startListening}
              aria-pressed={isListening}
            >
              {/* Outer glow ring */}
              <div
                className={`absolute -inset-3 rounded-full transition-all duration-500 ${
                  isListening ? "bg-accent/20 animate-pulse" : "bg-transparent"
                }`}
                aria-hidden="true"
              />

              {/* Pulse rings when listening */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-accent/40 animate-pulse-ring" aria-hidden="true" />
                  <div
                    className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring delay-200"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute inset-0 rounded-full bg-accent/20 animate-pulse-ring delay-400"
                    aria-hidden="true"
                  />
                </>
              )}

              {/* Main button */}
              <div
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? "bg-gradient-to-br from-accent to-glow-secondary shadow-xl shadow-accent/40 scale-105"
                    : "bg-gradient-to-br from-secondary to-muted hover:from-secondary/80 hover:to-muted/80 group-hover:scale-105 group-hover:shadow-lg"
                } ${!isSupported || isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {isProcessing ? (
                  <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-foreground animate-spin" aria-hidden="true" />
                ) : isListening ? (
                  <MicOff className="w-10 h-10 sm:w-12 sm:h-12 text-accent-foreground" aria-hidden="true" />
                ) : (
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-foreground" aria-hidden="true" />
                )}
              </div>
            </button>

            {/* Voice Visualizer */}
            {isListening && (
              <div
                className="flex items-center justify-center gap-1 h-10 mb-2"
                role="status"
                aria-label="Escuchando activamente"
              >
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 sm:w-1.5 rounded-full bg-accent animate-wave-bar"
                    style={{
                      animationDelay: `${i * 60}ms`,
                      height: "100%",
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}

            {/* Keyboard shortcut hint */}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Keyboard className="w-3 h-3" aria-hidden="true" />
              <span>Ctrl + Espacio para {isListening ? "detener" : "escuchar"}</span>
            </p>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="relative mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isListening ? t.listening : t.placeholder}
                className="h-12 sm:h-14 pl-12 pr-20 rounded-2xl bg-secondary/30 dark:bg-secondary/50 border-border/30 focus:border-accent/50 text-base sm:text-lg transition-all focus-visible-ring"
                disabled={isListening}
                aria-label={t.placeholder}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1.5">
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible-ring"
                    onClick={clearResults}
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 px-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 focus-visible-ring"
                  disabled={!query.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    translations.common.search
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Status indicators */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {/* Voice feedback status */}
            <div
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                settings.voiceFeedback
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {settings.voiceFeedback ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>{settings.voiceFeedback ? "Audio activado" : "Audio desactivado"}</span>
            </div>

            {/* Custom commands indicator */}
            {settings.customCommands.filter((c) => c.enabled).length > 0 && (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                <Command className="w-3 h-3" />
                <span>{settings.customCommands.filter((c) => c.enabled).length} comandos</span>
              </div>
            )}

            {/* Settings link */}
            <Link
              href="/app/settings"
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors focus-visible-ring"
            >
              <Settings className="w-3 h-3" />
              <span>Configuración</span>
            </Link>
          </div>

          {/* Browser Support Warning */}
          {!isSupported && (
            <div
              className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-3"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm">{t.browserNotSupported}</span>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="space-y-4 animate-fade-up" role="region" aria-label="Resultados de búsqueda">
              {/* AI Interpretation Card */}
              <div className="glass rounded-2xl p-5 glow-border">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-glow-secondary flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <Sparkles className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {t.aiInterpretation}
                      </span>
                      <span className="inline-flex items-center gap-1 glass rounded-full px-2 py-0.5 text-[10px]">
                        <span className="text-muted-foreground">{t.intent}:</span>
                        <span className="text-accent font-medium">{aiResponse.intent}</span>
                      </span>
                      {aiResponse.customCommandTriggered && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full px-2 py-0.5 text-[10px] font-medium">
                          <Command className="w-2.5 h-2.5" />
                          Comando
                        </span>
                      )}
                    </div>
                    <p className="text-foreground text-base leading-relaxed">{aiResponse.interpretation}</p>
                  </div>
                </div>
              </div>

              {/* Results Grid */}
              {aiResponse.results.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                    {t.results}
                  </h2>
                  <ul className="grid gap-2" role="list">
                    {aiResponse.results.map((result) => (
                      <li key={result.id}>
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block glass rounded-xl p-4 hover:bg-foreground/[0.02] dark:hover:bg-white/[0.05] transition-all duration-200 group focus-visible-ring"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                    result.type === "answer"
                                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                      : result.type === "action"
                                        ? "bg-accent/20 text-accent"
                                        : "bg-secondary text-muted-foreground"
                                  }`}
                                >
                                  {getResultTypeLabel(result.type)}
                                </span>
                              </div>
                              <h3 className="text-foreground font-medium text-sm group-hover:text-accent transition-colors truncate">
                                {result.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{result.description}</p>
                            </div>
                            <div
                              className="w-7 h-7 rounded-lg bg-secondary/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              aria-hidden="true"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {aiResponse.suggestions.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                    {t.trySaying}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {aiResponse.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(suggestion)
                          processWithAI(suggestion)
                        }}
                        className="glass rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02] dark:hover:bg-white/[0.05] transition-all focus-visible-ring"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!aiResponse && !isListening && !isProcessing && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">{t.trySaying}:</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {t.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion)
                      processWithAI(suggestion)
                    }}
                    className="glass rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02] dark:hover:bg-white/[0.05] transition-all focus-visible-ring"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick access footer */}
      <footer className="border-t border-border/20 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <p>
            {settings.language === "es-ES" ? "Idioma: Español" : "Language: English"} •{" "}
            {settings.voiceSpeed === "slow"
              ? "Velocidad lenta"
              : settings.voiceSpeed === "fast"
                ? "Velocidad rápida"
                : "Velocidad normal"}
          </p>
          <Link
            href="/app/settings"
            className="hover:text-foreground transition-colors focus-visible-ring rounded px-2 py-1 -mx-2 -my-1"
          >
            Personalizar experiencia
          </Link>
        </div>
      </footer>
    </div>
  )
}
