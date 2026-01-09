
import React, { useState } from 'react';
import { getSimplifiedExplanation, generateSpeech } from '../services/geminiService';
import { decodeAudio, decodeAudioData } from '../services/audioUtils';

export const InfoSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setRawText('');

    try {
      const response = await getSimplifiedExplanation(query);
      if (response.isError) {
        setError(response.content);
      } else {
        setRawText(response.content);
      }
    } catch (e) {
      setError("Calma no pudo procesar esto. Intenta con algo más simple.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (speaking || !text) return;
    setSpeaking(true);
    try {
      // Limpiamos los marcadores antes de hablar
      const cleanText = text.replace(/[A-Z_]+:/gi, '').replace(/\*/g, '');
      const base64 = await generateSpeech(cleanText);
      if (base64) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decodeAudio(base64), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setSpeaking(false);
        source.start();
      } else { setSpeaking(false); }
    } catch (e) { setSpeaking(false); }
  };

  // Parser más robusto que ignora mayúsculas/minúsculas y asteriscos de negrita
  const extractSection = (marker: string) => {
    if (!rawText) return null;
    const cleanText = rawText.replace(/\*\*/g, ''); // Quitamos negritas de markdown
    const regex = new RegExp(`${marker}:?\\s*([\\s\\S]*?)(?=[A-Z_]+:|$)`, 'i');
    const match = cleanText.match(regex);
    return match ? match[1].trim() : null;
  };

  const sections = {
    summary: extractSection('RESUMEN_MAGICO'),
    simple: extractSection('EXPLICACION_SIMPLE'),
    teen: extractSection('DETALLE_JOVEN'),
    analogy: extractSection('ANALOGIA')
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto animate-fade-in space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-calm-800">Explícame 🚀</h2>
        <p className="text-gray-500 font-medium italic">Todo es más fácil cuando Calma te lo cuenta.</p>
      </div>
      
      <form onSubmit={handleSearch} className="relative group">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          disabled={loading} 
          placeholder="Ej: ¿Qué es la inteligencia artificial?" 
          className="w-full p-6 rounded-[2.5rem] border-4 border-white shadow-2xl focus:border-calm-300 outline-none text-lg transition-all" 
        />
        <button 
          type="submit" 
          disabled={loading || !query.trim()} 
          className="absolute right-3 top-3 bottom-3 bg-calm-600 text-white px-8 rounded-3xl font-black hover:bg-calm-700 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'IR'}
        </button>
      </form>

      {error && (
        <div className="p-8 bg-red-50 border-2 border-dashed border-red-200 rounded-[2.5rem] text-red-600 text-center font-bold">
          {error}
        </div>
      )}

      {rawText && (
        <div className="space-y-6 animate-fade-in pb-10">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-calm-100">
            <span className="font-black text-calm-600 uppercase text-[10px] tracking-widest ml-2">Resultado</span>
            <button 
              onClick={() => handleSpeak(rawText)} 
              disabled={speaking} 
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all ${speaking ? 'bg-nature-100 animate-pulse' : 'bg-calm-100 text-calm-600'}`}
            >
              {speaking ? '🔊' : '🔈'}
            </button>
          </div>

          {sections.summary && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-8 rounded-[2.5rem] text-white shadow-xl transform -rotate-1">
              <p className="text-2xl font-black italic">"{sections.summary}"</p>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-8 border-green-200 border border-gray-100">
             <div className="flex items-center gap-2 mb-4">
                <span className="bg-green-100 p-2 rounded-lg text-xl">💡</span>
                <h3 className="font-black text-green-600 uppercase text-xs tracking-widest">En pocas palabras</h3>
             </div>
             <p className="text-lg text-gray-700 leading-relaxed font-medium">
                {sections.simple || rawText}
             </p>
          </div>

          {sections.teen && (
            <div className="bg-calm-600 p-8 rounded-[2.5rem] shadow-xl text-white border-b-8 border-calm-800">
               <div className="flex items-center gap-2 mb-4">
                  <span className="bg-white/20 p-2 rounded-lg text-xl">🔥</span>
                  <h3 className="font-black text-calm-200 uppercase text-xs tracking-widest">A tu nivel</h3>
               </div>
               <p className="text-lg leading-relaxed font-bold">{sections.teen}</p>
            </div>
          )}

          {sections.analogy && (
            <div className="bg-purple-50 p-8 rounded-[2.5rem] border-4 border-dashed border-purple-200">
               <div className="flex items-center gap-2 mb-4">
                  <span className="bg-purple-100 p-2 rounded-lg text-xl">🎨</span>
                  <h3 className="font-black text-purple-600 uppercase text-xs tracking-widest">Como si fuera...</h3>
               </div>
               <p className="text-lg text-purple-900 italic font-black leading-relaxed">"{sections.analogy}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
