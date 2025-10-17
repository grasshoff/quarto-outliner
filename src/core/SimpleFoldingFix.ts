/**
 * Simple fix for the folding issue
 * The problem: VSCode's fold commands don't work reliably on certain lines
 * The solution: Use selection-based folding
 */

import * as vscode from 'vscode';

export async function foldAtLine(lineNumber: number): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return false;

  const document = editor.document;
  
  // Find the end of this section
  const headlineMatch = document.lineAt(lineNumber).text.match(/^(#+)\s/);
  if (!headlineMatch) return false;
  
  const level = headlineMatch[1].length;
  let endLine = lineNumber;
  
  // Find where this section ends
  for (let i = lineNumber + 1; i < document.lineCount; i++) {
    const line = document.lineAt(i).text;
    const match = line.match(/^(#+)\s/);
    
    if (match && match[1].length <= level) {
      endLine = i - 1;
      break;
    }
    
    if (i === document.lineCount - 1) {
      endLine = i;
    }
  }
  
  if (endLine <= lineNumber) return false;
  
  console.log(`[SimpleFold] Folding lines ${lineNumber + 1} to ${endLine + 1}`);
  
  // Create a selection from headline to end of section
  const startPos = new vscode.Position(lineNumber, 0);
  const endPos = new vscode.Position(endLine, document.lineAt(endLine).text.length);
  
  // Select the range
  editor.selection = new vscode.Selection(startPos, endPos);
  
  // Use fold command on selection
  await vscode.commands.executeCommand('editor.fold');
  
  // Reset selection to just the headline
  editor.selection = new vscode.Selection(startPos, startPos);
  
  return true;
}

export async function unfoldAtLine(lineNumber: number): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return false;

  console.log(`[SimpleFold] Unfolding at line ${lineNumber + 1}`);
  
  // Position cursor at the line
  const position = new vscode.Position(lineNumber, 0);
  editor.selection = new vscode.Selection(position, position);
  
  // Use unfold command
  await vscode.commands.executeCommand('editor.unfold');
  
  return true;
}

export async function toggleFoldAtLine(lineNumber: number): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return false;

  console.log(`[SimpleFold] Toggle folding at line ${lineNumber + 1}`);
  
  // Position cursor at the line
  const position = new vscode.Position(lineNumber, 0);
  editor.selection = new vscode.Selection(position, position);
  editor.revealRange(new vscode.Range(position, position));
  
  // Use toggle fold command - this is the most reliable
  await vscode.commands.executeCommand('editor.toggleFold');
  
  return true;
}


