import React, { useState, useRef } from 'react';
import { editArtImage } from '../services/geminiService';

export const ArtTherapy: React.FC<{ addPoints: (pts: number) => void }> = ({ addPoints }) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    try {
      // Remove data URL prefix for API
      const base64Data = image.split(',')[1];
      const newImage = await editArtImage(base64Data, prompt);
      if (newImage) {
        setResult(newImage);
        addPoints(50); // Gamification reward
      }
    } catch (e) {
      alert("Lo siento, no pude procesar la imagen esta vez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-calm-800 mb-2">Estudio de Arte Relajante</h2>
      <p className="mb-6 text-gray-600">Sube una foto y transfórmala en algo mágico para relajar tu mente.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-dashed border-calm-300">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-calm-50 transition-colors"
            >
              <span className="text-6xl mb-2">🖼️</span>
              <p>Toca para subir una imagen</p>
            </div>
          ) : (
            <div className="relative">
              <img src={image} alt="Original" className="w-full h-64 object-cover rounded-lg" />
              <button 
                onClick={() => { setImage(null); setResult(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
              >
                ✕
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">¿Cómo quieres transformarla?</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Hazlo parecer una pintura de acuarela relajante"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-calm-400 outline-none"
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!image || !prompt || loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              !image || !prompt || loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700 shadow-md'
            }`}
          >
            {loading ? 'Creando arte...' : '✨ Transformar'}
          </button>

          {result && (
            <div className="mt-4 animate-fade-in">
              <p className="text-center font-semibold text-green-600 mb-2">¡Aquí está tu creación!</p>
              <img src={result} alt="Arte Generado" className="w-full rounded-lg shadow-xl border-4 border-white" />
              <a href={result} download="mi_arte_calma.png" className="block text-center mt-2 text-calm-700 underline">
                Descargar
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};