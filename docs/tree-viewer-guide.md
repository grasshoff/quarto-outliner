# Tree Viewer Guide

Comprehensive guide to the Quarto Outliner interactive tree viewer - a powerful visual interface for document outline management.

---

## Overview

The tree viewer provides a two-column interface for:
- **Visual navigation** through document structure
- **Content viewing** with formatted markdown
- **Direct editing** without switching to main editor
- **Audio dictation** for hands-free content creation

---

## Opening the Tree Viewer

###Methods:

1. **Keyboard Shortcut:** `Cmd+Shift+T` (macOS) / `Ctrl+Shift+T` (Windows/Linux)
2. **Command Palette:** `Cmd+Shift+P` → type "Quarto: Open Tree View"
3. **Sidebar:** Find "Quarto Outline" in Explorer sidebar (left panel)

### Automatic Activation

The tree view:
- Opens automatically when you activate it
- Updates when you switch between `.qmd`/`.md` files
- Refreshes when you edit the document
- Persists across VSCode/Cursor sessions

---

## Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│                    QUARTO OUTLINE                        │
├───────────────────────┬─────────────────────────────────┤
│  TREE PANE (40%)      │  CONTENT PANE (60%)             │
│                       │                                   │
│  Document Outline  [▼]│  [Display] [Edit] [Audio]       │
│  ├─ # Introduction    │                                   │
│  │  ├─ ## Background  │  Introduction                    │
│  │  └─ ## Methods     │                                   │
│  ├─ # Results         │  This is an introduction to...   │
│  │  ├─ ## Primary     │                                   │
│  │  └─ ## Secondary   │  Some more content here that...  │
│  └─ # Discussion      │                                   │
│                       │                                   │
└───────────────────────┴─────────────────────────────────┘
```

---

## Left Column - Tree Pane

### Tree Structure

Headlines are displayed as an indented hierarchy:
- Top-level headlines (`#`) at left edge
- Sub-headlines (`##`, `###`, etc.) indented
- Visual indicators for each headline level

### Level Indicators

Each node shows a colored badge indicating headline level:

- **H1** - Purple gradient
- **H2** - Pink gradient  
- **H3** - Blue gradient
- **H4** - Green gradient
- **H5** - Orange gradient
- **H6** - Teal gradient

### Expand/Collapse Controls

**Node Toggle Icon (▶/▼):**
- ▶ - Node is collapsed (children hidden)
- ▼ - Node is expanded (children visible)
- Empty - Node has no children

**Click behavior:**
- Click toggle icon: Expand/collapse this node only
- Click node text: Select node and show content

**Global Controls:**
- **▼ button (header):** Expand all nodes
- **▶ button (header):** Collapse all nodes

### Navigation

**Clicking Nodes:**
1. Click any node to select it
2. Selected node highlights in blue
3. Right pane shows node content
4. Main editor cursor moves to that headline

**Keyboard Navigation:**
- Arrow keys work in tree (when focused)
- Tab moves between tree and content pane
- Enter opens/closes selected node

### Empty State

When no Quarto/Markdown file is open:
```
┌───────────────────────┐
│       📄              │
│                       │
│ Open a Quarto (.qmd)  │
│ or Markdown (.md)     │
│ file to see the       │
│ document outline      │
│                       │
│  [Open File]          │
└───────────────────────┘
```

---

## Right Column - Content Pane

The content pane has three modes accessible via tabs:

### 1. Display Mode

**Purpose:** Read-only formatted view of node content

**Features:**
- Beautiful markdown rendering
- Syntax highlighting
- Scrollable for long content
- Real-time updates

**Layout:**
```
┌─────────────────────────────────┐
│ Introduction                     │  ← Node title (large, bold)
├─────────────────────────────────┤
│                                  │
│ This is the introduction to      │  ← Formatted content
│ the document.                    │
│                                  │
│ ## Background                    │
│                                  │
│ Some details about...            │
│                                  │
└─────────────────────────────────┘
```

**Markdown Rendering:**
- Headers (H1-H6)
- **Bold** and *italic* text
- `Code` inline and blocks
- Lists (ordered and unordered)
- Blockquotes
- Links

**Use Cases:**
- Review content without editing
- Present document structure
- Quick content navigation
- Reading mode

### 2. Edit Mode

**Purpose:** Direct editing of headline and content

