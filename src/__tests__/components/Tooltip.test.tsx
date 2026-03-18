import { render, screen, fireEvent, act } from "@testing-library/react";
import Tooltip, { InfoIcon } from "@/components/Tooltip";

describe("Tooltip", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders children", () => {
    render(
      <Tooltip text="Help text">
        <span>Trigger</span>
      </Tooltip>
    );
    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });

  it("does not show tooltip content initially", () => {
    render(
      <Tooltip text="Help text">
        <span>Trigger</span>
      </Tooltip>
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip content on mouse enter after delay", async () => {
    render(
      <Tooltip text="Help text">
        <span>Trigger</span>
      </Tooltip>
    );
    const trigger = screen.getByText("Trigger").closest("span[tabindex]")!;

    fireEvent.mouseEnter(trigger);

    // Tooltip appears after 150ms delay
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Help text")).toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", () => {
    render(
      <Tooltip text="Help text">
        <span>Trigger</span>
      </Tooltip>
    );
    const trigger = screen.getByText("Trigger").closest("span[tabindex]")!;

    fireEvent.mouseEnter(trigger);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus", () => {
    render(
      <Tooltip text="Help text">
        <span>Trigger</span>
      </Tooltip>
    );
    const trigger = screen.getByText("Trigger").closest("span[tabindex]")!;

    fireEvent.focus(trigger);
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("hides tooltip on blur", () => {
    render(
      <Tooltip text="Help text">
        <span>Trigger</span>
      </Tooltip>
    );
    const trigger = screen.getByText("Trigger").closest("span[tabindex]")!;

    fireEvent.focus(trigger);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("applies custom className to trigger wrapper", () => {
    render(
      <Tooltip text="Help text" className="custom-class">
        <span>Trigger</span>
      </Tooltip>
    );
    const trigger = screen.getByText("Trigger").closest("span[tabindex]");
    expect(trigger).toHaveClass("custom-class");
  });

  it("trigger has tabIndex=0 for keyboard accessibility", () => {
    render(
      <Tooltip text="Help text">
        <span>Trigger</span>
      </Tooltip>
    );
    const trigger = screen.getByText("Trigger").closest("span[tabindex]");
    expect(trigger).toHaveAttribute("tabindex", "0");
  });
});

describe("InfoIcon", () => {
  it("renders an SVG", () => {
    const { container } = render(<InfoIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("has the inline-block class", () => {
    const { container } = render(<InfoIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("inline-block");
  });
});
