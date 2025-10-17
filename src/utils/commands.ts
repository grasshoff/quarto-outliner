import * as vscode from 'vscode';
import { TodoManager } from '../features/todo';
import { AgendaManager } from '../features/agenda';
import { CaptureManager } from '../features/capture';
import { BabelExecutor } from '../features/babel';
import { TimestampManager } from '../features/timestamps';
import { LinkManager } from '../features/links';
import { TableManager } from '../features/tables';
import { FoldingCommands } from '../features/folding';
import { MarkdownHeadlineManager } from '../features/markdown';
import { MarkdownFoldingCommands } from '../features/markdownFolding';

export class CommandRegistry {
  static register(context: vscode.ExtensionContext): void {
    const todoManager = new TodoManager();
    const agendaManager = new AgendaManager();
    const captureManager = new CaptureManager();
    const babelExecutor = new BabelExecutor();
    const timestampManager = new TimestampManager();
    const linkManager = new LinkManager();
    const tableManager = new TableManager();
    const markdownManager = new MarkdownHeadlineManager();

    const commands = [
      vscode.commands.registerCommand('org.toggleTodo', () => todoManager.toggleTodo()),
      vscode.commands.registerCommand('org.cyclePriority', () => todoManager.cyclePriority()),
      vscode.commands.registerCommand('org.insertHeadline', () => todoManager.insertHeadline()),
      vscode.commands.registerCommand('org.promoteHeadline', () => todoManager.promoteHeadline()),
      vscode.commands.registerCommand('org.demoteHeadline', () => todoManager.demoteHeadline()),
      vscode.commands.registerCommand('org.moveHeadlineUp', () => todoManager.moveHeadlineUp()),
      vscode.commands.registerCommand('org.moveHeadlineDown', () => todoManager.moveHeadlineDown()),
      vscode.commands.registerCommand('org.copyHeadline', () => todoManager.copyHeadline()),
      vscode.commands.registerCommand('org.cutHeadline', () => todoManager.cutHeadline()),
      vscode.commands.registerCommand('org.deleteHeadline', () => todoManager.deleteHeadline()),
      
      vscode.commands.registerCommand('org.showAgenda', () => agendaManager.showAgenda()),
      
      vscode.commands.registerCommand('org.capture', () => captureManager.capture()),
      vscode.commands.registerCommand('org.addCaptureTemplate', () => captureManager.addCaptureTemplate()),
      
      vscode.commands.registerCommand('org.executeCodeBlock', () => babelExecutor.executeCodeBlock()),
      vscode.commands.registerCommand('org.executeAllCodeBlocks', () => babelExecutor.executeAllCodeBlocks()),
      
      vscode.commands.registerCommand('org.insertTimestamp', () => timestampManager.insertTimestamp()),
      
      vscode.commands.registerCommand('org.followLink', () => linkManager.followLink()),
      vscode.commands.registerCommand('org.insertLink', () => linkManager.insertLink()),
      
      vscode.commands.registerCommand('org.formatTable', () => tableManager.formatTable()),
      vscode.commands.registerCommand('org.insertTable', () => tableManager.insertTable()),
      vscode.commands.registerCommand('org.addTableRow', () => tableManager.addRow()),
      vscode.commands.registerCommand('org.deleteTableRow', () => tableManager.deleteRow()),
      
      vscode.commands.registerCommand('org.cycleFolding', () => FoldingCommands.cycleFolding()),
      vscode.commands.registerCommand('org.foldAll', () => FoldingCommands.foldAll()),
      vscode.commands.registerCommand('org.unfoldAll', () => FoldingCommands.unfoldAll()),
      
      // Markdown/Quarto commands - REMOVED (now in extension.ts with quarto.* prefix to avoid conflicts)
      // vscode.commands.registerCommand('markdown.moveHeadlineUp', () => markdownManager.moveHeadlineUp()),
      // vscode.commands.registerCommand('markdown.moveHeadlineDown', () => markdownManager.moveHeadlineDown()),
      // vscode.commands.registerCommand('markdown.promoteHeadline', () => markdownManager.promoteHeadline()),
      // vscode.commands.registerCommand('markdown.demoteHeadline', () => markdownManager.demoteHeadline()),
      // vscode.commands.registerCommand('markdown.copyHeadline', () => markdownManager.copyHeadline()),
      // vscode.commands.registerCommand('markdown.cutHeadline', () => markdownManager.cutHeadline()),
      // vscode.commands.registerCommand('markdown.deleteHeadline', () => markdownManager.deleteHeadline()),
      // vscode.commands.registerCommand('markdown.cycleFolding', () => MarkdownFoldingCommands.cycleFolding()),
      // vscode.commands.registerCommand('markdown.foldAll', () => MarkdownFoldingCommands.foldAll()),
      // vscode.commands.registerCommand('markdown.unfoldAll', () => MarkdownFoldingCommands.unfoldAll()),
      
      vscode.commands.registerCommand('org.exportHtml', () => this.exportHtml()),
      vscode.commands.registerCommand('org.archiveSubtree', () => this.archiveSubtree()),
      vscode.commands.registerCommand('org.refile', () => this.refile())
    ];

    commands.forEach(cmd => context.subscriptions.push(cmd));
  }

  private static async exportHtml(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'org') {
      vscode.window.showErrorMessage('Not an Org file');
      return;
    }

    vscode.window.showInformationMessage('HTML export will be implemented in a future version');
  }

  private static async archiveSubtree(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'org') {
      vscode.window.showErrorMessage('Not an Org file');
      return;
    }

    vscode.window.showInformationMessage('Archive will be implemented in a future version');
  }

  private static async refile(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'org') {
      vscode.window.showErrorMessage('Not an Org file');
      return;
    }

    vscode.window.showInformationMessage('Refile will be implemented in a future version');
  }
}

