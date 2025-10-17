# Developer Guide - Quarto Outliner

Complete guide for developers who want to understand, extend, or contribute to the Quarto Outliner extension.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Organization](#code-organization)
3. [Key Components](#key-components)
4. [Folding System](#folding-system)
5. [Tree Viewer with D3.js](#tree-viewer-with-d3js)
6. [Extension Points](#extension-points)
7. [Adding New Operations](#adding-new-operations)
8. [Testing](#testing)
9. [Build & Deploy](#build--deploy)

---

## Architecture Overview

### High-Level Design

```
┌──────────────────────────────────────────────────────────┐
│                    VSCode Extension                       │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────┐    ┌────────────────┐              │
│  │  Extension     │───→│  Providers     │              │
│  │  (extension.ts)│    │  - Folding     │              │
│  └────────────────┘    │  - Tree View   │              │
│           │             └────────────────┘              │
│           ↓                     │                        │
│  ┌────────────────┐            │                        │
│  │  Features      │            ↓                        │
│  │  - Markdown    │    ┌────────────────┐              │
│  │  - Folding     │    │  Webview       │              │
│  └────────────────┘    │  (D3.js Tree)  │              │
│                         └────────────────┘              │
│                                 │                        │
│                                 ↓                        │
│                         ┌────────────────┐              │
│                         │  JavaScript    │              │
│                         │  Managers      │              │
│                         │  - Tree        │              │
│                         │  - Editor      │              │
│                         │  - Audio       │              │
│                         └────────────────┘              │
└──────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Single Source of Truth**: .qmd file is the only data source
2. **No Sync Required**: All operations write directly to source
3. **Event-Driven**: File watchers keep everything synchronized
4. **Progressive Enhancement**: Core editing works even if tree view fails

---

## Code Organization

```
org-mode-vscode/
├── src/
│   ├── extension.ts              # Main extension entry point
│   ├── features/                 # Feature implementations
│   │   ├── markdown.ts           # Headline editing operations
│   │   └── markdownFolding.ts    # Folding cycle logic
│   ├── providers/                # VSCode providers
│   │   ├── markdownFoldingProvider.ts   # Folding ranges
│   │   └── documentSymbolProvider.ts    # Symbol navigation
│   ├── views/                    # UI components
│   │   └── treeViewProvider.ts   # D3 tree webview
│   └── viewer/                   # Webview assets
│       ├── styles.css            # Tree styling
│       ├── tree-manager.js       # D3 tree rendering
│       ├── editor-manager.js     # Edit mode logic
│       └── audio-manager.js      # Audio recording
├── docs/                         # Documentation
├── test/                         # Test suite
└── package.json                  # Extension manifest
```

---

## Key Components

### 1. Extension Entry Point (`src/extension.ts`)

**Purpose**: Initialize and register all extension features

**Key Functions**:
- `activate()`: Called when extension loads
- `deactivate()`: Cleanup on unload

**What it registers**:
```typescript
// Folding provider
vscode.languages.registerFoldingRangeProvider(
  markdownSelector,
  new MarkdownFoldingProvider()
);

// Tree view provider
vscode.window.registerWebviewViewProvider(
  QuartoTreeViewProvider.viewType,
  treeViewProvider
);

// Commands
vscode.commands.registerCommand('markdown.cycleFolding', ...);
```

### 2. Markdown Headline Manager (`src/features/markdown.ts`)

**Purpose**: Implement headline editing operations

**Key Methods**:
- `moveHeadlineUp()`: Swap with previous sibling
- `moveHeadlineDown()`: Swap with next sibling
- `promoteHeadline()`: Decrease level (#)
- `demoteHeadline()`: Increase level (#)
- `copyHeadline()`: Copy to clipboard
- `cutHeadline()`: Cut to clipboard
- `deleteHeadline()`: Remove permanently

**Implementation Pattern**:
```typescript
async moveHeadlineUp(): Promise<void> {
  // 1. Get editor and document
  const editor = vscode.window.activeTextEditor;
  const document = editor.document;
  
  // 2. Find current headline
  const currentLine = this.findCurrentHeadline(document, position.line);
  
  // 3. Get headline range (includes all content and children)
  const currentRange = this.getHeadlineRange(document, currentLine);
  
  // 4. Find target (previous sibling at same level)
  const prevRange = this.findPreviousSibling(document, currentRange);
  
  // 5. Swap text
  await editor.edit(editBuilder => {
    editBuilder.replace(range, newText);
  });
  
  // 6. Update cursor position
  editor.selection = new vscode.Selection(newPosition, newPosition);
}
```

### 3. Folding Commands (`src/features/markdownFolding.ts`)

**Purpose**: Implement 3-state folding cycle

**State Machine**:
```
Headlines WITHOUT children (2 states):
  0 (EXPANDED) ←→ 1 (FOLDED)

Headlines WITH children (3 states):
  0 (EXPANDED) → 1 (FOLDED) → 2 (CHILDREN VISIBLE) → 0
```

**Key Methods**:
- `cycleFolding()`: Main cycling logic
- `hasDescendantsAtLevel()`: Check if headline has children
- `foldRange()`: Fold single headline
- `foldRangeRecursively()`: Fold headline and all descendants
- `showChildrenOnlyManual()`: Show children but fold their content

**Critical Fix**: Removed timing delays, relies on VSCode commands directly

### 4. Tree View Provider (`src/views/treeViewProvider.ts`)

**Purpose**: Manage webview lifecycle and communication

**Responsibilities**:
- Create and manage webview
- Parse document into tree structure
- Handle messages between webview and extension
- Provide file system operations to webview

**Message Protocol**:
```typescript
// Extension → Webview
{
  type: 'updateTree',
  tree: TreeNode[],
  documentUri: string
}

// Webview → Extension
{
  type: 'selectNode',
  line: number
}

{
  type: 'saveNode',
  line: number,
  title: string,
  content: string
}
```

**Tree Structure**:
```typescript
interface TreeNode {
  id: string;              // Unique identifier
  line: number;            // Line number in document
  level: number;           // Headline level (1-6)
  title: string;           // Headline text
  content: string;         // Body content
  children: TreeNode[];    // Child nodes
  collapsed: boolean;      // UI state
}
```

---

## Folding System

### How Folding Works

VSCode provides folding through the `FoldingRangeProvider`:

```typescript
export class MarkdownFoldingProvider implements vscode.FoldingRangeProvider {
  provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
    const ranges: vscode.FoldingRange[] = [];
    
    // 1. Find all headlines
    for (let i = 0; i < document.lineCount; i++) {
      const match = document.lineAt(i).text.match(/^(#+)\s/);
      if (match) {
        headlines.push({ line: i, level: match[1].length });
      }
    }
    
    // 2. Create folding ranges
    for (let i = 0; i < headlines.length; i++) {
      const current = headlines[i];
      let endLine = document.lineCount - 1;
      
      // Find next headline at same or higher level
      for (let j = i + 1; j < headlines.length; j++) {
        if (headlines[j].level <= current.level) {
          endLine = headlines[j].line - 1;
          break;
        }
      }
      
      if (endLine > current.line) {
        ranges.push(new vscode.FoldingRange(
          current.line,
          endLine,
          vscode.FoldingRangeKind.Region
        ));
      }
    }
    
    return ranges;
  }
}
```

### Folding State Management

**Problem**: VSCode doesn't provide folding state API

**Solution**: Track state manually

```typescript
private static foldingStates = new Map<string, number>();

const headlineKey = `${document.uri}:${headlineLineNumber}`;
const currentState = this.foldingStates.get(headlineKey) || 0;
```

**State Transitions**:
```typescript
if (!hasChildren) {
  // 2-state toggle
  if (currentState === 0) {
    await this.foldRange(editor, line, endLine);
    this.foldingStates.set(key, 1);
  } else {
    await this.unfoldRange(editor, line, endLine);
    this.foldingStates.set(key, 0);
  }
} else {
  // 3-state cycle
  if (currentState === 0) {
    await this.foldRangeRecursively(editor, doc, line, level);
    this.foldingStates.set(key, 1);
  } else if (currentState === 1) {
    await this.showChildrenOnlyManual(editor, doc, line, level);
    this.foldingStates.set(key, 2);
  } else {
    await this.unfoldRangeRecursively(editor, doc, line, level);
    this.foldingStates.set(key, 0);
  }
}
```

---

## Tree Viewer with D3.js

### Why D3.js?

- **Powerful**: Industry-standard for data visualization
- **Flexible**: Complete control over rendering
- **Animated**: Smooth transitions built-in
- **Zoomable**: Pan and zoom support
- **Interactive**: Rich event handling

### D3 Tree Layout

**Setup**:
```javascript
// Create tree layout
tree = d3.tree()
  .nodeSize([nodeHeight + verticalSpacing, nodeWidth + horizontalSpacing])
  .separation((a, b) => a.parent === b.parent ? 1 : 1.2);

// Create hierarchy from data
root = d3.hierarchy(hierarchyData);

// Apply layout
tree(root);
```

**Rendering Nodes**:
```javascript
const node = g.selectAll('g.node')
  .data(nodes, d => d.id);

const nodeEnter = node.enter()
  .append('g')
  .attr('class', 'node')
  .attr('transform', d => `translate(${d.y},${d.x})`);

// Add rectangles, text, buttons
nodeEnter.append('rect')...
nodeEnter.append('text')...
```

**Animation**:
```javascript
nodeUpdate
  .transition()
  .duration(500)
  .attr('transform', d => `translate(${d.y},${d.x})`)
  .style('opacity', 1);
```

### Zoom and Pan

```javascript
zoom = d3.zoom()
  .scaleExtent([0.1, 3])
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  });

svg.call(zoom);
```

### Node Interaction

**Click Handling**:
```javascript
nodeEnter
  .on('click', (event, d) => {
    handleNodeClick(event, d);
  });
```

**Toggle Expand/Collapse**:
```javascript
function toggleNode(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}
```

---

## Extension Points

### Adding Custom Providers

**Example: Add custom completion provider**:

```typescript
// In extension.ts
const completionProvider = vscode.languages.registerCompletionItemProvider(
  markdownSelector,
  {
    provideCompletionItems(document, position) {
      // Your completion logic
      return [
        new vscode.CompletionItem('headline1', vscode.CompletionItemKind.Snippet),
        new vscode.CompletionItem('headline2', vscode.CompletionItemKind.Snippet),
      ];
    }
  },
  '#' // Trigger character
);

context.subscriptions.push(completionProvider);
```

### Adding Commands

**Example: Add "duplicate headline" command**:

1. **Implement in MarkdownHeadlineManager**:
```typescript
async duplicateHeadline(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;
  
  const document = editor.document;
  const position = editor.selection.active;
  const currentLine = this.findCurrentHeadline(document, position.line);
  
  if (currentLine < 0) {
    vscode.window.showInformationMessage('Not on or inside a headline');
    return;
  }

  const range = this.getHeadlineRange(document, currentLine);
  if (!range) return;

  const text = document.getText(new vscode.Range(
    new vscode.Position(range.start, 0),
    new vscode.Position(range.end, document.lineAt(range.end).text.length)
  ));

  await editor.edit(editBuilder => {
    editBuilder.insert(
      new vscode.Position(range.end + 1, 0),
      '\n' + text
    );
  });
}
```

2. **Register in extension.ts**:
```typescript
vscode.commands.registerCommand(
  'markdown.duplicateHeadline',
  () => markdownManager.duplicateHeadline()
)
```

3. **Add to package.json**:
```json
{
  "command": "markdown.duplicateHeadline",
  "title": "Quarto: Duplicate Headline"
}
```

4. **Add keybinding**:
```json
{
  "command": "markdown.duplicateHeadline",
  "key": "alt+shift+k",
  "when": "editorLangId == markdown || editorLangId == quarto"
}
```

### Extending Tree Viewer

**Add custom node rendering**:

```javascript
// In tree-manager.js
function renderCustomNode(nodeEnter) {
  // Add custom icon
  nodeEnter.append('image')
    .attr('xlink:href', d => getIconForNode(d))
    .attr('x', -nodeWidth / 2 + 10)
    .attr('y', -nodeHeight / 2 + 10)
    .attr('width', 20)
    .attr('height', 20);
    
  // Add badge for word count
  nodeEnter.append('text')
    .attr('x', nodeWidth / 2 - 10)
    .attr('y', -nodeHeight / 2 + 20)
    .style('font-size', '10px')
    .text(d => d.data.content.split(' ').length + ' words');
}
```

---

## Adding New Operations

### Step-by-Step Guide

**Example: Add "Move Headline to Top"**

1. **Implement Logic** (`src/features/markdown.ts`):
```typescript
async moveHeadlineToTop(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const position = editor.selection.active;
  const currentLine = this.findCurrentHeadline(document, position.line);
  
  if (currentLine < 0) {
    vscode.window.showInformationMessage('Not on or inside a headline');
    return;
  }

  const currentRange = this.getHeadlineRange(document, currentLine);
  if (!currentRange) return;

  // Find first headline at same level
  let firstSiblingLine = -1;
  for (let i = 0; i < currentLine; i++) {
    const line = document.lineAt(i);
    const match = line.match(/^(#+)\s/);
    if (match && match[1].length === currentRange.level) {
      firstSiblingLine = i;
      break;
    }
  }

  if (firstSiblingLine === -1 || firstSiblingLine === currentLine) {
    vscode.window.showInformationMessage('Already at top');
    return;
  }

  // Get text and remove from current position
  const text = document.getText(new vscode.Range(
    new vscode.Position(currentRange.start, 0),
    new vscode.Position(currentRange.end + 1, 0)
  ));

  await editor.edit(editBuilder => {
    // Remove from current position
    editBuilder.delete(new vscode.Range(
      new vscode.Position(currentRange.start, 0),
      new vscode.Position(currentRange.end + 1, 0)
    ));
    
    // Insert at top
    editBuilder.insert(
      new vscode.Position(firstSiblingLine, 0),
      text
    );
  });

  // Move cursor
  const newPosition = new vscode.Position(firstSiblingLine, 0);
  editor.selection = new vscode.Selection(newPosition, newPosition);
}
```

2. **Register Command** (`src/extension.ts`):
```typescript
vscode.commands.registerCommand(
  'markdown.moveHeadlineToTop',
  () => markdownManager.moveHeadlineToTop()
)
```

3. **Add to package.json**:
```json
{
  "command": "markdown.moveHeadlineToTop",
  "title": "Quarto: Move Headline to Top"
}
```

4. **Add Keybinding**:
```json
{
  "command": "markdown.moveHeadlineToTop",
  "key": "cmd+alt+shift+up",
  "when": "editorLangId == markdown || editorLangId == quarto"
}
```

5. **Add Tests** (`test/suite/`):
```typescript
test('Move headline to top', async () => {
  const doc = await createTestDocument();
  // ... test implementation
});
```

6. **Document** (`docs/operations-reference.md`):
Add entry describing the new operation.

---

## Testing

### Running Tests

```bash
npm test
```

### Test Structure

```
test/
├── runTest.ts           # Test runner configuration
└── suite/
    ├── index.ts         # Test suite setup
    ├── folding.test.ts  # Folding operations
    ├── keybinding.test.ts # Keyboard shortcuts
    └── cmd-less-than.test.ts # Specific command tests
```

### Writing Tests

**Example Test**:
```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Markdown Operations', () => {
  test('Promote headline', async () => {
    // Create test document
    const doc = await vscode.workspace.openTextDocument({
      content: '## Test Headline\nContent here',
      language: 'markdown'
    });
    
    const editor = await vscode.window.showTextDocument(doc);
    
    // Position cursor
    editor.selection = new vscode.Selection(0, 0, 0, 0);
    
    // Execute command
    await vscode.commands.executeCommand('markdown.promoteHeadline');
    
    // Assert result
    const newText = doc.lineAt(0).text;
    assert.strictEqual(newText, '# Test Headline');
  });
});
```

### Manual Testing Checklist

- [ ] Folding works on lines with children
- [ ] Folding works on lines without children
- [ ] Move operations swap correctly
- [ ] Promote/demote changes levels
- [ ] Copy/cut/delete work with clipboard
- [ ] Tree view opens and displays structure
- [ ] Tree view selection syncs with editor
- [ ] Edit mode saves changes
- [ ] Audio mode records successfully
- [ ] YAML frontmatter is respected
- [ ] Works on large documents (1000+ lines)

---

## Build & Deploy

### Development Build

```bash
npm run compile      # Compile TypeScript
npm run watch        # Watch mode
```

### Package Extension

```bash
npx vsce package
# Creates: quarto-outliner-1.0.0.vsix
```

### Install Locally

```bash
code --install-extension quarto-outliner-1.0.0.vsix
# Or in Cursor:
cursor --install-extension quarto-outliner-1.0.0.vsix
```

### Publish to Marketplace

```bash
npx vsce publish
```

**Prerequisites**:
- Personal Access Token from Azure DevOps
- Publisher account on VSCode Marketplace

---

## Best Practices

### Code Style

1. **Use TypeScript**: Strong typing prevents errors
2. **Async/Await**: Prefer over callbacks
3. **Error Handling**: Log errors, inform users
4. **Documentation**: Comment complex logic

### Performance

1. **Lazy Loading**: Load features on demand
2. **Debouncing**: Delay expensive operations
3. **Caching**: Cache parsed structures
4. **Testing**: Test with large documents

### VSCode Integration

1. **Context-Aware**: Use `when` clauses in keybindings
2. **Disposables**: Properly dispose resources
3. **Configuration**: Respect user settings
4. **Accessibility**: Support keyboard navigation

---

## Resources

- [VSCode Extension API](https://code.visualstudio.com/api)
- [D3.js Documentation](https://d3js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Quarto Documentation](https://quarto.org/)

---

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Update documentation
6. Submit pull request

---

## License

MIT License - See LICENSE file for details

