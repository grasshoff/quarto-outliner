import * as vscode from 'vscode';

export class TableManager {
  async formatTable(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const position = editor.selection.active;
    const tableRange = this.findTableAtPosition(editor.document, position.line);
    
    if (!tableRange) {
      vscode.window.showInformationMessage('Not in a table');
      return;
    }

    const table = this.parseTable(editor.document, tableRange);
    const formatted = this.formatTableData(table);
    
    await editor.edit(editBuilder => {
      editBuilder.replace(tableRange, formatted);
    });
  }

  private findTableAtPosition(
    document: vscode.TextDocument,
    line: number
  ): vscode.Range | null {
    let startLine = line;
    let endLine = line;

    for (let i = line; i >= 0; i--) {
      const text = document.lineAt(i).text;
      if (text.match(/^\s*\|/)) {
        startLine = i;
      } else {
        break;
      }
    }

    for (let i = line; i < document.lineCount; i++) {
      const text = document.lineAt(i).text;
      if (text.match(/^\s*\|/)) {
        endLine = i;
      } else {
        break;
      }
    }

    if (startLine === endLine && !document.lineAt(line).text.match(/^\s*\|/)) {
      return null;
    }

    return new vscode.Range(
      new vscode.Position(startLine, 0),
      new vscode.Position(endLine, document.lineAt(endLine).text.length)
    );
  }

  private parseTable(document: vscode.TextDocument, range: vscode.Range): string[][] {
    const rows: string[][] = [];

    for (let i = range.start.line; i <= range.end.line; i++) {
      const text = document.lineAt(i).text.trim();
      
      if (text.match(/^\|[-+]+\|$/)) {
        rows.push(['---separator---']);
        continue;
      }

      const cells = text
        .split('|')
        .slice(1, -1)
        .map(cell => cell.trim());
      
      rows.push(cells);
    }

    return rows;
  }

  private formatTableData(table: string[][]): string {
    if (table.length === 0) {
      return '';
    }

    const numCols = Math.max(...table.map(row => row.length));
    const columnWidths: number[] = new Array(numCols).fill(0);

    for (const row of table) {
      if (row[0] === '---separator---') {
        continue;
      }
      for (let i = 0; i < row.length; i++) {
        columnWidths[i] = Math.max(columnWidths[i], row[i].length);
      }
    }

    const lines: string[] = [];

    for (const row of table) {
      if (row[0] === '---separator---') {
        const separator = columnWidths.map(width => '-'.repeat(width + 2)).join('+');
        lines.push(`|${separator}|`);
      } else {
        const cells = row.map((cell, i) => ` ${cell.padEnd(columnWidths[i])} `);
        lines.push(`|${cells.join('|')}|`);
      }
    }

    return lines.join('\n');
  }

  async insertTable(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const rows = await vscode.window.showInputBox({
      prompt: 'Number of rows',
      value: '3'
    });

    const cols = await vscode.window.showInputBox({
      prompt: 'Number of columns',
      value: '3'
    });

    if (!rows || !cols) {
      return;
    }

    const numRows = parseInt(rows);
    const numCols = parseInt(cols);

    if (isNaN(numRows) || isNaN(numCols) || numRows < 1 || numCols < 1) {
      vscode.window.showErrorMessage('Invalid number of rows or columns');
      return;
    }

    const table: string[][] = [];
    for (let i = 0; i < numRows; i++) {
      table.push(new Array(numCols).fill(''));
    }

    table.splice(1, 0, ['---separator---']);

    const formatted = this.formatTableData(table);

    await editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, `\n${formatted}\n`);
    });
  }

  async addRow(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const position = editor.selection.active;
    const line = editor.document.lineAt(position.line);
    const text = line.text.trim();

    if (!text.match(/^\|/)) {
      vscode.window.showInformationMessage('Not in a table');
      return;
    }

    const cells = text.split('|').slice(1, -1);
    const newRow = `|${cells.map(() => '  ').join('|')}|`;

    await editor.edit(editBuilder => {
      editBuilder.insert(
        new vscode.Position(position.line + 1, 0),
        newRow + '\n'
      );
    });
  }

  async deleteRow(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const position = editor.selection.active;
    const line = editor.document.lineAt(position.line);
    const text = line.text.trim();

    if (!text.match(/^\|/)) {
      vscode.window.showInformationMessage('Not in a table');
      return;
    }

    await editor.edit(editBuilder => {
      const range = new vscode.Range(
        new vscode.Position(position.line, 0),
        new vscode.Position(position.line + 1, 0)
      );
      editBuilder.delete(range);
    });
  }
}

