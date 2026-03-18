import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Home from "@/app/page";
import type { LighthouseReport } from "@/types/report";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("@/lib/pagespeedClient", () => ({
  fetchReport: jest.fn(),
}));

jest.mock("@/lib/reportParser", () => ({
  parseReport: jest.fn(),
}));

jest.mock("@/lib/exportCSV", () => ({
  exportCSV: jest.fn(),
  exportPlainCSV: jest.fn(),
}));

jest.mock("@/lib/exportPDF", () => ({
  exportPDF: jest.fn(),
}));

jest.mock("@/lib/exportDOCX", () => ({
  exportDOCX: jest.fn(),
}));

jest.mock("@/lib/fileParser", () => ({
  parseFile: jest.fn(),
  SUPPORTED_EXTENSIONS: [".xlsx", ".xls", ".csv"],
  SUPPORTED_MIME_TYPES: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/csv",
  ],
}));

import { fetchReport } from "@/lib/pagespeedClient";
import { parseReport } from "@/lib/reportParser";
import { exportCSV, exportPlainCSV } from "@/lib/exportCSV";
import { exportPDF } from "@/lib/exportPDF";
import { exportDOCX } from "@/lib/exportDOCX";

const mockFetchReport = fetchReport as jest.MockedFunction<typeof fetchReport>;
const mockParseReport = parseReport as jest.MockedFunction<typeof parseReport>;

