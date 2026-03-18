import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FileUpload from "@/components/FileUpload";

// Mock fileParser
const mockParseFile = jest.fn();
jest.mock("@/lib/fileParser", () => ({
  parseFile: (...args: unknown[]) => mockParseFile(...args),
  SUPPORTED_EXTENSIONS: [".xlsx", ".xls", ".csv"],
  SUPPORTED_MIME_TYPES: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ],
}));

jest.mock("@/components/StrategyToggle", () => ({
  __esModule: true,
  default: ({ strategy }: { strategy: string }) => (
    <div data-testid="strategy-toggle">{strategy}</div>
  ),
}));

const defaultProps = {
  onURLsExtracted: jest.fn(),
  onReportsImported: jest.fn(),
  isLoading: false,
  strategy: "desktop" as const,
  setStrategy: jest.fn(),
};

describe("FileUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders file drop zone with expected text", () => {
    render(<FileUpload {...defaultProps} />);
    expect(
      screen.getByText(/drop your file here or click to browse/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/supported formats: .xlsx, .xls, .csv/i)
    ).toBeInTheDocument();
  });

  it("renders drop zone with correct aria-label", () => {
    render(<FileUpload {...defaultProps} />);
    expect(
      screen.getByRole("button", {
        name: /upload a spreadsheet file with urls/i,
      })
    ).toBeInTheDocument();
  });

  it("has a hidden file input that accepts csv/xls/xlsx", () => {
    render(<FileUpload {...defaultProps} />);
    const hiddenInput = document.querySelector('input[type="file"]');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute("accept");
    const accept = hiddenInput?.getAttribute("accept") || "";
    expect(accept).toContain(".csv");
    expect(accept).toContain(".xlsx");
  });

  it("shows parsing state when processing a file", async () => {
    mockParseFile.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ kind: "urls", urls: ["https://a.com"], truncated: false }),
            100
          )
        )
    );

    render(<FileUpload {...defaultProps} />);
    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["url\nhttps://a.com"], "test.csv", {
      type: "text/csv",
    });
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    expect(await screen.findByText(/parsing file/i)).toBeInTheDocument();
  });

  it("calls onURLsExtracted when 'Use These URLs' is clicked after parsing URLs", async () => {
    mockParseFile.mockResolvedValue({
      kind: "urls",
      urls: ["https://example.com", "https://test.com"],
      truncated: false,
    });

    render(<FileUpload {...defaultProps} />);
    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["url\nhttps://example.com"], "test.csv", {
      type: "text/csv",
    });
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    const useButton = await screen.findByText(/use these urls/i);
    fireEvent.click(useButton);

    expect(defaultProps.onURLsExtracted).toHaveBeenCalledWith([
      "https://example.com",
      "https://test.com",
    ]);
  });

  it("shows URL count after parsing", async () => {
    mockParseFile.mockResolvedValue({
      kind: "urls",
      urls: ["https://a.com", "https://b.com"],
      truncated: false,
    });

    render(<FileUpload {...defaultProps} />);
    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["data"], "test.csv", { type: "text/csv" });
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/2 urls found/i)).toBeInTheDocument();
    });
  });

  it("shows error state when parseFile throws", async () => {
    mockParseFile.mockRejectedValue(new Error("Unsupported file format"));

    render(<FileUpload {...defaultProps} />);
    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["data"], "bad.txt", { type: "text/plain" });
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    expect(
      await screen.findByText(/unsupported file format/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it("resets to idle state when 'Try Again' is clicked after error", async () => {
    mockParseFile.mockRejectedValue(new Error("Parse error"));

    render(<FileUpload {...defaultProps} />);
    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["data"], "bad.txt", { type: "text/plain" });
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    const tryAgain = await screen.findByText(/try again/i);
    fireEvent.click(tryAgain);

    expect(
      screen.getByText(/drop your file here or click to browse/i)
    ).toBeInTheDocument();
  });

  it("shows imported reports state when parseFile returns reports", async () => {
    mockParseFile.mockResolvedValue({
      kind: "reports",
      completedReports: [
        {
          url: "https://example.com",
          scores: { performance: 95, accessibility: 88, seo: 90, bestPractices: 80 },
          coreWebVitals: {
            fcp: { value: 1, displayValue: "1 s" },
            lcp: { value: 2, displayValue: "2 s" },
            tbt: { value: 100, displayValue: "100 ms" },
            cls: { value: 0.1, displayValue: "0.1" },
            tti: { value: 3, displayValue: "3 s" },
          },
          fetchedAt: "2026-01-01",
          strategy: "desktop" as const,
          loadedFromFile: true,
        },
      ],
      incompleteUrls: ["https://pending.com"],
    });

    render(<FileUpload {...defaultProps} />);
    const hiddenInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["data"], "report.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    fireEvent.change(hiddenInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(
        screen.getByText(/exported report detected/i)
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/1 completed result to load/i)).toBeInTheDocument();
    expect(
      screen.getByText(/1 site queued for analysis/i)
    ).toBeInTheDocument();
  });

  it("renders strategy toggle in idle state", () => {
    render(<FileUpload {...defaultProps} />);
    expect(screen.getByTestId("strategy-toggle")).toBeInTheDocument();
  });
});
