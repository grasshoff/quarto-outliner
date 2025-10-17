import * as vscode from 'vscode';

export class MarkdownFoldingProvider implements vscode.FoldingRangeProvider {
  provideFoldingRanges(
    document: vscode.TextDocument,
    context: vscode.FoldingContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.FoldingRange[]> {
    const ranges: vscode.FoldingRange[] = [];
    
    // Skip YAML frontmatter
    let yamlEnd = -1;
    if (document.lineAt(0).text.trim() === '---') {
      for (let i = 1; i < document.lineCount; i++) {
        if (document.lineAt(i).text.trim() === '---') {
          yamlEnd = i;
          // Don't add folding range for YAML - it conflicts with first headline
          // ranges.push(new vscode.FoldingRange(0, i, vscode.FoldingRangeKind.Region));
          break;
        }
      }
    }
    
    const headlines: { line: number; level: number }[] = [];
    
    // Find all headlines
    for (let i = yamlEnd + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const match = line.text.match(/^(#+)\s/);
      
      if (match) {
        const level = match[1].length;
        headlines.push({ line: i, level });
      }
    }
    
    // Create folding ranges for each headline
    for (let i = 0; i < headlines.length; i++) {
      const current = headlines[i];
      
      // Find the next headline at same or higher level
      let endLine = document.lineCount - 1;
      for (let j = i + 1; j < headlines.length; j++) {
        if (headlines[j].level <= current.level) {
          endLine = headlines[j].line - 1;
          break;
        }
      }
      
      // Always create range if endLine > current.line (there's something after this heading)
      if (endLine > current.line) {
        ranges.push(new vscode.FoldingRange(
          current.line,
          endLine,
          vscode.FoldingRangeKind.Region
        ));
      }
    }
    
    return ranges;
  }
}

