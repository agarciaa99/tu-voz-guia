"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  VoiceCommandResult,
  VoiceCommandType,
} from "@/app/api/voice-command/route";
import type { ViewerControls } from "@/features/app/components/web-viewer";

interface ScreenReaderControls {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  goToNext: (
    type?: "heading" | "button" | "link" | "input" | "landmark",
  ) => void;
  goToPrevious: (
    type?: "heading" | "button" | "link" | "input" | "landmark",
  ) => void;
  clickCurrent: () => void;
  readPage: () => void;
  describePage: () => void;
  announcePosition: () => void;
  showHelp: () => void;
  executeCommand: (command: string) => Promise<void>;
}

interface VoiceControlOptions {
  // Callbacks
  onCommandExecuted?: (command: VoiceCommandType, response: string) => void;
  onError?: (error: string) => void;

  // Web viewer controls
  webViewerControls?: ViewerControls;

  // Web viewer state
  isViewerOpen?: boolean;
  viewerUrl?: string | null;
  viewerTitle?: string | null;
  viewerService?: string | null;

  // Web viewer actions
  openUrl?: (url: string, title?: string) => void;
  closeViewer?: () => void;

  // Speak function
  speak?: (text: string) => void;

  // Screen reader controls (optional)
  screenReaderControls?: ScreenReaderControls;
}

interface PageContext {
  pageTitle: string | null;
  service: string | null;
  url: string | null;
  hasYouTube: boolean;
  hasSpotify: boolean;
}

