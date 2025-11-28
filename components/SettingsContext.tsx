
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  godMode: boolean;
  toggleGodMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [godMode, setGodMode] = useState(false);

  // Load settings from local storage on mount
  useEffect(() => {
    const savedSound = localStorage.getItem('cascade_settings_sound');
    const savedNotifs = localStorage.getItem('cascade_settings_notifs');
    const savedGodMode = localStorage.getItem('cascade_settings_godmode');

    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    if (savedNotifs !== null) setNotificationsEnabled(savedNotifs === 'true');
    if (savedGodMode !== null) setGodMode(savedGodMode === 'true');
  }, []);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('cascade_settings_sound', String(newVal));
      return newVal;
    });
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('cascade_settings_notifs', String(newVal));
      return newVal;
    });
  };

  const toggleGodMode = () => {
    setGodMode(prev => {
      const newVal = !prev;
      localStorage.setItem('cascade_settings_godmode', String(newVal));
      return newVal;
    });
  };

  return (
    <SettingsContext.Provider value={{ 
      soundEnabled, toggleSound, 
      notificationsEnabled, toggleNotifications, 
      godMode, toggleGodMode 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
