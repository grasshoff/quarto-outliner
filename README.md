# Quarto Outliner

![Version](https://img.shields.io/visual-studio-marketplace/v/opensciencetechnology.quarto-outliner?style=flat-square&color=blue)
![Installs](https://img.shields.io/visual-studio-marketplace/i/opensciencetechnology.quarto-outliner?style=flat-square&color=green)
![Rating](https://img.shields.io/visual-studio-marketplace/r/opensciencetechnology.quarto-outliner?style=flat-square&color=yellow)
![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)

**Powerful outline navigation and intelligent folding for Quarto (.qmd) and Markdown (.md) files.**

Brings the legendary Org-mode outlining experience to VS Code and Cursor, making it effortless to write, navigate, and structure long-form documents, academic papers, data science notebooks, and technical documentation.

---

## ✨ Features

### 📊 **Interactive Tree View**

Navigate your document structure with an elegant, live-updating sidebar tree:

- **Instant navigation** - Click any heading to jump there immediately
- **Visual hierarchy** - See your entire document structure at a glance  
- **Smart synchronization** - Tree updates automatically as you edit
- **Expand/collapse** - Manage complex document hierarchies with ease

![Tree View Demo](https://via.placeholder.com/600x400/1e1e1e/ffffff?text=Tree+View+Demo)

### ⌨️ **Smart Tab Folding**

Revolutionary three-state folding system inspired by Emacs Org-mode:

Press **Tab** on any heading to cycle through three intuitive states:

1. **FOLDED** → Everything hidden - focus on structure
2. **CHILDREN** → Direct subheadings visible - see the outline
3. **SUBTREE** → Fully expanded - dive into details

Works intelligently with YAML frontmatter, blank lines, and nested structures.

![Folding Demo](https://via.placeholder.com/600x400/1e1e1e/ffffff?text=Tab+Folding+Demo)

### 🎯 **Powerful Headline Operations**

Restructure your documents effortlessly with keyboard shortcuts:

- **Move** headings up/down while preserving hierarchy
- **Promote/Demote** to change heading levels (`#` ↔ `##` ↔ `###`)
- **Copy, Cut, Delete** entire sections with all their content
- **Fold All/Unfold All** for quick document overview

### 🔧 **Quarto & Markdown Native**

- Automatically activates for `.qmd` and `.md` files
- Intelligently handles YAML frontmatter
- Works seamlessly with code blocks, tables, and lists
- Perfect for scientific writing and data science workflows

---

## 🚀 Quick Start

### Installation

1. Open VS Code or Cursor
2. Go to Extensions (Cmd/Ctrl + Shift + X)
3. Search for "Quarto Outliner"
4. Click Install

### Basic Usage

1. **Open any `.qmd` or `.md` file**
2. **See the tree view** appear in the Explorer sidebar (look for "Quarto Outline")
3. **Place cursor on any heading** (line starting with `#`)
4. **Press Tab** to cycle through folding states
5. **Click headings in tree** to navigate instantly

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **Cycle Folding** | `Tab` | Cycle FOLDED → CHILDREN → SUBTREE on current heading |
| | `Cmd+Shift+,` | Alternative folding shortcut |
| **Tree View** | `Cmd+Shift+T` | Focus the outline tree view |
| **Fold All** | `Cmd+F1` | Collapse all headings in document |
| **Unfold All** | `Cmd+F2` | Expand all headings in document |
| **Move Up** | `Alt+Shift+↑` | Move heading up (swap with previous) |
| **Move Down** | `Alt+Shift+↓` | Move heading down (swap with next) |
| **Promote** | `Cmd+Shift+←` | Decrease heading level (`##` → `#`) |
| **Demote** | `Cmd+Shift+→` | Increase heading level (`#` → `##`) |
| **Copy** | `Alt+Shift+C` | Copy heading with all content |
| **Cut** | `Alt+Shift+X` | Cut heading with all content |
| **Delete** | `Alt+Shift+D` | Delete heading with all content |

*All shortcuts work on macOS. On Windows/Linux, use `Ctrl` instead of `Cmd`.*

---

## 📝 Example Workflow

```markdown
---
title: "Research Analysis"
format: html
---

# Introduction              ← Press Tab to fold
This is the introduction section...

## Background              ← Click in tree view to navigate
More details about the background...

### Literature Review     ← Alt+Shift+↑ to move up
Detailed review of previous work...

## Methods                 ← Cmd+Shift+← to promote to #
Our research methodology...

# Results                  ← Tab cycles: FOLDED → CHILDREN → SUBTREE
Main findings...

## Primary Outcomes
The primary results show...

## Secondary Outcomes
Additional findings...

# Discussion               ← Alt+Shift+D to delete entire section
Interpretation and implications...
```

---

## 🎯 Perfect For

- 📊 **Data Science Notebooks** - Organize analysis sections and results
- 📝 **Academic Papers** - Structure research documents with ease
- 📚 **Technical Documentation** - Manage large documentation projects
- 🎓 **Course Materials** - Create structured educational content
- ✍️ **Writing Projects** - Outline novels, articles, and reports
- 🔬 **Scientific Writing** - Handle complex documents with references

---

## 🌟 Why Quarto Outliner?

Working with large Quarto or Markdown documents can be overwhelming. Quarto Outliner brings professional document management to VS Code:

✅ **Focus** - Collapse sections you're not working on  
✅ **Navigate** - Jump to any section instantly via tree view  
✅ **Reorganize** - Move sections around effortlessly  
✅ **Speed** - All operations via intuitive keyboard shortcuts  
✅ **Visual** - See entire document structure at a glance  
✅ **Intelligent** - Handles YAML, code blocks, and nested structures perfectly

---

## 💡 Tips & Tricks

### Working with Long Documents

- Use `Cmd+F1` to fold everything, then expand only sections you need
- The tree view automatically scrolls to show your current location
- Tab folding works on any heading level - experiment to find your workflow

### Restructuring Documents

- Use `Alt+Shift+↑/↓` to reorder sections without cut/paste
- Promote/demote with `Cmd+Shift+←/→` to adjust document hierarchy
- Copy sections with `Alt+Shift+C` to reuse content structures

### Navigation Shortcuts

- Click tree items to jump anywhere instantly
- Use `Cmd+Shift+T` to quickly access the tree view
- Tree stays synced - edit anywhere and see updates immediately

---

## 🔧 Requirements

- **VS Code** 1.80.0 or higher (or Cursor)
- Works with `.qmd` and `.md` files
- No additional dependencies required

---

## 📜 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! This is an open-source project developed for the scientific and technical writing community.

---

## ❓ Support

Having issues or questions? Feel free to reach out through the extension's repository.

---

<p align="center">
<strong>Developed with ❤️ for the Quarto and scientific writing community</strong><br>
© 2025 OpenScienceTechnology
</p>
