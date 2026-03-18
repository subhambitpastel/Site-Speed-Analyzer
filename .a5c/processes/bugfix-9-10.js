/**
 * @process bugfix-9-10
 * @description Fix BUG-9 (dark mode default) and BUG-10 (resume analysis from exported files).
 * Sequential phases with quality-gated convergence loops and build verification.
 *
 * @inputs {
 *   targetQuality: number,
 *   maxIterations: number
 * }
 * @outputs {
 *   success: boolean,
 *   bugsFixed: number,
 *   phases: array
 * }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  const { targetQuality = 85, maxIterations = 3 } = inputs;
  const phaseResults = [];
  ctx.log('info', 'Starting Bug Fix Pipeline — BUG-9 and BUG-10');

  // ============================================================================
  // PHASE 1: BUG-9 — Default to Dark Mode on First Visit
  // ============================================================================

  ctx.log('info', '=== PHASE 1: BUG-9 — Default to Dark Mode ===');

  const phase1Fix = await ctx.task(fixDarkModeDefaultTask, {});

  const build1 = await ctx.task(verifyBuildTask, { phase: 'Phase 1 — Dark Mode Default' });

  let p1Score = 0;
  let p1Converged = false;
  let p1Iter = 0;

  const p1Initial = await ctx.task(scoreDarkModeTask, { iteration: 0, targetQuality });
  p1Score = p1Initial.overallScore || 0;
  p1Converged = p1Score >= targetQuality;

  while (!p1Converged && p1Iter < maxIterations) {
    p1Iter++;
    ctx.log('info', `Phase 1 refinement ${p1Iter}, score: ${p1Score}`);
    await ctx.task(refineDarkModeTask, { iteration: p1Iter, previousScore: p1Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 1 Refinement ${p1Iter}` });
    const newScore = await ctx.task(scoreDarkModeTask, { iteration: p1Iter, targetQuality });
    p1Score = newScore.overallScore || 0;
    p1Converged = p1Score >= targetQuality;
    if (p1Score - (p1Initial.overallScore || 0) <= 0 && p1Iter > 1) { ctx.log('warn', 'Phase 1 stalled'); break; }
  }

  phaseResults.push({ phase: 'Phase 1: Dark Mode Default', bug: 'BUG-9', score: p1Score, iterations: p1Iter, converged: p1Converged });

  await ctx.task(gitCommitTask, {
    phase: 'Phase 1',
    title: 'BUG-9 — Default to dark mode on first visit',
    summary: `Changed theme initialization to default to dark mode when no localStorage preference exists. Applied dark class before first paint to avoid flash. Score: ${p1Score}/${targetQuality}.`
  });

  await ctx.breakpoint({
    question: `Phase 1 done: Dark Mode Default (BUG-9). Score: ${p1Score}/${targetQuality}. Proceed to Phase 2 (Resume from Exported Files)?`,
    title: 'Phase 1 Review — Dark Mode',
    tag: 'phase-1-review'
  });

  // ============================================================================
  // PHASE 2: BUG-10 — Resume Analysis from Exported Files
  // ============================================================================

  ctx.log('info', '=== PHASE 2: BUG-10 — Resume from Exported Files ===');

  // Step 2.1: Analyze current FileUpload and export code
  const analysisResult = await ctx.task(analyzeResumeFeatureTask, {});

  // Step 2.2: Implement the resume feature
  const phase2Fix = await ctx.task(implementResumeFeatureTask, { analysis: analysisResult });

  const build2 = await ctx.task(verifyBuildTask, { phase: 'Phase 2 — Resume Feature' });

  // Step 2.3: Quality convergence loop
  let p2Score = 0;
  let p2Converged = false;
  let p2Iter = 0;

  const p2Initial = await ctx.task(scoreResumeFeatureTask, { iteration: 0, targetQuality });
  p2Score = p2Initial.overallScore || 0;
  p2Converged = p2Score >= targetQuality;

  while (!p2Converged && p2Iter < maxIterations) {
    p2Iter++;
    ctx.log('info', `Phase 2 refinement ${p2Iter}, score: ${p2Score}`);
    await ctx.task(refineResumeFeatureTask, { iteration: p2Iter, previousScore: p2Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 2 Refinement ${p2Iter}` });
    const newScore = await ctx.task(scoreResumeFeatureTask, { iteration: p2Iter, targetQuality });
    p2Score = newScore.overallScore || 0;
    p2Converged = p2Score >= targetQuality;
    if (p2Score - (p2Initial.overallScore || 0) <= 0 && p2Iter > 1) { ctx.log('warn', 'Phase 2 stalled'); break; }
  }

  phaseResults.push({ phase: 'Phase 2: Resume from Exported Files', bug: 'BUG-10', score: p2Score, iterations: p2Iter, converged: p2Converged });

  await ctx.task(gitCommitTask, {
    phase: 'Phase 2',
    title: 'BUG-10 — Resume analysis from previously exported files',
    summary: `Enhanced FileUpload to detect completed results in uploaded XLS/CSV/XLSX files, pre-populate results table, and only queue incomplete URLs for fresh analysis. Added "loaded from file" badges and import summary. Score: ${p2Score}/${targetQuality}.`
  });

  await ctx.breakpoint({
    question: `Phase 2 done: Resume from Exported Files (BUG-10). Score: ${p2Score}/${targetQuality}. Proceed to documentation?`,
    title: 'Phase 2 Review — Resume Feature',
    tag: 'phase-2-review'
  });

  // ============================================================================
  // FINAL: Documentation & Cleanup
  // ============================================================================

  ctx.log('info', '=== FINAL: Documentation & Cleanup ===');

  await ctx.task(documentFixesTask, {
    phases: phaseResults,
    bugsFixed: ['BUG-9', 'BUG-10']
  });

  const finalBuild = await ctx.task(verifyBuildTask, { phase: 'Final Build' });

  await ctx.task(gitCommitTask, {
    phase: 'Final',
    title: 'Document BUG-9 and BUG-10 fixes, clean up TO_BE_FIXED.md',
    summary: 'Updated RECENT_FIXATION.md with both bug fix entries, removed fixed bugs from TO_BE_FIXED.md.'
  });

  await ctx.breakpoint({
    question: `All done. Final build: ${finalBuild.success ? 'PASSED' : 'FAILED'}. Phases: ${phaseResults.map(p => `${p.phase}: ${p.score}`).join(', ')}. Approve completion?`,
    title: 'Final Review — Both Bugs Fixed',
    tag: 'final-review'
  });

  return {
    success: true,
    bugsFixed: 2,
    phases: phaseResults
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

// --- Phase 1: Dark Mode Default ---

export const fixDarkModeDefaultTask = defineTask('fix-dark-mode-default', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix dark mode default (BUG-9)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in Next.js theme systems and dark mode implementation',
      task: 'Make the app default to dark mode on first visit when no theme preference is stored in localStorage',
      context: {},
      instructions: [
        'Read these files first: src/app/page.tsx, src/app/layout.tsx, src/app/globals.css',
        '',
        '=== BUG-9: Default to Dark Mode ===',
        'The app should default to dark mode when:',
        '- No theme preference exists in localStorage (first-time visitors)',
        '- localStorage has been cleared',
        '',
        'Requirements:',
        '1. Change the initial theme state to default to "dark" instead of "light" or system preference',
        '2. If a user has already chosen a theme, their stored preference MUST still be respected',
        '3. Apply the "dark" class to <html> BEFORE first paint to avoid flash of light mode (FOUC)',
        '4. This means adding an inline <script> in layout.tsx or head that runs synchronously before React hydrates',
        '',
        '=== Implementation approach ===',
        '- In layout.tsx, add a blocking inline script in <head> that:',
        '  1. Reads localStorage theme preference',
        '  2. If no preference exists, defaults to "dark"',
        '  3. Sets the "dark" class on document.documentElement immediately',
        '- In page.tsx, update the useState initializer for darkMode/theme to default to true/dark',
        '- Make sure the initial React state matches what the inline script set to avoid hydration mismatch',
        '',
        'CRITICAL: Ensure no flash of light mode on first load.',
        'CRITICAL: Existing user preferences in localStorage must still be respected.',
        'Actually edit the files in the codebase.',
        'Return a summary of changes made.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const scoreDarkModeTask = defineTask('score-dark-mode', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score dark mode (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend QA reviewer specializing in theme systems',
      task: 'Score the dark mode default implementation for BUG-9',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read: src/app/page.tsx, src/app/layout.tsx, src/app/globals.css',
        '',
        '=== SCORING RUBRIC (100 points) ===',
        'Default State (30 pts): Does the initial state default to dark when no localStorage value exists?',
        'FOUC Prevention (30 pts): Is there a blocking inline script that applies dark class before first paint?',
        'localStorage Respect (20 pts): If user previously chose light mode, does it stay light?',
        'Hydration Safety (10 pts): Does React initial state match what the inline script sets? No mismatch warnings?',
        'Code Quality (10 pts): Clean implementation, no unnecessary complexity?',
        '',
        'BE STRICT. Deduct points for:',
        '- No inline blocking script (relying only on React state = FOUC)',
        '- Not checking localStorage before defaulting',
        '- Potential hydration mismatch',
        '',
        'DO NOT modify any files.'
      ],
      outputFormat: 'JSON with overallScore (0-100), breakdown, gaps'
    },
    outputSchema: {
      type: 'object',
      required: ['overallScore', 'gaps'],
      properties: { overallScore: { type: 'number' }, breakdown: { type: 'object' }, gaps: { type: 'array' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const refineDarkModeTask = defineTask('refine-dark-mode', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine dark mode (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer refining dark mode implementation',
      task: 'Address quality feedback to improve the dark mode default implementation',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: [
        'Read src/app/page.tsx, src/app/layout.tsx and address remaining gaps.',
        'Focus on highest-impact issues first.',
        'Ensure: blocking inline script, localStorage check, correct default, no FOUC.',
        'Actually edit the files.'
      ],
      outputFormat: 'JSON with success, changesApplied, filesModified'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, changesApplied: { type: 'array' }, filesModified: { type: 'array' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// --- Phase 2: Resume from Exported Files ---

export const analyzeResumeFeatureTask = defineTask('analyze-resume-feature', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Analyze codebase for resume feature',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend architect analyzing existing code to plan a feature',
      task: 'Analyze the current FileUpload, export, and page orchestration code to plan the resume-from-exported-files feature',
      context: {},
      instructions: [
        'Read ALL of these files carefully:',
        '- src/components/FileUpload.tsx (current upload logic)',
        '- src/app/page.tsx (orchestration, results state, worker pool)',
        '- src/lib/exportCSV.ts (CSV/XLS export format)',
        '- src/lib/exportDOCX.ts (DOCX export format)',
        '- src/lib/exportPDF.ts (PDF export format)',
        '- src/types/report.ts (LighthouseReport type)',
        '- src/lib/reportParser.ts (how reports are parsed)',
        '',
        'Analyze and report:',
        '1. What data fields are exported in XLS/CSV files (column names, data types)',
        '2. What the LighthouseReport type looks like (all fields)',
        '3. How results[] state is structured and updated in page.tsx',
        '4. How FileUpload currently processes uploaded files (what it extracts)',
        '5. What parsing libraries are available (xlsx, etc.)',
        '6. Recommended approach for detecting completed vs incomplete results in uploaded files',
        '7. How to reconstruct a LighthouseReport from exported data',
        '',
        'DO NOT modify any files — only analyze and report.',
        'Be thorough and specific about column names, types, and data flow.'
      ],
      outputFormat: 'JSON with exportFormat (object describing columns), reportType (LighthouseReport fields), currentUploadFlow (string), recommendedApproach (string), parsingStrategy (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['exportFormat', 'recommendedApproach'],
      properties: {
        exportFormat: { type: 'object' },
        reportType: { type: 'object' },
        currentUploadFlow: { type: 'string' },
        recommendedApproach: { type: 'string' },
        parsingStrategy: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const implementResumeFeatureTask = defineTask('implement-resume-feature', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Implement resume from exported files (BUG-10)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in data parsing and complex React state management',
      task: 'Implement the resume-from-exported-files feature for BUG-10',
      context: { analysis: args.analysis },
      instructions: [
        'Read these files first: src/components/FileUpload.tsx, src/app/page.tsx, src/types/report.ts, src/lib/exportCSV.ts, src/lib/reportParser.ts',
        '',
        '=== BUG-10: Resume Analysis from Exported Files ===',
        '',
        'When a user uploads an XLS/CSV/XLSX file that was previously exported from this app:',
        '',
        '1. DETECT completed results:',
        '   - Parse the uploaded file and check each row for score data (Performance, Accessibility, SEO, Best Practices scores)',
        '   - A row is "completed" if it has valid numeric scores (not empty/null/zero for all scores)',
        '   - A row is "incomplete" if it has a URL but no scores or all scores are 0/empty',
        '',
        '2. PRE-POPULATE completed results:',
        '   - For rows with completed data, reconstruct a LighthouseReport object from the exported data',
        '   - Map exported columns back to LighthouseReport fields (scores, metrics like FCP/LCP/TBT/CLS/TTI, URL, fetchedAt)',
        '   - Insert these into the results array immediately — user sees them in the table instantly',
        '   - Mark these results with a flag like `loadedFromFile: true`',
        '',
        '3. QUEUE incomplete URLs:',
        '   - URLs without complete results get queued for fresh analysis',
        '   - The analysis flow should work normally for these URLs',
        '',
        '4. UX requirements:',
        '   - Add a "loaded from file" badge (small pill) on results that came from the file',
        '   - Show an import summary toast/banner: "Loaded X completed results, Y sites queued for analysis"',
        '   - The badge should be subtle — a small label like "📄 From file" or similar',
        '   - Style consistently with existing dark/light mode',
        '',
        '5. Implementation approach:',
        '   - Modify FileUpload.tsx to return both URLs AND parsed results',
        '   - Update the onUrlsLoaded callback (or add a new one) in page.tsx to accept pre-populated results',
        '   - In page.tsx, when receiving file data, set completed results directly and only queue the rest',
        '   - Add `loadedFromFile?: boolean` to the report type or result wrapper',
        '',
        'CRITICAL: Keep ALL existing upload-URLs-only functionality working.',
        'CRITICAL: Handle edge cases — corrupted data, missing columns, mixed formats.',
        'CRITICAL: The feature should work with XLS (Excel XML), CSV, and XLSX formats.',
        'Actually edit the files in the codebase.',
        'Return a detailed summary of all changes.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const scoreResumeFeatureTask = defineTask('score-resume-feature', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score resume feature (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior QA engineer reviewing a complex data import feature',
      task: 'Score the resume-from-exported-files implementation for BUG-10',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read: src/components/FileUpload.tsx, src/app/page.tsx, src/types/report.ts',
        '',
        '=== SCORING RUBRIC (100 points) ===',
        'Detection Logic (20 pts): Can it detect which rows have completed results vs just URLs?',
        'Data Reconstruction (20 pts): Are LighthouseReport objects correctly reconstructed from exported data?',
        'Pre-population (15 pts): Do completed results appear immediately in the results table?',
        'Queue Logic (15 pts): Are only incomplete URLs queued for fresh analysis?',
        'UX — Badge (10 pts): Is there a "loaded from file" badge on imported results?',
        'UX — Summary (10 pts): Is there an import summary showing count of loaded vs queued?',
        'Edge Cases (10 pts): Handles missing columns, corrupted data, empty files gracefully?',
        '',
        'BE STRICT. Deduct points for:',
        '- Not actually parsing score data from uploaded files',
        '- Missing loadedFromFile flag or badge',
        '- No import summary message',
        '- Breaking existing URL-only upload flow',
        '',
        'DO NOT modify any files.'
      ],
      outputFormat: 'JSON with overallScore (0-100), breakdown, gaps'
    },
    outputSchema: {
      type: 'object',
      required: ['overallScore', 'gaps'],
      properties: { overallScore: { type: 'number' }, breakdown: { type: 'object' }, gaps: { type: 'array' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const refineResumeFeatureTask = defineTask('refine-resume-feature', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine resume feature (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer refining a data import and resume feature',
      task: 'Address quality feedback to improve the resume-from-exported-files feature',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: [
        'Read src/components/FileUpload.tsx, src/app/page.tsx, src/types/report.ts',
        'Address remaining quality gaps from the scoring.',
        'Focus on highest-impact issues first.',
        'Ensure: detection logic, data reconstruction, pre-population, badges, summary message.',
        'Make targeted changes — do not over-change.',
        'Actually edit the files.'
      ],
      outputFormat: 'JSON with success, changesApplied, filesModified'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, changesApplied: { type: 'array' }, filesModified: { type: 'array' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// --- Shared tasks ---

export const documentFixesTask = defineTask('document-fixes', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Document BUG-9 and BUG-10 fixes',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical writer documenting bug fixes following BUG_FIX_RULES.md format',
      task: 'Document both bug fixes in RECENT_FIXATION.md and remove them from TO_BE_FIXED.md',
      context: { phases: args.phases, bugsFixed: args.bugsFixed },
      instructions: [
        'Read BUG_FIX_RULES.md for the exact format.',
        'Read RECENT_FIXATION.md to see current state and numbering (add new entries AT THE TOP below the header/separator).',
        'Read TO_BE_FIXED.md to see the original bug descriptions.',
        '',
        'Add 2 new entries at the top of RECENT_FIXATION.md (continuing from the current highest number):',
        '',
        'Entry for BUG-9: Default to Dark Mode on First Visit',
        '- Document: changed theme initialization, added inline blocking script, localStorage check',
        '- List files modified (page.tsx, layout.tsx, etc.)',
        '- Verified by: build passes, no FOUC, existing preferences respected',
        '',
        'Entry for BUG-10: Resume Analysis from Previously Exported Files',
        '- Document: enhanced FileUpload to parse completed results, pre-populate table, queue only incomplete URLs',
        '- List files modified (FileUpload.tsx, page.tsx, types/report.ts, etc.)',
        '- Verified by: build passes, quality scoring',
        '',
        'Then REMOVE both BUG-9 and BUG-10 entries from TO_BE_FIXED.md.',
        'Keep the file header ("# Bugs To Be Fixed") and the note paragraph and separator.',
        '',
        'Today\'s date is 2026-03-18.',
        'Actually edit both files.'
      ],
      outputFormat: 'JSON with success, filesModified'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, filesModified: { type: 'array' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const gitCommitTask = defineTask('git-commit', (args, taskCtx) => ({
  kind: 'agent',
  title: `Git commit: ${args.phase}`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: `Create a git commit for ${args.phase}`,
      context: { phase: args.phase, title: args.title, summary: args.summary },
      instructions: [
        'Stage all changed files with: git add -A',
        `Create a commit with message:`,
        `${args.title}`,
        '',
        `${args.summary}`,
        '',
        'Use a heredoc to pass the commit message.',
        'Do NOT push to remote.',
        'Report the commit hash.'
      ],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const verifyBuildTask = defineTask('verify-build', (args, taskCtx) => ({
  kind: 'agent',
  title: `Verify build (${args.phase})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Build engineer',
      task: 'Run Next.js build to verify compilation',
      context: { phase: args.phase },
      instructions: [
        'Run: npm run build',
        'If there are TypeScript or build errors, fix them and re-run.',
        'Report whether the build succeeded.',
        'If fixes were needed, list what was fixed.'
      ],
      outputFormat: 'JSON with success, fixesApplied'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: { success: { type: 'boolean' }, fixesApplied: { type: 'array' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));
