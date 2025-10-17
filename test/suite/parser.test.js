"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const orgParser_1 = require("../../src/parser/orgParser");
const orgTokenizer_1 = require("../../src/parser/orgTokenizer");
suite('Org Parser Test Suite', () => {
    test('Parse simple headline', () => {
        const text = '* Hello World';
        const parser = new orgParser_1.OrgParser(text);
        const ast = parser.parse();
        assert.strictEqual(ast.type, orgParser_1.NodeType.Document);
        assert.strictEqual(ast.children?.length, 1);
        assert.strictEqual(ast.children?.[0].type, orgParser_1.NodeType.Headline);
    });
    test('Parse TODO keyword', () => {
        const text = '* TODO Task';
        const parser = new orgParser_1.OrgParser(text);
        const ast = parser.parse();
        const headline = ast.children?.[0];
        assert.strictEqual(headline.todo, 'TODO');
        assert.strictEqual(headline.title, 'Task');
    });
    test('Parse priority', () => {
        const text = '* TODO [#A] High priority';
        const parser = new orgParser_1.OrgParser(text);
        const ast = parser.parse();
        const headline = ast.children?.[0];
        assert.strictEqual(headline.priority, '[#A]');
    });
    test('Parse tags', () => {
        const text = '* Headline :tag1:tag2:';
        const parser = new orgParser_1.OrgParser(text);
        const ast = parser.parse();
        const headline = ast.children?.[0];
        assert.deepStrictEqual(headline.tags, ['tag1', 'tag2']);
    });
    test('Parse nested headlines', () => {
        const text = `* Level 1
** Level 2
*** Level 3`;
        const parser = new orgParser_1.OrgParser(text);
        const ast = parser.parse();
        assert.strictEqual(ast.children?.length, 1);
        const level1 = ast.children?.[0];
        assert.strictEqual(level1.level, 1);
        assert.strictEqual(level1.children?.length, 1);
        const level2 = level1.children?.[0];
        assert.strictEqual(level2.level, 2);
    });
    test('Parse code block', () => {
        const text = `#+BEGIN_SRC python
print("hello")
#+END_SRC`;
        const parser = new orgParser_1.OrgParser(text);
        const ast = parser.parse();
        const codeBlock = ast.children?.[0];
        assert.strictEqual(codeBlock.type, orgParser_1.NodeType.CodeBlock);
        assert.strictEqual(codeBlock.language, 'python');
        assert.strictEqual(codeBlock.content, 'print("hello")');
    });
    test('Tokenize headline', () => {
        const text = '* TODO [#A] Task :tag:';
        const tokenizer = new orgTokenizer_1.OrgTokenizer(text);
        const tokens = tokenizer.tokenize();
        assert.strictEqual(tokens[0].type, orgTokenizer_1.TokenType.Headline);
        assert.strictEqual(tokens[0].level, 1);
    });
    test('Tokenize list', () => {
        const text = '- Item 1\n- Item 2';
        const tokenizer = new orgTokenizer_1.OrgTokenizer(text);
        const tokens = tokenizer.tokenize();
        const listTokens = tokens.filter(t => t.type === orgTokenizer_1.TokenType.List);
        assert.strictEqual(listTokens.length, 2);
    });
    test('Parse table', () => {
        const text = `| A | B |
|---+---|
| 1 | 2 |`;
        const parser = new orgParser_1.OrgParser(text);
        const ast = parser.parse();
        const table = ast.children?.[0];
        assert.strictEqual(table.type, orgParser_1.NodeType.Table);
        assert.strictEqual(table.children?.length, 3);
    });
});
//# sourceMappingURL=parser.test.js.map