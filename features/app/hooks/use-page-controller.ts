"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

interface PageAction {
  response: string;
  action?: string;
}

export function usePageController() {
  const router = useRouter();

  const findVideos = useCallback((): HTMLVideoElement[] => {
    return Array.from(document.querySelectorAll("video"));
  }, []);

  const findIframes = useCallback((): HTMLIFrameElement[] => {
    return Array.from(document.querySelectorAll("iframe")).filter(
      (iframe) =>
        iframe.src.includes("youtube") ||
        iframe.src.includes("vimeo") ||
        iframe.src.includes("dailymotion"),
    );
  }, []);

  const getVideoByReference = useCallback(
    (ref: string): HTMLVideoElement | null => {
      const videos = findVideos();
      if (videos.length === 0) return null;

      const lower = ref.toLowerCase();
      if (
        lower.includes("primer") ||
        lower.includes("first") ||
        lower.includes("uno") ||
        lower.includes("1")
      ) {
        return videos[0] || null;
      }
      if (
        lower.includes("segund") ||
        lower.includes("second") ||
        lower.includes("dos") ||
        lower.includes("2")
      ) {
        return videos[1] || null;
      }
      if (
        lower.includes("tercer") ||
        lower.includes("third") ||
        lower.includes("tres") ||
        lower.includes("3")
      ) {
        return videos[2] || null;
      }
      if (lower.includes("ultim") || lower.includes("last")) {
        return videos[videos.length - 1] || null;
      }
      // Default to first video
      return videos[0] || null;
    },
    [findVideos],
  );

  const executeCommand = useCallback(
    (text: string): PageAction | null => {
      const lower = text.toLowerCase().trim();

      // --- Video controls ---

      // Play/Reproduce
      if (
        /(?:reproduce?|pon|play|inicia)\s+(?:el\s+)?(?:video|primer|segund|tercer|ultim)/i.test(
          lower,
        )
      ) {
        const video = getVideoByReference(lower);
        if (video) {
          video.play();
          video.scrollIntoView({ behavior: "smooth", block: "center" });
          return { response: "Reproduciendo el video.", action: "play_video" };
        }
        const iframes = findIframes();
        if (iframes.length > 0) {
          iframes[0].scrollIntoView({ behavior: "smooth", block: "center" });
          return {
            response:
              "Encontre un video embebido. Lo he puesto en pantalla. Para controlarlo tendras que interactuar directamente con el reproductor.",
            action: "scroll_to_video",
          };
        }
        return { response: "No encontre ningun video en esta pagina." };
      }

      // Pause/Pausa
      if (
        /(?:pausa|pause|detene?r?|para|stop)\s*(?:el\s+)?(?:video)?/i.test(
          lower,
        )
      ) {
        const videos = findVideos();
        const playing = videos.find((v) => !v.paused);
        if (playing) {
          playing.pause();
          return { response: "Video pausado.", action: "pause_video" };
        }
        return { response: "No hay ningun video reproduciendose." };
      }

      // Resume
      if (
        /(?:continua|resume|reanuda|sigue)\s*(?:el\s+)?(?:video)?/i.test(lower)
      ) {
        const videos = findVideos();
        const paused = videos.find((v) => v.paused && v.currentTime > 0);
        if (paused) {
          paused.play();
          return {
            response: "Continuando la reproduccion.",
            action: "resume_video",
          };
        }
        return { response: "No hay ningun video pausado." };
      }

      // Volume up
      if (/(?:sube?|aumenta|mas)\s*(?:el\s+)?(?:volumen|volume)/i.test(lower)) {
        const videos = findVideos();
        const active = videos.find((v) => !v.paused) || videos[0];
        if (active) {
          active.volume = Math.min(1, active.volume + 0.2);
          return {
            response: `Volumen subido a ${Math.round(active.volume * 100)}%.`,
            action: "volume_up",
          };
        }
        return { response: "No hay video para ajustar el volumen." };
      }

      // Volume down
      if (
        /(?:baja|reduce?|menos)\s*(?:el\s+)?(?:volumen|volume)/i.test(lower)
      ) {
        const videos = findVideos();
        const active = videos.find((v) => !v.paused) || videos[0];
        if (active) {
          active.volume = Math.max(0, active.volume - 0.2);
          return {
            response: `Volumen bajado a ${Math.round(active.volume * 100)}%.`,
            action: "volume_down",
          };
        }
        return { response: "No hay video para ajustar el volumen." };
      }

      // Mute/Silenciar
      if (
        /(?:silencia|mute|mutea|quita\s+(?:el\s+)?(?:sonido|audio))/i.test(
          lower,
        )
      ) {
        const videos = findVideos();
        const active = videos.find((v) => !v.paused) || videos[0];
        if (active) {
          active.muted = !active.muted;
          return {
            response: active.muted ? "Video silenciado." : "Sonido restaurado.",
            action: "toggle_mute",
          };
        }
        return { response: "No hay video para silenciar." };
      }

      // Fast forward / Adelantar
      if (
        /(?:adelanta|avanza|forward|salta)\s*(?:el\s+)?(?:video)?\s*(?:(\d+)\s*(?:segundos?)?)?/i.test(
          lower,
        )
      ) {
        const match = lower.match(/(\d+)/);
        const seconds = match ? Number.parseInt(match[1]) : 10;
        const videos = findVideos();
        const active = videos.find((v) => !v.paused) || videos[0];
        if (active) {
          active.currentTime = Math.min(
            active.duration,
            active.currentTime + seconds,
          );
          return {
            response: `Adelantado ${seconds} segundos.`,
            action: "fast_forward",
          };
        }
        return { response: "No hay video para adelantar." };
      }

      // Rewind / Retroceder
      if (
        /(?:retrocede?|atrasa?|rewind|regresa)\s*(?:el\s+)?(?:video)?\s*(?:(\d+)\s*(?:segundos?)?)?/i.test(
          lower,
        )
      ) {
        const match = lower.match(/(\d+)/);
        const seconds = match ? Number.parseInt(match[1]) : 10;
        const videos = findVideos();
        const active = videos.find((v) => !v.paused) || videos[0];
        if (active) {
          active.currentTime = Math.max(0, active.currentTime - seconds);
          return {
            response: `Retrocedido ${seconds} segundos.`,
            action: "rewind",
          };
        }
        return { response: "No hay video para retroceder." };
      }

      // Fullscreen
      if (
        /(?:pantalla\s+completa|fullscreen|maximiza)\s*(?:el\s+)?(?:video)?/i.test(
          lower,
        )
      ) {
        const videos = findVideos();
        const active = videos.find((v) => !v.paused) || videos[0];
        if (active) {
          active.requestFullscreen?.();
          return {
            response: "Video en pantalla completa.",
            action: "fullscreen",
          };
        }
        return { response: "No hay video para poner en pantalla completa." };
      }

      // --- Page scroll ---

      if (
        /(?:sube?|scroll\s+(?:up|arriba)|ve?\s+(?:para\s+)?arriba|top)/i.test(
          lower,
        )
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return {
          response: "Subiendo al inicio de la pagina.",
          action: "scroll_top",
        };
      }

      if (
        /(?:baja|scroll\s+(?:down|abajo)|ve?\s+(?:para\s+)?abajo|bottom)/i.test(
          lower,
        )
      ) {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
        return {
          response: "Bajando al final de la pagina.",
          action: "scroll_bottom",
        };
      }

      // --- Navigation ---

      if (
        /(?:ve?\s+(?:a\s+)?(?:la\s+)?configuracion|settings|ajustes)/i.test(
          lower,
        )
      ) {
        router.push("/app/settings");
        return {
          response: "Navegando a la pagina de configuracion.",
          action: "navigate",
        };
      }

      if (/(?:ve?\s+(?:a\s+)?(?:el\s+)?historial|history)/i.test(lower)) {
        router.push("/app/history");
        return {
          response: "Navegando al historial de busquedas.",
          action: "navigate",
        };
      }

      if (
        /(?:ve?\s+(?:a\s+)?(?:el\s+)?inicio|home|pagina\s+principal)/i.test(
          lower,
        )
      ) {
        router.push("/app");
        return {
          response: "Navegando a la pagina principal.",
          action: "navigate",
        };
      }

      // --- Page info ---

      if (
        /(?:que\s+hay\s+(?:en\s+)?(?:esta|la)\s+pagina|describe?\s+(?:esta|la)\s+pagina|que\s+veo)/i.test(
          lower,
        )
      ) {
        const videos = findVideos();
        const iframes = findIframes();
        const headings = Array.from(
          document.querySelectorAll("h1, h2, h3"),
        ).map((h) => h.textContent?.trim());
        const links = document.querySelectorAll("a[href]").length;
        const images = document.querySelectorAll("img").length;

        const parts: string[] = [];
        if (headings.length > 0) {
          parts.push(`Titulos: ${headings.slice(0, 5).join(", ")}`);
        }
        parts.push(`${links} enlaces, ${images} imagenes`);
        if (videos.length > 0) parts.push(`${videos.length} video(s)`);
        if (iframes.length > 0)
          parts.push(`${iframes.length} video(s) embebido(s)`);

        return {
          response: `En esta pagina encontre: ${parts.join(". ")}.`,
          action: "describe_page",
        };
      }

      // Not a page control command
      return null;
    },
    [findVideos, findIframes, getVideoByReference, router],
  );

  return { executeCommand };
}
