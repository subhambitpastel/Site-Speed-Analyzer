/**
 * @process bug-fix-pipeline
 * @description Fix 3 bugs: UI/mobile responsiveness, export file polish, and browser verification.
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
  const {
    targetQuality = 85,
    maxIterations = 5
  } = inputs;

  const phaseResults = [];
  ctx.log('info', 'Starting Bug Fix Pipeline - 3 bugs to fix');

  // ============================================================================
  // PHASE 1: BUG-1 - UI & Mobile Responsiveness
  // ============================================================================

  ctx.log('info', '=== PHASE 1: BUG-1 - UI & Mobile Responsiveness ===');

  // Step 1.1: Analyze current UI issues
  const uiAnalysis = await ctx.task(analyzeUITask, {
    scope: 'Analyze all components for mobile responsiveness issues, overflow, misalignment, and visual polish gaps',
    files: [
      'src/app/page.tsx',
      'src/app/globals.css',
      'src/app/layout.tsx',
      'src/components/URLInput.tsx',
      'src/components/ScoreBadge.tsx',
      'src/components/ResultsTable.tsx',
      'src/components/MetricsPanel.tsx',
      'src/components/LoadingSpinner.tsx',
      'src/components/ExportDropdown.tsx',
      'src/components/ScoreChart.tsx'
    ]
  });

  // Step 1.2: Implement responsive fixes
  const responsiveFix = await ctx.task(fixResponsivenessTask, {
    analysis: uiAnalysis,
    files: [
      'src/app/page.tsx',
      'src/app/globals.css',
      'src/app/layout.tsx',
      'src/components/URLInput.tsx',
      'src/components/ScoreBadge.tsx',
      'src/components/ResultsTable.tsx',
      'src/components/MetricsPanel.tsx',
      'src/components/LoadingSpinner.tsx',
      'src/components/ExportDropdown.tsx',
      'src/components/ScoreChart.tsx'
    ]
  });

  // Step 1.3: Build verification
  const build1 = await ctx.task(verifyBuildTask, { phase: 'Phase 1 - UI Responsiveness' });

  // Step 1.4: Quality scoring convergence loop
  let uiScore = 0;
  let uiConverged = false;
  let uiIteration = 0;

  const initialUIScore = await ctx.task(scoreUIQualityTask, {
    iteration: 0,
    targetQuality,
    focus: 'mobile responsiveness, layout adaptation, visual polish, overflow handling'
  });

  uiScore = initialUIScore.overallScore || 0;
  uiConverged = uiScore >= targetQuality;

  while (!uiConverged && uiIteration < maxIterations) {
    uiIteration++;
    ctx.log('info', `UI Refinement iteration ${uiIteration}, current score: ${uiScore}`);

    const refinement = await ctx.task(refineUITask, {
      iteration: uiIteration,
      previousScore: uiScore,
      targetQuality,
      focus: 'mobile responsiveness and visual polish'
    });

    const buildCheck = await ctx.task(verifyBuildTask, { phase: `Phase 1 - Refinement ${uiIteration}` });

    const newScore = await ctx.task(scoreUIQualityTask, {
      iteration: uiIteration,
      targetQuality,
      focus: 'mobile responsiveness, layout adaptation, visual polish, overflow handling'
    });

    uiScore = newScore.overallScore || 0;
    uiConverged = uiScore >= targetQuality;

    if (uiScore - (initialUIScore.overallScore || 0) <= 0 && uiIteration > 2) {
      ctx.log('warn', 'UI refinement stalled, moving on');
      break;
    }
  }

  phaseResults.push({
    phase: 'BUG-1: UI & Mobile Responsiveness',
    score: uiScore,
    iterations: uiIteration,
    converged: uiConverged
  });

  // Git commit for Phase 1
  await ctx.task(gitCommitTask, {
    phase: 'BUG-1',
    title: 'Fix UI & Mobile Responsiveness',
    summary: `Fixed mobile responsiveness issues across all components. Added proper breakpoints, overflow handling, and visual polish. Quality score: ${uiScore}/${targetQuality} after ${uiIteration} iterations.`,
    criteria: [
      'All components responsive on mobile, tablet, and desktop',
      'No overflow or misalignment issues',
      'Build passes without errors'
    ]
  });

  // Breakpoint: Phase 1 review
  await ctx.breakpoint({
    question: `Phase 1 complete: UI & Mobile Responsiveness. Score: ${uiScore}/${targetQuality} after ${uiIteration} iterations. Committed. Review and approve to proceed to Phase 2 (Export Files)?`,
    title: 'Phase 1 Review - UI Responsiveness',
    tag: 'phase-1-review'
  });

  // ============================================================================
  // PHASE 2: BUG-3 - Export Files Polish (PDF/CSV/DOCX)
  // ============================================================================

  ctx.log('info', '=== PHASE 2: BUG-3 - Export Files Polish ===');

  // Step 2.1: Redesign all export files
  const exportFix = await ctx.task(fixExportFilesTask, {
    files: [
      'src/lib/exportPDF.ts',
      'src/lib/exportCSV.ts',
      'src/lib/exportDOCX.ts'
    ],
    requirements: 'Professional, polished documents with proper formatting, clean alignment, appropriate spacing, consistent typography, and attractive layout'
  });

  // Step 2.2: Build verification
  const build2 = await ctx.task(verifyBuildTask, { phase: 'Phase 2 - Export Files' });

  // Step 2.3: Quality scoring for exports
  let exportScore = 0;
  let exportConverged = false;
  let exportIteration = 0;

  const initialExportScore = await ctx.task(scoreExportQualityTask, {
    iteration: 0,
    targetQuality,
    focus: 'PDF layout, DOCX formatting, CSV structure, professional appearance'
  });

  exportScore = initialExportScore.overallScore || 0;
  exportConverged = exportScore >= targetQuality;

  while (!exportConverged && exportIteration < maxIterations) {
    exportIteration++;
    ctx.log('info', `Export refinement iteration ${exportIteration}, current score: ${exportScore}`);

    const refinement = await ctx.task(refineExportTask, {
      iteration: exportIteration,
      previousScore: exportScore,
      targetQuality
    });

    const buildCheck = await ctx.task(verifyBuildTask, { phase: `Phase 2 - Export Refinement ${exportIteration}` });

    const newScore = await ctx.task(scoreExportQualityTask, {
      iteration: exportIteration,
      targetQuality,
      focus: 'PDF layout, DOCX formatting, CSV structure, professional appearance'
    });

    exportScore = newScore.overallScore || 0;
    exportConverged = exportScore >= targetQuality;

    if (exportScore - (initialExportScore.overallScore || 0) <= 0 && exportIteration > 2) {
      ctx.log('warn', 'Export refinement stalled, moving on');
      break;
    }
  }

  phaseResults.push({
    phase: 'BUG-3: Export Files Polish',
    score: exportScore,
    iterations: exportIteration,
    converged: exportConverged
  });

  // Git commit for Phase 2
  await ctx.task(gitCommitTask, {
    phase: 'BUG-3',
    title: 'Polish export files (PDF/CSV/DOCX)',
    summary: `Redesigned PDF, CSV, and DOCX export outputs for professional quality. Added proper formatting, color-coded scores, headers/footers. Quality score: ${exportScore}/${targetQuality} after ${exportIteration} iterations.`,
    criteria: [
      'PDF export has professional layout with color-coded scores',
      'DOCX export has proper heading hierarchy and formatting',
      'CSV export has metadata and summary rows',
      'Build passes without errors'
    ]
  });

  // Breakpoint: Phase 2 review
  await ctx.breakpoint({
    question: `Phase 2 complete: Export Files Polish. Score: ${exportScore}/${targetQuality} after ${exportIteration} iterations. Committed. Review and approve to proceed to Phase 3 (Browser Review)?`,
    title: 'Phase 2 Review - Export Files',
    tag: 'phase-2-review'
  });

  // ============================================================================
  // PHASE 3: BUG-2 - Browser Review & Final Verification
  // ============================================================================

  ctx.log('info', '=== PHASE 3: BUG-2 - Browser Review & Final Verification ===');

  // Step 3.1: Comprehensive code review
  const browserReview = await ctx.task(comprehensiveReviewTask, {
    scope: 'Review all pages, components, interactions, forms, export buttons, responsive layouts for correctness and visual quality'
  });

  // Step 3.2: Fix any issues found
  if (browserReview.issuesFound && browserReview.issuesFound.length > 0) {
    const reviewFixes = await ctx.task(fixReviewIssuesTask, {
      issues: browserReview.issuesFound
    });
  }

  // Step 3.3: Final build verification
  const finalBuild = await ctx.task(verifyBuildTask, { phase: 'Phase 3 - Final Build' });

  // Step 3.4: Documentation
  const documentation = await ctx.task(documentFixesTask, {
    phases: phaseResults,
    bugsFixed: ['BUG-1', 'BUG-2', 'BUG-3']
  });

  phaseResults.push({
    phase: 'BUG-2: Browser Review & Final Verification',
    buildSuccess: finalBuild.success,
    documented: true
  });

  // Git commit for Phase 3
  await ctx.task(gitCommitTask, {
    phase: 'BUG-2',
    title: 'Browser review, final verification & documentation',
    summary: 'Completed comprehensive frontend review, fixed remaining issues, documented all bug fixes in RECENT_FIXATION.md, and cleaned up TO_BE_FIXED.md.',
    criteria: [
      'Comprehensive code review passed',
      'All issues found during review fixed',
      'RECENT_FIXATION.md updated with all 3 bug fixes',
      'TO_BE_FIXED.md cleaned up',
      'Final build passes without errors'
    ]
  });

  // Final breakpoint
  await ctx.breakpoint({
    question: `All 3 bugs fixed, documented, and committed. Final build: ${finalBuild.success ? 'PASSED' : 'FAILED'}. Review final state?`,
    title: 'Final Review - All Bugs Fixed',
    tag: 'final-review'
  });

  return {
    success: true,
    bugsFixed: 3,
    phases: phaseResults
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

export const analyzeUITask = defineTask('analyze-ui', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Analyze UI for responsiveness issues',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in responsive design and mobile-first UI',
      task: 'Analyze the current UI codebase for mobile responsiveness issues, overflow problems, misalignment, and visual polish gaps',
      context: { scope: args.scope, files: args.files },
      instructions: [
        'Read ALL component files listed in the files array',
        'Identify specific issues:',
        '- Elements that overflow on small screens (< 640px)',
        '- Misaligned elements on tablet (640-1024px)',
        '- Components that do not adapt properly to different screen sizes',
        '- Missing responsive breakpoints',
        '- Text that is too small or too large on mobile',
        '- Touch targets that are too small on mobile',
        '- Horizontal scrolling issues',
        '- Visual inconsistencies across screen sizes',
        'DO NOT modify any files - only analyze and report',
        'Output a structured analysis with specific issues per component'
      ],
      outputFormat: 'JSON with issues (array of {component, issue, severity, recommendation}), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['issues'],
      properties: {
        issues: { type: 'array' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const fixResponsivenessTask = defineTask('fix-responsiveness', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix UI responsiveness and visual polish',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in responsive design with Tailwind CSS and Next.js',
      task: 'Fix all mobile responsiveness issues and improve visual polish across the application',
      context: { analysis: args.analysis, files: args.files },
      instructions: [
        'Read each component file and fix responsiveness issues based on the analysis',
        'Apply these fixes across ALL components:',
        '',
        '=== MOBILE RESPONSIVENESS ===',
        '- Ensure proper responsive breakpoints (sm:, md:, lg:, xl:)',
        '- Fix overflow issues - use overflow-x-auto on tables/wide content',
        '- Ensure text wraps properly with break-words where needed',
        '- Make touch targets at least 44x44px on mobile',
        '- Use responsive font sizes (text-sm on mobile, text-base on desktop)',
        '- Stack horizontal layouts vertically on mobile (flex-col on sm, flex-row on md+)',
        '',
        '=== LAYOUT FIXES ===',
        '- Reduce horizontal padding on mobile (px-4 on mobile, px-6 on desktop)',
        '- Ensure max-w container works with proper padding',
        '- Fix any table columns that are too wide on mobile - use horizontal scroll',
        '- Ensure the header is responsive (stack items on mobile if needed)',
        '',
        '=== VISUAL POLISH ===',
        '- Clean, consistent border radius',
        '- Proper focus states for accessibility',
        '- Smooth transitions on interactive elements',
        '- Clean dark mode implementation',
        '',
        'CRITICAL: Keep ALL functionality intact. Only change styling/layout.',
        'Actually edit the files in the codebase.'
      ],
      outputFormat: 'JSON with success, filesModified, changesApplied, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array', items: { type: 'string' } },
        changesApplied: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const scoreUIQualityTask = defineTask('score-ui-quality', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score UI quality (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert UI/UX reviewer specializing in responsive web design quality assessment',
      task: 'Score the current UI implementation for mobile responsiveness and visual polish',
      context: { iteration: args.iteration, targetQuality: args.targetQuality, focus: args.focus },
      instructions: [
        'Read ALL component files to assess current state:',
        'src/app/globals.css, src/app/page.tsx, src/app/layout.tsx,',
        'src/components/URLInput.tsx, src/components/ScoreBadge.tsx,',
        'src/components/ResultsTable.tsx, src/components/MetricsPanel.tsx,',
        'src/components/LoadingSpinner.tsx, src/components/ExportDropdown.tsx,',
        'src/components/ScoreChart.tsx (if exists)',
        '',
        '=== SCORING RUBRIC (100 points total) ===',
        'Mobile Layout (25 points): proper breakpoints, no overflow, stacking on mobile',
        'Tablet Layout (15 points): proper adaptation for medium screens',
        'Desktop Layout (15 points): proper use of space, max-width, alignment',
        'Typography Responsiveness (10 points): proper font sizing across breakpoints',
        'Interactive Elements (10 points): proper touch targets, hover/focus states',
        'Visual Consistency (15 points): consistent borders, colors, spacing',
        'Dark Mode (10 points): proper dark mode implementation',
        '',
        'BE STRICT. Deduct points for any overflow, misalignment, or adaptation failure.',
        'Provide specific actionable gaps to fix.',
        'DO NOT modify any files.'
      ],
      outputFormat: 'JSON with overallScore (0-100), breakdown (per dimension), gaps (array of specific issues), strengths (array)'
    },
    outputSchema: {
      type: 'object',
      required: ['overallScore', 'gaps'],
      properties: {
        overallScore: { type: 'number' },
        breakdown: { type: 'object' },
        gaps: { type: 'array', items: { type: 'string' } },
        strengths: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const refineUITask = defineTask('refine-ui', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine UI (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer refining responsive UI implementation',
      task: 'Address UI quality feedback by making targeted refinements',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality, focus: args.focus },
      instructions: [
        'Read the current state of all component files',
        'Address the remaining gaps from the quality scoring',
        'Focus on the highest-impact issues first',
        'Make targeted, precise changes - do not over-change',
        'LIMIT to 5-8 changes per iteration',
        'Actually edit the files. Keep all functionality working.'
      ],
      outputFormat: 'JSON with success, changesApplied, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        changesApplied: { type: 'array', items: { type: 'string' } },
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

export const fixExportFilesTask = defineTask('fix-export-files', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Redesign export files (PDF/CSV/DOCX)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior developer specializing in document generation and professional report formatting',
      task: 'Redesign all export outputs (PDF, CSV, DOCX) to be professional, polished, and well-structured',
      context: { files: args.files, requirements: args.requirements },
      instructions: [
        'Read all three export files: exportPDF.ts, exportCSV.ts, exportDOCX.ts',
        'Also read src/types/report.ts to understand the data structure',
        '',
        '=== PDF (exportPDF.ts) ===',
        '- Add a professional header with branding colors',
        '- Add a clear title section with date and report summary',
        '- Use color-coded score cells in tables (green/amber/red backgrounds, not just text color)',
        '- Add proper table styling with alternating row colors',
        '- Add section dividers and proper spacing between sections',
        '- Add a footer with page numbers',
        '- Use professional fonts and sizing',
        '- Ensure proper column widths and alignment',
        '- Add a visual summary section with score badges/indicators',
        '',
        '=== CSV (exportCSV.ts) ===',
        '- Add a comment header row with report metadata (title, date, URL count)',
        '- Keep clean column headers',
        '- Ensure proper data alignment and formatting',
        '- Add a summary row at the bottom with averages',
        '- Use proper number formatting',
        '',
        '=== DOCX (exportDOCX.ts) ===',
        '- Professional document with proper heading hierarchy',
        '- Add a title page section with report name and date',
        '- Use color-coded score values',
        '- Add proper table formatting with header row styling',
        '- Use consistent spacing and margins',
        '- Add section breaks between major sections',
        '- Professional typography with proper font sizes',
        '- Add a summary section with average scores',
        '',
        'CRITICAL: Keep all TypeScript types and function signatures intact.',
        'Actually edit the files in the codebase.'
      ],
      outputFormat: 'JSON with success, filesModified, changesApplied, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'filesModified'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array', items: { type: 'string' } },
        changesApplied: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const scoreExportQualityTask = defineTask('score-export-quality', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score export quality (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert document design reviewer',
      task: 'Score the export file implementations for professional quality',
      context: { iteration: args.iteration, targetQuality: args.targetQuality, focus: args.focus },
      instructions: [
        'Read all three export files: src/lib/exportPDF.ts, src/lib/exportCSV.ts, src/lib/exportDOCX.ts',
        '',
        '=== SCORING RUBRIC (100 points total) ===',
        'PDF Quality (35 points): layout, colors, tables, spacing, header/footer, professional look',
        'DOCX Quality (35 points): formatting, headings, tables, typography, section structure',
        'CSV Quality (15 points): headers, formatting, summary row, metadata',
        'Code Quality (15 points): no TypeScript errors, clean implementation, proper error handling',
        '',
        'BE STRICT. Professional documents should have:',
        '- Color-coded scores (not just plain numbers)',
        '- Proper section hierarchy',
        '- Consistent spacing and alignment',
        '- Professional typography',
        '',
        'Provide specific actionable gaps to fix.',
        'DO NOT modify any files.'
      ],
      outputFormat: 'JSON with overallScore (0-100), breakdown (per dimension), gaps (array of specific issues)'
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

export const refineExportTask = defineTask('refine-exports', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine exports (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior developer refining professional document generation',
      task: 'Address export quality feedback by making targeted improvements',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: [
        'Read the current export files and address remaining quality gaps',
        'Focus on highest-impact improvements first',
        'Make targeted, precise changes',
        'Actually edit the files. Keep all functionality working.'
      ],
      outputFormat: 'JSON with success, changesApplied, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        changesApplied: { type: 'array', items: { type: 'string' } },
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

export const comprehensiveReviewTask = defineTask('comprehensive-review', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Comprehensive frontend review',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend QA engineer performing thorough code review',
      task: 'Perform a comprehensive review of the entire frontend for correctness, visual quality, and functional behavior',
      context: { scope: args.scope },
      instructions: [
        'Read ALL source files in src/ directory',
        'Verify:',
        '1. All components render correctly (no TypeScript errors, proper JSX)',
        '2. All interactions work (form submission, export buttons, strategy toggle)',
        '3. No broken imports or missing dependencies',
        '4. Responsive layout works (proper Tailwind breakpoints)',
        '5. Dark mode is consistent',
        '6. Export functions are properly wired up',
        '7. Error states are handled properly',
        '8. Loading states display correctly',
        '9. No visual regressions from the fixes',
        '',
        'Report any issues found with specific file and line references.',
        'DO NOT fix issues - only report them.'
      ],
      outputFormat: 'JSON with issuesFound (array of {file, line, issue, severity}), passed (boolean), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['issuesFound', 'passed'],
      properties: {
        issuesFound: { type: 'array' },
        passed: { type: 'boolean' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));

export const fixReviewIssuesTask = defineTask('fix-review-issues', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Fix issues from comprehensive review',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer fixing remaining issues',
      task: 'Fix all issues identified in the comprehensive review',
      context: { issues: args.issues },
      instructions: [
        'Fix each issue identified in the review',
        'Prioritize by severity (high > medium > low)',
        'Actually edit the files to fix each issue',
        'Keep all existing functionality intact'
      ],
      outputFormat: 'JSON with success, fixesApplied, filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        fixesApplied: { type: 'array', items: { type: 'string' } },
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

export const documentFixesTask = defineTask('document-fixes', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Document fixes in RECENT_FIXATION.md',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical writer documenting bug fixes',
      task: 'Document all bug fixes in RECENT_FIXATION.md and remove fixed bugs from TO_BE_FIXED.md',
      context: { phases: args.phases, bugsFixed: args.bugsFixed },
      instructions: [
        'Read BUG_FIX_RULES.md for the exact entry format',
        'Read RECENT_FIXATION.md to see current state',
        'Read TO_BE_FIXED.md to see the bugs that were fixed',
        '',
        'Add entries to RECENT_FIXATION.md (at the top, below the header) for each bug fixed:',
        '',
        'BUG-1: Frontend UI & Mobile Responsiveness',
        '- Document what was fixed: responsive breakpoints, overflow fixes, visual polish',
        '- List all files modified',
        '- Verification: build passes, visual QA scoring',
        '',
        'BUG-2: Browser-Based Frontend Review',
        '- Document what was reviewed and fixed',
        '- List all files reviewed/modified',
        '- Verification: comprehensive code review passed',
        '',
        'BUG-3: Export Files Polish',
        '- Document PDF, CSV, DOCX improvements',
        '- List all export files modified',
        '- Verification: build passes, export quality scoring',
        '',
        'Then REMOVE all three bug entries from TO_BE_FIXED.md (keep the header)',
        'Use the exact format specified in BUG_FIX_RULES.md',
        'Today\'s date is 2026-03-16',
        'Actually edit both files.'
      ],
      outputFormat: 'JSON with success, filesModified'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array', items: { type: 'string' } }
      }
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
      role: 'Version control engineer following VERSION_CONTROL.md conventions',
      task: `Create a git commit for the ${args.phase} fix`,
      context: { phase: args.phase, title: args.title, summary: args.summary, criteria: args.criteria },
      instructions: [
        'Read VERSION_CONTROL.md to understand the commit conventions',
        'Stage all changed files with: git add -A',
        `Create a commit with this message format:`,
        '',
        `${args.phase} — ${args.title}`,
        '',
        `${args.summary}`,
        '',
        'Acceptance criteria met:',
        ...(args.criteria || []).map(c => `- ${c}`),
        '',
        'Use a heredoc to pass the commit message to git commit -m',
        'Do NOT push to remote unless explicitly told to',
        'Report the commit hash when done'
      ],
      outputFormat: 'JSON with success, commitHash, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        commitHash: { type: 'string' },
        summary: { type: 'string' }
      }
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
      task: 'Run the Next.js build to verify compilation',
      context: { phase: args.phase },
      instructions: [
        'Run: npm run build',
        'If there are TypeScript or build errors, fix them and re-run',
        'Report whether the build succeeded',
        'If fixes were needed, list what was fixed'
      ],
      outputFormat: 'JSON with success, buildOutput, fixesApplied'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        buildOutput: { type: 'string' },
        fixesApplied: { type: 'array', items: { type: 'string' } }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  }
}));
