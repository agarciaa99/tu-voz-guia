"use client";

/**
 * Command Processor
 * Processes voice commands and maps them to screen reader actions
 */

import type { AccessibleNode, NodeType } from "./accessibilityModel";

export type CommandType =
  // Navigation commands
  | "next"
  | "previous"
  | "next_heading"
  | "previous_heading"
  | "next_link"
  | "previous_link"
  | "next_button"
  | "previous_button"
  | "next_input"
  | "previous_input"
  | "next_landmark"
  | "previous_landmark"
  // Action commands
  | "click"
  | "activate"
  | "enter"
  | "toggle"
  | "clear"
  // Reading commands
  | "read_page"
  | "read_current"
  | "describe"
  | "summary"
  | "where_am_i"
  // Scroll commands
  | "scroll_down"
  | "scroll_up"
  | "go_to_top"
  | "go_to_bottom"
  // Speech control
  | "stop"
  | "pause"
  | "resume"
  | "slower"
  | "faster"
  // Help
  | "help"
  | "list_commands"
  // Search
  | "search"
  | "find"
  // Unknown - needs AI interpretation
  | "unknown";

export interface ProcessedCommand {
  type: CommandType;
  targetType?: NodeType;
  searchQuery?: string;
  rawCommand: string;
  confidence: number;
}

