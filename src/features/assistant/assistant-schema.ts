import { z } from "zod";

import {
  householdSchema,
  incomeRangeSchema,
  relocationStageSchema,
  residencyPathSchema,
} from "@/features/profile/profile-schema";

// Model-facing patch: every field is required-but-nullable so the schema is
// friendly to strict structured outputs. Null always means "no change".
export const assistantProfilePatchSchema = z.object({
  stage: relocationStageSchema.nullable(),
  moveTimeframe: z.string().trim().min(1).max(120).nullable(),
  household: householdSchema.nullable(),
  residencyPath: residencyPathSchema.nullable(),
  passportCountry: z.string().trim().min(2).max(80).nullable(),
  incomeRange: incomeRangeSchema.nullable(),
  wantsToDrive: z.boolean().nullable(),
  propertyRequiresDistrictCooling: z.boolean().nullable(),
});

export type AssistantProfilePatch = z.infer<typeof assistantProfilePatchSchema>;

export const assistantModelOutputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("answer"),
    message: z.string().min(1).max(1_500),
    citedDefinitionIds: z.array(z.string()).max(5),
  }),
  z.object({
    kind: z.literal("proposal"),
    message: z.string().min(1).max(1_500),
    citedDefinitionIds: z.array(z.string()).max(5),
    change: z.object({
      type: z.literal("update_profile"),
      patch: assistantProfilePatchSchema,
    }),
  }),
]);

export type AssistantModelOutput = z.infer<typeof assistantModelOutputSchema>;
