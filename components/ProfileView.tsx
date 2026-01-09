import React from 'react';
import { UserProgress, Badge } from '../types';

interface Props {
  userName: string;
  progress: UserProgress;
  historyCount: number;
  onLogout: () => void;
}

const ALL_BADGES: Badge[] = [
  { id: 'first_mood', name: 'Primer Paso', emoji: '🌱', description: 'Registraste tu ánimo por primera vez', unlocked: false },
  { id: 'point_150', name: 'Acumulador', emoji: '💰', description: 'Llegaste a los 150 puntos', unlocked: false },
  { id: 'math_master', name: 'Mente Ágil', emoji: '⚡', description: 'Completaste un reto matemático', unlocked: false },
  { id: 'art_lover', name: 'Artista Zen', emoji: '🎨', description: 'Creaste una obra de arte con IA', unlocked: false },
  { id: 'streak_3', name: 'Constante', emoji: '🔥', description: 'Usaste Calma 3 días seguidos', unlocked: false },
];

export const ProfileView: React.FC<Props> = ({ userName, progress, historyCount, onLogout }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-calm-100">
        <div className="bg-calm-600 p-8 text-center text-white relative">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto flex items-center justify-center text-5xl mb-4 backdrop-blur-md">
            👤
          </div>
          <h2 className="text-3xl font-bold">{userName}</h2>
          <p className="opacity-80">Miembro de Calma desde hoy</p>
          
          <button 
            onClick={onLogout}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs font-bold transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-calm-50 p-4 rounded-2xl text-center">
              <p className="text-xs text-calm-600 font-bold uppercase mb-1">Puntos Totales</p>
              <p className="text-3xl font-black text-calm-900">{progress.points}</p>
            </div>
            <div className="bg-calm-50 p-4 rounded-2xl text-center">
              <p className="text-xs text-calm-600 font-bold uppercase mb-1">Registros</p>
              <p className="text-3xl font-black text-calm-900">{historyCount}</p>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🏆</span> Tus Medallas
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {ALL_BADGES.map(badge => {
              const isUnlocked = progress.badges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    isUnlocked ? 'bg-white border-yellow-300 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
                  }`}
                >
                  <span className="text-3xl">{badge.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};