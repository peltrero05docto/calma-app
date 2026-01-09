
import React, { useState, useEffect, useRef } from 'react';
import { View, AccessibilitySettings, UserProgress, MoodLog } from './types';
import { BreathingExercise } from './components/BreathingExercise';
import { ChatCompanion } from './components/ChatCompanion';
import { MandalaCreator } from './components/MandalaCreator';
import { InfoSearch } from './components/InfoSearch';
import { MathChallenge } from './components/MathChallenge';
import { MotivationGames } from './components/MotivationGames';
import { WellnessJournal } from './components/WellnessJournal';
import { ProfileView } from './components/ProfileView';
import { AccessibilityControls } from './components/AccessibilityControls';
import { getQuickAffirmation } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [userName, setUserName] = useState(() => localStorage.getItem('calma_name') || '');
  const [dailyQuote, setDailyQuote] = useState("¡Qué onda! Iniciando tu relax...");
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('calma_name'));
  const hasFetchedQuote = useRef(false);
  
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('calma_progress');
    return saved ? JSON.parse(saved) : { points: 0, badges: [], streak: 1, lastLogin: new Date().toISOString() };
  });

  const [moodHistory, setMoodHistory] = useState<MoodLog[]>(() => {
    const saved = localStorage.getItem('calma_mood_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [a11y, setA11y] = useState<AccessibilitySettings>({ highContrast: false, largeText: false });

  useEffect(() => {
    // Solo pedimos la frase una vez por sesión para ahorrar cuota de API
    if (userName && !hasFetchedQuote.current) {
      getQuickAffirmation("neutral").then(quote => {
        setDailyQuote(quote);
        hasFetchedQuote.current = true;
      });
    }
  }, [userName]);

  useEffect(() => {
    if (userName) localStorage.setItem('calma_name', userName);
    localStorage.setItem('calma_progress', JSON.stringify(progress));
    localStorage.setItem('calma_mood_history', JSON.stringify(moodHistory));
  }, [userName, progress, moodHistory]);

  const addPoints = (pts: number) => setProgress(prev => ({ ...prev, points: prev.points + pts }));

  const handleSaveMood = (log: MoodLog) => {
    setMoodHistory(prev => [log, ...prev].slice(0, 50));
    addPoints(15);
  };

  if (showOnboarding) return <Onboarding onFinish={(n) => { setUserName(n); setShowOnboarding(false); }} />;

  const renderView = () => {
    switch(currentView) {
      case 'breathing': return <BreathingExercise />;
      case 'chat': return <ChatCompanion />;
      case 'art': return <MandalaCreator addPoints={addPoints} />;
      case 'learn': return <InfoSearch />;
      case 'math': return <MathChallenge addPoints={addPoints} />;
      case 'motivation': return <MotivationGames addPoints={addPoints} />;
      case 'profile': return <ProfileView userName={userName} progress={progress} historyCount={moodHistory.length} onLogout={() => { localStorage.clear(); window.location.reload(); }} />;
      default: return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Hero Card */}
          <div className="bg-gradient-to-br from-calm-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden animate-fade-in border-b-8 border-calm-800/20">
             <div className="relative z-10">
               <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">¡Qué onda, {userName}! 👋</h1>
               <p className="text-lg sm:text-xl opacity-90 italic">"{dailyQuote}"</p>
             </div>
             <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="text-xl">🔥</span>
                <span className="font-black">{progress.streak}</span>
             </div>
          </div>

          <WellnessJournal userName={userName} addPoints={addPoints} onSave={handleSaveMood} />

          {/* Menu Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MenuCard emoji="🌬️" title="Respiración" desc="Pausa de 1 min" color="border-green-400" onClick={() => setCurrentView('breathing')} />
            <MenuCard emoji="💬" title="Compañero IA" desc="Voz y Texto" color="border-cyan-400" onClick={() => setCurrentView('chat')} />
            <MenuCard emoji="🧠" title="Enfoque" desc="Mente ágil" color="border-blue-500" onClick={() => setCurrentView('math')} />
            <MenuCard emoji="🌀" title="Mándalas" desc="Dibuja tu paz" color="border-purple-400" onClick={() => setCurrentView('art')} />
            <MenuCard emoji="🧩" title="Retos" desc="Motivación" color="border-orange-400" onClick={() => setCurrentView('motivation')} />
            <MenuCard emoji="📚" title="Explícame" desc="Tarea fácil" color="border-yellow-400" onClick={() => setCurrentView('learn')} />
            
            <div onClick={() => setCurrentView('profile')} className="cursor-pointer bg-white p-6 rounded-[2rem] shadow-lg border-b-8 border-calm-200 flex flex-col justify-center items-center hover:scale-105 transition-transform group">
               <span className="text-3xl font-black text-calm-600">{progress.points}</span>
               <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">Puntos Calma</span>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`min-h-screen pb-20 bg-calm-50 ${a11y.highContrast ? 'contrast-125' : ''} ${a11y.largeText ? 'text-lg' : ''}`}>
      <header className="glass sticky top-0 z-50 p-4 border-b border-white/20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {currentView !== 'home' && (
              <button 
                onClick={() => setCurrentView('home')} 
                className="bg-calm-100 hover:bg-calm-200 text-calm-800 p-2.5 rounded-2xl transition-all active:scale-90"
              >
                ←
              </button>
            )}
            <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 group outline-none">
              <div className="w-10 h-10 bg-calm-600 rounded-2xl shadow-lg flex items-center justify-center text-white font-black italic transform transition-transform group-hover:rotate-6">C</div>
              <span className="text-xl font-black text-calm-900 uppercase tracking-tighter">Calma</span>
            </button>
          </div>
          <button 
            onClick={() => setCurrentView('profile')} 
            className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-xl hover:bg-gray-50 transition-colors active:scale-90"
          >
            👤
          </button>
        </div>
      </header>

      <main className="animate-fade-in">
        {renderView()}
      </main>

      <AccessibilityControls settings={a11y} setSettings={setA11y} />
    </div>
  );
};

const MenuCard = ({ emoji, title, desc, color, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`bg-white p-6 rounded-[2rem] shadow-lg border-b-8 ${color} hover:transform hover:-translate-y-1 transition-all flex items-center gap-4 text-left group active:scale-95`}
  >
    <span className="text-4xl group-hover:scale-110 transition-transform">{emoji}</span>
    <div>
      <h3 className="text-xl font-extrabold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-500 font-medium">{desc}</p>
    </div>
  </button>
);

const Onboarding = ({ onFinish }: { onFinish: (name: string) => void }) => {
  const [name, setName] = useState('');
  return (
    <div className="min-h-screen bg-calm-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full space-y-8 animate-fade-in border-4 border-white">
        <div className="w-24 h-24 bg-calm-600 rounded-3xl mx-auto flex items-center justify-center text-white text-5xl italic font-black">C</div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-calm-900">¡Hola! ✨</h2>
          <p className="text-gray-500 font-medium">¿Cómo quieres que te diga Calma?</p>
        </div>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Tu apodo..." 
          className="w-full p-5 rounded-2xl border-2 border-gray-100 focus:border-calm-500 text-center font-bold text-xl outline-none transition-all" 
          autoFocus 
        />
        <button 
          onClick={() => name && onFinish(name)} 
          disabled={!name} 
          className="w-full bg-calm-600 text-white py-5 rounded-2xl text-xl font-bold shadow-lg transform active:scale-95 transition-all disabled:opacity-50"
        >
          ¡Vámonos! 🚀
        </button>
      </div>
    </div>
  );
};

export default App;
