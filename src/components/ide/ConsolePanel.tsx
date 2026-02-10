import { useRef, useEffect, useState, useCallback } from 'react';
import { useIDE } from '@/contexts/IDEContext';
import { Trash2, Download, ChevronUp, ChevronDown } from 'lucide-react';

export default function ConsolePanel() {
  const { consoleLines, clearConsole, waitingForInput, inputResolverRef, addConsoleLine } = useIDE();
  const [inputValue, setInputValue] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLines]);

  useEffect(() => {
    if (waitingForInput) inputRef.current?.focus();
  }, [waitingForInput]);

  const handleSubmitInput = useCallback(() => {
    if (!inputResolverRef.current) return;
    addConsoleLine({ type: 'input', text: `> ${inputValue}`, timestamp: Date.now() });
    inputResolverRef.current(inputValue);
    inputResolverRef.current = null;
    setInputValue('');
  }, [inputValue, inputResolverRef, addConsoleLine]);

  const exportConsole = useCallback(() => {
    const text = consoleLines.map(l => l.text).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'console-output.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [consoleLines]);

  return (
    <div className={`bg-ide-console border-t border-border flex flex-col ${collapsed ? 'h-9' : 'h-52'} transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-9 min-h-[36px] border-b border-border bg-ide-toolbar">
        <div className="flex items-center gap-2">
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground transition-colors">
            {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Console</span>
          {consoleLines.length > 0 && (
            <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-sm">{consoleLines.length}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={exportConsole} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Exporter">
            <Download size={13} />
          </button>
          <button onClick={clearConsole} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Effacer">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-auto ide-scrollbar p-2 font-code text-sm">
          {consoleLines.length === 0 ? (
            <p className="text-muted-foreground text-xs italic">En attente d'exécution...</p>
          ) : (
            consoleLines.map((line, i) => (
              <div key={i} className={`animate-slide-up leading-relaxed ${
                line.type === 'error' ? 'text-destructive' :
                line.type === 'input' ? 'text-syntax-function' :
                line.type === 'system' ? 'text-muted-foreground italic' :
                'text-foreground'
              }`}>
                {line.text}
              </div>
            ))
          )}

          {/* Input */}
          {waitingForInput && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-primary animate-blink">▶</span>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmitInput(); }}
                className="flex-1 bg-transparent border-none outline-none text-foreground font-code text-sm"
                placeholder="Entrez une valeur..."
                autoFocus
              />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
