import * as vscode from 'vscode';

export class ConfigManager {
  static getTodoKeywords(): string[] {
    const config = vscode.workspace.getConfiguration('org');
    return config.get<string[]>('todoKeywords', ['TODO', 'DONE']);
  }

  static getAgendaFiles(): string[] {
    const config = vscode.workspace.getConfiguration('org');
    return config.get<string[]>('agendaFiles', []);
  }

  static getCaptureTemplates(): any[] {
    const config = vscode.workspace.getConfiguration('org');
    return config.get<any[]>('captureTemplates', []);
  }

  static getArchiveLocation(): string {
    const config = vscode.workspace.getConfiguration('org');
    return config.get<string>('archiveLocation', '%s_archive::');
  }

  static async updateTodoKeywords(keywords: string[]): Promise<void> {
    const config = vscode.workspace.getConfiguration('org');
    await config.update('todoKeywords', keywords, vscode.ConfigurationTarget.Global);
  }

  static async updateAgendaFiles(files: string[]): Promise<void> {
    const config = vscode.workspace.getConfiguration('org');
    await config.update('agendaFiles', files, vscode.ConfigurationTarget.Global);
  }

  static async addAgendaFile(file: string): Promise<void> {
    const files = this.getAgendaFiles();
    if (!files.includes(file)) {
      files.push(file);
      await this.updateAgendaFiles(files);
    }
  }

  static async removeAgendaFile(file: string): Promise<void> {
    const files = this.getAgendaFiles();
    const index = files.indexOf(file);
    if (index !== -1) {
      files.splice(index, 1);
      await this.updateAgendaFiles(files);
    }
  }
}

