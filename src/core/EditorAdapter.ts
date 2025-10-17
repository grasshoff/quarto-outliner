/**
 * Editor Adapter - Maps OutlineTree operations to VSCode editor commands
 * This is the ONLY place where we talk to the editor's folding system
 */

import * as vscode from 'vscode';
import { OutlineTree, OutlineNode, FoldState } from './OutlineTree';

export class EditorAdapter {
  private tree: OutlineTree;
  private editor: vscode.TextEditor;

  constructor(editor: vscode.TextEditor, tree: OutlineTree) {
    this.editor = editor;
    this.tree = tree;
  }

  /**
   * Apply fold state to editor
   */
  async applyFoldState(node: OutlineNode, state: FoldState): Promise<void> {
    
    const position = new vscode.Position(node.line, 0);
    this.editor.selection = new vscode.Selection(position, position);
    this.editor.revealRange(new vscode.Range(position, position));


    // For parent nodes, use toggleFold which is more reliable
    if (node.children.length > 0 && state !== FoldState.CHILDREN_VISIBLE) {
      // Use toggleFold for parent nodes (except CHILDREN_VISIBLE state)
      const needsFold = state === FoldState.FOLDED;
      const currentlyFolded = await this.isLineFolded(node.line);
      
      
      if (currentlyFolded !== needsFold) {
        await vscode.commands.executeCommand('editor.toggleFold');
        
        // Update tree to match what we just did
        node.foldState = state;
        return;
      } else {
      }
    }

    // Original logic for other cases
    switch (state) {
      case FoldState.EXPANDED:
        await this.unfoldRecursively(node);
        break;
        
      case FoldState.FOLDED:
        await this.foldRecursively(node);
        break;
        
      case FoldState.CHILDREN_VISIBLE:
        await this.showChildrenOnly(node);
        break;
    }
    
    // CRITICAL: Update the tree node to reflect the change we just made
    node.foldState = state;
  }

  /**
   * Check if a line is currently folded
   */
  private async isLineFolded(line: number): Promise<boolean> {
    // Check if the line has content after it
    if (line + 1 >= this.editor.document.lineCount) {
      return false; // Nothing to fold
    }
    
    // Check if next line is blank - if so, check line after that
    let checkLine = line + 1;
    while (checkLine < this.editor.document.lineCount && 
           this.editor.document.lineAt(checkLine).text.trim() === '') {
      checkLine++;
    }
    
    if (checkLine >= this.editor.document.lineCount) {
      return false; // Only blank lines after, nothing folded
    }
    
    // Check if the content line is visible
    const visibleRanges = this.editor.visibleRanges;
    const contentLineVisible = visibleRanges.some(range => 
      range.start.line <= checkLine && range.end.line >= checkLine
    );
    
    return !contentLineVisible;
  }

  /**
   * Check if node has children that are folded (for CHILDREN_VISIBLE state detection)
   */
  private async hasChildrenFolded(node: OutlineNode): Promise<boolean> {
    if (node.children.length === 0) {
      return false;
    }

    // Check if any direct child is folded
    for (const child of node.children) {
      const childFolded = await this.isLineFolded(child.line);
      if (childFolded) {
        return true;
      }
    }

    return false;
  }

  /**
   * Synchronize OutlineTree with actual VSCode editor state
   * This is CRITICAL: reads the editor's actual folding and updates the tree
   */
  async syncTreeWithEditor(): Promise<void> {
    
    const nodes = this.tree.getAllNodes();
    
    for (const node of nodes) {
      const actuallyFolded = await this.isLineFolded(node.line);
      
      if (actuallyFolded) {
        // Line is folded in editor
        node.foldState = FoldState.FOLDED;
      } else if (node.children.length > 0) {
        // Line is unfolded, but check if children are folded
        const childrenFolded = await this.hasChildrenFolded(node);
        
        if (childrenFolded) {
          node.foldState = FoldState.CHILDREN_VISIBLE;
        } else {
          node.foldState = FoldState.EXPANDED;
        }
      } else {
        // Leaf node, unfolded
        node.foldState = FoldState.EXPANDED;
      }
    }
    
  }

  /**
   * Fold node recursively (fold everything)
   */
  private async foldRecursively(node: OutlineNode): Promise<void> {
    
    // Ensure cursor is at the headline
    const position = new vscode.Position(node.line, 0);
    this.editor.selection = new vscode.Selection(position, position);
    this.editor.revealRange(new vscode.Range(position, position));
    await this.delay(10);
    
    try {
      // First ensure we're in unfolded state
      await vscode.commands.executeCommand('editor.unfold');
      await this.delay(50);
      
      // Then fold recursively
      await vscode.commands.executeCommand('editor.foldRecursively');
      await this.delay(50);
      
    } catch (error) {
      await vscode.commands.executeCommand('editor.toggleFold');
    }
  }

  /**
   * Unfold node recursively (show everything)
   */
  private async unfoldRecursively(node: OutlineNode): Promise<void> {
    
    // Ensure cursor is at the headline
    const position = new vscode.Position(node.line, 0);
    this.editor.selection = new vscode.Selection(position, position);
    this.editor.revealRange(new vscode.Range(position, position));
    await this.delay(10);
    
    try {
      // First ensure we're in folded state
      await vscode.commands.executeCommand('editor.fold');
      await this.delay(50);
      
      // Then unfold recursively
      await vscode.commands.executeCommand('editor.unfoldRecursively');
      await this.delay(50);
    } catch (error) {
      await vscode.commands.executeCommand('editor.toggleFold');
    }
  }

  /**
   * Show only direct children (unfold this level, fold children)
   */
  private async showChildrenOnly(node: OutlineNode): Promise<void> {
    
    // First unfold this node completely
    await vscode.commands.executeCommand('editor.unfoldRecursively');
    
    // Small delay to let VSCode process
    await this.delay(50);
    
    // Then fold each direct child recursively
    for (const child of node.children) {
      const childPosition = new vscode.Position(child.line, 0);
      this.editor.selection = new vscode.Selection(childPosition, childPosition);
      await vscode.commands.executeCommand('editor.foldRecursively');
      await this.delay(20);
    }
    
    // Return cursor to original position
    const originalPosition = new vscode.Position(node.line, 0);
    this.editor.selection = new vscode.Selection(originalPosition, originalPosition);
  }

  /**
   * Utility delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cycle folding at current cursor position
   */
  async cycleFoldingAtCursor(): Promise<boolean> {
    const position = this.editor.selection.active;
    const line = this.editor.document.lineAt(position.line);

    // Check if we're on a headline
    const headlineMatch = line.text.match(/^(#+)\s/);
    if (!headlineMatch) {
      // Not on a headline
      return false;
    }


    // SPECIAL DEBUG for line 7
    if (position.line === 6) {
      for (let i = 6; i < Math.min(15, this.editor.document.lineCount); i++) {
      }
    }

    // Get tree and cycle state
    const result = this.tree.cycleFoldState(position.line);
    
    if (!result) {
      return false;
    }

    const { node, newState } = result;
    
    
    // Check what VSCode actually shows
    const actuallyFolded = await this.isLineFolded(node.line);

    // Apply the state to editor
    await this.applyFoldState(node, newState);
    
    // Verify result
    await this.delay(100);
    const resultFolded = await this.isLineFolded(node.line);

    return true;
  }

  /**
   * Get debug info from tree
   */
  getTreeDebugInfo(): string {
    return this.tree.getDebugInfo();
  }
}


