import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface PageElement {
  id: string;
  type: string;
  label: string;
}

interface RequestBody {
  command: string;
  currentElement: {
    id: string;
    type: string;
    label: string;
  } | null;
  pageElements: PageElement[];
  pageContext: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { command, currentElement, pageElements, pageContext } = body;

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 },
      );
    }

    // Build element list for context
    const elementList = pageElements
      .map((el, i) => `${i + 1}. [${el.id}] ${el.type}: "${el.label}"`)
      .join("\n");

    const systemPrompt = `Eres un asistente de lector de pantalla inteligente que interpreta comandos de voz en español para navegar páginas web. Tu trabajo es entender la intención del usuario y devolver la acción apropiada.

CONTEXTO DE LA PÁGINA:
- Título: ${pageContext}
- Elemento actual: ${currentElement ? `${currentElement.type}: "${currentElement.label}"` : "Ninguno seleccionado"}

ELEMENTOS DISPONIBLES:
${elementList || "No hay elementos disponibles"}

ACCIONES POSIBLES:
- "focus": Enfocar un elemento específico (requiere targetId)
- "click": Hacer clic en un elemento (usa targetId o el actual)
- "read": Leer el contenido de la página
- "scroll": Desplazar la página (requiere scrollDirection: "up", "down", "top", "bottom")
- "search": Buscar un elemento por texto (requiere searchQuery)
- "navigate": Navegar a un tipo de elemento
- "none": No se puede realizar la acción

REGLAS:
1. Interpreta el comando en español de forma flexible
2. Si el usuario menciona algo específico, busca el elemento más cercano
3. Si no está claro qué elemento, sugiere opciones
4. Siempre responde en español
5. Sé breve y claro en la explicación

Responde SOLO con JSON válido:
{
  "action": "focus|click|read|scroll|search|navigate|none",
  "targetId": "id del elemento si aplica",
  "targetType": "heading|button|link|input|landmark si aplica",
  "searchQuery": "texto a buscar si aplica",
  "scrollDirection": "up|down|top|bottom si aplica",
  "explanation": "explicación breve en español",
  "confidence": 0.0 a 1.0
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Comando: "${command}"` },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Parse the JSON response
    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const result = JSON.parse(jsonMatch[0]);

      return NextResponse.json({
        action: result.action || "none",
        targetId: result.targetId || null,
        targetType: result.targetType || null,
        searchQuery: result.searchQuery || null,
        scrollDirection: result.scrollDirection || null,
        explanation: result.explanation || "Procesando comando...",
        confidence: result.confidence ?? 0.8,
      });
    } catch (parseError) {
      // Fallback response if JSON parsing fails
      return NextResponse.json({
        action: "none",
        explanation:
          "No pude interpretar ese comando. Intenta decirlo de otra forma.",
        confidence: 0,
      });
    }
  } catch (error) {
    console.error("Error in screen reader interpret:", error);
    return NextResponse.json(
      {
        action: "none",
        explanation: "Ocurrió un error al procesar el comando.",
        confidence: 0,
      },
      { status: 500 },
    );
  }
}
