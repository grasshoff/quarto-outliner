import * as vscode from 'vscode';

/**
 * Markdown/Quarto headline manager
 * Provides Org-mode-like functionality for markdown files using # syntax
 */
export class MarkdownHeadlineManager {
  
  /**
   * Get the range of a markdown headline including all its content and sub-headlines
   */
  private getHeadlineRange(document: vscode.TextDocument, startLine: number): { start: number; end: number; level: number } | null {
    const headlineLine = document.lineAt(startLine);
    const match = headlineLine.text.match(/^(#+)\s/);
    
    if (!match) {
      return null;
    }
    
    const level = match[1].length;
    let endLine = startLine;
    
    // Skip YAML frontmatter
    let inYaml = false;
    if (startLine === 0 && headlineLine.text.trim() === '---') {
      inYaml = true;
    }
    
    // Find the end of this headline's content (before next same-or-higher-level headline)
    for (let i = startLine + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      
      // Check for YAML end
      if (inYaml && line.trim() === '---') {
        inYaml = false;
        continue;
      }
      
      if (inYaml) {
        continue;
      }
      
      const nextMatch = line.match(/^(#+)\s/);
      
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
   * Find the headline the cursor is on or inside
   */
  private findCurrentHeadline(document: vscode.TextDocument, cursorLine: number): number {
    let currentLine = cursorLine;
    
    // Skip YAML frontmatter
    let yamlStart = -1;
    let yamlEnd = -1;
    if (document.lineCount > 0 && document.lineAt(0).text.trim() === '---') {
      yamlStart = 0;
      for (let i = 1; i < document.lineCount; i++) {
        if (document.lineAt(i).text.trim() === '---') {
          yamlEnd = i;
          break;
        }
      }
    }
    
    console.log('YAML range:', yamlStart, '-', yamlEnd, 'Cursor at:', cursorLine);
    
    // Don't allow operations in YAML
    if (yamlStart >= 0 && yamlEnd >= 0 && cursorLine >= yamlStart && cursorLine <= yamlEnd) {
      console.log('Cursor is in YAML, rejecting');
      return -1;
    }
    
    // Search backwards for a headline, but stop at YAML
    while (currentLine >= 0) {
      // Skip YAML lines when searching backwards
      if (yamlStart >= 0 && yamlEnd >= 0 && currentLine >= yamlStart && currentLine <= yamlEnd) {
        console.log('Skipping YAML line', currentLine);
        currentLine--;
        continue;
      }
      
      const line = document.lineAt(currentLine).text;
      console.log('Checking line', currentLine, ':', line);
      
      if (line.match(/^(#+)\s/)) {
        console.log('Found headline at line', currentLine);
        break;
      }
      currentLine--;
    }
    
    return currentLine;
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
    const currentLine = this.findCurrentHeadline(document, position.line);
    
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
      const match = line.match(/^(#+)\s/);
      
      if (match && match[1].length === currentRange.level) {
        prevRange = this.getHeadlineRange(document, i);
        break;
      }
      
      if (match && match[1].length < currentRange.level) {
        break;
      }
    }
    
    if (!prevRange) {
      vscode.window.showInformationMessage('Already at top or no previous headline at same level');
      return;
    }

    const currentText = document.getText(new vscode.Range(
      new vscode.Position(currentRange.start, 0),
      new vscode.Position(currentRange.end + 1, 0)
    ));
    
    const prevText = document.getText(new vscode.Range(
      new vscode.Position(prevRange.start, 0),
      new vscode.Position(prevRange.end + 1, 0)
    ));

    await editor.edit(editBuilder => {
      editBuilder.replace(
        new vscode.Range(
          new vscode.Position(prevRange!.start, 0),
          new vscode.Position(currentRange.end + 1, 0)
        ),
        currentText + prevText
      );
    });

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
    const currentLine = this.findCurrentHeadline(document, position.line);
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const currentRange = this.getHeadlineRange(document, currentLine);
    
    if (!currentRange) {
      vscode.window.showInformationMessage('Could not determine headline range');
      return;
    }

    let nextRange: { start: number; end: number; level: number } | null = null;
    for (let i = currentRange.end + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      const match = line.match(/^(#+)\s/);
      
      if (match && match[1].length === currentRange.level) {
        nextRange = this.getHeadlineRange(document, i);
        break;
      }
      
      if (match && match[1].length < currentRange.level) {
        break;
      }
    }
    
    if (!nextRange) {
      vscode.window.showInformationMessage('Already at bottom or no next headline at same level');
      return;
    }

    const currentText = document.getText(new vscode.Range(
      new vscode.Position(currentRange.start, 0),
      new vscode.Position(currentRange.end + 1, 0)
    ));
    
    const nextText = document.getText(new vscode.Range(
      new vscode.Position(nextRange.start, 0),
      new vscode.Position(nextRange.end + 1, 0)
    ));

    await editor.edit(editBuilder => {
      editBuilder.replace(
        new vscode.Range(
          new vscode.Position(currentRange.start, 0),
          new vscode.Position(nextRange!.end + 1, 0)
        ),
        nextText + currentText
      );
    });

    const lineDiff = nextRange.end - nextRange.start + 1;
    const newPosition = new vscode.Position(currentRange.start + lineDiff, position.character);
    editor.selection = new vscode.Selection(newPosition, newPosition);
  }

  /**
   * Promote headline (reduce level: ## -> #)
   */
  async promoteHeadline(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.log('No active editor');
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    console.log('Promote called at line:', position.line);
    
    const currentLine = this.findCurrentHeadline(document, position.line);
    console.log('Found headline at line:', currentLine);
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const line = document.lineAt(currentLine);
    const text = line.text;
    console.log('Headline text:', text);
    
    const match = text.match(/^(#+)(\s.*)$/);
    
    if (!match) {
      console.log('No match for headline pattern');
      vscode.window.showInformationMessage('Could not parse headline');
      return;
    }

    const hashes = match[1];
    const rest = match[2];
    console.log('Current level:', hashes.length, 'hashes:', hashes);

    if (hashes.length === 1) {
      vscode.window.showInformationMessage('Already at top level');
      return;
    }

    const newLine = hashes.substring(1) + rest;
    console.log('New line:', newLine);

    await editor.edit(editBuilder => {
      editBuilder.replace(line.range, newLine);
    });
    
    vscode.window.showInformationMessage('Headline promoted');
  }

  /**
   * Demote headline (increase level: # -> ##)
   */
  async demoteHeadline(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.log('No active editor');
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    console.log('Demote called at line:', position.line);
    
    const currentLine = this.findCurrentHeadline(document, position.line);
    console.log('Found headline at line:', currentLine);
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const line = document.lineAt(currentLine);
    const text = line.text;
    console.log('Headline text:', text);
    
    const match = text.match(/^(#+)(\s.*)$/);
    
    if (!match) {
      console.log('No match for headline pattern');
      vscode.window.showInformationMessage('Could not parse headline');
      return;
    }

    const hashes = match[1];
    const rest = match[2];
    console.log('Current level:', hashes.length, 'hashes:', hashes);
    
    const newLine = '#' + hashes + rest;
    console.log('New line:', newLine);

    await editor.edit(editBuilder => {
      editBuilder.replace(line.range, newLine);
    });
    
    vscode.window.showInformationMessage('Headline demoted');
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
    const currentLine = this.findCurrentHeadline(document, position.line);
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const range = this.getHeadlineRange(document, currentLine);
    
    if (!range) {
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
    const currentLine = this.findCurrentHeadline(document, position.line);
    
    if (currentLine < 0) {
      vscode.window.showInformationMessage('Not on or inside a headline');
      return;
    }

    const range = this.getHeadlineRange(document, currentLine);
    
    if (!range) {
      return;
    }

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

