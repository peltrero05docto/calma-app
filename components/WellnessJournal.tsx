
import React, { useState } from 'react';
import { MoodLog } from '../types';
import { getMoodSupport } from '../services/geminiService';

interface Props {
  userName: string;
  addPoints: (pts: number) => void;
  onSave: (log: MoodLog) => void;
}

const MOODS = [
  { name: 'Alegre', emoji: '🤩', color: 'bg-yellow-50 border-yellow-200' },
  { name: 'Calmado', emoji: '😌', color: 'bg-green-50 border-green-200' },
  { name: 'Estresado', emoji: '🤯', color: 'bg-orange-50 border-orange-200' },
  { name: 'Triste', emoji: '🥺', color: 'bg-blue-50 border-blue-200' },
  { name: 'Cansado', emoji: '🥱', color: 'bg-purple-50 border-purple-200' },
];

export const WellnessJournal: React.FC<Props> = ({ userName, addPoints, onSave }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [thought, setThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [step, setStep] = useState<'mood' | 'thought' | 'result'>('mood');

  const handleMoodSelect = (moodName: string) => {
    setSelectedMood(moodName);
    setStep('thought');
  };

  const handleFinalize = async () => {
    setLoading(true);
    setStep('result');
    
    const emoji = MOODS.find(m => m.name === selectedMood)?.emoji || '✨';
    
    try {
      const support = await getMoodSupport(selectedMood || 'neutral', userName);
      setAiResponse(support);
    } catch (e) {
      setAiResponse("Aquí estoy para acompañarte, respira profundo.");
    }
    
    onSave({
      timestamp: new Date().toISOString(),
      mood: selectedMood || 'Indefinido',
      emoji: emoji,
      thought: thought
    });
    
    addPoints(15);
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-calm-100 max-w-2xl mx-auto w-full animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl">📝</div>
        <div>
          <h2 className="text-2xl font-black text-gray-800">Diario de Bienestar</h2>
          <p className="text-sm text-gray-500 font-medium italic">¿Qué traes en mente hoy?</p>
        </div>
      </div>

      {step === 'mood' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MOODS.map((m) => (
            <button
              key={m.name}
              onClick={() => handleMoodSelect(m.name)}
              className={`${m.color} p-5 rounded-3xl border-2 flex flex-col items-center gap-2 hover:scale-105 transition-all shadow-sm active:scale-95`}
            >
              <span className="text-4xl">{m.emoji}</span>
              <span className="font-bold text-gray-700 text-sm">{m.name}</span>
            </button>
          ))}
        </div>
      )}

      {step === 'thought' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{MOODS.find(m => m.name === selectedMood)?.emoji}</span>
            <p className="font-bold text-gray-700">Te sientes <span className="text-calm-600 uppercase">{selectedMood}</span></p>
          </div>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="¿Quieres escribir algo más sobre esto? (Opcional)"
            className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-calm-400 outline-none h-32 bg-gray-50 resize-none font-medium"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => setStep('mood')} 
              className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
            >
              Atrás
            </button>
            <button 
              onClick={handleFinalize}
              className="flex-[2] bg-calm-600 text-white py-4 rounded-2xl font-bold hover:bg-calm-700 shadow-lg transition-all"
            >
              Guardar Registro
            </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="text-center space-y-6 animate-fade-in py-4">
          <div className="text-7xl mb-4">{MOODS.find(m => m.name === selectedMood)?.emoji}</div>
          <div className="bg-calm-50 p-6 rounded-3xl relative border-2 border-dashed border-calm-200">
            {loading ? (
              <div className="flex justify-center gap-2 py-4">
                <div className="w-3 h-3 bg-calm-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-calm-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-3 h-3 bg-calm-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            ) : (
              <p className="text-xl text-calm-900 font-bold italic leading-relaxed">"{aiResponse}"</p>
            )}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-calm-600 text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full shadow-md">Mensaje de Calma</div>
          </div>
          <button
            onClick={() => { setStep('mood'); setThought(''); setSelectedMood(null); }}
            className="text-calm-600 font-black uppercase tracking-tighter text-sm hover:underline"
          >
            Nuevo Registro
          </button>
        </div>
      )}
    </div>
  );
};
