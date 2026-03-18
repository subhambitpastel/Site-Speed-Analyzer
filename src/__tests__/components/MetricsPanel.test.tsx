import { render, screen } from "@testing-library/react";
import MetricsPanel from "@/components/MetricsPanel";
import type { CoreWebVitals } from "@/types/report";

// Mock Tooltip to render children directly
jest.mock("@/components/Tooltip", () => {
  const Tooltip = ({ children }: { children: React.ReactNode; text: string }) => (
    <span>{children}</span>
  );
  const InfoIcon = () => <span data-testid="info-icon" />;
  return { __esModule: true, default: Tooltip, InfoIcon };
});

describe("MetricsPanel", () => {
  const mockVitals: CoreWebVitals = {
    fcp: { value: 1200, displayValue: "1.2 s" },
    lcp: { value: 2500, displayValue: "2.5 s" },
    tbt: { value: 150, displayValue: "150 ms" },
    cls: { value: 0.05, displayValue: "0.05" },
    tti: { value: 3800, displayValue: "3.8 s" },
  };

  it("renders 5 metric cards", () => {
    render(<MetricsPanel coreWebVitals={mockVitals} />);
    expect(screen.getByText("FCP")).toBeInTheDocument();
    expect(screen.getByText("LCP")).toBeInTheDocument();
    expect(screen.getByText("TBT")).toBeInTheDocument();
    expect(screen.getByText("CLS")).toBeInTheDocument();
    expect(screen.getByText("TTI")).toBeInTheDocument();
  });

  it("displays metric display values", () => {
    render(<MetricsPanel coreWebVitals={mockVitals} />);
    expect(screen.getByText("1.2 s")).toBeInTheDocument();
    expect(screen.getByText("2.5 s")).toBeInTheDocument();
    expect(screen.getByText("150 ms")).toBeInTheDocument();
    expect(screen.getByText("0.05")).toBeInTheDocument();
    expect(screen.getByText("3.8 s")).toBeInTheDocument();
  });

  it("displays full metric names", () => {
    render(<MetricsPanel coreWebVitals={mockVitals} />);
    expect(screen.getByText("First Contentful Paint")).toBeInTheDocument();
    expect(screen.getByText("Largest Contentful Paint")).toBeInTheDocument();
    expect(screen.getByText("Total Blocking Time")).toBeInTheDocument();
    expect(screen.getByText("Cumulative Layout Shift")).toBeInTheDocument();
    expect(screen.getByText("Time to Interactive")).toBeInTheDocument();
  });

  it("renders in a grid layout", () => {
    const { container } = render(
      <MetricsPanel coreWebVitals={mockVitals} />
    );
    const grid = container.firstElementChild;
    expect(grid).toHaveClass("grid");
  });

  it("renders info icons for each metric tooltip", () => {
    render(<MetricsPanel coreWebVitals={mockVitals} />);
    const infoIcons = screen.getAllByTestId("info-icon");
    expect(infoIcons).toHaveLength(5);
  });

  it("renders with zero-value metrics without error", () => {
    const zeroVitals: CoreWebVitals = {
      fcp: { value: 0, displayValue: "0 s" },
      lcp: { value: 0, displayValue: "0 s" },
      tbt: { value: 0, displayValue: "0 ms" },
      cls: { value: 0, displayValue: "0" },
      tti: { value: 0, displayValue: "0 s" },
    };
    render(<MetricsPanel coreWebVitals={zeroVitals} />);
    expect(screen.getByText("FCP")).toBeInTheDocument();
    // All five 0-value metrics rendered
    const zeroValues = screen.getAllByText("0 s");
    expect(zeroValues).toHaveLength(3); // fcp, lcp, tti
  });
});
