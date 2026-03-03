"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { useVoiceRecognition } from "@/features/app/hooks/use-voice-recognition";
import { useSettings } from "@/lib/settings-context";
import { useWebViewer } from "@/features/app/components/web-viewer";
import { useVoiceControl } from "@/features/app/hooks/use-voice-control";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Minus,
  Maximize2,
  Globe,
  HelpCircle,
  Play,
  Pause,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function FloatingAssistant() {
  const { settings } = useSettings();
  const {
    openUrl,
    isOpen: isViewerOpen,
    url: viewerUrl,
    title: viewerTitle,
    service: viewerService,
    closeViewer,
    lastFallbackMessage,
    controls,
  } = useWebViewer();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<string>("");

  // Text-to-speech
  const getVoiceRate = useCallback(() => {
    switch (settings.voiceSpeed) {
      case "slow":
        return 0.7;
      case "fast":
        return 1.3;
      default:
        return 1;
    }
  }, [settings.voiceSpeed]);

  const speak = useCallback(
    (text: string) => {
      if (!settings.voiceFeedback || !("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language;
      utterance.rate = getVoiceRate();
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
      lastMessageRef.current = text;
    },
    [settings.voiceFeedback, settings.language, getVoiceRate],
  );

  // Voice control hook
  const { processVoiceCommand } = useVoiceControl({
    webViewerControls: controls,
    isViewerOpen,
    viewerUrl,
    viewerTitle,
    viewerService,
    openUrl,
    closeViewer,
    speak,
    onCommandExecuted: (command, response) => {
      // Command was executed, response already spoken
    },
    onError: (error) => {
      addAssistantMessage(error);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hola, soy Voxera. Puedo ayudarte a navegar por internet usando tu voz. Puedo abrir YouTube, Spotify, Google, Wikipedia, y mas. Tambien puedo controlar videos: reproducir, pausar, subir o bajar volumen, adelantar, retroceder. Di 'ayuda' para ver todos los comandos.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Fallback message from viewer
  useEffect(() => {
    if (lastFallbackMessage) {
      const msg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: lastFallbackMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
      speak(lastFallbackMessage);
      if (!isOpen) setHasUnread(true);
    }
  }, [lastFallbackMessage, isOpen, speak]);

  const addAssistantMessage = useCallback(
    (content: string) => {
      const msg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
      speak(content);
      return msg;
    },
    [speak],
  );

  const processMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsProcessing(true);

      try {
        const response = await processVoiceCommand(text);
        addAssistantMessage(response);
      } catch (error) {
        console.error("Assistant error:", error);
        addAssistantMessage("Lo siento, hubo un error. Intenta de nuevo.");
      } finally {
        setIsProcessing(false);
      }
    },
    [processVoiceCommand, addAssistantMessage],
  );

  const handleTranscript = useCallback(
    (transcript: string) => {
      if (transcript) {
        setInputValue("");
        processMessage(transcript);
      }
    },
    [processMessage],
  );

  const { isListening, isSupported, startListening, stopListening } =
    useVoiceRecognition({
      onTranscript: handleTranscript,
      onListeningChange: (listening) => {
        if (listening) speak("Escuchando...");
      },
      onError: (error) => addAssistantMessage(`Error de voz: ${error}`),
      language: settings.language,
      continuous: settings.continuousListening,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      processMessage(inputValue);
      setInputValue("");
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      setHasUnread(false);
    } else {
      setIsOpen(false);
    }
  };

  const repeatLastMessage = () => {
    if (lastMessageRef.current) {
      speak(lastMessageRef.current);
    }
  };

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && e.ctrlKey) {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setIsMinimized(false);
        }
        if (isListening) stopListening();
        else startListening();
      }
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isListening, startListening, stopListening]);

  const quickCommands = [
    { label: "Ayuda", command: "ayuda" },
    { label: "YouTube", command: "abre youtube" },
    { label: "Spotify", command: "abre spotify" },
    { label: "Scroll abajo", command: "baja la pagina" },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 focus-visible-ring ${
          isOpen
            ? "bg-muted text-muted-foreground hover:bg-muted/80 scale-90"
            : isListening
              ? "bg-gradient-to-br from-red-500 to-pink-600 text-white animate-pulse"
              : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/40 hover:scale-105"
        }`}
        aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente de voz"}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : isListening ? (
          <Mic className="w-5 h-5" />
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background" />
            )}
            {isViewerOpen && (
              <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                <Globe className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? "bottom-24 right-6 w-72 h-12"
              : "bottom-24 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[min(650px,calc(100vh-8rem))]"
          }`}
          role="dialog"
          aria-label="Asistente Voxera"
        >
          <div className="w-full h-full bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isListening
                      ? "bg-gradient-to-br from-red-500 to-pink-600 animate-pulse"
                      : "bg-gradient-to-br from-indigo-500 to-purple-600"
                  }`}
                >
                  {isListening ? (
                    <Mic className="w-4 h-4 text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground leading-none">
                    Voxera
                  </h2>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {isListening
                      ? "Escuchando..."
                      : isProcessing
                        ? "Procesando..."
                        : isViewerOpen
                          ? `${viewerService || "Pagina"} abierta`
                          : "Listo para ayudarte"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isViewerOpen && (
                  <>
                    {viewerService === "YouTube" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => controls.togglePlayPause()}
                        aria-label={
                          controls.isPlaying ? "Pausar" : "Reproducir"
                        }
                      >
                        {controls.isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                      onClick={() => closeViewer()}
                      aria-label="Cerrar visor web"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={repeatLastMessage}
                  aria-label="Repetir ultimo mensaje"
                >
                  {settings.voiceFeedback ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMinimized(!isMinimized)}
                  aria-label={isMinimized ? "Maximizar" : "Minimizar"}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Quick Commands */}
                <div className="flex gap-1.5 px-3 py-2 border-b border-border/50 bg-muted/20 overflow-x-auto shrink-0">
                  {quickCommands.map((cmd) => (
                    <button
                      key={cmd.label}
                      onClick={() => processMessage(cmd.command)}
                      disabled={isProcessing}
                      className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {cmd.label}
                    </button>
                  ))}
                  <button
                    onClick={() => processMessage("ayuda")}
                    className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors"
                    aria-label="Ver ayuda"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                  role="log"
                  aria-live="polite"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                          msg.role === "user"
                            ? "bg-indigo-500 text-white rounded-br-md"
                            : "bg-muted/50 text-foreground rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                        <p
                          className={`text-[9px] mt-1 ${
                            msg.role === "user"
                              ? "text-indigo-200"
                              : "text-muted-foreground"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                          <span className="text-sm text-muted-foreground">
                            Procesando...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border bg-muted/20 shrink-0">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Button
                      type="button"
                      variant={isListening ? "default" : "outline"}
                      size="icon"
                      className={`shrink-0 transition-all ${
                        isListening
                          ? "bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse"
                          : "hover:bg-indigo-500/10 hover:text-indigo-500 hover:border-indigo-500"
                      }`}
                      onClick={handleVoiceToggle}
                      disabled={!isSupported || isProcessing}
                      aria-label={
                        isListening
                          ? "Detener escucha"
                          : "Iniciar escucha por voz"
                      }
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        isListening ? "Escuchando..." : "Escribe o habla..."
                      }
                      className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                      disabled={isListening}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white"
                      disabled={!inputValue.trim() || isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                  <p className="text-[9px] text-muted-foreground text-center mt-2">
                    Ctrl + Espacio para activar voz en cualquier momento
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
