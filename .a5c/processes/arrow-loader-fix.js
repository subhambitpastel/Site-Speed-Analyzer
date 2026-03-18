/**
 * @process arrow-loader-fix
 * @description Fix tooltip arrow position, remove row tooltips, fix orbiting ring animation. Verify with headed Playwright.
 */
import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  ctx.log('info', 'Fix arrow + loader + verify with Playwright');

  // Step 1: Start dev server and run headed Playwright
  const testResult = await ctx.task(runTestTask, {});

  // Step 2: Commit
  await ctx.task(commitTask, {});

  // Step 3: User review
  await ctx.breakpoint({
    question: `Fixes applied: (1) Tooltip arrow repositioned to top of tooltip pointing up, (2) Removed tooltips from individual score cells in table rows, (3) Fixed orbiting ring - static track + rotating gradient arc with glow trail. Playwright: ${testResult.passed}/${testResult.total} pass. Screenshots in test-results/. Approve?`,
    title: 'Arrow + Loader Fix Review',
    tag: 'review'
  });

  return { success: true };
}

export const runTestTask = defineTask('run-test', (args, taskCtx) => ({
  kind: 'agent', title: 'Run headed Playwright test',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer',
      task: 'Start dev server, run headed Playwright tests for tooltip and loading animation',
      context: {},
      instructions: [
        'First ensure dev server is running. Run: rm -rf .next && npx next dev -p 3002 &',
        'Wait 20 seconds for it to start',
        'Then run: npx playwright test tests/tooltip-visual.spec.ts --reporter=list',
        'Report results. Check screenshots in test-results/',
        'Also check test-results/ for screenshots showing the loading animation'
      ],
      outputFormat: 'JSON with passed (number), total (number), failures (array)'
    },
    outputSchema: { type: 'object', required: ['passed'], properties: { passed: { type: 'number' }, total: { type: 'number' }, failures: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const commitTask = defineTask('commit', (args, taskCtx) => ({
  kind: 'agent', title: 'Commit fixes',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: 'Commit the arrow, row tooltip removal, and loader fixes',
      context: {},
      instructions: [
        'git add src/components/Tooltip.tsx src/components/ResultsTable.tsx src/app/page.tsx',
        'Commit: Fix tooltip arrow, remove row tooltips, fix orbiting ring animation',
        'Use heredoc. Do NOT push.'
      ],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
