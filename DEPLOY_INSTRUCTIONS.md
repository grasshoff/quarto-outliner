# Deployment Instructions for Quarto Outliner

## Step 1: Create GitHub Repository

1. **Go to**: https://github.com/new
2. **Repository name**: `quarto-outliner`
3. **Description**: `Powerful outline navigation and intelligent folding for Quarto and Markdown files`
4. **Visibility**: **Public** ✓
5. **Do NOT** check any boxes (no README, .gitignore, or license - we have these)
6. Click **"Create repository"**

## Step 2: Push Code to GitHub

After creating the repository, run these commands:

```bash
cd /Users/friedrichstr/Library/CloudStorage/Dropbox/2026project/outline/org-mode-vscode

git remote add origin https://github.com/grasshoff/quarto-outliner.git
git branch -M main
git push -u origin main
```

Create and push the release tag:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push --tags
```

## Step 3: Create GitHub Release

1. Go to: https://github.com/grasshoff/quarto-outliner/releases/new
2. **Choose a tag**: Select `v1.0.0` (or create it)
3. **Release title**: `Quarto Outliner v1.0.0`
4. **Description**: Copy the content below:

```markdown
# Quarto Outliner v1.0.0

Powerful outline navigation and intelligent folding for Quarto and Markdown files.

## ✨ Features

- **Smart Tab Folding**: Three-state cycle (FOLDED → CHILDREN → SUBTREE)
- **Interactive Tree View**: Visual document outline in sidebar
- **Headline Operations**: Move, promote, demote, copy, cut, delete
- **YAML Frontmatter Support**: Intelligently handles Quarto headers
- **Keyboard Shortcuts**: Comprehensive shortcuts for all operations
- **Auto-activation**: Works automatically for .qmd and .md files

## 🎯 Perfect For

- Data science notebooks
- Academic papers
- Technical documentation
- Course materials
- Scientific writing

## 📦 Installation

Install from VS Code Marketplace:
```
ext install opensciencetechnology.quarto-outliner
```

Or download the .vsix file attached to this release and install manually.

## 📝 Documentation

See the [README](https://github.com/grasshoff/quarto-outliner#readme) for full documentation.
```

5. **Attach binary**: Upload `quarto-outliner-1.0.0.vsix`
6. Click **"Publish release"**

## Step 4: Publish to VS Code Marketplace

### Prerequisites

1. **Microsoft Account**: You need a Microsoft/Azure account
2. **Azure DevOps**: Go to https://dev.azure.com/
3. **Personal Access Token**:
   - In Azure DevOps → User Settings → Personal Access Tokens
   - Click "+ New Token"
   - Name: "VS Code Marketplace"
   - Organization: All accessible organizations
   - Scope: **Marketplace** → **Manage** (check this)
   - Click "Create" and **copy the token**

4. **Publisher**: Go to https://marketplace.visualstudio.com/manage
   - Click "Create publisher"
   - ID: `opensciencetechnology`
   - Name: `OpenScienceTechnology`

### Publish Commands

```bash
cd /Users/friedrichstr/Library/CloudStorage/Dropbox/2026project/outline/org-mode-vscode

# Login (will prompt for Personal Access Token)
vsce login opensciencetechnology

# Publish
vsce publish
```

Or publish the specific package:
```bash
vsce publish --packagePath quarto-outliner-1.0.0.vsix
```

## Step 5: Verify

1. **GitHub**: https://github.com/grasshoff/quarto-outliner
2. **Marketplace**: https://marketplace.visualstudio.com/items?itemName=opensciencetechnology.quarto-outliner
3. **Install test**: `code --install-extension opensciencetechnology.quarto-outliner`

## Summary

✅ Repository configured for: `grasshoff/quarto-outliner`  
✅ Publisher: `opensciencetechnology`  
✅ Version: `1.0.0`  
✅ Package: `quarto-outliner-1.0.0.vsix` (109 KB)  

All code is committed and ready to push!

