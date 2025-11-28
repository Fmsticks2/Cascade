
import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

interface SoundContextType {
  playClick: () => void;
  playHover: () => void;
  playSuccess: () => void;
  playError: () => void;
  playPop: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    return {
      playClick: () => {},
      playHover: () => {},
      playSuccess: () => {},
      playError: () => {},
      playPop: () => {},
    };
  }
  return context;
};

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // We need to wrap usage in a component that has access to SettingsContext
  // However, SoundProvider wraps App, which wraps SettingsProvider usually? 
  // Wait, in App.tsx we need SettingsProvider OUTSIDE SoundProvider.
  // We will assume that structure in App.tsx.
  const { soundEnabled } = useSettings();

  const initAudio = () => {
    if (!soundEnabled) return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
    if (!soundEnabled) return;
    try {
        const ctx = initAudio();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        // Audio policy might block auto-play
    }
  };

  const playClick = () => playTone(600, 'sine', 0.1, 0.05);
  const playHover = () => playTone(400, 'sine', 0.05, 0.02);
  
  const playPop = () => {
      if (!soundEnabled) return;
      try {
        const ctx = initAudio();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {}
  };

  const playSuccess = () => {
    if (!soundEnabled) return;
    try {
        const ctx = initAudio();
        if (!ctx) return;
        const now = ctx.currentTime;
        
        // Arpeggio
        [440, 554, 659].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.05, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.4);
        });
    } catch (e) {}
  };

  const playError = () => {
      if (!soundEnabled) return;
      try {
        const ctx = initAudio();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
  };

  return (
    <SoundContext.Provider value={{ playClick, playHover, playSuccess, playError, playPop }}>
      {children}
    </SoundContext.Provider>
  );
};
