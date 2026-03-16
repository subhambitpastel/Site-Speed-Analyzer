"use client";

import { useState } from "react";
import { sanitizeAndValidate } from "@/lib/urlValidator";

interface URLInputProps {
  onSubmit: (urls: string[]) => void;
  isLoading: boolean;
}

export default function URLInput({ onSubmit, isLoading }: URLInputProps) {
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
      <textarea
        id="url-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          "https://example.com\nhttps://example.com/about\nhttps://example.com/contact"
        }
        rows={6}
        disabled={isLoading}
        className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm leading-relaxed text-slate-900 placeholder-slate-400 transition-colors duration-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
      />

      {invalidURLs.length > 0 && (
        <div className="animate-fade-in-up rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800/40 dark:bg-red-950/40 dark:text-red-400">
          <p className="font-semibold">
            The following URLs are invalid and were skipped:
          </p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5">
            {invalidURLs.map((url, i) => (
              <li key={i} className="truncate opacity-80">
                {url}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || input.trim().length === 0}
        className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
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
      </button>
    </form>
  );
}
