/**
 * @process file-upload-feature
 * @description Add Excel/CSV file upload feature for bulk URL report generation
 * @inputs { targetQuality: number, maxIterations: number }
 * @outputs { success: boolean }
 */

import { defineTask } from '@a5c-ai/babysitter-sdk';

export async function process(inputs, ctx) {
  const { targetQuality = 85, maxIterations = 4 } = inputs;
  ctx.log('info', 'Starting file upload feature implementation');

  // Phase 1: Install xlsx dependency and create file parser
  const parser = await ctx.task(createFileParserTask, {});

  // Phase 2: Create FileUpload component
  const component = await ctx.task(createFileUploadComponentTask, {});

  // Phase 3: Integrate into page.tsx
  const integration = await ctx.task(integrateIntoPageTask, {});

  // Phase 4: Build verification
  const build1 = await ctx.task(verifyBuildTask, { phase: 'Initial implementation' });

  // Phase 5: Quality scoring + refinement loop
  let score = 0;
  let converged = false;
  let iteration = 0;

  const initialScore = await ctx.task(scoreQualityTask, { iteration: 0, targetQuality });
  score = initialScore.overallScore || 0;
  converged = score >= targetQuality;

  while (!converged && iteration < maxIterations) {
    iteration++;
    ctx.log('info', `Refinement iteration ${iteration}, score: ${score}`);
    await ctx.task(refineTask, { iteration, previousScore: score, targetQuality });
    await ctx.task(verifyBuildTask, { phase: `Refinement ${iteration}` });
    const newScore = await ctx.task(scoreQualityTask, { iteration, targetQuality });
    score = newScore.overallScore || 0;
    converged = score >= targetQuality;
  }

  // Phase 6: Documentation + commit
  await ctx.task(documentAndCommitTask, { score, iterations: iteration });

  return { success: true, score, iterations: iteration };
}

