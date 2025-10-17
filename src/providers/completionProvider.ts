import * as vscode from 'vscode';

export class OrgCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substring(0, position.character);
    const completions: vscode.CompletionItem[] = [];

    // Keyword completions
    if (linePrefix.match(/^#\+[A-Z]*$/)) {
      const keywords = [
        'TITLE', 'AUTHOR', 'DATE', 'EMAIL', 'DESCRIPTION', 'KEYWORDS',
        'LANGUAGE', 'OPTIONS', 'STARTUP', 'TODO', 'SEQ_TODO', 'TAGS',
        'FILETAGS', 'ARCHIVE', 'CATEGORY', 'PROPERTY', 'COLUMNS',
        'BEGIN_SRC', 'END_SRC', 'BEGIN_EXAMPLE', 'END_EXAMPLE',
        'BEGIN_QUOTE', 'END_QUOTE', 'RESULTS'
      ];

      for (const keyword of keywords) {
        const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
        item.insertText = `${keyword}: `;
        completions.push(item);
      }
    }

    // Source block language completions
    if (linePrefix.match(/^#\+BEGIN_SRC\s+\w*$/)) {
      const languages = [
        'python', 'javascript', 'typescript', 'java', 'c', 'cpp', 'go',
        'rust', 'ruby', 'php', 'shell', 'bash', 'sh', 'sql', 'html',
        'css', 'json', 'yaml', 'xml', 'markdown', 'latex', 'r'
      ];

      for (const lang of languages) {
        const item = new vscode.CompletionItem(lang, vscode.CompletionItemKind.Value);
        completions.push(item);
      }
    }

    // TODO keyword completions
    if (linePrefix.match(/^\*+\s+[A-Z]*$/)) {
      const config = vscode.workspace.getConfiguration('org');
      const todoKeywords = config.get<string[]>('todoKeywords', ['TODO', 'DONE']);

      for (const keyword of todoKeywords) {
        const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Enum);
        completions.push(item);
      }

      // Additional common TODO keywords
      const commonKeywords = ['NEXT', 'WAITING', 'HOLD', 'CANCELLED', 'CANCELED'];
      for (const keyword of commonKeywords) {
        if (!todoKeywords.includes(keyword)) {
          const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Enum);
          completions.push(item);
        }
      }
    }

    // Priority completions
    if (linePrefix.match(/^\*+\s+(TODO|DONE|NEXT|WAITING)?\s*\[#[A-Z]?$/)) {
      const priorities = ['A', 'B', 'C'];
      for (const priority of priorities) {
        const item = new vscode.CompletionItem(priority, vscode.CompletionItemKind.Constant);
        item.insertText = `${priority}] `;
        completions.push(item);
      }
    }

    // Drawer completions
    if (linePrefix.match(/^\s*:[A-Z]*$/)) {
      const drawers = ['PROPERTIES', 'LOGBOOK', 'CLOCK'];
      for (const drawer of drawers) {
        const item = new vscode.CompletionItem(drawer, vscode.CompletionItemKind.Module);
        item.insertText = `${drawer}:\n:END:`;
        completions.push(item);
      }
    }

    // Property completions
    if (linePrefix.match(/^\s*:PROPERTIES:\n.*:$/)) {
      const properties = [
        'ID', 'CUSTOM_ID', 'CATEGORY', 'EXPORT_FILE_NAME',
        'EXPORT_TITLE', 'ORDERED', 'COOKIE_DATA', 'VISIBILITY'
      ];

      for (const property of properties) {
        const item = new vscode.CompletionItem(property, vscode.CompletionItemKind.Property);
        item.insertText = `${property}: `;
        completions.push(item);
      }
    }

    return completions;
  }
}

