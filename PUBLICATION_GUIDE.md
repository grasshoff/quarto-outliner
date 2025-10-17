# Publication Guide for Quarto Outliner

## Package Ready

✅ **Production package built**: `quarto-outliner-1.0.0.vsix` (107 KB)

This guide explains how to publish to GitHub and the VS Code Marketplace.

---

## Step 1: Create GitHub Repository

### 1.1 Create Repository on GitHub

1. Go to https://github.com/organizations/OpenScienceTechnology/repositories/new
   (or create organization first if it doesn't exist)
2. Repository name: `quarto-outliner`
3. Description: "Powerful outline navigation and intelligent folding for Quarto and Markdown files"
4. **Public** repository
5. Do NOT initialize with README (we have one)
6. Click "Create repository"

### 1.2 Initialize Git and Push

```bash
cd /Users/friedrichstr/Library/CloudStorage/Dropbox/2026project/outline/org-mode-vscode

# Initialize git if not already done
git init

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
out/
*.vsix
.vscode-test/
.DS_Store
*.log
EOF

# Add files
git add .
git commit -m "Initial release v1.0.0"

# Add remote (replace with actual URL from GitHub)
git remote add origin https://github.com/OpenScienceTechnology/quarto-outliner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.3 Create Release on GitHub

1. Go to repository → Releases → "Create a new release"
2. Tag: `v1.0.0`
3. Title: `Quarto Outliner v1.0.0`
4. Description: Copy from CHANGELOG.md
5. Attach `quarto-outliner-1.0.0.vsix` file
6. Click "Publish release"

---

## Step 2: Publish to VS Code Marketplace

### 2.1 Prerequisites

1. **Create Azure DevOps account** (if needed):
   - Go to https://dev.azure.com/
   - Sign in with Microsoft account

2. **Create Personal Access Token**:
   - Go to https://dev.azure.com/ → User Settings → Personal Access Tokens
   - Click "+ New Token"
   - Name: "VS Code Marketplace"
   - Organization: All accessible organizations
   - Scopes: **Marketplace → Manage** (check this)
   - Click "Create"
   - **Copy the token** (you won't see it again!)

3. **Create VS Code Publisher**:
   - Go to https://marketplace.visualstudio.com/manage
   - Sign in with Azure DevOps account
   - Click "Create publisher"
   - ID: `opensciencetechnology`
   - Name: `OpenScienceTechnology`
   - Click "Create"

### 2.2 Publish Extension

```bash
# Login to marketplace (will prompt for token)
vsce login opensciencetechnology

# Publish the extension
vsce publish

# Or publish specific version
vsce publish --packagePath quarto-outliner-1.0.0.vsix
```

### 2.3 Verify Publication

1. Wait 5-10 minutes for processing
2. Check: https://marketplace.visualstudio.com/items?itemName=opensciencetechnology.quarto-outliner
3. Install in VS Code to verify: `code --install-extension opensciencetechnology.quarto-outliner`

---

## Step 3: Update README Badges

After publication, the badges will work automatically:

- Version badge: Shows current version from marketplace
- Installs badge: Shows install count
- Rating badge: Shows user ratings

---

## Maintenance

### Publishing Updates

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Compile and test
4. Build package: `vsce package`
5. Commit changes
6. Create git tag: `git tag v1.x.x`
7. Push with tags: `git push --tags`
8. Create GitHub release
9. Publish to marketplace: `vsce publish`

### Quick Update Command

```bash
# For patch updates (1.0.0 → 1.0.1)
vsce publish patch

# For minor updates (1.0.0 → 1.1.0)
vsce publish minor

# For major updates (1.0.0 → 2.0.0)
vsce publish major
```

---

## Files Ready for Publication

✅ `README.md` - Professional with badges  
✅ `CHANGELOG.md` - Version history  
✅ `LICENSE` - MIT License  
✅ `package.json` - Proper metadata  
✅ `icon.png` - Extension icon  
✅ `quarto-outliner-1.0.0.vsix` - Built package  

---

## Important Notes

1. **No social media links** - As requested, README has no GitHub/Twitter/etc links
2. **Publisher name**: `opensciencetechnology` (must match in package.json)
3. **Repository**: Must be public for badges to work
4. **License**: MIT (already included)
5. **Keywords**: Optimized for discoverability

---

## Support & Issues

Users can report issues via:
- GitHub Issues (once repository is public)
- VS Code Marketplace Q&A section

---

**Ready to publish! Follow the steps above to make it live.**