// Command patterns in Spanish
const COMMAND_PATTERNS: Array<{
  patterns: RegExp[];
  type: CommandType;
  targetType?: NodeType;
}> = [
  // Navigation - Next
  {
    patterns: [
      /^siguiente$/i,
      /^siguiente\s+elemento$/i,
      /^avanzar?$/i,
      /^ir\s+(?:al\s+)?siguiente$/i,
    ],
    type: "next",
  },
  {
    patterns: [
      /^siguiente\s+(?:encabezado|titulo)$/i,
      /^(?:ir\s+(?:al\s+)?)?siguiente\s+h\d?$/i,
    ],
    type: "next_heading",
    targetType: "heading",
  },
  {
    patterns: [/^siguiente\s+(?:enlace|link|vinculo)$/i],
    type: "next_link",
    targetType: "link",
  },
  {
    patterns: [/^siguiente\s+bot[oó]n$/i],
    type: "next_button",
    targetType: "button",
  },
  {
    patterns: [/^siguiente\s+(?:campo|entrada|input|formulario)$/i],
    type: "next_input",
    targetType: "input",
  },
  {
    patterns: [/^siguiente\s+(?:region|seccion|landmark)$/i],
    type: "next_landmark",
    targetType: "landmark",
  },

  // Navigation - Previous
  {
    patterns: [
      /^anterior$/i,
      /^(?:elemento\s+)?anterior$/i,
      /^retroceder?$/i,
      /^ir\s+(?:al\s+)?anterior$/i,
      /^atr[aá]s$/i,
    ],
    type: "previous",
  },
  {
    patterns: [
      /^(?:encabezado|titulo)\s+anterior$/i,
      /^anterior\s+(?:encabezado|titulo)$/i,
    ],
    type: "previous_heading",
    targetType: "heading",
  },
  {
    patterns: [
      /^(?:enlace|link)\s+anterior$/i,
      /^anterior\s+(?:enlace|link)$/i,
    ],
    type: "previous_link",
    targetType: "link",
  },
  {
    patterns: [/^bot[oó]n\s+anterior$/i, /^anterior\s+bot[oó]n$/i],
    type: "previous_button",
    targetType: "button",
  },
  {
    patterns: [
      /^(?:campo|entrada)\s+anterior$/i,
      /^anterior\s+(?:campo|entrada)$/i,
    ],
    type: "previous_input",
    targetType: "input",
  },

  // Actions
  {
    patterns: [
      /^(?:haz\s+)?clic$/i,
      /^(?:hacer\s+)?clic$/i,
      /^click$/i,
      /^pulsar?$/i,
      /^presionar?$/i,
    ],
    type: "click",
  },
  {
    patterns: [/^activar?$/i, /^ejecutar?$/i, /^abrir$/i],
    type: "activate",
  },
  {
    patterns: [/^enter$/i, /^entrar?$/i, /^enviar?$/i],
    type: "enter",
  },
  {
    patterns: [
      /^(?:marcar|desmarcar|alternar|toggle)$/i,
      /^cambiar\s+(?:estado|valor)$/i,
    ],
    type: "toggle",
  },
  {
    patterns: [/^(?:limpiar|borrar|vaciar)(?:\s+campo)?$/i, /^clear$/i],
    type: "clear",
  },

  // Reading
  {
    patterns: [
      /^leer?\s+(?:la\s+)?p[aá]gina$/i,
      /^leer?\s+todo$/i,
      /^leer?\s+contenido$/i,
      /^lee(?:me)?\s+(?:la\s+)?p[aá]gina$/i,
    ],
    type: "read_page",
  },
  {
    patterns: [
      /^leer?$/i,
      /^lee(?:me)?$/i,
      /^leer?\s+(?:esto|actual|elemento)$/i,
      /^(?:qu[eé]\s+)?dice$/i,
    ],
    type: "read_current",
  },
  {
    patterns: [
      /^describir?$/i,
      /^descripci[oó]n$/i,
      /^(?:qu[eé]\s+)?hay\s+(?:aqu[ií]|en\s+(?:la\s+)?p[aá]gina)$/i,
    ],
    type: "describe",
  },
  {
    patterns: [
      /^resumen$/i,
      /^resumir?$/i,
      /^(?:dame\s+(?:un\s+)?)?resumen(?:\s+de\s+(?:la\s+)?p[aá]gina)?$/i,
    ],
    type: "summary",
  },
  {
    patterns: [
      /^(?:d[oó]nde\s+)?estoy$/i,
      /^ubicaci[oó]n$/i,
      /^posici[oó]n$/i,
      /^(?:en\s+)?qu[eé]\s+(?:elemento|parte)$/i,
    ],
    type: "where_am_i",
  },

  // Scroll
  {
    patterns: [
      /^(?:bajar?|scroll\s+(?:down|abajo)|desplazar?\s+(?:hacia\s+)?abajo)$/i,
      /^abajo$/i,
      /^m[aá]s\s+abajo$/i,
    ],
    type: "scroll_down",
  },
  {
    patterns: [
      /^(?:subir?|scroll\s+(?:up|arriba)|desplazar?\s+(?:hacia\s+)?arriba)$/i,
      /^arriba$/i,
      /^m[aá]s\s+arriba$/i,
    ],
    type: "scroll_up",
  },
  {
    patterns: [
      /^(?:ir\s+(?:al\s+)?)?(?:inicio|principio|arriba\s+del\s+todo|top)$/i,
      /^(?:al\s+)?inicio(?:\s+de\s+(?:la\s+)?p[aá]gina)?$/i,
    ],
    type: "go_to_top",
  },
  {
    patterns: [
      /^(?:ir\s+(?:al\s+)?)?(?:final|fin|abajo\s+del\s+todo|bottom)$/i,
      /^(?:al\s+)?final(?:\s+de\s+(?:la\s+)?p[aá]gina)?$/i,
    ],
    type: "go_to_bottom",
  },

  // Speech control
  {
    patterns: [
      /^(?:para|detener?|stop|calla(?:te)?|silencio)$/i,
      /^deja\s+de\s+(?:hablar|leer)$/i,
    ],
    type: "stop",
  },
  {
    patterns: [/^pausar?$/i, /^pausa$/i],
    type: "pause",
  },
  {
    patterns: [/^(?:continuar?|reanudar?|seguir?)$/i, /^resume$/i],
    type: "resume",
  },
  {
    patterns: [
      /^(?:m[aá]s\s+)?(?:lento|despacio)$/i,
      /^(?:habla\s+)?m[aá]s\s+lento$/i,
    ],
    type: "slower",
  },
  {
    patterns: [
      /^(?:m[aá]s\s+)?r[aá]pido$/i,
      /^(?:habla\s+)?m[aá]s\s+r[aá]pido$/i,
    ],
    type: "faster",
  },

  // Help
  {
    patterns: [/^ayuda$/i, /^help$/i, /^(?:necesito\s+)?ayuda$/i],
    type: "help",
  },
  {
    patterns: [
      /^(?:lista(?:r)?\s+)?comandos$/i,
      /^(?:qu[eé]\s+)?(?:puedo\s+)?(?:decir|hacer)$/i,
      /^opciones$/i,
    ],
    type: "list_commands",
  },

  // Search
  {
    patterns: [/^buscar?\s+(.+)$/i, /^encontrar?\s+(.+)$/i, /^ir\s+a\s+(.+)$/i],
    type: "search",
  },
  {
    patterns: [/^(?:buscar?|encontrar?|d[oó]nde\s+(?:est[aá]|hay))\s+(.+)$/i],
    type: "find",
  },
];

