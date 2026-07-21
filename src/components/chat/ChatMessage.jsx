import { useState } from 'react';
import MarkdownRenderer from '../common/MarkdownRenderer';
import Avatar from '../ui/Avatar';
import { useVoice } from '../../context/VoiceContext';

export default function ChatMessage({ message, isLast = false, files = [] }) {
  const [copied, setCopied] = useState(false);
  const { speak, stop, isSpeaking } = useVoice();
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isStreaming = message.id === 'streaming';

  const isThisMessageSpeaking = isSpeaking;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isThisMessageSpeaking) {
      stop();
    } else {
      stop();
      speak(message.content);
    }
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 animate-fade-in ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      <Avatar
        name={isUser ? 'You' : 'AI'}
        size="sm"
        className={isUser ? 'order-1' : ''}
      />

      <div
        className={`flex flex-col max-w-[80%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : isSystem
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-gray-700 dark:text-gray-300 rounded-tl-sm border border-yellow-200 dark:border-yellow-800'
              : 'glass-card rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/20">
                      {f.is_image ? (
                        <a
                          href={`/api/files/${f.id}/serve`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-16 h-16 rounded overflow-hidden"
                        >
                          <img
                            src={`/api/files/${f.id}/serve`}
                            alt={f.original_name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </a>
                      ) : (
                        <a
                          href={`/api/files/${f.id}/download`}
                          className="flex items-center gap-1.5 text-xs text-white/90 hover:text-white"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="truncate max-w-[100px]">{f.original_name}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </>
          ) : (
            <div className={`text-sm leading-relaxed ${isUser ? 'text-white' : ''}`}>
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {message.created_at
              ? new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </span>

          {!isUser && !isStreaming && (
            <>
              <button
                onClick={handleSpeak}
                className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  isThisMessageSpeaking
                    ? 'text-primary-500'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title={isThisMessageSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isThisMessageSpeaking ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>

              <button
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
