import { useState, useRef } from 'react';

const LANGUAGES_WITH_RUN = ['javascript', 'js', 'html', 'typescript', 'ts', 'jsx', 'tsx'];

export default function CodeSandbox({ language, code }) {
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  const canRun = LANGUAGES_WITH_RUN.includes(language);

  const handleRun = () => {
    setRunning(true);
    setOutput(null);
    setError(null);

    const iframe = iframeRef.current;

    if (language === 'html') {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframe.src = url;
      iframe.onload = () => {
        URL.revokeObjectURL(url);
        setRunning(false);
        setOutput('HTML rendered in iframe below');
      };
      return;
    }

    const originalLog = console.log;
    const logs = [];

    console.log = (...args) => {
      logs.push(args.map((a) => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
    };

    try {
      const result = eval(code);
      if (result !== undefined) {
        logs.push(String(result));
      }
      console.log = originalLog;
      setOutput(logs.join('\n') || 'undefined');
    } catch (e) {
      console.log = originalLog;
      setError(e.message);
    }
    setRunning(false);
  };

  const handleClear = () => {
    setOutput(null);
    setError(null);
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  };

  if (!canRun) return null;

  return (
    <div className="mt-2 mb-1">
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {running ? 'Running...' : 'Run'}
        </button>
        {(output || error) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {language === 'html' && (
        <iframe
          ref={iframeRef}
          title="sandbox"
          sandbox="allow-scripts allow-same-origin"
          className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white"
          style={{ height: output ? '200px' : '0', minHeight: output ? '200px' : '0' }}
        />
      )}

      {output && language !== 'html' && (
        <pre className="text-xs p-3 rounded-lg bg-gray-900 text-green-400 overflow-x-auto whitespace-pre-wrap">
          {output}
        </pre>
      )}

      {error && (
        <pre className="text-xs p-3 rounded-lg bg-red-900/20 text-red-400 overflow-x-auto whitespace-pre-wrap border border-red-800">
          {error}
        </pre>
      )}
    </div>
  );
}
