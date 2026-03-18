import type { LighthouseReport } from "@/types/report";

// Mock jspdf-autotable before importing the module
const mockAutoTable = jest.fn();
jest.mock("jspdf-autotable", () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockAutoTable(...args),
}));

const mockSave = jest.fn();
const mockText = jest.fn();
const mockSetFontSize = jest.fn();
const mockSetTextColor = jest.fn();
const mockSetFillColor = jest.fn();
const mockSetDrawColor = jest.fn();
const mockSetLineWidth = jest.fn();
const mockRect = jest.fn();
const mockRoundedRect = jest.fn();
const mockLine = jest.fn();
const mockAddPage = jest.fn();
const mockSetPage = jest.fn();
const mockGetNumberOfPages = jest.fn().mockReturnValue(1);

jest.mock("jspdf", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      save: mockSave,
      text: mockText,
      setFontSize: mockSetFontSize,
      setTextColor: mockSetTextColor,
      setFillColor: mockSetFillColor,
      setDrawColor: mockSetDrawColor,
      setLineWidth: mockSetLineWidth,
      rect: mockRect,
      roundedRect: mockRoundedRect,
      line: mockLine,
      addPage: mockAddPage,
      setPage: mockSetPage,
      getNumberOfPages: mockGetNumberOfPages,
      internal: {
        pageSize: {
          getWidth: () => 297,
          getHeight: () => 210,
        },
      },
      lastAutoTable: { finalY: 120 },
      previousAutoTable: { finalY: 120 },
    })),
  };
});

// Import after mocking
import { exportPDF } from "@/lib/exportPDF";

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
  mockGetNumberOfPages.mockReturnValue(1);
});

describe("exportPDF", () => {
  it("creates a PDF and calls save with correct filename", () => {
    const reports = [makeReport()];
    exportPDF(reports);

    expect(mockSave).toHaveBeenCalledWith(
      expect.stringMatching(/^lighthouse-report-\d{4}-\d{2}-\d{2}\.pdf$/)
    );
  });

  it("calls autoTable twice (scores table + vitals table)", () => {
    const reports = [makeReport()];
    exportPDF(reports);

    expect(mockAutoTable).toHaveBeenCalledTimes(2);
  });

  it("does nothing when there are no valid reports", () => {
    const reports = [
      makeReport({
        error: "Failed",
        scores: { performance: 0, accessibility: 0, seo: 0, bestPractices: 0 },
      }),
    ];
    exportPDF(reports);

    expect(mockSave).not.toHaveBeenCalled();
  });

  it("does nothing when reports array is empty", () => {
    exportPDF([]);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("renders title and subtitle text", () => {
    exportPDF([makeReport()]);

    expect(mockText).toHaveBeenCalledWith(
      "Lighthouse Performance Report",
      expect.any(Number),
      expect.any(Number)
    );
  });

  it("renders summary score boxes with roundedRect", () => {
    exportPDF([makeReport()]);

    // 4 average boxes, each with fill + stroke = 8 calls
    expect(mockRoundedRect).toHaveBeenCalledTimes(8);
  });

  it("draws header bar on first page", () => {
    exportPDF([makeReport()]);

    // Header bar consists of two rect calls (main bar + accent stripe)
    expect(mockRect).toHaveBeenCalled();
  });

  it("sets up footers on all pages", () => {
    mockGetNumberOfPages.mockReturnValue(2);
    exportPDF([makeReport()]);

    expect(mockSetPage).toHaveBeenCalledWith(1);
    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it("handles multiple reports", () => {
    const reports = [
      makeReport({ url: "https://a.com" }),
      makeReport({ url: "https://b.com" }),
      makeReport({ url: "https://c.com" }),
    ];
    exportPDF(reports);

    expect(mockSave).toHaveBeenCalled();
    expect(mockAutoTable).toHaveBeenCalledTimes(2);

    // Check score table body has 3 rows
    const scoreTableCall = mockAutoTable.mock.calls[0][1];
    expect(scoreTableCall.body).toHaveLength(3);
  });

  it("passes correct column headers to autoTable", () => {
    exportPDF([makeReport()]);

    const scoreTableCall = mockAutoTable.mock.calls[0][1];
    expect(scoreTableCall.head[0]).toEqual(["URL", "Perf", "A11y", "SEO", "BP"]);

    const vitalsTableCall = mockAutoTable.mock.calls[1][1];
    expect(vitalsTableCall.head[0]).toEqual([
      "URL", "FCP", "LCP", "TBT", "CLS", "TTI", "Strategy",
    ]);
  });

  it("truncates long URLs in the table body", () => {
    const longUrl = "https://example.com/" + "a".repeat(50);
    exportPDF([makeReport({ url: longUrl })]);

    const scoreTableCall = mockAutoTable.mock.calls[0][1];
    const urlCell = scoreTableCall.body[0][0];
    expect(urlCell.length).toBeLessThanOrEqual(50);
    expect(urlCell).toContain("...");
  });
});
