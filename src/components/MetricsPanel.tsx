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
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {abbreviation}
      </p>
      <p className="mt-1.5 text-xl font-semibold tabular-nums font-mono text-slate-900 dark:text-slate-100">
        {displayValue}
      </p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
