/**
 * @process cancel-bug-playwright
 * @description Investigate and fix cancel button error using Playwright for verification
 * @inputs {}
 * @outputs { success: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  ctx.log('info', 'Investigating cancel bug with Playwright');

  // Step 1: Write Playwright test to reproduce the cancel bug
  const test = await ctx.task(writePlaywrightTestTask, {});

  // Step 2: Run the test to observe the error
  const testResult = await ctx.task(runPlaywrightTestTask, { phase: 'reproduce' });

  // Step 3: Analyze and fix the bug
  const fix = await ctx.task(fixCancelBugTask, { testOutput: testResult });

  // Step 4: Build verification
  const build = await ctx.task(verifyBuildTask, {});

  // Step 5: Re-run Playwright test to verify fix
  const verifyResult = await ctx.task(runPlaywrightTestTask, { phase: 'verify' });

  // Step 6: Commit
  const commit = await ctx.task(commitTask, {});

  return { success: true };
}

export const writePlaywrightTestTask = defineTask('write-playwright-test', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Write Playwright test for cancel bug',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA automation engineer',
      task: 'Write a Playwright test to reproduce and verify the cancel button behavior',
      context: {},
      instructions: [
        'Read src/app/page.tsx and src/lib/pagespeedClient.ts to understand the cancel flow',
        '',
        'Create tests/cancel.spec.ts with a Playwright test that:',
        '1. Navigates to the app (http://localhost:3000)',
        '2. Enters a few test URLs in the textarea (use real URLs like https://example.com, https://google.com)',
        '3. Clicks "Generate Reports" to start analysis',
        '4. Waits for the progress bar/cancel button to appear',
        '5. Clicks the "Cancel" button',
        '6. Verifies:',
        '   - The loading state stops immediately (progress bar disappears)',
        '   - No console errors are thrown',
        '   - The page is in a clean state (can submit again)',
        '   - Results that completed before cancel are still visible',
        '',
        'Also add a test that verifies the app starts correctly and the form works.',
        '',
        'Create a playwright.config.ts if it does not exist:',
        '- baseURL: http://localhost:3000',
        '- webServer: { command: "npm run dev", port: 3000, reuseExistingServer: true }',
        '',
        'Actually create the files.'
      ],
      outputFormat: 'JSON with success, filesCreated'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, filesCreated: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const runPlaywrightTestTask = defineTask('run-playwright-test', (args, taskCtx) => ({
  kind: 'agent',
  title: `Run Playwright test (${args.phase})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA automation engineer',
      task: `Run the Playwright cancel test to ${args.phase} the bug`,
      context: { phase: args.phase },
      instructions: [
        'Run the Playwright test: npx playwright test tests/cancel.spec.ts --reporter=line',
        'If the test needs browsers installed, run: npx playwright install chromium',
        'Capture the full output including any errors',
        'Report whether the test passed or failed and what errors occurred',
        'If the dev server is not running, the playwright config should start it automatically',
        'If there are issues with the test setup, fix the test file and retry'
      ],
      outputFormat: 'JSON with success, testOutput, errors'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, testOutput: { type: 'string' }, errors: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const fixCancelBugTask = defineTask('fix-cancel-bug', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix cancel button bug',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior React developer',
      task: 'Fix the cancel button error based on Playwright test findings and code analysis',
      context: { testOutput: args.testOutput },
      instructions: [
        'Read src/app/page.tsx and src/lib/pagespeedClient.ts carefully',
        '',
        'Known issues with the current cancel implementation:',
        '',
        '1. Race condition: Cancel onClick calls setIsLoading(false) immediately,',
        '   but handleSubmit\'s Promise.all(workers) is still running.',
        '   When workers finish, handleSubmit calls setIsLoading(false) again and',
        '   tries to cache results, potentially causing state updates on unmounted/stale state.',
        '',
        '2. The wait() function in pagespeedClient.ts retry backoff is NOT abortable.',
        '   If a request is in a retry backoff wait, cancelling does not interrupt the wait().',
        '',
        '3. When cancel sets isLoading to false but workers are still running,',
        '   the workers continue calling setResults() after the UI has moved on,',
        '   which can cause React state update errors.',
        '',
        'Fixes needed:',
        '',
        'In page.tsx:',
        '- Do NOT call setIsLoading(false) in the cancel onClick. Instead, just call abort().',
        '  Let the workers detect the abort and finish cleanly.',
        '- After Promise.all(workers), check if aborted before caching.',
        '- The setIsLoading(false) at the end of handleSubmit handles cleanup.',
        '',
        'In pagespeedClient.ts:',
        '- Make wait() abortable: check signal before and after wait, or use a pattern',
        '  that rejects the promise when signal fires.',
        '- Replace wait(retryDelay) with an abortable version that rejects on signal abort.',
        '',
        'Actually edit both files. Keep all functionality working.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, filesModified: { type: 'array' }, summary: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const verifyBuildTask = defineTask('verify-build', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Verify build',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Build engineer',
      task: 'Run npm run build and fix errors',
      context: {},
      instructions: ['Run npm run build', 'Fix errors if any', 'Report result'],
      outputFormat: 'JSON with success'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const commitTask = defineTask('commit', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Commit cancel fix',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: 'Commit the cancel bug fix with Playwright tests',
      context: {},
      instructions: [
        'Read BUG_FIX_RULES.md, RECENT_FIXATION.md',
        'Add entry to RECENT_FIXATION.md:',
        '### 7. Cancel Button Race Condition Fix (2026-03-16)',
        '- **Bug:** Cancel button caused errors due to race conditions with in-flight requests',
        '- **Root cause:** Cancel set isLoading=false immediately while workers still ran, causing stale state updates. Retry backoff wait was not abortable.',
        '- **Fix:** Removed immediate isLoading=false from cancel onClick (let workers finish cleanly), made retry wait abortable, added abort check before caching results',
        '- **Files modified:** src/app/page.tsx, src/lib/pagespeedClient.ts, tests/cancel.spec.ts (new), playwright.config.ts (new)',
        '- **Verified by:** Playwright browser tests',
        '',
        'git add -A',
        'git -c user.name="Shovan Bitpastel" -c user.email="shovan.bitpastel@gmail.com" commit -m "Fix cancel button race condition + add Playwright tests"',
        'Do NOT push'
      ],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
