import { render, screen, fireEvent } from "@testing-library/react";
import ResultsTable from "@/components/ResultsTable";
import type { LighthouseReport } from "@/types/report";

// Mock child components to simplify testing
jest.mock("@/components/ScoreBadge", () => ({
  __esModule: true,
  default: ({ score }: { score: number }) => (
    <span data-testid="score-badge">{score}</span>
  ),
}));

jest.mock("@/components/MetricsPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="metrics-panel" />,
}));

jest.mock("@/components/ScoreChart", () => ({
  __esModule: true,
  default: () => <div data-testid="score-chart" />,
}));

jest.mock("@/components/LoadingSpinner", () => ({
  __esModule: true,
  default: () => <span data-testid="loading-spinner" />,
}));

jest.mock("@/components/Tooltip", () => {
  const Tooltip = ({ children }: { children: React.ReactNode; text: string }) => (
    <span>{children}</span>
  );
  const InfoIcon = () => <span data-testid="info-icon" />;
  return { __esModule: true, default: Tooltip, InfoIcon };
});

function makeReport(overrides: Partial<LighthouseReport> = {}): LighthouseReport {
  return {
    url: "https://example.com",
    scores: {
      performance: 85,
      accessibility: 90,
      seo: 95,
      bestPractices: 80,
    },
    coreWebVitals: {
      fcp: { value: 1200, displayValue: "1.2 s" },
      lcp: { value: 2500, displayValue: "2.5 s" },
      tbt: { value: 150, displayValue: "150 ms" },
      cls: { value: 0.05, displayValue: "0.05" },
      tti: { value: 3800, displayValue: "3.8 s" },
    },
    fetchedAt: "2026-01-01T00:00:00Z",
    strategy: "desktop",
    ...overrides,
  };
}

function makeLoadingReport(url: string): LighthouseReport {
  return {
    url,
    scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
    coreWebVitals: {
      fcp: { value: 0, displayValue: "" },
      lcp: { value: 0, displayValue: "" },
      tbt: { value: 0, displayValue: "" },
      cls: { value: 0, displayValue: "" },
      tti: { value: 0, displayValue: "" },
    },
    fetchedAt: "",
    strategy: "desktop",
  };
}

describe("ResultsTable", () => {
  it("returns null when results array is empty", () => {
    const { container } = render(<ResultsTable results={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a table with results", () => {
    const results = [makeReport()];
    render(<ResultsTable results={results} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("renders the URL in the table", () => {
    const results = [makeReport({ url: "https://test-site.com" })];
    render(<ResultsTable results={results} />);
    // URL appears in both mobile card and desktop row
    const urlElements = screen.getAllByText("https://test-site.com");
    expect(urlElements.length).toBeGreaterThan(0);
  });

  it("renders score badges for each category", () => {
    const results = [makeReport()];
    render(<ResultsTable results={results} />);
    const badges = screen.getAllByTestId("score-badge");
    // 4 per row in desktop + 4 per card in mobile = 8
    expect(badges.length).toBeGreaterThanOrEqual(4);
  });

  it("shows loading state for reports still being fetched", () => {
    const results = [makeLoadingReport("https://loading.com")];
    render(<ResultsTable results={results} />);
    expect(screen.getAllByText("Analyzing...").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("loading-spinner").length).toBeGreaterThan(0);
  });

  it("shows error state for failed reports", () => {
    const results = [
      makeReport({
        url: "https://error-site.com",
        error: "Request timed out",
        scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
      }),
    ];
    render(<ResultsTable results={results} />);
    const errorTexts = screen.getAllByText("Request timed out");
    expect(errorTexts.length).toBeGreaterThan(0);
  });

  it("shows success row with expandable details", () => {
    const results = [makeReport({ url: "https://expand-me.com" })];
    render(<ResultsTable results={results} />);

    // Desktop table row should be expandable
    const row = screen.getByRole("button", {
      name: /expand details for https:\/\/expand-me.com/i,
    });
    expect(row).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(row);
    expect(row).toHaveAttribute("aria-expanded", "true");

    // Expanded content should show ScoreChart and MetricsPanel
    expect(screen.getByTestId("score-chart")).toBeInTheDocument();
    expect(screen.getByTestId("metrics-panel")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    const results = [makeReport()];
    render(<ResultsTable results={results} />);
    expect(screen.getAllByText("URL").length).toBeGreaterThan(0);
  });

  it("renders multiple results", () => {
    const results = [
      makeReport({ url: "https://site-a.com" }),
      makeReport({ url: "https://site-b.com" }),
      makeReport({ url: "https://site-c.com" }),
    ];
    render(<ResultsTable results={results} />);
    expect(screen.getAllByText("https://site-a.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("https://site-b.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("https://site-c.com").length).toBeGreaterThan(0);
  });

  it("shows 'From file' badge for imported results", () => {
    const results = [makeReport({ loadedFromFile: true })];
    render(<ResultsTable results={results} />);
    const fileBadges = screen.getAllByText("From file");
    expect(fileBadges.length).toBeGreaterThan(0);
  });

  it("handles mixed loading, error, and success states", () => {
    const results = [
      makeReport({ url: "https://success.com" }),
      makeLoadingReport("https://loading.com"),
      makeReport({
        url: "https://error.com",
        error: "DNS failed",
        scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
      }),
    ];
    render(<ResultsTable results={results} />);
    expect(screen.getAllByText("https://success.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Analyzing...").length).toBeGreaterThan(0);
    expect(screen.getAllByText("DNS failed").length).toBeGreaterThan(0);
  });
});
