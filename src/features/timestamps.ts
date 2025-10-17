import * as vscode from 'vscode';

export class TimestampManager {
  async insertTimestamp(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const options: vscode.QuickPickItem[] = [
      { label: 'Active timestamp', description: 'Appears in agenda' },
      { label: 'Inactive timestamp', description: 'Does not appear in agenda' },
      { label: 'Scheduled', description: 'Schedule this task' },
      { label: 'Deadline', description: 'Set deadline for this task' }
    ];

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: 'Select timestamp type'
    });

    if (!selected) {
      return;
    }

    const date = await this.selectDate();
    if (!date) {
      return;
    }

    let timestamp: string;
    
    switch (selected.label) {
      case 'Active timestamp':
        timestamp = this.formatActiveTimestamp(date);
        break;
      case 'Inactive timestamp':
        timestamp = this.formatInactiveTimestamp(date);
        break;
      case 'Scheduled':
        timestamp = `SCHEDULED: ${this.formatActiveTimestamp(date)}`;
        break;
      case 'Deadline':
        timestamp = `DEADLINE: ${this.formatActiveTimestamp(date)}`;
        break;
      default:
        return;
    }

    await editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, timestamp);
    });
  }

  private async selectDate(): Promise<Date | null> {
    const dateString = await vscode.window.showInputBox({
      prompt: 'Enter date (YYYY-MM-DD) or leave empty for today',
      placeHolder: '2024-01-15'
    });

    if (dateString === undefined) {
      return null;
    }

    if (!dateString) {
      return new Date();
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      vscode.window.showErrorMessage('Invalid date format');
      return null;
    }

    return date;
  }

  formatActiveTimestamp(date: Date, includeTime: boolean = false): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `<${year}-${month}-${day} ${dayName} ${hours}:${minutes}>`;
    }
    
    return `<${year}-${month}-${day} ${dayName}>`;
  }

  formatInactiveTimestamp(date: Date, includeTime: boolean = false): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `[${year}-${month}-${day} ${dayName} ${hours}:${minutes}]`;
    }
    
    return `[${year}-${month}-${day} ${dayName}]`;
  }

  parseTimestamp(timestamp: string): Date | null {
    const match = timestamp.match(/[<\[](\d{4}-\d{2}-\d{2})/);
    if (!match) {
      return null;
    }

    const date = new Date(match[1]);
    if (isNaN(date.getTime())) {
      return null;
    }

    const timeMatch = timestamp.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      date.setHours(parseInt(timeMatch[1]));
      date.setMinutes(parseInt(timeMatch[2]));
    }

    return date;
  }

  isActiveTimestamp(timestamp: string): boolean {
    return timestamp.startsWith('<') && timestamp.endsWith('>');
  }

  isInactiveTimestamp(timestamp: string): boolean {
    return timestamp.startsWith('[') && timestamp.endsWith(']');
  }
}

