import * as vscode from 'vscode';
import { OrgParser, NodeType, OrgNode, HeadlineNode } from '../parser/orgParser';

export class OrgDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const text = document.getText();
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    const symbols: vscode.DocumentSymbol[] = [];
    this.collectSymbols(ast, document, symbols);
    
    return symbols;
  }

  private collectSymbols(
    node: OrgNode,
    document: vscode.TextDocument,
    symbols: vscode.DocumentSymbol[]
  ): void {
    if (node.type === NodeType.Headline) {
      const headline = node as HeadlineNode;
      const startLine = (headline.line ?? 1) - 1;
      const startPos = new vscode.Position(startLine, 0);
      
      let endLine = startLine;
      const lastChild = this.findLastNode(headline);
      if (lastChild && lastChild.line) {
        endLine = lastChild.line - 1;
      }
      const endPos = new vscode.Position(endLine, document.lineAt(endLine).text.length);
      
      const range = new vscode.Range(startPos, endPos);
      const selectionRange = new vscode.Range(startPos, startPos);
      
      let name = headline.title;
      if (headline.todo) {
        name = `${headline.todo} ${name}`;
      }
      if (headline.priority) {
        name = `${headline.priority} ${name}`;
      }
      if (headline.tags && headline.tags.length > 0) {
        name = `${name} :${headline.tags.join(':')}:`;
      }
      
      const symbol = new vscode.DocumentSymbol(
        name,
        '',
        this.getSymbolKind(headline),
        range,
        selectionRange
      );
      
      if (headline.children) {
        const childSymbols: vscode.DocumentSymbol[] = [];
        for (const child of headline.children) {
          this.collectSymbols(child, document, childSymbols);
        }
        symbol.children = childSymbols;
      }
      
      symbols.push(symbol);
    }

    if (node.type === NodeType.Document && node.children) {
      for (const child of node.children) {
        this.collectSymbols(child, document, symbols);
      }
    }
  }

  private getSymbolKind(headline: HeadlineNode): vscode.SymbolKind {
    if (headline.todo) {
      return headline.todo === 'DONE' ? vscode.SymbolKind.Event : vscode.SymbolKind.Function;
    }
    return vscode.SymbolKind.Namespace;
  }

  private findLastNode(node: OrgNode): OrgNode | null {
    if (!node.children || node.children.length === 0) {
      return node;
    }
    
    const lastChild = node.children[node.children.length - 1];
    return this.findLastNode(lastChild);
  }
}

