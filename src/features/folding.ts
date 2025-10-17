import * as vscode from 'vscode';

export class FoldingCommands {
  /**
   * Cycle folding state on current headline
   * States: FOLDED -> CHILDREN -> SUBTREE -> FOLDED
   */
  static async cycleFolding(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      console.log('No active editor');
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line);
    
    console.log('Folding command triggered on line:', position.line, 'Text:', line.text);
    
    // Check if we're on a headline (one or more * followed by space)
    const headlineMatch = line.text.match(/^(\*+)\s/);
    if (!headlineMatch) {
      console.log('Not on a headline, executing default tab');
      // Not on a headline, use default tab behavior
      await vscode.commands.executeCommand('tab');
      return;
    }

    console.log('On headline, cycling fold state');
    const headlineLevel = headlineMatch[1].length;
    const headlineLineNumber = position.line;
    
    // Find the range of this headline
    const endLine = this.findHeadlineEnd(document, headlineLineNumber, headlineLevel);
    
    if (endLine <= headlineLineNumber) {
      console.log('No content to fold');
      return;
    }

    // Determine current state
    const state = await this.getFoldingState(editor, document, headlineLineNumber, headlineLevel);
    console.log('Current folding state:', state);

    // Cycle to next state
    if (state === 'FOLDED') {
      // FOLDED -> CHILDREN: Unfold to show direct children only
      await this.showChildren(editor, document, headlineLineNumber, headlineLevel);
      console.log('Transitioned to CHILDREN state');
    } else if (state === 'CHILDREN') {
      // CHILDREN -> SUBTREE: Unfold everything
      await vscode.commands.executeCommand('editor.unfoldRecursively');
      console.log('Transitioned to SUBTREE state');
    } else {
      // SUBTREE -> FOLDED: Fold everything
      await vscode.commands.executeCommand('editor.fold');
      console.log('Transitioned to FOLDED state');
    }
  }

  /**
   * Determine the current folding state of a headline
   */
  private static async getFoldingState(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    headlineLineNumber: number,
    headlineLevel: number
  ): Promise<'FOLDED' | 'CHILDREN' | 'SUBTREE'> {
    // Check if first line after headline is visible
    const nextLine = headlineLineNumber + 1;
    if (nextLine >= document.lineCount) {
      return 'SUBTREE';
    }

    const isNextLineVisible = this.isLineVisible(editor, nextLine);
    
    if (!isNextLineVisible) {
      // First line after headline is hidden -> FOLDED
      return 'FOLDED';
    }

    // Check if we have any grandchildren (headlines at level+2 or more)
    const hasGrandchildren = this.hasDescendantsAtLevel(
      document, 
      headlineLineNumber, 
      headlineLevel, 
      headlineLevel + 2
    );

    if (!hasGrandchildren) {
      // No grandchildren to check -> SUBTREE
      return 'SUBTREE';
    }

    // Find first grandchild headline
    const grandchildLine = this.findFirstDescendantAtLevel(
      document,
      headlineLineNumber,
      headlineLevel,
      headlineLevel + 2
    );

    if (grandchildLine === -1) {
      return 'SUBTREE';
    }

    // Check if line after grandchild is visible
    const lineAfterGrandchild = grandchildLine + 1;
    if (lineAfterGrandchild >= document.lineCount) {
      return 'SUBTREE';
    }

    const isGrandchildContentVisible = this.isLineVisible(editor, lineAfterGrandchild);
    
    if (isGrandchildContentVisible) {
      // Grandchild content is visible -> SUBTREE
      return 'SUBTREE';
    } else {
      // Grandchild content is hidden -> CHILDREN
      return 'CHILDREN';
    }
  }

  /**
   * Check if a line is visible
   */
  private static isLineVisible(editor: vscode.TextEditor, lineNumber: number): boolean {
    const visibleRanges = editor.visibleRanges;
    const position = new vscode.Position(lineNumber, 0);
    
    for (const range of visibleRanges) {
      if (range.contains(position)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Show only direct children (fold grandchildren and below)
   */
  private static async showChildren(
    editor: vscode.TextEditor,
    document: vscode.TextDocument,
    headlineLineNumber: number,
    headlineLevel: number
  ): Promise<void> {
    // First, unfold the headline completely
    await vscode.commands.executeCommand('editor.unfold');
    
    // Then fold all child headlines
    const children = this.findDirectChildren(document, headlineLineNumber, headlineLevel);
    
    for (const childLine of children) {
      // Move cursor to child and fold it
      const childPosition = new vscode.Position(childLine, 0);
      editor.selection = new vscode.Selection(childPosition, childPosition);
      await vscode.commands.executeCommand('editor.fold');
    }
    
    // Restore cursor to original headline
    const originalPosition = new vscode.Position(headlineLineNumber, editor.selection.active.character);
    editor.selection = new vscode.Selection(originalPosition, originalPosition);
  }

  /**
   * Find all direct children of a headline
   */
  private static findDirectChildren(
    document: vscode.TextDocument,
    headlineLineNumber: number,
    headlineLevel: number
  ): number[] {
    const children: number[] = [];
    const endLine = this.findHeadlineEnd(document, headlineLineNumber, headlineLevel);
    
    for (let i = headlineLineNumber + 1; i <= endLine; i++) {
      const lineText = document.lineAt(i).text;
      const match = lineText.match(/^(\*+)\s/);
      
      if (match && match[1].length === headlineLevel + 1) {
        children.push(i);
      }
    }
    
    return children;
  }

  /**
   * Check if headline has descendants at a specific level
   */
  private static hasDescendantsAtLevel(
    document: vscode.TextDocument,
    headlineLineNumber: number,
    headlineLevel: number,
    targetLevel: number
  ): boolean {
    const endLine = this.findHeadlineEnd(document, headlineLineNumber, headlineLevel);
    
    for (let i = headlineLineNumber + 1; i <= endLine; i++) {
      const lineText = document.lineAt(i).text;
      const match = lineText.match(/^(\*+)\s/);
      
      if (match && match[1].length >= targetLevel) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Find first descendant at a specific level
   */
  private static findFirstDescendantAtLevel(
    document: vscode.TextDocument,
    headlineLineNumber: number,
    headlineLevel: number,
    targetLevel: number
  ): number {
    const endLine = this.findHeadlineEnd(document, headlineLineNumber, headlineLevel);
    
    for (let i = headlineLineNumber + 1; i <= endLine; i++) {
      const lineText = document.lineAt(i).text;
      const match = lineText.match(/^(\*+)\s/);
      
      if (match && match[1].length >= targetLevel) {
        return i;
      }
    }
    
    return -1;
  }

  /**
   * Find the end line of a headline's content
   */
  private static findHeadlineEnd(
    document: vscode.TextDocument,
    startLine: number,
    level: number
  ): number {
    const totalLines = document.lineCount;
    
    for (let i = startLine + 1; i < totalLines; i++) {
      const lineText = document.lineAt(i).text;
      const match = lineText.match(/^(\*+)\s+/);
      
      if (match) {
        const nextLevel = match[1].length;
        if (nextLevel <= level) {
          // Found same or higher level headline
          return i - 1;
        }
      }
    }
    
    // No next headline found, this headline extends to end of document
    return totalLines - 1;
  }

  /**
   * Check if a line is currently folded
   */
  private static async isLineFolded(
    editor: vscode.TextEditor,
    lineNumber: number
  ): Promise<boolean> {
    // Check if the next line is visible
    const nextLine = lineNumber + 1;
    if (nextLine >= editor.document.lineCount) {
      return false;
    }

    // Get visible ranges
    const visibleRanges = editor.visibleRanges;
    
    // Check if the line after the headline is visible
    for (const range of visibleRanges) {
      if (range.contains(new vscode.Position(nextLine, 0))) {
        return false; // Next line is visible, so not folded
      }
    }
    
    return true; // Next line is not in visible ranges, likely folded
  }

  /**
   * Fold all headlines at level
   */
  static async foldAll(level?: number): Promise<void> {
    await vscode.commands.executeCommand('editor.foldAll');
  }

  /**
   * Unfold all headlines
   */
  static async unfoldAll(): Promise<void> {
    await vscode.commands.executeCommand('editor.unfoldAll');
  }

  /**
   * Fold recursively (fold this headline and all children)
   */
  static async foldRecursively(): Promise<void> {
    await vscode.commands.executeCommand('editor.foldRecursively');
  }

  /**
   * Unfold recursively (unfold this headline and all children)
   */
  static async unfoldRecursively(): Promise<void> {
    await vscode.commands.executeCommand('editor.unfoldRecursively');
  }
}


