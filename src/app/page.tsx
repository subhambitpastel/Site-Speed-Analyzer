"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import URLInput from "@/components/URLInput";
import ResultsTable from "@/components/ResultsTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import ExportDropdown from "@/components/ExportDropdown";
import { fetchReport } from "@/lib/pagespeedClient";
import { parseReport } from "@/lib/reportParser";
import type { LighthouseReport } from "@/types/report";

const DEFAULT_METRIC = { value: 0, displayValue: "N/A" };

function createPlaceholderReport(
  url: string,
  strategy: "mobile" | "desktop",
): LighthouseReport {
  return {
    url,
    scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
    coreWebVitals: {
      fcp: { ...DEFAULT_METRIC },
      lcp: { ...DEFAULT_METRIC },
      tbt: { ...DEFAULT_METRIC },
      cls: { ...DEFAULT_METRIC },
      tti: { ...DEFAULT_METRIC },
    },
    fetchedAt: "",
    strategy,
  };
}

const CONCURRENCY = 4;

export default function Home() {
  const [results, setResults] = useState<LighthouseReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const abortRef = useRef(false);
  const completedRef = useRef(0);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !darkMode;
    setDarkMode(next);
    const d = document.documentElement;
    d.classList.toggle("dark", next);
    if (next) {
      d.removeAttribute("data-theme");
    } else {
      d.setAttribute("data-theme", "light");
    }
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [darkMode]);

  const handleSubmit = useCallback(
    async (urls: string[]) => {
      if (urls.length === 0) return;

      abortRef.current = false;
      completedRef.current = 0;
      setIsLoading(true);
      setProgress({ current: 0, total: urls.length });

      const placeholders = urls.map((url) =>
        createPlaceholderReport(url, strategy),
      );
      setResults(placeholders);

      const processUrl = async (index: number) => {
        if (abortRef.current) return;
        try {
          const apiResponse = await fetchReport(urls[index], strategy);
          const report = parseReport(urls[index], apiResponse, strategy);
          setResults((prev) => {
            const updated = [...prev];
            updated[index] = report;
            return updated;
          });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred";
          setResults((prev) => {
            const updated = [...prev];
            updated[index] = {
              ...placeholders[index],
              error: errorMessage,
              fetchedAt: new Date().toISOString(),
            };
            return updated;
          });
        } finally {
          completedRef.current += 1;
          setProgress({ current: completedRef.current, total: urls.length });
        }
      };

      const queue = urls.map((_, i) => i);
      const workers = Array.from(
        { length: Math.min(CONCURRENCY, urls.length) },
        async () => {
          while (queue.length > 0 && !abortRef.current) {
            const index = queue.shift();
            if (index === undefined) break;
            await processUrl(index);
          }
        },
      );

      await Promise.all(workers);
      setIsLoading(false);
    },
    [strategy],
  );

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              Lighthouse{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                Bulk Reporter
              </span>
            </h1>
          </div>

          <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-end">
          {/* Strategy Toggle */}
          <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setStrategy("mobile")}
              disabled={isLoading}
              className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 sm:min-h-0 sm:py-1.5 ${
                strategy === "mobile"
                  ? "bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setStrategy("desktop")}
              disabled={isLoading}
              className={`min-h-[44px] rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 sm:min-h-0 sm:py-1.5 ${
                strategy === "desktop"
                  ? "bg-white shadow-sm text-slate-900 dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Desktop
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors duration-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {mounted ? (darkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )) : <span className="h-5 w-5" />}
          </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:gap-12 lg:py-12">
        {/* Hero Section */}
        <section className="mx-auto w-full max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Analyze your{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              websites
            </span>
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-500 dark:text-slate-400">
            Enter URLs below to generate Lighthouse performance, accessibility,
            SEO, and best practices reports — all at once.
          </p>
        </section>

        <div className="mx-auto w-full max-w-2xl">
          <URLInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="mx-auto w-full max-w-2xl">
            <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Processing URLs...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold tabular-nums text-slate-400 dark:text-slate-500">
                    {progress.current}/{progress.total}
                  </span>
                  <button
                    type="button"
                    onClick={() => { abortRef.current = true; }}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition-colors duration-200 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <section className="w-full animate-fade-in-up">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Results
                <span className="ml-2 text-sm font-normal text-slate-400 dark:text-slate-500">
                  ({results.filter((r) => r.fetchedAt).length} of {results.length} complete)
                </span>
              </h3>
              {results.some((r) => r.fetchedAt) && (
                <ExportDropdown results={results} />
              )}
            </div>
            <ResultsTable results={results} />
          </section>
        )}
      </main>
    </div>
  );
}
