import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/ui/Button";
import { Badge, ProgressBar, ScoreRing, Stat } from "@/ui/data";
import { cn } from "@/lib/utils";

describe("cn / twMerge custom tokens", () => {
  it("keeps a custom text color when combined with a custom font-size", () => {
    // Regression: text-bg (color) used to be dropped by text-label (font-size).
    expect(cn("text-bg", "text-label")).toContain("text-bg");
    expect(cn("text-bg", "text-label")).toContain("text-label");
  });
  it("still de-dupes within the same group", () => {
    expect(cn("text-ink", "text-soft")).toBe("text-soft");
  });
});

describe("Button", () => {
  it("renders primary with the dark-on-light token retained", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn.className).toContain("bg-ink");
    expect(btn.className).toContain("text-bg"); // not stripped by text-label
  });
  it("applies the secondary variant", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button", { name: "Cancel" }).className).toContain("border-border");
  });
});

describe("data primitives", () => {
  it("ScoreRing shows the rounded value and label", () => {
    render(<ScoreRing value={82} label="understanding" />);
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("understanding")).toBeInTheDocument();
  });

  it("ProgressBar clamps width to 0–100", () => {
    const { container, rerender } = render(<ProgressBar value={150} />);
    const bar = () => container.querySelector("[style]") as HTMLElement;
    expect(bar().style.width).toBe("100%");
    rerender(<ProgressBar value={-20} />);
    expect(bar().style.width).toBe("0%");
  });

  it("Badge renders its content", () => {
    render(<Badge tone="ink">Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("Stat renders label, value and hint", () => {
    render(<Stat label="Understanding" value={74} hint="across your work" />);
    expect(screen.getByText("Understanding")).toBeInTheDocument();
    expect(screen.getByText("74")).toBeInTheDocument();
    expect(screen.getByText("across your work")).toBeInTheDocument();
  });
});
