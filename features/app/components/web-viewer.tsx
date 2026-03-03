"use client";

import React from "react";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  Globe,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Loader2,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Embed URL conversion ────────────────────────────────────────────────────

interface EmbedResult {
  embedUrl: string | null;
  canEmbed: boolean;
  service: string;
  fallbackMessage: string;
  useContentViewer?: boolean; // Use our own content viewer instead of iframe
}

function getEmbedInfo(url: string): EmbedResult {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    // YouTube
    if (
      host === "youtube.com" ||
      host === "youtu.be" ||
      host === "m.youtube.com"
    ) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return {
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${origin}`,
          canEmbed: true,
          service: "YouTube",
          fallbackMessage: "",
        };
      }
      if (host === "youtu.be" && parsed.pathname.length > 1) {
        const id = parsed.pathname.slice(1);
        return {
          embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1&origin=${origin}`,
          canEmbed: true,
          service: "YouTube",
          fallbackMessage: "",
        };
      }
      // YouTube search/home - open in new tab
      const searchQuery = parsed.searchParams.get("search_query");
      if (searchQuery) {
        return {
          embedUrl: null,
          canEmbed: false,
          service: "YouTube",
          fallbackMessage: `Abriendo busqueda de "${searchQuery}" en YouTube.`,
        };
      }
      // YouTube home
      if (parsed.pathname === "/" || parsed.pathname === "") {
        return {
          embedUrl: null,
          canEmbed: false,
          service: "YouTube",
          fallbackMessage: "Abriendo YouTube en nueva pestana.",
        };
      }
      const listId = parsed.searchParams.get("list");
      if (listId) {
        return {
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}&autoplay=1&enablejsapi=1&origin=${origin}`,
          canEmbed: true,
          service: "YouTube",
          fallbackMessage: "",
        };
      }
      return {
        embedUrl: null,
        canEmbed: false,
        service: "YouTube",
        fallbackMessage: "Abriendo YouTube en nueva pestana.",
      };
    }

    // Spotify
    if (host === "open.spotify.com") {
      const pathMatch = parsed.pathname.match(
        /^\/(track|album|playlist|artist|episode|show)\/(.+)/,
      );
      if (pathMatch) {
        return {
          embedUrl: `https://open.spotify.com/embed/${pathMatch[1]}/${pathMatch[2]}?utm_source=generator&theme=0`,
          canEmbed: true,
          service: "Spotify",
          fallbackMessage: "",
        };
      }
      return {
        embedUrl: null,
        canEmbed: false,
        service: "Spotify",
        fallbackMessage: "Abriendo Spotify en nueva pestana.",
      };
    }

    // Wikipedia - use our content viewer for full control
    if (host.includes("wikipedia.org")) {
      return {
        embedUrl: url,
        canEmbed: true,
        service: "Wikipedia",
        fallbackMessage: "",
        useContentViewer: true,
      };
    }

    // Google - blocked
    if (host === "google.com" || host.includes("google.com")) {
      return {
        embedUrl: null,
        canEmbed: false,
        service: "Google",
        fallbackMessage: "Abriendo Google en nueva pestana.",
      };
    }

    // Default - try iframe but warn about limited control
    return {
      embedUrl: url,
      canEmbed: true,
      service: "web",
      fallbackMessage: "",
    };
  } catch {
    return {
      embedUrl: url,
      canEmbed: true,
      service: "web",
      fallbackMessage: "",
    };
  }
}

// ── Wikipedia Content Fetcher ───────────────────────────────────────────────

interface WikiContent {
  title: string;
  extract: string;
  sections: Array<{ title: string; content: string }>;
  loading: boolean;
  error: string | null;
}

