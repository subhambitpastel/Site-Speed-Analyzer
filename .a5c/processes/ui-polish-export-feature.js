/**
 * @process ui-polish-export-feature
 * @description Polish UI with elegant colors and add export functionality (PDF, DOC, CSV)
 * @inputs { projectDir: string }
 * @outputs { success: boolean, buildPassed: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

/**
 * UI Polish + Export Feature Process
 *
 * Phase 1: UI Polish - Refine all components with elegant color scheme, spacing, typography
 * Phase 2: Export Libraries - Install and configure jspdf, jspdf-autotable, docx for client-side export
 * Phase 3: Export Utilities - Build export helpers (CSV, PDF, DOCX generation)
 * Phase 4: Export UI - Add export dropdown/buttons to the results section
 * Phase 5: Integration & Build Verification
 * Phase 6: Quality Convergence Loop
 */
export async function process(inputs, ctx) {
  const { projectDir = '.' } = inputs;

  // ============================================================================
  // PHASE 1: UI POLISH - Elegant color scheme, typography, spacing
  // ============================================================================

  const uiPolishResult = await ctx.task(uiPolishTask, {
    projectDir,
    components: [
      'src/app/page.tsx',
      'src/app/globals.css',
      'src/components/URLInput.tsx',
      'src/components/ResultsTable.tsx',
      'src/components/ScoreBadge.tsx',
      'src/components/MetricsPanel.tsx',
      'src/components/LoadingSpinner.tsx'
    ]
  });

  const uiVerify = await ctx.task(buildVerifyTask, {
    projectDir,
    phase: 'ui-polish',
    description: 'Verify UI polish: build succeeds, all components use consistent elegant color scheme with proper alignment and spacing'
  });

  // ============================================================================
  // PHASE 2: INSTALL EXPORT LIBRARIES
  // ============================================================================

  const installResult = await ctx.task(installExportLibsTask, {
    projectDir
  });

  // ============================================================================
  // PHASE 3: EXPORT UTILITIES - CSV, PDF, DOCX generation helpers
  // ============================================================================

  const exportUtilsResult = await ctx.task(exportUtilsTask, {
    projectDir
  });

  const exportUtilsVerify = await ctx.task(buildVerifyTask, {
    projectDir,
    phase: 'export-utils',
    description: 'Verify export utilities: build succeeds, src/lib/exportCSV.ts, src/lib/exportPDF.ts, src/lib/exportDOCX.ts exist with proper TypeScript types and export functions'
  });

  // ============================================================================
  // PHASE 4: EXPORT UI - Dropdown/buttons in results section
  // ============================================================================

  const exportUIResult = await ctx.task(exportUITask, {
    projectDir,
    exportUtils: exportUtilsResult
  });

  const exportUIVerify = await ctx.task(buildVerifyTask, {
    projectDir,
    phase: 'export-ui',
    description: 'Verify export UI: build succeeds, ExportDropdown component exists, integrated into page.tsx results section, all 3 export formats (CSV, PDF, DOCX) are accessible from the UI'
  });

  // ============================================================================
  // PHASE 5: QUALITY CONVERGENCE
  // ============================================================================

  let qualityPassed = false;
  let qualityIteration = 0;
  const maxQualityIterations = 3;

  while (!qualityPassed && qualityIteration < maxQualityIterations) {
    qualityIteration++;

    const qualityResult = await ctx.task(qualityCheckTask, {
      projectDir,
      iteration: qualityIteration
    });

    qualityPassed = qualityResult.passed || false;

    if (!qualityPassed && qualityIteration < maxQualityIterations) {
      await ctx.task(qualityFixTask, {
        projectDir,
        iteration: qualityIteration,
        issues: qualityResult.issues || []
      });
    }
  }

  // ============================================================================
  // PHASE 6: FINAL VERIFICATION
  // ============================================================================

  const finalVerify = await ctx.task(finalVerificationTask, {
    projectDir
  });

  return {
    success: true,
    buildPassed: qualityPassed,
    phases: {
      uiPolish: uiPolishResult,
      exportUtils: exportUtilsResult,
      exportUI: exportUIResult
    },
    qualityIterations: qualityIteration,
    finalVerification: finalVerify,
    metadata: {
      processId: 'ui-polish-export-feature',
      timestamp: ctx.now()
    }
  };
}

// ============================================================================
// TASK DEFINITIONS
// ============================================================================

