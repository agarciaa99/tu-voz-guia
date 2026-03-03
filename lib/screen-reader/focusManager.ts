"use client";

/**
 * Focus Manager
 * Handles focus management and visual indicators for the screen reader
 */

import type { AccessibleNode } from "./accessibilityModel";

const FOCUS_CLASS = "sr-focus-highlight";
const FOCUS_STYLES = `
  .${FOCUS_CLASS} {
    outline: 3px solid #4F46E5 !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 6px rgba(79, 70, 229, 0.3) !important;
    transition: outline 0.15s ease, box-shadow 0.15s ease !important;
  }
`;

let styleElement: HTMLStyleElement | null = null;
let currentHighlightedElement: HTMLElement | null = null;

/**
 * Inject focus styles into the document
 */
export function injectFocusStyles(): void {
  if (typeof document === "undefined") return;
  if (styleElement) return;

  styleElement = document.createElement("style");
  styleElement.id = "sr-focus-styles";
  styleElement.textContent = FOCUS_STYLES;
  document.head.appendChild(styleElement);
}

/**
 * Remove focus styles from document
 */
export function removeFocusStyles(): void {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}

/**
 * Clear current highlight
 */
export function clearHighlight(): void {
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove(FOCUS_CLASS);
    currentHighlightedElement = null;
  }
}

/**
 * Check if element is focusable
 */
function isFocusable(element: HTMLElement): boolean {
  const focusableTags = ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"];
  if (focusableTags.includes(element.tagName)) return true;

  const tabindex = element.getAttribute("tabindex");
  if (tabindex !== null && tabindex !== "-1") return true;

  if (element.contentEditable === "true") return true;

  return false;
}

/**
 * Make element focusable if it isn't
 */
function ensureFocusable(element: HTMLElement): void {
  if (!isFocusable(element)) {
    element.setAttribute("tabindex", "-1");
  }
}

/**
 * Set focus to an accessible node
 */
export function setFocus(
  node: AccessibleNode,
  options: {
    scrollBehavior?: ScrollBehavior;
    highlight?: boolean;
    announce?: boolean;
  } = {},
): {
  success: boolean;
  announcement: string;
} {
  const {
    scrollBehavior = "smooth",
    highlight = true,
    announce = true,
  } = options;

  const element = node.element;

  // Check if element still exists in DOM
  if (!document.body.contains(element)) {
    return {
      success: false,
      announcement: "El elemento ya no esta disponible en la pagina.",
    };
  }

  // Clear previous highlight
  clearHighlight();

  // Ensure element is focusable
  ensureFocusable(element);

  // Focus the element
  try {
    element.focus({ preventScroll: true });
  } catch {
    // Some elements may throw on focus
  }

  // Scroll into view
  try {
    element.scrollIntoView({
      behavior: scrollBehavior,
      block: "center",
      inline: "nearest",
    });
  } catch {
    // Fallback scroll
    element.scrollIntoView();
  }

  // Apply highlight
  if (highlight) {
    element.classList.add(FOCUS_CLASS);
    currentHighlightedElement = element;
  }

  // Generate announcement
  let announcement = "";

  if (announce) {
    // Type prefix
    const typeLabels: Record<string, string> = {
      heading: node.level ? `Encabezado nivel ${node.level}` : "Encabezado",
      button: "Boton",
      link: "Enlace",
      input: "Campo",
      landmark: "Region",
      interactive: "Elemento interactivo",
      text: "Texto",
    };

    const typeLabel = typeLabels[node.type] || "Elemento";
    announcement = `${typeLabel}: ${node.label}`;

    // Add state information for inputs
    if (node.type === "input") {
      const input = element as HTMLInputElement;
      if (input.type === "checkbox" || input.type === "radio") {
        announcement += input.checked ? ". Marcado" : ". No marcado";
      } else if (input.value) {
        announcement += `. Valor actual: ${input.value}`;
      }
    }

    // Add href for links
    if (node.type === "link") {
      const href = element.getAttribute("href");
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        // Just mention it's an external link if applicable
        if (
          href.startsWith("http") &&
          !href.includes(window.location.hostname)
        ) {
          announcement += ". Enlace externo";
        }
      }
    }
  }

  return {
    success: true,
    announcement,
  };
}

/**
 * Click on an element
 */
export function clickElement(node: AccessibleNode): {
  success: boolean;
  announcement: string;
} {
  const element = node.element;

  // Check if element still exists
  if (!document.body.contains(element)) {
    return {
      success: false,
      announcement: "El elemento ya no esta disponible.",
    };
  }

  try {
    // For links, simulate click
    if (node.type === "link") {
      const href = element.getAttribute("href");
      if (href) {
        element.click();
        return {
          success: true,
          announcement: `Activando enlace: ${node.label}`,
        };
      }
    }

    // For buttons and other clickables
    element.click();

    return {
      success: true,
      announcement: `Activando: ${node.label}`,
    };
  } catch (error) {
    return {
      success: false,
      announcement: "No se pudo activar el elemento.",
    };
  }
}

/**
 * Interact with an input element
 */
export function interactWithInput(
  node: AccessibleNode,
  action: "focus" | "clear" | "toggle",
): {
  success: boolean;
  announcement: string;
} {
  const element = node.element as HTMLInputElement;

  if (!document.body.contains(element)) {
    return {
      success: false,
      announcement: "El campo ya no esta disponible.",
    };
  }

  try {
    switch (action) {
      case "focus":
        element.focus();
        element.select?.();
        return {
          success: true,
          announcement: `Campo enfocado: ${node.label}. Puedes escribir ahora.`,
        };

      case "clear":
        element.value = "";
        element.dispatchEvent(new Event("input", { bubbles: true }));
        return {
          success: true,
          announcement: `Campo limpiado: ${node.label}`,
        };

      case "toggle":
        if (element.type === "checkbox" || element.type === "radio") {
          element.checked = !element.checked;
          element.dispatchEvent(new Event("change", { bubbles: true }));
          return {
            success: true,
            announcement: element.checked ? "Marcado" : "Desmarcado",
          };
        }
        return {
          success: false,
          announcement: "Este campo no se puede alternar.",
        };

      default:
        return {
          success: false,
          announcement: "Accion no reconocida.",
        };
    }
  } catch {
    return {
      success: false,
      announcement: "No se pudo interactuar con el campo.",
    };
  }
}

/**
 * Scroll the page
 */
export function scrollPage(
  direction: "up" | "down" | "top" | "bottom",
  amount: number = 500,
): string {
  try {
    switch (direction) {
      case "up":
        window.scrollBy({ top: -amount, behavior: "smooth" });
        return "Desplazando hacia arriba.";

      case "down":
        window.scrollBy({ top: amount, behavior: "smooth" });
        return "Desplazando hacia abajo.";

      case "top":
        window.scrollTo({ top: 0, behavior: "smooth" });
        return "Yendo al inicio de la pagina.";

      case "bottom":
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
        return "Yendo al final de la pagina.";

      default:
        return "Direccion no reconocida.";
    }
  } catch {
    return "No se pudo desplazar la pagina.";
  }
}
