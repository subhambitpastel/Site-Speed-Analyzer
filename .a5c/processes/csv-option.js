/**
 * @process csv-option
 * @description Add plain CSV export option alongside Excel XLS. Simple commit + done.
 */
import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  ctx.log('info', 'CSV option: commit and done');
  await ctx.task(commitTask, {});
  await ctx.breakpoint({ question: 'CSV option added alongside Excel. Export dropdown now shows: Excel (.xls with colors), CSV (.csv plain), PDF, DOCX. Approve?', title: 'Done', tag: 'done' });
  return { success: true };
}

export const commitTask = defineTask('commit', (args, taskCtx) => ({
  kind: 'agent', title: 'Commit CSV option',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: 'Commit the CSV export option addition',
      context: {},
      instructions: ['git add src/lib/exportCSV.ts src/components/ExportDropdown.tsx', 'Commit: Add plain CSV export option alongside color-coded Excel XLS', 'Use heredoc. Do NOT push.'],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
