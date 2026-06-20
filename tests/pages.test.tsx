import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LearnerHome from "@/app/pages/learner/Home";
import SessionSummary from "@/app/pages/learner/SessionSummary";
import Onboarding from "@/app/onboarding/Onboarding";
import { DataContext, emptyUserBundle } from "@/lib/data";

const wrap = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("LearnerHome", () => {
  it("renders greeting and stat row from mock (no backend configured)", () => {
    wrap(<LearnerHome />);
    expect(screen.getByText(/Good morning, Daniel/)).toBeInTheDocument();
    expect(screen.getByText("Your learning path")).toBeInTheDocument();
    expect(screen.getByText("74")).toBeInTheDocument(); // understanding stat
    expect(screen.getByText("1 / 5")).toBeInTheDocument(); // path progress
  });
});

describe("LearnerHome (new signed-in user)", () => {
  it("shows onboarding empty state, never the demo data", () => {
    render(
      <MemoryRouter>
        <DataContext.Provider value={emptyUserBundle("Ada Lovelace", "ada@analytical.dev")}>
          <LearnerHome />
        </DataContext.Provider>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Good morning, Ada/)).toBeInTheDocument();
    expect(screen.getByText("Start with your first document")).toBeInTheDocument();
    // demo data must not leak through
    expect(screen.queryByText(/Daniel/)).not.toBeInTheDocument();
    expect(screen.queryByText("Resume session")).not.toBeInTheDocument();
    expect(screen.queryByText("Data protection & GDPR")).not.toBeInTheDocument();
  });
});

describe("Onboarding", () => {
  it("opens on step 1 — create your workspace", () => {
    wrap(<Onboarding />);
    expect(screen.getByText("Create your workspace")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Acme Inc.")).toBeInTheDocument();
  });
});

describe("SessionSummary", () => {
  it("renders the score and topic breakdown", () => {
    wrap(<SessionSummary />);
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Solid grasp. Well done.")).toBeInTheDocument();
    expect(screen.getByText("Topic breakdown")).toBeInTheDocument();
    expect(screen.getByText("Retention windows")).toBeInTheDocument();
  });
});
