export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-dot" style={{ animationDelay: '0s' }} />
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
}
