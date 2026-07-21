export default function SearchIndicator({ count }) {
  return (
    <div className="px-4 py-2 animate-fade-in">
      <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <svg className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <span className="text-xs text-primary-700 dark:text-primary-300">
          Searching the web ({count} {count === 1 ? 'result' : 'results'} found)
        </span>
      </div>
    </div>
  );
}
