
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan, FormInputs } from "../types";

export const generateLessonPlan = async (inputs: FormInputs): Promise<LessonPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // Dynamically build the context string from all inputs
  const inputContext = Object.entries(inputs)
    .map(([key, value]) => `${key}: "${value}"`)
    .join("\n    ");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera un plan de clase completo para una escuela dominical cristiana con los siguientes parámetros:
    ${inputContext}
    
    El plan DEBE seguir la estructura ABCD (Audiencia, Comportamiento, Condición y Grado).
    Sé pedagógico, creativo y fiel a las escrituras. El tema principal es "${inputs.topic || inputs.Tema || 'Sin tema'}".`,
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
              audience: { type: Type.STRING, description: "Quiénes son los estudiantes" },
              behavior: { type: Type.STRING, description: "Qué acción realizarán" },
              condition: { type: Type.STRING, description: "Bajo qué circunstancias" },
              degree: { type: Type.STRING, description: "Nivel de dominio esperado" }
            },
            required: ["audience", "behavior", "condition", "degree"]
          },
          generalObjective: { type: Type.STRING },
          specificObjectives: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          biblicalContext: { type: Type.STRING, description: "Explicación breve del contexto bíblico" },
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

  const rawJson = response.text;
  const parsed = JSON.parse(rawJson);
  
  return {
    ...parsed,
    id: crypto.randomUUID(),
    date: new Date().toLocaleDateString()
  };
};
