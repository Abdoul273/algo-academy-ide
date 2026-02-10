import { useRef, useCallback } from 'react';
import Editor, { type OnMount, type Monaco } from '@monaco-editor/react';
import { useIDE } from '@/contexts/IDEContext';
import { registerAlgoLanguage, createAlgoTheme } from '@/lib/algo-language';
import { ideThemes } from '@/lib/themes';

export default function EditorPanel() {
  const { files, activeFileId, updateFileContent, settings } = useIDE();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    registerAlgoLanguage(monaco);
    
    // Register all themes
    ideThemes.forEach(t => {
      createAlgoTheme(monaco, t.id, t.monacoColors);
    });
    
    monaco.editor.setTheme(settings.theme.id);
    editor.focus();
  };

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined && activeFile) {
      updateFileContent(activeFile.id, value);
    }
  }, [activeFile, updateFileContent]);

  // Update theme when settings change
  if (monacoRef.current) {
    monacoRef.current.editor.setTheme(settings.theme.id);
  }

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-ide-editor">
        <p className="text-muted-foreground font-code text-sm">Aucun fichier ouvert</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-ide-editor">
      <Editor
        language="algo"
        value={activeFile.content}
        onChange={handleChange}
        onMount={handleMount}
        theme={settings.theme.id}
        options={{
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          lineHeight: settings.fontSize * settings.lineHeight,
          minimap: { enabled: settings.minimap },
          wordWrap: settings.wordWrap ? 'on' : 'off',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 16 },
          folding: true,
          bracketPairColorization: { enabled: true },
          suggest: { showKeywords: true, showSnippets: true },
          tabSize: 4,
          insertSpaces: true,
        }}
      />
    </div>
  );
}
