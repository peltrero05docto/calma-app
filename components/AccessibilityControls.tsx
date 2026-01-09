import React from 'react';
import { AccessibilitySettings } from '../types';

interface Props {
  settings: AccessibilitySettings;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
}

export const AccessibilityControls: React.FC<Props> = ({ settings, setSettings }) => {
  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <button
        onClick={() => toggleSetting('highContrast')}
        className={`p-3 rounded-full shadow-lg transition-colors ${settings.highContrast ? 'bg-yellow-400 text-black font-bold' : 'bg-white text-gray-700'}`}
        aria-label="Alternar alto contraste"
        title="Alto Contraste"
      >
        <span className="text-xl">👁️</span>
      </button>
      <button
        onClick={() => toggleSetting('largeText')}
        className={`p-3 rounded-full shadow-lg transition-colors ${settings.largeText ? 'bg-yellow-400 text-black font-bold' : 'bg-white text-gray-700'}`}
        aria-label="Alternar texto grande"
        title="Texto Grande"
      >
        <span className="text-xl">A+</span>
      </button>
    </div>
  );
};