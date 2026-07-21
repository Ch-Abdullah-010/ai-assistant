import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useVoice } from '../context/VoiceContext';
import apiClient from '../api/client';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
  const { isMuted, toggleMute, isSpeaking } = useVoice();
  const [systemPrompt, setSystemPrompt] = useState('');
  const [promptSaved, setPromptSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await apiClient.get('/user/profile');
      if (data.profile?.system_prompt) {
        setSystemPrompt(data.profile.system_prompt);
      }
    } catch (err) {
      // ignore
    }
  };

  const saveSystemPrompt = async () => {
    try {
      await apiClient.patch('/user/settings', { system_prompt: systemPrompt });
      setPromptSaved(true);
      setTimeout(() => setPromptSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save prompt:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface-dark">
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
          <button
            onClick={() => navigate('/')}
            className="btn-ghost flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chat
          </button>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Profile
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.email || 'Not signed in'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Member since</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Switch between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                    theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${
                      theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  >
                    {theme === 'dark' ? (
                      <svg className="w-3.5 h-3.5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Font Size</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Adjust text size ({fontSize}px)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                    disabled={fontSize <= 12}
                    className="btn-secondary px-3 py-1 text-sm"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                    disabled={fontSize >= 24}
                    className="btn-secondary px-3 py-1 text-sm"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Language</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose your preferred language
                  </p>
                </div>
                <select
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="input-field text-sm py-1.5 px-3 w-auto"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Voice
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">AI Voice</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hear AI responses read aloud
                  </p>
                </div>
                <button
                  onClick={toggleMute}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                    !isMuted ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${
                      !isMuted ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  >
                    {!isMuted ? (
                      <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Custom Instructions
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              These instructions are sent to the AI with every message across all chats.
            </p>
            <textarea
              value={systemPrompt}
              onChange={(e) => { setSystemPrompt(e.target.value); setPromptSaved(false); }}
              placeholder="e.g. You are a helpful assistant that speaks like a pirate..."
              rows={4}
              className="input-field w-full mb-3 text-sm resize-y"
            />
            <button
              onClick={saveSystemPrompt}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                promptSaved
                  ? 'bg-green-500 text-white'
                  : 'btn-primary'
              }`}
            >
              {promptSaved ? 'Saved!' : 'Save Instructions'}
            </button>
          </div>

          <div className="glass-card p-6 border border-red-200 dark:border-red-900/50">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
