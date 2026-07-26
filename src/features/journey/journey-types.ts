import { z } from "zod";

import type { RelocationProfile } from "@/features/profile/profile-schema";

export const journeyPhaseSchema = z.enum([
  "right_now",
  "before_move",
  "arrival",
  "first_month",
  "feeling_home",
]);

export const journeyCategorySchema = z.enum([
  "planning",
  "identity",
  "home",
  "money_mobility",
  "family_daily_life",
]);

export const stepDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  milestoneKey: z.string().regex(/^[a-z0-9_]+$/),
  phase: journeyPhaseSchema,
  category: journeyCategorySchema,
  title: z.string().min(4),
  summary: z.string().min(10),
  whyItMatters: z.string().min(10),
  prerequisites: z.array(z.string()),
  applicability: z
    .object({
      stages: z.array(z.enum(["exploring", "preparing", "arrived"])).optional(),
      minimumChildren: z.number().int().min(0).optional(),
      marriedOnly: z.boolean().optional(),
      residencyPaths: z
        .array(
          z.enum([
            "employment",
            "business_or_self",
            "family_sponsored",
            "unknown",
          ]),
        )
        .optional(),
      preference: z
        .object({
          key: z.enum([
            "wantsToDrive",
            "needsSchools",
            "propertyRequiresDistrictCooling",
            "hasPets",
          ]),
          value: z.boolean(),
        })
        .optional(),
    })
    .default({}),
  officialSource: z
    .object({
      organization: z.string(),
      url: z.string().url(),
      lastVerifiedAt: z.string().date(),
    })
    .nullable(),
  serviceType: z.string().nullable().default(null),
  requiredDocuments: z
    .array(
      z.object({
        key: z.string().regex(/^[a-z0-9_]+$/),
        label: z.string().min(3),
        note: z.string().optional(),
      }),
    )
    .default([]),
});

export const destinationPackSchema = z.object({
  destinationCode: z.string(),
  version: z.string(),
  definitions: z.array(stepDefinitionSchema).min(1),
});

export type StepDefinition = z.infer<typeof stepDefinitionSchema>;
export type StepDefinitionInput = z.input<typeof stepDefinitionSchema>;
export type DestinationPack = z.infer<typeof destinationPackSchema>;
export type JourneyStepState = "completed" | "current" | "available" | "blocked";

export type JourneyStep = StepDefinition & {
  state: JourneyStepState;
  blockedBy: string[];
};

export type JourneyMilestone = {
  key: string;
  title: string;
  phase: StepDefinition["phase"];
  category: StepDefinition["category"];
  state: JourneyStepState;
  steps: JourneyStep[];
};

export type JourneyPlan = {
  destinationCode: string;
  packVersion: string;
  stepIds: string[];
  stepsById: Record<string, JourneyStep>;
  milestones: JourneyMilestone[];
  progress: { completed: number; total: number };
};

export type ApplicabilityContext = RelocationProfile;