/**
 * Process a voice command and return the action
 */
export function processCommand(rawCommand: string): ProcessedCommand {
  const normalizedCommand = rawCommand.toLowerCase().trim();

  // Try to match against patterns
  for (const { patterns, type, targetType } of COMMAND_PATTERNS) {
    for (const pattern of patterns) {
      const match = normalizedCommand.match(pattern);
      if (match) {
        const result: ProcessedCommand = {
          type,
          rawCommand,
          confidence: 1.0,
        };

        if (targetType) {
          result.targetType = targetType;
        }

        // Extract search query if present
        if ((type === "search" || type === "find") && match[1]) {
          result.searchQuery = match[1].trim();
        }

        return result;
      }
    }
  }

  // No match found - needs AI interpretation
  return {
    type: "unknown",
    rawCommand,
    confidence: 0,
  };
}

/**
 * Get help text for available commands
 */
export function getHelpText(): string {
  return `
    Comandos de navegacion:
    - "siguiente" o "anterior" para moverte entre elementos
    - "siguiente encabezado", "siguiente enlace", "siguiente boton" para navegar por tipo
    
    Comandos de accion:
    - "clic" o "activar" para interactuar con el elemento actual
    - "marcar" para checkboxes
    
    Comandos de lectura:
    - "leer pagina" para escuchar todo el contenido
    - "describir" para saber que hay en la pagina
    - "donde estoy" para conocer tu posicion actual
    
    Comandos de desplazamiento:
    - "bajar" o "subir" para hacer scroll
    - "ir al inicio" o "ir al final"
    
    Control de voz:
    - "para" o "silencio" para detener la lectura
    - "mas lento" o "mas rapido" para ajustar velocidad
    
    - "buscar" seguido de texto para encontrar elementos
    - "ayuda" para escuchar esta informacion
  `
    .trim()
    .replace(/^\s+/gm, "");
}

/**
 * Check if a command needs AI interpretation
 */
export function needsAIInterpretation(command: ProcessedCommand): boolean {
  return command.type === "unknown" || command.confidence < 0.5;
}

/**
 * Generate context for AI interpretation
 */
export function generateAIContext(
  command: string,
  nodes: AccessibleNode[],
  currentNode: AccessibleNode | null,
  currentIndex: number,
): {
  command: string;
  currentElement: string | null;
  availableElements: string[];
  position: string;
} {
  // Summarize available elements
  const elementSummary = nodes.slice(0, 20).map((node, i) => {
    const prefix = i === currentIndex ? "[ACTUAL] " : "";
    return `${prefix}${node.id}: ${node.type} - "${node.label.substring(0, 50)}"`;
  });

  return {
    command,
    currentElement: currentNode
      ? `${currentNode.type}: "${currentNode.label}"`
      : null,
    availableElements: elementSummary,
    position: `Elemento ${currentIndex + 1} de ${nodes.length}`,
  };
}
