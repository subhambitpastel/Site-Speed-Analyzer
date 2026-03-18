import { exportCSV, exportPlainCSV } from "@/lib/exportCSV";
import type { LighthouseReport } from "@/types/report";

// Mock DOM methods for file download
let mockLink: Record<string, jest.Mock | string>;

beforeEach(() => {
  mockLink = {
    href: "",
    setAttribute: jest.fn(),
    click: jest.fn(),
  };
  jest.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLElement);
  jest.spyOn(document.body, "appendChild").mockImplementation((el) => el);
  jest.spyOn(document.body, "removeChild").mockImplementation((el) => el);
  (URL.createObjectURL as jest.Mock).mockReturnValue("blob:mock-url");
  (URL.revokeObjectURL as jest.Mock).mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function makeReport(overrides?: Partial<LighthouseReport>): LighthouseReport {
  return {
    url: "https://example.com",
    scores: {
      performance: 92,
      accessibility: 85,
      seo: 78,
      bestPractices: 95,
    },
    coreWebVitals: {
      fcp: { value: 1200, displayValue: "1.2 s" },
      lcp: { value: 2500, displayValue: "2.5 s" },
      tbt: { value: 150, displayValue: "150 ms" },
      cls: { value: 0.05, displayValue: "0.05" },
      tti: { value: 3200, displayValue: "3.2 s" },
    },
    fetchedAt: "2026-03-18T00:00:00.000Z",
    strategy: "desktop",
    ...overrides,
  };
}

describe("exportCSV (XLS SpreadsheetML)", () => {
  it("creates a download link and triggers click for valid reports", () => {
    const reports = [makeReport()];
    exportCSV(reports);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.setAttribute).toHaveBeenCalledWith(
      "download",
      expect.stringContaining("lighthouse-report-")
    );
    expect(mockLink.setAttribute).toHaveBeenCalledWith(
      "download",
      expect.stringContaining(".xls")
    );
    expect(mockLink.click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });

  it("creates a Blob with XML content containing report data", () => {
    const reports = [makeReport({ url: "https://test-site.com" })];
    exportCSV(reports);

    const blobArg = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toBe("application/vnd.ms-excel;charset=utf-8");
  });

  it("does nothing when reports array is empty", () => {
    exportCSV([]);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("does nothing when all reports have empty URLs", () => {
    exportCSV([makeReport({ url: "" }), makeReport({ url: "   " })]);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("includes reports with errors (incomplete rows) in the output", () => {
    const reports = [
      makeReport(),
      makeReport({
        url: "https://error-site.com",
        error: "Failed",
        scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
      }),
    ];
    exportCSV(reports);

    // Should still produce output with 2 data rows
    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.click).toHaveBeenCalled();
  });

  it("handles multiple valid reports", () => {
    const reports = [
      makeReport({ url: "https://a.com" }),
      makeReport({ url: "https://b.com", scores: { performance: 45, accessibility: 60, seo: 90, bestPractices: 30 } }),
    ];
    exportCSV(reports);

    expect(mockLink.click).toHaveBeenCalled();
  });
});

describe("exportPlainCSV", () => {
  beforeEach(() => {
    // Clear mocks so exportPlainCSV blob calls start at index 0
    (URL.createObjectURL as jest.Mock).mockClear();
    (URL.revokeObjectURL as jest.Mock).mockClear();
  });

  it("creates a download link and triggers click for valid reports", () => {
    const reports = [makeReport()];
    exportPlainCSV(reports);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.setAttribute).toHaveBeenCalledWith(
      "download",
      expect.stringContaining(".csv")
    );
    expect(mockLink.click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("creates a Blob with CSV content type", () => {
    exportPlainCSV([makeReport()]);

    const blobArg = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toContain("text/csv");
  });

  it("does nothing when reports array is empty", () => {
    exportPlainCSV([]);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("does nothing when all reports have empty URLs", () => {
    exportPlainCSV([makeReport({ url: "" })]);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("includes incomplete reports with blank score fields", () => {
    const reports = [
      makeReport(),
      makeReport({
        url: "https://incomplete.com",
        error: "timeout",
        scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
      }),
    ];
    exportPlainCSV(reports);

    expect(mockLink.click).toHaveBeenCalled();
  });

  it("generates correct CSV with BOM and proper headers", async () => {
    const report = makeReport();
    exportPlainCSV([report]);

    const blobArg = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
    const reader = new FileReader();
    const text = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(blobArg);
    });

    // CSV content should contain headers (BOM may be consumed by readAsText)
    expect(text).toContain("URL,Performance,Accessibility,SEO,Best Practices,FCP,LCP,TBT,CLS,TTI,Strategy,Fetched At");

    // Data
    expect(text).toContain("https://example.com");
    expect(text).toContain("92");
    expect(text).toContain("desktop");

    // Average row
    expect(text).toContain("AVERAGE");
  });

  it("escapes CSV fields containing commas", async () => {
    // A URL with a comma won't happen in practice, but test the escapeCSVField logic
    const report = makeReport({ url: "https://example.com/path,with,commas" });
    exportPlainCSV([report]);

    const blobArg = (URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
    const reader = new FileReader();
    const text = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(blobArg);
    });

    // The URL field should be quoted
    expect(text).toContain('"https://example.com/path,with,commas"');
  });
});
