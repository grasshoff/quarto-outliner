# Change Log

All notable changes to the "Quarto Outliner" extension will be documented in this file.

## [1.0.0] - 2025-01-17

### Added
- **Smart Tab Folding**: Three-state folding cycle (FOLDED → CHILDREN → SUBTREE) inspired by Emacs Org-mode
- **Interactive Tree View**: Live-updating document outline in Explorer sidebar
- **Headline Operations**: Move, promote, demote, copy, cut, and delete operations
- **YAML Frontmatter Support**: Intelligent handling of Quarto YAML headers
- **Keyboard Shortcuts**: Comprehensive keyboard bindings for all operations
- **Auto-activation**: Extension loads automatically for .qmd and .md files
- **Smart Folding Provider**: Custom folding ranges optimized for Quarto/Markdown
- **Hierarchical Navigation**: Click-to-navigate tree structure with automatic scrolling
- **Document Synchronization**: Real-time tree updates as document changes

### Features
- Tab key cycles folding states on any heading
- Alternative folding shortcut (Cmd+Shift+,)
- Global fold/unfold all commands
- Move headings up/down with keyboard shortcuts
- Promote/demote heading levels
- Copy/cut/delete entire sections with content
- Tree view focus shortcut (Cmd+Shift+T)
- Handles nested heading structures correctly
- Skips blank lines in folding calculations
- Works with first heading after YAML frontmatter

### Technical
- Built with TypeScript
- Single source of truth architecture (OutlineTree)
- Efficient document caching per file
- Clean separation of concerns (Core/Features/Providers/Views)
- No external dependencies beyond VS Code API

---

## Future Plans

- Add configuration options for folding behavior
- Support for custom heading markers
- Integration with Quarto preview
- Export outline to different formats
- More tree view customization options

---

**Note**: This is the initial release. Please report any issues or suggestions!
