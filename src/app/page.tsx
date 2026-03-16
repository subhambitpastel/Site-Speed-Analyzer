"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import URLInput from "@/components/URLInput";
import FileUpload from "@/components/FileUpload";
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
  const [inputMode, setInputMode] = useState<"url" | "file">("url");
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
    <div className="noise-overlay relative min-h-screen bg-[var(--background)]">
      {/* Atmospheric gradient background */}
      <div className="atmosphere" />

      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8 sm:py-4">
          <div className="flex items-center gap-3.5">
            {/* Logo */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg shadow-sky-500/20 dark:from-sky-400 dark:to-cyan-400 dark:shadow-sky-400/15">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="absolute -inset-0.5 -z-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 opacity-30 blur-md dark:opacity-20" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
                Lighthouse
                <span className="ml-1.5 bg-gradient-to-r from-sky-500 to-cyan-400 bg-clip-text text-transparent dark:from-sky-400 dark:to-cyan-300">
                  Bulk Reporter
                </span>
              </h1>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-end">
            {/* Strategy Toggle */}
            <div className="flex items-center gap-1 rounded-full bg-[var(--surface-elevated)] p-1 ring-1 ring-[var(--border)]">
              <button
                type="button"
                onClick={() => setStrategy("mobile")}
                disabled={isLoading}
                className={`group relative min-h-[44px] rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 sm:min-h-0 sm:py-1.5 ${
                  strategy === "mobile"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                  Mobile
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStrategy("desktop")}
                disabled={isLoading}
                className={`group relative min-h-[44px] rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 sm:min-h-0 sm:py-1.5 ${
                  strategy === "desktop"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
                  </svg>
                  Desktop
                </span>
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[var(--surface-elevated)] text-[var(--text-secondary)] ring-1 ring-[var(--border)] transition-all duration-300 hover:text-[var(--foreground)] hover:ring-[var(--text-tertiary)]"
            >
              {mounted ? (darkMode ? (
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )) : <span className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:gap-10 sm:px-8 sm:py-12 lg:gap-14 lg:py-16">
        {/* Hero Section */}
        <section className="animate-float-in mx-auto w-full max-w-2xl text-center" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-medium text-sky-700 dark:border-sky-800/50 dark:bg-sky-900/20 dark:text-sky-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </span>
            Powered by Google PageSpeed Insights
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
            Analyze your{" "}
            <span className="bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 bg-clip-text text-transparent dark:from-sky-400 dark:via-cyan-300 dark:to-teal-300">
              websites
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            Enter URLs below to generate Lighthouse performance, accessibility,
            SEO, and best practices reports — all at once.
          </p>
        </section>

        {/* Input Section */}
        <div className="animate-float-in mx-auto w-full max-w-2xl" style={{ animationDelay: "250ms", animationFillMode: "backwards" }}>
          {/* Input Mode Toggle */}
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-1 rounded-full bg-[var(--surface-elevated)] p-1 ring-1 ring-[var(--border)]">
              <button
                type="button"
                onClick={() => setInputMode("url")}
                disabled={isLoading}
                className={`group relative min-h-[44px] rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 sm:min-h-0 sm:py-1.5 ${
                  inputMode === "url"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Enter URLs
                </span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode("file")}
                disabled={isLoading}
                className={`group relative min-h-[44px] rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 sm:min-h-0 sm:py-1.5 ${
                  inputMode === "file"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  Upload File
                </span>
              </button>
            </div>
          </div>

          {inputMode === "url" ? (
            <URLInput onSubmit={handleSubmit} isLoading={isLoading} />
          ) : (
            <FileUpload key={inputMode} onURLsExtracted={handleSubmit} isLoading={isLoading} />
          )}
        </div>

        {/* Progress Bar */}
        {isLoading && (
          <div className="mx-auto w-full max-w-2xl">
            <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-lg shadow-black/[0.03] dark:shadow-black/[0.15]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    Processing URLs...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text-tertiary)]">
                    {progress.current}
                    <span className="mx-0.5 text-[var(--border)]">/</span>
                    {progress.total}
                  </span>
                  <button
                    type="button"
                    onClick={() => { abortRef.current = true; }}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:border-red-300 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              {/* Progress track */}
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-elevated)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Shimmer effect */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div
                    className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{ animation: "shimmer 1.5s infinite" }}
                  />
                </div>
              </div>
              <div className="mt-2 text-right">
                <span className="font-mono text-xs font-medium text-[var(--accent)]">{progressPercent}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <section className="w-full animate-fade-in-up">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  Results
                </h3>
                <p className="mt-0.5 text-sm text-[var(--text-tertiary)]">
                  {results.filter((r) => r.fetchedAt).length} of {results.length} complete
                </p>
              </div>
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
