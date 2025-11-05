import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const blockCommands = [
  { label: 'H2', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
  { label: 'H3', command: 'formatBlock', value: 'h3', title: 'Heading 3' },
  { label: 'Quote', command: 'formatBlock', value: 'blockquote', title: 'Quote' },
];

const inlineCommands = [
  { label: 'B', command: 'bold', title: 'Bold' },
  { label: 'I', command: 'italic', title: 'Italic' },
  { label: 'U', command: 'underline', title: 'Underline' },
];

const listCommands = [
  { label: '• List', command: 'insertUnorderedList', title: 'Bullet list' },
  { label: '1. List', command: 'insertOrderedList', title: 'Numbered list' },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '<p><br></p>';
    }
  }, [value]);

  const exec = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
  };

  const handleLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      exec('createLink', url);
    }
  };

  return (
    <div className="rounded-lg border border-brand-border">
      <div className="flex flex-wrap gap-2 border-b border-brand-border bg-brand-bg-light px-3 py-2 text-sm">
        {inlineCommands.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.title}
            onClick={() => exec(item.command)}
            className="rounded px-2 py-1 font-semibold text-brand-text-dark hover:bg-brand-bg-light-alt"
          >
            {item.label}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-brand-border" aria-hidden />
        {blockCommands.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.title}
            onClick={() => exec(item.command, item.value)}
            className="rounded px-2 py-1 text-brand-text-dark hover:bg-brand-bg-light-alt"
          >
            {item.label}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-brand-border" aria-hidden />
        {listCommands.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.title}
            onClick={() => exec(item.command)}
            className="rounded px-2 py-1 text-brand-text-dark hover:bg-brand-bg-light-alt"
          >
            {item.label}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-brand-border" aria-hidden />
        <button
          type="button"
          title="Insert link"
          onClick={handleLink}
          className="rounded px-2 py-1 text-brand-text-dark hover:bg-brand-bg-light-alt"
        >
          Link
        </button>
        <button
          type="button"
          title="Remove formatting"
          onClick={() => exec('removeFormat')}
          className="rounded px-2 py-1 text-brand-text-dark hover:bg-brand-bg-light-alt"
        >
          Clear
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          const html = editorRef.current?.innerHTML ?? '';
          onChange(html === '<br>' ? '' : html);
        }}
        onBlur={() => {
          const html = editorRef.current?.innerHTML ?? '';
          onChange(html === '<br>' ? '' : html);
        }}
        className="min-h-[240px] bg-white px-3 py-3 text-sm leading-relaxed text-brand-text-dark focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
