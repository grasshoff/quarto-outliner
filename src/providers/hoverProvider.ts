import * as vscode from 'vscode';

export class OrgHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const line = document.lineAt(position.line);
    const text = line.text;

    // Hover for timestamps
    const timestampMatch = text.match(/<(\d{4}-\d{2}-\d{2})( [A-Za-z]{3})?( \d{2}:\d{2})?( [\+\.]{1,2}\d+[hdwmy])?( -?-?\d+[hdwmy])?>/);
    if (timestampMatch) {
      const date = new Date(timestampMatch[1]);
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**Org Timestamp**\n\n`);
      markdown.appendMarkdown(`Date: ${date.toLocaleDateString()}\n\n`);
      
      if (timestampMatch[3]) {
        markdown.appendMarkdown(`Time: ${timestampMatch[3].trim()}\n\n`);
      }
      if (timestampMatch[4]) {
        markdown.appendMarkdown(`Repeater: ${timestampMatch[4].trim()}\n\n`);
      }
      if (timestampMatch[5]) {
        markdown.appendMarkdown(`Delay: ${timestampMatch[5].trim()}\n\n`);
      }
      
      return new vscode.Hover(markdown);
    }

    // Hover for TODO keywords
    const todoMatch = text.match(/^\*+\s+(TODO|DONE|NEXT|WAITING|HOLD|CANCELLED|CANCELED)/);
    if (todoMatch) {
      const keyword = todoMatch[1];
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**TODO Keyword: ${keyword}**\n\n`);
      
      const descriptions: Record<string, string> = {
        'TODO': 'Task that needs to be done',
        'DONE': 'Completed task',
        'NEXT': 'Next action to take',
        'WAITING': 'Waiting for someone or something',
        'HOLD': 'Task on hold',
        'CANCELLED': 'Cancelled task',
        'CANCELED': 'Canceled task'
      };
      
      if (descriptions[keyword]) {
        markdown.appendMarkdown(descriptions[keyword]);
      }
      
      return new vscode.Hover(markdown);
    }

    // Hover for priorities
    const priorityMatch = text.match(/\[#([A-Z])\]/);
    if (priorityMatch) {
      const priority = priorityMatch[1];
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**Priority: ${priority}**\n\n`);
      
      const levels: Record<string, string> = {
        'A': 'Highest priority',
        'B': 'Medium priority',
        'C': 'Low priority'
      };
      
      if (levels[priority]) {
        markdown.appendMarkdown(levels[priority]);
      }
      
      return new vscode.Hover(markdown);
    }

    // Hover for links
    const linkMatch = text.match(/\[\[([^\]]+)\](?:\[([^\]]+)\])?\]/);
    if (linkMatch) {
      const link = linkMatch[1];
      const description = linkMatch[2];
      
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**Org Link**\n\n`);
      markdown.appendMarkdown(`Target: \`${link}\`\n\n`);
      
      if (description) {
        markdown.appendMarkdown(`Description: ${description}\n\n`);
      }
      
      // Try to parse link type
      if (link.startsWith('http://') || link.startsWith('https://')) {
        markdown.appendMarkdown(`Type: External URL`);
      } else if (link.startsWith('file:')) {
        markdown.appendMarkdown(`Type: File link`);
      } else if (link.startsWith('id:')) {
        markdown.appendMarkdown(`Type: ID link`);
      } else {
        markdown.appendMarkdown(`Type: Internal link`);
      }
      
      return new vscode.Hover(markdown);
    }

    // Hover for tags
    const tagsMatch = text.match(/:([^\s:]+(?::[^\s:]+)*):$/);
    if (tagsMatch) {
      const tags = tagsMatch[1].split(':');
      const markdown = new vscode.MarkdownString();
      markdown.appendMarkdown(`**Tags**\n\n`);
      
      for (const tag of tags) {
        markdown.appendMarkdown(`- ${tag}\n`);
      }
      
      return new vscode.Hover(markdown);
    }

    return null;
  }
}

