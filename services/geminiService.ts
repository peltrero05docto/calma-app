
import { GoogleGenAI, Modality, Type } from "@google/genai";

export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJSON = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").replace(/^[^[{]*/, "").replace(/[^\]}]*$/, "").trim();
};

const getUniqueContext = () => `[ID: ${Math.random().toString(36).substring(7)}-${Date.now()}]`;

// Función para manejar reintentos automáticos en caso de error 429 (Rate Limit)
async function callWithRetry(fn: () => Promise<any>, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (e.message?.includes('429') && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Espera incremental
        continue;
      }
      throw e;
    }
  }
}

export const getQuickAffirmation = async (mood: string): Promise<string> => {
  return callWithRetry(async () => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} Genera una frase motivadora ultra-corta (max 6 palabras) para un joven de CDMX. Tono relajado.`,
    });
    return response.text?.trim() || "¡A darle con todo hoy!";
  }).catch(() => "¡Respira, todo va a estar bien!");
};

export const getSimplifiedExplanation = async (topic: string) => {
  return callWithRetry(async () => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} Explica "${topic}" para un joven de 14 años. 
      Usa ESTRICTAMENTE este formato:
      RESUMEN_MAGICO: (frase corta)
      EXPLICACION_SIMPLE: (lo más importante)
      DETALLE_JOVEN: (lenguaje chido)
      ANALOGIA: (ejemplo visual)`,
    });
    const text = response.text;
    if (!text) throw new Error("No response");
    return { content: text, isError: false };
  }).catch((e: any) => {
    const isRateLimit = e.message?.includes('429');
    return { 
      content: isRateLimit ? "AGUANTA... El servidor de Calma está muy solicitado. Intenta en 10 segundos." : "Error al conectar. Intenta de nuevo.", 
      isError: true 
    };
  });
};

export const getMotivationalQuote = async () => {
  return callWithRetry(async () => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} Genera una frase positiva corta y una pista. Responde SOLO JSON: { "quote": "...", "hint": "..." }`,
      config: { responseMimeType: "application/json", temperature: 1.0 }
    });
    return JSON.parse(cleanJSON(response.text || '{"quote": "Cree en ti.", "hint": "Confianza"}'));
  }).catch(() => ({ quote: "Hoy es un gran día.", hint: "Optimismo" }));
};

export const getReframingScenario = async () => {
  return callWithRetry(async () => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} Un pensamiento negativo escolar aleatorio (max 10 palabras).`,
    });
    return response.text?.trim() || "Siento que no puedo con esto.";
  }).catch(() => "A veces las cosas se ponen difíciles.");
};

export const evaluateReframing = async (neg: string, pos: string) => {
  return callWithRetry(async () => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evalúa este cambio: "${neg}" a "${pos}". Responde JSON: { "score": 0-10, "feedback": "frase corta" }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text || '{"score": 5, "feedback": "Bien"}'));
  }).catch(() => ({ score: 5, feedback: "Interesante punto de vista." }));
};

// ... resto de funciones existentes ...
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
  return callWithRetry(async () => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${getUniqueContext()} El usuario ${name} se siente "${mood}". Dale un apoyo muy corto y cool.`,
    });
    return response.text?.trim() || "Aquí estoy para acompañarte.";
  }).catch(() => "Aquí estoy contigo.");
};

export const getMathFeedback = async (count: number, difficulty: string) => {
  return callWithRetry(async () => {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Usuario sacó ${count}/5 en mate nivel ${difficulty}. Dile algo muy corto y cool.`,
    });
    return response.text?.trim() || "¡Bien hecho!";
  }).catch(() => "¡Vas por buen camino!");
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
