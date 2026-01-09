
import React, { useEffect, useRef, useState } from 'react';
import { Modality, LiveServerMessage } from '@google/genai';
import { getAIInstance, createChatSession } from '../services/geminiService.ts';
import { createBlob, decodeAudio, decodeAudioData } from '../services/audioUtils.ts';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatCompanion: React.FC = () => {
  const [mode, setMode] = useState<'voice' | 'text'>('text');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy Calma. Estoy aquí para escucharte. ¿Prefieres hablar por voz o escribir?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    chatSessionRef.current = createChatSession();
    return () => disconnectVoice();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const connectToLiveAPI = async () => {
    try {
      if (!inputAudioContextRef.current) {
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      await inputAudioContextRef.current.resume();
      await outputAudioContextRef.current.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = getAIInstance();
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setConnected(true);
            setMessages(prev => [...prev, { role: 'model', text: '[Modo Voz Activo] Te escucho, amigo.' }]);
            
            if (inputAudioContextRef.current) {
              const source = inputAudioContextRef.current.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current.destination);
              sessionRef.current = { stream, scriptProcessor };
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decodeAudio(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onclose: () => setConnected(false),
          onerror: (err) => {
            console.error(err);
            setConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: "Eres 'Calma', un compañero empático. Usa un tono suave y acogedor. Escucha más de lo que hablas.",
          inputAudioTranscription: {}
        }
      });
      
    } catch (e: any) {
      alert("No se pudo conectar el micrófono. Revisa tus permisos.");
      setConnected(false);
    }
  };

  const disconnectVoice = () => {
    if (sessionRef.current) {
      sessionRef.current.stream.getTracks().forEach((t: any) => t.stop());
      sessionRef.current.scriptProcessor.disconnect();
      sessionRef.current = null;
    }
    setConnected(false);
  };

  const handleSendText = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const modelMsg: Message = { role: 'model', text: response.text || "Aquí estoy para lo que necesites." };
      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Oye, mi conexión falló un segundo. ¿Me lo cuentas de nuevo?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] p-4 max-w-2xl mx-auto w-full">
      <div className="bg-white rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden border border-calm-200">
        
        <div className="p-4 bg-calm-100 border-b border-calm-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-calm-800">Compañero</h2>
          <div className="flex bg-white/50 p-1 rounded-full border border-calm-300">
            <button 
              onClick={() => { setMode('text'); disconnectVoice(); }}
              className={`px-4 py-1 rounded-full text-sm font-bold transition-all ${mode === 'text' ? 'bg-calm-600 text-white' : 'text-calm-600'}`}
            >
              Texto
            </button>
            <button 
              onClick={() => setMode('voice')}
              className={`px-4 py-1 rounded-full text-sm font-bold transition-all ${mode === 'voice' ? 'bg-calm-600 text-white' : 'text-calm-600'}`}
            >
              Voz
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-calm-600 text-white rounded-br-none' 
                  : 'bg-white border border-calm-100 text-gray-800 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-calm-50 border border-calm-100 p-3 rounded-2xl flex gap-1">
                <span className="w-2 h-2 bg-calm-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-calm-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-calm-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          {mode === 'voice' ? (
            <div className="flex flex-col items-center gap-3">
              {!connected ? (
                <button
                  onClick={connectToLiveAPI}
                  className="flex items-center gap-3 bg-calm-600 hover:bg-calm-700 text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg transition-all transform hover:scale-105"
                >
                  <span className="text-2xl">🎙️</span> Hablar con Calma
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                   <div className="flex items-center gap-2">
                     <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                     <span className="font-bold text-red-500">CONEXIÓN ABIERTA...</span>
                   </div>
                   <button
                    onClick={disconnectVoice}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2 rounded-full font-bold transition-colors"
                  >
                    Cerrar Micrófono
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 text-center">
                Tu privacidad es importante. El audio no se guarda.
              </p>
            </div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendText(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe lo que sientes..."
                className="flex-1 bg-gray-50 border-2 border-calm-100 rounded-2xl px-5 py-3 outline-none focus:border-calm-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-calm-600 text-white p-3 rounded-2xl hover:bg-calm-700 disabled:opacity-50 transition-all shadow-md"
              >
                <span className="text-xl">➔</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
