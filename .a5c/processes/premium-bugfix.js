/**
 * @process premium-bugfix
 * @description Re-fix 7 bugs with premium, polished, attractive design. 3 phases: Premium Toggle, Results & Loading, Premium Tooltips.
 * @inputs { targetQuality: number, maxIterations: number }
 * @outputs { success: boolean, bugsFixed: number, phases: array }
 */
import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  const { targetQuality = 90, maxIterations = 3 } = inputs;
  const phaseResults = [];
  ctx.log('info', 'Starting Premium Bug Fix — 7 bugs, 3 phases');

  // ========= PHASE 1: Premium Toggle (BUG-1, BUG-2) =========
  ctx.log('info', '=== PHASE 1: Premium Toggle (BUG-1, BUG-2) ===');
  const p1Fix = await ctx.task(fixPremiumToggleTask, {});
  const p1Build = await ctx.task(verifyBuildTask, { phase: 'Phase 1' });
  let p1Score = 0, p1Conv = false, p1Iter = 0;
  const p1Init = await ctx.task(scoreToggleTask, { iteration: 0, targetQuality });
  p1Score = p1Init.overallScore || 0;
  p1Conv = p1Score >= targetQuality;
  while (!p1Conv && p1Iter < maxIterations) {
    p1Iter++;
    ctx.log('info', `Phase 1 refine ${p1Iter}, score: ${p1Score}`);
    await ctx.task(refineToggleTask, { iteration: p1Iter, previousScore: p1Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 1 Refine ${p1Iter}` });
    const ns = await ctx.task(scoreToggleTask, { iteration: p1Iter, targetQuality });
    p1Score = ns.overallScore || 0;
    p1Conv = p1Score >= targetQuality;
    if (p1Score - (p1Init.overallScore || 0) <= 0 && p1Iter > 1) break;
  }
  phaseResults.push({ phase: 'Phase 1: Premium Toggle', bugs: ['BUG-1','BUG-2'], score: p1Score });
  await ctx.task(gitCommitTask, { title: 'BUG-1,2 — Premium iOS-style strategy toggle', summary: `Premium sliding toggle with spring easing, repositioned near Generate button. Score: ${p1Score}` });
  await ctx.breakpoint({ question: `Phase 1 done (BUG-1,2). Score: ${p1Score}/${targetQuality}. Proceed?`, title: 'Phase 1 Review', tag: 'p1' });

  // ========= PHASE 2: Results Badge + Loading Animation (BUG-4, BUG-5) =========
  ctx.log('info', '=== PHASE 2: Results Badge + Loading (BUG-4, BUG-5) ===');
  const p2Fix = await ctx.task(fixResultsAndLoadingTask, {});
  const p2Build = await ctx.task(verifyBuildTask, { phase: 'Phase 2' });
  let p2Score = 0, p2Conv = false, p2Iter = 0;
  const p2Init = await ctx.task(scoreResultsLoadingTask, { iteration: 0, targetQuality });
  p2Score = p2Init.overallScore || 0;
  p2Conv = p2Score >= targetQuality;
  while (!p2Conv && p2Iter < maxIterations) {
    p2Iter++;
    ctx.log('info', `Phase 2 refine ${p2Iter}, score: ${p2Score}`);
    await ctx.task(refineResultsLoadingTask, { iteration: p2Iter, previousScore: p2Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 2 Refine ${p2Iter}` });
    const ns = await ctx.task(scoreResultsLoadingTask, { iteration: p2Iter, targetQuality });
    p2Score = ns.overallScore || 0;
    p2Conv = p2Score >= targetQuality;
    if (p2Score - (p2Init.overallScore || 0) <= 0 && p2Iter > 1) break;
  }
  phaseResults.push({ phase: 'Phase 2: Results & Loading', bugs: ['BUG-4','BUG-5'], score: p2Score });
  await ctx.task(gitCommitTask, { title: 'BUG-4,5 — Strategy badge + orbiting ring loader', summary: `Premium strategy badge in results, orbiting ring with glow trail. Score: ${p2Score}` });
  await ctx.breakpoint({ question: `Phase 2 done (BUG-4,5). Score: ${p2Score}/${targetQuality}. Proceed?`, title: 'Phase 2 Review', tag: 'p2' });

  // ========= PHASE 3: Premium Tooltips (BUG-6, BUG-7, BUG-8) =========
  ctx.log('info', '=== PHASE 3: Premium Tooltips (BUG-6, BUG-7, BUG-8) ===');
  const p3Fix = await ctx.task(fixPremiumTooltipsTask, {});
  const p3Build = await ctx.task(verifyBuildTask, { phase: 'Phase 3' });
  let p3Score = 0, p3Conv = false, p3Iter = 0;
  const p3Init = await ctx.task(scoreTooltipsTask, { iteration: 0, targetQuality });
  p3Score = p3Init.overallScore || 0;
  p3Conv = p3Score >= targetQuality;
  while (!p3Conv && p3Iter < maxIterations) {
    p3Iter++;
    ctx.log('info', `Phase 3 refine ${p3Iter}, score: ${p3Score}`);
    await ctx.task(refineTooltipsTask, { iteration: p3Iter, previousScore: p3Score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Phase 3 Refine ${p3Iter}` });
    const ns = await ctx.task(scoreTooltipsTask, { iteration: p3Iter, targetQuality });
    p3Score = ns.overallScore || 0;
    p3Conv = p3Score >= targetQuality;
    if (p3Score - (p3Init.overallScore || 0) <= 0 && p3Iter > 1) break;
  }
  phaseResults.push({ phase: 'Phase 3: Premium Tooltips', bugs: ['BUG-6','BUG-7','BUG-8'], score: p3Score });
  await ctx.task(gitCommitTask, { title: 'BUG-6,7,8 — Premium glass-panel tooltips with info icons', summary: `Polished tooltips with glass styling, info icons, consistent across all components. Score: ${p3Score}` });

  // ========= FINAL: Documentation + Playwright =========
  ctx.log('info', '=== FINAL: Documentation & Tests ===');
  await ctx.task(documentFixesTask, { phases: phaseResults });
  await ctx.task(verifyBuildTask, { phase: 'Final' });
  await ctx.task(gitCommitTask, { title: 'Document 7 premium bug fixes, clear TO_BE_FIXED.md', summary: 'Updated RECENT_FIXATION.md, cleared TO_BE_FIXED.md' });
  await ctx.breakpoint({ question: `All 7 bugs fixed. Scores: ${phaseResults.map(p=>`${p.phase}: ${p.score}`).join(', ')}. Approve?`, title: 'Final Review', tag: 'final' });
  return { success: true, bugsFixed: 7, phases: phaseResults };
}

// ============ TASK DEFINITIONS ============

export const fixPremiumToggleTask = defineTask('fix-premium-toggle', (args, taskCtx) => ({
  kind: 'agent', title: 'Premium toggle (BUG-1,2)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert frontend designer creating premium, polished UI components with pixel-perfect attention to detail',
      task: 'Redesign the Desktop/Mobile strategy toggle as a premium iOS/Material-style sliding switch and reposition it near the Generate button',
      context: {},
      instructions: [
        'Read src/app/page.tsx fully. Also read src/app/globals.css.',
        '',
        '=== BUG-1: PREMIUM TOGGLE SWITCH ===',
        'Replace the current pill-style two-button toggle with a TRUE sliding toggle switch:',
        '- A rounded-full TRACK (about 200px wide, 44px tall) with a sliding THUMB/KNOB',
        '- The THUMB is a circle/pill that GLIDES smoothly between left (Desktop) and right (Mobile)',
        '- Use cubic-bezier(0.68, -0.55, 0.265, 1.55) for spring-like bounce easing on the thumb',
        '- Track background: gradient that shifts color as thumb moves (sky-500 gradient on active side)',
        '- Thumb: white circle with subtle shadow-lg and a slight scale bump on press',
        '- Labels "Desktop" and "Mobile" are positioned on each side of the track',
        '- Active side label: bold white text, inactive: muted semi-transparent text',
        '- Small monitor SVG icon next to "Desktop", small smartphone SVG icon next to "Mobile"',
        '- On toggle, the thumb slides across with the spring easing — NOT just a color swap',
        '- Disabled state during loading: opacity-50, pointer-events-none, no cursor changes',
        '- Must work in dark mode (adjust track colors for dark backgrounds)',
        '- The toggle should feel PHYSICAL — like flipping a real switch',
        '',
        '=== BUG-2: REPOSITION NEAR GENERATE BUTTON ===',
        'Move the toggle to be DIRECTLY associated with the primary action area:',
        '- Place it on the same row as the Generate/Analyze button OR directly above it',
        '- If same row: toggle left-aligned, button right-aligned, with proper gap',
        '- The visual flow should be: URLs input → strategy toggle → generate button',
        '- It should feel like part of the "analysis configuration" not a floating element',
        '- Ensure it looks balanced on mobile (stack vertically) and desktop (horizontal)',
        '- Find the URLInput component submit area and integrate the toggle there',
        '',
        'Default strategy must be "desktop". Keep ALL existing functionality intact.',
        'Actually edit the files. Make it look premium and polished.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, filesModified: { type: 'array' }, summary: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const scoreToggleTask = defineTask('score-toggle', (args, taskCtx) => ({
  kind: 'agent', title: `Score toggle (iter ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert UI/UX design critic evaluating premium component quality',
      task: 'Score the strategy toggle implementation against premium design standards',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read src/app/page.tsx and src/app/globals.css.',
        '',
        '=== SCORING RUBRIC (100 points) ===',
        'Toggle Mechanism (25 pts): Is there a real sliding thumb/knob? Does it glide with spring easing?',
        'Visual Polish (25 pts): Track gradient, thumb shadow, scale effects, glow, premium feel?',
        'Position/UX (20 pts): Is it near the Generate button? Does the flow feel natural?',
        'Labels & Icons (15 pts): Monitor/phone icons? Bold active, muted inactive? Readable?',
        'Functionality (15 pts): Default Desktop? Disabled during loading? Dark mode? Caching works?',
        '',
        'BE VERY STRICT on premium feel. This must feel like an Apple/Google toggle, not generic.',
        'DO NOT modify files.'
      ],
      outputFormat: 'JSON with overallScore (0-100), gaps'
    },
    outputSchema: { type: 'object', required: ['overallScore', 'gaps'], properties: { overallScore: { type: 'number' }, gaps: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const refineToggleTask = defineTask('refine-toggle', (args, taskCtx) => ({
  kind: 'agent', title: `Refine toggle (iter ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert frontend designer refining premium toggle',
      task: 'Address quality gaps to elevate the toggle to premium standards',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: ['Read page.tsx and globals.css. Fix the highest-impact gaps. Make it feel Apple/Google-quality. Actually edit files.'],
      outputFormat: 'JSON with success, changesApplied, filesModified'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, changesApplied: { type: 'array' }, filesModified: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const fixResultsAndLoadingTask = defineTask('fix-results-loading', (args, taskCtx) => ({
  kind: 'agent', title: 'Results badge + loading (BUG-4,5)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert frontend designer creating premium loading animations and UI badges',
      task: 'Add premium strategy badge in results and redesign loading animation as orbiting ring',
      context: {},
      instructions: [
        'Read src/app/page.tsx, src/components/LoadingSpinner.tsx, src/app/globals.css',
        '',
        '=== BUG-4: STRATEGY BADGE IN RESULTS ===',
        'Add a styled pill badge near the results heading showing "Desktop Results" or "Mobile Results":',
        '- Use accent gradient background (sky-500 → cyan-400) with white text',
        '- Include monitor/phone SVG icon',
        '- Smooth swap animation when strategy changes (scale + fade)',
        '- Position: next to the "Results" heading text',
        '- Should be immediately noticeable but not overwhelming',
        '',
        '=== BUG-5: PREMIUM ORBITING RING ANIMATION ===',
        'Replace/redesign the loading animation to be a premium orbiting ring:',
        '- Create a LARGE circular ring (80-100px) as the primary visual during analysis',
        '- A glowing ARC travels along the ring path with a gradient trail (sky-500 → transparent)',
        '- The ring rotates SMOOTHLY and continuously (not in steps)',
        '- Add a subtle BLOOM/GLOW effect around the traveling arc',
        '- Center the progress percentage text INSIDE the ring (large, bold)',
        '- The ring should pulse subtly (opacity 0.8 → 1.0) for a breathing effect',
        '- Use CSS @keyframes with transform: rotate() for GPU acceleration',
        '- Add a faint track/guide circle behind the moving arc',
        '- Keep the progress bar below as secondary indicator',
        '- This should be visually IMPRESSIVE — something users enjoy watching',
        '',
        'Use CSS custom properties for colors. Actually edit the files.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, filesModified: { type: 'array' }, summary: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const scoreResultsLoadingTask = defineTask('score-results-loading', (args, taskCtx) => ({
  kind: 'agent', title: `Score results/loading (iter ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert UI/UX design critic',
      task: 'Score the strategy badge and loading animation implementations',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read src/app/page.tsx, src/components/LoadingSpinner.tsx, src/app/globals.css',
        '=== SCORING RUBRIC (100 points) ===',
        'Strategy Badge (30 pts): Visible, styled, dynamic, gradient, icon, animation on switch?',
        'Orbiting Ring (40 pts): Large ring with gradient arc, smooth rotation, glow/bloom, progress % inside?',
        'Visual Polish (15 pts): Premium feel, dark mode, consistent colors, GPU-accelerated?',
        'Integration (15 pts): Fits with existing UI, no layout breaks, responsive?',
        'BE VERY STRICT. This must look impressive. DO NOT modify files.'
      ],
      outputFormat: 'JSON with overallScore (0-100), gaps'
    },
    outputSchema: { type: 'object', required: ['overallScore', 'gaps'], properties: { overallScore: { type: 'number' }, gaps: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const refineResultsLoadingTask = defineTask('refine-results-loading', (args, taskCtx) => ({
  kind: 'agent', title: `Refine results/loading (iter ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert frontend designer refining premium animations',
      task: 'Address gaps in strategy badge and loading animation',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: ['Read the files, fix highest-impact gaps. Make it visually impressive. Actually edit files.'],
      outputFormat: 'JSON with success, changesApplied, filesModified'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, changesApplied: { type: 'array' }, filesModified: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const fixPremiumTooltipsTask = defineTask('fix-premium-tooltips', (args, taskCtx) => ({
  kind: 'agent', title: 'Premium tooltips (BUG-6,7,8)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert frontend designer creating premium tooltip system',
      task: 'Redesign all tooltips to be premium glass-panel style with info icons',
      context: {},
      instructions: [
        'Read src/components/Tooltip.tsx, src/components/ResultsTable.tsx, src/components/ScoreChart.tsx, src/components/MetricsPanel.tsx',
        '',
        '=== TOOLTIP REDESIGN ===',
        'Redesign the Tooltip component to be premium/glass-panel style:',
        '- Background: glass effect (backdrop-blur-md bg-gray-900/80 dark:bg-white/90)',
        '- Border: subtle border (border border-white/10 dark:border-gray-900/10)',
        '- Shadow: shadow-xl with colored tint (shadow-sky-500/5)',
        '- Text: text-sm text-white dark:text-gray-900, max-w-xs',
        '- Arrow: matching glass style',
        '- Animation: scale-95 opacity-0 → scale-100 opacity-100 with 200ms ease-out',
        '- Delay: 150ms before showing (to prevent flicker on fast mouse movement)',
        '',
        '=== INFO ICONS ===',
        'Add a small info icon (circle with "i") next to each hoverable label:',
        '- Use an inline SVG: circle with "i" letter, 14x14px, text-[var(--text-tertiary)]',
        '- The icon hints that the element is hoverable',
        '- Icon should be subtle (low opacity until hover)',
        '',
        '=== BUG-6: ResultsTable score tooltips ===',
        'Update tooltip TEXT to these exact descriptions:',
        '- Performance: "Measures how quickly page content loads and becomes interactive. Includes metrics like FCP, LCP, TBT, CLS, and Speed Index."',
        '- Accessibility: "Evaluates how accessible your page is to users with disabilities. Checks color contrast, ARIA attributes, keyboard navigation, and semantic HTML."',
        '- SEO: "Checks if the page follows search engine optimization best practices. Includes meta tags, crawlability, structured data, and mobile-friendliness."',
        '- Best Practices: "Audits general web development best practices including HTTPS usage, image aspect ratios, console errors, and deprecated APIs."',
        'Apply to desktop headers, desktop row cells, AND mobile cards.',
        '',
        '=== BUG-7: ScoreChart tooltips ===',
        'Same texts as BUG-6, applied to category labels in the bar chart.',
        '',
        '=== BUG-8: MetricsPanel metric tooltips ===',
        'Update tooltip TEXT to:',
        '- FCP: "First Contentful Paint — Time until the browser renders the first piece of content (text, image, canvas). Indicates how quickly users see something on screen."',
        '- LCP: "Largest Contentful Paint — Time until the largest visible content element is fully rendered. Measures perceived load speed for the main content."',
        '- TBT: "Total Blocking Time — Total time between FCP and TTI where the main thread was blocked long enough to prevent input responsiveness. Lower is better."',
        '- CLS: "Cumulative Layout Shift — Measures visual stability — how much the page layout shifts unexpectedly during loading. A low score means elements don\'t jump around."',
        '- TTI: "Time to Interactive — Time until the page is fully interactive — content is displayed and event handlers are registered for most visible elements."',
        'Add dashed underline on metric abbreviations to hint hoverability.',
        '',
        'Actually edit all files. Make tooltips feel premium.'
      ],
      outputFormat: 'JSON with success, filesModified, summary'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, filesModified: { type: 'array' }, summary: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const scoreTooltipsTask = defineTask('score-tooltips', (args, taskCtx) => ({
  kind: 'agent', title: `Score tooltips (iter ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert UI/UX design critic',
      task: 'Score tooltip implementations against premium design standards',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read Tooltip.tsx, ResultsTable.tsx, ScoreChart.tsx, MetricsPanel.tsx',
        '=== SCORING RUBRIC (100 points) ===',
        'Tooltip Design (25 pts): Glass-panel style? Backdrop blur? Smooth animation? Shadow?',
        'Info Icons (15 pts): Circle-i icons next to all hoverable labels? Subtle styling?',
        'ResultsTable (20 pts): All 4 categories have CORRECT text? Desktop + mobile cards?',
        'ScoreChart (15 pts): All 4 categories have tooltips?',
        'MetricsPanel (15 pts): All 5 metrics have CORRECT definition texts? Dashed underline hint?',
        'Consistency (10 pts): Same styling across all 3 components?',
        'BE VERY STRICT. DO NOT modify files.'
      ],
      outputFormat: 'JSON with overallScore (0-100), gaps'
    },
    outputSchema: { type: 'object', required: ['overallScore', 'gaps'], properties: { overallScore: { type: 'number' }, gaps: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const refineTooltipsTask = defineTask('refine-tooltips', (args, taskCtx) => ({
  kind: 'agent', title: `Refine tooltips (iter ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert frontend designer refining premium tooltips',
      task: 'Address gaps in tooltip design and content',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: ['Read the component files. Fix gaps. Ensure glass-panel style, info icons, correct text. Actually edit files.'],
      outputFormat: 'JSON with success, changesApplied, filesModified'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, changesApplied: { type: 'array' }, filesModified: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const documentFixesTask = defineTask('document-fixes', (args, taskCtx) => ({
  kind: 'agent', title: 'Document 7 bug fixes',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical writer',
      task: 'Document all 7 bug fixes in RECENT_FIXATION.md and clear TO_BE_FIXED.md',
      context: { phases: args.phases },
      instructions: [
        'Read BUG_FIX_RULES.md, RECENT_FIXATION.md, TO_BE_FIXED.md',
        'Add 7 new entries at TOP of RECENT_FIXATION.md (below header) for BUG-1,2,4,5,6,7,8',
        'Include: Bug, Root cause, Fix, Files modified, Verified by',
        'Date: 2026-03-17',
        'Clear TO_BE_FIXED.md (keep header + note + separator only)',
        'Actually edit both files.'
      ],
      outputFormat: 'JSON with success, filesModified'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, filesModified: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const gitCommitTask = defineTask('git-commit', (args, taskCtx) => ({
  kind: 'agent', title: `Commit: ${args.title}`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Version control engineer',
      task: `Git commit: ${args.title}`,
      context: { title: args.title, summary: args.summary },
      instructions: ['git add -A', `Commit with: ${args.title}\\n\\n${args.summary}`, 'Use heredoc. Do NOT push.'],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const verifyBuildTask = defineTask('verify-build', (args, taskCtx) => ({
  kind: 'agent', title: `Build (${args.phase})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Build engineer',
      task: 'Run npm run build, fix any errors',
      context: { phase: args.phase },
      instructions: ['Run: npm run build', 'Fix TypeScript/build errors if any, re-run.'],
      outputFormat: 'JSON with success, fixesApplied'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, fixesApplied: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
