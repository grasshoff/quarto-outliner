# Quarto Outliner Test Suite

Comprehensive automated test suite for the Quarto Outliner VS Code extension.

## Overview

This test suite validates all outliner functionality including:

- **Three-state folding cycles** for headlines with children
- **Two-state toggles** for headlines without children
- **Global fold/unfold operations** (Cmd+F1, Cmd+F2)
- **Editorial operations** (move, promote, demote, copy, cut, delete)
- **Edge cases** (YAML frontmatter, empty lines, deep nesting)

## Test Structure

```
test/
├── runTest.ts              # Test runner entry point
├── suite/
│   ├── index.ts            # Mocha configuration
│   ├── stateMonitor.ts     # State inspection utilities
│   ├── testHelpers.ts      # Test helper functions
│   └── folding.test.ts     # Main test suite (5 test groups)
└── README.md               # This file
```

## Running Tests

### Method 1: VS Code Test Runner (Recommended)

1. Open the project in VS Code
2. Press `F5` or use "Run > Start Debugging"
3. This will:
   - Compile the extension
   - Open a new VS Code window with the extension loaded
   - Run all tests automatically
   - Display results in the Debug Console

### Method 2: Command Line

```bash
npm test
```

This runs the full test suite including linting and compilation.

### Method 3: Compile and Run Specific Tests

```bash
# Compile
npm run compile

# Run tests
npm test
```

## Test Document

The tests use `test.qmd` in the project root, which contains:

- **Line 7**: `# Introduction` (has children and grandchildren)
- **Line 33**: `# Results` (has children only)
- **Line 45**: `# Discussion` (no children)
- **Line 49**: `# Conclusion` (no children)
- Multiple level-2 and level-3 headlines
- YAML frontmatter
- Empty lines between sections

This structure exercises all folding scenarios.

## Test Groups

### Group 1: Three-State Cycle (Headlines with Children)

Tests the three-state folding cycle on lines 7 and 33:
- State 0 (Expanded) → State 1 (Fully Folded)
- State 1 → State 2 (Children Visible)
- State 2 → State 0 (Fully Expanded)

### Group 2: Two-State Toggle (Headlines without Children)

Tests simple toggle on lines 45 and 49:
- State 0 (Expanded) ↔ State 1 (Folded)

### Group 3: Global Folding Operations

Tests:
- `Cmd+F1` (Fold All)
- `Cmd+F2` (Unfold All)
- Combinations and state transitions

### Group 4: Editorial Operations

Tests headline manipulation:
- Move Up/Down (Alt+Shift+Up/Down)
- Promote/Demote (Cmd+Shift+Left/Right)
- Copy/Cut/Delete (Alt+Shift+C/X/D)

### Group 5: Edge Cases

Tests:
- Non-headline lines
- YAML frontmatter exclusion
- Empty lines handling
- Deep nesting (level 3+)
- Independent fold states

## State Verification

Each test verifies:

1. **Initial State**: Document fully expanded, cursor positioned
2. **Action**: Execute command via keybinding
3. **Stable State**: Wait for animations (~150ms)
4. **Verification**: Check visible/hidden lines
5. **Cleanup**: Reset document for next test

## Test Utilities

### StateMonitor

- `getVisibleLines()`: Get currently visible line numbers
- `isFolded(lineNumber)`: Check if line is folded
- `getFoldedRanges()`: Get all folded ranges
- `waitForStableState()`: Wait for animations
- `getHeadlineInfo()`: Get headline level and text

### TestHelpers

- `setCursorPosition(line, char)`: Position cursor
- `pressKey(command)`: Execute command and wait
- `captureDisplayState()`: Snapshot current state
- `assertLinesVisible(lines)`: Assert lines are visible
- `assertLinesHidden(lines)`: Assert lines are hidden
- `resetDocument()`: Restore initial state
- `getClipboard()`: Get clipboard content

## Expected Results

All tests should pass with:
- ✅ Fast feedback (<5 seconds total)
- ✅ Clear error messages showing expected vs actual states
- ✅ Consistent results across runs
- ✅ No manual intervention required

## Debugging Tests

To debug a specific test:

1. Open `test/suite/folding.test.ts`
2. Add `.only` to the test: `test.only('Test name', ...)`
3. Press `F5` to run only that test
4. Check Debug Console for output

## Console Output

Tests log useful information:
```
Line 7: level=1, endLine=32, text="# Introduction"
  -> hasChildren=true, currentState=0
After fold state 1: 12 visible lines
After fold state 2: 24 visible lines
After fold state 0: 53 visible lines
```

## Troubleshooting

### Tests fail with timeout

Increase timeout in `test/suite/folding.test.ts`:
```typescript
this.timeout(10000); // 10 seconds
```

### Display state verification fails

Check console output for actual visible lines vs expected.
Adjust timing in `StateMonitor.waitForStableState()` if needed.

### Extension not loading

Ensure the extension is compiled:
```bash
npm run compile
```

## Success Criteria

- All 5 test groups pass ✅
- State verification at critical transition points ✅
- Fast feedback (<5 seconds total runtime) ✅
- Clear failure messages ✅
- No manual intervention required ✅

