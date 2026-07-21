import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import FilePreview from './FilePreview';
import PromptPicker from './PromptPicker';

export default function ChatInput({ onSend, disabled = false, webSearchEnabled = false, onToggleSearch, imageGenEnabled = false, onToggleImageGen, onFileSelect, selectedFiles = [] }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const {
    isListening,
    transcript,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        onSend(transcript.trim());
        setInput('');
        resetTranscript();
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileSelect?.(files);
    }
    e.target.value = '';
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark px-4 py-3">
      <div className="max-w-4xl mx-auto relative">
        <FilePreview files={selectedFiles} onRemove={(id) => onFileSelect?.(null, id)} />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.csv,.md,.json,.docx,.xlsx"
          className="hidden"
          onChange={handleFileSelect}
        />
        <div className="glass-card flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : imageGenEnabled ? 'Describe the image you want to generate...' : 'Send a message...'}
            rows={1}
            disabled={disabled || isListening}
            className="flex-1 resize-none bg-transparent border-0 outline-none px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm max-h-[200px]"
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Upload file"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <PromptPicker onSelect={(content) => setInput((prev) => prev + content)} disabled={disabled} />

            <button
              type="button"
              onClick={onToggleSearch}
              disabled={disabled}
              className={`p-2 rounded-xl transition-all duration-200 ${
                webSearchEnabled
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title={webSearchEnabled ? 'Web search enabled' : 'Enable web search'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onToggleImageGen}
              disabled={disabled}
              className={`p-2 rounded-xl transition-all duration-200 ${
                imageGenEnabled
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title={imageGenEnabled ? 'Image generation enabled' : 'Enable image generation'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {speechSupported && (
              <button
                type="button"
                onClick={handleVoiceToggle}
                disabled={disabled}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title={isListening ? 'Stop recording' : 'Voice input'}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isListening ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 9v4m0 4h.01" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || disabled}
              className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 dark:disabled:text-gray-400 transition-all duration-200 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
