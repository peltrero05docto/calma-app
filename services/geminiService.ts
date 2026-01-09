
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Fix: Renamed to getAIInstance and exported to satisfy requirements in ChatCompanion and ensure fresh API instances
export const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJSON = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const getQuickAffirmation = async (mood: string): Promise<string> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera una frase de aliento aleatoria y única (max 8 palabras) para un joven de 14 años que se siente "${mood}". Cambia el mensaje cada vez. Usa tono relax de CDMX.`,
    });
    return response.text?.trim() || "¡Tú puedes con todo hoy!";
  } catch (e) { return "Respira hondo, todo estará bien."; }
};

export const getSimplifiedExplanation = async (topic: string) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explica "${topic}" para un joven de 14 años de forma divertida. 
      USA ESTRICTAMENTE ESTE FORMATO:
      RESUMEN_MAGICO: (una frase loca)
      EXPLICACION_SIMPLE: (lo más importante)
      DETALLE_JOVEN: (lenguaje chido)
      ANALOGIA: (ejemplo visual)`,
    });
    const text = response.text;
    if (!text) throw new Error("No hay respuesta");
    return { content: text, isError: false };
  } catch (e) {
    console.error("Error en Explícame:", e);
    return { content: "Ocurrió un error al conectar con Calma. Revisa tu conexión.", isError: true };
  }
};

export const createChatSession = () => {
  const ai = getAIInstance();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Eres 'Calma', un amigo experto en apoyo emocional para jóvenes. Tono chido, empático y breve.",
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
      contents: `El usuario ${name} se siente "${mood}". Dale un apoyo muy corto, diferente a los anteriores, usa emojis.`,
    });
    return response.text?.trim() || "Aquí estoy para acompañarte.";
  } catch (e) { return "Aquí estoy para acompañarte."; }
};

export const getMotivationalQuote = async () => {
  try {
    const ai = getAIInstance();
    // Añadimos una instrucción de aleatoriedad para evitar que Vercel/Gemini repitan la misma frase
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Genera una frase motivadora totalmente nueva y diferente a las comunes (max 7 palabras) y una pista. Responde SOLO JSON: { \"quote\": \"...\", \"hint\": \"...\" }",
      config: { 
        responseMimeType: "application/json",
        temperature: 0.9 // Más creatividad para evitar repeticiones
      }
    });
    return JSON.parse(cleanJSON(response.text || '{"quote": "Cree en ti.", "hint": "Confianza"}'));
  } catch (e) {
    return { quote: "Hoy es un buen día.", hint: "Optimismo" };
  }
};

export const getReframingScenario = async () => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Un pensamiento negativo escolar aleatorio (max 10 palabras). Sé creativo.",
      config: { temperature: 0.8 }
    });
    return response.text?.trim() || "Siento que no puedo con esto.";
  } catch (e) { return "Es demasiado difícil."; }
};

export const evaluateReframing = async (neg: string, pos: string) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evalúa este cambio: "${neg}" a "${pos}". Responde JSON: { \"score\": 0-10, \"feedback\": \"frase corta\" }`,
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

// Fix: Added missing export for editArtImage using the gemini-2.5-flash-image model as per guidelines
export const editArtImage = async (base64Data: string, prompt: string): Promise<string | null> => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: 'image/png',
            },
          },
          {
            text: prompt,
          },
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
  } catch (e) {
    console.error("Error editing image:", e);
    return null;
  }
};
