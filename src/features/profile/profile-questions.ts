import type { MissingProfileField } from "./profile-schema";

export const profileQuestions: Record<
  MissingProfileField,
  { prompt: string; helper: string }
> = {
  stage: {
    prompt: "Where are you in your Dubai journey?",
    helper: "Choose exploring, preparing to move, or already arrived.",
  },
  moveTimeframe: {
    prompt: "When are you hoping to move?",
    helper: "An approximate month or timeframe is enough.",
  },
  household: {
    prompt: "Who will be making the move?",
    helper:
      "Tell us whether you are single or married, whether you have children, and whether everyone moves together.",
  },
  residencyPath: {
    prompt: "How do you expect to obtain UAE residency?",
    helper:
      "Employment, business or self-sponsorship, family sponsorship, or not sure yet.",
  },
  passportCountry: {
    prompt: "Which country issued your passport?",
    helper: "Some document and entry requirements depend on the issuing country.",
  },
};
