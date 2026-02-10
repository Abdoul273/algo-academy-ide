// ===== TOKENIZER =====
export type TokenType =
  | 'KEYWORD' | 'IDENT' | 'NUMBER' | 'STRING' | 'BOOL'
  | 'OP' | 'ASSIGN' | 'LPAREN' | 'RPAREN' | 'LBRACKET' | 'RBRACKET'
  | 'COMMA' | 'COLON' | 'NEWLINE' | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
}

const KEYWORDS = new Set([
  'algorithme', 'variables', 'variable', 'début', 'debut', 'fin',
  'si', 'alors', 'sinon', 'finsi',
  'tantque', 'faire', 'fintantque',
  'pour', 'de', 'à', 'a', 'finpour', 'pas',
  'écrire', 'ecrire', 'afficher', 'lire', 'saisir',
  'fonction', 'procédure', 'procedure', 'retourner',
  'entier', 'réel', 'reel', 'chaîne', 'chaine', 'chaine de caractères',
  'booléen', 'booleen', 'caractère', 'caractere',
  'tableau', 'et', 'ou', 'non', 'vrai', 'faux', 'mod', 'div',
  'repeter', 'répéter', 'jusqua', 'jusqu',
]);

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0, line = 1;

  while (i < code.length) {
    if (code[i] === ' ' || code[i] === '\t' || code[i] === '\r') { i++; continue; }
    if (code[i] === '\n') { tokens.push({ type: 'NEWLINE', value: '\n', line }); i++; line++; continue; }
    if (code[i] === '/' && code[i + 1] === '/') { while (i < code.length && code[i] !== '\n') i++; continue; }

    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]; let s = ''; i++;
      while (i < code.length && code[i] !== q) { if (code[i] === '\\') i++; s += code[i]; i++; }
      if (i < code.length) i++;
      tokens.push({ type: 'STRING', value: s, line }); continue;
    }

    if (/[0-9]/.test(code[i])) {
      let n = '';
      while (i < code.length && /[0-9.]/.test(code[i])) { n += code[i]; i++; }
      tokens.push({ type: 'NUMBER', value: n, line }); continue;
    }

    if (code[i] === '←') { tokens.push({ type: 'ASSIGN', value: '←', line }); i++; continue; }
    if (code[i] === ':' && code[i + 1] === '=') { tokens.push({ type: 'ASSIGN', value: ':=', line }); i += 2; continue; }
    if (code[i] === '<' && code[i + 1] === '>') { tokens.push({ type: 'OP', value: '<>', line }); i += 2; continue; }
    if (code[i] === '<' && code[i + 1] === '=') { tokens.push({ type: 'OP', value: '<=', line }); i += 2; continue; }
    if (code[i] === '>' && code[i + 1] === '=') { tokens.push({ type: 'OP', value: '>=', line }); i += 2; continue; }
    if ('+-*/<>='.includes(code[i])) { tokens.push({ type: 'OP', value: code[i], line }); i++; continue; }
    if (code[i] === '(') { tokens.push({ type: 'LPAREN', value: '(', line }); i++; continue; }
    if (code[i] === ')') { tokens.push({ type: 'RPAREN', value: ')', line }); i++; continue; }
    if (code[i] === '[') { tokens.push({ type: 'LBRACKET', value: '[', line }); i++; continue; }
    if (code[i] === ']') { tokens.push({ type: 'RBRACKET', value: ']', line }); i++; continue; }
    if (code[i] === ',') { tokens.push({ type: 'COMMA', value: ',', line }); i++; continue; }
    if (code[i] === ':') { tokens.push({ type: 'COLON', value: ':', line }); i++; continue; }

    if (/[a-zA-ZÀ-ÿ_]/.test(code[i])) {
      let w = '';
      while (i < code.length && /[a-zA-ZÀ-ÿ0-9_]/.test(code[i])) { w += code[i]; i++; }
      const lower = w.toLowerCase();
      if (lower === 'vrai' || lower === 'faux') tokens.push({ type: 'BOOL', value: lower, line });
      else if (KEYWORDS.has(lower)) tokens.push({ type: 'KEYWORD', value: lower, line });
      else tokens.push({ type: 'IDENT', value: w, line });
      continue;
    }
    i++;
  }
  tokens.push({ type: 'EOF', value: '', line });
  return tokens;
}

// ===== INTERPRETER =====
export interface InterpreterCallbacks {
  onOutput: (text: string) => void;
  onInput: (prompt: string) => Promise<string>;
  onError: (msg: string, line: number) => void;
  onVariableChange?: (vars: Map<string, any>) => void;
  onLineExecuted?: (line: number) => void;
}

