import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { colors } from "../theme";

export const AnalysisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Progress goes from 0 to 100 over the scene
  const progress = interpolate(frame, [10, 140], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const progressBarWidth = interpolate(progress, [0, 100], [0, 560]);

  // Counter: completed out of 4
  const completed = Math.min(Math.floor(progress / 25), 4);

  // Orbiting dot
  const orbitAngle = frame * 4;

  // Shimmer position
  const shimmerX = interpolate(
    frame % 45,
    [0, 45],
    [-100, 660],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Section label */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 60,
          fontSize: 14,
          fontWeight: 600,
          color: colors.accentSecondary,
          fontFamily: "monospace",
          letterSpacing: 2,
          textTransform: "uppercase",
          opacity: entrance,
        }}
      >
        Step 2 — Analyzing
      </div>

      <div
        style={{
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [30, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
        }}
      >
        {/* Orbiting ring */}
        <div
          style={{
            width: 120,
            height: 120,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Ring */}
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={colors.border}
              strokeWidth="3"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={`url(#progressGrad)`}
              strokeWidth="3"
              strokeDasharray={`${(progress / 100) * 314} 314`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor={colors.accent} />
                <stop offset="1" stopColor={colors.accentSecondary} />
              </linearGradient>
            </defs>
          </svg>
          {/* Orbiting dot */}
          <div
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: colors.accent,
              boxShadow: `0 0 12px ${colors.accent}`,
              transform: `rotate(${orbitAngle}deg) translateX(50px)`,
              transformOrigin: "center",
              left: 56,
              top: 56,
            }}
          />
          {/* Percentage */}
          <div
            style={{
              position: "absolute",
              fontSize: 28,
              fontWeight: 700,
              color: colors.foreground,
              fontFamily: "monospace",
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>

        {/* Status text */}
        <div
          style={{
            fontSize: 18,
            color: colors.textSecondary,
            fontFamily: "sans-serif",
          }}
        >
          Processing URLs...{" "}
          <span
            style={{
              color: colors.accent,
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            {completed}/4
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: 560,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.surfaceElevated,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              width: progressBarWidth,
              height: "100%",
              borderRadius: 3,
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentSecondary})`,
            }}
          />
          {/* Shimmer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: shimmerX,
              width: 100,
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            }}
          />
        </div>

        {/* URL status items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 560 }}>
          {["github.com", "vercel.com", "nextjs.org", "tailwindcss.com"].map(
            (url, i) => {
              const done = completed > i;
              const active = completed === i && progress < 100;
              const itemOpacity = interpolate(
                frame,
                [20 + i * 15, 35 + i * 15],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <div
                  key={i}
                  style={{
                    opacity: itemOpacity,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: done
                      ? `${colors.scoreGreen}10`
                      : active
                        ? `${colors.accent}10`
                        : colors.surfaceElevated,
                    border: `1px solid ${done ? `${colors.scoreGreen}30` : active ? `${colors.accent}30` : colors.border}`,
                  }}
                >
                  {/* Status icon */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      backgroundColor: done
                        ? colors.scoreGreen
                        : active
                          ? colors.accent
                          : colors.border,
                      color: done || active ? "white" : colors.textTertiary,
                    }}
                  >
                    {done ? "✓" : active ? "…" : "·"}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontFamily: "monospace",
                      color: done
                        ? colors.scoreGreen
                        : active
                          ? colors.accent
                          : colors.textTertiary,
                    }}
                  >
                    {url}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