async function fetchWikipediaContent(url: string): Promise<WikiContent> {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/");

    // Check if it's a search URL
    if (parsed.pathname.includes("Special:Search")) {
      const searchQuery = parsed.searchParams.get("search");
      if (searchQuery) {
        // Search for articles
        const searchRes = await fetch(
          `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`,
        );
        if (searchRes.ok) {
          const data = await searchRes.json();
          return {
            title: data.title || searchQuery,
            extract: data.extract || "No se encontro contenido.",
            sections: [],
            loading: false,
            error: null,
          };
        }
      }
      return {
        title: "Busqueda",
        extract: "No se encontraron resultados.",
        sections: [],
        loading: false,
        error: null,
      };
    }

    // Direct article URL
    const articleTitle = pathParts[pathParts.length - 1] || "Wikipedia";
    const lang = parsed.hostname.split(".")[0] || "es";

    // Try to get the summary
    const res = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(decodeURIComponent(articleTitle))}`,
    );

    if (res.ok) {
      const data = await res.json();

      // Also get more content
      const htmlRes = await fetch(
        `https://${lang}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(decodeURIComponent(articleTitle))}`,
      );

      let sections: Array<{ title: string; content: string }> = [];

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        // Parse sections from HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Get all section headings and their content
        const headings = doc.querySelectorAll("h2, h3");
        headings.forEach((heading) => {
          const title = heading.textContent?.trim() || "";
          if (
            title &&
            !title.includes("[editar]") &&
            title !== "Referencias" &&
            title !== "Enlaces externos" &&
            title !== "Véase también"
          ) {
            let content = "";
            let sibling = heading.nextElementSibling;
            while (sibling && !["H2", "H3"].includes(sibling.tagName)) {
              if (sibling.tagName === "P") {
                content += sibling.textContent + "\n\n";
              }
              sibling = sibling.nextElementSibling;
            }
            if (content.trim()) {
              sections.push({ title, content: content.trim() });
            }
          }
        });
      }

      return {
        title: data.title || articleTitle,
        extract: data.extract || "No hay resumen disponible.",
        sections: sections.slice(0, 10), // Limit to 10 sections
        loading: false,
        error: null,
      };
    }

    // If not found, show homepage message
    return {
      title: "Wikipedia",
      extract:
        "Bienvenido a Wikipedia, la enciclopedia libre. Pideme que busque cualquier tema, por ejemplo: 'busca Albert Einstein en Wikipedia'.",
      sections: [],
      loading: false,
      error: null,
    };
  } catch (error) {
    return {
      title: "Error",
      extract: "No se pudo cargar el contenido de Wikipedia.",
      sections: [],
      loading: false,
      error: "Error al cargar",
    };
  }
}

// ── Viewer controls interface ───────────────────────────────────────────────

export interface ViewerControls {
  playVideo: () => string;
  pauseVideo: () => string;
  togglePlayPause: () => string;
  muteVideo: () => string;
  unmuteVideo: () => string;
  toggleMute: () => string;
  setVolume: (volume: number) => string;
  seekTo: (seconds: number) => string;
  seekForward: (seconds?: number) => string;
  seekBackward: (seconds?: number) => string;
  scrollPage: (
    direction: "up" | "down",
    amount?: "small" | "medium" | "large",
  ) => string;
  scrollToTop: () => string;
  scrollToBottom: () => string;
  getInfo: () => string;
  isPlaying: boolean;
  isMuted: boolean;
  currentVolume: number;
}

// ── Wikipedia Content Viewer ────────────────────────────────────────────────

interface WikiViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

