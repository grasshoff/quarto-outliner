# Contributing to Org Mode for VS Code

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- VS Code (latest version)
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/org-mode-vscode.git
   cd org-mode-vscode
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Open the project in VS Code:
   ```bash
   code .
   ```

5. Press F5 to launch the Extension Development Host

### Project Structure

```
org-mode-vscode/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── parser/               # Org document parser
│   │   ├── orgParser.ts      # AST parser
│   │   └── orgTokenizer.ts   # Tokenizer
│   ├── providers/            # VS Code providers
│   │   ├── foldingProvider.ts
│   │   ├── documentSymbolProvider.ts
│   │   ├── completionProvider.ts
│   │   └── hoverProvider.ts
│   ├── features/             # Feature implementations
│   │   ├── todo.ts           # TODO management
│   │   ├── agenda.ts         # Agenda views
│   │   ├── capture.ts        # Capture system
│   │   ├── babel.ts          # Code execution
│   │   ├── links.ts          # Link handling
│   │   ├── tables.ts         # Table operations
│   │   └── timestamps.ts     # Timestamp management
│   └── utils/                # Utilities
│       ├── config.ts         # Configuration
│       └── commands.ts       # Command registry
├── syntaxes/
│   └── org.tmLanguage.json   # Syntax highlighting
└── test/
    └── suite/                # Test suites
```

## Development Workflow

### Building

```bash
npm run compile
```

### Watch Mode

For continuous compilation during development:

```bash
npm run watch
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Follow VS Code extension development best practices
- Use async/await for asynchronous operations
- Avoid using `any` type when possible
- Add JSDoc comments for public APIs

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line arrays/objects
- Keep line length under 100 characters when practical

### Example

```typescript
export class FeatureManager {
  private config: Configuration;

  constructor(config: Configuration) {
    this.config = config;
  }

  /**
   * Processes an org document
   * @param document The document to process
   * @returns Processing result
   */
  async processDocument(document: vscode.TextDocument): Promise<Result> {
    // Implementation
  }
}
```

## Adding New Features

### 1. Plan the Feature

- Open an issue describing the feature
- Discuss the approach with maintainers
- Consider backward compatibility

### 2. Implement the Feature

- Create feature module in appropriate directory
- Add tests for the feature
- Update documentation

### 3. Add Commands (if needed)

In `src/utils/commands.ts`:

```typescript
vscode.commands.registerCommand('org.myNewCommand', () => 
  featureManager.executeFeature()
)
```

In `package.json`:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "org.myNewCommand",
        "title": "Org: My New Command"
      }
    ]
  }
}
```

### 4. Add Keybindings (optional)

In `package.json`:

```json
{
  "contributes": {
    "keybindings": [
      {
        "command": "org.myNewCommand",
        "key": "ctrl+c ctrl+n",
        "mac": "cmd+c cmd+n",
        "when": "editorLangId == org"
      }
    ]
  }
}
```

## Adding Babel Language Support

To add support for a new programming language:

1. Add language executor in `src/features/babel.ts`:

```typescript
private async executeMyLanguage(code: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync('mylang -e ' + this.escapeShellArg(code));
    return stdout || stderr;
  } catch (error: any) {
    return error.message;
  }
}
```

2. Add case in `executeCode()` method:

```typescript
case 'mylang':
  return await this.executeMyLanguage(code);
```

3. Add to completion provider in `src/providers/completionProvider.ts`

4. Update documentation

## Improving the Parser

The parser is the foundation of the extension. Improvements welcome:

- Better error handling
- Support for more Org syntax elements
- Performance optimizations
- More accurate AST representation

### Parser Architecture

1. **Tokenizer** (`orgTokenizer.ts`): Converts text to tokens
2. **Parser** (`orgParser.ts`): Converts tokens to AST

## Testing

### Writing Tests

Tests are located in `test/suite/`. Create new test files as needed:

```typescript
import * as assert from 'assert';
import { MyFeature } from '../../src/features/myFeature';

suite('My Feature Test Suite', () => {
  test('Should do something', () => {
    const feature = new MyFeature();
    const result = feature.doSomething();
    assert.strictEqual(result, expectedValue);
  });
});
```

### Testing the Extension

1. Press F5 in VS Code to launch Extension Development Host
2. Open or create an `.org` file
3. Test your features
4. Check the Debug Console for errors

## Documentation

### Update README

Add your feature to the README.md:
- Feature list
- Command list
- Configuration options
- Usage examples

### Update CHANGELOG

Add entry to CHANGELOG.md:

```markdown
## [Unreleased]

### Added
- New feature description

### Fixed
- Bug fix description
```

## Submitting Changes

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(babel): add Julia language support
fix(parser): handle empty headlines correctly
docs(readme): add installation instructions
```

### Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat(feature): add new feature"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/my-feature
   ```

4. Create a Pull Request on GitHub

5. Ensure all tests pass

6. Wait for review from maintainers

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Commits follow conventional format

## Feature Requests

Open an issue with:
- Clear description of the feature
- Use cases
- Example usage
- Relevant Org mode documentation links

## Bug Reports

Open an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- VS Code version
- Extension version
- Sample org file (if applicable)

## Questions?

- Open a discussion on GitHub
- Check existing issues and documentation
- Review Org mode documentation at https://orgmode.org

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the best solution for users
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Org Mode for VS Code!

