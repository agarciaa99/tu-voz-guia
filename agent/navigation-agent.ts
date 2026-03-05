import type { AccessibleNode } from "@/lib/screen-reader/types";

export type NavigationAction =
  | { type: "focus"; node: AccessibleNode }
  | { type: "click"; node: AccessibleNode }
  | { type: "read"; node: AccessibleNode }
  | { type: "scroll"; direction: "up" | "down" | "top" | "bottom" }
  | { type: "none" };

export function resolveNavigationCommand(
  command: string,
  nodes: AccessibleNode[],
  currentNode: AccessibleNode | null,
): NavigationAction {
  const text = command.toLowerCase();

  if (text.includes("siguiente")) {
    if (!nodes.length) return { type: "none" };

    const index = nodes.findIndex((n) => n.id === currentNode?.id);

    const next = nodes[(index + 1) % nodes.length];

    return { type: "focus", node: next };
  }

  if (text.includes("anterior")) {
    if (!nodes.length) return { type: "none" };

    const index = nodes.findIndex((n) => n.id === currentNode?.id);

    const prev = nodes[(index - 1 + nodes.length) % nodes.length];

    return { type: "focus", node: prev };
  }

  if (text.includes("leer")) {
    if (!currentNode) return { type: "none" };

    return { type: "read", node: currentNode };
  }

  if (text.includes("clic") || text.includes("click")) {
    if (!currentNode) return { type: "none" };

    return { type: "click", node: currentNode };
  }

  if (text.includes("abajo")) {
    return { type: "scroll", direction: "down" };
  }

  if (text.includes("arriba")) {
    return { type: "scroll", direction: "up" };
  }

  return { type: "none" };
}
