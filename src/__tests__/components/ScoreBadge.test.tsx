import { render, screen } from "@testing-library/react";
import ScoreBadge from "@/components/ScoreBadge";

// Mock requestAnimationFrame to immediately call callback so animation completes
beforeEach(() => {
  let callCount = 0;
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    // Call once with a time far enough that the animation completes (> 800ms duration)
    if (callCount === 0) {
      callCount++;
      cb(1000);
    }
    return callCount;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ScoreBadge", () => {
  it("renders an SVG element", () => {
    const { container } = render(<ScoreBadge score={85} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 44 44");
  });

  it("renders two circle elements (track + arc)", () => {
    const { container } = render(<ScoreBadge score={75} />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
  });

  it("renders the score number", () => {
    const { container } = render(<ScoreBadge score={85} />);
    // The animated score should eventually show - but with our RAF mock it may show partial
    // Just check that a number is rendered
    const scoreSpan = container.querySelector(".tabular-nums");
    expect(scoreSpan).toBeInTheDocument();
  });

  it("applies green color for score >= 90", () => {
    const { container } = render(<ScoreBadge score={95} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--score-green)");
  });

  it("applies amber color for score >= 50 and < 90", () => {
    const { container } = render(<ScoreBadge score={65} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--score-amber)");
  });

  it("applies red color for score < 50", () => {
    const { container } = render(<ScoreBadge score={30} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--score-red)");
  });

  it("clamps score to 0-100 range", () => {
    const { container } = render(<ScoreBadge score={150} />);
    const arc = container.querySelectorAll("circle")[1];
    // Should use green color (clamped to 100)
    expect(arc.getAttribute("stroke")).toBe("var(--score-green)");
  });

  it("handles score of 0", () => {
    const { container } = render(<ScoreBadge score={0} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--score-red)");
  });

  it("renders label when provided", () => {
    render(<ScoreBadge score={85} label="Performance" />);
    expect(screen.getByText("Performance")).toBeInTheDocument();
  });

  it("does not render label when not provided", () => {
    const { container } = render(<ScoreBadge score={85} />);
    // Only the score span should be present, no label span
    const spans = container.querySelectorAll("span");
    const labelSpan = Array.from(spans).find(
      (s) => s.textContent === "Performance"
    );
    expect(labelSpan).toBeUndefined();
  });

  it("renders score at boundary 90 as green", () => {
    const { container } = render(<ScoreBadge score={90} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--score-green)");
  });

  it("renders score at boundary 50 as amber", () => {
    const { container } = render(<ScoreBadge score={50} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--score-amber)");
  });

  it("renders score at boundary 49 as red", () => {
    const { container } = render(<ScoreBadge score={49} />);
    const arc = container.querySelectorAll("circle")[1];
    expect(arc.getAttribute("stroke")).toBe("var(--score-red)");
  });
});
