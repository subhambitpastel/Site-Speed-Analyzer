import { render, screen, fireEvent } from "@testing-library/react";
import URLInput from "@/components/URLInput";

// Mock dependencies
jest.mock("@/lib/urlValidator", () => ({
  sanitizeAndValidate: jest.fn((input: string) => {
    const lines = input
      .split("\n")
      .map((l: string) => l.trim())
      .filter(Boolean);
    const valid = lines.filter((l: string) => l.startsWith("https://"));
    const invalid = lines.filter((l: string) => !l.startsWith("https://"));
    return { valid, invalid };
  }),
}));

jest.mock("@/components/StrategyToggle", () => {
  return {
    __esModule: true,
    default: ({ strategy }: { strategy: string }) => (
      <div data-testid="strategy-toggle">{strategy}</div>
    ),
  };
});

const defaultProps = {
  onSubmit: jest.fn(),
  isLoading: false,
  strategy: "desktop" as const,
  setStrategy: jest.fn(),
};

describe("URLInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders textarea and submit button", () => {
    render(<URLInput {...defaultProps} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate reports/i })
    ).toBeInTheDocument();
  });

  it("renders with placeholder text", () => {
    render(<URLInput {...defaultProps} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("placeholder");
  });

  it("submit button is disabled when textarea is empty", () => {
    render(<URLInput {...defaultProps} />);
    const button = screen.getByRole("button", { name: /generate reports/i });
    expect(button).toBeDisabled();
  });

  it("submit button is enabled when textarea has content", () => {
    render(<URLInput {...defaultProps} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "https://example.com" },
    });
    const button = screen.getByRole("button", { name: /generate reports/i });
    expect(button).not.toBeDisabled();
  });

  it("calls onSubmit with parsed valid URLs on form submit", () => {
    render(<URLInput {...defaultProps} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "https://example.com\nhttps://test.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /generate reports/i })
    );
    expect(defaultProps.onSubmit).toHaveBeenCalledWith([
      "https://example.com",
      "https://test.com",
    ]);
  });

  it("shows invalid URLs when validation fails", () => {
    render(<URLInput {...defaultProps} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "https://example.com\nnot-a-url" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /generate reports/i })
    );
    expect(screen.getByText("not-a-url")).toBeInTheDocument();
    expect(
      screen.getByText(/the following urls are invalid/i)
    ).toBeInTheDocument();
  });

  it("disables textarea and button during loading", () => {
    render(<URLInput {...defaultProps} isLoading={true} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /generating reports/i })
    ).toBeDisabled();
  });

  it("shows 'Generating Reports...' text when loading", () => {
    render(<URLInput {...defaultProps} isLoading={true} />);
    expect(screen.getByText("Generating Reports...")).toBeInTheDocument();
  });

  it("renders StrategyToggle with correct strategy", () => {
    render(<URLInput {...defaultProps} strategy="mobile" />);
    expect(screen.getByTestId("strategy-toggle")).toHaveTextContent("mobile");
  });

  it("does not call onSubmit when only invalid URLs are entered", () => {
    render(<URLInput {...defaultProps} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "not-a-url" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /generate reports/i })
    );
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});
