import { render, screen } from "@testing-library/react";
import LoadingSpinner from "@/components/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders an SVG element", () => {
    render(<LoadingSpinner />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("has aria-label 'Loading'", () => {
    render(<LoadingSpinner />);
    const svg = screen.getByLabelText("Loading");
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  it("renders with default medium size", () => {
    render(<LoadingSpinner />);
    const svg = screen.getByLabelText("Loading");
    expect(svg).toHaveAttribute("width", "28");
    expect(svg).toHaveAttribute("height", "28");
  });

  it("renders with small size", () => {
    render(<LoadingSpinner size="sm" />);
    const svg = screen.getByLabelText("Loading");
    expect(svg).toHaveAttribute("width", "18");
    expect(svg).toHaveAttribute("height", "18");
  });

  it("renders with large size", () => {
    render(<LoadingSpinner size="lg" />);
    const svg = screen.getByLabelText("Loading");
    expect(svg).toHaveAttribute("width", "44");
    expect(svg).toHaveAttribute("height", "44");
  });

  it("renders two circle elements (track + arc)", () => {
    const { container } = render(<LoadingSpinner />);
    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
  });

  it("has the spinner-rotate class for animation", () => {
    render(<LoadingSpinner />);
    const svg = screen.getByLabelText("Loading");
    expect(svg).toHaveClass("spinner-rotate");
  });

  it("has correct viewBox for each size", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByLabelText("Loading")).toHaveAttribute(
      "viewBox",
      "0 0 18 18"
    );

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByLabelText("Loading")).toHaveAttribute(
      "viewBox",
      "0 0 28 28"
    );

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByLabelText("Loading")).toHaveAttribute(
      "viewBox",
      "0 0 44 44"
    );
  });

  it("applies inline-block class", () => {
    render(<LoadingSpinner />);
    const svg = screen.getByLabelText("Loading");
    expect(svg).toHaveClass("inline-block");
  });
});
