import React, { useState, useEffect, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decodeAudio, decodeAudioData } from '../services/audioUtils';

export const BreathingExercise: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [instructions, setInstructions] = useState("Selecciona la duración y comienza");
  const [totalBreaths, setTotalBreaths] = useState<3 | 5>(3);
  const [currentBreath, setCurrentBreath] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const isRunningRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
    };
  }, []);

  const playAudioInstruction = async (text: string) => {
    // Only play audio if running or if it's an important status message
    if (!isRunningRef.current && phase !== 'idle') return; 
    
    try {
      const base64Audio = await generateSpeech(text);
      if (!base64Audio) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(
        decodeAudio(base64Audio),
        ctx,
        24000,
        1
      );
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startSession = async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setCurrentBreath(1);
    
    // Initial instruction
    await playAudioInstruction(`Iniciando sesión de ${totalBreaths} respiraciones. Relájate.`);
    
    for (let i = 1; i <= totalBreaths; i++) {
      if (!isRunningRef.current) break;
      setCurrentBreath(i);

      // Inhale (4s)
      setPhase('inhale');
      setInstructions(`Inhala profundamente... (${i}/${totalBreaths})`);
      playAudioInstruction("Inhala."); // Async play
      await wait(4000);

      if (!isRunningRef.current) break;

      // Hold (4s)
      setPhase('hold');
      setInstructions(`Mantén el aire... (${i}/${totalBreaths})`);
      // playAudioInstruction("Mantén."); // Keeping silence for hold often feels better
      await wait(4000);

      if (!isRunningRef.current) break;

      // Exhale (4s)
      setPhase('exhale');
      setInstructions(`Exhala lentamente... (${i}/${totalBreaths})`);
      playAudioInstruction("Exhala.");
      await wait(4000);
    }

    if (isRunningRef.current) {
      setPhase('idle');
      setInstructions("¡Sesión completada! ¿Te sientes mejor?");
      playAudioInstruction("Muy bien. Has terminado el ejercicio.");
      isRunningRef.current = false;
      setCurrentBreath(0);
    }
  };

  const stopSession = () => {
    isRunningRef.current = false;
    setPhase('idle');
    setInstructions("Ejercicio detenido.");
    setCurrentBreath(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <h2 className="text-3xl font-bold text-calm-800 mb-4">Respiración Guiada</h2>
      
      {/* Settings (Only visible when idle or transitioning) */}
      <div className={`mb-8 flex gap-4 transition-all duration-300 ${phase !== 'idle' ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
        <button
          onClick={() => setTotalBreaths(3)}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${totalBreaths === 3 ? 'bg-calm-600 text-white shadow-md transform scale-105' : 'bg-white text-calm-600 border border-calm-200'}`}
        >
          3 Respiraciones
        </button>
        <button
          onClick={() => setTotalBreaths(5)}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${totalBreaths === 5 ? 'bg-calm-600 text-white shadow-md transform scale-105' : 'bg-white text-calm-600 border border-calm-200'}`}
        >
          5 Respiraciones
        </button>
      </div>
      
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        {/* Visual Cue for Hearing Impaired */}
        <div 
          className={`absolute w-full h-full rounded-full bg-calm-200 opacity-50 transition-transform duration-[4000ms] ease-in-out ${
            phase === 'inhale' ? 'scale-150' : phase === 'exhale' ? 'scale-75' : 'scale-100'
          }`}
        />
        <div 
          className={`absolute w-48 h-48 rounded-full bg-calm-400 opacity-60 transition-transform duration-[4000ms] ease-in-out ${
            phase === 'inhale' ? 'scale-125' : phase === 'exhale' ? 'scale-90' : 'scale-100'
          }`}
        />
        <div className="z-10 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-calm-900 drop-shadow-sm">
            {phase === 'inhale' && "Inhala"}
            {phase === 'hold' && "Mantén"}
            {phase === 'exhale' && "Exhala"}
            {phase === 'idle' && "Listo"}
          </span>
          {phase !== 'idle' && (
            <span className="text-sm font-bold text-calm-800 mt-1 bg-white/50 px-2 py-0.5 rounded-full">
              {currentBreath} / {totalBreaths}
            </span>
          )}
        </div>
      </div>

      <p className="text-xl mb-6 min-h-[3rem] font-medium text-gray-700">{instructions}</p>

      {phase === 'idle' ? (
        <button
          onClick={startSession}
          className="px-10 py-4 bg-nature-500 hover:bg-nature-600 text-white rounded-full text-xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <span>▶️</span> Iniciar
        </button>
      ) : (
        <button
          onClick={stopSession}
          className="px-8 py-3 bg-red-400 hover:bg-red-500 text-white rounded-full text-lg font-bold shadow-md transition-all"
        >
          ⏹️ Detener
        </button>
      )}
      
      <p className="mt-8 text-sm text-gray-500 max-w-md">
        (Audio y señales visuales activadas para accesibilidad. Ajusta el número de respiraciones según lo que necesites hoy.)
      </p>
    </div>
  );
};