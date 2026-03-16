"use client";

import { useState, useEffect } from "react";

interface ScoreBadgeProps {
  score: number;
  label?: string;
}

function getScoreColor(score: number): {
  stroke: string;
  text: string;
} {
  if (score >= 90) {
    return {
      stroke: "#10b981",
      text: "text-emerald-600 dark:text-emerald-400",
    };
  }
  if (score >= 50) {
    return {
      stroke: "#f59e0b",
      text: "text-amber-600 dark:text-amber-400",
    };
  }
  return {
    stroke: "#ef4444",
    text: "text-red-600 dark:text-red-400",
  };
}

export default function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const colors = getScoreColor(clamped);

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    setDisplayedScore(0);
    const start = performance.now();
    const duration = 800;
    let rafId: number;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayedScore(Math.round(progress * clamped));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [clamped]);

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="relative inline-flex items-center justify-center rounded-full"
        style={{ width: 40, height: 40 }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          className="animate-score-ring"
        >
          {/* Background track */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Score arc */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 20 20)"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score number */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums font-mono ${colors.text}`}
        >
          {displayedScore}
        </span>
      </span>
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
    </span>
  );
}
