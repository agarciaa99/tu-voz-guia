import { Groq } from "groq-sdk";
import type { AccessibleNode } from "@/lib/screen-reader/types";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

export type AIAction =
  | { type: "focus"; targetId: string }
  | { type: "click"; targetId: string }
  | { type: "read"; targetId?: string }
  | { type: "scroll"; direction: "up" | "down" | "top" | "bottom" }
  | { type: "search"; query: string }
  | { type: "none" };

interface AIResult {
  action: string;
  targetId?: string;
  scrollDirection?: string;
  searchQuery?: string;
}

function buildElementList(nodes: AccessibleNode[]) {
  return nodes
    .map((node, i) => `${i + 1}. [${node.id}] ${node.type}: "${node.label}"`)
    .join("\n");
}

export async function interpretWithAI(
  command: string,
  nodes: AccessibleNode[],
  pageTitle: string,
): Promise<AIAction> {
  const elementList = buildElementList(nodes);

  const systemPrompt = `
Eres un asistente de accesibilidad que interpreta comandos de voz para navegar páginas web.

CONTEXTO DE PÁGINA:
Título: ${pageTitle}

ELEMENTOS DISPONIBLES:
${elementList}

ACCIONES POSIBLES:
focus → enfocar elemento
click → hacer clic
read → leer contenido
scroll → desplazarse
search → buscar texto

Responde SOLO con JSON:

{
 "action": "focus | click | read | scroll | search | none",
 "targetId": "id si aplica",
 "scrollDirection": "up | down | top | bottom",
 "searchQuery": "texto si aplica"
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 200,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: command },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";

  try {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return { type: "none" };

    const result: AIResult = JSON.parse(match[0]);

    if (result.action === "focus" && result.targetId) {
      return { type: "focus", targetId: result.targetId };
    }

    if (result.action === "click" && result.targetId) {
      return { type: "click", targetId: result.targetId };
    }

    if (result.action === "read") {
      return { type: "read", targetId: result.targetId };
    }

    if (result.action === "scroll") {
      return {
        type: "scroll",
        direction: result.scrollDirection as any,
      };
    }

    if (result.action === "search") {
      return {
        type: "search",
        query: result.searchQuery || "",
      };
    }

    return { type: "none" };
  } catch {
    return { type: "none" };
  }
}
