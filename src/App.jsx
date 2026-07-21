import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { VoiceProvider } from './context/VoiceContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <VoiceProvider>
            <AppRoutes />
          </VoiceProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
