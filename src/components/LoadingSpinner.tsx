"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { dim: 18, stroke: 2.5 },
  md: { dim: 28, stroke: 3 },
  lg: { dim: 44, stroke: 3.5 },
};

export default function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  const s = sizeMap[size];
  const center = s.dim / 2;
  const radius = (s.dim - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      width={s.dim}
      height={s.dim}
      viewBox={`0 0 ${s.dim} ${s.dim}`}
      aria-label="Loading"
      className="inline-block animate-spin"
      style={{ transformOrigin: "center" }}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={s.stroke}
        className="text-[var(--surface-elevated)]"
      />
      {/* Arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={s.stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
        className="text-[var(--accent)]"
      />
    </svg>
  );
}
