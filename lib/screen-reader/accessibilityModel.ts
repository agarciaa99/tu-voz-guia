"use client";

/**
 * Accessibility Model
 * TypeScript types and model management for the screen reader
 */

export type NodeType =
  | "heading"
  | "button"
  | "link"
  | "input"
  | "landmark"
  | "interactive"
  | "text";

export interface AccessibleNode {
  id: string;
  type: NodeType;
  label: string;
  level?: number; // For headings (1-6)
  element: HTMLElement;
  rect?: DOMRect;
}

export interface AccessibilityModelState {
  nodes: AccessibleNode[];
  nodesByType: Map<NodeType, AccessibleNode[]>;
  currentIndex: number;
  currentNode: AccessibleNode | null;
  lastUpdated: number;
}

/**
 * Create indexes by node type for fast navigation
 */
export function createTypeIndexes(
  nodes: AccessibleNode[],
): Map<NodeType, AccessibleNode[]> {
  const indexes = new Map<NodeType, AccessibleNode[]>();

  const types: NodeType[] = [
    "heading",
    "button",
    "link",
    "input",
    "landmark",
    "interactive",
    "text",
  ];
  types.forEach((type) => indexes.set(type, []));

  nodes.forEach((node) => {
    const typeNodes = indexes.get(node.type);
    if (typeNodes) {
      typeNodes.push(node);
    }
  });

  return indexes;
}

/**
 * Find next node of a specific type
 */
export function findNextByType(
  nodes: AccessibleNode[],
  currentIndex: number,
  type: NodeType,
): { node: AccessibleNode; index: number } | null {
  for (let i = currentIndex + 1; i < nodes.length; i++) {
    if (nodes[i].type === type) {
      return { node: nodes[i], index: i };
    }
  }
  // Wrap around
  for (let i = 0; i <= currentIndex; i++) {
    if (nodes[i].type === type) {
      return { node: nodes[i], index: i };
    }
  }
  return null;
}

/**
 * Find previous node of a specific type
 */
export function findPrevByType(
  nodes: AccessibleNode[],
  currentIndex: number,
  type: NodeType,
): { node: AccessibleNode; index: number } | null {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (nodes[i].type === type) {
      return { node: nodes[i], index: i };
    }
  }
  // Wrap around
  for (let i = nodes.length - 1; i >= currentIndex; i--) {
    if (nodes[i].type === type) {
      return { node: nodes[i], index: i };
    }
  }
  return null;
}

/**
 * Find node by ID
 */
export function findNodeById(
  nodes: AccessibleNode[],
  id: string,
): { node: AccessibleNode; index: number } | null {
  const index = nodes.findIndex((n) => n.id === id);
  if (index !== -1) {
    return { node: nodes[index], index };
  }
  return null;
}

/**
 * Find nodes matching a search query
 */
export function searchNodes(
  nodes: AccessibleNode[],
  query: string,
): AccessibleNode[] {
  const normalizedQuery = query.toLowerCase().trim();

  return nodes.filter((node) => {
    const normalizedLabel = node.label.toLowerCase();
    return normalizedLabel.includes(normalizedQuery);
  });
}

/**
 * Get statistics about the accessibility model
 */
export function getModelStats(nodes: AccessibleNode[]): {
  total: number;
  byType: Record<NodeType, number>;
  headingLevels: Record<number, number>;
} {
  const byType: Record<NodeType, number> = {
    heading: 0,
    button: 0,
    link: 0,
    input: 0,
    landmark: 0,
    interactive: 0,
    text: 0,
  };

  const headingLevels: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };

  nodes.forEach((node) => {
    byType[node.type]++;
    if (node.type === "heading" && node.level) {
      headingLevels[node.level]++;
    }
  });

  return {
    total: nodes.length,
    byType,
    headingLevels,
  };
}

/**
 * Generate a summary of the page structure
 */
export function generatePageSummary(nodes: AccessibleNode[]): string {
  const stats = getModelStats(nodes);

  const parts: string[] = [];

  // Page structure
  parts.push(`Esta pagina tiene ${stats.total} elementos navegables.`);

  // Headings
  if (stats.byType.heading > 0) {
    parts.push(`${stats.byType.heading} encabezados.`);
  }

  // Links
  if (stats.byType.link > 0) {
    parts.push(`${stats.byType.link} enlaces.`);
  }

  // Buttons
  if (stats.byType.button > 0) {
    parts.push(`${stats.byType.button} botones.`);
  }

  // Inputs
  if (stats.byType.input > 0) {
    parts.push(`${stats.byType.input} campos de entrada.`);
  }

  // Landmarks
  if (stats.byType.landmark > 0) {
    parts.push(`${stats.byType.landmark} regiones de pagina.`);
  }

  return parts.join(" ");
}
