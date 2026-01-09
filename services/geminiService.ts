
import { GoogleGenAI, Modality, Type } from "@google/genai";

export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJSON = (text: string) => {
  // Limpia bloques de código y caracteres extra que la IA pueda añadir
  return text.replace(/```json/g, "").replace(/```/g, "").replace(/^[^[{]*/, "").replace(/[^\]}]*$/, "").trim();
};

// Genera un string aleatorio para evitar que la IA repita respuestas por caché de prompt
const getUniqueContext = () => `[Ref: ${Date.now()}-${Math.random().toString(36).substring(7)}]`;

export const getQuickAffirmation = async (mood: string): Promise<string> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} Genera una frase de aliento corta y única (max 8 palabras) para un joven que se siente "${mood}". Usa lenguaje juvenil de CDMX.`,
    });
    return response.text?.trim() || "¡Tú puedes con todo hoy!";
  } catch (e) { return "Respira hondo, todo estará bien."; }
};

export const getSimplifiedExplanation = async (topic: string) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} Explica "${topic}" para un joven de 14 años. 
      Usa exactamente estos marcadores y nada más:
      RESUMEN_MAGICO: (frase corta)
      EXPLICACION_SIMPLE: (párrafo claro)
      DETALLE_JOVEN: (con palabras chidas)
      ANALOGIA: (comparación visual)`,
    });
    const text = response.text;
    if (!text) throw new Error("No response");
    return { content: text, isError: false };
  } catch (e) {
    return { content: "Error al conectar. Intenta de nuevo.", isError: true };
  }
};

export const createChatSession = () => {
  const ai = getAIInstance();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Eres 'Calma', un amigo experto en apoyo emocional para jóvenes. Tono chido, empático y breve. No repitas frases.",
    }
  });
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) { return undefined; }
};

export const getMoodSupport = async (mood: string, name: string): Promise<string> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} El usuario ${name} se siente "${mood}". Dale un apoyo muy corto y cool.`,
    });
    return response.text?.trim() || "Aquí estoy para acompañarte.";
  } catch (e) { return "Aquí estoy para acompañarte."; }
};

export const getMotivationalQuote = async () => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} Genera una frase motivadora corta (max 7 palabras) y una pista. Responde SOLO JSON: { "quote": "...", "hint": "..." }`,
      config: { 
        responseMimeType: "application/json",
        temperature: 1.0 
      }
    });
    return JSON.parse(cleanJSON(response.text || '{"quote": "Cree en ti.", "hint": "Confianza"}'));
  } catch (e) {
    return { quote: "Hoy es un gran día.", hint: "Optimismo" };
  }
};

export const getReframingScenario = async () => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} Un pensamiento negativo escolar aleatorio (max 10 palabras).`,
      config: { temperature: 0.9 }
    });
    return response.text?.trim() || "Siento que no puedo con esto.";
  } catch (e) { return "Es demasiado difícil."; }
};

export const evaluateReframing = async (neg: string, pos: string) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evalúa este cambio: "${neg}" a "${pos}". Responde JSON: { "score": 0-10, "feedback": "frase corta" }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text || '{"score": 5, "feedback": "Bien"}'));
  } catch (e) { return { score: 5, feedback: "Interesante." }; }
};

export const getMathFeedback = async (count: number, difficulty: string) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Usuario sacó ${count}/5 en mate nivel ${difficulty}. Dile algo muy corto y cool.`,
    });
    return response.text?.trim() || "¡Bien hecho!";
  } catch (e) { return "¡Vas por buen camino!"; }
};

export const editArtImage = async (base64Data: string, prompt: string): Promise<string | null> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/png' } },
          { text: prompt },
        ],
      },
    });
    const candidate = response.candidates?.[0];
    if (candidate) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (e) { return null; }
};
