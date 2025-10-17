/// <reference types="mocha" />

import * as assert from 'assert';
import { OrgParser, NodeType } from '../../src/parser/orgParser';
import { OrgTokenizer, TokenType } from '../../src/parser/orgTokenizer';

suite('Org Parser Test Suite', () => {
  test('Parse simple headline', () => {
    const text = '* Hello World';
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    assert.strictEqual(ast.type, NodeType.Document);
    assert.strictEqual(ast.children?.length, 1);
    assert.strictEqual(ast.children?.[0].type, NodeType.Headline);
  });

  test('Parse TODO keyword', () => {
    const text = '* TODO Task';
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    const headline: any = ast.children?.[0];
    assert.strictEqual(headline.todo, 'TODO');
    assert.strictEqual(headline.title, 'Task');
  });

  test('Parse priority', () => {
    const text = '* TODO [#A] High priority';
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    const headline: any = ast.children?.[0];
    assert.strictEqual(headline.priority, '[#A]');
  });

  test('Parse tags', () => {
    const text = '* Headline :tag1:tag2:';
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    const headline: any = ast.children?.[0];
    assert.deepStrictEqual(headline.tags, ['tag1', 'tag2']);
  });

  test('Parse nested headlines', () => {
    const text = `* Level 1
** Level 2
*** Level 3`;
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    assert.strictEqual(ast.children?.length, 1);
    const level1: any = ast.children?.[0];
    assert.strictEqual(level1.level, 1);
    assert.strictEqual(level1.children?.length, 1);
    
    const level2: any = level1.children?.[0];
    assert.strictEqual(level2.level, 2);
  });

  test('Parse code block', () => {
    const text = `#+BEGIN_SRC python
print("hello")
#+END_SRC`;
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    const codeBlock: any = ast.children?.[0];
    assert.strictEqual(codeBlock.type, NodeType.CodeBlock);
    assert.strictEqual(codeBlock.language, 'python');
    assert.strictEqual(codeBlock.content, 'print("hello")');
  });

  test('Tokenize headline', () => {
    const text = '* TODO [#A] Task :tag:';
    const tokenizer = new OrgTokenizer(text);
    const tokens = tokenizer.tokenize();
    
    assert.strictEqual(tokens[0].type, TokenType.Headline);
    assert.strictEqual(tokens[0].level, 1);
  });

  test('Tokenize list', () => {
    const text = '- Item 1\n- Item 2';
    const tokenizer = new OrgTokenizer(text);
    const tokens = tokenizer.tokenize();
    
    const listTokens = tokens.filter(t => t.type === TokenType.List);
    assert.strictEqual(listTokens.length, 2);
  });

  test('Parse table', () => {
    const text = `| A | B |
|---+---|
| 1 | 2 |`;
    const parser = new OrgParser(text);
    const ast = parser.parse();
    
    const table: any = ast.children?.[0];
    assert.strictEqual(table.type, NodeType.Table);
    assert.strictEqual(table.children?.length, 3);
  });
});

