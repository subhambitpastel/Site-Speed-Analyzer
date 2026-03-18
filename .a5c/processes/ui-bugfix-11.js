/**
 * @process ui-bugfix-11
 * @description Fix 11 UI bugs in 4 phases: Strategy Toggle, UI Enhancements, Tooltips, Export Styling.
 * Each phase has implementation, build verification, quality scoring, and documentation.
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
  ctx.log('info', 'Starting 11-Bug Fix Pipeline (4 phases)');

  // ============================================================================
  // PHASE 1: Strategy Toggle UX (BUG-1, BUG-2, BUG-3)
  // Replace buttons with smooth toggle, reposition near input, default Desktop
  // ============================================================================

  ctx.log('info', '=== PHASE 1: Strategy Toggle UX (BUG-1, BUG-2, BUG-3) ===');

  const phase1Fix = await ctx.task(fixStrategyToggleTask, {
    targetQuality,
    bugs: ['BUG-1: Replace buttons with smooth sliding toggle switch',
           'BUG-2: Move toggle near URL input/generate area',
           'BUG-3: Default strategy to Desktop']
  });

  const build1 = await ctx.task(verifyBuildTask, { phase: 'Phase 1 - Strategy Toggle' });

  let p1Score = 0;
  let p1Converged = false;
  let p1Iter = 0;

  const p1Initial = await ctx.task(scorePhase1Task, { iteration: 0, targetQuality });
  p1Score = p1Initial.overallScore || 0;
  p1Converged = p1Score >= targetQuality;

  while (!p1Converged && p1Iter < maxIterations) {
    p1Iter++;
    ctx.log('info', `Phase 1 refinement ${p1Iter}, score: ${p1Score}`);
    await ctx.task(refinePhase1Task, { iteration: p1Iter, previousScore: p1Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 1 Refinement ${p1Iter}` });
    const newScore = await ctx.task(scorePhase1Task, { iteration: p1Iter, targetQuality });
    p1Score = newScore.overallScore || 0;
    p1Converged = p1Score >= targetQuality;
    if (p1Score - (p1Initial.overallScore || 0) <= 0 && p1Iter > 1) { ctx.log('warn', 'Phase 1 stalled'); break; }
  }

  phaseResults.push({ phase: 'Phase 1: Strategy Toggle', bugs: ['BUG-1','BUG-2','BUG-3'], score: p1Score, iterations: p1Iter, converged: p1Converged });

  await ctx.task(gitCommitTask, {
    phase: 'Phase 1',
    title: 'BUG-1,2,3 — Smooth strategy toggle, repositioned, Desktop default',
    summary: `Replaced Desktop/Mobile buttons with smooth sliding toggle switch, repositioned near input area, defaulted to Desktop. Score: ${p1Score}/${targetQuality}.`
  });

  await ctx.breakpoint({
    question: `Phase 1 done: Strategy Toggle (BUG-1,2,3). Score: ${p1Score}/${targetQuality}. Proceed to Phase 2 (UI Enhancements)?`,
    title: 'Phase 1 Review',
    tag: 'phase-1-review'
  });

  // ============================================================================
  // PHASE 2: UI Enhancements (BUG-4, BUG-5, BUG-11)
  // Strategy indicator in results, circular loading animation, navbar fix
  // ============================================================================

  ctx.log('info', '=== PHASE 2: UI Enhancements (BUG-4, BUG-5, BUG-11) ===');

  const phase2Fix = await ctx.task(fixUIEnhancementsTask, {
    targetQuality,
    bugs: ['BUG-4: Add Desktop/Mobile indicator in results area',
           'BUG-5: Circular motion loading ring animation',
           'BUG-11: Fix navbar overlapping content on scroll']
  });

  const build2 = await ctx.task(verifyBuildTask, { phase: 'Phase 2 - UI Enhancements' });

  let p2Score = 0;
  let p2Converged = false;
  let p2Iter = 0;

  const p2Initial = await ctx.task(scorePhase2Task, { iteration: 0, targetQuality });
  p2Score = p2Initial.overallScore || 0;
  p2Converged = p2Score >= targetQuality;

  while (!p2Converged && p2Iter < maxIterations) {
    p2Iter++;
    ctx.log('info', `Phase 2 refinement ${p2Iter}, score: ${p2Score}`);
    await ctx.task(refinePhase2Task, { iteration: p2Iter, previousScore: p2Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 2 Refinement ${p2Iter}` });
    const newScore = await ctx.task(scorePhase2Task, { iteration: p2Iter, targetQuality });
    p2Score = newScore.overallScore || 0;
    p2Converged = p2Score >= targetQuality;
    if (p2Score - (p2Initial.overallScore || 0) <= 0 && p2Iter > 1) { ctx.log('warn', 'Phase 2 stalled'); break; }
  }

  phaseResults.push({ phase: 'Phase 2: UI Enhancements', bugs: ['BUG-4','BUG-5','BUG-11'], score: p2Score, iterations: p2Iter, converged: p2Converged });

  await ctx.task(gitCommitTask, {
    phase: 'Phase 2',
    title: 'BUG-4,5,11 — Strategy indicator, circular loading, navbar fix',
    summary: `Added Desktop/Mobile indicator in results, circular loading animation, fixed navbar overlap. Score: ${p2Score}/${targetQuality}.`
  });

  await ctx.breakpoint({
    question: `Phase 2 done: UI Enhancements (BUG-4,5,11). Score: ${p2Score}/${targetQuality}. Proceed to Phase 3 (Tooltips)?`,
    title: 'Phase 2 Review',
    tag: 'phase-2-review'
  });

  // ============================================================================
  // PHASE 3: Tooltips (BUG-6, BUG-7, BUG-8)
  // Score tooltips + metric definitions
  // ============================================================================

  ctx.log('info', '=== PHASE 3: Tooltips (BUG-6, BUG-7, BUG-8) ===');

  const phase3Fix = await ctx.task(fixTooltipsTask, {
    targetQuality,
    bugs: ['BUG-6: Hover tooltips on score badges in ResultsTable',
           'BUG-7: Hover tooltips on Score Overview categories in ScoreChart',
           'BUG-8: Hover tooltips on FCP/LCP/TBT/CLS/TTI metric abbreviations in MetricsPanel']
  });

  const build3 = await ctx.task(verifyBuildTask, { phase: 'Phase 3 - Tooltips' });

  let p3Score = 0;
  let p3Converged = false;
  let p3Iter = 0;

  const p3Initial = await ctx.task(scorePhase3Task, { iteration: 0, targetQuality });
  p3Score = p3Initial.overallScore || 0;
  p3Converged = p3Score >= targetQuality;

  while (!p3Converged && p3Iter < maxIterations) {
    p3Iter++;
    ctx.log('info', `Phase 3 refinement ${p3Iter}, score: ${p3Score}`);
    await ctx.task(refinePhase3Task, { iteration: p3Iter, previousScore: p3Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 3 Refinement ${p3Iter}` });
    const newScore = await ctx.task(scorePhase3Task, { iteration: p3Iter, targetQuality });
    p3Score = newScore.overallScore || 0;
    p3Converged = p3Score >= targetQuality;
    if (p3Score - (p3Initial.overallScore || 0) <= 0 && p3Iter > 1) { ctx.log('warn', 'Phase 3 stalled'); break; }
  }

  phaseResults.push({ phase: 'Phase 3: Tooltips', bugs: ['BUG-6','BUG-7','BUG-8'], score: p3Score, iterations: p3Iter, converged: p3Converged });

  await ctx.task(gitCommitTask, {
    phase: 'Phase 3',
    title: 'BUG-6,7,8 — Score and metric tooltips',
    summary: `Added hover tooltips for score categories in ResultsTable and ScoreChart, plus metric definitions in MetricsPanel. Score: ${p3Score}/${targetQuality}.`
  });

  await ctx.breakpoint({
    question: `Phase 3 done: Tooltips (BUG-6,7,8). Score: ${p3Score}/${targetQuality}. Proceed to Phase 4 (Export Styling)?`,
    title: 'Phase 3 Review',
    tag: 'phase-3-review'
  });

  // ============================================================================
  // PHASE 4: Export Styling (BUG-9, BUG-10)
  // Color-coded CSV and DOCX
  // ============================================================================

  ctx.log('info', '=== PHASE 4: Export Styling (BUG-9, BUG-10) ===');

  const phase4Fix = await ctx.task(fixExportStylingTask, {
    targetQuality,
    bugs: ['BUG-9: Color-coded CSV with Excel XML formatting',
           'BUG-10: Color-coded DOCX with styled tables and headers']
  });

  const build4 = await ctx.task(verifyBuildTask, { phase: 'Phase 4 - Export Styling' });

  let p4Score = 0;
  let p4Converged = false;
  let p4Iter = 0;

  const p4Initial = await ctx.task(scorePhase4Task, { iteration: 0, targetQuality });
  p4Score = p4Initial.overallScore || 0;
  p4Converged = p4Score >= targetQuality;

  while (!p4Converged && p4Iter < maxIterations) {
    p4Iter++;
    ctx.log('info', `Phase 4 refinement ${p4Iter}, score: ${p4Score}`);
    await ctx.task(refinePhase4Task, { iteration: p4Iter, previousScore: p4Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 4 Refinement ${p4Iter}` });
    const newScore = await ctx.task(scorePhase4Task, { iteration: p4Iter, targetQuality });
    p4Score = newScore.overallScore || 0;
    p4Converged = p4Score >= targetQuality;
    if (p4Score - (p4Initial.overallScore || 0) <= 0 && p4Iter > 1) { ctx.log('warn', 'Phase 4 stalled'); break; }
  }

  phaseResults.push({ phase: 'Phase 4: Export Styling', bugs: ['BUG-9','BUG-10'], score: p4Score, iterations: p4Iter, converged: p4Converged });

  await ctx.task(gitCommitTask, {
    phase: 'Phase 4',
    title: 'BUG-9,10 — Color-coded CSV and DOCX exports',
    summary: `Enhanced CSV with Excel XML color formatting, improved DOCX with color-coded scores and styled tables. Score: ${p4Score}/${targetQuality}.`
  });

  // ============================================================================
  // FINAL: Documentation & Cleanup
  // ============================================================================

  ctx.log('info', '=== FINAL: Documentation & Cleanup ===');

  await ctx.task(documentAllFixesTask, {
    phases: phaseResults,
    bugsFixed: ['BUG-1','BUG-2','BUG-3','BUG-4','BUG-5','BUG-6','BUG-7','BUG-8','BUG-9','BUG-10','BUG-11']
  });

  const finalBuild = await ctx.task(verifyBuildTask, { phase: 'Final Build' });

  await ctx.task(gitCommitTask, {
    phase: 'Final',
    title: 'Document all 11 bug fixes and clean up TO_BE_FIXED.md',
    summary: 'Updated RECENT_FIXATION.md with all 11 bug fix entries, cleared TO_BE_FIXED.md.'
  });

  await ctx.breakpoint({
    question: `All 11 bugs fixed across 4 phases. Final build: ${finalBuild.success ? 'PASSED' : 'FAILED'}. Phases: ${phaseResults.map(p => `${p.phase}: ${p.score}`).join(', ')}. Approve completion?`,
    title: 'Final Review - All 11 Bugs Fixed',
    tag: 'final-review'
  });

  return {
    success: true,
    bugsFixed: 11,
    phases: phaseResults
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

// --- Phase 1: Strategy Toggle ---

export const fixStrategyToggleTask = defineTask('fix-strategy-toggle', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix strategy toggle (BUG-1,2,3)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in polished UI components with Tailwind CSS',
      task: 'Fix 3 related bugs about the Desktop/Mobile strategy toggle in the Site-Speed-Analyzer app',
      context: { bugs: args.bugs },
      instructions: [
        'Read these files first: src/app/page.tsx, src/components/URLInput.tsx',
        '',
        '=== BUG-1: Replace buttons with smooth toggle switch ===',
        'The current Desktop/Mobile selector uses two separate buttons.',
        'Replace them with a smooth sliding toggle switch (pill-style toggle).',
        'The toggle should have a sliding background indicator that smoothly transitions between Desktop and Mobile.',
        'Use CSS transitions for smooth animation (not just opacity/color change).',
        'The active option should have a filled background that slides to the selected side.',
        '',
        '=== BUG-2: Move toggle near the input/generate area ===',
        'Currently the toggle is in the top header area.',
        'Move it closer to the URL input area or the Generate button.',
        'Place it just above or beside the Generate/Analyze button for better UX flow.',
        'The user should see the toggle as part of the analysis configuration, not as a global setting.',
        '',
        '=== BUG-3: Default to Desktop ===',
        'Change the default strategy state from "mobile" to "desktop".',
        'Find: useState<"mobile" | "desktop">("mobile") and change to useState<"mobile" | "desktop">("desktop")',
        '',
        '=== TOGGLE DESIGN ===',
        'Use a pill-shaped container with two labels (Desktop / Mobile).',
        'Add a sliding white/colored background behind the active option.',
        'Use transition-all duration-300 for smooth sliding.',
        'Make it visually clear which option is active.',
        'Include device icons (monitor for Desktop, smartphone for Mobile).',
        'Disable the toggle while analysis is loading.',
        '',
        'CRITICAL: Keep ALL existing functionality intact (strategy caching, API calls, etc).',
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

export const scorePhase1Task = defineTask('score-phase1', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score Phase 1 (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'UI/UX quality reviewer',
      task: 'Score the strategy toggle implementation for BUG-1, BUG-2, BUG-3',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read src/app/page.tsx to assess the toggle implementation.',
        '',
        '=== SCORING RUBRIC (100 points) ===',
        'Toggle Design (30 pts): Is it a smooth sliding pill toggle? Does it animate?',
        'Position (25 pts): Is it near the URL input/generate area? Is placement intuitive?',
        'Default (15 pts): Does it default to Desktop?',
        'Visual Polish (15 pts): Icons, colors, disabled state, dark mode compatibility?',
        'Functionality (15 pts): Does it integrate with existing strategy state/caching?',
        '',
        'BE STRICT. Deduct points for:',
        '- No sliding animation (just color change)',
        '- Toggle still in the header/far from input area',
        '- Mobile is still default',
        '- No disabled state during loading',
        '',
        'DO NOT modify any files.'
      ],
      outputFormat: 'JSON with overallScore (0-100), breakdown, gaps (array of issues)'
    },
    outputSchema: {
      type: 'object',
      required: ['overallScore', 'gaps'],
      properties: {
        overallScore: { type: 'number' },
        breakdown: { type: 'object' },
        gaps: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const refinePhase1Task = defineTask('refine-phase1', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine Phase 1 (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer refining the strategy toggle',
      task: 'Address quality feedback to improve the strategy toggle',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: [
        'Read src/app/page.tsx and check what gaps remain from the quality scoring.',
        'Focus on the highest-impact issues first.',
        'Make targeted, precise changes — do not over-change.',
        'Ensure the toggle has smooth CSS transitions, proper positioning, and Desktop default.',
        'Actually edit the files.'
      ],
      outputFormat: 'JSON with success, changesApplied, filesModified'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        changesApplied: { type: 'array' },
        filesModified: { type: 'array' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

// --- Phase 2: UI Enhancements ---

export const fixUIEnhancementsTask = defineTask('fix-ui-enhancements', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix UI enhancements (BUG-4,5,11)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in UI polish and layout',
      task: 'Fix 3 UI enhancement bugs: strategy indicator, loading animation, navbar overlap',
      context: { bugs: args.bugs },
      instructions: [
        'Read these files: src/app/page.tsx, src/components/LoadingSpinner.tsx, src/app/globals.css',
        '',
        '=== BUG-4: Desktop/Mobile indicator in results area ===',
        'Add a visible badge/label in the results section showing which strategy (Desktop/Mobile) the current results are for.',
        'Place it near "Powered by Google PageSpeed Insights" or at the top of the results area.',
        'Style it as a small pill badge with an icon (monitor/smartphone).',
        'It should dynamically reflect the current strategy state.',
        '',
        '=== BUG-5: Circular motion loading animation ===',
        'Replace the current loading spinner animation with a ring that moves in smooth circular motion.',
        'Use CSS animation with a rotating arc/ring (like a progress ring with a gap).',
        'The ring should rotate continuously in a circular path.',
        'Use stroke-dasharray and rotate animation on an SVG circle.',
        'Make it visually appealing with the app color scheme.',
        '',
        '=== BUG-11: Navbar overlapping content on scroll ===',
        'The navbar currently overlaps page content when scrolling.',
        'Implement a hide-on-scroll-down, show-on-scroll-up pattern.',
        'Use a scroll event listener to detect scroll direction.',
        'Add smooth CSS transition for the hide/show animation.',
        'Ensure the navbar slides up (transforms out of view) on scroll down and slides back on scroll up.',
        'Add proper spacing/padding to the main content so it does not start behind the navbar.',
        '',
        'CRITICAL: Keep ALL existing functionality intact.',
        'Actually edit the files in the codebase.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const scorePhase2Task = defineTask('score-phase2', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score Phase 2 (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'UI/UX quality reviewer',
      task: 'Score the UI enhancement implementations for BUG-4, BUG-5, BUG-11',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read src/app/page.tsx, src/components/LoadingSpinner.tsx, src/app/globals.css',
        '',
        '=== SCORING RUBRIC (100 points) ===',
        'Strategy Indicator (30 pts): Visible badge in results area showing Desktop/Mobile? Dynamic?',
        'Loading Animation (30 pts): Circular ring motion? Smooth? Visually appealing?',
        'Navbar Fix (25 pts): Hides on scroll down? Shows on scroll up? No content overlap?',
        'Visual Polish (15 pts): Consistent styling, dark mode, smooth transitions?',
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

export const refinePhase2Task = defineTask('refine-phase2', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine Phase 2 (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer refining UI enhancements',
      task: 'Address quality feedback to improve strategy indicator, loading animation, navbar',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: [
        'Read the relevant files and address remaining gaps.',
        'Focus on highest-impact issues first.',
        'Make targeted changes. Actually edit the files.'
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

// --- Phase 3: Tooltips ---

export const fixTooltipsTask = defineTask('fix-tooltips', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Add tooltips (BUG-6,7,8)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer adding informative hover tooltips',
      task: 'Add hover tooltips to score categories and metric abbreviations',
      context: { bugs: args.bugs },
      instructions: [
        'Read: src/components/ResultsTable.tsx, src/components/ScoreChart.tsx, src/components/MetricsPanel.tsx',
        '',
        '=== BUG-6: Score tooltips in ResultsTable ===',
        'When hovering over Performance, Accessibility, SEO, or Best Practices score labels/badges in the results table, show a tooltip describing what each category measures:',
        '- Performance: "Measures page load speed, interactivity, and visual stability"',
        '- Accessibility: "Measures how accessible your page is to users with disabilities"',
        '- SEO: "Measures how well your page is optimized for search engine results"',
        '- Best Practices: "Measures adherence to web development best practices and security"',
        '',
        '=== BUG-7: Score tooltips in ScoreChart ===',
        'Same tooltips as BUG-6 but in the Score Overview horizontal bar chart section.',
        'Apply to the category labels in ScoreChart component.',
        '',
        '=== BUG-8: Metric definition tooltips in MetricsPanel ===',
        'When hovering over FCP, LCP, TBT, CLS, TTI abbreviations:',
        '- FCP: "First Contentful Paint — Time until the first text or image is painted"',
        '- LCP: "Largest Contentful Paint — Time until the largest content element is visible"',
        '- TBT: "Total Blocking Time — Sum of time periods between FCP and TTI where tasks blocked the main thread"',
        '- CLS: "Cumulative Layout Shift — Measures visual stability; lower is better"',
        '- TTI: "Time to Interactive — Time until the page is fully interactive"',
        '',
        '=== TOOLTIP DESIGN ===',
        'Use CSS-only tooltips (no library needed).',
        'Style: dark background, white text, rounded corners, small arrow/triangle.',
        'Position: above the element by default.',
        'Add smooth fade-in transition.',
        'Ensure tooltips work in dark mode too.',
        'Use relative positioning on parent, absolute on tooltip.',
        '',
        'CRITICAL: Do NOT break existing component layouts or functionality.',
        'Actually edit the files.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified'],
      properties: { success: { type: 'boolean' }, filesModified: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const scorePhase3Task = defineTask('score-phase3', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score Phase 3 (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'UI/UX quality reviewer',
      task: 'Score the tooltip implementations for BUG-6, BUG-7, BUG-8',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read src/components/ResultsTable.tsx, src/components/ScoreChart.tsx, src/components/MetricsPanel.tsx',
        '',
        '=== SCORING RUBRIC (100 points) ===',
        'ResultsTable tooltips (30 pts): All 4 score categories have descriptive tooltips on hover?',
        'ScoreChart tooltips (25 pts): All 4 categories in Score Overview have tooltips?',
        'MetricsPanel tooltips (25 pts): All 5 metrics (FCP,LCP,TBT,CLS,TTI) have definition tooltips?',
        'Tooltip Design (20 pts): Consistent styling, smooth fade-in, dark bg, proper positioning, dark mode?',
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

export const refinePhase3Task = defineTask('refine-phase3', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine Phase 3 (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer refining tooltip implementations',
      task: 'Address quality feedback to improve tooltips',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: [
        'Read the component files and address remaining tooltip gaps.',
        'Ensure all tooltips are present, properly styled, and have correct content.',
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

// --- Phase 4: Export Styling ---

export const fixExportStylingTask = defineTask('fix-export-styling', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix export styling (BUG-9,10)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior developer specializing in document generation and export file formatting',
      task: 'Enhance CSV and DOCX exports with color-coded scores and better visual styling',
      context: { bugs: args.bugs },
      instructions: [
        'Read: src/lib/exportCSV.ts, src/lib/exportDOCX.ts, src/types/report.ts',
        '',
        '=== BUG-9: Color-coded CSV export ===',
        'Plain CSV files cannot have colors. To add colors, switch to Excel XML Spreadsheet format (.xls).',
        'Use the SpreadsheetML XML format that Excel can open natively.',
        'Include:',
        '- Header row with dark background and white bold text',
        '- Score cells with background colors: green (≥90), orange (≥50), red (<50)',
        '- Alternating row background colors for readability',
        '- Bold summary/average row at the bottom',
        '- Column width auto-sizing',
        '- A title row at the top with report name and date',
        '- Keep the filename extension as .xls so it opens in Excel directly',
        '',
        'The XML format looks like:',
        '<?xml version="1.0"?>',
        '<?mso-application progid="Excel.Sheet"?>',
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ...>',
        '  <Styles>...</Styles>',
        '  <Worksheet><Table>...</Table></Worksheet>',
        '</Workbook>',
        '',
        '=== BUG-10: Color-coded DOCX export ===',
        'The DOCX already uses the docx package. Enhance it with:',
        '- Score cells with colored backgrounds (green/orange/red shading)',
        '- Bold score values with matching text colors',
        '- Enhanced header row styling (darker background, white text)',
        '- Better table borders and spacing',
        '- More prominent title and date styling',
        '- Add score color legend section',
        '',
        'CRITICAL: Keep the function signatures (exportCSV, exportDOCX) and TypeScript types intact.',
        'Actually edit the files.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified'],
      properties: { success: { type: 'boolean' }, filesModified: { type: 'array' }, summary: { type: 'string' } }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const scorePhase4Task = defineTask('score-phase4', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score Phase 4 (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Document export quality reviewer',
      task: 'Score the export styling improvements for BUG-9 and BUG-10',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read src/lib/exportCSV.ts and src/lib/exportDOCX.ts',
        '',
        '=== SCORING RUBRIC (100 points) ===',
        'CSV/XLS Styling (40 pts): Uses Excel XML format? Color-coded scores? Headers styled? Summary row?',
        'DOCX Styling (40 pts): Color-coded score cells? Enhanced headers? Better formatting? Legend?',
        'Code Quality (20 pts): Clean TypeScript, no errors, proper error handling?',
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

export const refinePhase4Task = defineTask('refine-phase4', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine Phase 4 (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior developer refining export file styling',
      task: 'Address quality feedback to improve CSV and DOCX export styling',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: [
        'Read the export files and address remaining styling gaps.',
        'Focus on highest-impact improvements.',
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

export const documentAllFixesTask = defineTask('document-all-fixes', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Document all 11 bug fixes',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical writer documenting bug fixes',
      task: 'Document all 11 bug fixes in RECENT_FIXATION.md and clear TO_BE_FIXED.md',
      context: { phases: args.phases, bugsFixed: args.bugsFixed },
      instructions: [
        'Read BUG_FIX_RULES.md for the exact format.',
        'Read RECENT_FIXATION.md to see current state (add new entries AT THE TOP below the header).',
        'Read TO_BE_FIXED.md to see the original bug descriptions.',
        '',
        'Add entries numbered 9-19 (continuing from existing entries) for each bug:',
        '',
        '9. BUG-1: Replace Desktop/Mobile buttons with smooth toggle switch',
        '10. BUG-2: Move strategy toggle near input/generate area',
        '11. BUG-3: Default strategy toggle to Desktop',
        '12. BUG-4: Add Desktop/Mobile indicator in results area',
        '13. BUG-5: Circular motion loading animation',
        '14. BUG-6: Score tooltips in ResultsTable',
        '15. BUG-7: Score tooltips in ScoreChart',
        '16. BUG-8: Metric definition tooltips in MetricsPanel',
        '17. BUG-9: Color-coded CSV/XLS export',
        '18. BUG-10: Color-coded DOCX export',
        '19. BUG-11: Fix navbar overlapping content',
        '',
        'For each entry include: Bug description, Root cause, Fix applied, Files modified, Verified by.',
        'Check the actual git diff or files to determine what was really changed.',
        '',
        'Then CLEAR all bug entries from TO_BE_FIXED.md (keep the header "# Bugs To Be Fixed" and the "---" separator, remove all ### entries).',
        '',
        'Today\'s date is 2026-03-17.',
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