// Helper: normalize keyword (remove accents for matching)
function isWriteCmd(kw: string): boolean {
  return ['écrire', 'ecrire', 'afficher'].includes(kw);
}

function isReadCmd(kw: string): boolean {
  return ['lire', 'saisir'].includes(kw);
}

function isBeginKW(kw: string): boolean {
  return kw === 'début' || kw === 'debut';
}

export class AlgoInterpreter {
  private tokens: Token[];
  private pos = 0;
  private variables = new Map<string, { type: string; value: any }>();
  private cancelled = false;
  private cb: InterpreterCallbacks;

  constructor(code: string, callbacks: InterpreterCallbacks) {
    this.tokens = tokenize(code);
    this.cb = callbacks;
  }

  cancel() { this.cancelled = true; }

  private cur(): Token { return this.tokens[this.pos] || { type: 'EOF', value: '', line: 0 }; }
  private peek(offset = 0): Token { return this.tokens[this.pos + offset] || { type: 'EOF', value: '', line: 0 }; }
  private advance(): Token { return this.tokens[this.pos++]; }

  private skipNL() { while (this.cur().type === 'NEWLINE') this.advance(); }

  private expectKW(val: string) {
    this.skipNL();
    const t = this.cur();
    if (t.type !== 'KEYWORD' || t.value !== val)
      throw new Error(`Ligne ${t.line}: Attendu '${val}', trouve '${t.value || t.type}'`);
    this.advance();
  }

  private isKW(val: string): boolean {
    this.skipNL();
    return this.cur().type === 'KEYWORD' && this.cur().value === val;
  }

  private isKWAny(vals: string[]): boolean {
    this.skipNL();
    return this.cur().type === 'KEYWORD' && vals.includes(this.cur().value);
  }

  private checkCancel() {
    if (this.cancelled) throw new Error('__CANCELLED__');
  }

  async run(): Promise<void> {
    try {
      this.skipNL();
      // Parse header: Algorithme Nom
      if (this.isKW('algorithme')) {
        this.advance();
        if (this.cur().type === 'IDENT') this.advance();
        this.skipNL();
      }

      // Parse variables
      if (this.isKW('variables') || this.isKW('variable')) {
        this.advance();
        this.skipNL();
        while (!this.isKWAny(['début', 'debut']) && this.cur().type !== 'EOF') {
          this.parseVarDecl();
          this.skipNL();
        }
      }

      // Parse body
      if (this.isKWAny(['début', 'debut'])) {
        this.advance();
        await this.parseBody(['fin']);
        this.expectKW('fin');
      }
      this.cb.onVariableChange?.(this.getVarValues());
    } catch (e: any) {
      if (e.message === '__CANCELLED__') return;
      this.cb.onError(e.message, this.cur().line);
    }
  }

  private parseVarDecl() {
    const names: string[] = [];
    while (this.cur().type === 'IDENT') {
      names.push(this.cur().value);
      this.advance();
      if (this.cur().type === 'COMMA') this.advance();
    }
    if (names.length === 0) return;
    if (this.cur().type === 'COLON') this.advance();
    let typeName = 'entier';
    if (this.cur().type === 'KEYWORD') {
      typeName = this.cur().value;
      this.advance();
    } else if (this.cur().type === 'IDENT') {
      typeName = this.cur().value;
      this.advance();
    }
    for (const name of names) {
      const defaultVal = this.defaultForType(typeName);
      this.variables.set(name, { type: typeName, value: defaultVal });
    }
  }

  private defaultForType(t: string): any {
    const tl = t.toLowerCase();
    if (tl === 'entier' || tl === 'réel' || tl === 'reel') return 0;
    if (tl === 'chaîne' || tl === 'chaine' || tl === 'caractère' || tl === 'caractere') return '';
    if (tl === 'booléen' || tl === 'booleen') return false;
    return 0;
  }

  private getVarValues(): Map<string, any> {
    const m = new Map<string, any>();
    this.variables.forEach((v, k) => m.set(k, v.value));
    return m;
  }

  private async parseBody(endKeywords: string[]): Promise<void> {
    this.skipNL();
    while (this.cur().type !== 'EOF') {
      this.checkCancel();
      this.skipNL();
      if (this.cur().type === 'EOF') break;
      if (this.cur().type === 'KEYWORD' && endKeywords.includes(this.cur().value)) break;
      await this.parseStatement();
      this.skipNL();
    }
  }

