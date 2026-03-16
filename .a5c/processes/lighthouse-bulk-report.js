/**
 * @process lighthouse-bulk-report
 * @description Build a fully static Lighthouse Bulk Report Generator with Next.js, TypeScript, Tailwind CSS
 * @inputs { projectName: string, projectDir: string }
 * @outputs { success: boolean, buildPassed: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

/**
 * Lighthouse Bulk Report Generator - Full Build Process
 *
 * Phases (following TASK_PLAN.md):
 * 1. Project Initialization - Next.js + TypeScript + Tailwind + static export
 * 2. URL Input System - textarea, validation, submit, loading state
 * 3. PageSpeed API Integration - API client + report parser
 * 4. Dashboard UI - Results table, score badges, metrics panel
 * 5. Integration & Batch Processing - Wire everything together, batch URLs
 * 6. Build Verification & Quality Gate - npm run build, type check, lint
 * 7. Final Polish & Done Criteria Verification
 */
export async function process(inputs, ctx) {
  const { projectName = 'Lighthouse Bulk Report Generator', projectDir = '.' } = inputs;

  // ============================================================================
  // PHASE 1: PROJECT INITIALIZATION
  // ============================================================================

  const initResult = await ctx.task(projectInitTask, {
    projectName,
    projectDir
  });

  const initVerify = await ctx.task(buildVerifyTask, {
    projectDir,
    phase: 'init',
    description: 'Verify project initialization: npm install succeeds, npm run dev starts, basic page renders'
  });

  // ============================================================================
  // PHASE 2: URL INPUT SYSTEM
  // ============================================================================

  const urlInputResult = await ctx.task(urlInputTask, {
    projectName,
    projectDir,
    initSummary: initResult
  });

  const urlInputVerify = await ctx.task(buildVerifyTask, {
    projectDir,
    phase: 'url-input',
    description: 'Verify URL input: build succeeds, URLInput component exists with textarea, submit button, URL validation, loading state'
  });

  // ============================================================================
  // PHASE 3: PAGESPEED API INTEGRATION + REPORT PARSER
  // ============================================================================

  const apiResult = await ctx.task(apiIntegrationTask, {
    projectName,
    projectDir,
    previousPhases: { init: initResult, urlInput: urlInputResult }
  });

  const apiVerify = await ctx.task(buildVerifyTask, {
    projectDir,
    phase: 'api-integration',
    description: 'Verify API integration: build succeeds, pagespeedClient.ts exists with fetchReport function, reportParser.ts exists with parseReport function, types/report.ts has LighthouseReport type'
  });

  // ============================================================================
  // PHASE 4: DASHBOARD UI
  // ============================================================================

  const dashboardResult = await ctx.task(dashboardUITask, {
    projectName,
    projectDir,
    previousPhases: { init: initResult, urlInput: urlInputResult, api: apiResult }
  });

  const dashboardVerify = await ctx.task(buildVerifyTask, {
    projectDir,
    phase: 'dashboard',
    description: 'Verify dashboard UI: build succeeds, ResultsTable.tsx exists, ScoreBadge.tsx exists, components render score colors (green/yellow/red), loading indicators present'
  });

  // ============================================================================
  // PHASE 5: INTEGRATION & BATCH PROCESSING
  // ============================================================================

  const integrationResult = await ctx.task(integrationTask, {
    projectName,
    projectDir,
    previousPhases: { init: initResult, urlInput: urlInputResult, api: apiResult, dashboard: dashboardResult }
  });

  const integrationVerify = await ctx.task(buildVerifyTask, {
    projectDir,
    phase: 'integration',
    description: 'Verify full integration: build succeeds, index page wires URLInput to API to ResultsTable, batch processing works sequentially, error handling for invalid URLs and API failures, progress indicator during batch processing'
  });

  // ============================================================================
  // PHASE 6: QUALITY CONVERGENCE - BUILD + POLISH
  // ============================================================================

  let qualityPassed = false;
  let qualityIteration = 0;
  const maxQualityIterations = 3;

  while (!qualityPassed && qualityIteration < maxQualityIterations) {
    qualityIteration++;

    const qualityResult = await ctx.task(qualityCheckTask, {
      projectDir,
      iteration: qualityIteration,
      projectName
    });

    qualityPassed = qualityResult.passed || false;

    if (!qualityPassed && qualityIteration < maxQualityIterations) {
      const fixResult = await ctx.task(qualityFixTask, {
        projectDir,
        iteration: qualityIteration,
        issues: qualityResult.issues || [],
        projectName
      });
    }
  }

  // ============================================================================
  // PHASE 7: FINAL VERIFICATION AGAINST DONE_CRITERIA.md
  // ============================================================================

  const finalVerify = await ctx.task(finalVerificationTask, {
    projectDir,
    projectName
  });

  return {
    success: true,
    projectName,
    buildPassed: qualityPassed,
    phases: {
      init: initResult,
      urlInput: urlInputResult,
      api: apiResult,
      dashboard: dashboardResult,
      integration: integrationResult
    },
    qualityIterations: qualityIteration,
    finalVerification: finalVerify,
    metadata: {
      processId: 'lighthouse-bulk-report',
      timestamp: ctx.now()
    }
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

export const projectInitTask = defineTask('project-init', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 1: Initialize Next.js project with TypeScript + Tailwind + static export',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior Next.js developer',
      task: `Initialize a new Next.js project called "${args.projectName}" in the directory "${args.projectDir}" with TypeScript, Tailwind CSS, and static export configuration.`,
      context: {
        projectDir: args.projectDir,
        projectName: args.projectName,
        requirements: [
          'Next.js with TypeScript',
          'Tailwind CSS configured',
          'Static export enabled (output: "export" in next.config)',
          'Project folder structure: src/components/, src/lib/, src/types/, src/app/ (or src/pages/)',
          'Clean index page with project title placeholder'
        ]
      },
      instructions: [
        `Run "npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias" in the project directory "${args.projectDir}" (use --yes or answer defaults)`,
        'Configure next.config.ts/js to enable static export with output: "export"',
        'Create folder structure: src/components/, src/lib/, src/types/',
        'Update the main page to show a simple "Lighthouse Bulk Report Generator" title',
        'Ensure npm run build succeeds with static export',
        'Return a JSON summary of files created and the project structure'
      ],
      outputFormat: 'JSON with filesCreated (array of strings), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesCreated', 'summary'],
      properties: {
        filesCreated: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'phase-1', 'init']
}));

