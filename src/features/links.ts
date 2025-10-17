import * as vscode from 'vscode';
import * as path from 'path';

export class LinkManager {
  private linkPattern = /\[\[([^\]]+)\](?:\[([^\]]+)\])?\]/g;

  async followLink(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const position = editor.selection.active;
    const line = editor.document.lineAt(position.line).text;
    
    const links = this.extractLinks(line);
    
    for (const link of links) {
      if (position.character >= link.start && position.character <= link.end) {
        await this.openLink(link.target, editor.document.uri);
        return;
      }
    }

    vscode.window.showInformationMessage('No link at cursor position');
  }

  private extractLinks(text: string): Array<{ target: string; description?: string; start: number; end: number }> {
    const links: Array<{ target: string; description?: string; start: number; end: number }> = [];
    let match: RegExpExecArray | null;
    
    const pattern = /\[\[([^\]]+)\](?:\[([^\]]+)\])?\]/g;
    
    while ((match = pattern.exec(text)) !== null) {
      links.push({
        target: match[1],
        description: match[2],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    return links;
  }

  private async openLink(target: string, currentUri: vscode.Uri): Promise<void> {
    if (target.startsWith('http://') || target.startsWith('https://')) {
      await vscode.env.openExternal(vscode.Uri.parse(target));
      return;
    }

    if (target.startsWith('file:')) {
      const filePath = target.substring(5);
      const uri = this.resolveFilePath(filePath, currentUri);
      
      const hashIndex = filePath.indexOf('#');
      if (hashIndex !== -1) {
        const headline = filePath.substring(hashIndex + 1);
        await this.openFileAndFindHeadline(uri, headline);
      } else {
        await vscode.window.showTextDocument(uri);
      }
      return;
    }

    if (target.startsWith('id:')) {
      vscode.window.showInformationMessage('ID links not yet implemented');
      return;
    }

    if (target.startsWith('#')) {
      const headline = target.substring(1);
      await this.findHeadlineInCurrentFile(headline);
      return;
    }

    if (target.includes('::')) {
      const [filePath, location] = target.split('::');
      const uri = this.resolveFilePath(filePath, currentUri);
      
      if (location.match(/^\d+$/)) {
        await this.openFileAtLine(uri, parseInt(location));
      } else {
        await this.openFileAndFindHeadline(uri, location);
      }
      return;
    }

    const uri = this.resolveFilePath(target, currentUri);
    
    try {
      await vscode.window.showTextDocument(uri);
    } catch {
      vscode.window.showErrorMessage(`Cannot open: ${target}`);
    }
  }

  private resolveFilePath(filePath: string, currentUri: vscode.Uri): vscode.Uri {
    if (path.isAbsolute(filePath)) {
      return vscode.Uri.file(filePath);
    }

    const currentDir = path.dirname(currentUri.fsPath);
    const resolvedPath = path.resolve(currentDir, filePath);
    return vscode.Uri.file(resolvedPath);
  }

  private async openFileAtLine(uri: vscode.Uri, line: number): Promise<void> {
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    
    const position = new vscode.Position(Math.max(0, line - 1), 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
  }

  private async openFileAndFindHeadline(uri: vscode.Uri, headline: string): Promise<void> {
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      const match = line.match(/^\*+\s+(?:TODO|DONE|NEXT|WAITING)?\s*(?:\[#[A-Z]\])?\s*(.+?)(?:\s+:[^\s:]+(?::[^\s:]+)*:)?\s*$/);
      
      if (match && match[1].toLowerCase().includes(headline.toLowerCase())) {
        const position = new vscode.Position(i, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        return;
      }
    }

    vscode.window.showWarningMessage(`Headline "${headline}" not found`);
  }

  private async findHeadlineInCurrentFile(headline: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      const match = line.match(/^\*+\s+(?:TODO|DONE|NEXT|WAITING)?\s*(?:\[#[A-Z]\])?\s*(.+?)(?:\s+:[^\s:]+(?::[^\s:]+)*:)?\s*$/);
      
      if (match && match[1].toLowerCase().includes(headline.toLowerCase())) {
        const position = new vscode.Position(i, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
        return;
      }
    }

    vscode.window.showWarningMessage(`Headline "${headline}" not found`);
  }

  async insertLink(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const target = await vscode.window.showInputBox({
      prompt: 'Enter link target (URL, file path, or headline)',
      placeHolder: 'https://example.com or file.org or #headline'
    });

    if (!target) {
      return;
    }

    const description = await vscode.window.showInputBox({
      prompt: 'Enter link description (optional)',
      placeHolder: 'Link text'
    });

    const link = description
      ? `[[${target}][${description}]]`
      : `[[${target}]]`;

    await editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, link);
    });
  }
}

export class LinkDefinitionProvider implements vscode.DefinitionProvider {
  private linkManager: LinkManager;

  constructor(linkManager: LinkManager) {
    this.linkManager = linkManager;
  }

  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Definition> {
    const line = document.lineAt(position.line).text;
    const linkPattern = /\[\[([^\]]+)\](?:\[([^\]]+)\])?\]/g;
    let match: RegExpExecArray | null;
    
    while ((match = linkPattern.exec(line)) !== null) {
      if (position.character >= match.index && position.character <= match.index + match[0].length) {
        const target = match[1];
        
        if (target.startsWith('#')) {
          const headline = target.substring(1);
          for (let i = 0; i < document.lineCount; i++) {
            const lineText = document.lineAt(i).text;
            if (lineText.match(new RegExp(`^\\*+\\s+.*${headline}`, 'i'))) {
              return new vscode.Location(document.uri, new vscode.Position(i, 0));
            }
          }
        }
      }
    }

    return null;
  }
}

