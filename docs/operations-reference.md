# Quarto Outliner - Operations Reference

Complete reference for all outline management operations in Quarto (`.qmd`) and Markdown (`.md`) files.

## Overview

The Quarto Outliner provides three categories of operations:
1. **Tree Structure Operations** - Folding and visibility control
2. **Navigation Operations** - Moving through the document hierarchy
3. **Editing Operations** - Restructuring and modifying content

---

## Tree Structure Operations

### Cycle Folding State

**Command**: `markdown.cycleFolding`  
**Shortcut**: `Cmd+Shift+,` (macOS) / `Ctrl+Shift+,` (Windows/Linux)  
**Function**: Cycles through folding states for the current headline

**Behavior**:

For headlines **WITHOUT** children (leaf nodes):
- **State 0 → 1**: EXPANDED → FOLDED (hides content)
- **State 1 → 0**: FOLDED → EXPANDED (shows content)

For headlines **WITH** children (parent nodes):
- **State 0 → 1**: EXPANDED → FOLDED (hides everything including children)
- **State 1 → 2**: FOLDED → CHILDREN VISIBLE (shows direct children, hides their content)
- **State 2 → 0**: CHILDREN VISIBLE → EXPANDED (shows everything)

**Example**:
```markdown
# Introduction               ← Cursor here, press Cmd+Shift+,
Some intro text...           ← This content folds/unfolds
## Background               ← Child headline
Details about background... ← Child content
```

**When to use**:
- Focus on specific sections while hiding others
- Navigate complex document structure
- Present overview of document hierarchy

---

### Fold All Headlines

**Command**: `markdown.foldAll`  
**Shortcut**: `Cmd+F1` (macOS) / `Ctrl+F1` (Windows/Linux)  
**Function**: Collapses all headlines in the document

**Behavior**:
- Folds every headline at every level
- Entire document shows only headline structure
- Useful for getting document overview

**Example**:
```markdown
# Introduction          ← Visible
## Background           ← Visible
### Details             ← Visible
(all content hidden)
```

---

### Unfold All Headlines

**Command**: `markdown.unfoldAll`  
**Shortcut**: `Cmd+F2` (macOS) / `Ctrl+F2` (Windows/Linux)  
**Function**: Expands all headlines in the document

**Behavior**:
- Unfolds every headline at every level
- Entire document fully visible
- Resets all folding state

---

## Navigation Operations

### Move Headline Up

**Command**: `markdown.moveHeadlineUp`  
**Shortcut**: `Alt+Shift+Up` (macOS) / `Alt+Shift+Up` (Windows/Linux)  
**Function**: Moves current headline and its content up, swapping with previous sibling

**Behavior**:
- Only swaps with headlines at the **same level**
- Moves entire subtree (headline + all content + all children)
- Cursor follows the moved headline
- Does nothing if already at top or no previous sibling exists

**Example**:
```markdown
# Methods                    
## Data Collection      ← Move this up
Details...
## Sample Size          ← Swaps with this
Info...
```

**Result**:
```markdown
# Methods
## Sample Size
Info...
## Data Collection
Details...
```

---

### Move Headline Down

**Command**: `markdown.moveHeadlineDown`  
**Shortcut**: `Alt+Shift+Down` (macOS) / `Alt+Shift+Down` (Windows/Linux)  
**Function**: Moves current headline and its content down, swapping with next sibling

**Behavior**:
- Only swaps with headlines at the **same level**
- Moves entire subtree
- Cursor follows the moved headline
- Does nothing if already at bottom or no next sibling exists

---

## Editing Operations

### Promote Headline

**Command**: `markdown.promoteHeadline`  
**Shortcut**: `Cmd+Shift+Left` (macOS) / `Ctrl+Shift+Left` (Windows/Linux)  
**Function**: Decreases headline level (moves left in hierarchy)

**Behavior**:
- Removes one `#` from the headline
- `##` becomes `#`, `###` becomes `##`, etc.
- Only affects the headline itself, not children
- Cannot promote `#` (already at top level)

**Example**:
```markdown
## Sub-section    ← Press Cmd+Shift+Left
```

**Result**:
```markdown
# Sub-section
```

**Use cases**:
- Restructure document hierarchy
- Elevate a sub-section to main section
- Adjust outline structure during writing

---

### Demote Headline

**Command**: `markdown.demoteHeadline`  
**Shortcut**: `Cmd+Shift+Right` (macOS) / `Ctrl+Shift+Right` (Windows/Linux)  
**Function**: Increases headline level (moves right in hierarchy)

**Behavior**:
- Adds one `#` to the headline
- `#` becomes `##`, `##` becomes `###`, etc.
- Only affects the headline itself, not children
- No maximum level limit (Markdown supports up to 6 levels by convention)

