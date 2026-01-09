
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

    const response = await getSimplifiedExplanation(query);
    if (response.isError) {
      setError(response.content);
    } else {
      setRawText(response.content);
    }
    setLoading(false);
  };

  const handleSpeak = async (text: string) => {
    if (speaking || !text) return;
    setSpeaking(true);
    try {
      const cleanText = text.replace(/[A-Z_]+:/g, '');
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

  const getSection = (marker: string) => {
    const parts = rawText.split(marker);
    if (parts.length < 2) return null;
    return parts[1].split(/[A-Z_]+:/)[0].trim();
  };

  const sections = {
    summary: getSection('RESUMEN_MAGICO:'),
    simple: getSection('EXPLICACION_SIMPLE:'),
    teen: getSection('DETALLE_JOVEN:'),
    analogy: getSection('ANALOGIA:')
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-calm-800">Entiende lo que sea 🚀</h2>
        <p className="text-gray-500 font-medium">Calma te explica temas difíciles en segundos.</p>
      </div>
      
      <form onSubmit={handleSearch} className="relative">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} disabled={loading} placeholder="Ej: ¿Qué es el metaverso?" className="w-full p-6 rounded-[2rem] border-4 border-white shadow-2xl focus:border-calm-300 outline-none text-lg" />
        <button type="submit" disabled={loading || !query.trim()} className="absolute right-3 top-3 bottom-3 bg-calm-600 text-white px-8 rounded-2xl font-black">
          {loading ? '...' : 'IR'}
        </button>
      </form>

      {error && <div className="p-6 bg-red-50 border-2 border-dashed border-red-200 rounded-3xl text-red-600 text-center font-bold">{error}</div>}

      {rawText && (
        <div className="space-y-6 animate-fade-in pb-10">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
            <span className="font-black text-calm-600 uppercase text-xs tracking-widest">Explicación para ti</span>
            <button onClick={() => handleSpeak(rawText)} disabled={speaking} className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${speaking ? 'bg-gray-100' : 'bg-calm-100 text-calm-600'}`}>
              {speaking ? '🔊' : '🔈'}
            </button>
          </div>

          {sections.summary && <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-[2rem] text-white shadow-xl transform -rotate-1"><p className="text-2xl font-black">"{sections.summary}"</p></div>}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-b-8 border-green-200">
             <div className="flex items-center gap-2 mb-4"><span className="text-2xl">💡</span><h3 className="font-black text-green-600 uppercase text-sm">Lo básico</h3></div>
             <p className="text-lg text-gray-700 leading-relaxed">{sections.simple || rawText}</p>
          </div>
          {sections.teen && <div className="bg-calm-600 p-8 rounded-[2.5rem] shadow-xl text-white">
             <div className="flex items-center gap-2 mb-4"><span className="text-2xl">🔥</span><h3 className="font-black text-calm-200 uppercase text-sm">A tu nivel</h3></div>
             <p className="text-lg leading-relaxed">{sections.teen}</p>
          </div>}
          {sections.analogy && <div className="bg-purple-50 p-8 rounded-[2.5rem] border-4 border-dashed border-purple-200">
             <div className="flex items-center gap-2 mb-4"><span className="text-2xl">🎨</span><h3 className="font-black text-purple-600 uppercase text-sm">Imagínatelo así</h3></div>
             <p className="text-lg text-purple-900 italic font-bold">"{sections.analogy}"</p>
          </div>}
        </div>
      )}
    </div>
  );
};
