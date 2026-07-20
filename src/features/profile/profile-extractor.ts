import { profileQuestions } from "./profile-questions";
import {
  getMissingProfileFields,
  profileDraftSchema,
  type RelocationProfileDraft,
} from "./profile-schema";

export type ProfileExtractionInput = {
  story: string;
  existingProfile?: RelocationProfileDraft | null;
  answer?: string;
};

export interface ProfileExtractionModel {
  extract(input: ProfileExtractionInput): Promise<RelocationProfileDraft>;
}

export async function extractRelocationProfile(
  model: ProfileExtractionModel,
  input: ProfileExtractionInput,
) {
  const profile = profileDraftSchema.parse(await model.extract(input));
  const missingFields = getMissingProfileFields(profile);
  const field = missingFields[0];
  return {
    profile,
    missingFields,
    nextQuestion: field ? { field, ...profileQuestions[field] } : null,
  };
}