  private async parseStatement(): Promise<void> {
    this.skipNL();
    const t = this.cur();
    this.cb.onLineExecuted?.(t.line);

    if (t.type === 'KEYWORD') {
      const kw = t.value;
      if (isWriteCmd(kw)) return this.parseWrite();
      if (isReadCmd(kw)) return this.parseLire();
      if (kw === 'si') return this.parseIf();
      if (kw === 'tantque') return this.parseWhile();
      if (kw === 'pour') return this.parseFor();
      if (kw === 'retourner') { this.advance(); return; }
    }

    if (t.type === 'IDENT') return this.parseAssignment();

    // Skip unknown token
    this.advance();
  }

  private async parseWrite(): Promise<void> {
    this.advance(); // skip ecrire/afficher
    if (this.cur().type === 'LPAREN') this.advance();
    const parts: string[] = [];
    while (this.cur().type !== 'RPAREN' && this.cur().type !== 'NEWLINE' && this.cur().type !== 'EOF') {
      const val = this.parseExpression();
      parts.push(String(val));
      if (this.cur().type === 'COMMA') this.advance();
    }
    if (this.cur().type === 'RPAREN') this.advance();
    this.cb.onOutput(parts.join(' '));
    this.cb.onVariableChange?.(this.getVarValues());
  }

  private async parseLire(): Promise<void> {
    this.advance(); // skip lire/saisir
    if (this.cur().type === 'LPAREN') this.advance();
    const varName = this.cur().value;
    this.advance();
    if (this.cur().type === 'RPAREN') this.advance();

    const input = await this.cb.onInput(varName);
    const v = this.variables.get(varName);
    if (v) {
      const tl = v.type.toLowerCase();
      if (tl === 'entier') v.value = parseInt(input) || 0;
      else if (tl === 'réel' || tl === 'reel') v.value = parseFloat(input) || 0;
      else if (tl === 'booléen' || tl === 'booleen') v.value = input.toLowerCase() === 'vrai';
      else v.value = input;
    } else {
      this.variables.set(varName, { type: 'chaine', value: input });
    }
    this.cb.onVariableChange?.(this.getVarValues());
  }

  private async parseIf(): Promise<void> {
    this.advance(); // skip si
    if (this.cur().type === 'LPAREN') this.advance();
    const condition = this.parseExpression();
    if (this.cur().type === 'RPAREN') this.advance();
    if (this.isKW('alors')) this.advance();

    if (condition) {
      await this.parseBody(['sinon', 'finsi']);
      if (this.isKW('sinon')) {
        this.advance();
        this.skipBody(['finsi']);
      }
    } else {
      this.skipBody(['sinon', 'finsi']);
      if (this.isKW('sinon')) {
        this.advance();
        await this.parseBody(['finsi']);
      }
    }
    this.expectKW('finsi');
  }

  private skipBody(endKeywords: string[]) {
    let depth = 0;
    while (this.cur().type !== 'EOF') {
      const kw = this.cur().value;
      if (this.cur().type === 'KEYWORD') {
        if (kw === 'si' || kw === 'tantque' || kw === 'pour') depth++;
        if (kw === 'finsi' || kw === 'fintantque' || kw === 'finpour') {
          if (depth > 0) { depth--; this.advance(); continue; }
        }
        if (depth === 0 && endKeywords.includes(kw)) return;
      }
      this.advance();
    }
  }

  private async parseWhile(): Promise<void> {
    this.advance(); // skip tantque
    const startPos = this.pos;
    let iterations = 0;
    const MAX_ITERATIONS = 100000;

    while (true) {
      this.checkCancel();
      this.pos = startPos;
      if (this.cur().type === 'LPAREN') this.advance();
      const condition = this.parseExpression();
      if (this.cur().type === 'RPAREN') this.advance();
      if (this.isKW('faire')) this.advance();

      if (!condition) {
        this.skipBody(['fintantque']);
        break;
      }

      await this.parseBody(['fintantque']);
      iterations++;
      if (iterations > MAX_ITERATIONS) throw new Error(`Boucle infinie detectee ligne ${this.cur().line}`);

      if (this.isKW('fintantque')) {
        // don't consume it yet, we need to loop
      }
    }
    this.expectKW('fintantque');
  }

