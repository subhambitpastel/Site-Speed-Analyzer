import { render, screen, fireEvent } from "@testing-library/react";
import ExportDropdown from "@/components/ExportDropdown";
import type { LighthouseReport } from "@/types/report";

// Mock export modules
const mockExportCSV = jest.fn();
const mockExportPlainCSV = jest.fn();
const mockExportPDF = jest.fn();
const mockExportDOCX = jest.fn();

jest.mock("@/lib/exportCSV", () => ({
  exportCSV: (...args: unknown[]) => mockExportCSV(...args),
  exportPlainCSV: (...args: unknown[]) => mockExportPlainCSV(...args),
}));

jest.mock("@/lib/exportPDF", () => ({
  exportPDF: (...args: unknown[]) => mockExportPDF(...args),
}));

jest.mock("@/lib/exportDOCX", () => ({
  exportDOCX: (...args: unknown[]) => mockExportDOCX(...args),
}));

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

describe("ExportDropdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the export button", () => {
    render(<ExportDropdown results={[makeReport()]} />);
    expect(screen.getByText("Export")).toBeInTheDocument();
  });

  it("button has aria-haspopup attribute", () => {
    render(<ExportDropdown results={[makeReport()]} />);
    const button = screen.getByRole("button", { name: /export/i });
    expect(button).toHaveAttribute("aria-haspopup", "menu");
  });

  it("dropdown is closed by default", () => {
    render(<ExportDropdown results={[makeReport()]} />);
    const menu = screen.getByRole("menu", { hidden: true });
    expect(menu).toHaveAttribute("aria-hidden", "true");
  });

  it("opens dropdown on button click", () => {
    render(<ExportDropdown results={[makeReport()]} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("aria-hidden", "false");
  });

  it("closes dropdown on second button click", () => {
    render(<ExportDropdown results={[makeReport()]} />);
    const button = screen.getByRole("button", { name: /export/i });
    fireEvent.click(button);
    expect(screen.getByRole("menu")).toHaveAttribute("aria-hidden", "false");
    fireEvent.click(button);
    expect(screen.getByRole("menu", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });

  it("shows all export options when open", () => {
    render(<ExportDropdown results={[makeReport()]} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(screen.getByText("Export as Excel")).toBeInTheDocument();
    expect(screen.getByText("Export as CSV")).toBeInTheDocument();
    expect(screen.getByText("Export as PDF")).toBeInTheDocument();
    expect(screen.getByText("Export as DOCX")).toBeInTheDocument();
  });

  it("calls exportCSV when Excel option is clicked", () => {
    const results = [makeReport()];
    render(<ExportDropdown results={results} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByText("Export as Excel"));
    expect(mockExportCSV).toHaveBeenCalledWith(results);
  });

  it("calls exportPlainCSV when CSV option is clicked", () => {
    const results = [makeReport()];
    render(<ExportDropdown results={results} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByText("Export as CSV"));
    expect(mockExportPlainCSV).toHaveBeenCalledWith(results);
  });

  it("calls exportPDF when PDF option is clicked", () => {
    const results = [makeReport()];
    render(<ExportDropdown results={results} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByText("Export as PDF"));
    expect(mockExportPDF).toHaveBeenCalledWith(results);
  });

  it("calls exportDOCX when DOCX option is clicked", () => {
    const results = [makeReport()];
    render(<ExportDropdown results={results} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByText("Export as DOCX"));
    expect(mockExportDOCX).toHaveBeenCalledWith(results);
  });

  it("closes dropdown after selecting an export option", () => {
    render(<ExportDropdown results={[makeReport()]} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.click(screen.getByText("Export as PDF"));
    expect(screen.getByRole("menu", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });

  it("disables button when no completed results exist", () => {
    const emptyReport: LighthouseReport = {
      url: "https://example.com",
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
    render(<ExportDropdown results={[emptyReport]} />);
    expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();
  });

  it("disables button when results have errors", () => {
    const errorReport = makeReport({
      error: "Failed",
      scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
    });
    render(<ExportDropdown results={[errorReport]} />);
    expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();
  });

  it("closes dropdown on Escape key", () => {
    render(<ExportDropdown results={[makeReport()]} />);
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(screen.getByRole("menu")).toHaveAttribute("aria-hidden", "false");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("menu", { hidden: true })).toHaveAttribute("aria-hidden", "true");
  });
});
