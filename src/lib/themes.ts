export interface IDETheme {
  id: string;
  name: string;
  type: 'dark' | 'light';
  cssVars: Record<string, string>;
  monacoColors: Record<string, string>;
}

const darkBase = (bg: string, fg: string, primary: string, secondary: string, muted: string, mutedFg: string, accent: string, border: string, sidebar: string, toolbar: string, editor: string, console: string, tabActive: string, tabInactive: string, syntaxKw: string, syntaxStr: string, syntaxNum: string, syntaxComment: string, syntaxType: string, syntaxFn: string, syntaxVar: string, syntaxOp: string, destructive = '343 81% 75%'): Record<string, string> => ({
  '--background': bg, '--foreground': fg,
  '--primary': primary, '--primary-foreground': '0 0% 10%',
  '--secondary': secondary, '--secondary-foreground': fg,
  '--muted': muted, '--muted-foreground': mutedFg,
  '--accent': accent, '--accent-foreground': '0 0% 10%',
  '--border': border, '--card': secondary, '--card-foreground': fg,
  '--popover': secondary, '--popover-foreground': fg,
  '--destructive': destructive, '--destructive-foreground': '0 0% 10%',
  '--input': border, '--ring': primary,
  '--ide-sidebar': sidebar, '--ide-toolbar': toolbar,
  '--ide-editor': editor, '--ide-console': console,
  '--ide-tab-active': tabActive, '--ide-tab-inactive': tabInactive,
  '--syntax-keyword': syntaxKw, '--syntax-string': syntaxStr,
  '--syntax-number': syntaxNum, '--syntax-comment': syntaxComment,
  '--syntax-type': syntaxType, '--syntax-function': syntaxFn,
  '--syntax-variable': syntaxVar, '--syntax-operator': syntaxOp,
});

