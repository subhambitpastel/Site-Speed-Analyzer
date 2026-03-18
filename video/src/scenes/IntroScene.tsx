import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [15, 40], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [35, 55], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [50, 80], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}15, transparent 70%)`,
          top: -100,
          right: -100,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accentSecondary}10, transparent 70%)`,
          bottom: -50,
          left: -50,
        }}
      />

      {/* Logo icon */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 30,
        }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect
            width="80"
            height="80"
            rx="20"
            fill={`url(#logoGrad)`}
          />
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="80" y2="80">
              <stop stopColor={colors.accent} />
              <stop offset="1" stopColor={colors.accentSecondary} />
            </linearGradient>
          </defs>
          <path
            d="M24 52 L34 28 L44 44 L50 34 L58 52"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="58" cy="28" r="6" fill="white" opacity="0.9" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 52,
          fontWeight: 700,
          fontFamily: "sans-serif",
          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentSecondary})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          letterSpacing: -1,
        }}
      >
        Bulk Site Speed Analyzer
      </div>

      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: `linear-gradient(90deg, ${colors.accent}, ${colors.accentSecondary})`,
          borderRadius: 2,
          marginTop: 16,
          marginBottom: 16,
        }}
      />

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontSize: 22,
          color: colors.textSecondary,
          fontFamily: "sans-serif",
          fontWeight: 400,
          textAlign: "center",
        }}
      >
        Analyze multiple URLs with Google Lighthouse — instantly
      </div>
    </AbsoluteFill>
  );
};
