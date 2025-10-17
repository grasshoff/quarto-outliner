# Quarto Outliner - User Guide

Welcome to Quarto Outliner! This guide will help you master outline management for Quarto (`.qmd`) and Markdown (`.md`) files.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Operations](#basic-operations)
3. [Tree Viewer](#tree-viewer)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Workflows](#workflows)
6. [Tips & Tricks](#tips--tricks)

---

## Getting Started

### What is Quarto Outliner?

Quarto Outliner brings Emacs Org-mode-style outline management to VSCode/Cursor. It provides:
- **Smart folding** with 3-state cycling for complex documents
- **Hierarchy editing** to restructure documents effortlessly
- **Interactive tree view** with beautiful visualization
- **Node editing** directly from the tree
- **Audio dictation** for hands-free content creation

### Installation

The extension activates automatically when you open a `.qmd` or `.md` file.

### First Steps

1. Open any Quarto or Markdown file
2. Place cursor on any headline (line starting with `#`)
3. Press `Cmd+Shift+,` to cycle folding states
4. Open the tree viewer: `Cmd+Shift+T`

---

## Basic Operations

### Folding

**Cycle Folding** (`Cmd+Shift+,`)

The main operation for managing document visibility. Behavior depends on whether the headline has children:

**For headlines WITHOUT children:**
- Press once: Fold content
- Press again: Unfold content

**For headlines WITH children:**
- Press once: Fold everything (shows only headline)
- Press again: Show children (children are folded)
- Press third time: Expand all (everything visible)

**Example:**
```markdown
# Introduction              ← Press Cmd+Shift+, here

Text about the topic...

## Background              ← Child headline
More details...

## Methods                 ← Another child
Even more...
```

**Global Operations:**
- `Cmd+F1` - Fold all headlines
- `Cmd+F2` - Unfold all headlines

### Moving Headlines

**Move Up** (`Alt+Shift+↑`)
Swaps current headline with previous sibling at same level.

**Move Down** (`Alt+Shift+↓`)  
Swaps current headline with next sibling at same level.

**Important:** Only headlines at the same level swap. Children move with their parent.

**Example:**
```markdown
# Methods
## Data Collection      ← Move down
## Sample Size          ← Becomes: Sample Size above Data Collection
## Analysis
```

### Restructuring

**Promote** (`Cmd+Shift+←`)  
Decreases headline level (removes one `#`)

```markdown
## Sub-section    →    # Sub-section
```

**Demote** (`Cmd+Shift+→`)  
Increases headline level (adds one `#`)

```markdown
# Main Section    →    ## Main Section
```

### Content Operations

**Copy** (`Alt+Shift+C`)  
Copies headline and all its content/children to clipboard.

**Cut** (`Alt+Shift+X`)  
Cuts headline and all its content/children to clipboard.

**Delete** (`Alt+Shift+D`)  
Permanently deletes headline and all its content/children.

⚠️ **Warning:** Delete is permanent. Use `Cmd+Z` to undo if needed.

---

## Tree Viewer

### Opening the Tree Viewer

- **Keyboard:** `Cmd+Shift+T`
- **Command Palette:** `Cmd+Shift+P` → "Quarto: Open Tree View"
- **Sidebar:** Find "Quarto Outline" in Explorer sidebar

### Tree View Layout

The tree viewer has two columns:

**Left Column - Tree Navigation:**
- Hierarchical document structure
- Color-coded level indicators (H1-H6)
- Expand/collapse controls
- Click to navigate

**Right Column - Content Pane:**
- Three modes: Display, Edit, Audio
- Switch modes using tabs at top

### Display Mode

Shows selected node content as formatted markdown.

**Features:**
- Read-only preview
- Syntax highlighting
- Beautiful markdown rendering
- Click any tree node to view

**Use cases:**
- Review content without editing
- Navigate through document structure
- Present document outline

### Edit Mode

Edit headline and content directly from tree view.

**Features:**
- Title editor (headline text)
- Content editor (markdown syntax)
- Save/Cancel buttons
- Keyboard shortcuts: `Cmd+S` to save, `Esc` to cancel

**Workflow:**
1. Select node in tree
2. Switch to Edit mode
3. Modify title or content
4. Press `Cmd+S` or click Save
5. Changes write directly to source file

**Important:** Edits are synchronized with the main editor. The source `.qmd` file is the single source of truth.

### Audio Mode

Record audio dictation associated with document nodes.

**Features:**
- One-click recording
- Real-time waveform visualization
- Audio playback
- Recordings saved with node association

**Workflow:**
1. Select node in tree
2. Switch to Audio mode
3. Click "🎤 Record"
4. Speak your dictation
5. Click "⏹ Stop"
6. Audio saved automatically

**Audio Storage:**
- Saved in `.audio/` directory next to your `.qmd` file
- Naming: `filename_node_<id>.webm`
- Associated with specific nodes
- Accessible from audio list

**Future Enhancement:** Transcription coming soon!

### Tree Controls

**Expand All** (▼ button)  
Expands all nodes in tree to show complete structure.

**Collapse All** (▶ button)  
Collapses all nodes to show only top-level headlines.

**Node Level Indicators:**
- H1 - Purple gradient
- H2 - Pink gradient
- H3 - Blue gradient
- H4 - Green gradient
- H5 - Orange gradient
- H6 - Teal gradient

---

## Keyboard Shortcuts

### Quick Reference

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Cycle Folding | `Cmd+Shift+,` | `Ctrl+Shift+,` |
| Open Tree View | `Cmd+Shift+T` | `Ctrl+Shift+T` |
| Fold All | `Cmd+F1` | `Ctrl+F1` |
| Unfold All | `Cmd+F2` | `Ctrl+F2` |
| Move Up | `Alt+Shift+↑` | `Alt+Shift+↑` |
| Move Down | `Alt+Shift+↓` | `Alt+Shift+↓` |
| Promote | `Cmd+Shift+←` | `Ctrl+Shift+←` |
| Demote | `Cmd+Shift+→` | `Ctrl+Shift+→` |
| Copy | `Alt+Shift+C` | `Alt+Shift+C` |
| Cut | `Alt+Shift+X` | `Alt+Shift+X` |
| Delete | `Alt+Shift+D` | `Alt+Shift+D` |

### Customizing Shortcuts

1. Open keyboard shortcuts: `Cmd+K Cmd+S`
2. Search for "Quarto"
3. Click shortcut and enter new combination

See [keyboard-shortcuts.md](keyboard-shortcuts.md) for conflict analysis and alternatives.

---

## Workflows

### Writing a Research Paper

1. **Outline Structure**
   - Create main sections with `#`
   - Add subsections with `##`, `###`
   - Use `Cmd+Shift+←/→` to adjust hierarchy

2. **Focus on Sections**
   - `Cmd+F1` to fold all
   - Expand only the section you're writing
   - `Cmd+Shift+,` to cycle section visibility

3. **Reorganize Content**
   - `Alt+Shift+↑/↓` to reorder sections
   - `Alt+Shift+C` to duplicate sections
   - `Alt+Shift+X` to move sections

4. **Review with Tree View**
   - `Cmd+Shift+T` to open tree
   - Click through sections in Display mode
   - Check document structure and flow

### Creating Course Materials

1. **Build Outline**
   - Week 1, Week 2, etc. as `#` headlines
   - Topics as `##` headlines
   - Subtopics as `###` headlines

2. **Content Entry**
   - Use tree view Edit mode for quick content addition
   - Audio mode for lecture notes dictation
   - Display mode for reviewing material

3. **Reorganization**
   - Drag concepts between weeks by cutting/pasting
   - Promote topics to main sections
   - Demote sections to subtopics

### Collaborative Documents

1. **Navigation**
   - Tree view for quick section jumping
   - Folding to focus on assigned sections
   - Display mode for reviewing others' work

2. **Editing**
   - Each author focuses on their sections
   - Use folding to hide other sections
   - Tree view shows overall structure

3. **Integration**
   - Move sections to integrate changes
   - Adjust hierarchy for consistency
   - Review structure in tree view

---

## Tips & Tricks

### Efficient Navigation

**Use Folding Strategically:**
- Start editing session with `Cmd+F1` (fold all)
- Expand only what you're working on
- Reduces cognitive load and distraction

**Tree View as Map:**
- Keep tree view open while writing
- Provides document context
- Quick navigation between sections

**Keyboard-Driven Workflow:**
- Learn core shortcuts first (fold, move, promote/demote)
- Command palette for occasional operations
- Tree view for visual overview

### Structuring Documents

**Clear Hierarchy:**
- Use consistent heading levels
- Don't skip levels (# → ### without ##)
- Tree view makes structure obvious

**Meaningful Headlines:**
- Descriptive titles aid navigation
- Show up in tree view
- Help with document overview

**Chunk Content:**
- Break long sections into subsections
- Easier to fold and navigate
- Better for collaborative editing

### YAML Frontmatter

All operations respect YAML frontmatter:
```markdown
---
title: "My Document"
format: html
---

# First Real Headline    ← Operations start here
```

The YAML block is never included in folding or editing operations.

### Performance

- Works instantly on documents up to 10,000 lines
- Tree view updates in real-time
- No performance impact on typing

For very large documents:
- Consider splitting into multiple files
- Use folding to work on sections
- Tree view helps manage complexity

### Backup & Undo

- All editing operations are undoable: `Cmd+Z`
- VSCode/Cursor auto-saves (configure in settings)
- Use version control (Git) for important documents

### Audio Dictation Best Practices

- Record in quiet environment
- Speak clearly and at normal pace
- Review audio before transcription (future feature)
- Audio files stored locally, not in cloud

---

## Troubleshooting

### Shortcuts Not Working

1. Check you're in `.qmd` or `.md` file
2. Check file type in status bar
3. Try reloading window: `Cmd+Shift+P` → "Reload Window"

### Tree View Not Showing

1. Check sidebar is open
2. Look for "Quarto Outline" panel
3. Try closing and reopening: `Cmd+Shift+T`

### Folding Not Working

1. Ensure headline has content to fold
2. Check headline syntax (`#` followed by space)
3. Try global operations (`Cmd+F1`, `Cmd+F2`) to reset

### Audio Recording Issues

1. Check microphone permissions
2. Try different browser (if in web version)
3. Check console for error messages

---

## Next Steps

- **Learn More:** See [operations-reference.md](operations-reference.md) for detailed operation descriptions
- **Customize:** Check [keyboard-shortcuts.md](keyboard-shortcuts.md) for shortcut customization
- **Develop:** Read [developer-guide.md](developer-guide.md) if extending the extension

---

## Feedback & Support

Found a bug? Have a feature request?

1. Check documentation in `docs/` directory
2. Try running tests: `npm test`
3. Open issue on GitHub (if open source)

---

**Happy Outlining! 📝**

