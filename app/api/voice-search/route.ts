import { NextResponse } from "next/server";

interface CustomCommand {
  id: string;
  phrase: string;
  action: string;
  url?: string;
  enabled: boolean;
}

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
        temperature: 0.7,
        max_tokens: 1024,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function POST(request: Request) {
  try {
    const {
      query,
      customCommands = [],
      language = "es-ES",
    } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Check if query matches any custom command first
    const normalizedQuery = query.toLowerCase().trim();
    const matchedCommand = customCommands.find(
      (cmd: CustomCommand) =>
        cmd.enabled && normalizedQuery.includes(cmd.phrase.toLowerCase())
    );

    if (matchedCommand) {
      // Return custom command response
      return NextResponse.json({
        interpretation:
          language === "es-ES"
            ? `Ejecutando tu comando personalizado: ${matchedCommand.action}`
            : `Executing your custom command: ${matchedCommand.action}`,
        intent: "custom_command",
        results: [
          {
            id: matchedCommand.id,
            title: matchedCommand.action,
            description:
              language === "es-ES"
                ? `Comando activado: "${matchedCommand.phrase}"`
                : `Command triggered: "${matchedCommand.phrase}"`,
            url: matchedCommand.url || "#",
            type: "action" as const,
          },
        ],
        suggestions: [],
        customCommandTriggered: true,
        commandUrl: matchedCommand.url,
      });
    }

    const isSpanish = language === "es-ES";

    const systemPrompt = isSpanish
      ? `Eres TuVozGuía, un asistente inteligente de búsqueda por voz diseñado especialmente para personas con discapacidad visual o motriz. Tu trabajo es:
1. Entender la intención del comando de voz del usuario
2. Proporcionar una interpretación clara y útil
3. Generar resultados de búsqueda o acciones relevantes
4. Ser extremadamente claro y descriptivo en tus respuestas, ya que el usuario puede depender de lectores de pantalla

Responde SOLO con JSON válido en este formato exacto:
{
  "interpretation": "Una explicación en lenguaje natural de lo que entendiste de la consulta, siendo muy descriptivo",
  "intent": "search" | "action" | "question" | "command",
  "results": [
    {
      "id": "id-único",
      "title": "Título del resultado",
      "description": "Descripción breve pero completa",
      "url": "https://ejemplo.com",
      "type": "web" | "action" | "answer"
    }
  ],
  "suggestions": ["consulta relacionada 1", "consulta relacionada 2", "consulta relacionada 3"]
}

Sé servicial, conciso y proporciona resultados útiles. Si la consulta es una pregunta, proporciona una respuesta directa como primer resultado con tipo "answer".
IMPORTANTE: Todas tus respuestas deben ser en ESPAÑOL.`
      : `You are TuVozGuía, an intelligent voice search assistant specially designed for people with visual or motor disabilities. Your job is to:
1. Understand the user's voice query intent
2. Provide a clear and helpful interpretation
3. Generate relevant search results or actions
4. Be extremely clear and descriptive in your responses, as the user may rely on screen readers

Respond ONLY with valid JSON in this exact format:
{
  "interpretation": "A natural language explanation of what you understood from the query, being very descriptive",
  "intent": "search" | "action" | "question" | "command",
  "results": [
    {
      "id": "unique-id",
      "title": "Result title",
      "description": "Brief but complete description",
      "url": "https://example.com",
      "type": "web" | "action" | "answer"
    }
  ],
  "suggestions": ["related query 1", "related query 2", "related query 3"]
}

Be helpful, concise, and provide actionable results. If the query is a question, provide a direct answer as the first result with type "answer".`;

    const userPrompt = isSpanish
      ? `Consulta de voz del usuario: "${query}"

Por favor interpreta esta consulta y proporciona resultados útiles en español.`
      : `User voice query: "${query}"

Please interpret this query and provide helpful results.`;

    const text = await callGroqAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Parse the AI response
    let response;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        response = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      // Fallback response if parsing fails
      response = isSpanish
        ? {
            interpretation: `Entendí que estás buscando: "${query}"`,
            intent: "search",
            results: [
              {
                id: "1",
                title: `Resultados de búsqueda para "${query}"`,
                description: "Haz clic para ver más resultados en la web",
                url: `https://www.google.com/search?q=${encodeURIComponent(
                  query
                )}&hl=es`,
                type: "web",
              },
            ],
            suggestions: [
              `Más sobre ${query}`,
              `${query} cerca de mí`,
              `Mejor ${query}`,
            ],
          }
        : {
            interpretation: `I understood you're looking for: "${query}"`,
            intent: "search",
            results: [
              {
                id: "1",
                title: `Search results for "${query}"`,
                description: "Click to see more results on the web",
                url: `https://www.google.com/search?q=${encodeURIComponent(
                  query
                )}`,
                type: "web",
              },
            ],
            suggestions: [
              `More about ${query}`,
              `${query} near me`,
              `Best ${query}`,
            ],
          };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Voice search error:", error);
    return NextResponse.json(
      { error: "Failed to process voice search" },
      { status: 500 }
    );
  }
}
