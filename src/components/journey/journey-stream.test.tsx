import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dubaiPack } from "@/data/destinations/dubai/pack";
import { buildJourney } from "@/features/journey/journey-engine";

import { JourneyStream } from "./journey-stream";

describe("JourneyStream", () => {
  it("labels the next chapter and uses an ordered journey", () => {
    const plan = buildJourney(
      {
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
      },
      dubaiPack,
      new Set(),
    );
    render(<JourneyStream plan={plan} />);
    expect(screen.getByText("Your next chapter")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Your Dubai journey" }),
    ).toBeInTheDocument();
  });
});
