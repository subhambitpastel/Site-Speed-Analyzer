"use client";

import { type ReactNode, useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

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
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;

    // Position below the trigger by default
    let top = rect.bottom + 8;
    let left = rect.left + rect.width / 2;

    // If tooltip would go off right edge, adjust
    if (tooltipEl) {
      const tooltipRect = tooltipEl.getBoundingClientRect();
      if (left + tooltipRect.width / 2 > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width / 2 - 8;
      }
      if (left - tooltipRect.width / 2 < 8) {
        left = tooltipRect.width / 2 + 8;
      }
      // If below would go off bottom, show above instead
      if (top + tooltipRect.height > window.innerHeight - 8) {
        top = rect.top - tooltipRect.height - 8;
      }
    }

    setPos({ top, left });
  }, []);

  const handleMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
      // Update position after render
      requestAnimationFrame(updatePosition);
    }, 150);
  }, [updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  // Update position when visible changes
  useEffect(() => {
    if (visible) {
      updatePosition();
      // Update again after a frame for accurate tooltip dimensions
      requestAnimationFrame(updatePosition);
    }
  }, [visible, updatePosition]);

  const tooltipEl = mounted && visible ? createPortal(
    <div
      ref={tooltipRef}
      role="tooltip"
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        transform: "translateX(-50%)",
        zIndex: 9999,
      }}
      className={`pointer-events-none whitespace-normal rounded-lg backdrop-blur-md bg-gray-900/90 dark:bg-white/95 border border-white/10 dark:border-gray-200/20 px-3 py-2 text-sm leading-relaxed font-normal normal-case tracking-normal text-white dark:text-gray-900 shadow-xl shadow-black/10 max-w-xs w-max transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {text}
    </div>,
    document.body
  ) : null;

  return (
    <span
      ref={triggerRef}
      className={`group relative inline-flex items-center cursor-help ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      tabIndex={0}
    >
      {children}
      {tooltipEl}
    </span>
  );
}
