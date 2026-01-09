
import React, { useState } from 'react';

export const TeacherFeedback: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    utility: '5',
    uiRating: '5',
    feedbackText: '',
    implementation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se enviaría a una base de datos o API. Por ahora simulamos éxito.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center animate-fade-in">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-3xl font-black text-calm-800 mb-2">¡Gracias, Profe!</h2>
        <p className="text-gray-600 mb-8">Su retroalimentación es invaluable para hacer de Calma una herramienta que realmente ayude a los chavos.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-calm-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-calm-800">Panel de Evaluación Docente</h2>
        <p className="text-gray-500 mt-2">Ayúdenos a validar la funcionalidad y viabilidad de Calma en el entorno educativo.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-calm-100">
          <label className="block font-bold text-gray-700 mb-4 text-lg">1. Perfil y Viabilidad</label>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">¿Cuál es su especialidad o rol educativo?</p>
              <input 
                type="text" 
                required
                className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-calm-400 outline-none transition-all"
                placeholder="Ej: Orientador, Docente de Matemáticas..."
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">¿Considera factible integrar "Calma" como una pausa activa en sus clases? (1 al 10)</p>
              <input 
                type="range" min="1" max="10" 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-calm-600"
                value={formData.utility}
                onChange={e => setFormData({...formData, utility: e.target.value})}
              />
              <div className="flex justify-between text-xs font-bold text-gray-400 mt-2">
                <span>Nada factible</span>
                <span className="text-calm-600 font-black">Valor: {formData.utility}</span>
                <span>Totalmente factible</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-calm-100">
          <label className="block font-bold text-gray-700 mb-4 text-lg">2. Análisis de Funcionalidad</label>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">¿Qué funcionalidad cree que tiene mayor potencial para reducir el estrés escolar?</p>
            <select 
              className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-calm-400 outline-none"
              value={formData.implementation}
              onChange={e => setFormData({...formData, implementation: e.target.value})}
            >
              <option value="">Seleccione una opción...</option>
              <option value="breathing">Respiración Guiada</option>
              <option value="math">Retos de Enfoque (Matemáticas)</option>
              <option value="chat">Compañero IA (Apoyo Emocional)</option>
              <option value="learn">Aprende lo que sea (Búsqueda simplificada)</option>
              <option value="art">Arte Terapia</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-calm-100">
          <label className="block font-bold text-gray-700 mb-4 text-lg">3. Comentarios y Sugerencias</label>
          <textarea 
            required
            className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-calm-400 outline-none h-40 resize-none"
            placeholder="¿Qué riesgos identifica? ¿Qué cambios haría en el lenguaje o la interfaz?"
            value={formData.feedbackText}
            onChange={e => setFormData({...formData, feedbackText: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-calm-700 text-white py-5 rounded-3xl text-xl font-bold shadow-xl hover:bg-calm-800 transform hover:scale-[1.02] transition-all"
        >
          Enviar Evaluación Profesional 🚀
        </button>
      </form>
    </div>
  );
};
