import * as vscode from 'vscode';
import * as path from 'path';
import { MarkdownFoldingCommands } from '../features/markdownFolding';

/**
 * Tree View Provider for Quarto/Markdown outline visualization
 * Provides webview-based interactive tree with editing capabilities
 * Now uses OutlineTree as single source of truth
 */
export class QuartoTreeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'quartoOutliner.treeView';
  private _view?: vscode.WebviewView;
  private _document?: vscode.TextDocument;
  private _disposables: vscode.Disposable[] = [];

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'src', 'viewer'),
        vscode.Uri.joinPath(this._extensionUri, 'out', 'viewer')
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for active editor changes
    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && this._isQuartoOrMarkdown(editor.document)) {
          this._document = editor.document;
          this._updateTreeView();
        }
      })
    );

    // Listen for document changes
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument(e => {
        if (this._document && e.document === this._document) {
          this._updateTreeView();
        }
      })
    );

    // Handle messages from webview
    this._disposables.push(
      webviewView.webview.onDidReceiveMessage(message => {
        this._handleMessage(message);
      })
    );

    // Initial update
    const editor = vscode.window.activeTextEditor;
    if (editor && this._isQuartoOrMarkdown(editor.document)) {
      this._document = editor.document;
      this._updateTreeView();
    }
  }

  /**
   * Update tree view with current document structure
   * Now uses OutlineTree as single source of truth
   */
  private _updateTreeView() {
    if (!this._view || !this._document) {
      return;
    }

    // Get tree from MarkdownFoldingCommands (single source of truth)
    const outlineTree = MarkdownFoldingCommands.getTreeForDocument(this._document);
    
    if (!outlineTree) {
      return;
    }

    // Export to D3 format
    const tree = outlineTree.toD3Format();
    
    this._view.webview.postMessage({
      type: 'updateTree',
      tree: tree,
      documentUri: this._document.uri.toString()
    });
  }

  /**
   * Parse document into tree structure
   */
  private _parseDocumentToTree(document: vscode.TextDocument): TreeNode[] {
    const lines: TreeNode[] = [];
    const stack: TreeNode[] = [];
    let yamlEnd = -1;

    // Skip YAML frontmatter
    if (document.lineCount > 0 && document.lineAt(0).text.trim() === '---') {
      for (let i = 1; i < document.lineCount; i++) {
        if (document.lineAt(i).text.trim() === '---') {
          yamlEnd = i;
          break;
        }
      }
    }

    // Parse headlines
    for (let i = yamlEnd + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = line.text.match(/^(#+)\s+(.+)$/);
      
      if (match) {
        const level = match[1].length;
        const title = match[2];
        const content = this._getHeadlineContent(document, i, level);
        
        const node: TreeNode = {
          id: `node-${i}`,
          line: i,
          level: level,
          title: title,
          content: content,
          children: [],
          collapsed: false
        };

        // Build hierarchy
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          lines.push(node);
        } else {
          stack[stack.length - 1].children.push(node);
        }

        stack.push(node);
      }
    }

    return lines;
  }

  /**
   * Get content of a headline (all text until next same-or-higher level headline)
   */
  private _getHeadlineContent(document: vscode.TextDocument, startLine: number, level: number): string {
    const contentLines: string[] = [];
    
    for (let i = startLine + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = line.text.match(/^(#+)\s/);
      
      if (match && match[1].length <= level) {
        break;
      }
      
      contentLines.push(line.text);
    }
    
    return contentLines.join('\n').trim();
  }

  /**
   * Handle messages from webview
   */
  private async _handleMessage(message: any) {
    switch (message.type) {
      case 'selectNode':
        await this._selectNode(message.line);
        break;
      case 'toggleCollapse':
        await this._toggleCollapse(message.nodeId);
        break;
      case 'editNode':
        await this._editNode(message.line);
        break;
      case 'saveNode':
        await this._saveNode(message.line, message.title, message.content);
        break;
      case 'foldNode':
        await this._foldNode(message.line);
        break;
      case 'requestAudioRecord':
        await this._handleAudioRecord(message.nodeId);
        break;
    }
  }

  /**
   * Select node in editor
   */
  private async _selectNode(line: number) {
    if (!this._document) {
      return;
    }

    const editor = await vscode.window.showTextDocument(this._document);
    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position));
  }

  /**
   * Toggle collapse state in tree (view-only, doesn't affect editor)
   */
  private async _toggleCollapse(nodeId: string) {
    // Tree state managed in webview, no action needed
  }

  /**
   * Edit node - opens in editor
   */
  private async _editNode(line: number) {
    await this._selectNode(line);
  }

  /**
   * Save node edits back to document
   */
  private async _saveNode(line: number, title: string, content: string) {
    if (!this._document) {
      return;
    }

    const editor = await vscode.window.showTextDocument(this._document);
    const document = editor.document;
    
    // Get headline line
    const headlineLine = document.lineAt(line);
    const match = headlineLine.text.match(/^(#+)\s/);
    
    if (!match) {
      return;
    }

    const hashes = match[1];
    const level = hashes.length;
    
    // Find end of this headline's content
    let endLine = line;
    for (let i = line + 1; i < document.lineCount; i++) {
      const nextLine = document.lineAt(i);
      const nextMatch = nextLine.text.match(/^(#+)\s/);
      
      if (nextMatch && nextMatch[1].length <= level) {
        endLine = i - 1;
        break;
      }
      
      if (i === document.lineCount - 1) {
        endLine = i;
      }
    }

    // Replace headline and content
    const newText = `${hashes} ${title}\n${content}`;
    const range = new vscode.Range(
      new vscode.Position(line, 0),
      new vscode.Position(endLine, document.lineAt(endLine).text.length)
    );

    await editor.edit(editBuilder => {
      editBuilder.replace(range, newText);
    });
  }

  /**
   * Fold node in editor
   */
  private async _foldNode(line: number) {
    if (!this._document) {
      return;
    }

    const editor = await vscode.window.showTextDocument(this._document);
    const position = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(position, position);
    await vscode.commands.executeCommand('editor.fold');
  }

  /**
   * Handle audio recording request
   */
  private async _handleAudioRecord(nodeId: string) {
    // Placeholder for audio recording feature
    vscode.window.showInformationMessage('Audio recording feature coming soon!');
  }

  /**
   * Check if document is Quarto or Markdown
   */
  private _isQuartoOrMarkdown(document: vscode.TextDocument): boolean {
    return document.languageId === 'quarto' || 
           document.languageId === 'markdown' ||
           document.fileName.endsWith('.qmd') ||
           document.fileName.endsWith('.md');
  }

  /**
   * Generate HTML for webview
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quarto Outline</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      margin: 0;
      padding: 0;
      font-size: 12px;
    }
    .tree-list {
      list-style: none;
      margin: 0;
      padding: 4px 0;
    }
    .tree-item {
      display: flex;
      align-items: center;
      padding: 2px 8px;
      cursor: pointer;
      user-select: none;
      line-height: 20px;
    }
    .tree-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .tree-item.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    .tree-icon {
      width: 14px;
      height: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 3px;
      flex-shrink: 0;
      font-size: 8px;
      transition: transform 0.15s ease;
    }
    .tree-icon.expanded {
      transform: rotate(90deg);
    }
    .tree-icon.empty {
      opacity: 0;
    }
    .tree-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 11.5px;
    }
    .tree-children {
      list-style: none;
      margin: 0;
      padding: 0;
      padding-left: 16px;
      display: none;
    }
    .tree-children.expanded {
      display: block;
    }
    .level-1 { font-weight: 600; }
    .level-2 { font-weight: 500; }
    .level-3 { font-weight: normal; }
    .level-4 { font-weight: normal; opacity: 0.95; }
    .level-5 { font-weight: normal; opacity: 0.9; }
    .level-6 { font-weight: normal; opacity: 0.85; }
    .empty-state {
      padding: 20px;
      text-align: center;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div id="tree-container"></div>

  <script>
    const vscode = acquireVsCodeApi();
    let treeData = null;
    let selectedLine = null;

    // Listen for messages from extension
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'updateTree') {
        treeData = message.tree;
        renderTree();
      }
    });

    function renderTree() {
      const container = document.getElementById('tree-container');
      
      if (!treeData || treeData.length === 0) {
        container.innerHTML = '<div class="empty-state">No headings found in document</div>';
        return;
      }

      const ul = document.createElement('ul');
      ul.className = 'tree-list';
      
      treeData.forEach(node => {
        ul.appendChild(createTreeNode(node));
      });
      
      container.innerHTML = '';
      container.appendChild(ul);
    }

    function createTreeNode(node) {
      const li = document.createElement('li');
      
      // Create item
      const item = document.createElement('div');
      item.className = 'tree-item level-' + node.level;
      if (node.line === selectedLine) {
        item.classList.add('selected');
      }
      
      // Create icon
      const icon = document.createElement('span');
      icon.className = 'tree-icon';
      if (node.children && node.children.length > 0) {
        icon.textContent = '▶';
        icon.classList.add('expanded'); // Start expanded
      } else {
        icon.classList.add('empty');
      }
      
      // Create label
      const label = document.createElement('span');
      label.className = 'tree-label';
      label.textContent = node.title;
      label.title = node.title;
      
      item.appendChild(icon);
      item.appendChild(label);
      li.appendChild(item);
      
      // Create children FIRST (before setting up click handlers)
      let childrenUl = null;
      if (node.children && node.children.length > 0) {
        childrenUl = document.createElement('ul');
        childrenUl.className = 'tree-children expanded'; // Start expanded
        node.children.forEach(child => {
          childrenUl.appendChild(createTreeNode(child));
        });
        li.appendChild(childrenUl);
      }
      
      // Handle click on label - jump to line
      label.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedLine = node.line;
        vscode.postMessage({
          type: 'selectNode',
          line: node.line
        });
        renderTree(); // Re-render to show selection
      });
      
      // Handle click on icon - toggle collapse
      if (childrenUl) {
        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          icon.classList.toggle('expanded');
          childrenUl.classList.toggle('expanded');
        });
      }
      
      return li;
    }

    // Initial render
    renderTree();
  </script>
</body>
</html>`;
  }

  public dispose() {
    this._disposables.forEach(d => d.dispose());
  }
}

/**
 * Tree node interface
 */
interface TreeNode {
  id: string;
  line: number;
  level: number;
  title: string;
  content: string;
  children: TreeNode[];
  collapsed: boolean;
}

