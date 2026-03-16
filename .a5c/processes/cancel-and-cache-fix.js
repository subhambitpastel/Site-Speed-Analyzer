/**
 * @process cancel-and-cache-fix
 * @description Fix cancel button abort and strategy toggle results caching
 * @inputs {}
 * @outputs { success: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  ctx.log('info', 'Fixing cancel abort and strategy cache bugs');

  const fix = await ctx.task(fixBothBugsTask, {});
  const build = await ctx.task(verifyBuildTask, {});
  const doc = await ctx.task(documentAndCommitTask, {});

  return { success: true };
}

export const fixBothBugsTask = defineTask('fix-both-bugs', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix cancel abort and strategy cache',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior React developer',
      task: 'Fix two bugs in the Lighthouse Bulk Reporter: cancel button not aborting immediately, and strategy toggle losing results',
      context: {},
      instructions: [
        'Read src/app/page.tsx and src/lib/pagespeedClient.ts',
        '',
        '=== BUG-1: Cancel button does not abort immediately ===',
        'Problem: Cancel sets abortRef.current = true, but in-flight fetch() calls continue running.',
        'The AbortController in fetchReport is local and not connected to the cancel button.',
        '',
        'Fix in pagespeedClient.ts:',
        '- Add optional signal parameter: fetchReport(url, strategy, signal?: AbortSignal)',
        '- Pass the signal to the fetch() call: fetch(endpoint, { signal: signal || controller.signal })',
        '- If an external signal is provided, still use the internal timeout controller but combine them',
        '- Actually the cleanest approach: accept an optional AbortSignal, and if provided, use AbortSignal.any([controller.signal, signal]) to combine timeout + external abort. If AbortSignal.any is not available, just listen for the external signal to abort the internal controller.',
        '',
        'Fix in page.tsx:',
        '- Replace abortRef (boolean) with an AbortController ref: const abortControllerRef = useRef<AbortController | null>(null)',
        '- In handleSubmit: create new AbortController, store in ref, pass its signal to fetchReport',
        '- In cancel button onClick: call abortControllerRef.current?.abort(), then immediately set isLoading to false',
        '- In processUrl: pass the signal from the controller to fetchReport',
        '- When abort happens, catch the AbortError and mark remaining URLs as cancelled',
        '',
        '=== BUG-2: Strategy toggle loses results ===',
        'Problem: Toggling between mobile/desktop clears results and would need a re-analysis.',
        '',
        'Fix in page.tsx:',
        '- Add a results cache ref: const resultsCacheRef = useRef<Map<string, LighthouseReport[]>>(new Map())',
        '- When analysis completes (after Promise.all(workers)), save results to cache: resultsCacheRef.current.set(strategy, results)',
        '- Actually, update the cache progressively as each URL completes, not just at the end',
        '- When strategy changes (in the strategy toggle onClick or via useEffect on strategy):',
        '  - If cache has results for the new strategy, show them immediately: setResults(cached)',
        '  - If no cache, just clear results (user needs to re-run)',
        '  - Do NOT auto-trigger a new analysis on toggle',
        '- Enable strategy toggle even during idle (when not loading) so users can switch freely',
        '- The strategy toggle should NOT be disabled when results are showing',
        '',
        'IMPORTANT: Keep all other functionality working. Actually edit both files.',
        'Test that the build passes after changes.'
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
      task: 'Run npm run build and fix any errors',
      context: {},
      instructions: ['Run: npm run build', 'Fix any errors', 'Report result'],
      outputFormat: 'JSON with success'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const documentAndCommitTask = defineTask('document-and-commit', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Document and commit',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical writer and version control engineer',
      task: 'Document both bug fixes and commit',
      context: {},
      instructions: [
        'Read BUG_FIX_RULES.md for entry format',
        'Read RECENT_FIXATION.md and TO_BE_FIXED.md',
        '',
        '1. Add TWO entries to RECENT_FIXATION.md (at top, below header):',
        '',
        '### 5. Cancel Button Instantly Aborts Analysis (2026-03-16)',
        '- **Bug:** Cancel button did not stop in-flight API requests immediately',
        '- **Root cause:** Cancel only set a boolean flag; in-flight fetch() calls were not aborted',
        '- **Fix:** Added AbortController integration - cancel now aborts all in-flight fetch requests instantly, clears loading state, and marks remaining URLs as cancelled',
        '- **Files modified:** src/app/page.tsx, src/lib/pagespeedClient.ts',
        '- **Verified by:** Build passes',
        '',
        '### 6. Strategy Toggle Caches Results Per Device Type (2026-03-16)',
        '- **Bug:** Switching between Desktop/Mobile toggle re-triggered analysis instead of showing cached results',
        '- **Root cause:** No results caching per device type; strategy change cleared results',
        '- **Fix:** Added in-memory results cache per strategy (mobile/desktop). Toggling shows cached results instantly. Only fetches if no cached data exists for that strategy.',
        '- **Files modified:** src/app/page.tsx',
        '- **Verified by:** Build passes',
        '',
        '2. Remove BOTH BUG-1 and BUG-2 entries from TO_BE_FIXED.md (keep header)',
        '',
        '3. Git commit:',
        '   git add -A',
        '   git -c user.name="Shovan Bitpastel" -c user.email="shovan.bitpastel@gmail.com" commit -m "BUG-1 & BUG-2 — Fix cancel abort and strategy toggle caching"',
        '   Do NOT push',
        '',
        'Actually edit files and commit.'
      ],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
