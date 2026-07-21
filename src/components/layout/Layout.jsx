import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import InstallPrompt from '../ui/InstallPrompt';

export default function Layout({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onRenameChat,
  onTogglePin,
  onSearch,
  searchQuery,
  setSearchQuery,
  user,
  onSignOut,
  onNavigateSettings,
  onNavigateAdmin,
  onExport,
  chatTitle,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-surface-dark">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
        onCreateChat={onCreateChat}
        onDeleteChat={onDeleteChat}
        onRenameChat={onRenameChat}
        onTogglePin={onTogglePin}
        onSearch={onSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onSignOut={onSignOut}
        onNavigateSettings={onNavigateSettings}
        onNavigateAdmin={onNavigateAdmin}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          chatTitle={chatTitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onExport={onExport}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <InstallPrompt />
      </div>
    </div>
  );
}
