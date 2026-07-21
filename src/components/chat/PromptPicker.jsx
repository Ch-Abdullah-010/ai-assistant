import { useState, useEffect } from 'react';
import * as promptService from '../../services/prompt.service';

export default function PromptPicker({ onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [showSave, setShowSave] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveContent, setSaveContent] = useState('');

  useEffect(() => {
    if (open) loadPrompts();
  }, [open]);

  const loadPrompts = async () => {
    try {
      const list = await promptService.getPrompts();
      setPrompts(list);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  };

  const handleSave = async () => {
    if (!saveTitle.trim() || !saveContent.trim()) return;
    try {
      await promptService.createPrompt(saveTitle.trim(), saveContent.trim());
      setSaveTitle('');
      setSaveContent('');
      setShowSave(false);
      loadPrompts();
    } catch (err) {
      console.error('Failed to save prompt:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await promptService.deletePrompt(id);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete prompt:', err);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        title="Prompt Library"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-80 glass-strong rounded-xl z-20 animate-slide-up max-h-[400px] flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prompts</span>
              <button
                onClick={() => setShowSave(true)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                + New
              </button>
            </div>

            {showSave ? (
              <div className="p-3 space-y-2">
                <input
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Prompt title..."
                  className="input-field text-sm py-1.5 px-2 w-full"
                  autoFocus
                />
                <textarea
                  value={saveContent}
                  onChange={(e) => setSaveContent(e.target.value)}
                  placeholder="Prompt content..."
                  rows={3}
                  className="input-field text-sm py-1.5 px-2 w-full resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-primary text-xs px-3 py-1.5">Save</button>
                  <button onClick={() => { setShowSave(false); setSaveTitle(''); setSaveContent(''); }} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-1">
                {prompts.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No prompts saved yet.</p>
                ) : (
                  prompts.map((p) => (
                    <div
                      key={p.id}
                      className="group flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => { onSelect(p.content); setOpen(false); }}
                    >
                      <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.title}</p>
                        <p className="text-xs text-gray-500 truncate">{p.content}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
