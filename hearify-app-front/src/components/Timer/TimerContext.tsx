import React, { createContext, useState, useContext } from 'react';

import type { ReactNode } from 'react';

interface TimerContextType {
  timeLeft: number | null;
  setTimeLeft: (time: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  return <TimerContext.Provider value={{ timeLeft, setTimeLeft }}>{children}</TimerContext.Provider>;
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
