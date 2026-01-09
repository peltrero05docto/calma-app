
import React from 'react';
import { MoodLog } from '../types';

interface Props {
  history: MoodLog[];
}

export const MoodStats: React.FC<Props> = ({ history }) => {
  const getDominantMood = () => {
    if (history.length === 0) return null;
    const counts: Record<string, { count: number, emoji: string }> = {};
    history.forEach(log => {
      if (!counts[log.mood]) counts[log.mood] = { count: 0, emoji: log.emoji };
      counts[log.mood].count++;
    });
    return Object.entries(counts).sort((a, b) => b[1].count - a[1].count)[0];
  };

  const dominant = getDominantMood();

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-calm-800 mb-6 text-center">Tu Progreso</h2>
      
      {history.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-dashed border-gray-300">
          <span className="text-5xl block mb-4">📝</span>
          <p className="text-gray-500">Aún no hay registros. ¡Empieza hoy en tu diario!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dominant Mood Card */}
          {dominant && (
            <div className="bg-gradient-to-br from-calm-500 to-calm-700 p-6 rounded-3xl text-white shadow-lg">
              <h3 className="text-lg font-medium opacity-90">Ánimo dominante esta semana</h3>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-5xl">{dominant[1].emoji}</span>
                <div>
                  <p className="text-2xl font-bold">{dominant[0]}</p>
                  <p className="text-sm opacity-80">Registrado {dominant[1].count} veces</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-3xl shadow-sm border border-calm-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <h3 className="font-bold text-gray-700">Últimos registros</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {history.map((log, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{log.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-800">{log.mood}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleDateString('es-MX', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-calm-400 text-xs font-bold bg-calm-50 px-2 py-1 rounded-full">LOG</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
