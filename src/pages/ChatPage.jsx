import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import SearchIndicator from '../components/chat/SearchIndicator';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useVoice } from '../context/VoiceContext';
import { useDebounce } from '../hooks/useDebounce';
import * as chatService from '../services/chat.service';
import * as fileService from '../services/file.service';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    chats,
    setChats,
    activeChat,
    setActiveChat,
    messages,
    setChatMessages,
    addMessage,
    isLoading,
    setIsLoading,
  } = useChat();
  const { speak, isMuted } = useVoice();

  const [searchQuery, setSearchQuery] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [imageGenEnabled, setImageGenEnabled] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [chatFiles, setChatFiles] = useState({});
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      handleSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, isTyping]);

  const loadChats = async () => {
    try {
      const data = await chatService.getChats({ limit: 100 });
      setChats(data.chats);
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const loadChatFiles = useCallback(async (chatId) => {
    try {
      const files = await fileService.getChatFiles(chatId);
      setChatFiles((prev) => ({ ...prev, [chatId]: files }));
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  }, []);

  const handleSearch = async (query) => {
    try {
      if (query.trim()) {
        const data = await chatService.searchChats(query);
        setChats(data.chats);
      } else {
        const data = await chatService.getChats({ limit: 100 });
        setChats(data.chats);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSelectChat = useCallback(async (chatId) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveChat(chatId);
    setIsTyping(false);
    setStreamingContent('');
    setSelectedFiles([]);
    try {
      const [chatData] = await Promise.all([
        chatService.getChat(chatId),
        loadChatFiles(chatId),
      ]);
      setChatMessages(chatData.messages);
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  }, [setActiveChat, setChatMessages, loadChatFiles]);

  const handleCreateChat = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    try {
      const data = await chatService.createChat();
      setChats((prev) => [data.chat, ...prev]);
      setActiveChat(data.chat.id);
      setChatMessages([]);
      setIsTyping(false);
      setStreamingContent('');
      setSelectedFiles([]);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  }, [setChats, setActiveChat, setChatMessages]);

  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      await chatService.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
        setChatMessages([]);
        setStreamingContent('');
        setSelectedFiles([]);
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  }, [activeChat, setChats, setActiveChat, setChatMessages]);

  const handleRenameChat = useCallback(async (chatId, title) => {
    try {
      const data = await chatService.updateChat(chatId, { title });
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? data.chat : c))
      );
    } catch (err) {
      console.error('Failed to rename chat:', err);
    }
  }, [setChats]);

  const handleTogglePin = useCallback(async (chatId) => {
    try {
      const data = await chatService.togglePinChat(chatId);
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? data.chat : c))
      );
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  }, [setChats]);

  const handleFileSelect = useCallback(async (files, removeId) => {
    if (removeId) {
      setSelectedFiles((prev) => prev.filter((f) => f.id !== removeId));
      return;
    }
    if (!activeChat) {
      try {
        const chatData = await chatService.createChat();
        setChats((prev) => [chatData.chat, ...prev]);
        setActiveChat(chatData.chat.id);
        await uploadFiles(chatData.chat.id, files);
      } catch (err) {
        console.error('Failed:', err);
      }
      return;
    }
    await uploadFiles(activeChat, files);
  }, [activeChat, setChats, setActiveChat]);

  const uploadFiles = async (chatId, files) => {
    const uploaded = [];
    for (const file of files) {
      try {
        const result = await fileService.uploadFile(chatId, file);
        uploaded.push(result);
      } catch (err) {
        console.error('Failed to upload file:', err);
      }
    }
    if (uploaded.length > 0) {
      setSelectedFiles((prev) => [...prev, ...uploaded]);
      setChatFiles((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), ...uploaded],
      }));
    }
  };

  const getMessageFiles = (messageId) => {
    if (!activeChat) return [];
    const files = chatFiles[activeChat] || [];
    return files.filter((f) => f.message_id === messageId);
  };

  const handleSendMessage = useCallback(async (content) => {
    const currentFileIds = selectedFiles.map((f) => f.id);

    const sendToChat = async (chatId) => {
      setIsTyping(true);
      setIsLoading(true);
      setStreamingContent('');
      setSearchResults(null);
      setSelectedFiles([]);

      if (imageGenEnabled) {
        await chatService.streamImageGeneration(chatId, content, {
          onGenerating: (status) => {
            setStreamingContent(`*${status}*`);
          },
          onChunk: (chunk, fullContent) => {
            setStreamingContent(fullContent);
          },
          onImageDone: () => {},
          onDone: (aiMessage) => {
            addMessage(aiMessage);
            setStreamingContent('');
            setIsTyping(false);
            setIsLoading(false);
          },
          onError: (errorMsg) => {
            const errorMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Error: ${errorMsg}`,
              created_at: new Date().toISOString(),
            };
            addMessage(errorMessage);
            setStreamingContent('');
            setIsTyping(false);
            setIsLoading(false);
          },
        });
        return;
      }

      const streamFn = webSearchEnabled ? chatService.streamSearchCompletion : chatService.streamChatCompletion;

      await streamFn(chatId, content, {
        onSearchResults: (results, count) => {
          setSearchResults({ results, count });
        },
        onFileAttachments: () => {},
        onChunk: (chunk, fullContent) => {
          setStreamingContent(fullContent);
        },
        onDone: (aiMessage) => {
          addMessage(aiMessage);
          setStreamingContent('');
          setIsTyping(false);
          setIsLoading(false);
          if (!isMuted) {
            speak(aiMessage.content);
          }
        },
        onError: (errorMsg) => {
          const errorMessage = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Error: ${errorMsg}`,
            created_at: new Date().toISOString(),
          };
          addMessage(errorMessage);
          setStreamingContent('');
          setIsTyping(false);
          setIsLoading(false);
        },
      }, currentFileIds);
    };

    if (!activeChat) {
      try {
        const chatData = await chatService.createChat();
        setChats((prev) => [chatData.chat, ...prev]);
        setActiveChat(chatData.chat.id);
        await sendToChat(chatData.chat.id);
      } catch (err) {
        console.error('Failed:', err);
        setIsTyping(false);
        setIsLoading(false);
      }
      return;
    }

    await sendToChat(activeChat);
  }, [activeChat, setChats, setActiveChat, addMessage, setIsLoading, webSearchEnabled, imageGenEnabled, speak, isMuted, selectedFiles]);

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTyping(false);
    setIsLoading(false);
    setStreamingContent('');
    setSearchResults(null);
  }, []);

  const toggleWebSearch = useCallback(() => {
    setWebSearchEnabled((prev) => !prev);
  }, []);

  const toggleImageGen = useCallback(() => {
    setImageGenEnabled((prev) => !prev);
    if (webSearchEnabled) setWebSearchEnabled(false);
  }, [webSearchEnabled]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const activeChatData = chats.find((c) => c.id === activeChat);

  if (pageLoading) {
    return (
      <Layout
        chats={[]}
        activeChatId={null}
        onSelectChat={() => {}}
        onCreateChat={() => {}}
        onDeleteChat={() => {}}
        onRenameChat={() => {}}
        onTogglePin={() => {}}
        onSearch={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
        user={user}
        onSignOut={handleSignOut}
        onNavigateSettings={() => navigate('/settings')}
        onNavigateAdmin={() => navigate('/admin')}
        onExport={() => {}}
        chatTitle=""
      >
        <div className="flex items-center justify-center h-full">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      chats={chats}
      activeChatId={activeChat}
      onSelectChat={handleSelectChat}
      onCreateChat={handleCreateChat}
      onDeleteChat={handleDeleteChat}
      onRenameChat={handleRenameChat}
      onTogglePin={handleTogglePin}
      onSearch={handleSearch}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      user={user}
      onSignOut={handleSignOut}
      onNavigateSettings={() => navigate('/settings')}
      onNavigateAdmin={() => navigate('/admin')}
      onExport={(format) => activeChat && chatService.exportChat(activeChat, format)}
      chatTitle={activeChatData?.title}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isTyping ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                {activeChat ? 'Start a conversation' : 'AI Assistant'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                {activeChat
                  ? 'Send a message to begin chatting with the AI assistant.'
                  : 'Create a new chat or select an existing one to get started.'}
              </p>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLast={idx === messages.length - 1 && !isTyping}
                  files={getMessageFiles(msg.id)}
                />
              ))}

              {streamingContent && (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingContent,
                    created_at: new Date().toISOString(),
                  }}
                  isLast={true}
                />
              )}

              {isTyping && !streamingContent && <TypingIndicator />}

              {searchResults && (
                <SearchIndicator count={searchResults.count} />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="relative">
          {isTyping && (
            <button
              onClick={handleStopGeneration}
              className="absolute -top-10 left-1/2 -translate-x-1/2 btn-secondary flex items-center gap-2 px-4 py-1.5 text-sm animate-fade-in"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop generating
            </button>
          )}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isTyping}
            webSearchEnabled={webSearchEnabled}
            onToggleSearch={toggleWebSearch}
            imageGenEnabled={imageGenEnabled}
            onToggleImageGen={toggleImageGen}
            onFileSelect={handleFileSelect}
            selectedFiles={selectedFiles}
          />
        </div>
      </div>
    </Layout>
  );
}
