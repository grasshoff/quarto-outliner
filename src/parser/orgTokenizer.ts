export enum TokenType {
  Headline,
  TodoKeyword,
  Priority,
  Tag,
  Timestamp,
  ActiveTimestamp,
  InactiveTimestamp,
  ScheduledKeyword,
  DeadlineKeyword,
  ClosedKeyword,
  Property,
  Drawer,
  List,
  Checkbox,
  Link,
  Bold,
  Italic,
  Underline,
  Code,
  Verbatim,
  Strikethrough,
  CodeBlock,
  Results,
  Table,
  Keyword,
  Comment,
  Text,
  Newline,
  EOF
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  level?: number;
  metadata?: Record<string, any>;
}

export class OrgTokenizer {
  private text: string;
  private position: number;
  private line: number;
  private column: number;
  private tokens: Token[];

  constructor(text: string) {
    this.text = text;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  tokenize(): Token[] {
    const lines = this.text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      this.line = i + 1;
      this.column = 1;
      
      this.tokenizeLine(line);
      
      if (i < lines.length - 1) {
        this.tokens.push({
          type: TokenType.Newline,
          value: '\n',
          line: this.line,
          column: this.column
        });
      }
    }
    
    this.tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column
    });
    
    return this.tokens;
  }

  private tokenizeLine(line: string): void {
    if (line.length === 0) {
      return;
    }

    // Headline
    const headlineMatch = line.match(/^(\*+)\s+(TODO|DONE|NEXT|WAITING|HOLD|CANCELLED|CANCELED)?\s*(\[#[A-Z]\])?\s*(.+?)(\s+:[^\s:]+(?::[^\s:]+)*:)?\s*$/);
    if (headlineMatch) {
      const stars = headlineMatch[1];
      const todo = headlineMatch[2];
      const priority = headlineMatch[3];
      const title = headlineMatch[4];
      const tags = headlineMatch[5];

      this.tokens.push({
        type: TokenType.Headline,
        value: title,
        line: this.line,
        column: 1,
        level: stars.length,
        metadata: { todo, priority, tags }
      });
      return;
    }

    // Keyword
    const keywordMatch = line.match(/^#\+([A-Z_]+):\s*(.*)$/);
    if (keywordMatch) {
      this.tokens.push({
        type: TokenType.Keyword,
        value: keywordMatch[1],
        line: this.line,
        column: 1,
        metadata: { content: keywordMatch[2] }
      });
      return;
    }

    // Code block boundaries
    if (line.match(/^#\+BEGIN_SRC/i)) {
      const langMatch = line.match(/^#\+BEGIN_SRC\s+(\w+)/i);
      this.tokens.push({
        type: TokenType.CodeBlock,
        value: 'BEGIN_SRC',
        line: this.line,
        column: 1,
        metadata: { language: langMatch ? langMatch[1] : '' }
      });
      return;
    }

    if (line.match(/^#\+END_SRC/i)) {
      this.tokens.push({
        type: TokenType.CodeBlock,
        value: 'END_SRC',
        line: this.line,
        column: 1
      });
      return;
    }

    // Results
    if (line.match(/^#\+RESULTS:/i)) {
      this.tokens.push({
        type: TokenType.Results,
        value: 'RESULTS',
        line: this.line,
        column: 1
      });
      return;
    }

    // Drawer boundaries
    const drawerStartMatch = line.match(/^\s*:([A-Z]+):\s*$/);
    if (drawerStartMatch) {
      this.tokens.push({
        type: TokenType.Drawer,
        value: drawerStartMatch[1],
        line: this.line,
        column: 1,
        metadata: { state: 'start' }
      });
      return;
    }

    if (line.match(/^\s*:END:\s*$/)) {
      this.tokens.push({
        type: TokenType.Drawer,
        value: 'END',
        line: this.line,
        column: 1,
        metadata: { state: 'end' }
      });
      return;
    }

    // Property
    const propertyMatch = line.match(/^\s*:([^:]+):\s*(.*)$/);
    if (propertyMatch && line.trim().startsWith(':')) {
      this.tokens.push({
        type: TokenType.Property,
        value: propertyMatch[1],
        line: this.line,
        column: 1,
        metadata: { propertyValue: propertyMatch[2] }
      });
      return;
    }

    // List item
    const listMatch = line.match(/^(\s*)([-+]|\d+[.)])\s+(\[ \]|\[X\]|\[-\])?\s*(.*)$/);
    if (listMatch) {
      this.tokens.push({
        type: TokenType.List,
        value: listMatch[4],
        line: this.line,
        column: 1,
        metadata: {
          indent: listMatch[1].length,
          marker: listMatch[2],
          checkbox: listMatch[3]
        }
      });
      return;
    }

    // Table row
    if (line.match(/^\s*\|.*\|\s*$/)) {
      this.tokens.push({
        type: TokenType.Table,
        value: line.trim(),
        line: this.line,
        column: 1
      });
      return;
    }

    // Comment
    if (line.match(/^#[^+]/)) {
      this.tokens.push({
        type: TokenType.Comment,
        value: line.substring(1).trim(),
        line: this.line,
        column: 1
      });
      return;
    }

    // Regular text with inline markup
    this.tokens.push({
      type: TokenType.Text,
      value: line,
      line: this.line,
      column: 1
    });
  }

  getTokens(): Token[] {
    return this.tokens;
  }
}

