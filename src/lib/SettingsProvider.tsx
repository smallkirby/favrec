'use client';

import { createContext, useState } from 'react';
import type { Settings } from '@/types/Settings';

type SettingsContextType = {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  setSettings: (_settings: Settings) => {},
});

type Props = {
  children: React.ReactNode;
};

const SettingsProvider = ({ children }: Props) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsProvider };
