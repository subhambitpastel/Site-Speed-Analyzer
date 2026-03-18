import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../theme";

const EXPORT_OPTIONS = [
  { label: "Excel (.xls)", desc: "Color-coded spreadsheet", icon: "📊" },
  { label: "CSV (.csv)", desc: "Plain text data", icon: "📄" },
  { label: "PDF", desc: "Print-ready report", icon: "📕" },
  { label: "DOCX", desc: "Word document", icon: "📝" },
];

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Export cards entrance
  const cardsEntrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  // CTA entrance
  const ctaEntrance = spring({
    frame,
    fps,
    delay: 60,
    config: { damping: 12 },
  });

  // Gradient pulse on CTA
  const glowIntensity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.6]
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at center, ${colors.accent}08 0%, transparent 60%)`,
        }}
      />

      {/* Export section */}
      <div
        style={{
          opacity: cardsEntrance,
          transform: `translateY(${interpolate(cardsEntrance, [0, 1], [30, 0])}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Label */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: colors.accentSecondary,
            fontFamily: "monospace",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Export Your Results
        </div>

        {/* Export format cards */}
        <div style={{ display: "flex", gap: 16 }}>
          {EXPORT_OPTIONS.map((opt, i) => {
            const cardDelay = 10 + i * 10;
            const cardScale = spring({
              frame,
              fps,
              delay: cardDelay,
              config: { damping: 15 },
            });

            return (
              <div
                key={i}
                style={{
                  transform: `scale(${cardScale})`,
                  width: 140,
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 32 }}>{opt.icon}</div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: colors.foreground,
                    fontFamily: "sans-serif",
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: colors.textTertiary,
                    fontFamily: "sans-serif",
                    textAlign: "center",
                  }}
                >
                  {opt.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          opacity: interpolate(ctaEntrance, [0, 1], [0, 1]),
          transform: `scale(${ctaEntrance})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentSecondary})`,
            color: "white",
            fontSize: 20,
            fontWeight: 700,
            fontFamily: "sans-serif",
            padding: "14px 40px",
            borderRadius: 14,
            boxShadow: `0 0 ${40 * glowIntensity}px ${colors.accent}${Math.round(glowIntensity * 99)}`,
          }}
        >
          Try It Free — No Backend Required
        </div>
        <div
          style={{
            fontSize: 14,
            color: colors.textTertiary,
            fontFamily: "sans-serif",
          }}
        >
          100% client-side • Static hosting • Open source
        </div>
      </div>
    </AbsoluteFill>
  );
};
