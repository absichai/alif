import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";
import { buildJourney } from "@/features/journey/journey-engine";
import type { RelocationProfile } from "@/features/profile/profile-schema";

import { NextStepCard } from "./next-step-card";

const profile: RelocationProfile = {
  destinationCode: "AE-DXB",
  stage: "exploring",
  moveTimeframe: "Within six months",
  household: {
    relationshipStatus: "single",
    childrenCount: 0,
    movingTogether: "not_applicable",
  },
  residencyPath: "employment",
  passportCountry: "France",
  incomeRange: null,
  preferences: {},
};

describe("NextStepCard", () => {
  it("highlights the current step and what it unlocks", () => {
    const plan = buildJourney(profile, dubaiPack, new Set());
    render(<NextStepCard plan={plan} />);

    expect(screen.getByText("Your next meaningful step")).toBeInTheDocument();
    expect(
      screen.getByText("Choose the residency route that fits your plans"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Completing it unlocks/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Weekly reminders/ }),
    ).toHaveAttribute("href", "/api/journey/calendar");
  });

  it("celebrates a fully completed journey", () => {
    const plan = buildJourney(profile, dubaiPack, new Set());
    const completed = buildJourney(profile, dubaiPack, new Set(plan.stepIds));
    render(<NextStepCard plan={completed} />);

    expect(screen.getByText("Journey complete")).toBeInTheDocument();
  });
});
