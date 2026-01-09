
import React, { useState, useEffect } from 'react';
import { getMotivationalQuote, getReframingScenario, evaluateReframing } from '../services/geminiService';

interface Props {
  addPoints: (pts: number) => void;
}

export const MotivationGames: React.FC<Props> = ({ addPoints }) => {
  const [activeTab, setActiveTab] = useState<'scramble' | 'reframe'>('scramble');
  
  // Scramble Game State
  const [targetQuote, setTargetQuote] = useState<string>('');
  const [targetHint, setTargetHint] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [scrambledWords, setScrambledWords] = useState<{id: number, text: string}[]>([]);
  const [userOrder, setUserOrder] = useState<{id: number, text: string}[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'loading'>('loading');

  // Reframe Game State
  const [negativeThought, setNegativeThought] = useState('');
  const [userReframe, setUserReframe] = useState('');
  const [reframeResult, setReframeResult] = useState<{score: number, feedback: string} | null>(null);
  const [reframeLoading, setReframeLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'scramble') startScrambleGame();
    if (activeTab === 'reframe') startReframeGame();
  }, [activeTab]);

  const startScrambleGame = async () => {
    setGameStatus('loading');
    setUserOrder([]);
    setShowHint(false);
    const { quote, hint } = await getMotivationalQuote();
    setTargetQuote(quote);
    setTargetHint(hint);
    const words = quote.split(' ').filter(w => w.length > 0).map((w, i) => ({ id: i, text: w }));
    setScrambledWords([...words].sort(() => Math.random() - 0.5));
    setGameStatus('playing');
  };

  const handleWordClick = (word: {id: number, text: string}) => {
    if (gameStatus !== 'playing') return;
    const newOrder = [...userOrder, word];
    setUserOrder(newOrder);
    setScrambledWords(scrambledWords.filter(w => w.id !== word.id));

    if (scrambledWords.length === 1) { 
       const finalSentence = newOrder.map(w => w.text).join(' ');
       const normFinal = finalSentence.toLowerCase().replace(/[.,!]/g, '').trim();
       const normTarget = targetQuote.toLowerCase().replace(/[.,!]/g, '').trim();
       
       if (normFinal === normTarget) {
         setGameStatus('won');
         addPoints(30);
       }
    }
  };

  const resetScramble = () => {
     setUserOrder([]);
     const words = targetQuote.split(' ').filter(w => w.length > 0).map((w, i) => ({ id: i, text: w }));
     setScrambledWords([...words].sort(() => Math.random() - 0.5));
     setGameStatus('playing');
  };

  const startReframeGame = async () => {
    setReframeLoading(true);
    setReframeResult(null);
    setUserReframe('');
    const scenario = await getReframingScenario();
    setNegativeThought(scenario);
    setReframeLoading(false);
  };

  const submitReframe = async () => {
    if (!userReframe.trim()) return;
    setReframeLoading(true);
    const result = await evaluateReframing(negativeThought, userReframe);
    setReframeResult(result);
    setReframeLoading(false);
    if (result.score >= 7) addPoints(result.score * 5);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-[80vh] animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h2 className="text-3xl font-black text-calm-800 uppercase tracking-tighter">Retos Calma 🧩</h2>
        <div className="flex bg-white/50 p-1 rounded-2xl border border-calm-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setActiveTab('scramble')}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'scramble' ? 'bg-calm-600 shadow text-white' : 'text-gray-500'}`}
          >
            Frase Loca
          </button>
          <button
            onClick={() => setActiveTab('reframe')}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'reframe' ? 'bg-calm-600 shadow text-white' : 'text-gray-500'}`}
          >
            Transforma
          </button>
        </div>
      </div>

      {activeTab === 'scramble' && (
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border-b-8 border-calm-100">
          <div className="text-center mb-8">
            <h3 className="text-xl font-black text-gray-800">Ordena el mensaje positivo</h3>
            <p className="text-gray-500 font-medium italic">Toca los bloques para construir la frase.</p>
          </div>
          
          {gameStatus === 'loading' ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-4 border-calm-200 border-t-calm-600 rounded-full animate-spin"></div>
              <p className="text-calm-600 font-bold animate-pulse">Buscando inspiración...</p>
            </div>
          ) : (
            <>
              {/* Drop Zone (Frase que el usuario está armando) */}
              <div className="min-h-[140px] bg-calm-50 rounded-[2rem] border-4 border-dashed border-calm-200 mb-8 p-6 flex flex-wrap gap-3 justify-center items-center transition-all">
                {userOrder.length === 0 && (
                  <div className="text-gray-300 select-none text-center">
                    <span className="text-4xl block mb-2 opacity-30">✨</span>
                    <p className="font-bold">Toca las palabras de abajo</p>
                  </div>
                )}
                {userOrder.map((w) => (
                  <span key={`user-${w.id}`} className="bg-calm-600 text-white px-5 py-3 rounded-2xl font-black shadow-lg animate-fade-in border-b-4 border-calm-800 active:scale-95 transition-transform">
                    {w.text}
                  </span>
                ))}
              </div>

              {/* Word Bank (Palabras mezcladas) */}
              <div className="flex flex-wrap gap-3 justify-center mb-10 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                {scrambledWords.map((w) => (
                  <button
                    key={`bank-${w.id}`}
                    onClick={() => handleWordClick(w)}
                    className="bg-white border-2 border-gray-200 text-gray-700 hover:border-calm-400 hover:text-calm-600 px-5 py-3 rounded-2xl font-bold shadow-md transition-all transform hover:-translate-y-1 active:scale-90 border-b-4 border-b-gray-300 hover:border-b-calm-500"
                  >
                    {w.text}
                  </button>
                ))}
              </div>

              {/* Tips & Hints */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-8">
                {showHint ? (
                  <p className="text-blue-800 font-medium text-center animate-fade-in italic">
                    <span className="font-black not-italic uppercase text-[10px] block mb-1 opacity-50 tracking-widest">Pista:</span>
                    "{targetHint}"
                  </p>
                ) : (
                  <button 
                    onClick={() => setShowHint(true)}
                    className="w-full text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    ¿Necesitas una pista? 🔍
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex justify-center items-center gap-4">
                <button 
                  onClick={resetScramble} 
                  className="bg-gray-100 text-gray-500 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors active:scale-90"
                >
                  Reiniciar
                </button>
                <button 
                  onClick={startScrambleGame} 
                  className="bg-nature-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-nature-600 transition-all flex items-center gap-2 active:scale-95"
                >
                  Siguiente 🚀
                </button>
              </div>

              {gameStatus === 'won' && (
                <div className="mt-8 p-6 bg-green-50 text-green-800 rounded-3xl text-center animate-bounce border-2 border-green-200 shadow-xl">
                  <span className="text-4xl block mb-2">🏆</span>
                  <p className="text-xl font-black italic">¡ESO ES TODO, CHIDO!</p>
                  <p className="font-bold opacity-80">Ganaste +30 Puntos Calma</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'reframe' && (
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border-b-8 border-calm-100 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-black text-gray-800">El Reto del Cambio</h3>
            <p className="text-gray-500 font-medium italic">Dale la vuelta a este pensamiento mala onda.</p>
          </div>

          {reframeLoading && !negativeThought ? (
             <div className="flex justify-center py-10 animate-pulse text-calm-600 font-bold">Generando situación...</div>
          ) : (
            <>
              <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 relative">
                <span className="absolute -top-3 left-6 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">PENSAMIENTO NEGATIVO</span>
                <p className="text-lg font-bold text-gray-800 mt-2 leading-relaxed italic">"{negativeThought}"</p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-500 uppercase tracking-widest ml-2">Tu versión positiva:</label>
                <textarea 
                  value={userReframe}
                  onChange={(e) => setUserReframe(e.target.value)}
                  placeholder="Ej: 'Esto es difícil ahora, pero sé que puedo aprender si voy paso a paso...'"
                  className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-calm-400 focus:bg-white outline-none h-32 transition-all font-medium text-lg resize-none shadow-inner"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button onClick={startReframeGame} className="px-6 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl transition-colors">Saltar Reto</button>
                <button 
                  onClick={submitReframe}
                  disabled={reframeLoading || !userReframe}
                  className="bg-calm-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-calm-700 disabled:opacity-50 transition-all active:scale-95"
                >
                  {reframeLoading ? 'Evaluando...' : '¡Enviar! 🚀'}
                </button>
              </div>

              {reframeResult && (
                <div className={`p-6 rounded-3xl border-2 animate-fade-in shadow-lg ${reframeResult.score >= 7 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-black text-lg uppercase tracking-tight">Puntaje: {reframeResult.score}/10</span>
                    {reframeResult.score >= 7 && <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">+{(reframeResult.score * 5)} PTS</span>}
                  </div>
                  <p className="text-gray-700 font-bold italic leading-relaxed">"{reframeResult.feedback}"</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
