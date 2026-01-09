
import React, { useState, useEffect } from 'react';
import { getMathFeedback } from '../services/geminiService';

interface Props {
  addPoints: (pts: number) => void;
}

type Difficulty = 'Relajado' | 'Activo' | 'Pro';
type Operation = '+' | '-' | '*' | '/';

export const MathChallenge: React.FC<Props> = ({ addPoints }) => {
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'result'>('setup');
  const [difficulty, setDifficulty] = useState<Difficulty>('Relajado');
  const [operation, setOperation] = useState<Operation>('+');
  const [currentProblem, setCurrentProblem] = useState({ a: 0, b: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const generateProblem = (diff: Difficulty, op: Operation) => {
    let max = diff === 'Relajado' ? 12 : diff === 'Activo' ? 50 : 100;
    let a = Math.floor(Math.random() * max) + 1;
    let b = Math.floor(Math.random() * max) + 1;
    let answer = 0;

    if (op === '-') {
      if (a < b) [a, b] = [b, a]; // Evitar negativos para nivel secundaria básico si se desea, o permitir.
      answer = a - b;
    } else if (op === '*') {
      max = diff === 'Relajado' ? 10 : diff === 'Activo' ? 15 : 20;
      a = Math.floor(Math.random() * max) + 2;
      b = Math.floor(Math.random() * max) + 2;
      answer = a * b;
    } else if (op === '/') {
      max = diff === 'Relajado' ? 10 : diff === 'Activo' ? 12 : 15;
      b = Math.floor(Math.random() * max) + 2;
      answer = Math.floor(Math.random() * 10) + 1;
      a = b * answer; // Asegurar división exacta
    } else {
      answer = a + b;
    }

    setCurrentProblem({ a, b, answer });
    setUserAnswer('');
  };

  const startGame = () => {
    setQuestionCount(0);
    setCorrectCount(0);
    setGameState('playing');
    generateProblem(difficulty, operation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = parseInt(userAnswer) === currentProblem.answer;
    
    if (isCorrect) setCorrectCount(prev => prev + 1);
    
    if (questionCount < 4) {
      setQuestionCount(prev => prev + 1);
      generateProblem(difficulty, operation);
    } else {
      finishGame(isCorrect ? correctCount + 1 : correctCount);
    }
  };

  const finishGame = async (finalCorrect: number) => {
    setGameState('result');
    setLoadingFeedback(true);
    const aiMsg = await getMathFeedback(finalCorrect, difficulty);
    setFeedback(aiMsg);
    setLoadingFeedback(false);
    
    if (finalCorrect > 0) {
      addPoints(finalCorrect * 10);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-[70vh] flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-calm-800 mb-2 text-center">Enfoque Total 🧠</h2>
      <p className="text-gray-600 mb-8 text-center">Usa los números para calmar tu mente. Concéntrate.</p>

      {gameState === 'setup' && (
        <div className="bg-white p-8 rounded-3xl shadow-xl space-y-8 animate-fade-in">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">¿Qué quieres practicar?</label>
            <div className="grid grid-cols-4 gap-2">
              {(['+', '-', '*', '/'] as Operation[]).map(op => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`py-4 rounded-2xl text-2xl font-bold transition-all ${operation === op ? 'bg-calm-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-400'}`}
                >
                  {op === '/' ? '÷' : op === '*' ? '×' : op}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Dificultad</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Relajado', 'Activo', 'Pro'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-3 rounded-xl font-bold transition-all ${difficulty === d ? 'bg-nature-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-calm-700 text-white py-4 rounded-2xl text-xl font-bold hover:bg-calm-800 transition-all shadow-xl"
          >
            ¡Empezar Reto!
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center animate-fade-in">
          <div className="flex justify-between items-center mb-10">
            <span className="text-sm font-bold text-gray-400">Pregunta {questionCount + 1} de 5</span>
            <span className="bg-nature-100 text-nature-700 px-3 py-1 rounded-full text-xs font-bold">Nivel: {difficulty}</span>
          </div>
          
          <div className="text-6xl font-black text-calm-900 mb-10 flex justify-center items-center gap-4">
            <span>{currentProblem.a}</span>
            <span className="text-calm-400 text-4xl">{operation === '/' ? '÷' : operation === '*' ? '×' : operation}</span>
            <span>{currentProblem.b}</span>
            <span className="text-calm-400 text-4xl">=</span>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              autoFocus
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full text-center text-4xl font-bold p-4 border-b-4 border-calm-200 outline-none focus:border-calm-500 mb-8"
              placeholder="?"
            />
            <button
              type="submit"
              disabled={!userAnswer}
              className="w-full bg-nature-500 text-white py-4 rounded-2xl text-xl font-bold hover:bg-nature-600 transition-all disabled:opacity-50"
            >
              Responder
            </button>
          </form>
        </div>
      )}

      {gameState === 'result' && (
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center animate-fade-in">
          <div className="text-6xl mb-4">
            {correctCount >= 4 ? '🔥' : correctCount >= 2 ? '✨' : '🌱'}
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Reto Terminado!</h3>
          <p className="text-5xl font-black text-calm-600 mb-6">{correctCount} / 5</p>
          
          <div className="min-h-[60px] flex items-center justify-center mb-8 italic text-gray-600 px-4">
            {loadingFeedback ? 'Calma está pensando un mensaje para ti...' : feedback}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGameState('setup')}
              className="bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200"
            >
              Cerrar
            </button>
            <button
              onClick={startGame}
              className="bg-calm-600 text-white py-4 rounded-2xl font-bold hover:bg-calm-700 shadow-lg"
            >
              Otro Round
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
