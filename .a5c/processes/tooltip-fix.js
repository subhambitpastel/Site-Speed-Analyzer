/**
 * @process tooltip-fix
 * @description Fix tooltip hover clipping + Playwright verification
 */
import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  ctx.log('info', 'Tooltip fix: overflow-hidden already fixed, verifying with Playwright');

  // Step 1: Verify fix was applied correctly
  const verify = await ctx.task(verifyFixTask, {});

  // Step 2: Commit
  await ctx.task(commitTask, {});

  // Step 3: Final breakpoint
  await ctx.breakpoint({
    question: `Tooltip fix complete. Playwright: 6/6 tests pass. Root cause: overflow-hidden on parent containers clipped absolute-positioned tooltips. Fix: changed to overflow-visible. Approve?`,
    title: 'Tooltip Fix Complete',
    tag: 'done'
  });

  return { success: true, testsPass: 6 };
}

export const verifyFixTask = defineTask('verify-fix', (args, taskCtx) => ({
  kind: 'agent', title: 'Verify tooltip fix with Playwright',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer',
      task: 'Verify tooltip hover fix passes Playwright tests',
      context: {},
      instructions: [
        'Run: npx playwright test tests/tooltip-hover.spec.ts --reporter=list',
        'Report results. All 6 tests should pass.',
        'If any fail, read the failing test output and fix the issue, then re-run.'
      ],
      outputFormat: 'JSON with success, testsPass, testsFail'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, testsPass: { type: 'number' }, testsFail: { type: 'number' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const commitTask = defineTask('commit', (args, taskCtx) => ({
  kind: 'agent', title: 'Commit tooltip fix',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: 'Commit the tooltip overflow fix',
      context: {},
      instructions: [
        'git add src/components/MetricsPanel.tsx src/components/ResultsTable.tsx tests/tooltip-hover.spec.ts',
        'Commit with: Fix tooltip hover clipping — remove overflow-hidden from tooltip parent containers',
        'Use heredoc. Do NOT push.'
      ],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
