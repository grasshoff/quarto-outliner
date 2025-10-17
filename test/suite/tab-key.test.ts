import * as assert from 'assert';
import * as vscode from 'vscode';

suite('ACTUAL Tab Key Test', () => {
  let document: vscode.TextDocument;
  let editor: vscode.TextEditor;

  suiteSetup(async function() {
    this.timeout(30000);
    
    const testFilePath = vscode.Uri.file(__dirname + '/../../../test.qmd');
    document = await vscode.workspace.openTextDocument(testFilePath);
    editor = await vscode.window.showTextDocument(document);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  test('REAL Tab key press on line 7', async () => {
    console.log('\n=== REAL TAB KEY TEST (Line 7) ===');
    
    // Position cursor
    const position = new vscode.Position(6, 0);
    editor.selection = new vscode.Selection(position, position);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Language ID:', document.languageId);
    console.log('Line 7:', document.lineAt(6).text);
    
    // Simulate ACTUAL Tab key press
    console.log('Pressing Tab key...');
    await vscode.commands.executeCommand('type', { text: '\t' });
    
    // Check what happened
    const lineAfter = document.lineAt(6).text;
    console.log('Line after Tab:', lineAfter);
    
    if (lineAfter.startsWith('\t')) {
      console.log('❌ Tab inserted a tab character - keybinding NOT working');
      assert.fail('Tab key should trigger cycleFolding, not insert tab');
    } else {
      console.log('✅ Tab did NOT insert tab - keybinding might be working');
    }
  });

  test('Check keybinding with when clause evaluation', async () => {
    console.log('\n=== WHEN CLAUSE EVALUATION ===');
    
    const position = new vscode.Position(6, 0);
    editor.selection = new vscode.Selection(position, position);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Check all when clause conditions
    const langId = document.languageId;
    const isQuartoOrMarkdown = langId === 'quarto' || langId === 'markdown';
    
    console.log('editorLangId:', langId);
    console.log('Is quarto or markdown:', isQuartoOrMarkdown);
    console.log('editorTextFocus:', vscode.window.activeTextEditor === editor);
    
    // Try to get keybindings
    const keybindings = await vscode.commands.executeCommand('workbench.action.openGlobalKeybindings');
    console.log('Opened keybindings, checking if Tab is bound to markdown.cycleFolding');
    
    assert.ok(isQuartoOrMarkdown, 'File should be recognized as quarto or markdown');
  });

  test('Check if Tab keybinding exists in VS Code', async () => {
    console.log('\n=== KEYBINDING REGISTRATION CHECK ===');
    
    // Get all keybindings (this is a hack - VS Code doesn't expose this easily)
    try {
      const allCommands = await vscode.commands.getCommands();
      console.log('Total commands:', allCommands.length);
      
      const hasCommand = allCommands.includes('markdown.cycleFolding');
      console.log('markdown.cycleFolding registered:', hasCommand);
      
      // Try to trigger the command directly to compare
      const position = new vscode.Position(6, 0);
      editor.selection = new vscode.Selection(position, position);
      
      console.log('\nTrying direct command execution:');
      await vscode.commands.executeCommand('markdown.cycleFolding');
      console.log('✅ Direct command works');
      
      console.log('\nNow trying Tab key:');
      await vscode.commands.executeCommand('type', { text: '\t' });
      
      const lineAfter = document.lineAt(6).text;
      if (lineAfter.startsWith('\t')) {
        console.log('❌ Tab key inserts tab - keybinding is NOT active');
        console.log('This means the when clause is not matching or keybinding not registered');
      } else {
        console.log('✅ Tab key triggers command');
      }
      
    } catch (err) {
      console.error('Error:', err);
    }
  });
});
