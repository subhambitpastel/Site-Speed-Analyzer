/**
 * @process pdf-header-fix
 * @description Fix PDF header bar overlapping table content on subsequent pages
 * @inputs {}
 * @outputs { success: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  ctx.log('info', 'Fixing PDF header overlap issue');

  // Step 1: Fix the header overlap
  const fix = await ctx.task(fixPdfHeaderTask, {});

  // Step 2: Build verification
  const build = await ctx.task(verifyBuildTask, {});

  // Step 3: Git commit
  const commit = await ctx.task(gitCommitTask, {});

  return { success: true };
}

export const fixPdfHeaderTask = defineTask('fix-pdf-header', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix PDF header overlapping content',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend developer fixing PDF export',
      task: 'Fix the PDF header bar overlapping table content on subsequent pages in exportPDF.ts',
      context: {},
      instructions: [
        'Read src/lib/exportPDF.ts',
        'The issue: drawHeaderBar() draws a 20px header bar at the top of every page via didDrawPage callback.',
        'But autoTable does not know about this header, so on page 2+, table rows start at the default top margin and overlap the header bar.',
        'Fix: Add margin: { top: 28 } to BOTH autoTable calls so content on subsequent pages starts below the header.',
        'The header is 18px bar + 2px stripe = 20px, so top margin of 28 gives proper spacing.',
        'Also make sure the first autoTable startY is preserved (it already starts below the header on page 1).',
        'Actually edit the file.'
      ],
      outputFormat: 'JSON with success, summary'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, summary: { type: 'string' } } }
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
      task: 'Run npm run build and fix any errors',
      context: {},
      instructions: ['Run npm run build', 'Fix any errors', 'Report result'],
      outputFormat: 'JSON with success'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const gitCommitTask = defineTask('git-commit', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Git commit fix',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: 'Commit the PDF header fix',
      context: {},
      instructions: [
        'Stage changes: git add -A',
        'Commit with: git -c user.name="Shovan Bitpastel" -c user.email="shovan.bitpastel@gmail.com" commit -m "BUG-3 fix — PDF header no longer overlaps table content on subsequent pages"',
        'Do NOT push'
      ],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