export function useVoiceControl(options: VoiceControlOptions) {
  const router = useRouter();
  const volumeRef = useRef(70); // Track current volume

  const {
    onCommandExecuted,
    onError,
    webViewerControls,
    isViewerOpen,
    viewerUrl,
    viewerTitle,
    viewerService,
    openUrl,
    closeViewer,
    speak,
    screenReaderControls,
  } = options;

  // Build current context for AI
  const getCurrentContext = useCallback((): PageContext => {
    const hasYouTube = viewerUrl?.includes("youtube") || false;
    const hasSpotify = viewerUrl?.includes("spotify") || false;

    return {
      pageTitle: viewerTitle || null,
      service: viewerService || null,
      url: viewerUrl || null,
      hasYouTube,
      hasSpotify,
    };
  }, [viewerUrl, viewerTitle, viewerService]);

  // Execute a command result
  const executeCommand = useCallback(
    async (result: VoiceCommandResult) => {
      if (!result.shouldExecute) {
        speak?.(result.response);
        onCommandExecuted?.(result.command, result.response);
        return result.response;
      }

      let response = result.response;

      switch (result.command) {
        // ─── Media Controls ────────────────────────────────────────────
        case "play":
          if (webViewerControls && isViewerOpen) {
            response = webViewerControls.playVideo();
          } else {
            response = "No hay ningun video para reproducir.";
          }
          break;

        case "pause":
        case "stop":
          if (webViewerControls && isViewerOpen) {
            response = webViewerControls.pauseVideo();
          } else {
            response = "No hay ningun video para pausar.";
          }
          break;

        case "mute":
          if (webViewerControls && isViewerOpen) {
            response = webViewerControls.muteVideo();
          } else {
            response = "No hay contenido para silenciar.";
          }
          break;

        case "unmute":
          if (webViewerControls && isViewerOpen) {
            response = webViewerControls.unmuteVideo();
          } else {
            response = "No hay contenido para activar el sonido.";
          }
          break;

        case "volume_up":
          if (webViewerControls && isViewerOpen) {
            volumeRef.current = Math.min(100, volumeRef.current + 20);
            response = webViewerControls.setVolume(volumeRef.current);
          } else {
            response = "No hay contenido para ajustar el volumen.";
          }
          break;

        case "volume_down":
          if (webViewerControls && isViewerOpen) {
            volumeRef.current = Math.max(0, volumeRef.current - 20);
            response = webViewerControls.setVolume(volumeRef.current);
          } else {
            response = "No hay contenido para ajustar el volumen.";
          }
          break;

        case "volume_set":
          if (
            webViewerControls &&
            isViewerOpen &&
            typeof result.value === "number"
          ) {
            volumeRef.current = Math.max(0, Math.min(100, result.value));
            response = webViewerControls.setVolume(volumeRef.current);
          } else {
            response = "No puedo ajustar el volumen.";
          }
          break;

        case "seek_forward":
          if (webViewerControls && isViewerOpen) {
            const seconds =
              typeof result.value === "number" ? result.value : 10;
            response = webViewerControls.seekTo(seconds);
          } else {
            response = "No hay video para adelantar.";
          }
          break;

        case "seek_backward":
          if (webViewerControls && isViewerOpen) {
            const seconds =
              typeof result.value === "number" ? -result.value : -10;
            response = webViewerControls.seekTo(seconds);
          } else {
            response = "No hay video para retroceder.";
          }
          break;

        case "fullscreen":
          if (isViewerOpen) {
            const iframe = document.getElementById("web-viewer-iframe");
            if (iframe) {
              iframe.requestFullscreen?.();
              response = "Poniendo en pantalla completa.";
            }
          } else {
            response = "No hay pagina para poner en pantalla completa.";
          }
          break;

        case "exit_fullscreen":
          if (document.fullscreenElement) {
            document.exitFullscreen?.();
            response = "Saliendo de pantalla completa.";
          }
          break;

        // ─── Navigation/Scroll ─────────────────────────────────────────
        case "scroll_down":
          if (isViewerOpen && webViewerControls) {
            response = webViewerControls.scrollPage("down", "medium");
          } else {
            window.scrollBy({ top: 500, behavior: "smooth" });
            response = "Desplazando hacia abajo.";
          }
          break;

        case "scroll_up":
          if (isViewerOpen && webViewerControls) {
            response = webViewerControls.scrollPage("up", "medium");
          } else {
            window.scrollBy({ top: -500, behavior: "smooth" });
            response = "Desplazando hacia arriba.";
          }
          break;

        case "scroll_to_top":
          if (isViewerOpen && webViewerControls) {
            response = webViewerControls.scrollToTop();
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
            response = "Yendo al inicio.";
          }
          break;

        case "scroll_to_bottom":
          if (isViewerOpen && webViewerControls) {
            response = webViewerControls.scrollToBottom();
          } else {
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth",
            });
            response = "Yendo al final.";
          }
          break;

        case "go_back":
          router.back();
          response = "Volviendo atras.";
          break;

        case "go_forward":
          router.forward();
          response = "Avanzando.";
          break;

        case "refresh":
          window.location.reload();
          response = "Recargando la pagina.";
          break;

        case "close_page":
          if (isViewerOpen && closeViewer) {
            closeViewer();
            response = "Cerrando la pagina.";
          } else {
            response = "No hay pagina abierta para cerrar.";
          }
          break;

        case "open_new_tab":
          if (viewerUrl) {
            window.open(viewerUrl, "_blank", "noopener,noreferrer");
            response = "Abriendo en nueva pestana.";
          } else {
            response = "No hay pagina para abrir en nueva pestana.";
          }
          break;

        // ─── App Navigation ────────────────────────────────────────────
        case "go_home":
          router.push("/app");
          response = "Yendo a la pagina principal.";
          break;

        case "go_settings":
          router.push("/app/settings");
          response = "Abriendo la configuracion.";
          break;

        case "go_history":
          router.push("/app/history");
          response = "Abriendo el historial.";
          break;

        // ─── Search/Open ───────────────────────────────────────────────
        case "search":
          if (result.url && openUrl) {
            openUrl(result.url, `Busqueda: ${result.value}`);
          } else if (result.value && openUrl) {
            openUrl(
              `https://www.google.com/search?q=${encodeURIComponent(String(result.value))}&hl=es`,
              `Busqueda: ${result.value}`,
            );
          }
          break;

        case "open_youtube":
          if (openUrl) {
            if (result.value) {
              openUrl(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(String(result.value))}`,
                `YouTube: ${result.value}`,
              );
            } else {
              openUrl("https://www.youtube.com", "YouTube");
            }
          }
          break;

        case "open_spotify":
          if (openUrl) {
            if (result.value) {
              openUrl(
                `https://open.spotify.com/search/${encodeURIComponent(String(result.value))}`,
                `Spotify: ${result.value}`,
              );
            } else {
              openUrl("https://open.spotify.com", "Spotify");
            }
          }
          break;

        case "open_google":
          if (openUrl) {
            if (result.value) {
              openUrl(
                `https://www.google.com/search?q=${encodeURIComponent(String(result.value))}&hl=es`,
                `Google: ${result.value}`,
              );
            } else {
              openUrl("https://www.google.com", "Google");
            }
          }
          break;

        case "open_maps":
          if (openUrl) {
            if (result.value) {
              openUrl(
                `https://www.google.com/maps/search/${encodeURIComponent(String(result.value))}`,
                `Maps: ${result.value}`,
              );
            } else {
              openUrl("https://www.google.com/maps", "Google Maps");
            }
          }
          break;

        case "open_wikipedia":
          if (openUrl) {
            if (result.value) {
              openUrl(
                `https://es.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(String(result.value))}`,
                `Wikipedia: ${result.value}`,
              );
            } else {
              openUrl("https://es.wikipedia.org", "Wikipedia");
            }
          }
          break;

        case "open_url":
          if (result.url && openUrl) {
            const title =
              result.value?.toString() ||
              new URL(result.url).hostname ||
              "Pagina web";
            openUrl(result.url, title);
          }
          break;

        // ─── Page Interaction ──────────────────────────────────────────
        case "describe_page":
          if (isViewerOpen && webViewerControls) {
            response = webViewerControls.getInfo();
          } else if (screenReaderControls) {
            screenReaderControls.describePage();
            return ""; // Screen reader handles announcement
          } else {
            response =
              "Estas en la pagina principal de Voxera. Puedo ayudarte a buscar en YouTube, Spotify, Google, Wikipedia, o abrir cualquier sitio web. Solo dime que necesitas.";
          }
          break;

        case "read_page":
          if (isViewerOpen) {
            response = `Tienes abierta: ${viewerTitle || "una pagina web"} en ${viewerService || "el navegador"}. Puedo pausar, reproducir, subir o bajar volumen, adelantar, retroceder, o cerrar la pagina.`;
          } else if (screenReaderControls) {
            screenReaderControls.readPage();
            return ""; // Screen reader handles reading
          } else {
            response =
              "No hay pagina abierta. Dime que quieres abrir o buscar.";
          }
          break;

        case "click_link":
        case "click_button":
          if (!isViewerOpen && screenReaderControls) {
            screenReaderControls.clickCurrent();
            response = "Activando elemento.";
          } else {
            response =
              "No puedo hacer clic en elementos dentro de paginas externas por seguridad del navegador. Pero puedo ayudarte a navegar, controlar videos, o abrir otras paginas.";
          }
          break;

        // ─── Screen Reader Navigation ──────────────────────────────────
        case "next_element" as VoiceCommandType:
          if (screenReaderControls) {
            screenReaderControls.goToNext();
            return ""; // The screen reader handles its own announcements
          }
          response = "No hay elementos para navegar.";
          break;

        case "previous_element" as VoiceCommandType:
          if (screenReaderControls) {
            screenReaderControls.goToPrevious();
            return "";
          }
          response = "No hay elementos para navegar.";
          break;

        case "next_heading" as VoiceCommandType:
          if (screenReaderControls) {
            screenReaderControls.goToNext("heading");
            return "";
          }
          response = "No hay encabezados para navegar.";
          break;

        case "next_link" as VoiceCommandType:
          if (screenReaderControls) {
            screenReaderControls.goToNext("link");
            return "";
          }
          response = "No hay enlaces para navegar.";
          break;

        case "next_button" as VoiceCommandType:
          if (screenReaderControls) {
            screenReaderControls.goToNext("button");
            return "";
          }
          response = "No hay botones para navegar.";
          break;

        case "toggle_screen_reader" as VoiceCommandType:
          if (screenReaderControls) {
            screenReaderControls.toggle();
            response = screenReaderControls.isEnabled
              ? "Lector de pantalla desactivado."
              : "Lector de pantalla activado.";
          }
          break;

        // ─── Utility ───────────────────────────────────────────────────
        case "help":
          if (!isViewerOpen && screenReaderControls) {
            screenReaderControls.showHelp();
            return "";
          }
          response =
            "Puedo ayudarte a: reproducir y pausar videos de YouTube, controlar el volumen, adelantar o retroceder, abrir paginas de YouTube, Spotify, Google, Wikipedia, Maps, hacer scroll en la pagina, navegar a configuracion o historial, y mucho mas. Solo dime que necesitas.";
          break;

        case "repeat":
          // This would need to be handled by the caller with the last message
          response = result.response;
          break;

        case "unknown":
        default:
          response =
            result.response ||
            "No entendi bien. Puedes decirme que quieres hacer?";
          break;
      }

      speak?.(response);
      onCommandExecuted?.(result.command, response);
      return response;
    },
    [
      webViewerControls,
      isViewerOpen,
      viewerUrl,
      viewerTitle,
      viewerService,
      openUrl,
      closeViewer,
      router,
      speak,
      onCommandExecuted,
      screenReaderControls,
    ],
  );

  // Process a voice transcript through the AI
  const processVoiceCommand = useCallback(
    async (transcript: string): Promise<string> => {
      try {
        const context = getCurrentContext();

        const response = await fetch("/api/voice-command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            currentContext: isViewerOpen ? context : null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process command");
        }

        const result: VoiceCommandResult = await response.json();
        return await executeCommand(result);
      } catch (error) {
        const errorMsg = "Error procesando el comando. Intenta de nuevo.";
        onError?.(errorMsg);
        speak?.(errorMsg);
        return errorMsg;
      }
    },
    [getCurrentContext, isViewerOpen, executeCommand, onError, speak],
  );

  return {
    processVoiceCommand,
    executeCommand,
    getCurrentContext,
  };
}
