import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class BabelExecutor {
  async executeCodeBlock(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const position = editor.selection.active;
    const codeBlock = this.findCodeBlockAtPosition(editor.document, position.line);
    
    if (!codeBlock) {
      vscode.window.showInformationMessage('Not in a code block');
      return;
    }

    const result = await this.executeCode(codeBlock.language, codeBlock.code);
    
    await this.insertResults(editor, codeBlock.endLine, result);
  }

  private findCodeBlockAtPosition(
    document: vscode.TextDocument,
    line: number
  ): { language: string; code: string; startLine: number; endLine: number } | null {
    let startLine = -1;
    let endLine = -1;
    let language = '';

    for (let i = line; i >= 0; i--) {
      const text = document.lineAt(i).text;
      const match = text.match(/^#\+BEGIN_SRC\s+(\w+)/i);
      if (match) {
        startLine = i;
        language = match[1].toLowerCase();
        break;
      }
    }

    if (startLine === -1) {
      return null;
    }

    for (let i = startLine + 1; i < document.lineCount; i++) {
      const text = document.lineAt(i).text;
      if (text.match(/^#\+END_SRC/i)) {
        endLine = i;
        break;
      }
    }

    if (endLine === -1) {
      return null;
    }

    const lines: string[] = [];
    for (let i = startLine + 1; i < endLine; i++) {
      lines.push(document.lineAt(i).text);
    }

    return {
      language,
      code: lines.join('\n'),
      startLine,
      endLine
    };
  }

  private async executeCode(language: string, code: string): Promise<string> {
    try {
      switch (language) {
        case 'python':
        case 'python3':
          return await this.executePython(code);
        case 'javascript':
        case 'js':
          return await this.executeJavaScript(code);
        case 'typescript':
        case 'ts':
          return await this.executeTypeScript(code);
        case 'shell':
        case 'bash':
        case 'sh':
          return await this.executeShell(code);
        case 'ruby':
          return await this.executeRuby(code);
        case 'r':
          return await this.executeR(code);
        default:
          return `Error: Language "${language}" not supported`;
      }
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  }

  private async executePython(code: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync('python3 -c ' + this.escapeShellArg(code));
      return stdout || stderr;
    } catch (error: any) {
      return error.message;
    }
  }

  private async executeJavaScript(code: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync('node -e ' + this.escapeShellArg(code));
      return stdout || stderr;
    } catch (error: any) {
      return error.message;
    }
  }

  private async executeTypeScript(code: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync('ts-node -e ' + this.escapeShellArg(code));
      return stdout || stderr;
    } catch (error: any) {
      return error.message;
    }
  }

  private async executeShell(code: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(code);
      return stdout || stderr;
    } catch (error: any) {
      return error.message;
    }
  }

  private async executeRuby(code: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync('ruby -e ' + this.escapeShellArg(code));
      return stdout || stderr;
    } catch (error: any) {
      return error.message;
    }
  }

  private async executeR(code: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync('Rscript -e ' + this.escapeShellArg(code));
      return stdout || stderr;
    } catch (error: any) {
      return error.message;
    }
  }

  private escapeShellArg(arg: string): string {
    return `'${arg.replace(/'/g, "'\\''")}'`;
  }

  private async insertResults(
    editor: vscode.TextEditor,
    endLine: number,
    result: string
  ): Promise<void> {
    const document = editor.document;
    
    let resultsLine = -1;
    let resultsEndLine = -1;

    for (let i = endLine + 1; i < Math.min(endLine + 10, document.lineCount); i++) {
      const text = document.lineAt(i).text;
      
      if (text.match(/^#\+RESULTS:/i)) {
        resultsLine = i;
        
        for (let j = i + 1; j < document.lineCount; j++) {
          const nextText = document.lineAt(j).text;
          if (nextText.match(/^\s*$/) || nextText.match(/^#\+|^\*/)) {
            resultsEndLine = j - 1;
            break;
          }
        }
        
        if (resultsEndLine === -1) {
          resultsEndLine = document.lineCount - 1;
        }
        
        break;
      }
      
      if (!text.match(/^\s*$/)) {
        break;
      }
    }

    const formattedResult = result.trim();
    
    await editor.edit(editBuilder => {
      if (resultsLine !== -1) {
        const deleteRange = new vscode.Range(
          new vscode.Position(resultsLine, 0),
          new vscode.Position(resultsEndLine + 1, 0)
        );
        editBuilder.delete(deleteRange);
        editBuilder.insert(
          new vscode.Position(resultsLine, 0),
          `#+RESULTS:\n${formattedResult}\n\n`
        );
      } else {
        const insertPosition = new vscode.Position(endLine + 1, 0);
        editBuilder.insert(insertPosition, `\n#+RESULTS:\n${formattedResult}\n\n`);
      }
    });
  }

  async executeAllCodeBlocks(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const codeBlocks: Array<{ language: string; code: string; endLine: number }> = [];

    let inBlock = false;
    let currentBlock: { language: string; lines: string[]; startLine: number } | null = null;

    for (let i = 0; i < document.lineCount; i++) {
      const text = document.lineAt(i).text;
      
      const beginMatch = text.match(/^#\+BEGIN_SRC\s+(\w+)/i);
      if (beginMatch) {
        inBlock = true;
        currentBlock = {
          language: beginMatch[1].toLowerCase(),
          lines: [],
          startLine: i
        };
        continue;
      }

      if (text.match(/^#\+END_SRC/i) && inBlock && currentBlock) {
        codeBlocks.push({
          language: currentBlock.language,
          code: currentBlock.lines.join('\n'),
          endLine: i
        });
        inBlock = false;
        currentBlock = null;
        continue;
      }

      if (inBlock && currentBlock) {
        currentBlock.lines.push(text);
      }
    }

    for (const block of codeBlocks) {
      const result = await this.executeCode(block.language, block.code);
      await this.insertResults(editor, block.endLine, result);
    }

    vscode.window.showInformationMessage(`Executed ${codeBlocks.length} code block(s)`);
  }
}

