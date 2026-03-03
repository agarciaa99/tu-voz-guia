"use server";

import { NextResponse } from "next/server";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

async function callGroqAPI(messages: GroqMessage[]): Promise<string> {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.3,
        max_tokens: 512,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

// Types of commands the AI can return
export type VoiceCommandType =
  // Media controls
  | "play"
  | "pause"
  | "stop"
  | "mute"
  | "unmute"
  | "volume_up"
  | "volume_down"
  | "volume_set"
  | "seek_forward"
  | "seek_backward"
  | "fullscreen"
  | "exit_fullscreen"
  // Navigation
  | "scroll_up"
  | "scroll_down"
  | "scroll_to_top"
  | "scroll_to_bottom"
  | "go_back"
  | "go_forward"
  | "refresh"
  | "close_page"
  | "open_new_tab"
  // App navigation
  | "go_home"
  | "go_settings"
  | "go_history"
  // Search/Open
  | "search"
  | "open_url"
  | "open_youtube"
  | "open_spotify"
  | "open_google"
  | "open_maps"
  | "open_wikipedia"
  // Interaction
  | "click_link"
  | "click_button"
  | "read_page"
  | "describe_page"
  // Screen reader navigation
  | "next_element"
  | "previous_element"
  | "next_heading"
  | "next_link"
  | "next_button"
  | "toggle_screen_reader"
  // Utility
  | "help"
  | "repeat"
  | "unknown";

export interface VoiceCommandResult {
  command: VoiceCommandType;
  value?: string | number;
  response: string;
  shouldExecute: boolean;
  url?: string;
  targetText?: string; // For click commands - the text of the element to click
}

export async function POST(request: Request) {
  try {
    const { transcript, currentContext } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    const systemPrompt = `Eres Voxera, un asistente de voz EXTREMADAMENTE INTELIGENTE para un navegador web accesible. Debes interpretar la INTENCION del usuario de manera precisa, incluso si el comando es vago o informal.

CONTEXTO ACTUAL:
${
  currentContext
    ? `- Pagina abierta: ${currentContext.pageTitle || "Ninguna"}
- Servicio: ${currentContext.service || "Ninguno"}
- URL: ${currentContext.url || "Ninguna"}
- Tiene video de YouTube: ${currentContext.hasYouTube ? "Si" : "No"}
- Tiene reproductor de Spotify: ${currentContext.hasSpotify ? "Si" : "No"}`
    : "- No hay pagina abierta"
}

REGLAS CRITICAS DE INTERPRETACION:
1. Si el usuario dice "abre X" SIN especificar busqueda, SIEMPRE abre la pagina principal de X
2. Si dice "abre youtube" -> pagina principal de YouTube (https://www.youtube.com)
3. Si dice "abre wikipedia" -> pagina principal de Wikipedia (https://es.wikipedia.org)
4. Si dice "busca X en youtube" -> busqueda de X en YouTube
5. Si dice "youtube bad bunny" -> busqueda de bad bunny en YouTube (hay algo despues del nombre del sitio)
6. INTERPRETA SINONIMOS: "ponme", "llevame a", "ve a", "entra a", "quiero ir a" = "abre"
7. Para sitios comunes SIN extension, genera la URL correcta:
   - youtube -> https://www.youtube.com
   - wikipedia -> https://es.wikipedia.org  
   - spotify -> https://open.spotify.com
   - google -> https://www.google.com
   - twitter/x -> https://twitter.com
   - facebook -> https://www.facebook.com
   - instagram -> https://www.instagram.com
   - reddit -> https://www.reddit.com
   - amazon -> https://www.amazon.com
   - netflix -> https://www.netflix.com
   - github -> https://github.com
   - twitch -> https://www.twitch.tv

COMANDOS DISPONIBLES:
- Media: play, pause, stop, mute, unmute, volume_up, volume_down, volume_set, seek_forward, seek_backward, fullscreen, exit_fullscreen
- Navegacion: scroll_up, scroll_down, scroll_to_top, scroll_to_bottom, go_back, go_forward, refresh, close_page, open_new_tab
- App: go_home, go_settings, go_history
- Abrir sitios: open_youtube, open_spotify, open_google, open_maps, open_wikipedia, open_url (para cualquier otro sitio)
- Busqueda: search (busqueda generica)
- Screen reader: next_element, previous_element, next_heading, next_link, next_button, toggle_screen_reader
- Utilidad: help, describe_page, read_page, unknown

COMANDOS DE NAVEGACION POR ELEMENTOS (Screen Reader):
- "siguiente", "siguiente elemento", "avanzar" -> next_element
- "anterior", "elemento anterior", "atras" -> previous_element
- "siguiente encabezado", "siguiente titulo" -> next_heading
- "siguiente enlace", "siguiente link" -> next_link
- "siguiente boton" -> next_button
- "activar lector", "lector de pantalla" -> toggle_screen_reader

RESPONDE SOLO JSON:
{
  "command": "nombre_comando",
  "value": null | string | number,
  "response": "respuesta breve en espanol",
  "shouldExecute": true | false,
  "url": "URL completa si aplica"
}

EJEMPLOS:
- "abre youtube" -> {"command":"open_youtube","value":null,"response":"Abriendo YouTube","shouldExecute":true,"url":"https://www.youtube.com"}
- "abre wikipedia" -> {"command":"open_wikipedia","value":null,"response":"Abriendo Wikipedia","shouldExecute":true,"url":"https://es.wikipedia.org"}
- "abre spotify" -> {"command":"open_spotify","value":null,"response":"Abriendo Spotify","shouldExecute":true,"url":"https://open.spotify.com"}
- "abre google" -> {"command":"open_google","value":null,"response":"Abriendo Google","shouldExecute":true,"url":"https://www.google.com"}
- "abre reddit" -> {"command":"open_url","value":"Reddit","response":"Abriendo Reddit","shouldExecute":true,"url":"https://www.reddit.com"}
- "abre amazon" -> {"command":"open_url","value":"Amazon","response":"Abriendo Amazon","shouldExecute":true,"url":"https://www.amazon.com"}
- "youtube bad bunny" -> {"command":"open_youtube","value":"bad bunny","response":"Buscando bad bunny en YouTube","shouldExecute":true,"url":"https://www.youtube.com/results?search_query=bad+bunny"}
- "busca gatos en youtube" -> {"command":"open_youtube","value":"gatos","response":"Buscando gatos en YouTube","shouldExecute":true,"url":"https://www.youtube.com/results?search_query=gatos"}
- "wikipedia albert einstein" -> {"command":"open_wikipedia","value":"albert einstein","response":"Buscando Albert Einstein en Wikipedia","shouldExecute":true,"url":"https://es.wikipedia.org/wiki/Special:Search?search=albert+einstein"}
- "llévame a instagram" -> {"command":"open_url","value":"Instagram","response":"Abriendo Instagram","shouldExecute":true,"url":"https://www.instagram.com"}
- "pausa" -> {"command":"pause","value":null,"response":"Pausando","shouldExecute":true}
- "sube el volumen" -> {"command":"volume_up","value":null,"response":"Subiendo volumen","shouldExecute":true}
- "scroll abajo" -> {"command":"scroll_down","value":null,"response":"Desplazando hacia abajo","shouldExecute":true}

IMPORTANTE: Si no hay contexto de video pero el usuario pide pausar/reproducir, responde con shouldExecute:false explicando que no hay video.`;

    const text = await callGroqAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript },
    ]);

    // Parse the response
    let result: VoiceCommandResult;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      result = {
        command: "unknown",
        response: "No entendi bien. Puedes repetir?",
        shouldExecute: false,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Voice command error:", error);
    return NextResponse.json(
      {
        command: "unknown",
        response: "Hubo un error procesando el comando. Intenta de nuevo.",
        shouldExecute: false,
      },
      { status: 200 },
    ); // Return 200 so the UI can handle it gracefully
  }
}
