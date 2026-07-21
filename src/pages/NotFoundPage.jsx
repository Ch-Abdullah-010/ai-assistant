import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-dark">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">
          Page not found
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}
