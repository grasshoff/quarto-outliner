import * as vscode from 'vscode';
import { OrgParser, NodeType, OrgNode, HeadlineNode } from '../parser/orgParser';

export class OrgFoldingProvider implements vscode.FoldingRangeProvider {
  provideFoldingRanges(
    document: vscode.TextDocument,
    context: vscode.FoldingContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.FoldingRange[]> {
    const text = document.getText();
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    const ranges: vscode.FoldingRange[] = [];
    this.collectFoldingRanges(ast, document, ranges);
    
    return ranges;
  }

  private collectFoldingRanges(
    node: OrgNode,
    document: vscode.TextDocument,
    ranges: vscode.FoldingRange[]
  ): void {
    if (node.type === NodeType.Headline) {
      const headline = node as HeadlineNode;
      const startLine = (headline.line ?? 1) - 1;
      
      // Find the end line of this headline's content
      let endLine = startLine;
      if (headline.children && headline.children.length > 0) {
        const lastChild = this.findLastNode(headline);
        if (lastChild && lastChild.line) {
          endLine = lastChild.line - 1;
        }
      }
      
      if (endLine > startLine) {
        ranges.push(new vscode.FoldingRange(
          startLine,
          endLine,
          vscode.FoldingRangeKind.Region
        ));
      }
    }

    if (node.type === NodeType.CodeBlock) {
      const startLine = (node.line ?? 1) - 1;
      const content = node.properties?.content || '';
      const lines = content.split('\n').length;
      const endLine = startLine + lines + 1;
      
      ranges.push(new vscode.FoldingRange(
        startLine,
        endLine,
        vscode.FoldingRangeKind.Region
      ));
    }

    if (node.type === NodeType.Drawer) {
      const startLine = (node.line ?? 1) - 1;
      if (node.children && node.children.length > 0) {
        const lastChild = node.children[node.children.length - 1];
        if (lastChild.line) {
          ranges.push(new vscode.FoldingRange(
            startLine,
            lastChild.line - 1,
            vscode.FoldingRangeKind.Region
          ));
        }
      }
    }

    if (node.children) {
      for (const child of node.children) {
        this.collectFoldingRanges(child, document, ranges);
      }
    }
  }

  private findLastNode(node: OrgNode): OrgNode | null {
    if (!node.children || node.children.length === 0) {
      return node;
    }
    
    const lastChild = node.children[node.children.length - 1];
    return this.findLastNode(lastChild);
  }
}

