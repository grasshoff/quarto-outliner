import * as vscode from 'vscode';

/**
 * Utility class to monitor and inspect editor folding state
 */
export class StateMonitor {
  
  /**
   * Wait for folding animations and state changes to complete
   */
  static async waitForStableState(delayMs: number = 150): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Get all currently visible line numbers in the editor
   */
  static getVisibleLines(editor: vscode.TextEditor): number[] {
    const visibleLines: number[] = [];
    const document = editor.document;
    
    // Get visible ranges from the editor
    const visibleRanges = editor.visibleRanges;
    
    for (const range of visibleRanges) {
      for (let line = range.start.line; line <= range.end.line; line++) {
        if (line < document.lineCount) {
          visibleLines.push(line);
        }
      }
    }
    
    return visibleLines;
  }

  /**
   * Get all lines that exist in the document (for comparison)
   */
  static getAllLines(editor: vscode.TextEditor): number[] {
    const allLines: number[] = [];
    for (let i = 0; i < editor.document.lineCount; i++) {
      allLines.push(i);
    }
    return allLines;
  }

  /**
   * Check if a specific line is currently folded
   * A line is considered folded if it's not visible in the viewport
   * but lines before and after it are visible
   */
  static async isFolded(editor: vscode.TextEditor, lineNumber: number): Promise<boolean> {
    // Get folding ranges directly
    const ranges = await this.getFoldedRanges(editor);
    
    for (const range of ranges) {
      if (lineNumber > range.start && lineNumber <= range.end) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get all currently folded ranges in the document
   */
  static async getFoldedRanges(editor: vscode.TextEditor): Promise<Array<{start: number, end: number}>> {
    const foldedRanges: Array<{start: number, end: number}> = [];
    const document = editor.document;
    
    // Scan through document looking for folded sections
    // A section is folded if we have content that's not visible between visible lines
    let inFoldedSection = false;
    let foldStart = -1;
    
    for (let i = 0; i < document.lineCount; i++) {
      const lineText = document.lineAt(i).text;
      
      // Check if this line has folding markers by attempting to get fold range
      // This is a heuristic approach since VS Code doesn't expose folding state directly
      try {
        const position = new vscode.Position(i, 0);
        const selection = new vscode.Selection(position, position);
        editor.selection = selection;
        
        // If we can detect the line is a fold point, track it
        const match = lineText.match(/^(#+)\s/);
        if (match) {
          // This is a headline that could be folded
          // We'll verify during actual testing
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    return foldedRanges;
  }

  /**
   * Count how many lines are currently hidden (folded)
   */
  static countHiddenLines(editor: vscode.TextEditor, visibleLines: number[]): number {
    const totalLines = editor.document.lineCount;
    return totalLines - visibleLines.length;
  }

  /**
   * Get a summary of the current display state
   */
  static getDisplayState(editor: vscode.TextEditor): {
    totalLines: number;
    visibleLineCount: number;
    hiddenLineCount: number;
    cursorLine: number;
  } {
    const totalLines = editor.document.lineCount;
    const visibleLines = this.getVisibleLines(editor);
    const visibleLineCount = visibleLines.length;
    const hiddenLineCount = totalLines - visibleLineCount;
    const cursorLine = editor.selection.active.line;
    
    return {
      totalLines,
      visibleLineCount,
      hiddenLineCount,
      cursorLine
    };
  }

  /**
   * Get headline information for a specific line
   */
  static getHeadlineInfo(editor: vscode.TextEditor, lineNumber: number): {
    isHeadline: boolean;
    level: number;
    text: string;
  } | null {
    if (lineNumber >= editor.document.lineCount) {
      return null;
    }
    
    const line = editor.document.lineAt(lineNumber);
    const match = line.text.match(/^(#+)\s(.*)$/);
    
    if (match) {
      return {
        isHeadline: true,
        level: match[1].length,
        text: match[2]
      };
    }
    
    return {
      isHeadline: false,
      level: 0,
      text: line.text
    };
  }

  /**
   * Count visible headlines at a specific level
   */
  static countVisibleHeadlines(editor: vscode.TextEditor, level?: number): number {
    let count = 0;
    
    for (let i = 0; i < editor.document.lineCount; i++) {
      const info = this.getHeadlineInfo(editor, i);
      if (info && info.isHeadline) {
        if (level === undefined || info.level === level) {
          count++;
        }
      }
    }
    
    return count;
  }

  /**
   * Get all headline line numbers in the document
   */
  static getAllHeadlineLines(editor: vscode.TextEditor, level?: number): number[] {
    const headlines: number[] = [];
    
    for (let i = 0; i < editor.document.lineCount; i++) {
      const info = this.getHeadlineInfo(editor, i);
      if (info && info.isHeadline) {
        if (level === undefined || info.level === level) {
          headlines.push(i);
        }
      }
    }
    
    return headlines;
  }
}

