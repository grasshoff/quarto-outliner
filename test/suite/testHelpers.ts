import * as vscode from 'vscode';
import * as assert from 'assert';
import { StateMonitor } from './stateMonitor';

/**
 * Test helper functions for Quarto Outliner testing
 */
export class TestHelpers {
  private static testDocumentPath: string | undefined;
  private static originalContent: string | undefined;

  /**
   * Set cursor position in the active editor
   * NOTE: line parameter uses 1-based numbering (human-readable)
   * and is converted to 0-based for VS Code API
   */
  static setCursorPosition(line: number, character: number = 0): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    // Convert from 1-based (human) to 0-based (VS Code API)
    const zeroBasedLine = line - 1;
    const position = new vscode.Position(zeroBasedLine, character);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position));
  }

  /**
   * Execute a keyboard shortcut command
   */
  static async pressKey(command: string): Promise<void> {
    await vscode.commands.executeCommand(command);
    await StateMonitor.waitForStableState();
  }

  /**
   * Capture current display state
   */
  static captureDisplayState(): {
    visibleLines: number[];
    totalLines: number;
    cursorLine: number;
    headlines: Array<{line: number, level: number, text: string}>;
  } {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    const visibleLines = StateMonitor.getVisibleLines(editor);
    const state = StateMonitor.getDisplayState(editor);
    const headlines: Array<{line: number, level: number, text: string}> = [];

    for (let i = 0; i < editor.document.lineCount; i++) {
      const info = StateMonitor.getHeadlineInfo(editor, i);
      if (info && info.isHeadline) {
        headlines.push({
          line: i,
          level: info.level,
          text: info.text
        });
      }
    }

    return {
      visibleLines,
      totalLines: state.totalLines,
      cursorLine: state.cursorLine,
      headlines
    };
  }

  /**
   * Assert that specific lines are visible
   * NOTE: expectedLines uses 1-based numbering (human-readable)
   */
  static assertLinesVisible(expectedLines: number[], message?: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    const visibleLines = StateMonitor.getVisibleLines(editor);
    
    for (const line of expectedLines) {
      const zeroBasedLine = line - 1;
      if (!visibleLines.includes(zeroBasedLine)) {
        const context = message ? `${message}\n` : '';
        assert.fail(
          `${context}Expected line ${line} to be visible.\n` +
          `Visible lines (1-based): ${visibleLines.map(l => l + 1).join(', ')}`
        );
      }
    }
  }

  /**
   * Assert that specific lines are NOT visible (folded)
   * NOTE: hiddenLines uses 1-based numbering (human-readable)
   */
  static assertLinesHidden(hiddenLines: number[], message?: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    const visibleLines = StateMonitor.getVisibleLines(editor);
    
    for (const line of hiddenLines) {
      const zeroBasedLine = line - 1;
      if (visibleLines.includes(zeroBasedLine)) {
        const context = message ? `${message}\n` : '';
        assert.fail(
          `${context}Expected line ${line} to be hidden (folded).\n` +
          `Visible lines (1-based): ${visibleLines.map(l => l + 1).join(', ')}`
        );
      }
    }
  }

  /**
   * Assert approximate line count (for when exact count varies)
   */
  static assertApproximateVisibleLineCount(expectedCount: number, tolerance: number = 2): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    const visibleLines = StateMonitor.getVisibleLines(editor);
    const actualCount = visibleLines.length;
    
    if (Math.abs(actualCount - expectedCount) > tolerance) {
      assert.fail(
        `Expected approximately ${expectedCount} visible lines (±${tolerance}), ` +
        `but got ${actualCount}.\n` +
        `Visible lines: ${visibleLines.join(', ')}`
      );
    }
  }

  /**
   * Open and prepare the test document
   */
  static async openTestDocument(filePath: string): Promise<vscode.TextEditor> {
    this.testDocumentPath = filePath;
    
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    
    // Store original content for reset
    this.originalContent = document.getText();
    
    const editor = await vscode.window.showTextDocument(document);
    
    // Ensure document is fully expanded initially
    await vscode.commands.executeCommand('editor.unfoldAll');
    await StateMonitor.waitForStableState();
    
    return editor;
  }

  /**
   * Reset document to original state
   */
  static async resetDocument(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !this.originalContent) {
      return;
    }

    // Unfold everything first
    await vscode.commands.executeCommand('editor.unfoldAll');
    await StateMonitor.waitForStableState();

    // Restore content if modified
    const currentContent = editor.document.getText();
    if (currentContent !== this.originalContent) {
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        editor.document.positionAt(0),
        editor.document.positionAt(currentContent.length)
      );
      edit.replace(editor.document.uri, fullRange, this.originalContent);
      await vscode.workspace.applyEdit(edit);
      await StateMonitor.waitForStableState();
    }

    // Position cursor at beginning (line 1)
    this.setCursorPosition(1, 0);
  }

  /**
   * Get the text content of a specific line
   * NOTE: lineNumber uses 1-based numbering (human-readable)
   */
  static getLineText(lineNumber: number): string {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    const zeroBasedLine = lineNumber - 1;
    if (zeroBasedLine >= editor.document.lineCount || zeroBasedLine < 0) {
      throw new Error(`Line ${lineNumber} does not exist`);
    }

    return editor.document.lineAt(zeroBasedLine).text;
  }

  /**
   * Assert that a line contains specific text
   * NOTE: lineNumber uses 1-based numbering (human-readable)
   */
  static assertLineContains(lineNumber: number, expectedText: string): void {
    const actualText = this.getLineText(lineNumber);
    assert.ok(
      actualText.includes(expectedText),
      `Expected line ${lineNumber} to contain "${expectedText}", but got: "${actualText}"`
    );
  }

  /**
   * Get clipboard content
   */
  static async getClipboard(): Promise<string> {
    return await vscode.env.clipboard.readText();
  }

  /**
   * Set clipboard content
   */
  static async setClipboard(text: string): Promise<void> {
    await vscode.env.clipboard.writeText(text);
  }

  /**
   * Count total lines in document
   */
  static getDocumentLineCount(): number {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }
    return editor.document.lineCount;
  }

  /**
   * Wait for a specific amount of time
   */
  static async wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all level-1 headline line numbers
   * Returns 1-based line numbers (human-readable)
   */
  static getLevel1Headlines(): number[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }
    // Convert from 0-based to 1-based
    return StateMonitor.getAllHeadlineLines(editor, 1).map(l => l + 1);
  }

  /**
   * Get all level-2 headline line numbers
   * Returns 1-based line numbers (human-readable)
   */
  static getLevel2Headlines(): number[] {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }
    // Convert from 0-based to 1-based
    return StateMonitor.getAllHeadlineLines(editor, 2).map(l => l + 1);
  }

  /**
   * Assert cursor is at expected position
   * NOTE: expectedLine uses 1-based numbering (human-readable)
   */
  static assertCursorAt(expectedLine: number, expectedChar?: number): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      throw new Error('No active editor');
    }

    const position = editor.selection.active;
    const zeroBasedExpectedLine = expectedLine - 1;
    assert.strictEqual(
      position.line,
      zeroBasedExpectedLine,
      `Expected cursor at line ${expectedLine} (0-based: ${zeroBasedExpectedLine}), but was at ${position.line}`
    );

    if (expectedChar !== undefined) {
      assert.strictEqual(
        position.character,
        expectedChar,
        `Expected cursor at character ${expectedChar}, but was at ${position.character}`
      );
    }
  }

  /**
   * Execute a command and wait for completion
   */
  static async executeCommand(command: string, ...args: any[]): Promise<any> {
    const result = await vscode.commands.executeCommand(command, ...args);
    await StateMonitor.waitForStableState();
    return result;
  }
}

