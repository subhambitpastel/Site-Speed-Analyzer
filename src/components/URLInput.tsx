"use client";

import { useState } from "react";
import { sanitizeAndValidate } from "@/lib/urlValidator";
import StrategyToggle from "@/components/StrategyToggle";

interface URLInputProps {
  onSubmit: (urls: string[]) => void;
  isLoading: boolean;
  strategy: "mobile" | "desktop";
  setStrategy: (s: "mobile" | "desktop") => void;
}

export default function URLInput({ onSubmit, isLoading, strategy, setStrategy }: URLInputProps) {
  const [input, setInput] = useState("");
  const [invalidURLs, setInvalidURLs] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInvalidURLs([]);

    const { valid, invalid } = sanitizeAndValidate(input);

    if (invalid.length > 0) {
      setInvalidURLs(invalid);
    }

    if (valid.length > 0) {
      onSubmit(valid);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="group relative">
        <textarea
          id="url-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            "https://example.com\nhttps://example.com/about\nhttps://example.com/contact"
          }
          rows={6}
          disabled={isLoading}
          className="w-full max-h-[50vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 font-mono text-sm leading-relaxed text-[var(--foreground)] placeholder-[var(--text-tertiary)] shadow-sm transition-all duration-300 focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:shadow-lg focus:shadow-sky-500/5 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-sky-400/10 dark:focus:shadow-sky-400/5"
        />
        {/* Subtle glow on focus */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100">
          <div className="absolute -inset-1 rounded-[18px] bg-gradient-to-r from-sky-500/10 via-cyan-400/10 to-teal-400/10 blur-sm" />
        </div>
      </div>

      {invalidURLs.length > 0 && (
        <div className="animate-fade-in-up rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600 backdrop-blur-sm dark:border-red-800/40 dark:bg-red-950/30 dark:text-red-400">
          <p className="font-semibold">
            The following URLs are invalid and were skipped:
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5">
            {invalidURLs.map((url, i) => (
              <li key={i} className="truncate font-mono text-xs opacity-80">
                {url}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strategy toggle + Generate button row */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StrategyToggle strategy={strategy} setStrategy={setStrategy} disabled={isLoading} />
        <button
          type="submit"
          disabled={isLoading || input.trim().length === 0}
          className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-sky-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto dark:from-sky-500 dark:to-cyan-400 dark:shadow-sky-500/15 dark:hover:shadow-sky-500/25"
        >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isLoading ? "Generating Reports..." : "Generate Reports"}
        {!isLoading && (
          <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        )}
      </button>
      </div>
    </form>
  );
}
