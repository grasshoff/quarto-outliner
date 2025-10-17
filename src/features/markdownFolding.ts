/**
 * Markdown Folding Commands - Refactored to use OutlineTree
 * This is now just a thin wrapper around the core tree + editor adapter
 */

import * as vscode from 'vscode';
import { OutlineTree } from '../core/OutlineTree';
import { EditorAdapter } from '../core/EditorAdapter';

export class MarkdownFoldingCommands {
  // Cache trees per document
  private static trees = new Map<string, OutlineTree>();

  /**
   * Cycle folding state on current headline
   */
  static async cycleFolding(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line);

    // Check if we're on a headline
    const headlineMatch = line.text.match(/^(#+)\s/);
    if (!headlineMatch) {
      // Not on a headline, use default tab behavior
      await vscode.commands.executeCommand('tab');
      return;
    }

    // Get or create tree for this document
    const docKey = document.uri.toString();
    let tree = this.trees.get(docKey);
    
    if (!tree) {
      tree = new OutlineTree(document);
      this.trees.set(docKey, tree);
    }

    // Create adapter
    const adapter = new EditorAdapter(editor, tree);
    
    // Sync tree with editor state before cycling
    await adapter.syncTreeWithEditor();
    
    // Cycle folding state
    const handled = await adapter.cycleFoldingAtCursor();

    if (!handled) {
      await vscode.commands.executeCommand('tab');
    }
  }

  /**
   * Rebuild tree when document changes
   */
  static onDocumentChange(document: vscode.TextDocument): void {
    const docKey = document.uri.toString();
    const tree = this.trees.get(docKey);
    
    if (tree) {
      tree.rebuild();
    }
  }

  /**
   * Clear tree cache when document closes
   */
  static onDocumentClose(document: vscode.TextDocument): void {
    const docKey = document.uri.toString();
    this.trees.delete(docKey);
  }

  /**
   * Get tree for document (for D3 visualization)
   */
  static getTreeForDocument(document: vscode.TextDocument): OutlineTree | null {
    const docKey = document.uri.toString();
    let tree = this.trees.get(docKey);
    
    if (!tree) {
      tree = new OutlineTree(document);
      this.trees.set(docKey, tree);
    }
    
    return tree;
  }

  /**
   * Fold all headlines to level 1 (collapse all to top level)
   */
  static async foldAll(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;
    const docKey = document.uri.toString();
    let tree = this.trees.get(docKey);
    
    if (!tree) {
      tree = new OutlineTree(document);
      this.trees.set(docKey, tree);
    }

    // First unfold everything
    await vscode.commands.executeCommand('editor.unfoldAll');
    await this.delay(100);

    // Find all level 1 headings and fold them
    const nodes = tree.getAllNodes();
    for (const node of nodes) {
      if (node.level === 1) {
        const position = new vscode.Position(node.line, 0);
        editor.selection = new vscode.Selection(position, position);
        await vscode.commands.executeCommand('editor.fold');
        await this.delay(50);
      }
    }
  }

  /**
   * Unfold all headlines (full expansion)
   */
  static async unfoldAll(): Promise<void> {
    await vscode.commands.executeCommand('editor.unfoldAll');
  }

  /**
   * Utility delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
