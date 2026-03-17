"use client";

import { type ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
  className?: string;
}

export function InfoIcon() {
  return (
    <svg
      className="inline-block h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-40 group-hover:opacity-70 transition-opacity"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.93 12.14h-1.86V6.86h1.86v5.28zm-.93-6.57a1.07 1.07 0 110-2.14 1.07 1.07 0 010 2.14z" />
    </svg>
  );
}

export default function Tooltip({ text, children, className = "" }: TooltipProps) {
  return (
    <span className={`group relative inline-flex items-center ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 scale-95 whitespace-normal rounded-lg backdrop-blur-md bg-gray-900/80 dark:bg-white/90 border border-white/10 dark:border-gray-200/20 px-3 py-2 text-sm leading-relaxed font-normal normal-case tracking-normal text-white dark:text-gray-900 opacity-0 shadow-xl shadow-black/10 transition-all duration-200 ease-out delay-150 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 max-w-xs w-max"
      >
        {text}
        {/* Arrow */}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900/80 dark:border-t-white/90" />
      </span>
    </span>
  );
}
