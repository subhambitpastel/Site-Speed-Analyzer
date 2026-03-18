import type { LighthouseReport } from "@/types/report";

// Mock docx module - use a ref object so the hoisted jest.mock can access it
const mockToBlobRef = { fn: jest.fn() };

jest.mock("docx", () => {
  const createClass = (name: string) =>
    jest.fn().mockImplementation(function (this: Record<string, unknown>, props: unknown) {
      this._type = name;
      this._props = props;
      return this;
    });

  return {
    Document: createClass("Document"),
    Packer: {
      get toBlob() {
        return mockToBlobRef.fn;
      },
    },
    Paragraph: createClass("Paragraph"),
    Table: createClass("Table"),
    TableRow: createClass("TableRow"),
    TableCell: createClass("TableCell"),
    TextRun: createClass("TextRun"),
    HeadingLevel: { HEADING_2: "Heading2" },
    AlignmentType: { CENTER: "center", LEFT: "left", RIGHT: "right" },
    WidthType: { DXA: "dxa", PERCENTAGE: "pct" },
    BorderStyle: { SINGLE: "single" },
    ShadingType: { CLEAR: "clear" },
    PageNumber: { CURRENT: "CURRENT" },
    Footer: createClass("Footer"),
    Header: createClass("Header"),
    Tab: createClass("Tab"),
    TabStopPosition: { MAX: 9026 },
    TabStopType: { RIGHT: "right" },
    VerticalAlignTable: { CENTER: "center" },
    PageBreak: createClass("PageBreak"),
  };
});

// file-saver is already mocked in jest.setup.ts
import { saveAs } from "file-saver";
import { exportDOCX } from "@/lib/exportDOCX";

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

beforeEach(() => {
  jest.clearAllMocks();
  mockToBlobRef.fn = jest.fn().mockResolvedValue(new Blob(["mock-docx"]));
});

describe("exportDOCX", () => {
  it("calls Packer.toBlob and saveAs with correct filename", async () => {
    exportDOCX([makeReport()]);

    // Wait for the async Packer.toBlob promise chain
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockToBlobRef.fn).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringMatching(/^lighthouse-report-\d{4}-\d{2}-\d{2}\.docx$/)
    );
  });

  it("does nothing when reports array is empty", async () => {
    exportDOCX([]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockToBlobRef.fn).not.toHaveBeenCalled();
    expect(saveAs).not.toHaveBeenCalled();
  });

  it("does nothing when all reports have empty URLs", async () => {
    exportDOCX([makeReport({ url: "" }), makeReport({ url: "  " })]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockToBlobRef.fn).not.toHaveBeenCalled();
  });

  it("generates document for reports that include errors (incomplete)", async () => {
    const reports = [
      makeReport(),
      makeReport({
        url: "https://error-site.com",
        error: "Timeout",
        scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
      }),
    ];
    exportDOCX(reports);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockToBlobRef.fn).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalled();
  });

  it("passes a Document instance to Packer.toBlob", async () => {
    exportDOCX([makeReport()]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const docArg = mockToBlobRef.fn.mock.calls[0][0];
    expect(docArg).toBeDefined();
    expect(docArg._type).toBe("Document");
  });

  it("handles multiple reports", async () => {
    const reports = [
      makeReport({ url: "https://a.com" }),
      makeReport({ url: "https://b.com" }),
    ];
    exportDOCX(reports);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockToBlobRef.fn).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalledTimes(1);
  });

  it("handles Packer.toBlob failure gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockToBlobRef.fn = jest.fn().mockRejectedValue(new Error("Pack failed"));

    exportDOCX([makeReport()]);

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to export DOCX:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
