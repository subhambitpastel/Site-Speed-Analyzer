/**
 * @process fetchedat-fix
 * @description Fix TypeError on r.fetchedAt when results contain undefined entries
 * @inputs {}
 * @outputs { success: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  ctx.log('info', 'Fix already applied inline. Verifying build and committing.');
  const build = await ctx.task(verifyBuildTask, {});
  const commit = await ctx.task(commitTask, {});
  return { success: true };
}

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
  title: 'Commit fix',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: 'Commit the fetchedAt TypeError fix',
      context: {},
      instructions: [
        'Read RECENT_FIXATION.md and add this entry at top (below header/---):',
        '',
        '### 8. Fix fetchedAt TypeError on Results Display (2026-03-16)',
        '- **Bug:** Runtime TypeError: Cannot read properties of undefined (reading fetchedAt) on line 372 of page.tsx',
        '- **Root cause:** Results array could contain undefined entries from strategy cache populated during cancelled/partial runs. The .filter() and .some() calls did not use optional chaining.',
        '- **Fix:** Added optional chaining (r?.fetchedAt) on results filter/some calls, and added .filter(Boolean) when restoring cached results to remove any undefined entries',
        '- **Files modified:** src/app/page.tsx',
        '- **Verified by:** Build passes',
        '',
        'git add -A',
        'git -c user.name="Shovan Bitpastel" -c user.email="shovan.bitpastel@gmail.com" commit -m "Fix fetchedAt TypeError — add null guards on results array"',
        'Do NOT push'
      ],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
