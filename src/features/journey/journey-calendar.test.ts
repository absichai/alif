import { describe, expect, it } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";
import type { RelocationProfile } from "@/features/profile/profile-schema";

import { buildJourneyCalendar, nextMonday, upcomingSteps } from "./journey-calendar";
import { buildJourney } from "./journey-engine";

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

describe("journey calendar", () => {
  it("emits weekly all-day events for current and available steps", () => {
    const plan = buildJourney(
      profile,
      dubaiPack,
      new Set(["residency_route", "move_budget"]),
    );
    const calendar = buildJourneyCalendar(plan, {
      start: new Date("2026-07-27T00:00:00Z"),
      maxEvents: 3,
    });

    expect(calendar).toContain("BEGIN:VCALENDAR");
    expect(calendar).toContain("DTSTART;VALUE=DATE:20260727");
    expect(calendar).toContain("DTSTART;VALUE=DATE:20260803");
    expect(calendar).toContain("DTSTART;VALUE=DATE:20260810");
    expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(3);
    expect(calendar).toContain("SUMMARY:ALIF");
    expect(calendar.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("keeps blocked and completed steps out of the export", () => {
    const plan = buildJourney(profile, dubaiPack, new Set(["residency_route"]));
    const steps = upcomingSteps(plan);

    expect(steps.every((step) => step.state !== "blocked")).toBe(true);
    expect(steps.every((step) => step.state !== "completed")).toBe(true);
  });

  it("computes the next Monday in UTC", () => {
    expect(nextMonday(new Date("2026-07-26T10:00:00Z")).toISOString()).toBe(
      "2026-07-27T00:00:00.000Z",
    );
    expect(nextMonday(new Date("2026-07-27T10:00:00Z")).toISOString()).toBe(
      "2026-08-03T00:00:00.000Z",
    );
  });
});
