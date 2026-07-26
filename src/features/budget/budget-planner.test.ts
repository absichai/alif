import { describe, expect, it } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";
import { buildJourney } from "@/features/journey/journey-engine";
import type { RelocationProfile } from "@/features/profile/profile-schema";

import { buildBudgetSummary, formatAedRange } from "./budget-planner";

const profile: RelocationProfile = {
  destinationCode: "AE-DXB",
  stage: "preparing",
  moveTimeframe: "Within two months",
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

describe("budget planner", () => {
  it("sums planning ranges per phase and overall", () => {
    const plan = buildJourney(profile, dubaiPack, new Set());
    const summary = buildBudgetSummary(plan);

    expect(summary.phases.length).toBeGreaterThan(1);
    const phaseMinTotal = summary.phases.reduce(
      (sum, phase) => sum + phase.minAed,
      0,
    );
    expect(phaseMinTotal).toBe(summary.total.minAed);
    expect(summary.total.maxAed).toBeGreaterThan(summary.total.minAed);
    expect(summary.remaining).toEqual(summary.total);
  });

  it("excludes completed steps from the remaining range", () => {
    const plan = buildJourney(
      profile,
      dubaiPack,
      new Set(["residency_route", "document_attestation"]),
    );
    const summary = buildBudgetSummary(plan);

    const attestation = summary.phases
      .flatMap((phase) => phase.lines)
      .find((line) => line.stepId === "document_attestation");
    expect(attestation?.completed).toBe(true);
    expect(summary.remaining.minAed).toBeLessThan(summary.total.minAed);
  });

  it("keeps pet and family costs out of a single profile's budget", () => {
    const plan = buildJourney(profile, dubaiPack, new Set());
    const stepIds = buildBudgetSummary(plan)
      .phases.flatMap((phase) => phase.lines)
      .map((line) => line.stepId);

    expect(stepIds).not.toContain("pet_relocation");
    expect(stepIds).not.toContain("family_sponsorship");
    expect(stepIds).not.toContain("school_enrollment");
  });

  it("formats ranges", () => {
    expect(formatAedRange(100, 400)).toBe("AED 100–400");
    expect(formatAedRange(500, 500)).toBe("AED 500");
    expect(formatAedRange(8000, 40000)).toBe("AED 8,000–40,000");
  });
});
