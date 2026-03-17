"use client";

import { type ReactNode } from "react";

interface TooltipProps {
  text: string;
  children: ReactNode;
  className?: string;
}

export default function Tooltip({ text, children, className = "" }: TooltipProps) {
  return (
    <span className={`group relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-normal rounded-md bg-gray-900/95 dark:bg-gray-100/95 px-3 py-2 text-xs font-normal normal-case tracking-normal text-white dark:text-gray-900 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 max-w-xs w-max"
      >
        {text}
        {/* Arrow */}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900/95 dark:border-t-gray-100/95" />
      </span>
    </span>
  );
}
