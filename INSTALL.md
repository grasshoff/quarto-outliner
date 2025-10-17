# Quarto Outliner - Production Installation Guide

## Package Information

**File**: `quarto-outliner-1.0.0.vsix`  
**Size**: 122 KB  
**Status**: Production-ready with complete test suite ✅  
**Test Coverage**: 27/27 tests passing (100%)

## Installation Steps

### Method 1: Install from File (Recommended)

1. **Open VS Code/Cursor**

2. **Open Extensions View**
   - Press `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X` (Windows/Linux)
   - Or click the Extensions icon in the sidebar

3. **Install from VSIX**
   - Click the `...` (three dots) menu at the top of the Extensions view
   - Select **"Install from VSIX..."**
   - Navigate to: `/Users/friedrichstr/Library/CloudStorage/Dropbox/2026project/outline/org-mode-vscode/`
   - Select `quarto-outliner-1.0.0.vsix`
   - Click **Install**

4. **Reload Window**
   - Press `Cmd+Shift+P` → "Developer: Reload Window"
   - Or restart VS Code/Cursor

### Method 2: Command Line Installation

```bash
# Navigate to the directory
cd /Users/friedrichstr/Library/CloudStorage/Dropbox/2026project/outline/org-mode-vscode

# Install the extension
code --install-extension quarto-outliner-1.0.0.vsix
```

Or for Cursor:
```bash
cursor --install-extension quarto-outliner-1.0.0.vsix
```

## Verify Installation

1. **Open a Quarto or Markdown file** (`.qmd` or `.md`)

2. **Test the extension**:
   - Position cursor on a headline (e.g., `# Introduction`)
   - Press **Tab** to cycle through folding states
   - Try **Cmd+F1** to fold all
   - Try **Cmd+F2** to unfold all

3. **Check extension is active**:
   - Look for the message: "Quarto Outliner loaded successfully!" in the output panel

## Features

### Folding Operations
- **Tab** on headline: Cycle through folding states
  - Headlines with children: 3-state cycle (Expanded → Folded → Children Visible → Expanded)
  - Headlines without children: 2-state toggle (Expanded ↔ Folded)
- **Cmd+F1**: Fold all headlines
- **Cmd+F2**: Unfold all headlines

### Editorial Operations
- **Alt+Shift+Up/Down**: Move headline up/down
- **Cmd+Shift+Left**: Promote headline (decrease level)
- **Cmd+Shift+Right**: Demote headline (increase level)
- **Alt+Shift+C**: Copy headline with all content
- **Alt+Shift+X**: Cut headline with all content
- **Alt+Shift+D**: Delete headline with all content

### Supported File Types
- Quarto (`.qmd`)
- Markdown (`.md`)

## Test Suite

The extension includes a comprehensive test suite:
- **27 tests** covering all functionality
- **100% pass rate**
- **22-second runtime**

### Run Tests
```bash
cd /Users/friedrichstr/Library/CloudStorage/Dropbox/2026project/outline/org-mode-vscode
npm test
```

## Troubleshooting

### Extension Not Loading
1. Check Extensions view for "Quarto Outliner"
2. Reload window: `Cmd+Shift+P` → "Developer: Reload Window"
3. Check Output panel for error messages

### Commands Not Working
1. Verify you're in a `.qmd` or `.md` file
2. Check cursor is on a headline (starts with `#`)
3. Open Command Palette (`Cmd+Shift+P`) and search for "Quarto" to see available commands

### Keyboard Shortcuts Conflict
If shortcuts don't work:
1. Open Keyboard Shortcuts: `Cmd+K Cmd+S`
2. Search for "Quarto"
3. Remap conflicting shortcuts

## Uninstall

If you need to uninstall:

1. **Via Extensions View**:
   - Find "Quarto Outliner" in Extensions
   - Click the gear icon → Uninstall

2. **Via Command Line**:
   ```bash
   code --uninstall-extension quarto-outliner
   ```

## Documentation

Included documentation:
- `README.md` - Overview and usage
- `test/README.md` - Test suite documentation
- `TEST_SUITE_COMPLETE.md` - Complete test results
- `QUICK_START_TESTING.md` - Quick testing guide

## Support

For issues or questions:
1. Check the documentation in the extension folder
2. Review test suite for expected behavior
3. Run tests to verify functionality: `npm test`

## Version Information

- **Version**: 1.0.0
- **Release Date**: October 16, 2025
- **Test Status**: ✅ All 27 tests passing
- **Quality**: Production-ready

---

**Ready to use!** Install the extension and enjoy org-mode-style outlining in Quarto and Markdown files.