export const ideThemes: IDETheme[] = [
  {
    id: 'catppuccin-mocha', name: 'Catppuccin Mocha', type: 'dark',
    cssVars: darkBase('232 23% 18%','226 64% 88%','217 92% 76%','232 23% 23%','233 23% 25%','228 24% 60%','267 84% 81%','232 23% 26%','240 21% 11%','240 21% 13%','232 23% 18%','240 21% 9%','232 23% 18%','232 23% 14%','267 84% 81%','115 54% 76%','23 92% 75%','228 24% 45%','217 92% 76%','170 57% 73%','226 64% 88%','170 57% 73%'),
    monacoColors: { _base:'dark',keyword:'cba6f7',type:'89b4fa',string:'a6e3a1',number:'fab387',comment:'6c7086',variable:'cdd6f4',operator:'89dceb',editorBg:'#1e1e2e',editorFg:'#cdd6f4',lineHighlight:'#313244',selection:'#45475a80',cursor:'#cba6f7',lineNumber:'#6c7086',widgetBg:'#1e1e2e' },
  },
  {
    id: 'dracula', name: 'Dracula', type: 'dark',
    cssVars: darkBase('231 15% 18%','60 30% 96%','265 89% 78%','232 14% 23%','231 15% 26%','225 14% 50%','135 94% 65%','232 14% 28%','231 15% 13%','231 15% 14%','231 15% 18%','231 15% 11%','231 15% 18%','231 15% 14%','265 89% 78%','65 92% 76%','160 100% 75%','225 14% 40%','191 97% 77%','135 94% 65%','60 30% 96%','191 97% 77%','0 100% 67%'),
    monacoColors: { _base:'dark',keyword:'ff79c6',type:'8be9fd',string:'f1fa8c',number:'bd93f9',comment:'6272a4',variable:'f8f8f2',operator:'ff79c6',editorBg:'#282a36',editorFg:'#f8f8f2',lineHighlight:'#44475a',selection:'#44475a80',cursor:'#ff79c6',lineNumber:'#6272a4',widgetBg:'#282a36' },
  },
  {
    id: 'one-dark', name: 'One Dark Pro', type: 'dark',
    cssVars: darkBase('220 13% 18%','219 14% 76%','207 82% 66%','220 13% 22%','220 13% 24%','219 10% 52%','286 60% 67%','220 13% 25%','220 13% 14%','220 13% 14%','220 13% 18%','220 13% 12%','220 13% 18%','220 13% 14%','286 60% 67%','95 38% 62%','29 54% 61%','219 10% 40%','187 47% 55%','207 82% 66%','355 65% 65%','187 47% 55%'),
    monacoColors: { _base:'dark',keyword:'c678dd',type:'56b6c2',string:'98c379',number:'d19a66',comment:'5c6370',variable:'e06c75',operator:'56b6c2',editorBg:'#282c34',editorFg:'#abb2bf',lineHighlight:'#2c313c',selection:'#3e445180',cursor:'#c678dd',lineNumber:'#5c6370',widgetBg:'#282c34' },
  },
  {
    id: 'nord', name: 'Nord', type: 'dark',
    cssVars: darkBase('220 16% 22%','219 28% 88%','213 32% 52%','220 16% 26%','220 16% 28%','219 20% 60%','213 32% 52%','220 16% 28%','220 16% 18%','220 16% 18%','220 16% 22%','220 16% 16%','220 16% 22%','220 16% 18%','213 32% 52%','92 28% 65%','311 20% 63%','220 16% 40%','179 25% 65%','210 34% 63%','219 28% 88%','179 25% 65%','354 42% 56%'),
    monacoColors: { _base:'dark',keyword:'81a1c1',type:'8fbcbb',string:'a3be8c',number:'b48ead',comment:'616e88',variable:'d8dee9',operator:'8fbcbb',editorBg:'#2e3440',editorFg:'#d8dee9',lineHighlight:'#3b4252',selection:'#434c5e80',cursor:'#81a1c1',lineNumber:'#616e88',widgetBg:'#2e3440' },
  },
  {
    id: 'solarized-dark', name: 'Solarized Dark', type: 'dark',
    cssVars: darkBase('192 100% 11%','186 13% 59%','175 59% 40%','192 81% 14%','192 81% 16%','186 8% 45%','175 59% 40%','192 81% 16%','192 100% 8%','192 100% 8%','192 100% 11%','192 100% 7%','192 100% 11%','192 100% 8%','18 80% 44%','175 59% 40%','331 64% 52%','186 8% 40%','68 100% 30%','205 69% 49%','186 13% 59%','18 80% 44%','1 71% 52%'),
    monacoColors: { _base:'dark',keyword:'cb4b16',type:'859900',string:'2aa198',number:'d33682',comment:'586e75',variable:'839496',operator:'cb4b16',editorBg:'#002b36',editorFg:'#839496',lineHighlight:'#073642',selection:'#07364280',cursor:'cb4b16',lineNumber:'#586e75',widgetBg:'#002b36' },
  },
  {
    id: 'tokyo-night', name: 'Tokyo Night', type: 'dark',
    cssVars: darkBase('235 21% 15%','224 20% 80%','224 68% 63%','235 21% 19%','235 21% 22%','224 15% 48%','330 50% 68%','235 21% 24%','235 21% 11%','235 21% 12%','235 21% 15%','235 21% 10%','235 21% 15%','235 21% 12%','267 67% 73%','94 39% 61%','40 67% 70%','224 15% 38%','224 68% 63%','195 64% 67%','224 20% 80%','195 64% 67%','348 68% 60%'),
    monacoColors: { _base:'dark',keyword:'bb9af7',type:'7aa2f7',string:'9ece6a',number:'e0af68',comment:'565f89',variable:'c0caf5',operator:'89ddff',editorBg:'#1a1b26',editorFg:'#c0caf5',lineHighlight:'#292e42',selection:'#33467c80',cursor:'#bb9af7',lineNumber:'#565f89',widgetBg:'#1a1b26' },
  },
  {
    id: 'monokai', name: 'Monokai Pro', type: 'dark',
    cssVars: darkBase('220 10% 16%','50 6% 80%','52 63% 63%','220 10% 20%','220 10% 23%','220 6% 48%','338 95% 56%','220 10% 25%','220 10% 12%','220 10% 13%','220 10% 16%','220 10% 10%','220 10% 16%','220 10% 13%','338 95% 56%','80 76% 53%','36 74% 58%','220 6% 38%','190 81% 67%','80 76% 53%','50 6% 80%','338 95% 56%','1 72% 52%'),
    monacoColors: { _base:'dark',keyword:'ff6188',type:'78dce8',string:'a9dc76',number:'fc9867',comment:'727072',variable:'fcfcfa',operator:'ff6188',editorBg:'#2d2a2e',editorFg:'#fcfcfa',lineHighlight:'#3a3a3c',selection:'#56565880',cursor:'#ff6188',lineNumber:'#727072',widgetBg:'#2d2a2e' },
  },
  {
    id: 'gruvbox', name: 'Gruvbox Dark', type: 'dark',
    cssVars: darkBase('0 0% 16%','43 49% 80%','27 69% 52%','0 0% 20%','0 0% 23%','43 15% 50%','83 42% 53%','0 0% 25%','0 0% 12%','0 0% 13%','0 0% 16%','0 0% 10%','0 0% 16%','0 0% 13%','6 96% 59%','83 42% 53%','43 71% 63%','0 0% 40%','184 36% 54%','27 69% 52%','43 49% 80%','184 36% 54%','0 73% 48%'),
    monacoColors: { _base:'dark',keyword:'fb4934',type:'83a598',string:'b8bb26',number:'fabd2f',comment:'928374',variable:'ebdbb2',operator:'fe8019',editorBg:'#282828',editorFg:'#ebdbb2',lineHighlight:'#3c3836',selection:'#45403680',cursor:'#fe8019',lineNumber:'#928374',widgetBg:'#282828' },
  },
  {
    id: 'github-light', name: 'GitHub Light', type: 'light',
    cssVars: {
      '--background':'210 17% 98%','--foreground':'215 14% 34%',
      '--primary':'212 92% 45%','--primary-foreground':'0 0% 100%',
      '--secondary':'210 14% 93%','--secondary-foreground':'215 14% 34%',
      '--muted':'210 14% 93%','--muted-foreground':'215 10% 55%',
      '--accent':'286 60% 50%','--accent-foreground':'0 0% 100%',
      '--border':'210 14% 89%','--card':'0 0% 100%','--card-foreground':'215 14% 34%',
      '--popover':'0 0% 100%','--popover-foreground':'215 14% 34%',
      '--destructive':'0 72% 51%','--destructive-foreground':'0 0% 100%',
      '--input':'210 14% 89%','--ring':'212 92% 45%',
      '--ide-sidebar':'210 17% 95%','--ide-toolbar':'210 17% 95%',
      '--ide-editor':'210 17% 98%','--ide-console':'210 17% 93%',
      '--ide-tab-active':'210 17% 98%','--ide-tab-inactive':'210 17% 95%',
      '--syntax-keyword':'286 60% 50%','--syntax-string':'131 50% 32%',
      '--syntax-number':'212 92% 45%','--syntax-comment':'215 10% 55%',
      '--syntax-type':'212 92% 45%','--syntax-function':'286 60% 50%',
      '--syntax-variable':'215 14% 34%','--syntax-operator':'0 72% 51%',
    },
    monacoColors: { _base:'light',keyword:'7c3aed',type:'0969da',string:'116329',number:'0969da',comment:'6e7781',variable:'24292f',operator:'cf222e',editorBg:'#f6f8fa',editorFg:'#24292f',lineHighlight:'#eaeef2',selection:'#0969da20',cursor:'#7c3aed',lineNumber:'#6e7781',widgetBg:'#f6f8fa' },
  },
  {
    id: 'solarized-light', name: 'Solarized Light', type: 'light',
    cssVars: {
      '--background':'44 87% 94%','--foreground':'194 14% 40%',
      '--primary':'175 59% 40%','--primary-foreground':'44 87% 94%',
      '--secondary':'46 42% 88%','--secondary-foreground':'194 14% 40%',
      '--muted':'46 42% 88%','--muted-foreground':'194 10% 55%',
      '--accent':'175 59% 40%','--accent-foreground':'44 87% 94%',
      '--border':'46 42% 84%','--card':'44 87% 91%','--card-foreground':'194 14% 40%',
      '--popover':'44 87% 91%','--popover-foreground':'194 14% 40%',
      '--destructive':'1 71% 52%','--destructive-foreground':'44 87% 94%',
      '--input':'46 42% 84%','--ring':'175 59% 40%',
      '--ide-sidebar':'46 42% 88%','--ide-toolbar':'46 42% 88%',
      '--ide-editor':'44 87% 94%','--ide-console':'46 42% 85%',
      '--ide-tab-active':'44 87% 94%','--ide-tab-inactive':'46 42% 88%',
      '--syntax-keyword':'18 80% 44%','--syntax-string':'175 59% 40%',
      '--syntax-number':'331 64% 52%','--syntax-comment':'194 10% 55%',
      '--syntax-type':'68 100% 30%','--syntax-function':'205 69% 49%',
      '--syntax-variable':'194 14% 40%','--syntax-operator':'18 80% 44%',
    },
    monacoColors: { _base:'light',keyword:'cb4b16',type:'859900',string:'2aa198',number:'d33682',comment:'93a1a1',variable:'657b83',operator:'cb4b16',editorBg:'#fdf6e3',editorFg:'#657b83',lineHighlight:'#eee8d5',selection:'#eee8d580',cursor:'cb4b16',lineNumber:'#93a1a1',widgetBg:'#fdf6e3' },
  },
];

export const defaultTheme = ideThemes[0];

export const fontOptions = [
  { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { name: 'Fira Code', value: "'Fira Code', monospace" },
  { name: 'Source Code Pro', value: "'Source Code Pro', monospace" },
  { name: 'Consolas', value: "'Consolas', monospace" },
  { name: 'Courier New', value: "'Courier New', monospace" },
];
