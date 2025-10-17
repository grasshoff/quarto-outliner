import * as vscode from 'vscode';
import * as fs from 'fs';
import { OrgParser, NodeType, HeadlineNode } from '../parser/orgParser';
import { TimestampManager } from './timestamps';

export interface AgendaItem {
  file: string;
  line: number;
  headline: string;
  todo?: string;
  priority?: string;
  tags?: string[];
  scheduled?: Date;
  deadline?: Date;
  closed?: Date;
}

export class AgendaManager {
  private timestampManager: TimestampManager;

  constructor() {
    this.timestampManager = new TimestampManager();
  }

  async showAgenda(): Promise<void> {
    const config = vscode.workspace.getConfiguration('org');
    const agendaFiles = config.get<string[]>('agendaFiles', []);

    if (agendaFiles.length === 0) {
      const action = await vscode.window.showInformationMessage(
        'No agenda files configured',
        'Add Current File',
        'Configure'
      );

      if (action === 'Add Current File') {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'org') {
          await this.addAgendaFile(editor.document.uri.fsPath);
          return this.showAgenda();
        }
      } else if (action === 'Configure') {
        vscode.commands.executeCommand('workbench.action.openSettings', 'org.agendaFiles');
      }
      return;
    }

    const items = await this.collectAgendaItems(agendaFiles);
    
    const viewType = await vscode.window.showQuickPick([
      { label: 'Day Agenda', value: 'day' },
      { label: 'Week Agenda', value: 'week' },
      { label: 'All TODOs', value: 'todo' },
      { label: 'Search', value: 'search' }
    ], {
      placeHolder: 'Select agenda view'
    });

    if (!viewType) {
      return;
    }

    switch (viewType.value) {
      case 'day':
        await this.showDayAgenda(items);
        break;
      case 'week':
        await this.showWeekAgenda(items);
        break;
      case 'todo':
        await this.showTodoList(items);
        break;
      case 'search':
        await this.showSearchAgenda(items);
        break;
    }
  }

  private async collectAgendaItems(files: string[]): Promise<AgendaItem[]> {
    const items: AgendaItem[] = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const parser = new OrgParser(content);
        const ast = parser.parse();
        
        this.collectItemsFromNode(ast, file, items);
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }

    return items;
  }

  private collectItemsFromNode(node: any, file: string, items: AgendaItem[]): void {
    if (node.type === NodeType.Headline) {
      const headline = node as HeadlineNode;
      
      const item: AgendaItem = {
        file,
        line: headline.line || 0,
        headline: headline.title,
        todo: headline.todo,
        priority: headline.priority,
        tags: headline.tags
      };

      if (headline.scheduled) {
        item.scheduled = this.timestampManager.parseTimestamp(headline.scheduled) || undefined;
      }
      if (headline.deadline) {
        item.deadline = this.timestampManager.parseTimestamp(headline.deadline) || undefined;
      }
      if (headline.closed) {
        item.closed = this.timestampManager.parseTimestamp(headline.closed) || undefined;
      }

      if (item.todo || item.scheduled || item.deadline) {
        items.push(item);
      }
    }

    if (node.children) {
      for (const child of node.children) {
        this.collectItemsFromNode(child, file, items);
      }
    }
  }

  private async showDayAgenda(items: AgendaItem[]): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayItems = items.filter(item => {
      if (item.scheduled) {
        const scheduled = new Date(item.scheduled);
        scheduled.setHours(0, 0, 0, 0);
        if (scheduled.getTime() === today.getTime()) {
          return true;
        }
      }
      if (item.deadline) {
        const deadline = new Date(item.deadline);
        deadline.setHours(0, 0, 0, 0);
        if (deadline.getTime() === today.getTime()) {
          return true;
        }
      }
      return false;
    });

    await this.displayAgendaItems(todayItems, 'Today\'s Agenda');
  }

  private async showWeekAgenda(items: AgendaItem[]): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekItems = items.filter(item => {
      if (item.scheduled) {
        const scheduled = new Date(item.scheduled);
        scheduled.setHours(0, 0, 0, 0);
        if (scheduled >= today && scheduled < weekEnd) {
          return true;
        }
      }
      if (item.deadline) {
        const deadline = new Date(item.deadline);
        deadline.setHours(0, 0, 0, 0);
        if (deadline >= today && deadline < weekEnd) {
          return true;
        }
      }
      return false;
    });

    await this.displayAgendaItems(weekItems, 'Week Agenda');
  }

  private async showTodoList(items: AgendaItem[]): Promise<void> {
    const todoItems = items.filter(item => 
      item.todo && item.todo !== 'DONE' && item.todo !== 'CANCELLED' && item.todo !== 'CANCELED'
    );

    await this.displayAgendaItems(todoItems, 'All TODOs');
  }

  private async showSearchAgenda(items: AgendaItem[]): Promise<void> {
    const query = await vscode.window.showInputBox({
      prompt: 'Enter search query',
      placeHolder: 'Search in headlines and tags'
    });

    if (!query) {
      return;
    }

    const searchItems = items.filter(item => {
      const searchText = query.toLowerCase();
      
      if (item.headline.toLowerCase().includes(searchText)) {
        return true;
      }
      
      if (item.tags) {
        for (const tag of item.tags) {
          if (tag.toLowerCase().includes(searchText)) {
            return true;
          }
        }
      }
      
      return false;
    });

    await this.displayAgendaItems(searchItems, `Search: ${query}`);
  }

  private async displayAgendaItems(items: AgendaItem[], title: string): Promise<void> {
    const quickPickItems = items.map(item => {
      let label = item.headline;
      
      if (item.todo) {
        label = `${item.todo} ${label}`;
      }
      
      if (item.priority) {
        label = `${item.priority} ${label}`;
      }

      let description = '';
      if (item.scheduled) {
        description += `Scheduled: ${item.scheduled.toLocaleDateString()} `;
      }
      if (item.deadline) {
        description += `Deadline: ${item.deadline.toLocaleDateString()} `;
      }

      let detail = item.file;
      if (item.tags && item.tags.length > 0) {
        detail += ` :${item.tags.join(':')}:`;
      }

      return {
        label,
        description,
        detail,
        item
      };
    });

    if (quickPickItems.length === 0) {
      vscode.window.showInformationMessage(`No items found for ${title}`);
      return;
    }

    const selected = await vscode.window.showQuickPick(quickPickItems, {
      placeHolder: title,
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selected) {
      await this.openAgendaItem(selected.item);
    }
  }

  private async openAgendaItem(item: AgendaItem): Promise<void> {
    const uri = vscode.Uri.file(item.file);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    
    const position = new vscode.Position(Math.max(0, item.line - 1), 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
  }

  private async addAgendaFile(filePath: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('org');
    const agendaFiles = config.get<string[]>('agendaFiles', []);
    
    if (!agendaFiles.includes(filePath)) {
      agendaFiles.push(filePath);
      await config.update('agendaFiles', agendaFiles, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Added ${filePath} to agenda files`);
    }
  }
}

