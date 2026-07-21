import { useState } from 'react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';

export default function Sidebar({
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
  isOpen,
  onClose,
}) {
  const [renameModal, setRenameModal] = useState(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const pinnedChats = chats.filter((c) => c.pinned);
  const recentChats = chats.filter((c) => !c.pinned);

  const handleRename = (chat) => {
    setRenameTitle(chat.title);
    setRenameModal(chat);
  };

  const confirmRename = () => {
    if (renameModal && renameTitle.trim()) {
      onRenameChat(renameModal.id, renameTitle.trim());
    }
    setRenameModal(null);
  };

  const handleDelete = (chat) => {
    setDeleteConfirm(chat);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDeleteChat(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  return (
    <>
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-40 w-72 lg:w-80 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={onCreateChat}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">New Chat</span>
          </button>
        </div>

        <div className="px-3 pt-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search chats..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {pinnedChats.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Pinned
              </div>
              {pinnedChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  onSelect={() => { onSelectChat(chat.id); onClose?.(); }}
                  onRename={() => handleRename(chat)}
                  onDelete={() => handleDelete(chat)}
                  onTogglePin={() => onTogglePin(chat.id)}
                />
              ))}
            </div>
          )}

          {recentChats.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {searchQuery ? 'Results' : 'Recent'}
              </div>
              {recentChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  onSelect={() => { onSelectChat(chat.id); onClose?.(); }}
                  onRename={() => handleRename(chat)}
                  onDelete={() => handleDelete(chat)}
                  onTogglePin={() => onTogglePin(chat.id)}
                />
              ))}
            </div>
          )}

          {chats.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {searchQuery ? 'No chats found' : 'No chats yet. Start a new conversation!'}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-3 relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar name={user?.email || 'User'} size="sm" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {user?.email || ''}
              </p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute bottom-full left-3 right-3 mb-1 glass-strong rounded-xl p-1 z-20 animate-slide-up">
                <button
                  onClick={() => { onNavigateSettings(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <button
                  onClick={() => { onNavigateAdmin(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Admin Dashboard
                </button>
                <button
                  onClick={() => { onSignOut(); setShowProfileMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      <Modal isOpen={!!renameModal} onClose={() => setRenameModal(null)} title="Rename Chat">
        <input
          type="text"
          value={renameTitle}
          onChange={(e) => setRenameTitle(e.target.value)}
          className="input-field mb-4"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => setRenameModal(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={confirmRename} className="btn-primary">
            Rename
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Chat">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all">
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}

function ChatItem({ chat, isActive, onSelect, onRename, onDelete, onTogglePin }) {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
    >
      <svg className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>

      <span className="flex-1 text-sm truncate">{chat.title}</span>

      <div className="hidden group-hover:flex items-center gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
          className={`p-1 rounded-md hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors ${
            chat.pinned ? 'text-yellow-500' : 'text-gray-400'
          }`}
          title={chat.pinned ? 'Unpin' : 'Pin'}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 12l-9.899-9.899-1.415 1.413L16.172 11H3v2h13.172l-5.486 5.486 1.414 1.414z" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onRename(); }}
          className="p-1 rounded-md hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-400 transition-colors"
          title="Rename"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