export const urlInputTask = defineTask('url-input-system', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 2: Build URL input system',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior React/TypeScript developer',
      task: 'Build the URL input system for the Lighthouse Bulk Report Generator.',
      context: {
        projectDir: args.projectDir,
        architecture: {
          component: 'src/components/URLInput.tsx',
          features: ['Multi-URL textarea input', 'URL validation', 'URL list parsing', 'Submit button', 'Loading state']
        }
      },
      instructions: [
        'Read the existing project structure first to understand the codebase',
        'Create src/components/URLInput.tsx with: textarea for multi-URL input (one URL per line), URL validation (http/https), submit button ("Generate Report"), loading state indicator',
        'Create src/lib/urlValidator.ts with URL validation and parsing logic - supports http and https, sanitizes input, handles empty lines',
        'Integrate URLInput into the main page (src/app/page.tsx)',
        'Style with Tailwind CSS - clean, professional look',
        'Ensure the component accepts onSubmit callback with validated URL array',
        'Add proper TypeScript types',
        'Run npm run build to verify everything compiles',
        'Return JSON summary of files created/modified'
      ],
      outputFormat: 'JSON with filesCreated (array), filesModified (array), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesCreated', 'summary'],
      properties: {
        filesCreated: { type: 'array', items: { type: 'string' } },
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'phase-2', 'url-input']
}));

export const apiIntegrationTask = defineTask('api-integration', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 3: PageSpeed API integration + report parser',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior TypeScript developer with API integration experience',
      task: 'Implement the PageSpeed Insights API client and Lighthouse report parser.',
      context: {
        projectDir: args.projectDir,
        apiEndpoint: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
        architecture: {
          apiClient: 'src/lib/pagespeedClient.ts',
          parser: 'src/lib/reportParser.ts',
          types: 'src/types/report.ts'
        },
        metricsRequired: [
          'Performance Score', 'Accessibility Score', 'SEO Score', 'Best Practices Score',
          'First Contentful Paint', 'Largest Contentful Paint', 'Total Blocking Time',
          'Cumulative Layout Shift', 'Time to Interactive'
        ]
      },
      instructions: [
        'Read the existing project structure and code first',
        'Create src/types/report.ts with TypeScript interfaces: LighthouseReport (url, scores, coreWebVitals, fetchedAt, strategy, error), CategoryScores (performance, accessibility, seo, bestPractices - all numbers 0-100), CoreWebVitals (fcp, lcp, tbt, cls, tti - with value and displayValue)',
        'Create src/lib/pagespeedClient.ts with: fetchReport(url, strategy) function that calls the PageSpeed Insights API, handles errors, returns raw JSON. Include rate limiting support (delay between requests). Strategy parameter for mobile/desktop.',
        'Create src/lib/reportParser.ts with: parseReport(apiResponse) function that extracts scores and Core Web Vitals from the raw API response into LighthouseReport format',
        'The API is free without a key (limited rate), so do NOT require an API key - just use the public endpoint with url and strategy params',
        'Handle API errors gracefully (network errors, invalid URLs, rate limits, timeouts)',
        'Run npm run build to verify everything compiles',
        'Return JSON summary of files created/modified'
      ],
      outputFormat: 'JSON with filesCreated (array), filesModified (array), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesCreated', 'summary'],
      properties: {
        filesCreated: { type: 'array', items: { type: 'string' } },
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'phase-3', 'api']
}));

