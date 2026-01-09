
import React, { useRef, useState, useEffect } from 'react';

export const MandalaCreator: React.FC<{ addPoints: (p: number) => void }> = ({ addPoints }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#0ea5e9');
  const [symmetry, setSymmetry] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement?.clientWidth || 500;
    canvas.height = canvas.width;
  }, []);

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const relX = x - centerX;
    const relY = y - centerY;

    ctx.fillStyle = color;
    const angleStep = (Math.PI * 2) / symmetry;

    for (let i = 0; i < symmetry; i++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(i * angleStep);
      ctx.beginPath();
      ctx.arc(relX, relY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 text-center space-y-6">
      <h2 className="text-3xl font-black text-calm-800">Dibuja tu Paz 🌀</h2>
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-calm-100 aspect-square relative touch-none">
        <canvas 
          ref={canvasRef}
          onMouseDown={() => setIsDrawing(true)}
          onMouseMove={draw}
          onMouseUp={() => { setIsDrawing(false); addPoints(1); }}
          onTouchStart={() => setIsDrawing(true)}
          onTouchMove={draw}
          onTouchEnd={() => setIsDrawing(false)}
          className="w-full h-full cursor-crosshair"
        />
      </div>
      <div className="flex justify-center gap-2 overflow-x-auto p-2">
        {['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#000000'].map(c => (
          <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full border-4 ${color === c ? 'border-gray-400' : 'border-transparent'}`} style={{backgroundColor: c}} />
        ))}
        <button onClick={() => {
          const ctx = canvasRef.current?.getContext('2d');
          ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        }} className="bg-gray-100 px-4 rounded-full font-bold">Limpiar</button>
      </div>
    </div>
  );
};
