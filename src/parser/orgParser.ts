import { OrgTokenizer, Token, TokenType } from './orgTokenizer';

export enum NodeType {
  Document,
  Headline,
  Section,
  Paragraph,
  List,
  ListItem,
  Table,
  TableRow,
  CodeBlock,
  Property,
  Drawer,
  Timestamp,
  Link,
  Text
}

export interface OrgNode {
  type: NodeType;
  value?: string;
  level?: number;
  children?: OrgNode[];
  properties?: Record<string, any>;
  line?: number;
  column?: number;
}

export interface HeadlineNode extends OrgNode {
  type: NodeType.Headline;
  level: number;
  title: string;
  todo?: string;
  priority?: string;
  tags?: string[];
  scheduled?: string;
  deadline?: string;
  closed?: string;
}

export interface CodeBlockNode extends OrgNode {
  type: NodeType.CodeBlock;
  language?: string;
  content: string;
  results?: string;
}

export class OrgParser {
  private tokens: Token[];
  private position: number;

  constructor(text: string) {
    const tokenizer = new OrgTokenizer(text);
    this.tokens = tokenizer.tokenize();
    this.position = 0;
  }

  parse(): OrgNode {
    const document: OrgNode = {
      type: NodeType.Document,
      children: []
    };

    while (!this.isAtEnd()) {
      const node = this.parseTopLevel();
      if (node) {
        document.children!.push(node);
      }
    }

    return document;
  }

  private parseTopLevel(): OrgNode | null {
    const token = this.peek();

    if (!token || token.type === TokenType.EOF) {
      return null;
    }

    switch (token.type) {
      case TokenType.Headline:
        return this.parseHeadline();
      case TokenType.CodeBlock:
        return this.parseCodeBlock();
      case TokenType.Table:
        return this.parseTable();
      case TokenType.List:
        return this.parseList();
      case TokenType.Drawer:
        return this.parseDrawer();
      case TokenType.Text:
        return this.parseText();
      case TokenType.Newline:
        this.advance();
        return null;
      default:
        this.advance();
        return null;
    }
  }

  private parseHeadline(): HeadlineNode {
    const token = this.advance();
    const headline: HeadlineNode = {
      type: NodeType.Headline,
      level: token.level!,
      title: token.value,
      line: token.line,
      column: token.column,
      children: [],
      properties: {}
    };

    if (token.metadata) {
      if (token.metadata.todo) {
        headline.todo = token.metadata.todo;
      }
      if (token.metadata.priority) {
        headline.priority = token.metadata.priority;
      }
      if (token.metadata.tags) {
        headline.tags = token.metadata.tags
          .replace(/^:/, '')
          .replace(/:$/, '')
          .split(':');
      }
    }

    // Skip newline
    if (this.peek()?.type === TokenType.Newline) {
      this.advance();
    }

    // Parse headline content (properties, drawers, text)
    while (!this.isAtEnd()) {
      const nextToken = this.peek();
      
      if (nextToken.type === TokenType.Headline) {
        if (nextToken.level! <= headline.level) {
          break;
        }
        headline.children!.push(this.parseHeadline());
      } else if (nextToken.type === TokenType.Drawer) {
        const drawer = this.parseDrawer();
        if (drawer) {
          headline.children!.push(drawer);
          
          // Extract scheduling info from drawer
          if (drawer.properties?.scheduled) {
            headline.scheduled = drawer.properties.scheduled;
          }
          if (drawer.properties?.deadline) {
            headline.deadline = drawer.properties.deadline;
          }
          if (drawer.properties?.closed) {
            headline.closed = drawer.properties.closed;
          }
        }
      } else if (nextToken.type === TokenType.CodeBlock) {
        headline.children!.push(this.parseCodeBlock());
      } else if (nextToken.type === TokenType.Table) {
        headline.children!.push(this.parseTable());
      } else if (nextToken.type === TokenType.List) {
        headline.children!.push(this.parseList());
      } else if (nextToken.type === TokenType.Text) {
        headline.children!.push(this.parseText());
      } else if (nextToken.type === TokenType.Newline) {
        this.advance();
      } else {
        break;
      }
    }

    return headline;
  }

