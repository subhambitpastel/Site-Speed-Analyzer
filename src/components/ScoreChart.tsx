"use client";

import type { LighthouseReport } from "@/types/report";
import Tooltip, { InfoIcon } from "./Tooltip";

const SCORE_TOOLTIPS: Record<string, string> = {
  performance: "Measures how quickly page content loads and becomes interactive. Includes metrics like FCP, LCP, TBT, CLS, and Speed Index.",
  accessibility: "Evaluates how accessible your page is to users with disabilities. Checks color contrast, ARIA attributes, keyboard navigation, and semantic HTML.",
  seo: "Checks if the page follows search engine optimization best practices. Includes meta tags, crawlability, structured data, and mobile-friendliness.",
  bestPractices: "Audits general web development best practices including HTTPS usage, image aspect ratios, console errors, and deprecated APIs.",
};

interface ScoreChartProps {
  scores: LighthouseReport["scores"];
}

function getBarColor(score: number): string {
  if (score >= 90) return "var(--score-green)";
  if (score >= 50) return "var(--score-amber)";
  return "var(--score-red)";
}

function getBarGlow(score: number): string {
  if (score >= 90) return "var(--glow-green)";
  if (score >= 50) return "var(--glow-amber)";
  return "var(--glow-red)";
}

const CATEGORIES = [
  { key: "performance" as const, label: "Performance", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { key: "accessibility" as const, label: "Accessibility", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  { key: "seo" as const, label: "SEO", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { key: "bestPractices" as const, label: "Best Practices", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

export default function ScoreChart({ scores }: ScoreChartProps) {
  return (
    <div className="space-y-3.5">
      {CATEGORIES.map((cat) => {
        const score = scores[cat.key];
        return (
          <div key={cat.key} className="flex items-center gap-3">
            <Tooltip text={SCORE_TOOLTIPS[cat.key]} className="w-24 shrink-0 sm:w-32">
              <span className="flex w-full items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
                <svg className="h-3.5 w-3.5 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                </svg>
                {cat.label}
              </span>
              <InfoIcon />
            </Tooltip>
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${score}%`,
                  backgroundColor: getBarColor(score),
                  boxShadow: `0 0 8px ${getBarGlow(score)}`,
                }}
              />
            </div>
            <span className="w-9 text-right font-mono text-xs font-bold text-[var(--foreground)]">
              {score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
