import type { JourneyPlan } from "@/features/journey/journey-types";
import type { RelocationProfile } from "@/features/profile/profile-schema";

export type StoredJourney = {
  id: string;
  userId: string;
  version: number;
  profile: RelocationProfile;
  completedDefinitionIds: string[];
};

export type StoredProposal = {
  id: string;
  journeyId: string;
  journeyVersion: number;
  proposalType: "set_residency_path";
  payload: { residencyPath: RelocationProfile["residencyPath"] };
  status: "pending" | "confirmed" | "rejected" | "expired";
  expiresAt: Date;
};

export interface JourneyRepository {
  deleteUserData(clerkUserId: string): Promise<void>;
  createOrReplace(input: {
    clerkUserId: string;
    profile: RelocationProfile;
    plan: JourneyPlan;
  }): Promise<StoredJourney>;
  findActiveByClerkUserId(clerkUserId: string): Promise<StoredJourney | null>;
  setStepCompleted(input: {
    clerkUserId: string;
    definitionId: string;
    completed: boolean;
    nextPlan: JourneyPlan;
  }): Promise<StoredJourney>;
  createProposal(input: {
    clerkUserId: string;
    journeyVersion: number;
    proposalType: "set_residency_path";
    payload: { residencyPath: RelocationProfile["residencyPath"] };
    expiresAt: Date;
  }): Promise<StoredProposal>;
  findProposalForOwner(input: {
    clerkUserId: string;
    proposalId: string;
  }): Promise<StoredProposal | null>;
  markProposal(input: {
    clerkUserId: string;
    proposalId: string;
    status: "confirmed" | "rejected" | "expired";
  }): Promise<void>;
  applyResidencyPathProposal(input: {
    clerkUserId: string;
    proposalId: string;
    expectedJourneyVersion: number;
    profile: RelocationProfile;
    nextPlan: JourneyPlan;
  }): Promise<StoredJourney>;
  replaceProfileAndPlan(input: {
    clerkUserId: string;
    expectedJourneyVersion: number;
    profile: RelocationProfile;
    nextPlan: JourneyPlan;
  }): Promise<StoredJourney>;
}
