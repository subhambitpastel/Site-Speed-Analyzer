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
  const gapLength = circumference * 0.25;
  const arcLength = circumference - gapLength;

  return (
    <svg
      width={s.dim}
      height={s.dim}
      viewBox={`0 0 ${s.dim} ${s.dim}`}
      aria-label="Loading"
      className="inline-block spinner-rotate"
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
      {/* Smooth circular motion arc with elastic dash */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={s.stroke}
        strokeLinecap="round"
        className="text-[var(--accent)] spinner-dash"
        style={{ transformOrigin: "center" }}
      />
    </svg>
  );
}
