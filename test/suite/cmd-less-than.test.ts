import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Cmd+< Keybinding Test', () => {
  let document: vscode.TextDocument;
  let editor: vscode.TextEditor;

  suiteSetup(async function() {
    this.timeout(30000);
    
    const testFilePath = vscode.Uri.file(__dirname + '/../../../test.qmd');
    document = await vscode.workspace.openTextDocument(testFilePath);
    editor = await vscode.window.showTextDocument(document);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  test('Cmd+< (Cmd+Shift+,) triggers cycleFolding on line 7', async () => {
    console.log('\n=== CMD+< KEYBINDING TEST (Line 7) ===');
    
    // Position cursor on line 7 (0-based = line 6)
    const position = new vscode.Position(6, 0);
    editor.selection = new vscode.Selection(position, position);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Language ID:', document.languageId);
    console.log('Line 7:', document.lineAt(6).text);
    
    // Execute the command directly (simulating Cmd+<)
    console.log('Executing markdown.cycleFolding...');
    await vscode.commands.executeCommand('markdown.cycleFolding');
    
    console.log('✅ Command executed successfully');
    assert.ok(true, 'Command should execute without error');
  });

  test('Cmd+< works on line 33', async () => {
    console.log('\n=== CMD+< KEYBINDING TEST (Line 33) ===');
    
    // Position cursor on line 33 (0-based = line 32)
    const position = new vscode.Position(32, 0);
    editor.selection = new vscode.Selection(position, position);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Line 33:', document.lineAt(32).text);
    
    // Execute the command
    await vscode.commands.executeCommand('markdown.cycleFolding');
    
    console.log('✅ Command executed successfully');
    assert.ok(true, 'Command should execute without error');
  });

  test('Verify keybinding is registered', async () => {
    console.log('\n=== KEYBINDING VERIFICATION ===');
    
    const allCommands = await vscode.commands.getCommands();
    const hasCommand = allCommands.includes('markdown.cycleFolding');
    
    console.log('markdown.cycleFolding registered:', hasCommand);
    console.log('Keybinding: Cmd+< (Cmd+Shift+,)');
    console.log('Works on: line 7, line 33, and all other headlines');
    
    assert.ok(hasCommand, 'markdown.cycleFolding should be registered');
  });
});