// Helper to build a complete mock report
function makeMockReport(
  url: string,
  perf = 95,
  strategy: "mobile" | "desktop" = "desktop",
): LighthouseReport {
  return {
    url,
    scores: {
      performance: perf,
      accessibility: 90,
      seo: 85,
      bestPractices: 92,
    },
    coreWebVitals: {
      fcp: { value: 1200, displayValue: "1.2 s" },
      lcp: { value: 2500, displayValue: "2.5 s" },
      tbt: { value: 100, displayValue: "100 ms" },
      cls: { value: 0.05, displayValue: "0.05" },
      tti: { value: 3000, displayValue: "3.0 s" },
    },
    fetchedAt: new Date().toISOString(),
    strategy,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Reset document classes
  document.documentElement.classList.remove("dark");
  document.documentElement.removeAttribute("data-theme");
  localStorage.clear();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Home page", () => {
  // 1. Initial render
  it("renders with dark mode, Desktop strategy, and URL input mode", () => {
    render(<Home />);

    // Title is visible
    expect(screen.getByText("Lighthouse")).toBeInTheDocument();
    expect(screen.getByText("Bulk Reporter")).toBeInTheDocument();

    // Hero subtitle mentions Desktop (appears in both hero and strategy toggle)
    expect(screen.getAllByText("Desktop").length).toBeGreaterThanOrEqual(1);

    // "Enter URLs" tab is rendered and active (has ring-1 class)
    const enterUrlsBtn = screen.getByRole("button", { name: /enter urls/i });
    expect(enterUrlsBtn).toBeInTheDocument();

    // "Upload File" tab is rendered
    const uploadFileBtn = screen.getByRole("button", { name: /upload file/i });
    expect(uploadFileBtn).toBeInTheDocument();

    // URL textarea is visible (from URLInput component)
    expect(screen.getByPlaceholderText(/https:\/\/example\.com/)).toBeInTheDocument();

    // Dark mode toggle button exists
    expect(
      screen.getByRole("button", { name: /switch to light mode/i }),
    ).toBeInTheDocument();
  });

  // 2. Mode switching
  it("switches between URL input and Upload File modes", () => {
    render(<Home />);

    // Initially in URL mode — textarea visible
    expect(screen.getByPlaceholderText(/https:\/\/example\.com/)).toBeInTheDocument();

    // Click "Upload File" tab
    fireEvent.click(screen.getByRole("button", { name: /upload file/i }));

    // Textarea gone, file upload area visible
    expect(screen.queryByPlaceholderText(/https:\/\/example\.com/)).not.toBeInTheDocument();
    expect(screen.getByText(/drop your file here/i)).toBeInTheDocument();

    // Click "Enter URLs" tab to switch back
    fireEvent.click(screen.getByRole("button", { name: /enter urls/i }));

    // Textarea visible again
    expect(screen.getByPlaceholderText(/https:\/\/example\.com/)).toBeInTheDocument();
  });

  // 3. Strategy toggle
  it("toggles between Desktop and Mobile strategy", () => {
    render(<Home />);

    // Default is Desktop — shown in hero and toggle
    expect(screen.getAllByText("Desktop").length).toBeGreaterThanOrEqual(1);

    // The strategy toggle switch
    const toggle = screen.getByRole("switch", {
      name: /switch to mobile analysis/i,
    });
    expect(toggle).toBeInTheDocument();

    // Click to switch to Mobile
    fireEvent.click(toggle);

    // Now subtitle shows Mobile (appears in hero and toggle)
    expect(screen.getAllByText("Mobile").length).toBeGreaterThanOrEqual(1);

    // Toggle label updates
    expect(
      screen.getByRole("switch", { name: /switch to desktop analysis/i }),
    ).toBeInTheDocument();
  });

  // 4. Dark mode toggle
  it("toggles dark/light mode on theme button click", () => {
    render(<Home />);

    const themeBtn = screen.getByRole("button", {
      name: /switch to light mode/i,
    });

    // Click to switch to light mode
    fireEvent.click(themeBtn);

    // Document should have data-theme="light" and no "dark" class
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Button label changed
    const lightBtn = screen.getByRole("button", {
      name: /switch to dark mode/i,
    });

    // Click to switch back to dark mode
    fireEvent.click(lightBtn);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  // 5. Full analysis flow
  it("runs analysis: enter URLs, click Generate, see loading, then results", async () => {
    const report = makeMockReport("https://example.com");

    mockFetchReport.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ lighthouseResult: {} }), 10),
        ),
    );
    mockParseReport.mockReturnValue(report);

    render(<Home />);

    // Type a URL into the textarea
    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/);
    fireEvent.change(textarea, {
      target: { value: "https://example.com" },
    });

    // Click Generate Reports
    const generateBtn = screen.getByRole("button", {
      name: /generate reports/i,
    });
    fireEvent.click(generateBtn);

    // Should see loading progress indicator
    await waitFor(() => {
      expect(screen.getByText(/Processing URLs/i)).toBeInTheDocument();
    });

    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.getByText("Results")).toBeInTheDocument();
    });

    // fetchReport and parseReport should have been called
    expect(mockFetchReport).toHaveBeenCalledWith(
      "https://example.com",
      "desktop",
      expect.any(AbortSignal),
    );
    expect(mockParseReport).toHaveBeenCalled();
  });

  // 6. Cancel mid-analysis
  it("cancels analysis when Cancel button is clicked", async () => {
    // Make fetchReport hang so we can cancel
    mockFetchReport.mockImplementation(
      (_url, _strategy, signal) =>
        new Promise((resolve, reject) => {
          const onAbort = () =>
            reject(new DOMException("The operation was aborted.", "AbortError"));
          if (signal?.aborted) {
            onAbort();
            return;
          }
          signal?.addEventListener("abort", onAbort, { once: true });
        }),
    );

    render(<Home />);

    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/);
    fireEvent.change(textarea, {
      target: { value: "https://example.com\nhttps://example.org" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /generate reports/i }),
    );

    // Wait for loading to appear
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    // Click Cancel
    fireEvent.click(screen.getByText("Cancel"));

    // Loading should eventually disappear (analysis stops)
    await waitFor(() => {
      expect(screen.queryByText(/Processing URLs/i)).not.toBeInTheDocument();
    });
  });

  // 7. Export dropdown works with loaded results
  it("shows export dropdown and triggers export actions", async () => {
    const report = makeMockReport("https://example.com");

    mockFetchReport.mockResolvedValue({ lighthouseResult: {} });
    mockParseReport.mockReturnValue(report);

    render(<Home />);

    // Type URL and generate
    const textarea = screen.getByPlaceholderText(/https:\/\/example\.com/);
    fireEvent.change(textarea, {
      target: { value: "https://example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /generate reports/i }),
    );

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText("Results")).toBeInTheDocument();
    });

    // Export button should be visible
    const exportBtn = screen.getByRole("button", { name: /export/i });
    expect(exportBtn).toBeInTheDocument();

    // Open dropdown
    fireEvent.click(exportBtn);

    // Should see export options
    await waitFor(() => {
      expect(screen.getByText("Export as PDF")).toBeInTheDocument();
    });
    expect(screen.getByText("Export as Excel")).toBeInTheDocument();
    expect(screen.getByText("Export as CSV")).toBeInTheDocument();
    expect(screen.getByText("Export as DOCX")).toBeInTheDocument();

    // Click PDF export
    fireEvent.click(screen.getByText("Export as PDF"));
    expect(exportPDF).toHaveBeenCalled();
  });
});
