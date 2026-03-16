"use client";

import { useState, useRef, useCallback } from "react";
import { parseFile, SUPPORTED_EXTENSIONS, SUPPORTED_MIME_TYPES } from "@/lib/fileParser";

interface FileUploadProps {
  onURLsExtracted: (urls: string[]) => void;
  isLoading: boolean;
}

type State =
  | { kind: "idle" }
  | { kind: "dragging" }
  | { kind: "parsing" }
  | { kind: "done"; fileName: string; urls: string[]; truncated: boolean }
  | { kind: "error"; message: string };

export default function FileUpload({
  onURLsExtracted,
  isLoading,
}: FileUploadProps) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const resetState = useCallback(() => {
    setState({ kind: "idle" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const processFile = useCallback(async (file: File) => {
    setState({ kind: "parsing" });

    try {
      const { urls, truncated } = await parseFile(file);
      setState({ kind: "done", fileName: file.name, urls, truncated });
    } catch (err: unknown) {
      setState({
        kind: "error",
        message:
          err instanceof Error ? err.message : "Failed to parse the file.",
      });
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    },
    [],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current += 1;
      if (state.kind === "idle" || state.kind === "error") {
        setState({ kind: "dragging" });
      }
    },
    [state.kind],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        if (state.kind === "dragging") {
          setState({ kind: "idle" });
        }
      }
    },
    [state.kind],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      } else {
        setState({ kind: "idle" });
      }
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [],
  );

  const handleUseURLs = useCallback(() => {
    if (state.kind === "done") {
      onURLsExtracted(state.urls);
    }
  }, [state, onURLsExtracted]);

  const isDragging = state.kind === "dragging";

  return (
    <div className="w-full space-y-4">
      {/* Drop zone - visible in idle, dragging, parsing, and error states */}
      {(state.kind === "idle" ||
        state.kind === "dragging" ||
        state.kind === "parsing" ||
        state.kind === "error") && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a spreadsheet file with URLs. Supported formats: xlsx, xls, csv"
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (state.kind !== "parsing") fileInputRef.current?.click();
          }}
          onKeyDown={handleKeyDown}
          className={`group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500/20 ${
            isDragging
              ? "border-sky-400 bg-sky-50/60 dark:border-sky-400 dark:bg-sky-900/15"
              : state.kind === "parsing"
                ? "pointer-events-none border-[var(--border)] bg-[var(--surface)] opacity-80"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-sky-300 hover:bg-sky-50/30 dark:hover:border-sky-500/50 dark:hover:bg-sky-900/10"
          }`}
        >
          {/* Subtle glow on drag */}
          {isDragging && (
            <div className="pointer-events-none absolute -inset-px rounded-2xl">
              <div className="absolute -inset-1 rounded-[18px] bg-gradient-to-r from-sky-500/15 via-cyan-400/15 to-teal-400/15 blur-sm" />
            </div>
          )}

          {state.kind === "parsing" ? (
            /* Parsing spinner */
            <div className="flex flex-col items-center gap-3">
              <svg
                className="h-8 w-8 animate-spin text-sky-500"
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
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Parsing file...
              </p>
            </div>
          ) : (
            /* Default / Dragging content */
            <>
              {/* Upload icon */}
              <div
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                  isDragging
                    ? "bg-sky-100 text-sky-500 dark:bg-sky-900/40 dark:text-sky-400"
                    : "bg-[var(--surface-elevated)] text-[var(--text-tertiary)] group-hover:text-sky-500 dark:group-hover:text-sky-400"
                }`}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>

              <p className="text-sm font-medium text-[var(--foreground)]">
                {isDragging
                  ? "Drop your file here"
                  : "Drop your file here or click to browse"}
              </p>
              <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
                Supported formats: .xlsx, .xls, .csv
              </p>
            </>
          )}
        </div>
      )}

      {/* Error state */}
      {state.kind === "error" && (
        <div className="animate-fade-in-up rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm backdrop-blur-sm dark:border-red-800/40 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-red-600 dark:text-red-400">
                {state.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetState}
            className="mt-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:border-red-300 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
          >
            Try Again
          </button>
        </div>
      )}

      {/* URLs Found state */}
      {state.kind === "done" && (
        <div className="animate-fade-in-up overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg shadow-black/[0.03] dark:shadow-black/[0.15]">
          {/* File info header */}
          <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <svg
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                {state.fileName}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {state.urls.length} URL{state.urls.length !== 1 ? "s" : ""}{" "}
                found{state.truncated ? " (capped at 500)" : ""}
              </p>
            </div>
          </div>

          {/* URL preview list */}
          <div className="max-h-[280px] overflow-y-auto px-5 py-3">
            <ul className="space-y-1" role="list" aria-label="Extracted URLs">
              {state.urls.slice(0, 10).map((url) => (
                <li
                  key={url}
                  className="truncate rounded-lg px-3 py-1.5 font-mono text-xs text-[var(--text-secondary)] odd:bg-[var(--surface-elevated)]/50"
                >
                  {url}
                </li>
              ))}
            </ul>
            {state.urls.length > 10 && (
              <p className="mt-2 px-3 text-xs text-[var(--text-tertiary)]">
                ...and {state.urls.length - 10} more
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-3.5">
            <button
              type="button"
              onClick={resetState}
              disabled={isLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleUseURLs}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-sky-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none dark:from-sky-500 dark:to-cyan-400 dark:shadow-sky-500/15 dark:hover:shadow-sky-500/25"
            >
              Use These URLs
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={[...SUPPORTED_EXTENSIONS, ...SUPPORTED_MIME_TYPES].join(",")}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
