"use client";

import type { LighthouseReport } from "@/types/report";

interface ScoreChartProps {
  scores: LighthouseReport["scores"];
}

function getBarColor(score: number): string {
  if (score >= 90) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

const CATEGORIES = [
  { key: "performance" as const, label: "Performance" },
  { key: "accessibility" as const, label: "Accessibility" },
  { key: "seo" as const, label: "SEO" },
  { key: "bestPractices" as const, label: "Best Practices" },
];

export default function ScoreChart({ scores }: ScoreChartProps) {
  return (
    <div className="space-y-3">
      {CATEGORIES.map((cat) => {
        const score = scores[cat.key];
        return (
          <div key={cat.key} className="flex items-center gap-3">
            <span className="w-28 text-xs text-slate-500 dark:text-slate-400 shrink-0">
              {cat.label}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${score}%`,
                  backgroundColor: getBarColor(score),
                }}
              />
            </div>
            <span className="w-8 text-right text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
              {score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