export const createFileParserTask = defineTask('create-file-parser', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Create file parser library',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Full-stack developer',
      task: 'Install xlsx library and create src/lib/fileParser.ts for parsing Excel/CSV files to extract URLs',
      context: {},
      instructions: [
        'First install the xlsx (SheetJS) library: run npm install xlsx',
        'Create src/lib/fileParser.ts with these functions:',
        '',
        '1. parseFile(file: File): Promise<string[]> - main function',
        '   - Detect file type from extension (.xlsx, .xls, .csv)',
        '   - Read file as ArrayBuffer using FileReader',
        '   - Parse with xlsx library',
        '   - Extract all URLs from all sheets',
        '',
        '2. extractURLsFromSheet(sheet) - helper',
        '   - Convert sheet to JSON array of rows',
        '   - For each row, check all cell values',
        '   - Detect URLs by checking if value starts with http:// or https://',
        '   - Also check column headers for "url", "website", "site", "domain", "link"',
        '   - If a URL column is found, extract from that column only',
        '   - Otherwise scan all cells for URL patterns',
        '   - Return deduplicated array of valid URLs',
        '',
        '3. Export supported file types: SUPPORTED_EXTENSIONS = [".xlsx", ".xls", ".csv"]',
        '',
        'Use proper TypeScript types. Handle errors gracefully.',
        'Actually create the file and install the dependency.'
      ],
      outputFormat: 'JSON with success, summary'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, summary: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const createFileUploadComponentTask = defineTask('create-file-upload', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Create FileUpload component',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior React/Tailwind developer',
      task: 'Create src/components/FileUpload.tsx - a drag-and-drop file upload component for Excel/CSV files',
      context: {},
      instructions: [
        'Read the existing components (URLInput.tsx, ExportDropdown.tsx) to match the design system',
        'Read src/lib/fileParser.ts to understand the parser API',
        '',
        'Create src/components/FileUpload.tsx with these features:',
        '',
        'Props: { onURLsExtracted: (urls: string[]) => void; isLoading: boolean }',
        '',
        'UI States:',
        '1. Default: Drag-and-drop zone with upload icon, "Drop your file here" text,',
        '   "or click to browse" link, supported formats note (.xlsx, .xls, .csv)',
        '   Use dashed border, matches the current design (sky/cyan accents)',
        '',
        '2. Dragging: Highlight border and background on drag over',
        '',
        '3. Parsing: Show spinner while file is being parsed',
        '',
        '4. URLs Found: Show count of URLs found, scrollable preview list (max 10 shown),',
        '   "Use These URLs" button to trigger onURLsExtracted callback,',
        '   "Clear" button to reset, file name display',
        '',
        '5. Error: Show error message if parsing fails, with "Try Again" button',
        '',
        'Implementation:',
        '- Use native HTML5 drag-and-drop (onDragOver, onDrop, onDragLeave)',
        '- Hidden file input triggered by click',
        '- Accept attribute: .xlsx,.xls,.csv',
        '- Validate file extension before parsing',
        '- Call parseFile from fileParser.ts',
        '- Match the existing design: rounded-2xl, bg-[var(--surface)], border-[var(--border)]',
        '- Use sky/cyan gradient accents matching the app theme',
        '- Responsive: works on mobile and desktop',
        '- Accessible: proper aria labels, keyboard support',
        '',
        'Actually create the file.'
      ],
      outputFormat: 'JSON with success, summary'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, summary: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const integrateIntoPageTask = defineTask('integrate-into-page', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Integrate file upload into page.tsx',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior React developer',
      task: 'Integrate the FileUpload component into src/app/page.tsx with a tab toggle between URL input and file upload modes',
      context: {},
      instructions: [
        'Read src/app/page.tsx to understand the current layout',
        'Read src/components/FileUpload.tsx to understand its API',
        '',
        'Add to page.tsx:',
        '1. Add state: const [inputMode, setInputMode] = useState<"url" | "file">("url")',
        '',
        '2. Add a tab toggle UI above the input section (below the hero):',
        '   - Two tabs: "Enter URLs" and "Upload File"',
        '   - Match the strategy toggle style (rounded pill, bg-surface-elevated)',
        '   - Include icons: text/list icon for URLs, upload icon for file',
        '',
        '3. Conditionally render URLInput or FileUpload based on inputMode',
        '   - URLInput gets onSubmit={handleSubmit} (existing)',
        '   - FileUpload gets onURLsExtracted={handleSubmit} and isLoading',
        '',
        '4. Import FileUpload component at the top',
        '',
        'Keep all existing functionality intact. The file upload should feed URLs',
        'into the same handleSubmit pipeline that already works.',
        'Match the existing animation delays and design patterns.',
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
  title: `Verify build (${args.phase})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Build engineer',
      task: 'Run npm run build and fix any errors',
      context: { phase: args.phase },
      instructions: ['Run: npm run build', 'If errors, fix them and re-run', 'Report result'],
      outputFormat: 'JSON with success, fixesApplied'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, fixesApplied: { type: 'array', items: { type: 'string' } } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const scoreQualityTask = defineTask('score-quality', (args, taskCtx) => ({
  kind: 'agent',
  title: `Score quality (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Expert frontend QA reviewer',
      task: 'Score the file upload feature implementation',
      context: { iteration: args.iteration, targetQuality: args.targetQuality },
      instructions: [
        'Read: src/lib/fileParser.ts, src/components/FileUpload.tsx, src/app/page.tsx',
        '',
        'SCORING RUBRIC (100 points):',
        'File Parser (25): proper Excel/CSV parsing, URL extraction, error handling, type safety',
        'UI Component (25): drag-drop, click-browse, preview, loading/error states, responsive',
        'Integration (20): tab toggle, proper wiring to handleSubmit, design consistency',
        'Design Match (15): matches existing app design system, responsive, dark mode',
        'Code Quality (15): TypeScript, no errors, clean implementation, accessibility',
        '',
        'BE STRICT. Provide specific gaps to fix. DO NOT modify files.',
        'Return JSON with overallScore, breakdown, gaps'
      ],
      outputFormat: 'JSON with overallScore (0-100), breakdown, gaps'
    },
    outputSchema: { type: 'object', required: ['overallScore'], properties: { overallScore: { type: 'number' }, breakdown: { type: 'object' }, gaps: { type: 'array', items: { type: 'string' } } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const refineTask = defineTask('refine', (args, taskCtx) => ({
  kind: 'agent',
  title: `Refine (iteration ${args.iteration})`,
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Senior frontend developer',
      task: 'Address quality feedback and refine the file upload feature',
      context: { iteration: args.iteration, previousScore: args.previousScore, targetQuality: args.targetQuality },
      instructions: [
        'Read the current files and address remaining quality gaps',
        'Focus on highest-impact improvements',
        'Make targeted edits. Keep functionality working.',
        'LIMIT to 5-8 changes.'
      ],
      outputFormat: 'JSON with success, changesApplied, filesModified'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, changesApplied: { type: 'array' }, filesModified: { type: 'array' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));

export const documentAndCommitTask = defineTask('document-and-commit', (args, taskCtx) => ({
  kind: 'agent',
  title: 'Document fixes and commit',
  agent: {
    name: 'general-purpose',
    prompt: {
      role: 'Technical writer and version control engineer',
      task: 'Document the file upload feature in RECENT_FIXATION.md, clean TO_BE_FIXED.md, and commit',
      context: { score: args.score, iterations: args.iterations },
      instructions: [
        'Read BUG_FIX_RULES.md for entry format',
        'Read RECENT_FIXATION.md and TO_BE_FIXED.md',
        '',
        '1. Add entry to RECENT_FIXATION.md (at top, below header):',
        '### 4. Upload Excel/CSV File for Bulk Reports (2026-03-16)',
        '- Bug: No option to upload file with multiple website URLs',
        '- Root cause: Feature not implemented - manual URL entry only',
        '- Fix: Added file upload with drag-drop UI, Excel/CSV parser using SheetJS, URL extraction, tab toggle between URL input and file upload modes',
        '- Files modified: src/lib/fileParser.ts (new), src/components/FileUpload.tsx (new), src/app/page.tsx, package.json',
        '- Verified by: Build passes, quality scoring',
        '',
        '2. Remove BUG-1 entry from TO_BE_FIXED.md (keep header)',
        '',
        '3. Git commit:',
        '   git add -A',
        '   git -c user.name="Shovan Bitpastel" -c user.email="shovan.bitpastel@gmail.com" commit -m "BUG-1 — Add Excel/CSV file upload for bulk URL report generation"',
        '   Do NOT push',
        '',
        'Actually edit both md files and run the git commit.'
      ],
      outputFormat: 'JSON with success, commitHash'
    },
    outputSchema: { type: 'object', required: ['success'], properties: { success: { type: 'boolean' }, commitHash: { type: 'string' } } }
  },
  io: { inputJsonPath: `tasks/${taskCtx.effectId}/input.json`, outputJsonPath: `tasks/${taskCtx.effectId}/result.json` }
}));