**Layout:**
```
┌─────────────────────────────────┐
│ Headline:                        │
│ ┌─────────────────────────────┐ │
│ │ Introduction                 │ │  ← Title input
│ └─────────────────────────────┘ │
│                                  │
│ Content:                         │
│ ┌─────────────────────────────┐ │
│ │ This is the introduction...  │ │
│ │                              │ │  ← Content textarea
│ │ Some more content here...    │ │
│ │                              │ │
│ └─────────────────────────────┘ │
│                                  │
│          [Save]  [Cancel]        │  ← Action buttons
└─────────────────────────────────┘
```

**Fields:**
- **Headline:** Single-line input for headline text (without `#`)
- **Content:** Multi-line textarea for markdown content

**Actions:**
- **Save Button:** Write changes to source file
- **Cancel Button:** Discard changes, reload original
- **Keyboard:** `Cmd+S` to save, `Esc` to cancel
- **Enter in title:** Move to content field

**Workflow:**
1. Select node in tree
2. Click Edit tab
3. Modify headline or content
4. Press `Cmd+S` or click Save
5. Changes sync to source `.qmd` file
6. Tree updates automatically

**Important Notes:**
- Edits write directly to the `.qmd` source file
- Changes are immediately visible in main editor
- No separate save step needed
- Undo works: `Cmd+Z` in main editor

**Safety:**
- Changes can be undone
- File auto-saves (if enabled in VSCode)
- Version control recommended

### 3. Audio Mode

**Purpose:** Record audio dictation associated with document nodes

**Layout:**
```
┌─────────────────────────────────┐
│      Audio Dictation             │
│                                  │
│      [🎤 Record]  [⏹ Stop]      │  ← Recording controls
│                                  │
│  ┌───────────────────────────┐  │
│  │  ═══════════════════════  │  │  ← Waveform visualization
│  └───────────────────────────┘  │
│                                  │
│  Transcription:                  │
│  ┌───────────────────────────┐  │
│  │ [Transcript appears here] │  │  ← Transcript (future)
│  └───────────────────────────┘  │
│                                  │
│  Previous Recordings:            │
│  ┌───────────────────────────┐  │
│  │ 🎵 Recording for: Intro   │  │
│  │    Oct 16, 2025 14:30     │  │  ← Audio list
│  │    [Audio Player]         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Recording Workflow:**

1. **Select Node**
   - Click node in tree
   - Switch to Audio mode

2. **Start Recording**
   - Click "🎤 Record" button
   - Microphone permission requested (first time)
   - Waveform shows live audio

3. **Record Dictation**
   - Speak clearly into microphone
   - Waveform visualizes audio levels
   - No time limit

4. **Stop Recording**
   - Click "⏹ Stop" button
   - Audio processing begins
   - Recording added to list

5. **Review**
   - Audio player appears in list
   - Click play to review
   - Recording saved automatically

**Audio Storage:**

Files saved to `.audio/` directory next to your `.qmd`:
```
project/
  document.qmd
  .audio/
    document_node_7.webm
    document_node_33.webm
