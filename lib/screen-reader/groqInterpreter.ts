"use client";

/**
 * Groq Interpreter
 * Uses Groq AI to interpret complex voice commands
 */

import type { AccessibleNode } from "./accessibilityModel";

export interface AIInterpretationResult {
  action:
    | "focus"
    | "click"
    | "read"
    | "scroll"
    | "search"
    | "navigate"
    | "none";
  targetId?: string;
  targetType?: string;
  searchQuery?: string;
  scrollDirection?: "up" | "down" | "top" | "bottom";
  explanation: string;
  confidence: number;
}

export interface AIContext {
  command: string;
  currentElement: {
    id: string;
    type: string;
    label: string;
  } | null;
  pageElements: Array<{
    id: string;
    type: string;
    label: string;
  }>;
  pageContext: string;
}

/**
 * Build context for the AI
 */
export function buildAIContext(
  command: string,
  currentNode: AccessibleNode | null,
  nodes: AccessibleNode[],
  pageTitle?: string,
): AIContext {
  return {
    command,
    currentElement: currentNode
      ? {
          id: currentNode.id,
          type: currentNode.type,
          label: currentNode.label.substring(0, 100),
        }
      : null,
    pageElements: nodes.slice(0, 30).map((node) => ({
      id: node.id,
      type: node.type,
      label: node.label.substring(0, 80),
    })),
    pageContext: pageTitle || document.title || "Pagina web",
  };
}

/**
 * Interpret a command using Groq AI
 */
export async function interpretWithGroq(
  context: AIContext,
): Promise<AIInterpretationResult> {
  try {
    const response = await fetch("/api/screen-reader/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    // Validate response structure
    if (!result.action || !result.explanation) {
      throw new Error("Invalid AI response structure");
    }

    return {
      action: result.action,
      targetId: result.targetId,
      targetType: result.targetType,
      searchQuery: result.searchQuery,
      scrollDirection: result.scrollDirection,
      explanation: result.explanation,
      confidence: result.confidence ?? 0.8,
    };
  } catch (error) {
    console.error("Error interpreting with Groq:", error);

    // Return a fallback response
    return {
      action: "none",
      explanation:
        "No pude interpretar ese comando. Intenta decirlo de otra forma o di 'ayuda' para ver los comandos disponibles.",
      confidence: 0,
    };
  }
}

/**
 * Parse natural language to find target element
 */
export function findTargetFromDescription(
  description: string,
  nodes: AccessibleNode[],
): AccessibleNode | null {
  const normalizedDesc = description.toLowerCase().trim();

  // Exact match
  let match = nodes.find((n) => n.label.toLowerCase() === normalizedDesc);
  if (match) return match;

  // Contains match
  match = nodes.find((n) => n.label.toLowerCase().includes(normalizedDesc));
  if (match) return match;

  // Word-based match
  const words = normalizedDesc.split(/\s+/);
  match = nodes.find((n) => {
    const label = n.label.toLowerCase();
    return words.every((word) => label.includes(word));
  });
  if (match) return match;

  // Fuzzy match - at least half the words match
  const minWords = Math.ceil(words.length / 2);
  match = nodes.find((n) => {
    const label = n.label.toLowerCase();
    const matchingWords = words.filter((word) => label.includes(word));
    return matchingWords.length >= minWords;
  });

  return match || null;
}
