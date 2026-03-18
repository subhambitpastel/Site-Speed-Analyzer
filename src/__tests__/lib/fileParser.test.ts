import type { ParseUrlsResult, ParseReportsResult } from "@/lib/fileParser";

// Mock xlsx before importing
const mockRead = jest.fn();
const mockSheetToJson = jest.fn();

jest.mock("xlsx", () => ({
  read: (...args: unknown[]) => mockRead(...args),
  utils: {
    sheet_to_json: (...args: unknown[]) => mockSheetToJson(...args),
  },
}));

import {
  parseFile,
  SUPPORTED_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
} from "@/lib/fileParser";

/**
 * Create a File-like object with working arrayBuffer().
 * jsdom's File constructor doesn't always support arrayBuffer() in older environments.
 */
function makeFile(
  name: string,
  size?: number,
  content?: ArrayBuffer,
): File {
  const buffer = content ?? new ArrayBuffer(10);
  const blob = new Blob([buffer], { type: "text/csv" });
  const file = new File([blob], name, { type: "text/csv" });

  // Override size if requested
  if (size !== undefined) {
    Object.defineProperty(file, "size", { value: size, writable: false });
  }

  // Ensure arrayBuffer works in test environment
  if (typeof file.arrayBuffer !== "function") {
    file.arrayBuffer = () => Promise.resolve(buffer);
  }

  return file;
}

function makeWorkbook(sheets: Record<string, unknown>) {
  return {
    SheetNames: Object.keys(sheets),
    Sheets: sheets,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("constants", () => {
  it("exports supported extensions", () => {
    expect(SUPPORTED_EXTENSIONS).toContain(".xlsx");
    expect(SUPPORTED_EXTENSIONS).toContain(".xls");
    expect(SUPPORTED_EXTENSIONS).toContain(".csv");
  });

  it("exports supported MIME types", () => {
    expect(SUPPORTED_MIME_TYPES).toContain("text/csv");
    expect(SUPPORTED_MIME_TYPES).toContain("application/vnd.ms-excel");
  });
});

describe("parseFile", () => {
  it("throws for files exceeding 10 MB", async () => {
    const file = makeFile("big.csv", 11 * 1024 * 1024);
    await expect(parseFile(file)).rejects.toThrow("10 MB size limit");
  });

  it("throws for unsupported file extensions", async () => {
    const file = makeFile("data.txt");
    await expect(parseFile(file)).rejects.toThrow("Unsupported file type");
  });

  it("throws for empty files (zero byte arrayBuffer)", async () => {
    const file = makeFile("empty.csv", 1, new ArrayBuffer(0));
    // Override arrayBuffer to return empty
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(0));

    await expect(parseFile(file)).rejects.toThrow("empty");
  });

  it("throws when xlsx.read fails to parse", async () => {
    mockRead.mockImplementation(() => {
      throw new Error("Parse error");
    });

    const file = makeFile("bad.csv");
    await expect(parseFile(file)).rejects.toThrow("Failed to parse");
  });

  it("throws when workbook has no sheets", async () => {
    mockRead.mockReturnValue({ SheetNames: [], Sheets: {} });

    const file = makeFile("empty.xlsx");
    await expect(parseFile(file)).rejects.toThrow("no sheets");
  });

  it("extracts URLs from a sheet with a URL column header", async () => {
    const sheetData = [
      { URL: "https://example.com", Name: "Example" },
      { URL: "https://test.com", Name: "Test" },
      { URL: "invalid-url", Name: "Bad" },
    ];

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    // First call: isExportedReportSheet check; second call: extractURLsFromSheet
    mockSheetToJson
      .mockReturnValueOnce(sheetData)  // isExportedReportSheet
      .mockReturnValueOnce(sheetData); // extractURLsFromSheet

    const file = makeFile("urls.csv");
    const result = await parseFile(file);

    expect(result.kind).toBe("urls");
    const urlResult = result as ParseUrlsResult;
    expect(urlResult.urls).toContain("https://example.com/");
    expect(urlResult.urls).toContain("https://test.com/");
    // invalid-url should not be included
    expect(urlResult.urls.some((u) => u.includes("invalid-url"))).toBe(false);
  });

  it("scans all cells for URL patterns when no URL header exists", async () => {
    const sheetData = [
      { col1: "Check out https://example.com for info", col2: "nothing" },
      { col1: "text", col2: "Visit http://another.com/page" },
    ];

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)
      .mockReturnValueOnce(sheetData);

    const file = makeFile("data.csv");
    const result = await parseFile(file);

    expect(result.kind).toBe("urls");
    const urlResult = result as ParseUrlsResult;
    expect(urlResult.urls.length).toBe(2);
  });

  it("throws when no valid URLs are found", async () => {
    const sheetData = [{ col1: "no urls here", col2: "just text" }];

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)
      .mockReturnValueOnce(sheetData);

    const file = makeFile("no-urls.csv");
    await expect(parseFile(file)).rejects.toThrow("No valid URLs found");
  });

  it("truncates results beyond 500 URLs and sets truncated flag", async () => {
    const sheetData = Array.from({ length: 600 }, (_, i) => ({
      URL: `https://site${i}.com`,
    }));

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)
      .mockReturnValueOnce(sheetData);

    const file = makeFile("many-urls.csv");
    const result = await parseFile(file);

    expect(result.kind).toBe("urls");
    const urlResult = result as ParseUrlsResult;
    expect(urlResult.urls.length).toBe(500);
    expect(urlResult.truncated).toBe(true);
  });

  it("deduplicates URLs", async () => {
    const sheetData = [
      { URL: "https://example.com" },
      { URL: "https://example.com" },
      { URL: "https://example.com" },
    ];

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)
      .mockReturnValueOnce(sheetData);

    const file = makeFile("dupes.csv");
    const result = await parseFile(file);

    expect(result.kind).toBe("urls");
    const urlResult = result as ParseUrlsResult;
    expect(urlResult.urls.length).toBe(1);
  });
});

