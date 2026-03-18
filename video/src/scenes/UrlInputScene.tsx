import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

const URLS = [
  "https://github.com",
  "https://vercel.com",
  "https://nextjs.org",
  "https://tailwindcss.com",
];

export const UrlInputScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerScale = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // Typewriter: each URL takes ~25 frames to type, staggered
  const charsPerFrame = 0.8;
  const urlStartFrames = [10, 40, 70, 100];

  const getVisibleText = (url: string, startFrame: number) => {
    const elapsed = frame - startFrame;
    if (elapsed < 0) return "";
    const chars = Math.min(
      Math.floor(elapsed * charsPerFrame),
      url.length
    );
    return url.slice(0, chars);
  };

  // Strategy toggle animation
  const toggleProgress = spring({
    frame,
    fps,
    delay: 120,
    config: { damping: 15 },
  });
  const toggleX = interpolate(toggleProgress, [0, 1], [0, 88]);

  // Button entrance
  const buttonScale = spring({
    frame,
    fps,
    delay: 140,
    config: { damping: 12 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      {/* Background orb */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.accent}08, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Section label */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 60,
          fontSize: 14,
          fontWeight: 600,
          color: colors.accent,
          fontFamily: "monospace",
          letterSpacing: 2,
          textTransform: "uppercase",
          opacity: interpolate(frame, [0, 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Step 1 — Enter URLs
      </div>

      {/* Input container */}
      <div
        style={{
          transform: `scale(${containerScale})`,
          width: 700,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: `0 0 60px ${colors.accent}10`,
        }}
      >
        {/* Input header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: colors.textTertiary,
              fontFamily: "monospace",
            }}
          >
            Enter one URL per line
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: colors.scoreRed,
                opacity: 0.7,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: colors.scoreAmber,
                opacity: 0.7,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: colors.scoreGreen,
                opacity: 0.7,
              }}
            />
          </div>
        </div>

        {/* Textarea mock */}
        <div
          style={{
            background: colors.surfaceElevated,
            borderRadius: 10,
            padding: 16,
            minHeight: 140,
            border: `1px solid ${colors.border}`,
            fontFamily: "monospace",
            fontSize: 15,
            lineHeight: 1.8,
          }}
        >
          {URLS.map((url, i) => {
            const text = getVisibleText(url, urlStartFrames[i]);
            if (!text) return null;
            return (
              <div key={i} style={{ color: colors.foreground }}>
                {text}
                {text.length < url.length && (
                  <span
                    style={{
                      opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
                      color: colors.accent,
                    }}
                  >
                    |
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Strategy toggle + button row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          {/* Strategy toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 180,
                height: 36,
                borderRadius: 18,
                background: colors.surfaceElevated,
                border: `1px solid ${colors.border}`,
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Sliding thumb */}
              <div
                style={{
                  position: "absolute",
                  left: 2 + toggleX,
                  width: 88,
                  height: 32,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.gradientEnd})`,
                  transition: "none",
                }}
              />
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    toggleProgress < 0.5
                      ? "white"
                      : colors.textTertiary,
                  zIndex: 1,
                  fontFamily: "sans-serif",
                }}
              >
                Desktop
              </div>
              <div
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    toggleProgress >= 0.5
                      ? "white"
                      : colors.textTertiary,
                  zIndex: 1,
                  fontFamily: "sans-serif",
                }}
              >
                Mobile
              </div>
            </div>
          </div>

          {/* Generate button */}
          <div
            style={{
              transform: `scale(${buttonScale})`,
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentSecondary})`,
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "sans-serif",
              padding: "10px 28px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Generate Reports
            <span style={{ fontSize: 18 }}>→</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
