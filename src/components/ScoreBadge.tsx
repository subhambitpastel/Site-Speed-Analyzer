"use client";

import { useState, useEffect } from "react";

interface ScoreBadgeProps {
  score: number;
  label?: string;
}

function getScoreColor(score: number): {
  stroke: string;
  text: string;
  glow: string;
} {
  if (score >= 90) {
    return {
      stroke: "var(--score-green)",
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "var(--glow-green)",
    };
  }
  if (score >= 50) {
    return {
      stroke: "var(--score-amber)",
      text: "text-amber-600 dark:text-amber-400",
      glow: "var(--glow-amber)",
    };
  }
  return {
    stroke: "var(--score-red)",
    text: "text-red-600 dark:text-red-400",
    glow: "var(--glow-red)",
  };
}

export default function ScoreBadge({ score, label }: ScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const colors = getScoreColor(clamped);

  const radius = 17;
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
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedScore(Math.round(eased * clamped));
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
        className="relative inline-flex items-center justify-center"
        style={{ width: 44, height: 44 }}
      >
        {/* Subtle glow behind badge */}
        <span
          className="absolute inset-0 rounded-full blur-md transition-opacity duration-500"
          style={{ backgroundColor: colors.glow, opacity: clamped > 0 ? 1 : 0 }}
        />
        <svg
          width="44"
          height="44"
          viewBox="0 0 44 44"
          className="animate-score-ring relative"
        >
          {/* Background track */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-[var(--surface-elevated)]"
          />
          {/* Score arc */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 22 22)"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score number */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums font-mono ${colors.text}`}
        >
          {displayedScore}
        </span>
      </span>
      {label && (
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
    </span>
  );
}
