import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { ideThemes, fontOptions, type IDETheme } from '@/lib/themes';

export interface FileTab {
  id: string;
  name: string;
  content: string;
  saved: boolean;
}

export interface ConsoleLine {
  type: 'output' | 'error' | 'input' | 'system';
  text: string;
  timestamp: number;
}

export interface EditorSettings {
  theme: IDETheme;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  minimap: boolean;
  wordWrap: boolean;
  autoSave: boolean;
}

const DEFAULT_CODE = `Algorithme Exemple

Variables
    x : entier
    nom : chaîne
    i : entier

Début
    Écrire("Bienvenue dans AlgoStudio !")
    Écrire("Entrez votre nom :")
    Lire(nom)
    Écrire("Bonjour ", nom, " !")

    x ← 0
    Pour i de 1 à 5 faire
        x ← x + i
        Écrire("Somme partielle : ", x)
    FinPour

    Écrire("Somme totale de 1 à 5 = ", x)

    Si (x > 10) alors
        Écrire("La somme est supérieure à 10")
    Sinon
        Écrire("La somme est inférieure ou égale à 10")
    FinSi
Fin`;

const loadSettings = (): EditorSettings => {
  try {
    const saved = localStorage.getItem('algostudio-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const theme = ideThemes.find(t => t.id === parsed.themeId) || ideThemes[0];
      return { ...parsed, theme };
    }
  } catch {}
  return {
    theme: ideThemes[0],
    fontFamily: fontOptions[0].value,
    fontSize: 15,
    lineHeight: 1.6,
    minimap: true,
    wordWrap: false,
    autoSave: true,
  };
};

interface IDEContextType {
  files: FileTab[];
  activeFileId: string;
  settings: EditorSettings;
  consoleLines: ConsoleLine[];
  isRunning: boolean;
  waitingForInput: boolean;
  variables: Map<string, any>;
  currentLine: number | null;
  sidebarPanel: 'files' | 'settings' | 'courses' | null;

  setActiveFileId: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  createFile: (name?: string) => void;
  closeFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  openLocalFile: () => void;
  saveFile: (id?: string) => void;

  updateSettings: (s: Partial<EditorSettings>) => void;

  addConsoleLine: (line: ConsoleLine) => void;
  clearConsole: () => void;

  setIsRunning: (v: boolean) => void;
  setWaitingForInput: (v: boolean) => void;
  setVariables: (v: Map<string, any>) => void;
  setCurrentLine: (l: number | null) => void;
  inputResolverRef: React.MutableRefObject<((val: string) => void) | null>;

  setSidebarPanel: (p: 'files' | 'settings' | 'courses' | null) => void;
}

const IDEContext = createContext<IDEContextType | null>(null);

export function IDEProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileTab[]>(() => {
    try {
      const saved = localStorage.getItem('algostudio-files');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: '1', name: 'exemple.algo', content: DEFAULT_CODE, saved: true }];
  });
  const [activeFileId, setActiveFileId] = useState(files[0]?.id || '1');
  const [settings, setSettings] = useState<EditorSettings>(loadSettings);
  const [consoleLines, setConsoleLines] = useState<ConsoleLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [variables, setVariables] = useState<Map<string, any>>(new Map());
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [sidebarPanel, setSidebarPanel] = useState<'files' | 'settings' | 'courses' | null>('files');
  const inputResolverRef = useRef<((val: string) => void) | null>(null);

  // Persist files
  useEffect(() => {
    localStorage.setItem('algostudio-files', JSON.stringify(files));
  }, [files]);

  // Persist settings
  useEffect(() => {
    const { theme, ...rest } = settings;
    localStorage.setItem('algostudio-settings', JSON.stringify({ ...rest, themeId: theme.id }));
  }, [settings]);

  // Apply theme CSS vars
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(settings.theme.cssVars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, [settings.theme]);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content, saved: false } : f));
  }, []);

  const createFile = useCallback((name?: string) => {
    const id = Date.now().toString();
    const newFile: FileTab = {
      id,
      name: name || `nouveau_${files.length + 1}.algo`,
      content: `Algorithme Nouveau\n\nVariables\n\nDébut\n    \nFin`,
      saved: false,
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(id);
  }, [files.length]);

  const closeFile = useCallback((id: string) => {
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      if (next.length === 0) {
        const newFile: FileTab = { id: Date.now().toString(), name: 'nouveau.algo', content: `Algorithme Nouveau\n\nVariables\n\nDébut\n    \nFin`, saved: false };
        return [newFile];
      }
      return next;
    });
    setActiveFileId(prev => {
      const remaining = files.filter(f => f.id !== id);
      if (remaining.length === 0) return '';
      if (prev === id) return remaining[0].id;
      return prev;
    });
  }, [files]);

  const renameFile = useCallback((id: string, name: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  }, []);

  const openLocalFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.algo,.txt,.json';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const content = await file.text();
      const id = Date.now().toString();
      setFiles(prev => [...prev, { id, name: file.name, content, saved: true }]);
      setActiveFileId(id);
    };
    input.click();
  }, []);

  const saveFile = useCallback((id?: string) => {
    const fileId = id || activeFileId;
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, saved: true } : f));
  }, [activeFileId, files]);

  const updateSettings = useCallback((s: Partial<EditorSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  const addConsoleLine = useCallback((line: ConsoleLine) => {
    setConsoleLines(prev => [...prev, line]);
  }, []);

  const clearConsole = useCallback(() => setConsoleLines([]), []);

  return (
    <IDEContext.Provider value={{
      files, activeFileId, settings, consoleLines, isRunning, waitingForInput, variables, currentLine, sidebarPanel,
      setActiveFileId, updateFileContent, createFile, closeFile, renameFile, openLocalFile, saveFile,
      updateSettings, addConsoleLine, clearConsole,
      setIsRunning, setWaitingForInput, setVariables, setCurrentLine, inputResolverRef, setSidebarPanel,
    }}>
      {children}
    </IDEContext.Provider>
  );
}

export function useIDE() {
  const ctx = useContext(IDEContext);
  if (!ctx) throw new Error('useIDE must be used within IDEProvider');
  return ctx;
}