export const dashboardUITask = defineTask('dashboard-ui', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 4: Build dashboard UI components',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior React/TypeScript frontend developer with strong UI/UX skills',
      task: 'Build the results dashboard UI components for the Lighthouse Bulk Report Generator.',
      context: {
        projectDir: args.projectDir,
        components: {
          resultsTable: 'src/components/ResultsTable.tsx',
          scoreBadge: 'src/components/ScoreBadge.tsx',
          metricsPanel: 'src/components/MetricsPanel.tsx'
        },
        typesFile: 'src/types/report.ts'
      },
      instructions: [
        'Read the existing project code first (especially src/types/report.ts for types)',
        'Create src/components/ScoreBadge.tsx - circular/pill badge showing score 0-100 with color coding: green (90-100), yellow/orange (50-89), red (0-49). Use Tailwind CSS.',
        'Create src/components/MetricsPanel.tsx - expandable panel showing Core Web Vitals (FCP, LCP, TBT, CLS, TTI) with values and display values',
        'Create src/components/ResultsTable.tsx - table displaying all results with columns: URL, Performance, Accessibility, SEO, Best Practices. Each score cell uses ScoreBadge. Expandable rows show MetricsPanel. Handle loading/error states per row.',
        'Create src/components/LoadingSpinner.tsx - simple loading spinner component',
        'Style everything with Tailwind CSS - clean, professional, responsive design',
        'Ensure all components have proper TypeScript props types',
        'Run npm run build to verify everything compiles',
        'Return JSON summary of files created/modified'
      ],
      outputFormat: 'JSON with filesCreated (array), filesModified (array), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesCreated', 'summary'],
      properties: {
        filesCreated: { type: 'array', items: { type: 'string' } },
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'phase-4', 'dashboard']
}));

export const integrationTask = defineTask('integration', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 5: Full integration + batch processing',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior full-stack developer',
      task: 'Wire all components together into a fully functional Lighthouse Bulk Report Generator with batch processing.',
      context: {
        projectDir: args.projectDir,
        existingComponents: [
          'src/components/URLInput.tsx',
          'src/components/ResultsTable.tsx',
          'src/components/ScoreBadge.tsx',
          'src/components/MetricsPanel.tsx',
          'src/lib/pagespeedClient.ts',
          'src/lib/reportParser.ts',
          'src/types/report.ts'
        ]
      },
      instructions: [
        'Read ALL existing code first to understand the full codebase',
        'Update src/app/page.tsx to be the main application page that: 1) Shows URLInput at the top, 2) On submit, processes URLs sequentially using pagespeedClient + reportParser, 3) Displays results progressively in ResultsTable, 4) Shows progress indicator (e.g., "Processing 3/10 URLs...")',
        'Implement batch processing with: sequential URL processing (one at a time to avoid rate limits), 1.5 second delay between requests, progressive result rendering (show each result as it arrives), proper error handling per URL (show error in table row, continue with next URL)',
        'Add state management using React useState/useReducer for: URL queue, loading states (per URL and global), results storage, error states',
        'Handle all error cases: invalid URLs (show validation error), API failures (show error message per URL), network errors, empty input',
        'Add a strategy toggle (mobile/desktop) above the URL input',
        'Ensure the full user flow works: enter URLs -> click Generate -> see progress -> see results table',
        'Run npm run build to verify static export succeeds',
        'Return JSON summary of files created/modified'
      ],
      outputFormat: 'JSON with filesCreated (array), filesModified (array), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['summary'],
      properties: {
        filesCreated: { type: 'array', items: { type: 'string' } },
        filesModified: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'phase-5', 'integration']
}));

