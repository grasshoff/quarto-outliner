import * as vscode from 'vscode';

export class TodoManager {
  private todoKeywords: string[] = [];
  
  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    const config = vscode.workspace.getConfiguration('org');
    this.todoKeywords = config.get<string[]>('todoKeywords', ['TODO', 'DONE']);
  }

  async toggleTodo(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line);
    const text = line.text;

    const headlineMatch = text.match(/^(\*+)\s+(TODO|DONE|NEXT|WAITING|HOLD|CANCELLED|CANCELED)?\s*(\[#[A-Z]\])?\s*(.+?)(\s+:[^\s:]+(?::[^\s:]+)*:)?\s*$/);
    
    if (!headlineMatch) {
      vscode.window.showInformationMessage('Not on a headline');
      return;
    }

    const stars = headlineMatch[1];
    const currentTodo = headlineMatch[2];
    const priority = headlineMatch[3] || '';
    const title = headlineMatch[4];
    const tags = headlineMatch[5] || '';

    let nextTodo: string;
    
    if (!currentTodo) {
      nextTodo = this.todoKeywords[0];
    } else {
      const currentIndex = this.todoKeywords.indexOf(currentTodo);
      if (currentIndex === -1) {
        nextTodo = this.todoKeywords[0];
      } else if (currentIndex === this.todoKeywords.length - 1) {
        nextTodo = '';
      } else {
        nextTodo = this.todoKeywords[currentIndex + 1];
      }
    }

    const newLine = nextTodo
      ? `${stars} ${nextTodo} ${priority} ${title}${tags}`.replace(/\s+/g, ' ').trim()
      : `${stars} ${priority} ${title}${tags}`.replace(/\s+/g, ' ').trim();

    await editor.edit(editBuilder => {
      editBuilder.replace(line.range, newLine);
    });

    // Add logbook entry if transitioning to DONE
    if (nextTodo === 'DONE' || nextTodo === 'CANCELLED' || nextTodo === 'CANCELED') {
      await this.addLogbookEntry(editor, position.line, currentTodo || '', nextTodo);
    }
  }

  async cyclePriority(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line);
    const text = line.text;

    const headlineMatch = text.match(/^(\*+)\s+(TODO|DONE|NEXT|WAITING|HOLD|CANCELLED|CANCELED)?\s*(\[#([A-Z])\])?\s*(.+?)(\s+:[^\s:]+(?::[^\s:]+)*:)?\s*$/);
    
    if (!headlineMatch) {
      vscode.window.showInformationMessage('Not on a headline');
      return;
    }

    const stars = headlineMatch[1];
    const todo = headlineMatch[2] || '';
    const currentPriority = headlineMatch[4];
    const title = headlineMatch[5];
    const tags = headlineMatch[6] || '';

    const priorities = ['A', 'B', 'C'];
    let nextPriority: string;

    if (!currentPriority) {
      nextPriority = priorities[0];
    } else {
      const currentIndex = priorities.indexOf(currentPriority);
      if (currentIndex === priorities.length - 1) {
        nextPriority = '';
      } else {
        nextPriority = priorities[currentIndex + 1];
      }
    }

    const priorityStr = nextPriority ? `[#${nextPriority}]` : '';
    const newLine = todo
      ? `${stars} ${todo} ${priorityStr} ${title}${tags}`.replace(/\s+/g, ' ').trim()
      : `${stars} ${priorityStr} ${title}${tags}`.replace(/\s+/g, ' ').trim();

    await editor.edit(editBuilder => {
      editBuilder.replace(line.range, newLine);
    });
  }

  async insertHeadline(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    let level = 1;
    for (let i = position.line; i >= 0; i--) {
      const line = document.lineAt(i).text;
      const match = line.match(/^(\*+)\s/);
      if (match) {
        level = match[1].length;
        break;
      }
    }

    const stars = '*'.repeat(level);
    const newHeadline = `\n${stars} `;

    await editor.edit(editBuilder => {
      const lineEnd = document.lineAt(position.line).range.end;
      editBuilder.insert(lineEnd, newHeadline);
    });

    const newPosition = new vscode.Position(position.line + 1, stars.length + 1);
    editor.selection = new vscode.Selection(newPosition, newPosition);
  }

  async promoteHeadline(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line);
    const text = line.text;

    const match = text.match(/^(\*+)(\s.*)$/);
    if (!match) {
      vscode.window.showInformationMessage('Not on a headline');
      return;
    }

    const stars = match[1];
    const rest = match[2];

    if (stars.length === 1) {
      vscode.window.showInformationMessage('Already at top level');
      return;
    }

    const newLine = stars.substring(1) + rest;

    await editor.edit(editBuilder => {
      editBuilder.replace(line.range, newLine);
    });
  }

  async demoteHeadline(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line);
    const text = line.text;

    const match = text.match(/^(\*+)(\s.*)$/);
    if (!match) {
      vscode.window.showInformationMessage('Not on a headline');
      return;
    }

    const stars = match[1];
    const rest = match[2];
    const newLine = '*' + stars + rest;

    await editor.edit(editBuilder => {
      editBuilder.replace(line.range, newLine);
    });
  }

  private async addLogbookEntry(
    editor: vscode.TextEditor,
    headlineLine: number,
    fromState: string,
    toState: string
  ): Promise<void> {
    const document = editor.document;
    const timestamp = this.formatTimestamp(new Date());
    const entry = `- State "${toState}"       from "${fromState}"       ${timestamp}`;

    let logbookLine = -1;
    let endLine = -1;

    for (let i = headlineLine + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      
      if (line.match(/^\s*:LOGBOOK:\s*$/)) {
        logbookLine = i;
      }
      
      if (line.match(/^\s*:END:\s*$/) && logbookLine !== -1) {
        endLine = i;
        break;
      }
      
      if (line.match(/^\*+\s/)) {
        break;
      }
    }

    if (logbookLine !== -1 && endLine !== -1) {
      await editor.edit(editBuilder => {
        const insertPosition = new vscode.Position(logbookLine + 1, 0);
        editBuilder.insert(insertPosition, entry + '\n');
      });
    } else {
      await editor.edit(editBuilder => {
        const insertPosition = new vscode.Position(headlineLine + 1, 0);
        editBuilder.insert(insertPosition, `:LOGBOOK:\n${entry}\n:END:\n`);
      });
    }
  }

  private formatTimestamp(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `[${year}-${month}-${day} ${dayName} ${hours}:${minutes}]`;
  }

  /**
   * Get the range of a headline including all its content and sub-headlines
   */
  private getHeadlineRange(document: vscode.TextDocument, startLine: number): { start: number; end: number; level: number } | null {
    const headlineLine = document.lineAt(startLine);
    const match = headlineLine.text.match(/^(\*+)\s/);
    
    if (!match) {
      return null;
    }
    
    const level = match[1].length;
    let endLine = startLine;
    
    // Find the end of this headline's content (before next same-or-higher-level headline)
    for (let i = startLine + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      const nextMatch = line.match(/^(\*+)\s/);
      
      if (nextMatch && nextMatch[1].length <= level) {
        // Found a same-level or higher headline
        endLine = i - 1;
        break;
      }
      
      if (i === document.lineCount - 1) {
        // Reached end of document
        endLine = i;
      }
    }
    
    return { start: startLine, end: endLine, level };
  }

  /**
   * Move headline up (swap with previous headline at same level)
   */
  async moveHeadlineUp(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    // Find the headline we're on
    let currentLine = position.line;
    while (currentLine >= 0) {
      const line = document.lineAt(currentLine).text;
      if (line.match(/^(\*+)\s/)) {
        break;
      }
      currentLine--;
    }
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const currentRange = this.getHeadlineRange(document, currentLine);
    
    if (!currentRange) {
      vscode.window.showInformationMessage('Could not determine headline range');
      return;
    }

    // Find previous headline at same level
    let prevRange: { start: number; end: number; level: number } | null = null;
    for (let i = currentRange.start - 1; i >= 0; i--) {
      const line = document.lineAt(i).text;
      const match = line.match(/^(\*+)\s/);
      
      if (match && match[1].length === currentRange.level) {
        prevRange = this.getHeadlineRange(document, i);
        break;
      }
      
      if (match && match[1].length < currentRange.level) {
        // Hit a higher-level headline, can't move up
        break;
      }
    }
    
    if (!prevRange) {
      vscode.window.showInformationMessage('Already at top or no previous headline at same level');
      return;
    }

    // Get the text of both headlines (including newlines)
    const currentText = document.getText(new vscode.Range(
      new vscode.Position(currentRange.start, 0),
      new vscode.Position(currentRange.end + 1, 0)
    ));
    
    const prevText = document.getText(new vscode.Range(
      new vscode.Position(prevRange.start, 0),
      new vscode.Position(prevRange.end + 1, 0)
    ));

    // Swap them
    await editor.edit(editBuilder => {
      editBuilder.replace(
        new vscode.Range(
          new vscode.Position(prevRange!.start, 0),
          new vscode.Position(currentRange.end + 1, 0)
        ),
        currentText + prevText
      );
    });

    // Move cursor to the moved headline
    const lineDiff = currentRange.start - prevRange.start;
    const newPosition = new vscode.Position(prevRange.start, position.character);
    editor.selection = new vscode.Selection(newPosition, newPosition);
  }

  /**
   * Move headline down (swap with next headline at same level)
   */
  async moveHeadlineDown(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    // Find the headline we're on
    let currentLine = position.line;
    while (currentLine >= 0) {
      const line = document.lineAt(currentLine).text;
      if (line.match(/^(\*+)\s/)) {
        break;
      }
      currentLine--;
    }
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const currentRange = this.getHeadlineRange(document, currentLine);
    
    if (!currentRange) {
      vscode.window.showInformationMessage('Could not determine headline range');
      return;
    }

    // Find next headline at same level
    let nextRange: { start: number; end: number; level: number } | null = null;
    for (let i = currentRange.end + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      const match = line.match(/^(\*+)\s/);
      
      if (match && match[1].length === currentRange.level) {
        nextRange = this.getHeadlineRange(document, i);
        break;
      }
      
      if (match && match[1].length < currentRange.level) {
        // Hit a higher-level headline, can't move down
        break;
      }
    }
    
    if (!nextRange) {
      vscode.window.showInformationMessage('Already at bottom or no next headline at same level');
      return;
    }

    // Get the text of both headlines (including newlines)
    const currentText = document.getText(new vscode.Range(
      new vscode.Position(currentRange.start, 0),
      new vscode.Position(currentRange.end + 1, 0)
    ));
    
    const nextText = document.getText(new vscode.Range(
      new vscode.Position(nextRange.start, 0),
      new vscode.Position(nextRange.end + 1, 0)
    ));

    // Swap them
    await editor.edit(editBuilder => {
      editBuilder.replace(
        new vscode.Range(
          new vscode.Position(currentRange.start, 0),
          new vscode.Position(nextRange!.end + 1, 0)
        ),
        nextText + currentText
      );
    });

    // Move cursor to the moved headline
    const lineDiff = nextRange.end - nextRange.start + 1;
    const newPosition = new vscode.Position(currentRange.start + lineDiff, position.character);
    editor.selection = new vscode.Selection(newPosition, newPosition);
  }

  /**
   * Copy headline with all content to clipboard
   */
  async copyHeadline(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    // Find the headline we're on
    let currentLine = position.line;
    while (currentLine >= 0) {
      const line = document.lineAt(currentLine).text;
      if (line.match(/^(\*+)\s/)) {
        break;
      }
      currentLine--;
    }
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const range = this.getHeadlineRange(document, currentLine);
    
    if (!range) {
      vscode.window.showInformationMessage('Could not determine headline range');
      return;
    }

    const text = document.getText(new vscode.Range(
      new vscode.Position(range.start, 0),
      new vscode.Position(range.end, document.lineAt(range.end).text.length)
    ));

    await vscode.env.clipboard.writeText(text);
    vscode.window.showInformationMessage('Headline copied to clipboard');
  }

  /**
   * Cut headline with all content to clipboard
   */
  async cutHeadline(): Promise<void> {
    await this.copyHeadline();
    await this.deleteHeadline();
  }

  /**
   * Delete headline with all content
   */
  async deleteHeadline(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    // Find the headline we're on
    let currentLine = position.line;
    while (currentLine >= 0) {
      const line = document.lineAt(currentLine).text;
      if (line.match(/^(\*+)\s/)) {
        break;
      }
      currentLine--;
    }
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const range = this.getHeadlineRange(document, currentLine);
    
    if (!range) {
      vscode.window.showInformationMessage('Could not determine headline range');
      return;
    }

    // Include the newline after the headline if not at end of document
    const endLine = range.end < document.lineCount - 1 ? range.end + 1 : range.end;
    const endChar = range.end < document.lineCount - 1 ? 0 : document.lineAt(range.end).text.length;

    await editor.edit(editBuilder => {
      editBuilder.delete(new vscode.Range(
        new vscode.Position(range.start, 0),
        new vscode.Position(endLine, endChar)
      ));
    });

    vscode.window.showInformationMessage('Headline deleted');
  }
}

