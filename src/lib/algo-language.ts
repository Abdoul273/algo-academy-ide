import type { Monaco } from '@monaco-editor/react';

export function registerAlgoLanguage(monaco: Monaco) {
  if (monaco.languages.getLanguages().some(l => l.id === 'algo')) return;

  monaco.languages.register({ id: 'algo' });

  monaco.languages.setMonarchTokensProvider('algo', {
    ignoreCase: true,
    keywords: [
      'algorithme', 'variables', 'variable', 'début', 'debut', 'fin',
      'si', 'alors', 'sinon', 'finsi',
      'tantque', 'faire', 'fintantque',
      'pour', 'de', 'à', 'finpour', 'pas',
      'écrire', 'ecrire', 'lire',
      'fonction', 'procédure', 'procedure', 'retourner',
    ],
    typeKeywords: [
      'entier', 'réel', 'reel', 'chaîne', 'chaine',
      'booléen', 'booleen', 'caractère', 'caractere', 'tableau',
    ],
    operators: ['←', ':=', '+', '-', '*', '/', '<', '>', '<=', '>=', '=', '<>'],
    logicals: ['et', 'ou', 'non', 'vrai', 'faux', 'mod', 'div'],
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],
        [/[0-9]+(\.[0-9]+)?/, 'number'],
        [/[a-zA-ZÀ-ÿ_][a-zA-ZÀ-ÿ0-9_]*/, {
          cases: {
            '@keywords': 'keyword',
            '@typeKeywords': 'type',
            '@logicals': 'keyword.operator',
            '@default': 'identifier',
          },
        }],
        [/←/, 'operator'],
        [/:=/, 'operator'],
        [/[+\-*/<>=]/, 'operator'],
        [/[()[\],;:]/, 'delimiter'],
      ],
    },
  });

  monaco.languages.registerCompletionItemProvider('algo', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        { label: 'Algorithme', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'Algorithme ${1:Nom}\n\nVariables\n    ${2:x} : ${3:entier}\n\nDébut\n    ${0}\nFin', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Structure complète', range },
        { label: 'Si...FinSi', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'Si (${1:condition}) alors\n    ${0}\nFinSi', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Condition', range },
        { label: 'Si...Sinon...FinSi', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'Si (${1:condition}) alors\n    ${2}\nSinon\n    ${0}\nFinSi', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Condition avec sinon', range },
        { label: 'TantQue...FinTantQue', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'TantQue (${1:condition}) faire\n    ${0}\nFinTantQue', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Boucle tant que', range },
        { label: 'Pour...FinPour', kind: monaco.languages.CompletionItemKind.Snippet, insertText: 'Pour ${1:i} de ${2:1} à ${3:10} faire\n    ${0}\nFinPour', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Boucle pour', range },
        { label: 'Écrire', kind: monaco.languages.CompletionItemKind.Function, insertText: 'Écrire(${0})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Afficher', range },
        { label: 'Lire', kind: monaco.languages.CompletionItemKind.Function, insertText: 'Lire(${0})', insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, detail: 'Saisie utilisateur', range },
        ...['entier', 'réel', 'chaîne', 'booléen', 'caractère'].map(t => ({
          label: t, kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: t, detail: 'Type', range,
        })),
        ...['Variables', 'Début', 'Fin', 'Si', 'Alors', 'Sinon', 'FinSi', 'TantQue', 'Faire', 'FinTantQue', 'Pour', 'De', 'FinPour'].map(k => ({
          label: k, kind: monaco.languages.CompletionItemKind.Keyword, insertText: k, detail: 'Mot-clé', range,
        })),
      ];

      return { suggestions };
    },
  });
}

export function createAlgoTheme(monaco: Monaco, name: string, colors: Record<string, string>) {
  monaco.editor.defineTheme(name, {
    base: colors._base === 'light' ? 'vs' : 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: colors.keyword, fontStyle: 'bold' },
      { token: 'keyword.operator', foreground: colors.keyword, fontStyle: 'bold' },
      { token: 'type', foreground: colors.type, fontStyle: 'italic' },
      { token: 'string', foreground: colors.string },
      { token: 'number', foreground: colors.number },
      { token: 'comment', foreground: colors.comment, fontStyle: 'italic' },
      { token: 'identifier', foreground: colors.variable },
      { token: 'operator', foreground: colors.operator },
      { token: 'delimiter', foreground: colors.delimiter || colors.variable },
    ],
    colors: {
      'editor.background': colors.editorBg,
      'editor.foreground': colors.editorFg,
      'editorLineNumber.foreground': colors.lineNumber || '#6c7086',
      'editor.lineHighlightBackground': colors.lineHighlight || '#313244',
      'editor.selectionBackground': colors.selection || '#45475a80',
      'editorCursor.foreground': colors.cursor || colors.keyword,
      'editorWidget.background': colors.widgetBg || colors.editorBg,
    },
  });
}
