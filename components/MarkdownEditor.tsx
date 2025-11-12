import React, { useId, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  label,
  value,
  onChange,
  required,
  placeholder,
  rows = 12,
}) => {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const id = useId();

  return (
    <div className="flex flex-col text-sm font-medium text-brand-text-dark">
      {label && (
        <label htmlFor={`${id}-textarea`} className="mb-1">
          {label}
          {required ? ' *' : null}
        </label>
      )}
      <div className="rounded-xl border border-brand-border bg-brand-bg-light shadow-sm">
        <div className="flex border-b border-brand-border text-xs font-semibold text-brand-text-muted">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`flex-1 px-3 py-2 uppercase tracking-wide transition-colors ${
              mode === 'write' ? 'bg-white text-brand-text-dark shadow-inner' : 'hover:text-brand-text-dark'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex-1 px-3 py-2 uppercase tracking-wide transition-colors ${
              mode === 'preview' ? 'bg-white text-brand-text-dark shadow-inner' : 'hover:text-brand-text-dark'
            }`}
          >
            Preview
          </button>
        </div>
        {mode === 'write' ? (
          <textarea
            id={`${id}-textarea`}
            required={required}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder || 'Write using Markdown…'}
            rows={rows}
            className="w-full resize-y bg-transparent px-4 py-3 text-brand-text-dark focus:outline-none"
          />
        ) : (
          <div className="prose prose-sm max-w-none px-4 py-3 text-brand-text-dark prose-headings:text-brand-text-dark prose-a:text-brand-primary">
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ inline, className, children, ...props }) => {
                    if (inline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="overflow-x-auto rounded-xl bg-brand-bg-light px-4 py-3">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-brand-text-muted">Nothing to preview yet. Start typing to see formatted Markdown.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