  private async parseFor(): Promise<void> {
    this.advance(); // skip pour
    const varName = this.cur().value;
    this.advance();
    this.expectKW('de');
    const from = this.parseExpression();
    if (this.isKW('à') || this.isKW('a')) this.advance();
    const to = this.parseExpression();
    let step = 1;
    if (this.isKW('pas')) { this.advance(); step = this.parseExpression(); }
    if (this.isKW('faire')) this.advance();

    if (!this.variables.has(varName)) {
      this.variables.set(varName, { type: 'entier', value: from });
    }

    const bodyStart = this.pos;
    const goingUp = from <= to;

    for (let i = from; goingUp ? i <= to : i >= to; i += step) {
      this.checkCancel();
      this.variables.get(varName)!.value = i;
      this.cb.onVariableChange?.(this.getVarValues());
      this.pos = bodyStart;
      await this.parseBody(['finpour']);
    }

    if (!this.isKW('finpour')) {
      this.skipBody(['finpour']);
    }
    this.expectKW('finpour');
  }

  private parseAssignment() {
    const varName = this.cur().value;
    this.advance();
    if (this.cur().type === 'ASSIGN') {
      this.advance();
      const val = this.parseExpression();
      const v = this.variables.get(varName);
      if (v) {
        v.value = val;
      } else {
        this.variables.set(varName, { type: 'chaine', value: val });
      }
      this.cb.onVariableChange?.(this.getVarValues());
    }
  }

  // ===== EXPRESSION PARSER (precedence climbing) =====
  private parseExpression(): any {
    return this.parseOr();
  }

  private parseOr(): any {
    let left = this.parseAnd();
    while (this.cur().type === 'KEYWORD' && this.cur().value === 'ou') {
      this.advance();
      left = left || this.parseAnd();
    }
    return left;
  }

  private parseAnd(): any {
    let left = this.parseNot();
    while (this.cur().type === 'KEYWORD' && this.cur().value === 'et') {
      this.advance();
      left = left && this.parseNot();
    }
    return left;
  }

  private parseNot(): any {
    if (this.cur().type === 'KEYWORD' && this.cur().value === 'non') {
      this.advance();
      return !this.parseNot();
    }
    return this.parseComparison();
  }

  private parseComparison(): any {
    let left = this.parseAddSub();
    while (this.cur().type === 'OP' && ['<', '>', '<=', '>=', '=', '<>'].includes(this.cur().value)) {
      const op = this.advance().value;
      const right = this.parseAddSub();
      switch (op) {
        case '<': left = left < right; break;
        case '>': left = left > right; break;
        case '<=': left = left <= right; break;
        case '>=': left = left >= right; break;
        case '=': left = left === right || left == right; break;
        case '<>': left = left !== right && left != right; break;
      }
    }
    return left;
  }

  private parseAddSub(): any {
    let left = this.parseMulDiv();
    while (this.cur().type === 'OP' && (this.cur().value === '+' || this.cur().value === '-')) {
      const op = this.advance().value;
      const right = this.parseMulDiv();
      if (op === '+') {
        if (typeof left === 'string' || typeof right === 'string') left = String(left) + String(right);
        else left = left + right;
      } else left = left - right;
    }
    return left;
  }

  private parseMulDiv(): any {
    let left = this.parseUnary();
    while (
      (this.cur().type === 'OP' && (this.cur().value === '*' || this.cur().value === '/')) ||
      (this.cur().type === 'KEYWORD' && (this.cur().value === 'mod' || this.cur().value === 'div'))
    ) {
      const op = this.advance().value;
      const right = this.parseUnary();
      if (op === '*') left = left * right;
      else if (op === '/') left = left / right;
      else if (op === 'mod') left = left % right;
      else if (op === 'div') left = Math.floor(left / right);
    }
    return left;
  }

  private parseUnary(): any {
    if (this.cur().type === 'OP' && this.cur().value === '-') {
      this.advance();
      return -this.parsePrimary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): any {
    const t = this.cur();

    if (t.type === 'NUMBER') { this.advance(); return t.value.includes('.') ? parseFloat(t.value) : parseInt(t.value); }
    if (t.type === 'STRING') { this.advance(); return t.value; }
    if (t.type === 'BOOL') { this.advance(); return t.value === 'vrai'; }
    if (t.type === 'LPAREN') {
      this.advance();
      const val = this.parseExpression();
      if (this.cur().type === 'RPAREN') this.advance();
      return val;
    }
    if (t.type === 'IDENT') {
      this.advance();
      const v = this.variables.get(t.value);
      if (v) return v.value;
      return 0;
    }

    this.advance();
    return 0;
  }
}
