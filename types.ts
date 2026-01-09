
export type View = 'home' | 'breathing' | 'chat' | 'art' | 'learn' | 'motivation' | 'math' | 'profile';

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
}

export interface UserProgress {
  points: number;
  badges: string[];
  streak: number;
  lastLogin: string;
}

export interface MoodLog {
  timestamp: string;
  mood: string;
  emoji: string;
  thought?: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}
