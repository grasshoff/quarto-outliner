import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TimestampManager } from './timestamps';

export interface CaptureTemplate {
  key: string;
  description: string;
  type: 'entry' | 'item' | 'checkitem' | 'table-line' | 'plain';
  target: string;
  template: string;
  headline?: string;
}

export class CaptureManager {
  private timestampManager: TimestampManager;

  constructor() {
    this.timestampManager = new TimestampManager();
  }

  async capture(): Promise<void> {
    const config = vscode.workspace.getConfiguration('org');
    const templates = config.get<CaptureTemplate[]>('captureTemplates', []);

    if (templates.length === 0) {
      await this.quickCapture();
      return;
    }

    const items = templates.map(template => ({
      label: `${template.key}: ${template.description}`,
      template
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select capture template'
    });

    if (!selected) {
      return;
    }

    await this.captureWithTemplate(selected.template);
  }

  private async quickCapture(): Promise<void> {
    const content = await vscode.window.showInputBox({
      prompt: 'Enter capture content',
      placeHolder: 'Quick note'
    });

    if (!content) {
      return;
    }

    const files = await vscode.workspace.findFiles('**/*.org');
    
    let targetFile: string;
    
    if (files.length === 0) {
      const newFile = await vscode.window.showSaveDialog({
        filters: { 'Org files': ['org'] },
        defaultUri: vscode.Uri.file('notes.org')
      });
      
      if (!newFile) {
        return;
      }
      
      targetFile = newFile.fsPath;
      fs.writeFileSync(targetFile, '');
    } else if (files.length === 1) {
      targetFile = files[0].fsPath;
    } else {
      const selected = await vscode.window.showQuickPick(
        files.map(f => ({ label: path.basename(f.fsPath), uri: f })),
        { placeHolder: 'Select target file' }
      );
      
      if (!selected) {
        return;
      }
      
      targetFile = selected.uri.fsPath;
    }

    const timestamp = this.timestampManager.formatInactiveTimestamp(new Date(), true);
    const entry = `\n* ${content}\n  ${timestamp}\n`;

    fs.appendFileSync(targetFile, entry);
    
    vscode.window.showInformationMessage(`Captured to ${path.basename(targetFile)}`);
  }

  private async captureWithTemplate(template: CaptureTemplate): Promise<void> {
    const content = await vscode.window.showInputBox({
      prompt: template.description,
      placeHolder: 'Enter content'
    });

    if (!content) {
      return;
    }

    const expandedTemplate = this.expandTemplate(template.template, content);
    
    await this.insertCapture(template.target, expandedTemplate, template.type, template.headline);
    
    vscode.window.showInformationMessage('Captured!');
  }

  private expandTemplate(template: string, content: string): string {
    const now = new Date();
    
    const replacements: Record<string, string> = {
      '%?': content,
      '%t': this.timestampManager.formatActiveTimestamp(now),
      '%T': this.timestampManager.formatActiveTimestamp(now, true),
      '%u': this.timestampManager.formatInactiveTimestamp(now),
      '%U': this.timestampManager.formatInactiveTimestamp(now, true),
      '%^{prompt}': content,
      '%a': '',
      '%i': content
    };

    let expanded = template;
    for (const [key, value] of Object.entries(replacements)) {
      expanded = expanded.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }

    return expanded;
  }

  private async insertCapture(
    target: string,
    content: string,
    type: string,
    headline?: string
  ): Promise<void> {
    const targetFile = this.resolveTarget(target);
    
    if (!targetFile) {
      vscode.window.showErrorMessage('Cannot resolve target file');
      return;
    }

    let fileContent = '';
    if (fs.existsSync(targetFile)) {
      fileContent = fs.readFileSync(targetFile, 'utf-8');
    }

    let insertPosition = fileContent.length;
    let prefix = '\n';
    let suffix = '\n';

    if (headline) {
      const lines = fileContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^\*+\s+(.+)$/);
        if (match && match[1].includes(headline)) {
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].match(/^\*+\s/)) {
              insertPosition = lines.slice(0, j).join('\n').length;
              break;
            }
          }
          break;
        }
      }
    }

    let formattedContent = content;
    
    switch (type) {
      case 'entry':
        if (!formattedContent.startsWith('*')) {
          formattedContent = `* ${formattedContent}`;
        }
        break;
      case 'item':
        if (!formattedContent.startsWith('-')) {
          formattedContent = `- ${formattedContent}`;
        }
        break;
      case 'checkitem':
        if (!formattedContent.startsWith('-')) {
          formattedContent = `- [ ] ${formattedContent}`;
        }
        break;
    }

    const newContent = 
      fileContent.substring(0, insertPosition) +
      prefix + formattedContent + suffix +
      fileContent.substring(insertPosition);

    fs.writeFileSync(targetFile, newContent);

    const uri = vscode.Uri.file(targetFile);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
  }

  private resolveTarget(target: string): string | null {
    if (path.isAbsolute(target)) {
      return target;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return null;
    }

    return path.join(workspaceFolders[0].uri.fsPath, target);
  }

  async addCaptureTemplate(): Promise<void> {
    const key = await vscode.window.showInputBox({
      prompt: 'Template key (single character)',
      validateInput: input => input.length === 1 ? null : 'Must be single character'
    });

    if (!key) {
      return;
    }

    const description = await vscode.window.showInputBox({
      prompt: 'Template description'
    });

    if (!description) {
      return;
    }

    const typeOptions = [
      { label: 'entry', description: 'Org mode headline' },
      { label: 'item', description: 'List item' },
      { label: 'checkitem', description: 'Checkbox item' },
      { label: 'plain', description: 'Plain text' }
    ];

    const selectedType = await vscode.window.showQuickPick(typeOptions, {
      placeHolder: 'Select template type'
    });

    if (!selectedType) {
      return;
    }

    const target = await vscode.window.showInputBox({
      prompt: 'Target file path',
      placeHolder: 'notes.org'
    });

    if (!target) {
      return;
    }

    const template = await vscode.window.showInputBox({
      prompt: 'Template content',
      placeHolder: '* %? %u'
    });

    if (!template) {
      return;
    }

    const config = vscode.workspace.getConfiguration('org');
    const templates = config.get<CaptureTemplate[]>('captureTemplates', []);
    
    templates.push({
      key,
      description,
      type: selectedType.label as any,
      target,
      template
    });

    await config.update('captureTemplates', templates, vscode.ConfigurationTarget.Global);
    
    vscode.window.showInformationMessage('Capture template added');
  }
}