**Example**:
```markdown
# Main Section    ← Press Cmd+Shift+Right
```

**Result**:
```markdown
## Main Section
```

**Use cases**:
- Convert main section to sub-section
- Nest content under another headline
- Refine document structure

---

### Copy Headline

**Command**: `markdown.copyHeadline`  
**Shortcut**: `Alt+Shift+C` (macOS/Windows/Linux)  
**Function**: Copies headline and all its content to clipboard

**Behavior**:
- Copies headline line + all content + all children
- Includes entire subtree
- Does not modify document
- Clipboard contains plain text markdown

**Example**:
```markdown
## Methods              ← Copy this
Description...
### Data Collection
Details...             ← All of this copied to clipboard
```

**Use cases**:
- Duplicate section in same document
- Move section to different document
- Create backup before editing

---

### Cut Headline

**Command**: `markdown.cutHeadline`  
**Shortcut**: `Alt+Shift+X` (macOS/Windows/Linux)  
**Function**: Cuts headline and all its content to clipboard (copy + delete)

**Behavior**:
- Copies to clipboard (same as Copy Headline)
- Then deletes from document
- Entire subtree removed
- Can paste elsewhere

**Use cases**:
- Move section to different location
- Reorganize document structure
- Remove but preserve content for later

---

### Delete Headline

**Command**: `markdown.deleteHeadline`  
**Shortcut**: `Alt+Shift+D` (macOS/Windows/Linux)  
**Function**: Deletes headline and all its content permanently

**Behavior**:
- Removes headline + all content + all children
- Does NOT copy to clipboard
- Permanent deletion (use Cmd+Z to undo)
- Entire subtree removed

**Example**:
```markdown
## Old Section       ← Delete this
Outdated info...
### Subsection
More outdated...    ← All removed
```

**Use cases**:
- Remove unwanted sections
- Clean up document
- Delete draft content

---

## YAML Frontmatter Handling

All operations automatically detect and respect YAML frontmatter:

```markdown
---
title: "My Document"
author: "Name"
---

# First Headline    ← Operations start here
```

**Behavior**:
- YAML block (between `---` markers) is never included in operations
- Cannot fold, move, or edit YAML as a headline
- First real headline is after closing `---`

---

## Edge Cases and Special Behaviors

### Empty Headlines
If a headline has no content (next line is another headline):
- Still foldable, but fold does nothing visible
- Move operations work normally
- Copy/cut operations copy only the headline line

### End of Document
For the last headline in document:
- Content extends to end of file
- Move down does nothing
- All other operations work normally

### Nested Hierarchy
Operations respect the tree structure:
```markdown
# Level 1
## Level 2
### Level 3
#### Level 4
```

- Moving `### Level 3` only swaps with other `###` headlines under the same parent
- Folding `## Level 2` affects all its children (`###`, `####`, etc.)

---

## Operation Summary Table

| Operation | Shortcut (Mac) | Shortcut (Win/Linux) | Scope | Modifies Document |
|-----------|----------------|----------------------|-------|-------------------|
| Cycle Folding | `Cmd+Shift+,` | `Ctrl+Shift+,` | Current headline | No (view only) |
| Fold All | `Cmd+F1` | `Ctrl+F1` | All headlines | No (view only) |
| Unfold All | `Cmd+F2` | `Ctrl+F2` | All headlines | No (view only) |
| Move Up | `Alt+Shift+↑` | `Alt+Shift+↑` | Current subtree | Yes |
| Move Down | `Alt+Shift+↓` | `Alt+Shift+↓` | Current subtree | Yes |
| Promote | `Cmd+Shift+←` | `Ctrl+Shift+←` | Headline only | Yes |
| Demote | `Cmd+Shift+→` | `Ctrl+Shift+→` | Headline only | Yes |
| Copy | `Alt+Shift+C` | `Alt+Shift+C` | Current subtree | No |
| Cut | `Alt+Shift+X` | `Alt+Shift+X` | Current subtree | Yes |
| Delete | `Alt+Shift+D` | `Alt+Shift+D` | Current subtree | Yes |

---

## Performance Notes

- All operations work instantly on documents up to 10,000 lines
- Folding state persists during editing session
- No performance impact on typing or editing
- Large documents (>10,000 lines) may have slight delay on fold/unfold operations

---

## Command Palette Access

All operations also available via Command Palette (`Cmd+Shift+P`):
1. Open Command Palette
2. Type "Quarto:"
3. Select desired operation

Useful for:
- Discovering available operations
- Operations without assigned shortcuts
- When shortcuts conflict with other extensions

