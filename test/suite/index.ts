import * as path from 'path';
import Mocha = require('mocha');
import { glob } from 'glob';

export async function run(): Promise<void> {
  // Create the mocha test runner with TDD interface (suite/test instead of describe/it)
  const mocha = new Mocha({
    ui: 'tdd',  // TDD interface provides: suite, test, suiteSetup, suiteTeardown, setup, teardown
    color: true,
    timeout: 10000, // 10 seconds for folding animations and state changes
    slow: 1000,
    bail: false, // Run all tests even if some fail
    reporter: 'spec'
  });

  const testsRoot = path.resolve(__dirname, '..');

  try {
    // Use glob v10+ API - exclude parser.test.js if it causes issues  
    const files = await glob('**/folding.test.js', { cwd: testsRoot });
    
    console.log(`Found ${files.length} test files:`, files);
    
    // Add files to the test suite
    files.forEach((f: string) => {
      const fullPath = path.resolve(testsRoot, f);
      console.log(`Adding test file: ${fullPath}`);
      mocha.addFile(fullPath);
    });

    // Run the mocha test (this will load files internally)
    return new Promise<void>((resolve, reject) => {
      try {
        mocha.run((failures: number) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  } catch (err) {
    console.error('Error finding test files:', err);
    throw err;
  }
}

