"use client";

import { useState, useMemo } from "react";
import type { LighthouseReport } from "@/types/report";
import ScoreBadge from "./ScoreBadge";
import MetricsPanel from "./MetricsPanel";
import ScoreChart from "./ScoreChart";
import LoadingSpinner from "./LoadingSpinner";
import Tooltip, { InfoIcon } from "./Tooltip";

const SCORE_TOOLTIPS: Record<string, string> = {
  performance: "Measures how quickly page content loads and becomes interactive. Includes metrics like FCP, LCP, TBT, CLS, and Speed Index.",
  accessibility: "Evaluates how accessible your page is to users with disabilities. Checks color contrast, ARIA attributes, keyboard navigation, and semantic HTML.",
  seo: "Checks if the page follows search engine optimization best practices. Includes meta tags, crawlability, structured data, and mobile-friendliness.",
  bestPractices: "Audits general web development best practices including HTTPS usage, image aspect ratios, console errors, and deprecated APIs.",
};

type SortKey = "url" | "performance" | "accessibility" | "seo" | "bestPractices";
type SortDir = "asc" | "desc";

interface ResultsTableProps {
  results: LighthouseReport[];
}

function getScoreValue(report: LighthouseReport, key: SortKey): number | string {
  switch (key) {
    case "url":
      return report.url.toLowerCase();
    case "performance":
      return report.scores.performance;
    case "accessibility":
      return report.scores.accessibility;
    case "seo":
      return report.scores.seo;
    case "bestPractices":
      return report.scores.bestPractices;
  }
}