describe("parseFile - report detection and resume", () => {
  it("detects an exported report file and returns completed reports", async () => {
    const sheetData = [
      {
        URL: "https://example.com",
        Performance: 92,
        Accessibility: 85,
        SEO: 78,
        "Best Practices": 95,
        FCP: "1.2 s",
        LCP: "2.5 s",
        TBT: "150 ms",
        CLS: "0.05",
        TTI: "3.2 s",
        Strategy: "desktop",
        "Fetched At": "2026-03-18T00:00:00.000Z",
      },
    ];

    mockRead.mockReturnValue(makeWorkbook({ "Lighthouse Report": {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)  // isExportedReportSheet
      .mockReturnValueOnce(sheetData); // parseReportsFromWorkbook

    const file = makeFile("report.xlsx");
    const result = await parseFile(file);

    expect(result.kind).toBe("reports");
    const reportResult = result as ParseReportsResult;
    expect(reportResult.completedReports.length).toBe(1);
    expect(reportResult.completedReports[0].url).toBe("https://example.com/");
    expect(reportResult.completedReports[0].scores.performance).toBe(92);
    expect(reportResult.completedReports[0].loadedFromFile).toBe(true);
    expect(reportResult.completedReports[0].strategy).toBe("desktop");
  });

  it("separates completed and incomplete reports for resume", async () => {
    const sheetData = [
      {
        URL: "https://completed.com",
        Performance: 90,
        Accessibility: 80,
        SEO: 70,
        "Best Practices": 85,
        FCP: "1.0 s",
        LCP: "2.0 s",
        TBT: "100 ms",
        CLS: "0.01",
        TTI: "2.5 s",
        Strategy: "mobile",
        "Fetched At": "2026-03-18T00:00:00.000Z",
      },
      {
        URL: "https://incomplete.com",
        Performance: "",
        Accessibility: "",
        SEO: "",
        "Best Practices": "",
        FCP: "",
        LCP: "",
        TBT: "",
        CLS: "",
        TTI: "",
        Strategy: "",
        "Fetched At": "",
      },
    ];

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)
      .mockReturnValueOnce(sheetData);

    const file = makeFile("resume.csv");
    const result = await parseFile(file);

    expect(result.kind).toBe("reports");
    const reportResult = result as ParseReportsResult;
    expect(reportResult.completedReports.length).toBe(1);
    expect(reportResult.completedReports[0].url).toBe("https://completed.com/");
    expect(reportResult.incompleteUrls.length).toBe(1);
    expect(reportResult.incompleteUrls[0]).toBe("https://incomplete.com/");
  });

  it("skips AVERAGE summary rows", async () => {
    const sheetData = [
      {
        URL: "https://example.com",
        Performance: 90,
        Accessibility: 80,
        SEO: 70,
        "Best Practices": 85,
        FCP: "1.0 s",
        LCP: "2.0 s",
        TBT: "100 ms",
        CLS: "0.01",
        TTI: "2.5 s",
        Strategy: "desktop",
        "Fetched At": "2026-03-18",
      },
      {
        URL: "AVERAGE",
        Performance: 90,
        Accessibility: 80,
        SEO: 70,
        "Best Practices": 85,
        FCP: "",
        LCP: "",
        TBT: "",
        CLS: "",
        TTI: "",
        Strategy: "",
        "Fetched At": "",
      },
    ];

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)
      .mockReturnValueOnce(sheetData);

    const file = makeFile("with-avg.csv");
    const result = await parseFile(file);

    expect(result.kind).toBe("reports");
    const reportResult = result as ParseReportsResult;
    expect(reportResult.completedReports.length).toBe(1);
    expect(reportResult.completedReports[0].url).toBe("https://example.com/");
  });

  it("defaults strategy to desktop when not specified or unrecognized", async () => {
    const sheetData = [
      {
        URL: "https://example.com",
        Performance: 90,
        Accessibility: 80,
        SEO: 70,
        "Best Practices": 85,
        Strategy: "unknown_strategy",
      },
    ];

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)
      .mockReturnValueOnce(sheetData);

    const file = makeFile("strat.csv");
    const result = await parseFile(file);

    expect(result.kind).toBe("reports");
    const reportResult = result as ParseReportsResult;
    expect(reportResult.completedReports[0].strategy).toBe("desktop");
  });

  it("throws when report file has no valid URLs at all", async () => {
    const sheetData = [
      {
        URL: "AVERAGE",
        Performance: 90,
        Accessibility: 80,
        SEO: 70,
        "Best Practices": 85,
      },
    ];

    mockRead.mockReturnValue(makeWorkbook({ Sheet1: {} }));
    mockSheetToJson
      .mockReturnValueOnce(sheetData)
      .mockReturnValueOnce(sheetData);

    const file = makeFile("only-avg.csv");
    await expect(parseFile(file)).rejects.toThrow("No valid URLs found");
  });
});
