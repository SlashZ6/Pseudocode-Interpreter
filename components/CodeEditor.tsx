import React, { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  zoomLevel: number;
  errorLine: number | null;
  executionLine: number | null;
}

// --- Syntax Highlighting Logic ---

const KEYWORDS = [
  'Module', 'End Module', 'Function', 'End Function', 'Call', 'Return', 
  'Constant', 'Declare', 'Set', 'Display', 'Input', 'If', 'Then', 'Else', 
  'End If', 'Do', 'Until', 'While', 'End While', 'For', 'To', 'End For', 'And', 'Or', 'Not', 'Tap', 'Mod'
];
const DATA_TYPES = ['Integer', 'Real', 'String', 'Ref'];
const BUILT_IN_FUNCTIONS = [
  'sqrt', 'round', 'abs', 'cos', 'sin', 'tan', 'power', 'random', 
  'tointeger', 'toreal', 'stringtointeger', 'stringtoreal',
  'isinteger', 'isreal', 'currencyformat', 'length', 'toupper',
  'tolower', 'append', 'contains', 'substring'
];


const generateHighlightedHtml = (code: string): string => {
  const tokenDefinitions = [
    { type: 'comment', pattern: /^\/\/.*/, class: 'text-[var(--syntax-comment)]' },
    { type: 'string', pattern: /^".*?"/, class: 'text-[var(--syntax-string)]' },
    { type: 'keyword', pattern: new RegExp(`^\\b(${KEYWORDS.join('|')})\\b`, 'i'), class: 'text-[var(--syntax-keyword)] font-semibold' },
    { type: 'dataType', pattern: new RegExp(`^\\b(${DATA_TYPES.join('|')})\\b`, 'i'), class: 'text-[var(--syntax-dataType)]' },
    { type: 'builtin', pattern: new RegExp(`^\\b(${BUILT_IN_FUNCTIONS.join('|')})\\b`, 'i'), class: 'text-[var(--syntax-builtin)] font-semibold' },
    { type: 'number', pattern: /^\b\d+(\.\d+)?\b/, class: 'text-[var(--syntax-number)]' },
    { type: 'operator', pattern: /^(==|!=|<=|>=|[\+\-\*\/%=<>(),])/, class: 'text-[var(--syntax-operator)]' },
    { type: 'identifier', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*/, class: 'text-[var(--syntax-identifier)]' },
    { type: 'whitespace', pattern: /^\s+/, class: '' },
  ];

  let remainingCode = code;
  let html = '';

  while (remainingCode.length > 0) {
    let matched = false;
    for (const { pattern, class: className } of tokenDefinitions) {
      const match = remainingCode.match(pattern);
      if (match) {
        const token = match[0];
        const escapedToken = token.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        if (className) {
          html += `<span class="${className}">${escapedToken}</span>`;
        } else {
          html += escapedToken;
        }
        
        remainingCode = remainingCode.substring(token.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      const char = remainingCode[0];
      const escapedChar = char.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += escapedChar;
      remainingCode = remainingCode.substring(1);
    }
  }
  return html + '\n';
};


export const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, zoomLevel, errorLine, executionLine }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [lineCount, setLineCount] = useState(1);
  const [highlightedCode, setHighlightedCode] = useState('');

  const lineCounterRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineCount(lines > 0 ? lines : 1);
    setHighlightedCode(generateHighlightedHtml(code));
  }, [code]);
  
  const handleScroll = () => {
    if (lineCounterRef.current && textAreaRef.current && highlightRef.current) {
      const scrollTop = textAreaRef.current.scrollTop;
      const scrollLeft = textAreaRef.current.scrollLeft;
      lineCounterRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd, value } = target;

    if (e.key === 'Tab') {
      e.preventDefault();
      const indentation = '   ';
      const newValue = value.substring(0, selectionStart) + indentation + value.substring(selectionEnd);
      setCode(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = selectionStart + indentation.length;
      }, 0);

    } else if (e.key === 'Enter') {
        e.preventDefault();
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const currentLine = value.substring(lineStart, selectionStart);
        const match = currentLine.match(/^\s*/);
        const indentation = match ? match[0] : '';
        const newValue = value.substring(0, selectionStart) + '\n' + indentation + value.substring(selectionEnd);
        setCode(newValue);
        setTimeout(() => {
            target.selectionStart = target.selectionEnd = selectionStart + 1 + indentation.length;
        }, 0);
    }
  };
  
  const editorStyles = "absolute inset-0 p-2 font-mono leading-relaxed bg-transparent border-0 resize-none focus:outline-none w-full h-full m-0 overflow-auto whitespace-pre";

  return (
    <div 
      className={`flex flex-col bg-[var(--bg-secondary)] rounded-lg overflow-hidden h-full border border-[var(--border-primary)] ${isDesktop ? 'shadow-[0_0_30px_-10px_var(--shadow-color-secondary)]' : 'shadow-lg'}`}
      data-tutorial-id="code-editor"
    >
        <div className="bg-[var(--bg-tertiary)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-primary)]">
            Code Editor
        </div>
        <div className="flex-grow flex items-stretch overflow-hidden bg-[var(--bg-inset)]">
            <div 
              ref={lineCounterRef} 
              className="bg-[var(--bg-secondary)] text-right p-2 select-none overflow-y-hidden font-mono text-[var(--text-muted)] leading-relaxed"
              style={{ fontSize: `${zoomLevel}%` }}
            >
            {Array.from({ length: lineCount }, (_, i) => {
              const isError = errorLine === i + 1;
              const isExecuting = executionLine === i + 1;
              let lineClass = 'relative transition-colors';
              if (isError) lineClass += ' text-[var(--text-primary)] font-bold';
              else if (isExecuting) lineClass += ' text-[var(--text-primary)] font-bold';

              return (
                <div key={i} className={lineClass}>
                  {isError && <div className="absolute inset-y-0 left-0 w-full bg-[var(--accent-red)] opacity-70 rounded-sm"></div>}
                  {isExecuting && !isError && <div className="absolute inset-y-0 left-0 w-full bg-[var(--accent-secondary)] opacity-70 rounded-sm"></div>}
                  <span className="relative">{i + 1}</span>
                </div>
              );
            })}
            </div>
            <div className="flex-grow relative">
              <textarea
                ref={textAreaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                className={`${editorStyles} text-transparent caret-[var(--caret-color)] z-10`}
                style={{ fontSize: `${zoomLevel}%` }}
                spellCheck="false"
                aria-label="Code Editor"
              />
              <pre
                ref={highlightRef}
                aria-hidden="true"
                className={`${editorStyles} text-[var(--syntax-identifier)] z-0 pointer-events-none`}
                style={{ fontSize: `${zoomLevel}%` }}
              >
                  <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </pre>
            </div>
        </div>
    </div>
  );
};