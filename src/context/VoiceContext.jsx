import { createContext, useContext } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const VoiceContext = createContext(null);

export function VoiceProvider({ children }) {
  const voice = useSpeechSynthesis();

  return (
    <VoiceContext.Provider value={voice}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
