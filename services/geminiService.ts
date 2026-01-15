
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan, FormInputs } from "../types.ts";

export const generateLessonPlan = async (inputs: FormInputs): Promise<LessonPlan> => {
  // Acceso más seguro a process.env para evitar ReferenceError si no existe
  const env = (typeof process !== 'undefined' ? process.env : (globalThis as any).process?.env) || {};
  const apiKey = env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY no encontrada. Asegúrate de configurarla en las variables de entorno (Dashboard de Vercel).");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construir dinámicamente el contexto basado en los campos personalizados
  const inputContext = Object.entries(inputs)
    .filter(([_, value]) => value && value.trim() !== "")
    .map(([key, value]) => `${key}: "${value}"`)
    .join("\n    ");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera un plan de clase completo para una escuela dominical cristiana con los siguientes parámetros detallados:
    ${inputContext}
    
    INSTRUCCIONES CRÍTICAS:
    1. El plan DEBE seguir estrictamente la estructura ABCD (Audiencia, Comportamiento, Condición y Grado).
    2. El contenido debe ser pedagógico, creativo y fiel a las doctrinas cristianas.
    3. El tema principal es "${inputs.topic || inputs.Tema || 'Lección Bíblica'}".
    4. El lenguaje debe ser apropiado para la edad especificada.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          verse: { type: Type.STRING },
          audience: { type: Type.STRING },
          abcd: {
            type: Type.OBJECT,
            properties: {
              audience: { type: Type.STRING },
              behavior: { type: Type.STRING },
              condition: { type: Type.STRING },
              degree: { type: Type.STRING }
            },
            required: ["audience", "behavior", "condition", "degree"]
          },
          generalObjective: { type: Type.STRING },
          specificObjectives: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          biblicalContext: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                duration: { type: Type.STRING },
                materials: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "description", "duration", "materials"]
            }
          },
          rubric: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterion: { type: Type.STRING },
                excellent: { type: Type.STRING },
                good: { type: Type.STRING },
                improvement: { type: Type.STRING }
              },
              required: ["criterion", "excellent", "good", "improvement"]
            }
          }
        },
        required: ["topic", "verse", "audience", "abcd", "generalObjective", "specificObjectives", "biblicalContext", "activities", "rubric"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("La IA no devolvió una respuesta válida.");
  
  const parsed = JSON.parse(text);
  
  return {
    ...parsed,
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString('es-PA')
  };
};