function WikipediaViewer({ url, title, onClose, scrollRef }: WikiViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [content, setContent] = useState<WikiContent>({
    title: title || "Wikipedia",
    extract: "",
    sections: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    fetchWikipediaContent(url).then(setContent);
  }, [url]);

  return (
    <div
      className={`flex flex-col bg-background border border-border overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-40 rounded-none"
          : "rounded-2xl shadow-2xl h-full"
      }`}
      role="region"
      aria-label={`Wikipedia: ${content.title}`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`w-2 h-2 rounded-full ${content.loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}
          />
          <span className="text-[11px] font-medium text-muted-foreground">
            Wikipedia
          </span>
        </div>

        <div className="flex-1 flex items-center gap-2 bg-background/60 border border-border/50 rounded-lg px-3 py-1.5 min-w-0">
          <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {content.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            aria-label="Abrir en nueva pestana"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Content - scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 scroll-smooth"
        data-scrollable-content
      >
        {content.loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Cargando contenido...
            </p>
          </div>
        ) : content.error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
            <p className="text-muted-foreground">{content.error}</p>
          </div>
        ) : (
          <article className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {content.title}
            </h1>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {content.extract}
              </p>

              {content.sections.map((section, index) => (
                <div key={index} className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2 border-b border-border pb-1">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </article>
        )}
      </div>

      {/* Scroll hint */}
      <div className="px-3 py-1.5 bg-muted/30 border-t border-border text-center shrink-0">
        <p className="text-[10px] text-muted-foreground">
          Di "scroll abajo", "scroll arriba", "ir al inicio", "ir al final" para
          navegar
        </p>
      </div>
    </div>
  );
}

// ── WebViewer Component (iframes for YouTube/Spotify) ───────────────────────

interface WebViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
  onFallbackToNewTab: (url: string, message: string) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

function IframeViewer({
  url,
  title,
  onClose,
  onFallbackToNewTab,
  iframeRef,
  onPlayStateChange,
}: WebViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [embedInfo] = useState(() => getEmbedInfo(url));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  useEffect(() => {
    if (!embedInfo.canEmbed) {
      window.open(url, "_blank", "noopener,noreferrer");
      onFallbackToNewTab(url, embedInfo.fallbackMessage);
      onClose();
    }
  }, [
    embedInfo.canEmbed,
    url,
    onClose,
    onFallbackToNewTab,
    embedInfo.fallbackMessage,
  ]);

  const postYTCommand = useCallback(
    (func: string, args?: unknown) => {
      const iframe = iframeRef.current;
      if (!iframe) return false;
      try {
        const message = JSON.stringify({
          event: "command",
          func,
          args: args !== undefined ? [args] : [],
        });
        iframe.contentWindow?.postMessage(message, "https://www.youtube.com");
        return true;
      } catch {
        return false;
      }
    },
    [iframeRef],
  );

  const handlePlay = () => {
    if (embedInfo.service === "YouTube") {
      postYTCommand("playVideo");
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (embedInfo.service === "YouTube") {
      postYTCommand("pauseVideo");
      setIsPlaying(false);
    }
  };

  const handleMute = () => {
    if (embedInfo.service === "YouTube") {
      postYTCommand("mute");
      setIsMuted(true);
    }
  };

  const handleUnmute = () => {
    if (embedInfo.service === "YouTube") {
      postYTCommand("unMute");
      setIsMuted(false);
    }
  };

  const handleSeekForward = () => {
    if (embedInfo.service === "YouTube") {
      postYTCommand("seekTo", 10);
    }
  };

  const handleSeekBackward = () => {
    if (embedInfo.service === "YouTube") {
      postYTCommand("seekTo", 0);
    }
  };

  if (!embedInfo.canEmbed) return null;

  const displayUrl = embedInfo.embedUrl || url;
  const isYouTube = embedInfo.service === "YouTube";
  const isSpotify = embedInfo.service === "Spotify";

  return (
    <div
      className={`flex flex-col bg-background border border-border overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-40 rounded-none"
          : "rounded-2xl shadow-2xl h-full"
      }`}
      role="region"
      aria-label={`Visor: ${title || embedInfo.service}`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            className={`w-2 h-2 rounded-full ${
              iframeError
                ? "bg-red-500"
                : isLoading
                  ? "bg-amber-500 animate-pulse"
                  : "bg-emerald-500"
            }`}
          />
          <span className="text-[11px] font-medium text-muted-foreground">
            {embedInfo.service}
          </span>
        </div>

        {/* Media controls for YouTube */}
        {isYouTube && !isLoading && !iframeError && (
          <div className="flex items-center gap-0.5 px-1 border-l border-border ml-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleSeekBackward}
              aria-label="Retroceder"
            >
              <SkipBack className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={isPlaying ? handlePause : handlePlay}
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleSeekForward}
              aria-label="Adelantar"
            >
              <SkipForward className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={isMuted ? handleUnmute : handleMute}
              aria-label={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </Button>
          </div>
        )}

        <div className="flex-1 flex items-center gap-2 bg-background/60 border border-border/50 rounded-lg px-3 py-1.5 min-w-0">
          <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {title || url}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            aria-label="Abrir en nueva pestana"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="h-1 bg-muted w-full overflow-hidden shrink-0">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-progress-bar" />
        </div>
      )}

      {/* Content */}
      <div
        className={`flex-1 relative min-h-0 ${isSpotify ? "max-h-[400px]" : ""}`}
      >
        {iframeError ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No se pudo cargar
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Este sitio no permite mostrarse dentro de la app.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  window.open(url, "_blank", "noopener,noreferrer")
                }
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir en nueva pestana
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Cargando {embedInfo.service}...
                  </p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              id="web-viewer-iframe"
              src={displayUrl}
              className={`w-full border-0 ${isSpotify ? "h-[380px]" : "h-full"}`}
              title={title || "Contenido web"}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation allow-popups-to-escape-sandbox"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write"
              referrerPolicy="no-referrer"
              onLoad={() => {
                setIsLoading(false);
                if (embedInfo.service === "YouTube") {
                  setIsPlaying(true);
                }
              }}
              onError={() => {
                setIsLoading(false);
                setIframeError(true);
              }}
            />
          </>
        )}
      </div>

      {/* Voice control hint */}
      {!isLoading && !iframeError && (isYouTube || isSpotify) && (
        <div className="px-3 py-1.5 bg-muted/30 border-t border-border text-center shrink-0">
          <p className="text-[10px] text-muted-foreground">
            Di "pausa", "reproduce", "sube volumen", "baja volumen", "adelanta",
            "retrocede"
          </p>
        </div>
      )}
    </div>
  );
}

// ── Context ─────────────────────────────────────────────────────────────────

interface WebViewerState {
  isOpen: boolean;
  url: string | null;
  title: string | null;
  service: string | null;
  openUrl: (url: string, title?: string) => void;
  closeViewer: () => void;
  lastFallbackMessage: string | null;
  controls: ViewerControls;
}

const noop = () => "No hay pagina abierta.";
const defaultControls: ViewerControls = {
  playVideo: noop,
  pauseVideo: noop,
  togglePlayPause: noop,
  muteVideo: noop,
  unmuteVideo: noop,
  toggleMute: noop,
  setVolume: () => noop(),
  seekTo: () => noop(),
  seekForward: () => noop(),
  seekBackward: () => noop(),
  scrollPage: () => noop(),
  scrollToTop: noop,
  scrollToBottom: noop,
  getInfo: noop,
  isPlaying: false,
  isMuted: false,
  currentVolume: 70,
};

const WebViewerContext = createContext<WebViewerState>({
  isOpen: false,
  url: null,
  title: null,
  service: null,
  openUrl: () => {},
  closeViewer: () => {},
  lastFallbackMessage: null,
  controls: defaultControls,
});

export function useWebViewer() {
  return useContext(WebViewerContext);
}

export function WebViewerProvider({ children }: { children: ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [state, setState] = useState<{
    isOpen: boolean;
    url: string | null;
    title: string | null;
    service: string | null;
    lastFallbackMessage: string | null;
    useContentViewer: boolean;
  }>({
    isOpen: false,
    url: null,
    title: null,
    service: null,
    lastFallbackMessage: null,
    useContentViewer: false,
  });

  const [playState, setPlayState] = useState({
    isPlaying: false,
    isMuted: false,
    currentVolume: 70,
  });

  // YouTube postMessage helper
  const postYTCommand = useCallback((func: string, args?: unknown) => {
    const iframe = iframeRef.current;
    if (!iframe) return false;
    try {
      const message = JSON.stringify({
        event: "command",
        func,
        args: args !== undefined ? [args] : [],
      });
      iframe.contentWindow?.postMessage(message, "https://www.youtube.com");
      return true;
    } catch {
      return false;
    }
  }, []);

  // Controls
  const controls: ViewerControls = {
    isPlaying: playState.isPlaying,
    isMuted: playState.isMuted,
    currentVolume: playState.currentVolume,

    playVideo: useCallback(() => {
      if (!state.isOpen) return "No hay pagina abierta.";
      if (iframeRef.current?.src.includes("youtube")) {
        postYTCommand("playVideo");
        setPlayState((p) => ({ ...p, isPlaying: true }));
        return "Reproduciendo el video.";
      }
      return "No hay video para reproducir en esta pagina.";
    }, [state.isOpen, postYTCommand]),

    pauseVideo: useCallback(() => {
      if (!state.isOpen) return "No hay pagina abierta.";
      if (iframeRef.current?.src.includes("youtube")) {
        postYTCommand("pauseVideo");
        setPlayState((p) => ({ ...p, isPlaying: false }));
        return "Video pausado.";
      }
      return "No hay video para pausar.";
    }, [state.isOpen, postYTCommand]),

    togglePlayPause: useCallback(() => {
      if (!state.isOpen) return "No hay pagina abierta.";
      if (iframeRef.current?.src.includes("youtube")) {
        if (playState.isPlaying) {
          postYTCommand("pauseVideo");
          setPlayState((p) => ({ ...p, isPlaying: false }));
          return "Video pausado.";
        } else {
          postYTCommand("playVideo");
          setPlayState((p) => ({ ...p, isPlaying: true }));
          return "Reproduciendo.";
        }
      }
      return "No hay video para controlar.";
    }, [state.isOpen, postYTCommand, playState.isPlaying]),

    muteVideo: useCallback(() => {
      if (!state.isOpen) return "No hay pagina abierta.";
      if (iframeRef.current?.src.includes("youtube")) {
        postYTCommand("mute");
        setPlayState((p) => ({ ...p, isMuted: true }));
        return "Silenciado.";
      }
      return "No puedo silenciar esta pagina.";
    }, [state.isOpen, postYTCommand]),

    unmuteVideo: useCallback(() => {
      if (!state.isOpen) return "No hay pagina abierta.";
      if (iframeRef.current?.src.includes("youtube")) {
        postYTCommand("unMute");
        setPlayState((p) => ({ ...p, isMuted: false }));
        return "Sonido activado.";
      }
      return "No puedo activar el sonido en esta pagina.";
    }, [state.isOpen, postYTCommand]),

    toggleMute: useCallback(() => {
      if (!state.isOpen) return "No hay pagina abierta.";
      if (iframeRef.current?.src.includes("youtube")) {
        if (playState.isMuted) {
          postYTCommand("unMute");
          setPlayState((p) => ({ ...p, isMuted: false }));
          return "Sonido activado.";
        } else {
          postYTCommand("mute");
          setPlayState((p) => ({ ...p, isMuted: true }));
          return "Silenciado.";
        }
      }
      return "No puedo controlar el audio.";
    }, [state.isOpen, postYTCommand, playState.isMuted]),

    setVolume: useCallback(
      (volume: number) => {
        if (!state.isOpen) return "No hay pagina abierta.";
        const clamped = Math.max(0, Math.min(100, volume));
        if (iframeRef.current?.src.includes("youtube")) {
          postYTCommand("setVolume", clamped);
          setPlayState((p) => ({
            ...p,
            currentVolume: clamped,
            isMuted: clamped === 0,
          }));
          return `Volumen al ${clamped} por ciento.`;
        }
        return "No puedo cambiar el volumen.";
      },
      [state.isOpen, postYTCommand],
    ),

    seekTo: useCallback(
      (seconds: number) => {
        if (!state.isOpen) return "No hay pagina abierta.";
        if (iframeRef.current?.src.includes("youtube")) {
          postYTCommand("seekTo", Math.max(0, seconds));
          return seconds >= 0
            ? `Adelantando ${seconds} segundos.`
            : `Retrocediendo ${Math.abs(seconds)} segundos.`;
        }
        return "No puedo avanzar en esta pagina.";
      },
      [state.isOpen, postYTCommand],
    ),

    seekForward: useCallback(
      (seconds = 10) => {
        if (!state.isOpen) return "No hay pagina abierta.";
        if (iframeRef.current?.src.includes("youtube")) {
          postYTCommand("seekTo", seconds);
          return `Adelantando ${seconds} segundos.`;
        }
        return "No hay video para adelantar.";
      },
      [state.isOpen, postYTCommand],
    ),

    seekBackward: useCallback(
      (seconds = 10) => {
        if (!state.isOpen) return "No hay pagina abierta.";
        if (iframeRef.current?.src.includes("youtube")) {
          postYTCommand("seekTo", 0);
          return "Retrocediendo al inicio.";
        }
        return "No hay video para retroceder.";
      },
      [state.isOpen, postYTCommand],
    ),

    // SCROLL - This is the key function!
    scrollPage: useCallback(
      (
        direction: "up" | "down",
        amount: "small" | "medium" | "large" = "medium",
      ) => {
        if (!state.isOpen) return "No hay pagina abierta.";

        // Determine scroll amount
        const amounts = { small: 200, medium: 400, large: 800 };
        const pixels = amounts[amount] * (direction === "up" ? -1 : 1);

        // For Wikipedia (content viewer), use scrollRef
        if (state.useContentViewer && scrollRef.current) {
          scrollRef.current.scrollBy({ top: pixels, behavior: "smooth" });
          return direction === "down"
            ? "Desplazando hacia abajo."
            : "Desplazando hacia arriba.";
        }

        // For iframes, we can't scroll inside them (cross-origin)
        // But we can scroll the main page
        window.scrollBy({ top: pixels, behavior: "smooth" });
        return direction === "down"
          ? "Desplazando hacia abajo."
          : "Desplazando hacia arriba.";
      },
      [state.isOpen, state.useContentViewer],
    ),

    scrollToTop: useCallback(() => {
      if (!state.isOpen) return "No hay pagina abierta.";

      if (state.useContentViewer && scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        return "Yendo al inicio.";
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      return "Yendo al inicio.";
    }, [state.isOpen, state.useContentViewer]),

    scrollToBottom: useCallback(() => {
      if (!state.isOpen) return "No hay pagina abierta.";

      if (state.useContentViewer && scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
        return "Yendo al final.";
      }

      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return "Yendo al final.";
    }, [state.isOpen, state.useContentViewer]),

    getInfo: useCallback(() => {
      if (!state.isOpen) return "No hay ninguna pagina abierta.";

      const parts = [`Tienes abierta: ${state.title || "una pagina"}`];

      if (state.service === "YouTube") {
        parts.push(playState.isPlaying ? "reproduciendo" : "pausado");
        parts.push(`volumen: ${playState.currentVolume}%`);
        parts.push(
          "Comandos: pausa, reproduce, sube volumen, baja volumen, adelanta, retrocede, cierra",
        );
      } else if (state.service === "Spotify") {
        parts.push("Usa los controles del reproductor de Spotify");
      } else if (state.service === "Wikipedia") {
        parts.push(
          "Comandos: scroll abajo, scroll arriba, ir al inicio, ir al final, cierra",
        );
      } else {
        parts.push("Comandos: cierra, abre en nueva pestana");
      }

      return parts.join(". ");
    }, [state, playState]),
  };

  const openUrl = useCallback((url: string, title?: string) => {
    const info = getEmbedInfo(url);

    if (!info.canEmbed) {
      // Open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
      setState((prev) => ({
        ...prev,
        lastFallbackMessage: info.fallbackMessage,
      }));
      return;
    }

    setState({
      isOpen: true,
      url,
      title: title || null,
      service: info.service,
      lastFallbackMessage: null,
      useContentViewer: info.useContentViewer || false,
    });
    setPlayState({
      isPlaying: false,
      isMuted: false,
      currentVolume: 70,
    });
  }, []);

  const closeViewer = useCallback(() => {
    setState((prev) => ({
      isOpen: false,
      url: null,
      title: null,
      service: null,
      lastFallbackMessage: prev.lastFallbackMessage,
      useContentViewer: false,
    }));
  }, []);

  const handleFallbackToNewTab = useCallback(
    (_url: string, message: string) => {
      setState((prev) => ({ ...prev, lastFallbackMessage: message }));
    },
    [],
  );

  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    setPlayState((p) => ({ ...p, isPlaying }));
  }, []);

  return (
    <WebViewerContext.Provider
      value={{ ...state, openUrl, closeViewer, controls }}
    >
      {children}
      {state.isOpen && state.url && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-30 p-4 pt-2"
          data-viewer-container
        >
          {state.useContentViewer ? (
            <WikipediaViewer
              url={state.url}
              title={state.title || undefined}
              onClose={closeViewer}
              scrollRef={scrollRef}
            />
          ) : (
            <IframeViewer
              url={state.url}
              title={state.title || undefined}
              onClose={closeViewer}
              onFallbackToNewTab={handleFallbackToNewTab}
              iframeRef={iframeRef}
              onPlayStateChange={handlePlayStateChange}
            />
          )}
        </div>
      )}
    </WebViewerContext.Provider>
  );
}
