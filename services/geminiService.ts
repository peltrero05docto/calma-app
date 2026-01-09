
import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Limpia el texto de la IA para asegurar que sea un JSON válido.
 * A veces la IA envuelve la respuesta en bloques de código markdown.
 */
const cleanJSON = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const getQuickAffirmation = async (mood: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera una frase de aliento súper corta (max 8 palabras) para un joven de 14 años en CDMX que se siente "${mood}". Usa un tono empático y "cool" (ej: chido, relax, todo tranqui).`,
    });
    return response.text?.trim() || "¡Tú puedes con todo hoy!";
  } catch (e) { 
    return "Respira hondo, todo estará bien."; 
  }
};

export const getSimplifiedExplanation = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explica "${topic}" para un joven de 14 años. 
      Usa exactamente este formato de marcadores:
      RESUMEN_MAGICO: (una frase corta e impactante)
      EXPLICACION_SIMPLE: (explicación clara)
      DETALLE_JOVEN: (con lenguaje relajado de CDMX)
      ANALOGIA: (una comparación visual fácil)`,
    });
    return { content: response.text || "", isError: !response.text };
  } catch (e) {
    return { content: "Error de conexión. Intenta de nuevo.", isError: true };
  }
};

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Eres 'Calma', un amigo experto en apoyo emocional para jóvenes (12-16 años). Tu tono es suave, empático, breve y usas lenguaje juvenil de CDMX (chido, cámara, relax) sin exagerar.",
    }
  });
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `El usuario ${name} se siente "${mood}". Dale un mensaje de apoyo muy breve, cálido y motivador.`,
    });
    return response.text?.trim() || "Aquí estoy para acompañarte.";
  } catch (e) { return "Aquí estoy para acompañarte."; }
};

export const editArtImage = async (base64ImageData: string, prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType: 'image/png' } },
          { text: prompt },
        ],
      },
    });
    const imgPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return imgPart ? `data:image/png;base64,${imgPart.inlineData.data}` : null;
  } catch (e) { return null; }
};

export const getMotivationalQuote = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Genera una frase motivadora corta (max 6 palabras) y una pista sobre su significado. Responde SOLO en JSON: { \"quote\": \"...\", \"hint\": \"...\" }",
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text || '{"quote": "Cree en ti.", "hint": "Confianza"}'));
  } catch (e) {
    return { quote: "Cada paso cuenta.", hint: "Persistencia" };
  }
};

export const getReframingScenario = async () => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Genera un pensamiento negativo común que tendría un adolescente sobre la escuela o su vida social (máximo 12 palabras).",
    });
    return response.text?.trim() || "Siento que a nadie le importa lo que digo.";
  } catch (e) {
    return "No soy lo suficientemente bueno en esto.";
  }
};

export const evaluateReframing = async (neg: string, pos: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `El usuario está tratando de cambiar un pensamiento negativo: "${neg}" por uno positivo: "${pos}". Evalúa si el cambio es saludable. Responde SOLO en JSON: { \"score\": 0-10, \"feedback\": \"una frase motivadora de CDMX\" }`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJSON(response.text || '{"score": 5, "feedback": "¡Sigue intentando!"}'));
  } catch (e) {
    return { score: 5, feedback: "Interesante punto de vista." };
  }
};

export const getMathFeedback = async (count: number, difficulty: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `El usuario sacó ${count} de 5 respuestas correctas en un reto matemático nivel "${difficulty}". Dale un comentario breve y animador.`,
    });
    return response.text?.trim() || "¡Buen esfuerzo!";
  } catch (e) {
    return "¡Buen esfuerzo!";
  }
};

export const getAIInstance = () => ai;