function isLoading(report: LighthouseReport): boolean {
  return (
    !report.error &&
    report.scores.performance === 0 &&
    report.scores.accessibility === 0 &&
    report.scores.seo === 0 &&
    report.scores.bestPractices === 0 &&
    report.coreWebVitals.fcp.value === 0 &&
    report.coreWebVitals.lcp.value === 0
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDir }) {
  return (
    <svg
      className={`ml-1 inline-block h-3.5 w-3.5 transition-all duration-200 ${
        active ? "text-[var(--accent)]" : "text-[var(--border)]"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      {active && direction === "asc" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      ) : active && direction === "desc" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4M8 15l4 4 4-4" />
      )}
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-[var(--text-tertiary)] transition-transform duration-300 ease-out ${
        expanded ? "rotate-90" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ErrorCard({ url, error }: { url: string; error: string }) {
  return (
    <div className="border-b border-[var(--border)] p-4">
      <p className="truncate text-sm font-medium text-[var(--foreground)]">{url}</p>
      <div className="mt-2 flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </div>
    </div>
  );
}

function ErrorRow({ url, error }: { url: string; error: string }) {
  return (
    <tr className="border-b border-[var(--border)] transition-all duration-150">
      <td className="px-3 py-3 text-sm text-[var(--foreground)] md:px-5 md:py-4">
        <span className="block max-w-[200px] truncate font-medium md:max-w-sm lg:max-w-lg">
          {url}
        </span>
      </td>
      <td colSpan={4} className="px-3 py-3 text-sm text-red-500 dark:text-red-400 md:px-5 md:py-4">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </td>
    </tr>
  );
}

function LoadingCard({ url }: { url: string }) {
  return (
    <div className="border-b border-[var(--border)] p-4">
      <p className="truncate text-sm font-medium text-[var(--foreground)]">{url}</p>
      <div className="mt-2 flex items-center gap-2.5 text-sm text-[var(--text-tertiary)]">
        <LoadingSpinner size="sm" />
        <span>Analyzing...</span>
      </div>
    </div>
  );
}

function LoadingRow({ url }: { url: string }) {
  return (
    <tr className="border-b border-[var(--border)] transition-all duration-150">
      <td className="px-3 py-3 text-sm text-[var(--foreground)] md:px-5 md:py-4">
        <span className="block max-w-[200px] truncate font-medium md:max-w-sm lg:max-w-lg">
          {url}
        </span>
      </td>
      <td colSpan={4} className="px-3 py-3 md:px-5 md:py-4">
        <div className="flex items-center gap-2.5 text-sm text-[var(--text-tertiary)]">
          <LoadingSpinner size="sm" />
          <span>Analyzing...</span>
        </div>
      </td>
    </tr>
  );
}

function SuccessCard({ report, index }: { report: LighthouseReport; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="animate-stagger-fade-in border-b border-[var(--border)]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className={`flex w-full min-h-[44px] items-start gap-3 p-4 text-left transition-all duration-200 ${
          expanded
            ? "bg-[var(--surface-elevated)]"
            : "hover:bg-[var(--surface-elevated)]/50"
        }`}
      >
        <ChevronIcon expanded={expanded} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">
            {report.url}
          </p>
          <div className="mt-2.5 grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center">
              <Tooltip text={SCORE_TOOLTIPS.performance}>
                <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Perf</span>
                <InfoIcon />
              </Tooltip>
              <ScoreBadge score={report.scores.performance} />
            </div>
            <div className="flex flex-col items-center">
              <Tooltip text={SCORE_TOOLTIPS.accessibility}>
                <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">A11y</span>
                <InfoIcon />
              </Tooltip>
              <ScoreBadge score={report.scores.accessibility} />
            </div>
            <div className="flex flex-col items-center">
              <Tooltip text={SCORE_TOOLTIPS.seo}>
                <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">SEO</span>
                <InfoIcon />
              </Tooltip>
              <ScoreBadge score={report.scores.seo} />
            </div>
            <div className="flex flex-col items-center">
              <Tooltip text={SCORE_TOOLTIPS.bestPractices}>
                <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">BP</span>
                <InfoIcon />
              </Tooltip>
              <ScoreBadge score={report.scores.bestPractices} />
            </div>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="animate-fade-in-up space-y-4 bg-[var(--surface-elevated)] px-4 pb-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              Score Overview
            </p>
            <ScoreChart scores={report.scores} />
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              Core Web Vitals
            </p>
            <MetricsPanel coreWebVitals={report.coreWebVitals} />
          </div>
        </div>
      )}
    </div>
  );
}

function SuccessRow({ report, index }: { report: LighthouseReport; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
        aria-label={`Expand details for ${report.url}`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(!expanded); } }}
        className={`animate-stagger-fade-in cursor-pointer border-b transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-inset ${
          expanded
            ? "border-[var(--border)] bg-[var(--surface-elevated)]"
            : "border-[var(--border)] hover:bg-[var(--surface-elevated)]/50"
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <td className="px-3 py-3.5 text-sm md:px-5 md:py-4">
          <div className="flex items-center gap-2.5">
            <ChevronIcon expanded={expanded} />
            <span className="block max-w-[200px] truncate font-medium text-[var(--foreground)] md:max-w-sm lg:max-w-lg">
              {report.url}
            </span>
          </div>
        </td>
        <td className="px-3 py-3.5 md:px-5 md:py-4">
          <div className="flex justify-center">
            <Tooltip text={SCORE_TOOLTIPS.performance}>
              <ScoreBadge score={report.scores.performance} />
              <InfoIcon />
            </Tooltip>
          </div>
        </td>
        <td className="px-3 py-3.5 md:px-5 md:py-4">
          <div className="flex justify-center">
            <Tooltip text={SCORE_TOOLTIPS.accessibility}>
              <ScoreBadge score={report.scores.accessibility} />
              <InfoIcon />
            </Tooltip>
          </div>
        </td>
        <td className="px-3 py-3.5 md:px-5 md:py-4">
          <div className="flex justify-center">
            <Tooltip text={SCORE_TOOLTIPS.seo}>
              <ScoreBadge score={report.scores.seo} />
              <InfoIcon />
            </Tooltip>
          </div>
        </td>
        <td className="px-3 py-3.5 md:px-5 md:py-4">
          <div className="flex justify-center">
            <Tooltip text={SCORE_TOOLTIPS.bestPractices}>
              <ScoreBadge score={report.scores.bestPractices} />
              <InfoIcon />
            </Tooltip>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-[var(--border)]">
          <td colSpan={5} className="bg-[var(--surface-elevated)] px-4 py-5 md:px-8 md:py-6">
            <div className="animate-fade-in-up grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.5fr)]">
              <div className="min-w-0">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                  Score Overview
                </p>
                <ScoreChart scores={report.scores} />
              </div>
              <div className="hidden lg:block w-px bg-[var(--border)]" />
              <div className="min-w-0 overflow-hidden">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                  Core Web Vitals
                </p>
                <MetricsPanel coreWebVitals={report.coreWebVitals} />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const COLUMNS: { key: SortKey; label: string; shortLabel: string; align: string }[] = [
  { key: "url", label: "URL", shortLabel: "URL", align: "text-left" },
  { key: "performance", label: "Performance", shortLabel: "Perf", align: "text-center" },
  { key: "accessibility", label: "Accessibility", shortLabel: "A11y", align: "text-center" },
  { key: "seo", label: "SEO", shortLabel: "SEO", align: "text-center" },
  { key: "bestPractices", label: "Best Practices", shortLabel: "BP", align: "text-center" },
];

export default function ResultsTable({ results }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedResults = useMemo(() => {
    if (!sortKey) return results;

    return [...results].sort((a, b) => {
      const aLoading = isLoading(a);
      const bLoading = isLoading(b);
      if (aLoading && !bLoading) return 1;
      if (!aLoading && bLoading) return -1;
      if (a.error && !b.error) return 1;
      if (!a.error && b.error) return -1;

      const aVal = getScoreValue(a, sortKey);
      const bVal = getScoreValue(b, sortKey);

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [results, sortKey, sortDir]);

  if (results.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/[0.03] dark:shadow-black/[0.15]">
      {/* Mobile card view */}
      <div className="sm:hidden">
        {sortedResults.map((report, index) => {
          if (report.error) {
            return <ErrorCard key={`card-${report.url}-${index}`} url={report.url} error={report.error} />;
          }
          if (isLoading(report)) {
            return <LoadingCard key={`card-${report.url}-${index}`} url={report.url} />;
          }
          return <SuccessCard key={`card-${report.url}-${index}`} report={report} index={index} />;
        })}
      </div>
      {/* Desktop table view */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`cursor-pointer select-none px-3 py-3.5 text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] transition-colors duration-200 hover:text-[var(--text-secondary)] md:px-5 md:py-4 ${col.align}`}
                >
                  {SCORE_TOOLTIPS[col.key] ? (
                    <Tooltip text={SCORE_TOOLTIPS[col.key]}>
                      <span className="md:hidden">{col.shortLabel}</span>
                      <span className="hidden md:inline">{col.label}</span>
                      <InfoIcon />
                    </Tooltip>
                  ) : (
                    <>
                      <span className="md:hidden">{col.shortLabel}</span>
                      <span className="hidden md:inline">{col.label}</span>
                    </>
                  )}
                  <SortIcon
                    active={sortKey === col.key}
                    direction={sortKey === col.key ? sortDir : "desc"}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((report, index) => {
              if (report.error) {
                return (
                  <ErrorRow key={`${report.url}-${index}`} url={report.url} error={report.error} />
                );
              }
              if (isLoading(report)) {
                return <LoadingRow key={`${report.url}-${index}`} url={report.url} />;
              }
              return <SuccessRow key={`${report.url}-${index}`} report={report} index={index} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
