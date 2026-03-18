export const colors = {
  bg: "#0b0e1a",
  surface: "#111427",
  surfaceElevated: "#1a1e35",
  border: "#1e2340",
  foreground: "#e4e7f1",
  accent: "#38bdf8",
  accentSecondary: "#a78bfa",
  textSecondary: "#94a0c0",
  textTertiary: "#5b6384",
  scoreGreen: "#34d399",
  scoreAmber: "#fbbf24",
  scoreRed: "#f87171",
  gradientStart: "#0ea5e9",
  gradientEnd: "#06b6d4",
};

export const scoreColor = (score: number) => {
  if (score >= 90) return colors.scoreGreen;
  if (score >= 50) return colors.scoreAmber;
  return colors.scoreRed;
};
