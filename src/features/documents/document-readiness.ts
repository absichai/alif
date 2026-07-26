import { z } from "zod";

import type { JourneyPlan } from "@/features/journey/journey-types";

export const documentStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "ready",
]);

export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export type RequiredDocument = {
  key: string;
  label: string;
  note?: string;
  neededFor: { stepId: string; stepTitle: string }[];
};

export type DocumentReadinessItem = RequiredDocument & {
  status: DocumentStatus;
};

export function collectRequiredDocuments(plan: JourneyPlan): RequiredDocument[] {
  const byKey = new Map<string, RequiredDocument>();
  for (const stepId of plan.stepIds) {
    const step = plan.stepsById[stepId];
    if (!step) continue;
    for (const document of step.requiredDocuments) {
      const existing = byKey.get(document.key);
      if (existing) {
        existing.neededFor.push({ stepId: step.id, stepTitle: step.title });
        if (!existing.note && document.note) existing.note = document.note;
      } else {
        byKey.set(document.key, {
          key: document.key,
          label: document.label,
          note: document.note,
          neededFor: [{ stepId: step.id, stepTitle: step.title }],
        });
      }
    }
  }
  return [...byKey.values()];
}

export function mergeDocumentStatuses(
  documents: RequiredDocument[],
  statuses: Map<string, DocumentStatus>,
): DocumentReadinessItem[] {
  return documents.map((document) => ({
    ...document,
    status: statuses.get(document.key) ?? "not_started",
  }));
}
