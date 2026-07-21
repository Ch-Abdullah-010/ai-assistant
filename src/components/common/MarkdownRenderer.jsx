import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import CodeSandbox from '../chat/CodeSandbox';

function CodeBlock({ language, children }) {
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 rounded-t-lg border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem',
          fontSize: '0.875rem',
        }}
        showLineNumbers={code.split('\n').length > 3}
      >
        {code}
      </SyntaxHighlighter>
      <CodeSandbox language={language} code={code} />
    </div>
  );
}

function InlineCode({ children }) {
  return (
    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded-md text-sm font-mono">
      {children}
    </code>
  );
}

export default function MarkdownRenderer({ content }) {
  const components = useMemo(() => ({
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match) {
        return <CodeBlock language={match[1]}>{children}</CodeBlock>;
      }
      if (!inline) {
        return <CodeBlock language="">{children}</CodeBlock>;
      }
      return <InlineCode>{children}</InlineCode>;
    },
    a({ href, children }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
          {children}
        </a>
      );
    },
    ul({ children }) {
      return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-primary-500 pl-4 my-2 italic text-gray-600 dark:text-gray-400">
          {children}
        </blockquote>
      );
    },
    h1({ children }) {
      return <h1 className="text-2xl font-bold my-4">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-xl font-bold my-3">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-lg font-semibold my-2">{children}</h3>;
    },
    p({ children }) {
      return <p className="my-2 leading-relaxed">{children}</p>;
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-3">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {children}
          </table>
        </div>
      );
    },
    th({ children }) {
      return <th className="px-3 py-2 bg-gray-50 dark:bg-gray-800 text-left text-sm font-semibold">{children}</th>;
    },
    td({ children }) {
      return <td className="px-3 py-2 text-sm border-t border-gray-100 dark:border-gray-800">{children}</td>;
    },
  }), []);

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
