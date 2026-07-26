import { z } from "zod";

export const relocationStageSchema = z.enum(["exploring", "preparing", "arrived"]);
export const residencyPathSchema = z.enum([
  "employment",
  "business_or_self",
  "family_sponsored",
  "unknown",
]);
export const incomeRangeSchema = z.enum([
  "under_10000",
  "10000_19999",
  "20000_34999",
  "35000_49999",
  "50000_plus",
]);

export const householdSchema = z.object({
  relationshipStatus: z.enum(["single", "married"]),
  childrenCount: z.number().int().min(0).max(12),
  movingTogether: z.enum(["together", "staggered", "not_applicable"]),
});

export const profilePreferencesSchema = z.object({
  wantsToDrive: z.boolean().optional(),
  needsSchools: z.boolean().optional(),
  propertyRequiresDistrictCooling: z.boolean().optional(),
});

export const profileDraftSchema = z.object({
  destinationCode: z.literal("AE-DXB").default("AE-DXB"),
  stage: relocationStageSchema.nullable(),
  moveTimeframe: z.string().trim().min(1).max(120).nullable(),
  household: householdSchema.nullable(),
  residencyPath: residencyPathSchema.nullable(),
  passportCountry: z.string().trim().min(2).max(80).nullable(),
  incomeRange: incomeRangeSchema.nullable().default(null),
  preferences: profilePreferencesSchema.default({}),
});

export const relocationProfileSchema = profileDraftSchema.extend({
  stage: relocationStageSchema,
  moveTimeframe: z.string().trim().min(1).max(120),
  household: householdSchema,
  residencyPath: residencyPathSchema,
  passportCountry: z.string().trim().min(2).max(80),
});

export type RelocationProfileDraft = z.infer<typeof profileDraftSchema>;
export type RelocationProfile = z.infer<typeof relocationProfileSchema>;
export type MissingProfileField =
  | "stage"
  | "moveTimeframe"
  | "household"
  | "residencyPath"
  | "passportCountry";

const requiredOrder: MissingProfileField[] = [
  "stage",
  "moveTimeframe",
  "household",
  "residencyPath",
  "passportCountry",
];

export function getMissingProfileFields(
  draft: RelocationProfileDraft,
): MissingProfileField[] {
  return requiredOrder.filter((field) => draft[field] === null);
}

export function finalizeProfile(draft: RelocationProfileDraft) {
  return relocationProfileSchema.safeParse(draft);
}

export const profilePatchSchema = z
  .object({
    stage: relocationStageSchema,
    moveTimeframe: z.string().trim().min(1).max(120),
    household: householdSchema,
    residencyPath: residencyPathSchema,
    passportCountry: z.string().trim().min(2).max(80),
    incomeRange: incomeRangeSchema.nullable(),
    preferences: profilePreferencesSchema,
  })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, {
    message: "At least one profile field is required",
  });

export type RelocationProfilePatch = z.infer<typeof profilePatchSchema>;

export function applyProfilePatch(
  profile: RelocationProfile,
  patch: RelocationProfilePatch,
) {
  return relocationProfileSchema.safeParse({ ...profile, ...patch });
}
