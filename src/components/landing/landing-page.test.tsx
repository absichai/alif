import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LandingPage } from "./landing-page";

describe("LandingPage", () => {
  it("leads with the journey instead of a checklist", () => {
    render(<LandingPage />);
    expect(
      screen.getByRole("heading", {
        name: "Your move is more than a checklist.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Build my Dubai journey/ }),
    ).toHaveAttribute("href", "/start");
  });
});