  private parseCodeBlock(): CodeBlockNode {
    const startToken = this.advance();
    const language = startToken.metadata?.language || '';
    
    let content = '';
    
    // Skip newline
    if (this.peek()?.type === TokenType.Newline) {
      this.advance();
    }

    // Collect content until END_SRC
    while (!this.isAtEnd()) {
      const token = this.peek();
      
      if (token.type === TokenType.CodeBlock && token.value === 'END_SRC') {
        this.advance();
        break;
      }
      
      if (token.type === TokenType.Text) {
        content += token.value;
      } else if (token.type === TokenType.Newline) {
        content += '\n';
      }
      
      this.advance();
    }

    // Skip newline after END_SRC
    if (this.peek()?.type === TokenType.Newline) {
      this.advance();
    }

    // Check for results
    let results: string | undefined;
    if (this.peek()?.type === TokenType.Results) {
      this.advance();
      if (this.peek()?.type === TokenType.Newline) {
        this.advance();
      }
      
      results = '';
      while (!this.isAtEnd()) {
        const token = this.peek();
        if (token.type === TokenType.Newline && this.peekNext()?.type !== TokenType.Text) {
          break;
        }
        if (token.type === TokenType.Text) {
          results += token.value;
        } else if (token.type === TokenType.Newline) {
          results += '\n';
        }
        this.advance();
      }
    }

    return {
      type: NodeType.CodeBlock,
      language,
      content: content.trim(),
      results: results?.trim(),
      line: startToken.line,
      column: startToken.column
    };
  }

  private parseDrawer(): OrgNode | null {
    const startToken = this.advance();
    
    if (startToken.metadata?.state !== 'start') {
      return null;
    }

    const drawer: OrgNode = {
      type: NodeType.Drawer,
      value: startToken.value,
      properties: {},
      children: [],
      line: startToken.line,
      column: startToken.column
    };

    // Skip newline
    if (this.peek()?.type === TokenType.Newline) {
      this.advance();
    }

    // Parse drawer content
    while (!this.isAtEnd()) {
      const token = this.peek();
      
      if (token.type === TokenType.Drawer && token.metadata?.state === 'end') {
        this.advance();
        break;
      }
      
      if (token.type === TokenType.Property) {
        drawer.properties![token.value] = token.metadata?.propertyValue;
        this.advance();
      } else if (token.type === TokenType.Text) {
        const text = token.value;
        
        // Check for scheduling keywords
        if (text.includes('SCHEDULED:')) {
          const match = text.match(/SCHEDULED:\s*(<[^>]+>)/);
          if (match) {
            drawer.properties!.scheduled = match[1];
          }
        }
        if (text.includes('DEADLINE:')) {
          const match = text.match(/DEADLINE:\s*(<[^>]+>)/);
          if (match) {
            drawer.properties!.deadline = match[1];
          }
        }
        if (text.includes('CLOSED:')) {
          const match = text.match(/CLOSED:\s*(\[[^\]]+\])/);
          if (match) {
            drawer.properties!.closed = match[1];
          }
        }
        
        this.advance();
      } else {
        this.advance();
      }
    }

    // Skip newline
    if (this.peek()?.type === TokenType.Newline) {
      this.advance();
    }

    return drawer;
  }

  private parseList(): OrgNode {
    const list: OrgNode = {
      type: NodeType.List,
      children: []
    };

    const baseIndent = this.peek()?.metadata?.indent ?? 0;

    while (!this.isAtEnd()) {
      const token = this.peek();
      
      if (token.type !== TokenType.List) {
        break;
      }
      
      const itemIndent = token.metadata?.indent ?? 0;
      if (itemIndent < baseIndent) {
        break;
      }

      const item: OrgNode = {
        type: NodeType.ListItem,
        value: token.value,
        properties: {
          marker: token.metadata?.marker,
          checkbox: token.metadata?.checkbox
        },
        line: token.line,
        column: token.column
      };

      list.children!.push(item);
      this.advance();
      
      if (this.peek()?.type === TokenType.Newline) {
        this.advance();
      }
    }

    return list;
  }

  private parseTable(): OrgNode {
    const table: OrgNode = {
      type: NodeType.Table,
      children: []
    };

    while (!this.isAtEnd()) {
      const token = this.peek();
      
      if (token.type !== TokenType.Table) {
        break;
      }

      const row: OrgNode = {
        type: NodeType.TableRow,
        value: token.value,
        line: token.line,
        column: token.column
      };

      table.children!.push(row);
      this.advance();
      
      if (this.peek()?.type === TokenType.Newline) {
        this.advance();
      }
    }

    return table;
  }

  private parseText(): OrgNode {
    const token = this.advance();
    return {
      type: NodeType.Text,
      value: token.value,
      line: token.line,
      column: token.column
    };
  }

  private peek(): Token {
    return this.tokens[this.position];
  }

  private peekNext(): Token | undefined {
    if (this.position + 1 < this.tokens.length) {
      return this.tokens[this.position + 1];
    }
    return undefined;
  }

  private advance(): Token {
    const token = this.tokens[this.position];
    this.position++;
    return token;
  }

  private isAtEnd(): boolean {
    return this.position >= this.tokens.length || this.peek()?.type === TokenType.EOF;
  }

  getAST(): OrgNode {
    return this.parse();
  }

  static parseDocument(text: string): OrgNode {
    const parser = new OrgParser(text);
    return parser.parse();
  }
}

