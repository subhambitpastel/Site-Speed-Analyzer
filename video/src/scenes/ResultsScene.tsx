import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, scoreColor } from "../theme";

type SiteResult = {
  url: string;
  performance: number;
  accessibility: number;
  seo: number;
  bestPractices: number;
};

const RESULTS: SiteResult[] = [
  { url: "github.com", performance: 72, accessibility: 95, seo: 91, bestPractices: 96 },
  { url: "vercel.com", performance: 98, accessibility: 100, seo: 100, bestPractices: 100 },
  { url: "nextjs.org", performance: 88, accessibility: 93, seo: 100, bestPractices: 96 },
  { url: "tailwindcss.com", performance: 95, accessibility: 98, seo: 92, bestPractices: 100 },
];

const CATEGORIES = ["Performance", "Accessibility", "SEO", "Best Practices"] as const;
const CATEGORY_KEYS: (keyof Omit<SiteResult, "url">)[] = [
  "performance",
  "accessibility",
  "seo",
  "bestPractices",
];

const ScoreBadge: React.FC<{
  score: number;
  frame: number;
  fps: number;
  delay: number;
}> = ({ score, frame, fps, delay }) => {
  const progress = spring({
    frame,
    fps,
    delay,
    config: { damping: 200 },
  });

  const displayScore = Math.round(score * progress);
  const color = scoreColor(score);
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress * (score / 100));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={`${color}20`}
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
        <text
          x="20"
          y="21"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="11"
          fontWeight="700"
          fontFamily="monospace"
        >
          {displayScore}
        </text>
      </svg>
    </div>
  );
};

export const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerEntrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        padding: 40,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: colors.scoreGreen,
          fontFamily: "monospace",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 16,
          opacity: headerEntrance,
        }}
      >
        Step 3 — Results
      </div>

      {/* Results header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          opacity: headerEntrance,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: colors.foreground,
            fontFamily: "sans-serif",
          }}
        >
          Lighthouse Scores
        </div>
        <div
          style={{
            background: `${colors.accent}15`,
            border: `1px solid ${colors.accent}30`,
            borderRadius: 8,
            padding: "4px 12px",
            fontSize: 13,
            color: colors.accent,
            fontFamily: "monospace",
            fontWeight: 600,
          }}
        >
          Mobile
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
          overflow: "hidden",
          opacity: headerEntrance,
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "flex",
            padding: "12px 20px",
            borderBottom: `1px solid ${colors.border}`,
            background: colors.surfaceElevated,
          }}
        >
          <div
            style={{
              flex: 2,
              fontSize: 12,
              fontWeight: 600,
              color: colors.textTertiary,
              fontFamily: "sans-serif",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            URL
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat}
              style={{
                flex: 1,
                fontSize: 11,
                fontWeight: 600,
                color: colors.textTertiary,
                fontFamily: "sans-serif",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                textAlign: "center",
              }}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Table rows */}
        {RESULTS.map((result, rowIndex) => {
          const rowDelay = 15 + rowIndex * 12;
          const rowEntrance = spring({
            frame,
            fps,
            delay: rowDelay,
            config: { damping: 200 },
          });

          return (
            <div
              key={rowIndex}
              style={{
                display: "flex",
                padding: "14px 20px",
                alignItems: "center",
                borderBottom:
                  rowIndex < RESULTS.length - 1
                    ? `1px solid ${colors.border}`
                    : "none",
                opacity: rowEntrance,
                transform: `translateX(${interpolate(rowEntrance, [0, 1], [20, 0])}px)`,
              }}
            >
              <div
                style={{
                  flex: 2,
                  fontSize: 14,
                  color: colors.foreground,
                  fontFamily: "monospace",
                }}
              >
                {result.url}
              </div>
              {CATEGORY_KEYS.map((key, colIndex) => (
                <div
                  key={key}
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <ScoreBadge
                    score={result[key]}
                    frame={frame}
                    fps={fps}
                    delay={rowDelay + 5 + colIndex * 4}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Expanded detail preview - bar chart for vercel.com */}
      <div
        style={{
          marginTop: 16,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
          padding: 20,
          opacity: interpolate(frame, [100, 120], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(frame, [100, 120], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: colors.textTertiary,
            fontFamily: "monospace",
            marginBottom: 12,
          }}
        >
          vercel.com — Detailed Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Performance", score: 98 },
            { label: "Accessibility", score: 100 },
            { label: "SEO", score: 100 },
            { label: "Best Practices", score: 100 },
          ].map((item, i) => {
            const barProgress = interpolate(
              frame,
              [110 + i * 8, 140 + i * 8],
              [0, item.score],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const barColor = scoreColor(item.score);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 110,
                    fontSize: 12,
                    color: colors.textSecondary,
                    fontFamily: "sans-serif",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: `${barColor}15`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barProgress}%`,
                      height: "100%",
                      borderRadius: 4,
                      backgroundColor: barColor,
                      boxShadow: `0 0 8px ${barColor}40`,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 35,
                    textAlign: "right",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    color: barColor,
                  }}
                >
                  {Math.round(barProgress)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