export const uiPolishTask = defineTask('ui-polish', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 1: Polish UI with elegant colors and refined design',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior frontend developer and UI/UX designer specializing in modern web design',
      task: 'Polish the Lighthouse Bulk Report Generator UI to be visually stunning with an elegant, modern color palette and refined typography.',
      context: {
        projectDir: args.projectDir,
        components: args.components,
        currentDesign: 'Uses Tailwind CSS with slate-* color scheme, gradient backgrounds, rounded components',
        designGoals: [
          'Elegant, premium-feeling color palette',
          'Refined typography with proper hierarchy',
          'Smooth micro-interactions and hover effects',
          'Consistent spacing and alignment throughout',
          'Beautiful score badges with gradient or glow effects',
          'Polished form inputs with focus states',
          'Subtle shadows and depth',
          'Dark mode should feel equally polished'
        ]
      },
      instructions: [
        `Read ALL component files in "${args.projectDir}/src/" to understand the current UI`,
        'Redesign the color scheme to be more elegant and premium-feeling. Consider using refined color combinations like deep indigo/violet gradients, subtle warm accents, or sophisticated cool-tone palettes',
        'Update globals.css with custom CSS variables for the color system and any custom animations',
        'Update ScoreBadge.tsx: Make scores visually striking - consider circular progress rings, gradient backgrounds, or glow effects for different score ranges',
        'Update URLInput.tsx: Elegant textarea with refined borders, subtle focus animations, polished button with gradient and hover effects',
        'Update ResultsTable.tsx: Refined table with elegant hover states, better row separation, polished expanded state',
        'Update MetricsPanel.tsx: Beautiful metric cards with subtle gradients or refined borders',
        'Update LoadingSpinner.tsx: More elegant spinner animation',
        'Update page.tsx: Refine the header, hero section, progress bar, and overall layout for a premium feel',
        'Ensure proper alignment: all content should be perfectly aligned with consistent gutters',
        'Ensure dark mode looks equally polished',
        'Run npm run build to verify compilation',
        'Return JSON summary of changes made'
      ],
      outputFormat: 'JSON with filesModified (array), designChanges (array of descriptions), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['filesModified', 'summary'],
      properties: {
        filesModified: { type: 'array', items: { type: 'string' } },
        designChanges: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'phase-1', 'ui-polish']
}));

export const installExportLibsTask = defineTask('install-export-libs', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 2: Install client-side export libraries',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior frontend developer',
      task: 'Install the necessary npm packages for client-side PDF, DOCX, and CSV export.',
      context: {
        projectDir: args.projectDir,
        constraint: 'This is a fully static Next.js app (output: "export"). All export must happen client-side in the browser. No server-side code allowed.',
        libraries: {
          pdf: 'jspdf and jspdf-autotable for generating PDF tables',
          docx: 'docx and file-saver for generating Word documents',
          csv: 'No library needed - pure string manipulation'
        }
      },
      instructions: [
        `cd to "${args.projectDir}"`,
        'Run: npm install jspdf jspdf-autotable docx file-saver',
        'Run: npm install -D @types/file-saver',
        'Verify npm run build still succeeds after installation',
        'Return JSON summary of installed packages'
      ],
      outputFormat: 'JSON with packagesInstalled (array), summary (string)'
    },
    outputSchema: {
      type: 'object',
      required: ['packagesInstalled', 'summary'],
      properties: {
        packagesInstalled: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' }
      }
    }
  },
  io: {
    inputJsonPath: `tasks/${taskCtx.effectId}/input.json`,
    outputJsonPath: `tasks/${taskCtx.effectId}/result.json`
  },
  labels: ['agent', 'phase-2', 'install']
}));

export const exportUtilsTask = defineTask('export-utils', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 3: Build export utility functions (CSV, PDF, DOCX)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior TypeScript developer experienced with document generation libraries',
      task: 'Create export utility modules for generating CSV, PDF, and DOCX files from Lighthouse report data.',
      context: {
        projectDir: args.projectDir,
        typesFile: 'src/types/report.ts',
        reportType: 'LighthouseReport with fields: url, scores (performance, accessibility, seo, bestPractices), coreWebVitals (fcp, lcp, tbt, cls, tti each with value and displayValue), fetchedAt, strategy, error?',
        constraint: 'All exports must work entirely client-side. Use browser APIs (Blob, URL.createObjectURL, download link) for file downloads.',
        exportFormats: {
          csv: 'Standard CSV with headers: URL, Performance, Accessibility, SEO, Best Practices, FCP, LCP, TBT, CLS, TTI, Strategy, Fetched At',
          pdf: 'Professional PDF report with: title header, summary stats, detailed table of all URL results with scores, Core Web Vitals section. Use jspdf + jspdf-autotable.',
          docx: 'Professional Word document with: title, summary paragraph, detailed table of results, Core Web Vitals details. Use docx library.'
        }
      },
      instructions: [
        `Read "${args.projectDir}/src/types/report.ts" to understand the data structure`,
        'Create src/lib/exportCSV.ts: Function that takes LighthouseReport[] and generates a CSV file download. Include all scores and Core Web Vitals. Handle special characters properly.',
        'Create src/lib/exportPDF.ts: Function that takes LighthouseReport[] and generates a professional PDF report using jspdf + jspdf-autotable. Include: report title with timestamp, summary stats (average scores), detailed results table with color-coded scores, Core Web Vitals section.',
        'Create src/lib/exportDOCX.ts: Function that takes LighthouseReport[] and generates a Word document using the docx library + file-saver. Include: title, summary, results table, Core Web Vitals.',
        'Each export function should: filter out error/loading rows, generate a downloadable file, name the file with timestamp (e.g., lighthouse-report-2024-03-13.pdf)',
        'Add proper TypeScript types for all functions',
        'Run npm run build to verify compilation',
        'Return JSON summary of files created'
      ],
      outputFormat: 'JSON with filesCreated (array), summary (string)'
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
  labels: ['agent', 'phase-3', 'export-utils']
}));