```

**Naming Convention:**
- Format: `<filename>_node_<line>.webm`
- Example: `document_node_7.webm` (recording for headline at line 7)
- WebM format (widely supported, good compression)

**Audio List:**

Shows all recordings for current document:
- **Icon:** 🎵 indicator
- **Title:** "Recording for: <headline>"
- **Metadata:** Date and time
- **Player:** Built-in audio playback

**Transcription (Future Feature):**

Coming soon:
- Real-time speech-to-text
- Editable transcript
- Insert transcript into document
- Multiple language support

**Technical Requirements:**

- **Browser:** Modern browser with MediaRecorder API
- **Microphone:** System microphone access
- **Permissions:** Microphone permission required
- **Format:** WebM (fallback to OGG if needed)

**Best Practices:**

1. **Environment**
   - Record in quiet location
   - Minimize background noise
   - Close windows/doors

2. **Speaking**
   - Speak clearly and naturally
   - Normal conversational pace
   - Pause for punctuation

3. **Organization**
   - One recording per node
   - Clear headline naming
   - Review recordings after capture

4. **Storage**
   - Audio files can be large
   - Back up `.audio/` directory
   - Consider compression for long recordings

---

## Synchronization

### Single Source of Truth

The tree viewer maintains a single source: your `.qmd` file.

**How it Works:**

1. **Reading:**
   - Tree viewer parses `.qmd` file
   - Builds tree structure in memory
   - No separate storage

2. **Editing:**
   - Changes write directly to `.qmd`
   - No intermediate copies
   - Immediate file update

3. **Watching:**
   - File system watcher detects changes
   - Tree refreshes automatically
   - Both editor and tree stay synchronized

**What This Means:**

✅ No sync conflicts
✅ Single file to back up
✅ Works with version control
✅ Changes visible everywhere immediately

❌ No offline editing in tree (requires file access)
❌ Large files may have slight refresh delay

### Real-Time Updates

**Document → Tree:**
- Edit in main editor
- Tree updates automatically
- Node selection preserved

**Tree → Document:**
- Edit in tree viewer
- Main editor updates
- Cursor position synced

**External Changes:**
- File edited in another app
- Tree reloads on file change
- Selection resets to top

---

## Advanced Features

### Multi-File Support

**Switching Files:**
- Open different `.qmd` file
- Tree updates to new file structure
- Previous file state preserved

**Multiple Windows:**
- Each window has own tree state
- Collapsed/expanded state independent
- Selection independent

### Large Documents

**Performance:**
- Fast for documents up to 10,000 lines
- Tree rendering optimized
- Smooth scrolling

**Tips for Large Documents:**
- Use collapse all to start
- Expand only needed sections
- Consider splitting very large documents

### Customization

**Tree Pane Width:**
- Drag divider between panes
- Adjust to preference
- State persists

**Color Scheme:**
- Matches VSCode/Cursor theme
- Dark mode support
- High contrast compatible

---

## Keyboard Shortcuts

### Within Tree Viewer

| Action | Shortcut |
|--------|----------|
| Navigate nodes | `↑` `↓` |
| Expand node | `→` or `Enter` |
| Collapse node | `←` or `Enter` |
| Switch to content | `Tab` |
| Save edit | `Cmd+S` |
| Cancel edit | `Esc` |

### Global (Any Context)

| Action | Shortcut |
|--------|----------|
| Open tree view | `Cmd+Shift+T` |
| Close tree view | `Cmd+W` (when focused) |

---

## Troubleshooting

### Tree Not Showing Content

**Check:**
1. File is `.qmd` or `.md`
2. File has headline structure (`#` headers)
3. File is open in editor

**Solution:**
- Try closing and reopening file
- Reload window: `Cmd+Shift+P` → "Reload Window"

### Edit Not Saving

**Check:**
1. File is not read-only
2. File location is writable
3. No file system errors in console

**Solution:**
- Check file permissions
- Try editing in main editor
- Check VSCode output panel for errors

### Audio Recording Fails

**Check:**
1. Microphone permissions granted
2. Microphone working in other apps
3. Browser supports MediaRecorder API

**Solution:**
- Grant microphone permission when prompted
- Check system privacy settings
- Try different browser (if web version)

### Tree Not Updating

**Check:**
1. File saved after edits
2. File watcher enabled
3. No syntax errors in document

**Solution:**
- Save file explicitly: `Cmd+S`
- Manually refresh: close/reopen tree
- Check for YAML errors (malformed frontmatter)

---

## Best Practices

### Navigation
- Keep tree view open for context
- Use collapse/expand strategically
- Click nodes rather than scrolling editor

### Editing
- Small edits in tree view
- Large rewrites in main editor
- Save frequently

### Organization
- Meaningful headline names
- Consistent hierarchy levels
- Logical structure

### Audio
- Clear naming for nodes
- Quiet recording environment
- Review before transcription

---

## Future Enhancements

Planned features:
- **Drag-and-drop** node reordering in tree
- **Multi-select** for bulk operations
- **Search** within tree
- **Filters** to show only specific levels
- **Export** tree structure
- **AI transcription** for audio
- **Collaborative** editing indicators

---

## Summary

The tree viewer provides:
- ✅ Visual document navigation
- ✅ Three viewing/editing modes
- ✅ Real-time synchronization
- ✅ Audio dictation support
- ✅ No sync conflicts (single source)

Master the tree viewer to:
- Navigate documents faster
- Edit without context switching
- Visualize document structure
- Record audio notes

**Quick Start:**
1. Press `Cmd+Shift+T`
2. Click nodes to navigate
3. Switch modes for different tasks
4. Edit directly when needed

**Remember:** Everything syncs to your `.qmd` file. No separate copies, no sync issues!

---

For more information:
- [User Guide](user-guide.md) - Complete feature guide
- [Operations Reference](operations-reference.md) - All commands
- [Keyboard Shortcuts](keyboard-shortcuts.md) - Shortcut customization

