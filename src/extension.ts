import * as vscode from 'vscode';
import { MarkdownFoldingProvider } from './providers/markdownFoldingProvider';
import { MarkdownHeadlineManager } from './features/markdown';
import { MarkdownFoldingCommands } from './features/markdownFolding';
import { QuartoTreeViewProvider } from './views/treeViewProvider';

export function activate(context: vscode.ExtensionContext) {

  const markdownSelector: vscode.DocumentSelector = [
    { language: 'markdown', scheme: 'file' },
    { language: 'quarto', scheme: 'file' },
    { pattern: '**/*.qmd', scheme: 'file' }
  ];

  // Register Markdown/Quarto folding provider
  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(
      markdownSelector,
      new MarkdownFoldingProvider()
    )
  );

  // Register Tree View Provider
  const treeViewProvider = new QuartoTreeViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      QuartoTreeViewProvider.viewType,
      treeViewProvider
    )
  );

  // Register commands
  const markdownManager = new MarkdownHeadlineManager();

  const commands = [
    vscode.commands.registerCommand('quarto.moveHeadlineUp', () => markdownManager.moveHeadlineUp()),
    vscode.commands.registerCommand('quarto.moveHeadlineDown', () => markdownManager.moveHeadlineDown()),
    vscode.commands.registerCommand('quarto.promoteHeadline', () => markdownManager.promoteHeadline()),
    vscode.commands.registerCommand('quarto.demoteHeadline', () => markdownManager.demoteHeadline()),
    vscode.commands.registerCommand('quarto.copyHeadline', () => markdownManager.copyHeadline()),
    vscode.commands.registerCommand('quarto.cutHeadline', () => markdownManager.cutHeadline()),
    vscode.commands.registerCommand('quarto.deleteHeadline', () => markdownManager.deleteHeadline()),
    vscode.commands.registerCommand('quarto.cycleFolding', () => MarkdownFoldingCommands.cycleFolding()),
    vscode.commands.registerCommand('quarto.foldAll', () => MarkdownFoldingCommands.foldAll()),
    vscode.commands.registerCommand('quarto.unfoldAll', () => MarkdownFoldingCommands.unfoldAll()),
    vscode.commands.registerCommand('quarto.openTreeView', () => {
      vscode.commands.executeCommand('quartoOutliner.treeView.focus');
    })
  ];

  commands.forEach(cmd => context.subscriptions.push(cmd));

  // Register document change listeners for OutlineTree synchronization
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document.languageId === 'markdown' || event.document.languageId === 'quarto') {
        MarkdownFoldingCommands.onDocumentChange(event.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument(document => {
      if (document.languageId === 'markdown' || document.languageId === 'quarto') {
        MarkdownFoldingCommands.onDocumentClose(document);
      }
    })
  );
}

export function deactivate() {}
