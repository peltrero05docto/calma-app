
import React, { useState } from 'react';
import { MoodLog } from '../types';
import { getMoodSupport } from '../services/geminiService';

interface Props {
  userName: string;
  addPoints: (pts: number) => void;
  onSave: (log: MoodLog) => void;
}

const MOODS = [
  { name: 'Alegre', emoji: '🤩', color: 'bg-yellow-100' },
  { name: 'Calmado', emoji: '😌', color: 'bg-green-100' },
  { name: 'Estresado', emoji: '🤯', color: 'bg-orange-100' },
  { name: 'Triste', emoji: '🥺', color: 'bg-blue-100' },
  { name: 'Cansado', emoji: '🥱', color: 'bg-purple-100' },
];

export const MoodJournal: React.FC<Props> = ({ userName, addPoints, onSave }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleMoodSelect = async (moodName: string, emoji: string) => {
    setSelectedMood(moodName);
    setLoading(true);
    setAiResponse(null);

    const support = await getMoodSupport(moodName, userName);
    setAiResponse(support);
    setLoading(false);

    const newLog: MoodLog = {
      timestamp: new Date().toISOString(),
      mood: moodName,
      emoji: emoji
    };
    
    onSave(newLog);
    addPoints(15);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-[70vh] flex flex-col items-center">
      <h2 className="text-3xl font-bold text-calm-800 mb-2">¿Cómo va todo hoy?</h2>
      <p className="text-gray-600 mb-8 text-center">Cuéntale a Calma cómo te sientes en este momento.</p>

      {!selectedMood ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
          {MOODS.map((m) => (
            <button
              key={m.name}
              onClick={() => handleMoodSelect(m.name, m.emoji)}
              className={`${m.color} p-6 rounded-3xl flex flex-col items-center gap-2 hover:scale-105 transition-transform shadow-sm border-2 border-transparent hover:border-white`}
            >
              <span className="text-5xl">{m.emoji}</span>
              <span className="font-bold text-gray-700">{m.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full text-center animate-fade-in border border-calm-100">
          <div className="text-7xl mb-4">{MOODS.find(m => m.name === selectedMood)?.emoji}</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Te sientes {selectedMood}</h3>
          
          <div className="bg-calm-50 p-6 rounded-2xl relative min-h-[80px] flex items-center justify-center">
            {loading ? (
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-calm-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-calm-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-calm-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            ) : (
              <p className="text-lg text-calm-900 font-medium italic">"{aiResponse}"</p>
            )}
            <div className="absolute -top-3 left-6 bg-calm-600 text-white text-xs font-bold px-2 py-1 rounded">CALMA DICE:</div>
          </div>

          <button
            onClick={() => setSelectedMood(null)}
            className="mt-8 text-calm-600 font-bold hover:underline"
          >
            ← Cambiar estado
          </button>
        </div>
      )}

      <p className="mt-12 text-sm text-gray-400 max-w-xs text-center">
        Registrar cómo te sientes es el primer paso para estar mejor. ¡Bien hecho!
      </p>
    </div>
  );
};
