import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlifLogo } from "./alif-logo";

describe("AlifLogo", () => {
  it("exposes an accessible ALIF label", () => {
    render(<AlifLogo />);
    expect(screen.getByRole("img", { name: "ALIF" })).toBeInTheDocument();
  });
});
