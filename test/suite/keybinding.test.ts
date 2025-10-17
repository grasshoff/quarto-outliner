import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Keybinding Diagnostics', () => {
  let document: vscode.TextDocument;
  let editor: vscode.TextEditor;

  suiteSetup(async function() {
    this.timeout(30000);
    
    // Open test.qmd
    const testFilePath = vscode.Uri.file(__dirname + '/../../../test.qmd');
    document = await vscode.workspace.openTextDocument(testFilePath);
    editor = await vscode.window.showTextDocument(document);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  test('Check language ID for test.qmd', async () => {
    console.log('\n=== LANGUAGE ID TEST ===');
    const langId = document.languageId;
    console.log('Language ID:', langId);
    console.log('File name:', document.fileName);
    console.log('Expected: "quarto" or "markdown"');
    
    assert.ok(langId === 'quarto' || langId === 'markdown', 
      `Language ID should be 'quarto' or 'markdown', but got: ${langId}`);
  });

  test('Check if markdown.cycleFolding command is registered', async () => {
    console.log('\n=== COMMAND REGISTRATION TEST ===');
    const allCommands = await vscode.commands.getCommands();
    const hasCommand = allCommands.includes('markdown.cycleFolding');
    
    console.log('Command "markdown.cycleFolding" registered:', hasCommand);
    
    if (hasCommand) {
      console.log('✅ Command is registered');
    } else {
      console.log('❌ Command is NOT registered');
      console.log('Available markdown commands:', 
        allCommands.filter(c => c.startsWith('markdown.')).slice(0, 20));
    }
    
    assert.ok(hasCommand, 'markdown.cycleFolding should be registered');
  });

  test('Execute markdown.cycleFolding command directly on line 7', async () => {
    console.log('\n=== DIRECT COMMAND EXECUTION TEST (Line 7) ===');
    
    // Position cursor on line 7 (0-based = line 6)
    const position = new vscode.Position(6, 0);
    editor.selection = new vscode.Selection(position, position);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Cursor positioned at line 7');
    console.log('Line content:', document.lineAt(6).text);
    
    try {
      await vscode.commands.executeCommand('markdown.cycleFolding');
      console.log('✅ Command executed successfully on line 7');
      assert.ok(true, 'Command should execute without error');
    } catch (err) {
      console.error('❌ Command execution failed:', err);
      assert.fail('Command execution should not throw error');
    }
  });

  test('Execute markdown.cycleFolding command directly on line 33', async () => {
    console.log('\n=== DIRECT COMMAND EXECUTION TEST (Line 33) ===');
    
    // Position cursor on line 33 (0-based = line 32)
    const position = new vscode.Position(32, 0);
    editor.selection = new vscode.Selection(position, position);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Cursor positioned at line 33');
    console.log('Line content:', document.lineAt(32).text);
    
    try {
      await vscode.commands.executeCommand('markdown.cycleFolding');
      console.log('✅ Command executed successfully on line 33');
      assert.ok(true, 'Command should execute without error');
    } catch (err) {
      console.error('❌ Command execution failed:', err);
      assert.fail('Command execution should not throw error');
    }
  });

  test('Check extension activation', async () => {
    console.log('\n=== EXTENSION ACTIVATION TEST ===');
    
    const ext = vscode.extensions.getExtension('quarto-outliner.quarto-outliner');
    if (ext) {
      console.log('Extension found:', ext.id);
      console.log('Extension active:', ext.isActive);
      
      if (!ext.isActive) {
        console.log('Activating extension...');
        await ext.activate();
        console.log('Extension activated');
      }
      
      assert.ok(ext.isActive, 'Extension should be active');
    } else {
      console.log('❌ Extension not found');
      assert.fail('Extension should be installed');
    }
  });
});
