#!/bin/bash

# GitHub Repository Setup Script for Quarto Outliner
# Run this after creating the repository on GitHub

echo "========================================"
echo "Quarto Outliner - GitHub Setup"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from the extension root directory."
    exit 1
fi

echo "✓ Found package.json"
echo ""

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    echo "✓ Git initialized"
else
    echo "✓ Git already initialized"
fi

# Add .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
node_modules/
out/
*.vsix
!old-builds/*.vsix
.vscode-test/
.DS_Store
*.log
*.map
.vscode/
*.bak
EOF
    echo "✓ .gitignore created"
fi

# Stage all files
echo ""
echo "Staging files..."
git add .
echo "✓ Files staged"

# Initial commit
echo ""
echo "Creating initial commit..."
git commit -m "Initial release v1.0.0

- Smart Tab folding with three-state cycle
- Interactive tree view in sidebar
- Headline operations (move, promote, demote, copy, cut, delete)
- YAML frontmatter support
- Comprehensive keyboard shortcuts
- Auto-activation for .qmd and .md files"

echo "✓ Initial commit created"

# Prompt for GitHub repository URL
echo ""
echo "========================================"
echo "Now create the repository on GitHub:"
echo "1. Go to: https://github.com/organizations/OpenScienceTechnology/repositories/new"
echo "2. Repository name: quarto-outliner"
echo "3. Make it PUBLIC"
echo "4. Do NOT initialize with README"
echo "5. Click 'Create repository'"
echo "========================================"
echo ""
read -p "Enter the repository URL (e.g., https://github.com/OpenScienceTechnology/quarto-outliner.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

# Add remote
echo ""
echo "Adding remote origin..."
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"
echo "✓ Remote added"

# Rename to main branch
echo ""
echo "Setting up main branch..."
git branch -M main
echo "✓ Branch set to main"

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
git push -u origin main
echo "✓ Pushed to GitHub"

# Create tag
echo ""
echo "Creating v1.0.0 tag..."
git tag -a v1.0.0 -m "Release v1.0.0"
git push --tags
echo "✓ Tag created and pushed"

echo ""
echo "========================================"
echo "✅ GitHub repository setup complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Go to: $REPO_URL/releases/new"
echo "2. Choose tag: v1.0.0"
echo "3. Title: Quarto Outliner v1.0.0"
echo "4. Copy description from CHANGELOG.md"
echo "5. Attach: quarto-outliner-1.0.0.vsix"
echo "6. Publish release"
echo ""
echo "Then follow PUBLICATION_GUIDE.md for marketplace publication"
echo ""

