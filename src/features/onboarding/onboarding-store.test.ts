import { beforeEach, describe, expect, it } from "vitest";

import {
  clearOnboardingDraft,
  readOnboardingDraft,
  writeOnboardingDraft,
} from "./onboarding-store";

describe("onboarding session store", () => {
  beforeEach(() => sessionStorage.clear());

  it("round-trips a valid draft without localStorage", () => {
    writeOnboardingDraft({
      mode: "story",
      story: "I may move to Dubai in September.",
      profile: null,
    });

    expect(readOnboardingDraft()?.mode).toBe("story");
    expect(window.localStorage.length).toBe(0);
  });

  it("clears the draft", () => {
    writeOnboardingDraft({ mode: "guided", story: "", profile: null });
    clearOnboardingDraft();
    expect(readOnboardingDraft()).toBeNull();
  });

  it("ignores malformed session data", () => {
    sessionStorage.setItem("alif.onboarding.v1", "{not-json");
    expect(readOnboardingDraft()).toBeNull();
  });
});