export const exportUITask = defineTask('export-ui', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Phase 4: Build export UI (dropdown with PDF/DOC/CSV options)',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior React/TypeScript frontend developer with strong UI skills',
      task: 'Create an elegant export dropdown component and integrate it into the results section of the Lighthouse Bulk Report Generator.',
      context: {
        projectDir: args.projectDir,
        exportUtils: [
          'src/lib/exportCSV.ts',
          'src/lib/exportPDF.ts',
          'src/lib/exportDOCX.ts'
        ],
        integration: 'The export button should appear in the results section header (next to "Results" heading) in src/app/page.tsx',
        designGuidelines: 'Match the elegant design of the rest of the app. Use consistent colors, rounded corners, smooth animations.'
      },
      instructions: [
        `Read all existing components in "${args.projectDir}/src/" to understand the current design system`,
        'Create src/components/ExportDropdown.tsx: An elegant dropdown button with 3 options (CSV, PDF, DOCX). Design should include: a primary "Export" button that opens a dropdown menu, each option should have an icon and label (e.g., file icons for each format), smooth open/close animation, close on outside click, disabled state when no results available.',
        'Style the dropdown to match the elegant design of the app - use the same color palette, typography, and effects',
        'Integrate ExportDropdown into src/app/page.tsx: Place it in the results section header next to the "Results" heading, pass the current results array to the component, only show when there are completed results',
        'The dropdown should call the appropriate export function (exportCSV, exportPDF, exportDOCX) when an option is clicked',
        'Add loading/success feedback when export is triggered (brief "Downloading..." state)',
        'Run npm run build to verify compilation',
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
  labels: ['agent', 'phase-4', 'export-ui']
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
      role: 'senior QA engineer and UI/UX reviewer',
      task: 'Run comprehensive quality checks on the UI polish and export feature implementation.',
      context: {
        projectDir: args.projectDir,
        iteration: args.iteration,
        checkAreas: [
          'Build succeeds (npm run build)',
          'TypeScript compiles without errors (npx tsc --noEmit)',
          'UI consistency: all components use the same elegant color scheme',
          'Export functions exist and have proper types: exportCSV, exportPDF, exportDOCX',
          'ExportDropdown component exists and is integrated into page.tsx',
          'Dark mode works correctly for all components including export dropdown',
          'All alignments are proper and consistent',
          'No console errors or warnings in the code'
        ]
      },
      instructions: [
        `cd to "${args.projectDir}"`,
        'Run "npm run build" and verify static export succeeds',
        'Run "npx tsc --noEmit" for type checking',
        'Read all source files and verify UI consistency',
        'Verify export utilities exist and have proper types',
        'Verify ExportDropdown is integrated into the page',
        'Check for any alignment or spacing issues in the code',
        'Return JSON with passed (boolean), issues (array of specific issues), summary (string)'
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
      role: 'senior frontend developer',
      task: 'Fix all quality issues found in the UI polish and export feature.',
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
  title: 'Final verification of UI polish and export feature',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'senior QA engineer conducting final acceptance testing',
      task: 'Perform final verification that the UI is polished and elegant, and all export formats (CSV, PDF, DOCX) work correctly.',
      context: {
        projectDir: args.projectDir,
        acceptanceCriteria: {
          uiPolish: [
            'Elegant, premium-feeling color palette throughout',
            'Consistent spacing and alignment',
            'Beautiful score badges',
            'Polished dark mode',
            'Smooth hover effects and transitions'
          ],
          exportFeature: [
            'Export dropdown visible in results section',
            'CSV export function exists with proper data formatting',
            'PDF export function exists with professional layout',
            'DOCX export function exists with formatted document',
            'File downloads work client-side (no server needed)',
            'Export only includes completed (non-error, non-loading) results'
          ],
          build: [
            'npm run build succeeds',
            'Static export works',
            'No TypeScript errors'
          ]
        }
      },
      instructions: [
        `cd to "${args.projectDir}"`,
        'Run "npm run build" and verify static export succeeds',
        'Run "npx tsc --noEmit"',
        'Read all source files and verify against acceptance criteria',
        'If any criteria is NOT met, fix the issue immediately',
        'Return JSON with allCriteriaMet (boolean), criteriaResults (object), summary (string)'
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
