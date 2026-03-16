"use client";

import type { CoreWebVitals } from "@/types/report";

interface MetricsPanelProps {
  coreWebVitals: CoreWebVitals;
}

interface MetricCardProps {
  name: string;
  abbreviation: string;
  displayValue: string;
}

function MetricCard({ name, abbreviation, displayValue }: MetricCardProps) {
  return (
    <div className="glow-card min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-black/[0.15] sm:px-4 sm:py-4">
      <p className="truncate text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
        {abbreviation}
      </p>
      <p className="mt-2 truncate text-xl font-bold tabular-nums font-mono text-[var(--foreground)] sm:text-2xl">
        {displayValue}
      </p>
      <p className="mt-1 truncate text-[11px] text-[var(--text-tertiary)] sm:text-xs">
        {name}
      </p>
    </div>
  );
}

export default function MetricsPanel({ coreWebVitals }: MetricsPanelProps) {
  const metrics = [
    {
      name: "First Contentful Paint",
      abbreviation: "FCP",
      displayValue: coreWebVitals.fcp.displayValue,
    },
    {
      name: "Largest Contentful Paint",
      abbreviation: "LCP",
      displayValue: coreWebVitals.lcp.displayValue,
    },
    {
      name: "Total Blocking Time",
      abbreviation: "TBT",
      displayValue: coreWebVitals.tbt.displayValue,
    },
    {
      name: "Cumulative Layout Shift",
      abbreviation: "CLS",
      displayValue: coreWebVitals.cls.displayValue,
    },
    {
      name: "Time to Interactive",
      abbreviation: "TTI",
      displayValue: coreWebVitals.tti.displayValue,
    },
  ];

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.abbreviation}
          name={metric.name}
          abbreviation={metric.abbreviation}
          displayValue={metric.displayValue}
        />
      ))}
    </div>
  );
}
