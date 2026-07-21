import { z } from "zod";

import { residencyPathSchema } from "@/features/profile/profile-schema";

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
      type: z.literal("set_residency_path"),
      residencyPath: residencyPathSchema,
    }),
  }),
]);

export type AssistantModelOutput = z.infer<typeof assistantModelOutputSchema>;
