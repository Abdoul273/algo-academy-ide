import { useState, useCallback, useRef, useEffect } from 'react';
import { useIDE } from '@/contexts/IDEContext';
import { AlgoInterpreter } from '@/lib/interpreter';
import EditorPanel from './EditorPanel';
import ConsolePanel from './ConsolePanel';
import SettingsDialog from './SettingsDialog';
import {
  Play, Square, FilePlus, FolderOpen, Save,
  Settings, BookOpen, FileCode, X, Code2,
  ChevronRight, Copy, RotateCcw, Maximize2, Minimize2,
  Timer, Hash, Braces
} from 'lucide-react';

export default function IDELayout() {
  const ide = useIDE();
  const interpreterRef = useRef<AlgoInterpreter | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreenEditor, setFullscreenEditor] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const activeFile = ide.files.find(f => f.id === ide.activeFileId);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); ide.saveFile(); }
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); ide.createFile(); }
      if (e.ctrlKey && e.key === 'o') { e.preventDefault(); ide.openLocalFile(); }
      if (e.ctrlKey && e.key === 'l') { e.preventDefault(); ide.clearConsole(); }
      if (e.key === 'F5' && !e.shiftKey) { e.preventDefault(); handleRun(); }
      if (e.key === 'F5' && e.shiftKey) { e.preventDefault(); handleStop(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ide, activeFile]);

  // Run algorithm
  const handleRun = useCallback(async () => {
    if (!activeFile || ide.isRunning) return;
    ide.clearConsole();
    ide.setIsRunning(true);
    ide.setVariables(new Map());
    setExecutionTime(null);
    const startTime = performance.now();
    ide.addConsoleLine({ type: 'system', text: `▶ Execution de ${activeFile.name}...`, timestamp: Date.now() });

    const interpreter = new AlgoInterpreter(activeFile.content, {
      onOutput: (text) => ide.addConsoleLine({ type: 'output', text, timestamp: Date.now() }),
      onInput: (prompt) => {
        return new Promise<string>((resolve) => {
          ide.addConsoleLine({ type: 'system', text: `⌨ Saisie attendue pour "${prompt}" :`, timestamp: Date.now() });
          ide.setWaitingForInput(true);
          ide.inputResolverRef.current = (val: string) => {
            ide.setWaitingForInput(false);
            resolve(val);
          };
        });
      },
      onError: (msg, line) => ide.addConsoleLine({ type: 'error', text: `❌ Erreur ligne ${line}: ${msg}`, timestamp: Date.now() }),
      onVariableChange: (vars) => ide.setVariables(vars),
      onLineExecuted: (line) => ide.setCurrentLine(line),
    });

    interpreterRef.current = interpreter;
    await interpreter.run();
    const elapsed = performance.now() - startTime;
    setExecutionTime(elapsed);
    ide.setIsRunning(false);
    ide.setCurrentLine(null);
    ide.addConsoleLine({ type: 'system', text: `✓ Execution terminee en ${elapsed.toFixed(1)}ms.`, timestamp: Date.now() });
  }, [activeFile, ide]);

  const handleStop = useCallback(() => {
    interpreterRef.current?.cancel();
    ide.setIsRunning(false);
    ide.setWaitingForInput(false);
    ide.setCurrentLine(null);
    ide.addConsoleLine({ type: 'system', text: '⏹ Execution arretee.', timestamp: Date.now() });
  }, [ide]);

  const handleDuplicate = useCallback(() => {
    if (!activeFile) return;
    const id = Date.now().toString();
    ide.createFile(`copie_${activeFile.name}`);
  }, [activeFile, ide]);

  const lineCount = activeFile?.content.split('\n').length || 0;
  const charCount = activeFile?.content.length || 0;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="h-11 min-h-[44px] bg-ide-toolbar border-b border-border flex items-center px-3 gap-1">
        <div className="flex items-center gap-2 mr-4">
          <Code2 size={20} className="text-primary" />
          <span className="font-semibold text-sm text-foreground tracking-tight">AlgoStudio</span>
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        {/* File actions */}
        <ToolbarBtn icon={<FilePlus size={15} />} label="Nouveau (Ctrl+N)" onClick={() => ide.createFile()} shortcut="Ctrl+N" />
        <ToolbarBtn icon={<FolderOpen size={15} />} label="Ouvrir (Ctrl+O)" onClick={ide.openLocalFile} shortcut="Ctrl+O" />
        <ToolbarBtn icon={<Save size={15} />} label="Sauvegarder (Ctrl+S)" onClick={() => ide.saveFile()} shortcut="Ctrl+S" />
        <ToolbarBtn icon={<Copy size={15} />} label="Dupliquer" onClick={handleDuplicate} />

        <div className="h-5 w-px bg-border mx-1" />

        {/* Run/Stop */}
        <button
          onClick={handleRun}
          disabled={ide.isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 disabled:opacity-40 transition-colors"
        >
          <Play size={13} fill="currentColor" /> Executer
        </button>
        <button
          onClick={handleStop}
          disabled={!ide.isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-destructive/15 text-destructive hover:bg-destructive/25 disabled:opacity-40 transition-colors"
        >
          <Square size={13} fill="currentColor" /> Arreter
        </button>

        <div className="h-5 w-px bg-border mx-1" />

        <ToolbarBtn
          icon={fullscreenEditor ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          label={fullscreenEditor ? 'Quitter plein ecran' : 'Plein ecran'}
          onClick={() => setFullscreenEditor(!fullscreenEditor)}
        />

        <div className="flex-1" />

        {/* Status indicators */}
        <div className="hidden md:flex items-center gap-3 mr-2 text-xs text-muted-foreground">
          {executionTime !== null && (
            <span className="flex items-center gap-1">
              <Timer size={12} /> {executionTime.toFixed(1)}ms
            </span>
          )}
          {ide.isRunning && (
            <span className="flex items-center gap-1 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> En cours...
            </span>
          )}
        </div>

        {/* Variables display */}
        {ide.variables.size > 0 && (
          <div className="hidden lg:flex items-center gap-2 mr-2">
            {Array.from(ide.variables.entries()).slice(0, 4).map(([k, v]) => (
              <span key={k} className="text-xs font-code bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                {k}=<span className="text-foreground">{JSON.stringify(v)}</span>
              </span>
            ))}
            {ide.variables.size > 4 && (
              <span className="text-xs text-muted-foreground">+{ide.variables.size - 4}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity bar */}
        <div className="w-12 min-w-[48px] bg-ide-sidebar border-r border-border flex flex-col items-center py-2 gap-1">
          <SidebarIcon
            icon={<FileCode size={20} />}
            active={ide.sidebarPanel === 'files'}
            onClick={() => ide.setSidebarPanel(ide.sidebarPanel === 'files' ? null : 'files')}
            tooltip="Fichiers"
          />
          <SidebarIcon
            icon={<BookOpen size={20} />}
            active={ide.sidebarPanel === 'courses'}
            onClick={() => ide.setSidebarPanel(ide.sidebarPanel === 'courses' ? null : 'courses')}
            tooltip="Cours"
          />
          <SidebarIcon
            icon={<Braces size={20} />}
            active={ide.sidebarPanel === 'variables'}
            onClick={() => ide.setSidebarPanel(ide.sidebarPanel === 'variables' ? null : 'variables')}
            tooltip="Variables"
          />
          <div className="flex-1" />
          <SidebarIcon
            icon={<Settings size={20} />}
            active={settingsOpen}
            onClick={() => setSettingsOpen(true)}
            tooltip="Parametres"
          />
        </div>

        {/* Sidebar panel */}
        {ide.sidebarPanel && (
          <div className="w-56 bg-ide-sidebar border-r border-border flex flex-col overflow-hidden">
            {ide.sidebarPanel === 'files' && <FileExplorer />}
            {ide.sidebarPanel === 'courses' && <CoursesPanel />}
            {ide.sidebarPanel === 'variables' && <VariablesPanel />}
          </div>
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="h-9 min-h-[36px] bg-ide-tab-inactive flex items-end overflow-x-auto ide-scrollbar">
            {ide.files.map(f => (
              <button
                key={f.id}
                onClick={() => ide.setActiveFileId(f.id)}
                className={`group flex items-center gap-1.5 px-3 h-full text-xs border-r border-border transition-colors ${
                  f.id === ide.activeFileId
                    ? 'bg-ide-tab-active text-foreground border-t-2 border-t-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileCode size={13} className="text-primary/60 shrink-0" />
                <span className="truncate max-w-[100px]">{f.name}</span>
                {!f.saved && <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />}
                <button
                  onClick={e => { e.stopPropagation(); ide.closeFile(f.id); }}
                  className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity shrink-0"
                >
                  <X size={12} />
                </button>
              </button>
            ))}
          </div>

          {/* Editor */}
          <EditorPanel />

          {/* Console (hidden in fullscreen) */}
          {!fullscreenEditor && <ConsolePanel />}
        </div>
      </div>

      {/* Status bar */}
      <div className="h-6 min-h-[24px] bg-ide-toolbar border-t border-border flex items-center px-3 text-[10px] text-muted-foreground gap-4">
        <span className="flex items-center gap-1">
          <Hash size={10} /> Lignes: {lineCount}
        </span>
        <span>Caracteres: {charCount}</span>
        {activeFile && <span>{activeFile.name}</span>}
        <div className="flex-1" />
        <span>{ide.settings.theme.name}</span>
        <span>UTF-8</span>
        <span>Algo</span>
      </div>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

// Sub-components
function ToolbarBtn({ icon, label, onClick, shortcut }: { icon: React.ReactNode; label: string; onClick: () => void; shortcut?: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      title={label}
    >
      {icon}
      <span className="hidden xl:inline">{label.split(' (')[0]}</span>
    </button>
  );
}

function SidebarIcon({ icon, active, onClick, tooltip }: { icon: React.ReactNode; active: boolean; onClick: () => void; tooltip: string }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
        active ? 'text-foreground bg-secondary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
    </button>
  );
}

function FileExplorer() {
  const { files, activeFileId, setActiveFileId, createFile } = useIDE();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Explorateur</span>
        <button onClick={() => createFile()} className="text-muted-foreground hover:text-foreground transition-colors">
          <FilePlus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-auto ide-scrollbar">
        {files.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFileId(f.id)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
              f.id === activeFileId
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <FileCode size={14} className="text-primary/60 shrink-0" />
            <span className="truncate">{f.name}</span>
            {!f.saved && <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 ml-auto" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function VariablesPanel() {
  const { variables } = useIDE();
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Variables</span>
      </div>
      <div className="flex-1 overflow-auto ide-scrollbar">
        {variables.size === 0 ? (
          <p className="px-3 text-xs text-muted-foreground italic">Executez un algorithme pour voir les variables.</p>
        ) : (
          Array.from(variables.entries()).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-3 py-1.5 text-xs hover:bg-secondary/50">
              <span className="text-foreground font-code">{k}</span>
              <span className="text-primary font-code truncate max-w-[80px]">{JSON.stringify(v)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CoursesPanel() {
  const courses = [
    { title: '1. Variables et Types', desc: 'Entier, reel, chaine, booleen' },
    { title: '2. Structures conditionnelles', desc: 'Si, Sinon, FinSi' },
    { title: '3. Boucles', desc: 'Pour, TantQue' },
    { title: '4. Tableaux', desc: 'Declaration et parcours' },
    { title: '5. Fonctions', desc: 'Parametres et retour' },
    { title: '6. Algorithmes de tri', desc: 'Selection, insertion, bulle' },
    { title: '7. Recherche', desc: 'Sequentielle et dichotomique' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cours</span>
      </div>
      <div className="flex-1 overflow-auto ide-scrollbar">
        {courses.map((c, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <BookOpen size={14} className="text-accent shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-foreground truncate">{c.title}</div>
              <div className="text-[10px] text-muted-foreground truncate">{c.desc}</div>
            </div>
            <ChevronRight size={12} className="ml-auto shrink-0 opacity-40" />
          </button>
        ))}
      </div>
    </div>
  );
}
