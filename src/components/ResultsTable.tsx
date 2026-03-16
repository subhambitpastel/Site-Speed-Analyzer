"use client";

import { useState, useMemo } from "react";
import type { LighthouseReport } from "@/types/report";
import ScoreBadge from "./ScoreBadge";
import MetricsPanel from "./MetricsPanel";
import ScoreChart from "./ScoreChart";
import LoadingSpinner from "./LoadingSpinner";

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
        active ? "text-slate-600 dark:text-slate-400" : "text-slate-300 dark:text-slate-600"
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
      className={`h-4 w-4 text-slate-400 transition-transform duration-300 ease-out ${
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

function ErrorRow({ url, error }: { url: string; error: string }) {
  return (
    <tr className="border-b border-slate-100 transition-all duration-150 dark:border-slate-800">
      <td className="px-5 py-4 text-sm text-slate-900 dark:text-slate-100">
        <span className="block max-w-xs truncate font-medium sm:max-w-sm lg:max-w-lg">
          {url}
        </span>
      </td>
      <td colSpan={4} className="px-5 py-4 text-sm text-red-600 dark:text-red-400">
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

function LoadingRow({ url }: { url: string }) {
  return (
    <tr className="border-b border-slate-100 transition-all duration-150 dark:border-slate-800">
      <td className="px-5 py-4 text-sm text-slate-900 dark:text-slate-100">
        <span className="block max-w-xs truncate font-medium sm:max-w-sm lg:max-w-lg">
          {url}
        </span>
      </td>
      <td colSpan={4} className="px-5 py-4">
        <div className="flex items-center gap-2.5 text-sm text-slate-400">
          <LoadingSpinner size="sm" />
          <span className="text-slate-400">
            Analyzing...
          </span>
        </div>
      </td>
    </tr>
  );
}

function SuccessRow({ report, index }: { report: LighthouseReport; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className={`animate-stagger-fade-in cursor-pointer border-b transition-all duration-200 ${
          expanded
            ? "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30"
            : "border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <td className="px-5 py-4 text-sm">
          <div className="flex items-center gap-2.5">
            <ChevronIcon expanded={expanded} />
            <span className="block max-w-xs truncate font-medium text-slate-900 dark:text-slate-100 sm:max-w-sm lg:max-w-lg">
              {report.url}
            </span>
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="flex justify-center">
            <ScoreBadge score={report.scores.performance} />
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="flex justify-center">
            <ScoreBadge score={report.scores.accessibility} />
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="flex justify-center">
            <ScoreBadge score={report.scores.seo} />
          </div>
        </td>
        <td className="px-5 py-4">
          <div className="flex justify-center">
            <ScoreBadge score={report.scores.bestPractices} />
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-100 dark:border-slate-800">
          <td colSpan={5} className="bg-slate-50 px-8 py-6 dark:bg-slate-800/20">
            <div className="animate-fade-in-up grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Score Overview
                </p>
                <ScoreChart scores={report.scores} />
              </div>
              <div className="hidden lg:block w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
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

const COLUMNS: { key: SortKey; label: string; align: string }[] = [
  { key: "url", label: "URL", align: "text-left" },
  { key: "performance", label: "Performance", align: "text-center" },
  { key: "accessibility", label: "Accessibility", align: "text-center" },
  { key: "seo", label: "SEO", align: "text-center" },
  { key: "bestPractices", label: "Best Practices", align: "text-center" },
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`cursor-pointer select-none px-5 py-3.5 text-xs font-medium uppercase tracking-wide text-slate-400 transition-colors duration-200 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400 ${col.align}`}
                >
                  {col.label}
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
