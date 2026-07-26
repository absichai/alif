import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProposalCard } from "./proposal-card";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("ProposalCard", () => {
  it("shows the computed change and downstream effect", () => {
    render(
      <ProposalCard
        effect={{
          changedFields: ["Residency path → Family sponsorship"],
          addedSteps: ["Map the family sponsorship sequence"],
          removedSteps: [],
        }}
        proposalId="proposal-1"
      />,
    );

    expect(
      screen.getByText("Residency path → Family sponsorship"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Map the family sponsorship sequence/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/will not change your journey until you confirm/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm change" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Keep my journey" }),
    ).toBeEnabled();
  });
});