export const buildVerifyTask = defineTask('build-verify', (args, taskCtx) => ({
  kind: 'agent',
  title: `Verify build: ${args.phase}`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'QA engineer',
      task: `Verify the build after phase "${args.phase}".`,
      context: {
        projectDir: args.projectDir,
        phase: args.phase,
        checkDescription: args.description
      },
      instructions: [
        `cd to "${args.projectDir}" and run "npm run build"`,
        'Check that build succeeds without errors',
        `Verify: ${args.description}`,
        'If build fails, fix the issues and rebuild',
        'Return JSON with passed (boolean), issues (array of strings), summary (string)'
      ],
      outputFormat: 'JSON with passed (boolean), issues (array), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['passed', 'summary'],
      properties: {
        passed: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'verification', args.phase]
}));

export const qualityCheckTask = defineTask('quality-check', (args, taskCtx) => ({
  kind: 'agent',
  title: `Quality check iteration ${args.iteration}`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior QA engineer and code reviewer',
      task: 'Run comprehensive quality checks on the Lighthouse Bulk Report Generator.',
      context: {
        projectDir: args.projectDir,
        iteration: args.iteration,
        projectName: args.projectName
      },
      instructions: [
        `cd to "${args.projectDir}"`,
        'Run "npm run build" and verify static export succeeds',
        'Run TypeScript type checking with "npx tsc --noEmit"',
        'Review all source files in src/ for: TypeScript correctness, proper error handling, clean code structure, modular architecture',
        'Check against DONE_CRITERIA.md requirements: multi-URL input, PageSpeed API fetch, dashboard display, error handling, loading states, clean code',
        'Check against AI_CONTRACT.md: no backend, no database, no servers, fully static, only PageSpeed API',
        'Return JSON with passed (boolean - true only if build succeeds and all criteria met), issues (array of specific issues found), summary (string)'
      ],
      outputFormat: 'JSON with passed (boolean), issues (array of strings), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['passed'],
      properties: {
        passed: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'quality', `iteration-${args.iteration}`]
}));

export const qualityFixTask = defineTask('quality-fix', (args, taskCtx) => ({
  kind: 'agent',
  title: `Fix quality issues iteration ${args.iteration}`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior developer',
      task: 'Fix all quality issues found in the Lighthouse Bulk Report Generator.',
      context: {
        projectDir: args.projectDir,
        iteration: args.iteration,
        issues: args.issues
      },
      instructions: [
        `cd to "${args.projectDir}" and read all relevant source files`,
        `Fix these specific issues: ${JSON.stringify(args.issues)}`,
        'Run "npm run build" to verify fixes compile',
        'Return JSON summary of what was fixed'
      ],
      outputFormat: 'JSON with filesModified (array), fixesSummary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['fixesSummary'],
      properties: {
        filesModified: { type: 'array', items: { type: 'string' } },
        fixesSummary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'quality-fix', `iteration-${args.iteration}`]
}));

export const finalVerificationTask = defineTask('final-verification', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Final verification against DONE_CRITERIA.md',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior QA engineer conducting final acceptance testing',
      task: 'Perform final comprehensive verification of the Lighthouse Bulk Report Generator against all done criteria.',
      context: {
        projectDir: args.projectDir,
        projectName: args.projectName,
        doneCriteria: {
          functional: ['Accept multiple URLs as input', 'Fetch Lighthouse results from PageSpeed API', 'Display results in a dashboard'],
          deployment: ['Successful build', 'Static site output', 'No server requirements'],
          outputValidation: ['Performance score', 'Accessibility score', 'SEO score', 'Best practices score'],
          errorHandling: ['Invalid URLs', 'API failures', 'Empty input', 'Network issues'],
          ui: ['URL input section', 'Submit button', 'Results dashboard', 'Loading state'],
          codeQuality: ['Clean code structure', 'TypeScript correctness', 'Proper modularization'],
          buildVerification: ['npm install succeeds', 'npm run dev works', 'npm run build succeeds']
        }
      },
      instructions: [
        `cd to "${args.projectDir}"`,
        'Run "npm run build" and verify it produces static output',
        'Verify each done criteria item by reading the source code',
        'Check that the static export exists in out/ directory',
        'Verify all required components exist and are properly wired',
        'Run TypeScript type check with "npx tsc --noEmit"',
        'If any criteria is NOT met, fix the issue immediately',
        'Return JSON with allCriteriaMet (boolean), criteriaResults (object mapping each criterion to pass/fail), summary (string)'
      ],
      outputFormat: 'JSON with allCriteriaMet (boolean), criteriaResults (object), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['allCriteriaMet', 'summary'],
      properties: {
        allCriteriaMet: { type: 'boolean' },
        criteriaResults: { type: 'object' },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'final-verification']
}));
