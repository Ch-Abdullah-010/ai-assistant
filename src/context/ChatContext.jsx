import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const createChat = useCallback(() => {
    const newChat = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
    return newChat;
  }, []);

  const deleteChat = useCallback((chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
      setMessages([]);
    }
  }, [activeChat]);

  const renameChat = useCallback((chatId, title) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, title, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  const togglePinChat = useCallback((chatId) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, pinned: !c.pinned, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const setChatMessages = useCallback((chatMessages) => {
    setMessages(chatMessages);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{
      chats,
      setChats,
      activeChat,
      messages,
      isLoading,
      setIsLoading,
      createChat,
      deleteChat,
      renameChat,
      togglePinChat,
      addMessage,
      setChatMessages,
      clearMessages,
      setActiveChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
