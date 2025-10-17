# Keyboard Shortcuts - Analysis and Reference

Complete analysis of Quarto Outliner keyboard shortcuts, potential conflicts, and customization guide.

---

## Current Keyboard Shortcuts

### Folding Operations

| Operation | macOS | Windows/Linux | Notes |
|-----------|-------|---------------|-------|
| Cycle Folding | `Cmd+Shift+,` | `Ctrl+Shift+,` | Main folding operation |
| Fold All | `Cmd+F1` | `Ctrl+F1` | Global fold |
| Unfold All | `Cmd+F2` | `Ctrl+F2` | Global unfold |

### Headline Movement

| Operation | macOS | Windows/Linux | Notes |
|-----------|-------|---------------|-------|
| Move Up | `Alt+Shift+↑` | `Alt+Shift+↑` | Swap with previous sibling |
| Move Down | `Alt+Shift+↓` | `Alt+Shift+↓` | Swap with next sibling |

### Hierarchy Editing

| Operation | macOS | Windows/Linux | Notes |
|-----------|-------|---------------|-------|
| Promote | `Cmd+Shift+←` | `Ctrl+Shift+←` | Decrease level (remove #) |
| Demote | `Cmd+Shift+→` | `Ctrl+Shift+→` | Increase level (add #) |

### Content Operations

| Operation | macOS | Windows/Linux | Notes |
|-----------|-------|---------------|-------|
| Copy Headline | `Alt+Shift+C` | `Alt+Shift+C` | Copy subtree to clipboard |
| Cut Headline | `Alt+Shift+X` | `Alt+Shift+X` | Cut subtree to clipboard |
| Delete Headline | `Alt+Shift+D` | `Alt+Shift+D` | Delete subtree permanently |

---

## Conflict Analysis

### VSCode Default Keybindings

#### Potential Conflicts

**`Cmd+Shift+Left/Right` (Promote/Demote)**
- **VSCode Default**: Expand/shrink text selection by word
- **Severity**: ⚠️ **MODERATE CONFLICT**
- **Context**: Only active in Quarto/Markdown files, but conflicts with selection behavior
- **Impact**: Users cannot use word-level selection expansion while in Quarto files

**Recommendation**: Consider alternative shortcuts:
- Option A: `Cmd+Alt+Left/Right` (less common)
- Option B: `Cmd+[` and `Cmd+]` (similar to indent/outdent)
- Option C: Keep current, document the tradeoff

**`Alt+Shift+Up/Down` (Move Headline)**
- **VSCode Default**: Copy line up/down
- **Severity**: ⚠️ **MODERATE CONFLICT**
- **Context**: Only active in Quarto/Markdown files
- **Impact**: Users lose line duplication shortcut in Quarto files

**Recommendation**: Consider alternatives:
- Option A: `Cmd+Alt+Up/Down` (macOS style)
- Option B: `Ctrl+Cmd+Up/Down` (unique combination)
- Option C: Keep current, as headline movement is more valuable in outline context

#### No Conflicts

**`Cmd+Shift+,` (Cycle Folding)**
- **VSCode Default**: No conflicting binding
- **Status**: ✅ **SAFE**
- **Note**: The `<` key (shift+comma) is rarely used in default VSCode shortcuts

**`Cmd+F1/F2` (Fold/Unfold All)**
- **VSCode Default**: No conflicting binding
- **Status**: ✅ **SAFE**
- **Note**: F1 alone opens command palette, but Cmd+F1 is free

**`Alt+Shift+C/X/D` (Copy/Cut/Delete)**
- **VSCode Default**: No conflicting binding
- **Status**: ✅ **SAFE**
- **Note**: Intentionally chosen to avoid common shortcuts

---

### Cursor IDE Specific Conflicts

Cursor IDE is based on VSCode, so inherits most conflicts. Additional considerations:

**AI Features**
- Cursor uses `Cmd+K` for AI commands
- Our shortcuts don't interfere
- **Status**: ✅ **NO CONFLICT**

**Chat Features**
- Cursor uses `Cmd+L` for AI chat
- Our shortcuts don't interfere
- **Status**: ✅ **NO CONFLICT**

---

## Recommended Alternatives

### Conservative Approach (Minimal Changes)

Keep most shortcuts, change only the two moderate conflicts:

```json
{
  "markdown.promoteHeadline": "Cmd+[",
  "markdown.demoteHeadline": "Cmd+]",
  "markdown.moveHeadlineUp": "Cmd+Alt+Up",
  "markdown.moveHeadlineDown": "Cmd+Alt+Down"
}
```

**Rationale**:
- `Cmd+[` and `Cmd+]` mirror indent/outdent behavior
- `Cmd+Alt+Arrow` is common in macOS for window management, intuitive for movement

---

### Emacs Org-Mode Inspired

For users familiar with Emacs Org-mode:

```json
{
  "markdown.cycleFolding": "Tab",
  "markdown.promoteHeadline": "Alt+Left",
  "markdown.demoteHeadline": "Alt+Right",
  "markdown.moveHeadlineUp": "Alt+Up",
  "markdown.moveHeadlineDown": "Alt+Down"
}
```

**Rationale**:
- Mirrors Org-mode shortcuts for familiar workflow
- Simpler key combinations
- **Warning**: Tab may conflict with indent behavior

---

### All-Safe Approach (No Conflicts)

Uses only modifier combinations with low conflict probability:

```json
{
  "markdown.cycleFolding": "Cmd+Shift+,",
  "markdown.foldAll": "Cmd+Shift+F1",
  "markdown.unfoldAll": "Cmd+Shift+F2",
  "markdown.promoteHeadline": "Cmd+Alt+Shift+Left",
  "markdown.demoteHeadline": "Cmd+Alt+Shift+Right",
  "markdown.moveHeadlineUp": "Cmd+Alt+Shift+Up",
  "markdown.moveHeadlineDown": "Cmd+Alt+Shift+Down",
  "markdown.copyHeadline": "Cmd+Alt+Shift+C",
  "markdown.cutHeadline": "Cmd+Alt+Shift+X",
  "markdown.deleteHeadline": "Cmd+Alt+Shift+D"
}
```

**Rationale**:
- Triple modifiers (Cmd+Alt+Shift) rarely used by other extensions
- Guaranteed no conflicts
- **Warning**: More complex to type, may be ergonomically challenging

---

## Customization Guide

### How to Customize Shortcuts

1. **Open Keyboard Shortcuts**
   - Press `Cmd+K Cmd+S` (macOS) or `Ctrl+K Ctrl+S` (Windows/Linux)
   - Or: `Cmd+Shift+P` → "Preferences: Open Keyboard Shortcuts"

2. **Search for Quarto Commands**
   - Type "Quarto" in the search box
   - Or search for specific command like "moveHeadline"

3. **Change Shortcut**
   - Click on the command
   - Press desired key combination
   - Hit Enter to confirm

4. **Remove Conflict**
   - If warning appears, VSCode will show the conflict
   - Choose to override or cancel

### Keyboard Shortcuts JSON

For advanced users, edit `keybindings.json` directly:

```json
[
  {
    "key": "cmd+[",
    "command": "markdown.promoteHeadline",
    "when": "editorTextFocus && (editorLangId == 'markdown' || editorLangId == 'quarto')"
  },
  {
    "key": "cmd+]",
    "command": "markdown.demoteHeadline",
    "when": "editorTextFocus && (editorLangId == 'markdown' || editorLangId == 'quarto')"
  }
]
```

**Access**:
- `Cmd+Shift+P` → "Preferences: Open Keyboard Shortcuts (JSON)"

---

## Context Activation

All Quarto Outliner shortcuts are **context-aware**:

```json
"when": "editorTextFocus && (editorLangId == 'markdown' || editorLangId == 'quarto')"
```

**What this means**:
- Shortcuts ONLY active in `.qmd` and `.md` files
- No interference in other file types (`.js`, `.py`, `.txt`, etc.)
- Original VSCode shortcuts work normally in non-markdown files

**Example**:
- In `.qmd` file: `Alt+Shift+Up` moves headline
- In `.js` file: `Alt+Shift+Up` copies line up (VSCode default)

---

## Modifier Key Reference

### macOS

| Modifier | Symbol | Key |
|----------|--------|-----|
| Command | `Cmd` | ⌘ |
| Option | `Alt` | ⌥ |
| Shift | `Shift` | ⇧ |
| Control | `Ctrl` | ⌃ |

### Windows/Linux

| Modifier | Key |
|----------|-----|
| Control | `Ctrl` |
| Alt | `Alt` |
| Shift | `Shift` |
| Windows | `Win` |

---

## Best Practices

### Choosing Custom Shortcuts

1. **Avoid Single Keys**
   - Never use single letters without modifiers
   - Interferes with typing

2. **Use Semantic Grouping**
   - Related operations should have similar patterns
   - Example: All movement uses arrows, all hierarchy uses left/right

3. **Prefer Two Modifiers**
   - `Cmd+Shift+X` is good balance
   - Three modifiers (`Cmd+Alt+Shift+X`) hard to type
   - Single modifier (`Cmd+X`) likely conflicts

4. **Test Before Committing**
   - Try shortcuts in real workflow
   - Check for muscle memory conflicts
   - Verify no interference with frequently-used VSCode features

5. **Document Custom Shortcuts**
   - Keep personal reference
   - Share with team if in collaborative environment

---

## Conflict Resolution Strategy

If you encounter conflicts:

1. **Identify the Conflict**
   - VSCode will warn when setting shortcut
   - Note which command conflicts

2. **Assess Priority**
   - Which operation do you use more in markdown files?
   - Quarto outline operation vs. VSCode default?

3. **Choose Resolution**
   - **Option A**: Keep Quarto shortcut (lose VSCode default in markdown)
   - **Option B**: Change Quarto shortcut (use alternative)
   - **Option C**: Disable one command entirely

4. **Test in Practice**
   - Use for a few days
   - Adjust if uncomfortable

---

## Future-Proof Recommendations

### Current Recommendation (Version 1.0.1+)

```json
{
  "markdown.cycleFolding": "Cmd+Shift+,",      // Safe, no conflicts
  "markdown.foldAll": "Cmd+F1",                 // Safe
  "markdown.unfoldAll": "Cmd+F2",               // Safe
  "markdown.promoteHeadline": "Cmd+[",          // Changed from Cmd+Shift+Left
  "markdown.demoteHeadline": "Cmd+]",           // Changed from Cmd+Shift+Right
  "markdown.moveHeadlineUp": "Cmd+Alt+Up",      // Changed from Alt+Shift+Up
  "markdown.moveHeadlineDown": "Cmd+Alt+Down",  // Changed from Alt+Shift+Down
  "markdown.copyHeadline": "Alt+Shift+C",       // Safe
  "markdown.cutHeadline": "Alt+Shift+X",        // Safe
  "markdown.deleteHeadline": "Alt+Shift+D"      // Safe
}
```

**Summary**:
- 7 safe shortcuts (no changes needed)
- 4 shortcuts changed to avoid conflicts
- Maintains intuitive patterns (arrows for movement, brackets for hierarchy)

---

## Quick Reference Card

Print-friendly shortcut reference:

```
QUARTO OUTLINER SHORTCUTS (macOS)
═══════════════════════════════════════

FOLDING
  Cmd+Shift+,     Cycle fold state
  Cmd+F1          Fold all
  Cmd+F2          Unfold all

MOVEMENT
  Cmd+Alt+↑       Move headline up
  Cmd+Alt+↓       Move headline down

HIERARCHY
  Cmd+[           Promote (← decrease level)
  Cmd+]           Demote (→ increase level)

EDITING
  Alt+Shift+C     Copy headline
  Alt+Shift+X     Cut headline
  Alt+Shift+D     Delete headline
```

---

## Accessibility Notes

For users with accessibility needs:

1. **All operations available via Command Palette**
   - No keyboard shortcuts required
   - Voice control compatible

2. **No rapid key combinations required**
   - All shortcuts are held modifiers + single key
   - No timing-sensitive sequences

3. **Customizable for one-handed use**
   - Can remap to numeric keypad
   - Can use sticky keys

---

## Platform Differences

### macOS vs. Windows/Linux

Most shortcuts identical except:

| Operation | macOS | Windows/Linux |
|-----------|-------|---------------|
| Cycle Folding | `Cmd+Shift+,` | `Ctrl+Shift+,` |
| Fold All | `Cmd+F1` | `Ctrl+F1` |
| Unfold All | `Cmd+F2` | `Ctrl+F2` |
| Promote | `Cmd+[` | `Ctrl+[` |
| Demote | `Cmd+]` | `Ctrl+]` |
| Move Up | `Cmd+Alt+↑` | `Ctrl+Alt+↑` |
| Move Down | `Cmd+Alt+↓` | `Ctrl+Alt+↓` |

**Pattern**: Replace `Cmd` with `Ctrl` on Windows/Linux

---

## Troubleshooting

### Shortcuts Not Working

1. **Verify File Type**
   - Check file extension is `.qmd` or `.md`
   - Status bar shows "Quarto" or "Markdown"

2. **Check for Conflicts**
   - Open Keyboard Shortcuts (`Cmd+K Cmd+S`)
   - Search for the key combination
   - See if another extension has priority

3. **Restart VSCode/Cursor**
   - Some shortcut changes require restart
   - Reload window: `Cmd+Shift+P` → "Developer: Reload Window"

4. **Check Extension Enabled**
   - Extensions view → "Quarto Outliner"
   - Should show "Enabled"

### Shortcut Fires Wrong Command

1. **Extension Priority**
   - Later-loaded extensions override earlier ones
   - Disable conflicting extension temporarily to test

2. **Context Condition**
   - Verify you're in correct file type
   - Check cursor is in text area (not sidebar)

3. **Check Custom keybindings.json**
   - Ensure no conflicting custom shortcuts
   - Comment out custom bindings to test

---

## Feedback and Suggestions

If you discover additional conflicts or have suggestions for better shortcuts:

1. Check VSCode/Cursor shortcuts: `Cmd+K Cmd+S`
2. Document the conflict
3. Suggest alternative in extension issues

The goal is maximum productivity with minimum conflicts!

