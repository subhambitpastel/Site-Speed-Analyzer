/**
 * @process elegant-redesign
 * @description Full app UI redesign - Minimal & Clean aesthetic with micro-animations
 * and data visualization. Iterative quality convergence with visual QA scoring.
 *
 * @inputs {
 *   projectName: string,
 *   designDirection: string,
 *   scope: string,
 *   targetQuality: number,
 *   maxIterations: number,
 *   features: string[]
 * }
 * @outputs {
 *   success: boolean,
 *   converged: boolean,
 *   finalScore: number,
 *   iterations: number,
 *   improvements: array
 * }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  const {
    projectName = 'Lighthouse Report Generator',
    designDirection = 'Minimal & Clean',
    scope = 'Full app redesign',
    targetQuality = 90,
    maxIterations = 8,
    features = ['micro-animations', 'data-visualization', 'refined-typography']
  } = inputs;

  const startTime = ctx.now();
  const improvements = [];
  let iteration = 0;
  let currentScore = 0;
  let converged = false;

  ctx.log('info', `Starting Elegant Redesign: ${projectName}`);
  ctx.log('info', `Direction: ${designDirection}, Target: ${targetQuality}%`);

  // ============================================================================
  // PHASE 1: DESIGN ANALYSIS & SPECIFICATION
  // Analyze current UI and create detailed design specification
  // ============================================================================

  ctx.log('info', 'Phase 1: Design analysis and specification creation');

  const designSpec = await ctx.task(createDesignSpecTask, {
    projectName,
    designDirection,
    scope,
    features,
    currentFiles: [
      'src/app/page.tsx',
      'src/app/globals.css',
      'src/app/layout.tsx',
      'src/components/URLInput.tsx',
      'src/components/ScoreBadge.tsx',
      'src/components/ResultsTable.tsx',
      'src/components/MetricsPanel.tsx',
      'src/components/LoadingSpinner.tsx',
      'src/components/ExportDropdown.tsx'
    ]
  });

  // Breakpoint: Review design spec before implementation
  await ctx.breakpoint({
    question: `Design specification created for "${designDirection}" redesign. Review the spec and approve to begin implementation?`,
    title: 'Design Specification Review',
    tag: 'design-spec-review',
    context: {
      runId: ctx.runId,
      designDirection,
      scope,
      features
    }
  });

  // ============================================================================
  // PHASE 2: FOUNDATION - Layout, Typography & Color System
  // Implement the design system foundation
  // ============================================================================

  ctx.log('info', 'Phase 2: Implementing design system foundation');

  const foundationResult = await ctx.task(implementFoundationTask, {
    designSpec,
    designDirection,
    components: [
      'globals.css - refined color palette, typography scale, spacing system',
      'layout.tsx - font updates, base styles',
      'page.tsx - layout structure, header, hero section refinement'
    ]
  });

  // ============================================================================
  // PHASE 3: COMPONENT REDESIGN
  // Redesign each component with the new design system
  // ============================================================================

  ctx.log('info', 'Phase 3: Component-by-component redesign');

  const componentResult = await ctx.task(redesignComponentsTask, {
    designSpec,
    designDirection,
    features,
    components: [
      'URLInput.tsx - clean input with subtle focus states',
      'ScoreBadge.tsx - refined score rings with smooth animations',
      'ResultsTable.tsx - minimal table with elegant hover states',
      'MetricsPanel.tsx - clean metric cards with refined spacing',
      'LoadingSpinner.tsx - elegant loading animation',
      'ExportDropdown.tsx - polished dropdown with smooth transitions'
    ]
  });

  // ============================================================================
  // PHASE 4: MICRO-ANIMATIONS & DATA VISUALIZATION
  // Add animations and optional data visualization elements
  // ============================================================================

  ctx.log('info', 'Phase 4: Micro-animations and data visualization');

  const animationsResult = await ctx.task(addAnimationsAndVizTask, {
    designSpec,
    features,
    scope: 'Add staggered entry animations for table rows, smooth score counting, hover micro-interactions, and a simple radar/bar chart component for score comparison'
  });

  // ============================================================================
  // PHASE 5: ITERATIVE VISUAL QA CONVERGENCE
  // Score the implementation and iterate until quality target is met
  // ============================================================================

  ctx.log('info', 'Phase 5: Visual QA convergence loop');

  // Initial scoring
  const initialScore = await ctx.task(visualQAScoringTask, {
    designDirection,
    designSpec,
    iteration: 0,
    targetQuality,
    scoringDimensions: {
      typography: 20,
      colorSystem: 15,
      spacing: 15,
      componentDesign: 20,
      animations: 10,
      consistency: 10,
      modernFeel: 10
    }
  });

  currentScore = initialScore.overallScore;
  converged = currentScore >= targetQuality;

  improvements.push({
    iteration: 0,
    score: currentScore,
    label: 'initial-implementation',
    breakdown: initialScore.breakdown,
    gaps: initialScore.gaps
  });

  ctx.log('info', `Initial visual QA score: ${currentScore}/${targetQuality}`);

  // Breakpoint: Review initial implementation
  await ctx.breakpoint({
    question: `Initial implementation complete. Visual QA score: ${currentScore}/100 (target: ${targetQuality}). ${initialScore.gaps?.length || 0} areas for improvement identified. Review and approve to begin refinement?`,
    title: 'Initial Implementation Review',
    tag: 'initial-review',
    context: {
      runId: ctx.runId,
      score: currentScore,
      targetQuality,
      breakdown: initialScore.breakdown,
      gaps: initialScore.gaps
    }
  });

  // Refinement loop
  while (!converged && iteration < maxIterations) {
    iteration++;
    const previousScore = currentScore;

    ctx.log('info', `=== Refinement Iteration ${iteration} ===`);

    // Refine based on QA feedback
    const refinement = await ctx.task(refineDesignTask, {
      iteration,
      designSpec,
      designDirection,
      previousScore: improvements[improvements.length - 1],
      targetQuality
    });

    // Re-score
    const score = await ctx.task(visualQAScoringTask, {
      designDirection,
      designSpec,
      iteration,
      targetQuality,
      scoringDimensions: {
        typography: 20,
        colorSystem: 15,
        spacing: 15,
        componentDesign: 20,
        animations: 10,
        consistency: 10,
        modernFeel: 10
      }
    });

    currentScore = score.overallScore;
    converged = currentScore >= targetQuality;
    const improvement = currentScore - previousScore;

    improvements.push({
      iteration,
      score: currentScore,
      previousScore,
      improvement,
      breakdown: score.breakdown,
      gaps: score.gaps,
      changesApplied: refinement.changesApplied
    });

    ctx.log('info', `Iteration ${iteration}: ${currentScore}/${targetQuality} (${improvement >= 0 ? '+' : ''}${improvement})`);

    if (!converged && iteration < maxIterations) {
      await ctx.breakpoint({
        question: `Refinement iteration ${iteration}: Score ${currentScore}/${targetQuality} (${improvement >= 0 ? '+' : ''}${improvement}). ${score.gaps?.length || 0} gaps remaining. Continue?`,
        title: `Design Refinement - Iteration ${iteration}`,
        tag: `refinement-${iteration}`,
        context: {
          runId: ctx.runId,
          iteration,
          score: currentScore,
          improvement,
          breakdown: score.breakdown,
          gaps: score.gaps
        }
      });
    }

    // Stall detection
    if (improvement <= 0 && iteration > 2) {
      const lastTwo = improvements.slice(-2);
      if (lastTwo.every(i => (i.improvement || 0) <= 0)) {
        ctx.log('warn', 'No progress in last 2 iterations');
        await ctx.breakpoint({
          question: `Refinement stalled at ${currentScore}/${targetQuality}. Try different approach or accept current state?`,
          title: 'Convergence Stalled',
          tag: 'stalled',
          context: { runId: ctx.runId, currentScore, lastTwo }
        });
      }
    }
  }

  // ============================================================================
  // PHASE 6: BUILD VERIFICATION
  // Ensure the app builds and runs correctly
  // ============================================================================

  ctx.log('info', 'Phase 6: Build verification');

  const buildResult = await ctx.task(verifyBuildTask, {
    projectName
  });

  // ============================================================================
  // PHASE 7: FINAL REVIEW
  // ============================================================================

  ctx.log('info', 'Phase 7: Final review');

  await ctx.breakpoint({
    question: `Redesign complete! Final score: ${currentScore}/${targetQuality} after ${iteration} iterations. Build ${buildResult.success ? 'passed' : 'failed'}. Approve final result?`,
    title: 'Final Design Review',
    tag: 'final-review',
    context: {
      runId: ctx.runId,
      finalScore: currentScore,
      iterations: iteration,
      converged,
      buildSuccess: buildResult.success
    }
  });

  return {
    success: converged && (buildResult.success || false),
    converged,
    finalScore: currentScore,
    targetQuality,
    iterations: iteration,
    improvements,
    buildResult,
    metadata: {
      processId: 'elegant-redesign',
      projectName,
      designDirection,
      startTime,
      endTime: ctx.now()
    }
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

export const createDesignSpecTask = defineTask('create-design-spec', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Create design specification',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior UI/UX designer specializing in minimal, modern web application design (Linear, Vercel, Stripe aesthetic)',
      task: 'Analyze the current Lighthouse Report Generator UI codebase and create a detailed design specification for a Minimal & Clean redesign',
      context: {
        projectName: args.projectName,
        designDirection: args.designDirection,
        scope: args.scope,
        features: args.features,
        currentFiles: args.currentFiles
      },
      instructions: [
        'Read ALL the current component files listed in currentFiles to understand the existing design',
        'Create a comprehensive design specification that includes:',
        '',
        '=== COLOR SYSTEM ===',
        '- Refined, muted color palette (think slate/zinc neutrals, subtle indigo accents)',
        '- Reduce gradient usage - prefer solid colors with subtle tints',
        '- Clean score colors: green (#10b981), amber (#f59e0b), red (#ef4444)',
        '- Light theme: white backgrounds, slate-50 surfaces, slate-900 text',
        '- Dark theme: slate-950 background, slate-900 surfaces, slate-100 text',
        '',
        '=== TYPOGRAPHY ===',
        '- Clean hierarchy: larger headings, comfortable body text',
        '- Reduce font weight variation - use 400, 500, 600 only',
        '- Comfortable line heights and letter spacing',
        '- Monospace for metric values only',
        '',
        '=== SPACING & LAYOUT ===',
        '- Generous whitespace, breathing room between sections',
        '- Consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64)',
        '- Max width container with comfortable padding',
        '',
        '=== COMPONENT DESIGN ===',
        '- URLInput: Clean textarea with subtle border, refined focus ring',
        '- ScoreBadge: Elegant circular score with smooth fill animation',
        '- ResultsTable: Minimal borders, clean hover states, expandable rows',
        '- MetricsPanel: Clean cards with subtle elevation, not heavy glassmorphism',
        '- LoadingSpinner: Simple, elegant spinner (single ring or dots)',
        '- ExportDropdown: Clean dropdown with smooth appear/disappear',
        '',
        '=== MICRO-ANIMATIONS ===',
        '- Staggered fade-in for table rows',
        '- Smooth score counting animation (0 to final score)',
        '- Subtle hover lift on interactive elements',
        '- Smooth transitions on all state changes (200-300ms ease)',
        '',
        '=== DATA VISUALIZATION ===',
        '- Optional: simple bar chart or radar chart for score comparison',
        '- Keep it minimal and integrated, not heavy charting library',
        '',
        'Output the spec as a structured JSON that can guide implementation.',
        'DO NOT modify any code files - only output the specification.'
      ],
      outputFormat: 'JSON with colorSystem, typography, spacing, components (object per component), animations, dataVisualization'
    },
    outputSchema: {
      type: 'object',
      required: ['colorSystem', 'typography', 'components'],
      properties: {
        colorSystem: { type: 'object' },
        typography: { type: 'object' },
        spacing: { type: 'object' },
        components: { type: 'object' },
        animations: { type: 'object' },
        dataVisualization: { type: 'object' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'design-spec']
}));

export const implementFoundationTask = defineTask('implement-foundation', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Implement design foundation',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer implementing a Minimal & Clean design system in Next.js with Tailwind CSS',
      task: 'Implement the design system foundation: updated globals.css, layout.tsx, and page.tsx structure',
      context: {
        designSpec: args.designSpec,
        designDirection: args.designDirection,
        components: args.components
      },
      instructions: [
        'Read the current globals.css, layout.tsx, and page.tsx files',
        'Based on the design specification, update:',
        '',
        '1. globals.css:',
        '   - Refine CSS custom properties for a cleaner color palette',
        '   - Simplify animations (remove heavy glow effects)',
        '   - Keep glassmorphism but make it more subtle',
        '   - Add stagger animation utilities',
        '   - Refine scrollbar styling',
        '   - Ensure dark mode is clean and muted',
        '',
        '2. layout.tsx:',
        '   - Keep Geist fonts (they are great for minimal design)',
        '   - Ensure proper meta and styling',
        '',
        '3. page.tsx:',
        '   - Refine the overall layout structure',
        '   - Simplify the header (less gradient, more clean)',
        '   - Refine the hero section typography',
        '   - Clean up the progress bar section',
        '   - Keep all functionality intact',
        '',
        'IMPORTANT: Keep all existing functionality working. Only change styling/visual aspects.',
        'Use Tailwind utility classes. Keep the code clean and well-structured.',
        'Prefer subtle, muted colors over heavy gradients.',
        'Actually edit the files - do not just describe changes.'
      ],
      outputFormat: 'JSON with success, filesModified, summary of changes'
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
  },
  labels: ['agent', 'implementation', 'foundation']
}));

export const redesignComponentsTask = defineTask('redesign-components', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Redesign UI components',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in elegant, minimal React component design with Tailwind CSS',
      task: 'Redesign all UI components to match the Minimal & Clean aesthetic',
      context: {
        designSpec: args.designSpec,
        designDirection: args.designDirection,
        features: args.features,
        components: args.components
      },
      instructions: [
        'Read each component file and redesign it according to the design spec.',
        '',
        'For each component:',
        '',
        'URLInput.tsx:',
        '- Clean textarea with subtle border (slate-200), gentle focus ring',
        '- Remove heavy gradient border wrapper if too flashy',
        '- Clean submit button with solid color, subtle hover elevation',
        '- Refined error display',
        '',
        'ScoreBadge.tsx:',
        '- Keep the circular SVG score ring concept',
        '- Refine colors and glow (more subtle)',
        '- Add smooth counting animation for the score number',
        '- Clean typography for the score value',
        '',
        'ResultsTable.tsx:',
        '- Minimal table design with subtle borders',
        '- Clean header with refined typography',
        '- Staggered fade-in animation for rows as they appear',
        '- Subtle hover state (slight background tint, not heavy)',
        '- Clean expand/collapse for metrics panel',
        '- Refined error and loading row states',
        '',
        'MetricsPanel.tsx:',
        '- Clean cards with subtle border, slight elevation on hover',
        '- Remove heavy glassmorphism, use clean white/dark surfaces',
        '- Refined typography hierarchy within cards',
        '',
        'LoadingSpinner.tsx:',
        '- Simplify to a clean single-ring spinner',
        '- Use the accent color with subtle opacity',
        '',
        'ExportDropdown.tsx:',
        '- Clean dropdown with subtle shadow',
        '- Smooth scale/opacity animation for open/close',
        '- Refined menu items with clean hover states',
        '',
        'CRITICAL: Keep all TypeScript interfaces, props, and functionality identical.',
        'Only change the visual styling (className, SVG styling, etc.).',
        'Actually edit the files in the codebase.'
      ],
      outputFormat: 'JSON with success, filesModified, changesApplied (array of descriptions), summary'
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
  },
  labels: ['agent', 'implementation', 'components']
}));

export const addAnimationsAndVizTask = defineTask('add-animations-viz', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Add micro-animations and data visualization',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer specializing in CSS animations and SVG data visualization',
      task: 'Add elegant micro-animations and a simple score comparison visualization',
      context: {
        designSpec: args.designSpec,
        features: args.features,
        scope: args.scope
      },
      instructions: [
        'Read the current component files and globals.css.',
        '',
        '=== MICRO-ANIMATIONS ===',
        '1. Add staggered fade-in-up animation for ResultsTable rows:',
        '   - Each row appears with a slight delay (50-80ms stagger)',
        '   - Use CSS animation-delay with inline styles or CSS custom properties',
        '',
        '2. Add smooth score counting in ScoreBadge:',
        '   - Score should count up from 0 to final value over ~800ms',
        '   - Use requestAnimationFrame or CSS counter animation',
        '   - Smooth easing (ease-out)',
        '',
        '3. Subtle hover micro-interactions:',
        '   - Table rows: slight translateY(-1px) with subtle shadow on hover',
        '   - Metric cards: slight scale(1.02) on hover',
        '   - Buttons: slight translateY(-1px) on hover',
        '   - All transitions: 200ms ease',
        '',
        '4. Smooth progress bar animation with ease-out',
        '',
        '=== DATA VISUALIZATION (SIMPLE) ===',
        '5. Create a simple ScoreChart component (optional radar or horizontal bar chart):',
        '   - Pure SVG, no external charting library',
        '   - Show the 4 scores (Performance, Accessibility, SEO, Best Practices) visually',
        '   - Minimal design, matching the clean aesthetic',
        '   - Add it to the expanded metrics panel area in ResultsTable',
        '   - Or add it as a summary section above the results table',
        '',
        'IMPORTANT: Keep animations subtle and tasteful. Nothing flashy.',
        'Ensure all animations respect prefers-reduced-motion.',
        'Actually edit the files in the codebase.'
      ],
      outputFormat: 'JSON with success, filesModified, filesCreated, animationsAdded, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success'],
      properties: {
        success: { type: 'boolean' },
        filesModified: { type: 'array', items: { type: 'string' } },
        filesCreated: { type: 'array', items: { type: 'string' } },
        animationsAdded: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'implementation', 'animations']
}));

export const visualQAScoringTask = defineTask('visual-qa-scoring', (args, taskCtx) => ({
  kind: 'agent',
  title: `Visual QA scoring (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert UI/UX design reviewer specializing in minimal, modern web aesthetics',
      task: 'Score the current implementation against the Minimal & Clean design direction across multiple dimensions',
      context: {
        designDirection: args.designDirection,
        designSpec: args.designSpec,
        iteration: args.iteration,
        targetQuality: args.targetQuality,
        scoringDimensions: args.scoringDimensions
      },
      instructions: [
        'Read ALL component files and globals.css to assess the current visual design.',
        'Files to read: src/app/globals.css, src/app/page.tsx, src/app/layout.tsx,',
        'src/components/URLInput.tsx, src/components/ScoreBadge.tsx,',
        'src/components/ResultsTable.tsx, src/components/MetricsPanel.tsx,',
        'src/components/LoadingSpinner.tsx, src/components/ExportDropdown.tsx',
        'Also check for any new files like ScoreChart.tsx.',
        '',
        '=== SCORING RUBRIC ===',
        '',
        'TYPOGRAPHY (20 points):',
        '- Clean, hierarchical typography with proper sizing',
        '- Consistent font weights (not too many bold/extrabold)',
        '- Comfortable line heights and letter spacing',
        '- Monospace only for metric values',
        '',
        'COLOR SYSTEM (15 points):',
        '- Muted, refined palette (no harsh colors)',
        '- Subtle accents, not heavy gradients everywhere',
        '- Consistent dark mode implementation',
        '- Proper contrast ratios',
        '',
        'SPACING (15 points):',
        '- Generous whitespace, breathing room',
        '- Consistent spacing scale',
        '- Proper alignment and visual rhythm',
        '',
        'COMPONENT DESIGN (20 points):',
        '- Clean, minimal component styling',
        '- Subtle borders and shadows',
        '- Refined interactive states (hover, focus, active)',
        '- No heavy glassmorphism or over-decoration',
        '',
        'ANIMATIONS (10 points):',
        '- Smooth, subtle micro-animations',
        '- Proper easing functions',
        '- Staggered entry animations',
        '- Respects prefers-reduced-motion',
        '',
        'CONSISTENCY (10 points):',
        '- Consistent design language across all components',
        '- Unified border radius, shadow, color usage',
        '- Matching dark mode quality',
        '',
        'MODERN FEEL (10 points):',
        '- Feels contemporary (2024+ aesthetic)',
        '- Similar quality to Linear, Vercel, Stripe dashboards',
        '- Professional and polished',
        '',
        'BE STRICT. Deduct points for:',
        '- Heavy gradients or glows that feel dated',
        '- Inconsistent spacing or typography',
        '- Overly complex component styling',
        '- Missing or jarring animations',
        '- Poor dark mode implementation',
        '',
        'Provide specific, actionable gaps that should be fixed.',
        'DO NOT modify any files - only score and provide feedback.'
      ],
      outputFormat: 'JSON with overallScore (0-100), breakdown (per dimension scores), gaps (array of specific issues with priority), strengths (array), summary'
    },
    outputSchema: {
      type: 'object',
      required: ['overallScore', 'breakdown', 'gaps'],
      properties: {
        overallScore: { type: 'number', minimum: 0, maximum: 100 },
        breakdown: { type: 'object' },
        gaps: { type: 'array', items: { type: 'string' } },
        strengths: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'scoring', `iteration-${args.iteration}`]
}));

export const refineDesignTask = defineTask('refine-design', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine design (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer refining a Minimal & Clean UI implementation',
      task: 'Address the visual QA feedback by making targeted refinements to the codebase',
      context: {
        iteration: args.iteration,
        designSpec: args.designSpec,
        designDirection: args.designDirection,
        previousScore: args.previousScore,
        targetQuality: args.targetQuality
      },
      instructions: [
        'Review the QA feedback from the previous scoring iteration.',
        'The gaps identified were:',
        JSON.stringify(args.previousScore?.gaps || []),
        '',
        'For each gap, make targeted fixes:',
        '- Read the relevant file(s)',
        '- Make precise changes to address the specific feedback',
        '- Keep changes focused - do not over-change',
        '',
        'Priority order:',
        '1. Highest-impact visual issues first',
        '2. Consistency issues',
        '3. Animation refinements',
        '4. Minor polish',
        '',
        'LIMIT to 5-8 changes per iteration.',
        'Actually edit the files. Do not just describe changes.',
        'Keep all functionality working.'
      ],
      outputFormat: 'JSON with success, changesApplied (array of descriptions), filesModified, summary'
    },
    outputSchema: {
      type: 'object',
      required: ['success', 'changesApplied'],
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
  },
  labels: ['agent', 'refinement', `iteration-${args.iteration}`]
}));

export const verifyBuildTask = defineTask('verify-build', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Verify build passes',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Frontend build engineer',
      task: 'Run the Next.js build to verify the redesigned app compiles without errors',
      context: { projectName: args.projectName },
      instructions: [
        'Run: npm run build',
        'If there are TypeScript or build errors, fix them.',
        'Report whether the build succeeded.',
        'If fixes were needed, list what was fixed.'
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
  },
  labels: ['agent', 'build', 'verification']
}));
