import { render, screen } from "@testing-library/react";
import ScoreChart from "@/components/ScoreChart";
import type { CategoryScores } from "@/types/report";

// Mock Tooltip to render children directly
jest.mock("@/components/Tooltip", () => {
  const Tooltip = ({ children, className }: { children: React.ReactNode; text: string; className?: string }) => (
    <span className={className}>{children}</span>
  );
  const InfoIcon = () => <span data-testid="info-icon" />;
  return { __esModule: true, default: Tooltip, InfoIcon };
});

describe("ScoreChart", () => {
  const highScores: CategoryScores = {
    performance: 95,
    accessibility: 92,
    seo: 98,
    bestPractices: 91,
  };

  const mixedScores: CategoryScores = {
    performance: 45,
    accessibility: 72,
    seo: 95,
    bestPractices: 30,
  };

  it("renders all 4 category labels", () => {
    render(<ScoreChart scores={highScores} />);
    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.getByText("Accessibility")).toBeInTheDocument();
    expect(screen.getByText("SEO")).toBeInTheDocument();
    expect(screen.getByText("Best Practices")).toBeInTheDocument();
  });

  it("renders score values as text", () => {
    render(<ScoreChart scores={highScores} />);
    expect(screen.getByText("95")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("98")).toBeInTheDocument();
    expect(screen.getByText("91")).toBeInTheDocument();
  });

  it("renders 4 progress bars with correct widths", () => {
    const { container } = render(<ScoreChart scores={mixedScores} />);
    const bars = container.querySelectorAll('[class*="absolute inset-y-0"]');
    expect(bars).toHaveLength(4);

    // Check widths correspond to scores
    expect((bars[0] as HTMLElement).style.width).toBe("45%");
    expect((bars[1] as HTMLElement).style.width).toBe("72%");
    expect((bars[2] as HTMLElement).style.width).toBe("95%");
    expect((bars[3] as HTMLElement).style.width).toBe("30%");
  });

  it("uses green color for scores >= 90", () => {
    const { container } = render(<ScoreChart scores={highScores} />);
    const bars = container.querySelectorAll('[class*="absolute inset-y-0"]');
    // All scores are >= 90 so all should be green
    bars.forEach((bar) => {
      expect((bar as HTMLElement).style.backgroundColor).toBe(
        "var(--score-green)"
      );
    });
  });

  it("uses correct colors for mixed scores", () => {
    const { container } = render(<ScoreChart scores={mixedScores} />);
    const bars = container.querySelectorAll('[class*="absolute inset-y-0"]');

    // 45 -> red
    expect((bars[0] as HTMLElement).style.backgroundColor).toBe("var(--score-red)");
    // 72 -> amber
    expect((bars[1] as HTMLElement).style.backgroundColor).toBe("var(--score-amber)");
    // 95 -> green
    expect((bars[2] as HTMLElement).style.backgroundColor).toBe("var(--score-green)");
    // 30 -> red
    expect((bars[3] as HTMLElement).style.backgroundColor).toBe("var(--score-red)");
  });

  it("renders info icons for tooltips", () => {
    render(<ScoreChart scores={highScores} />);
    const infoIcons = screen.getAllByTestId("info-icon");
    expect(infoIcons).toHaveLength(4);
  });
});
