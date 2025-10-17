/**
 * Core Outline Tree - Single source of truth for document structure
 * This is the internal representation that drives both editor folding and D3 visualization
 */

import * as vscode from 'vscode';

/**
 * Tree node representing a headline in the document
 */
export interface OutlineNode {
  id: string;                    // Unique identifier
  line: number;                  // Line number in document
  level: number;                 // Headline level (1-6 for #-######)
  title: string;                 // Headline text
  content: string;               // Content until next headline
  startLine: number;             // First line of this section
  endLine: number;               // Last line of this section
  parent: OutlineNode | null;    // Parent node
  children: OutlineNode[];       // Direct children
  foldState: FoldState;          // Current folding state
}

/**
 * Folding state for each node
 */
export enum FoldState {
  EXPANDED = 'expanded',         // All content visible
  FOLDED = 'folded',            // Content hidden (only headline visible)
  CHILDREN_VISIBLE = 'children'  // Direct children visible, grandchildren folded
}

/**
 * Outline Tree Manager - single source of truth
 */
export class OutlineTree {
  private root: OutlineNode | null = null;
  private nodeMap: Map<string, OutlineNode> = new Map();
  private document: vscode.TextDocument;

  constructor(document: vscode.TextDocument) {
    this.document = document;
    this.build();
  }

  /**
   * Build the tree from document
   */
  private build(): void {
    this.root = null;
    this.nodeMap.clear();

    const nodes: OutlineNode[] = [];
    const stack: OutlineNode[] = [];
    let yamlEnd = -1;

    // Skip YAML frontmatter
    if (this.document.lineCount > 0 && this.document.lineAt(0).text.trim() === '---') {
      for (let i = 1; i < this.document.lineCount; i++) {
        if (this.document.lineAt(i).text.trim() === '---') {
          yamlEnd = i;
          break;
        }
      }
    }

    // Parse all headlines
    for (let i = yamlEnd + 1; i < this.document.lineCount; i++) {
      const lineText = this.document.lineAt(i).text;
      const match = lineText.match(/^(#+)\s+(.+)$/);

      if (match) {
        const level = match[1].length;
        const title = match[2];
        const content = this.extractContent(i, level);
        const endLine = this.findHeadlineEnd(i, level);

        const node: OutlineNode = {
          id: `node-${i}`,
          line: i,
          level: level,
          title: title,
          content: content,
          startLine: i,
          endLine: endLine,
          parent: null,
          children: [],
          foldState: FoldState.EXPANDED
        };

        // Build hierarchy
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          // Top-level node
          nodes.push(node);
        } else {
          // Child node
          const parent = stack[stack.length - 1];
          node.parent = parent;
          parent.children.push(node);
        }

        stack.push(node);
        this.nodeMap.set(node.id, node);
        this.nodeMap.set(`line-${i}`, node);
      }
    }

    // Create virtual root
    if (nodes.length > 0) {
      this.root = {
        id: 'root',
        line: -1,
        level: 0,
        title: 'Document Root',
        content: '',
        startLine: -1,
        endLine: this.document.lineCount - 1,
        parent: null,
        children: nodes,
        foldState: FoldState.EXPANDED
      };

      // Update parent references
      for (const node of nodes) {
        node.parent = this.root;
      }
    }
  }

  /**
   * Extract content for a headline
   */
  private extractContent(startLine: number, level: number): string {
    const contentLines: string[] = [];
    const endLine = this.findHeadlineEnd(startLine, level);

    for (let i = startLine + 1; i <= endLine; i++) {
      if (i < this.document.lineCount) {
        const lineText = this.document.lineAt(i).text;
        const match = lineText.match(/^(#+)\s/);
        
        if (match && match[1].length <= level) {
          break;
        }
        
        contentLines.push(lineText);
      }
    }

    return contentLines.join('\n').trim();
  }

  /**
   * Find the end line of a headline's content
   */
  private findHeadlineEnd(startLine: number, level: number): number {
    for (let i = startLine + 1; i < this.document.lineCount; i++) {
      const lineText = this.document.lineAt(i).text;
      const match = lineText.match(/^(#+)\s/);

      if (match && match[1].length <= level) {
        return i - 1;
      }
    }

    return this.document.lineCount - 1;
  }

  /**
   * Get node by line number
   */
  getNodeAtLine(lineNumber: number): OutlineNode | null {
    return this.nodeMap.get(`line-${lineNumber}`) || null;
  }

  /**
   * Get node by ID
   */
  getNodeById(id: string): OutlineNode | null {
    return this.nodeMap.get(id) || null;
  }

  /**
   * Get all nodes (flat list)
   */
  getAllNodes(): OutlineNode[] {
    const nodes: OutlineNode[] = [];
    
    const traverse = (node: OutlineNode) => {
      nodes.push(node);
      for (const child of node.children) {
        traverse(child);
      }
    };

    if (this.root) {
      for (const child of this.root.children) {
        traverse(child);
      }
    }

    return nodes;
  }

  /**
   * Get root node
   */
  getRoot(): OutlineNode | null {
    return this.root;
  }

  /**
   * Check if node has children
   */
  hasChildren(node: OutlineNode): boolean {
    return node.children.length > 0;
  }

  /**
   * Get next fold state for node
   */
  getNextFoldState(node: OutlineNode): FoldState {
    if (!this.hasChildren(node)) {
      // Leaf node: toggle between EXPANDED and FOLDED
      return node.foldState === FoldState.EXPANDED 
        ? FoldState.FOLDED 
        : FoldState.EXPANDED;
    }

    // Parent node: 3-state cycle
    switch (node.foldState) {
      case FoldState.EXPANDED:
        return FoldState.FOLDED;
      case FoldState.FOLDED:
        return FoldState.CHILDREN_VISIBLE;
      case FoldState.CHILDREN_VISIBLE:
        return FoldState.EXPANDED;
    }
  }

  /**
   * Set fold state for node
   */
  setFoldState(node: OutlineNode, state: FoldState): void {
    node.foldState = state;
  }

  /**
   * Cycle fold state for node at line
   */
  cycleFoldState(lineNumber: number): { node: OutlineNode; newState: FoldState } | null {
    const node = this.getNodeAtLine(lineNumber);
    if (!node) {
      return null;
    }

    const newState = this.getNextFoldState(node);
    this.setFoldState(node, newState);

    return { node, newState };
  }

  /**
   * Rebuild tree when document changes
   */
  rebuild(): void {
    this.build();
  }

  /**
   * Export tree for D3 visualization
   */
  toD3Format(): any[] {
    const result: any[] = [];

    const traverse = (node: OutlineNode): any => {
      const d3Node: any = {
        id: node.id,
        line: node.line,
        level: node.level,
        title: node.title,
        content: node.content,
        children: node.children.map((child: OutlineNode) => traverse(child)),
        collapsed: node.foldState === FoldState.FOLDED
      };
      return d3Node;
    };

    if (this.root) {
      for (const child of this.root.children) {
        result.push(traverse(child));
      }
    }

    return result;
  }

  /**
   * Get debug info
   */
  getDebugInfo(): string {
    const lines: string[] = [];
    
    const traverse = (node: OutlineNode, indent: string) => {
      lines.push(`${indent}${node.title} [line ${node.line}, level ${node.level}, state ${node.foldState}, children ${node.children.length}]`);
      for (const child of node.children) {
        traverse(child, indent + '  ');
      }
    };

    if (this.root) {
      lines.push('Document Root:');
      for (const child of this.root.children) {
        traverse(child, '  ');
      }
    } else {
      lines.push('(empty tree)');
    }

    return lines.join('\n');
  }
}

