/**
 * @process tooltip-headed
 * @description Fix tooltip hover with headed (visible) browser Playwright testing. Iterate until user approves.
 */
import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  const { maxFixIterations = 5 } = inputs;
  ctx.log('info', 'Tooltip headed browser fix — iterate until user approves');

  let iteration = 0;
  let approved = false;

  while (!approved && iteration < maxFixIterations) {
    iteration++;
    ctx.log('info', `=== Iteration ${iteration} ===`);

    // Step 1: Run headed Playwright test
    const testResult = await ctx.task(runHeadedTestTask, { iteration });

    // Step 2: If tests fail, fix the issues
    if (!testResult.allPass) {
      await ctx.task(fixTooltipIssuesTask, { testResult, iteration });
      await ctx.task(buildVerifyTask, { iteration });
    }

    // Step 3: Ask user if it looks good now (they can see the browser)
    const bp = await ctx.breakpoint({
      question: `Iteration ${iteration}: Playwright ran with visible browser. Tests: ${testResult.passed}/${testResult.total} pass. Screenshots in test-results/. Did you see the tooltips working? Approve or request another iteration?`,
      title: `Iteration ${iteration} Review`,
      tag: `iter-${iteration}`
    });

    // Check if user approved
    if (bp && bp.approved !== false) {
      approved = true;
    }
  }

  // Final commit
  await ctx.task(commitTask, { iteration });

  return { success: true, iterations: iteration, approved };
}

export const runHeadedTestTask = defineTask('run-headed-test', (args, taskCtx) => ({
  kind: 'agent', title: `Run headed Playwright test (iter ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer running visual browser tests',
      task: 'Run Playwright tooltip tests with headed (visible) browser',
      context: { iteration: args.iteration },
      instructions: [
        'Run: npx playwright test tests/tooltip-visual.spec.ts --reporter=list',
        'The browser will open visibly (headless=false in playwright.config.ts)',
        'Report the results: how many passed, how many failed, what failed',
        'Also check the screenshots in test-results/ directory',
        'If tests fail, report the EXACT error messages'
      ],
      outputFormat: 'JSON with allPass (boolean), passed (number), total (number), failures (array of strings)'
    },
    outputSchema: { type: 'object', required: ['allPass'], properties: { allPass: { type: 'boolean' }, passed: { type: 'number' }, total: { type: 'number' }, failures: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const fixTooltipIssuesTask = defineTask('fix-tooltip-issues', (args, taskCtx) => ({
  kind: 'agent', title: `Fix tooltip issues (iter ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert frontend developer fixing tooltip hover issues',
      task: 'Fix tooltip hover/display issues based on test results',
      context: { testResult: args.testResult, iteration: args.iteration },
      instructions: [
        'Read the test failures and fix the root causes',
        'Common issues:',
        '- overflow:hidden on ancestor elements clips absolute tooltips',
        '- z-index too low, tooltip hidden behind other elements',
        '- CSS group-hover not triggering (wrong nesting)',
        '- Tooltip positioned off-screen (bottom-full goes above viewport)',
        '',
        'Read: src/components/Tooltip.tsx, src/components/ResultsTable.tsx, src/components/ScoreChart.tsx, src/components/MetricsPanel.tsx, src/app/globals.css',
        'Fix the issues. Actually edit files.'
      ],
      outputFormat: 'JSON with success, fixesApplied, filesModified'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, fixesApplied: { type: 'array' }, filesModified: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const buildVerifyTask = defineTask('build-verify', (args, taskCtx) => ({
  kind: 'agent', title: 'Verify build',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Build engineer',
      task: 'Run npm run build, fix errors',
      context: {},
      instructions: ['Run: npm run build', 'Fix any errors, re-run.'],
      outputFormat: 'JSON with success'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const commitTask = defineTask('commit', (args, taskCtx) => ({
  kind: 'agent', title: 'Commit fixes',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: 'Commit tooltip fixes',
      context: { iteration: args.iteration },
      instructions: ['git add -A', 'Commit: Fix tooltip hover — verified with headed Playwright browser', 'Use heredoc. Do NOT push.'],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
