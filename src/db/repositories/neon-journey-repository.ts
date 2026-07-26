import "server-only";

import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db/client";
import {
  assistantProposals,
  journeySteps,
  journeys,
  relocationProfiles,
  users,
} from "@/db/schema";
import {
  profilePatchSchema,
  relocationProfileSchema,
  residencyPathSchema,
  type RelocationProfile,
} from "@/features/profile/profile-schema";

import type {
  JourneyRepository,
  StoredJourney,
  StoredProposal,
} from "./journey-repository";
import { toJourneyStepRows } from "./journey-row-mapper";

const patchPayloadSchema = z.object({ patch: profilePatchSchema });

// Rows written before proposals were generalized carry a bare residency path.
const legacyPayloadSchema = z.object({ residencyPath: residencyPathSchema });

function mapProposal(row: typeof assistantProposals.$inferSelect): StoredProposal {
  const payload =
    row.proposalType === "set_residency_path"
      ? { patch: { residencyPath: legacyPayloadSchema.parse(row.payload).residencyPath } }
      : patchPayloadSchema.parse(row.payload);

  return {
    id: row.id,
    journeyId: row.journeyId,
    journeyVersion: row.journeyVersion,
    proposalType: "update_profile",
    payload,
    status: row.status,
    expiresAt: row.expiresAt,
  };
}

export class NeonJourneyRepository implements JourneyRepository {
  async deleteUserData(clerkUserId: string): Promise<void> {
    const db = getDb();
    await db.delete(users).where(eq(users.clerkUserId, clerkUserId));
  }

  async createOrReplace(input: {
    clerkUserId: string;
    profile: RelocationProfile;
    plan: Parameters<typeof toJourneyStepRows>[1];
  }): Promise<StoredJourney> {
    const db = getDb();

    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ clerkUserId: input.clerkUserId })
        .onConflictDoUpdate({
          target: users.clerkUserId,
          set: { updatedAt: new Date() },
        })
        .returning({ id: users.id });
      if (!user) throw new Error("Failed to create or load user");

      await tx
        .insert(relocationProfiles)
        .values({
          userId: user.id,
          destinationCode: input.profile.destinationCode,
          stage: input.profile.stage,
          moveTimeframe: input.profile.moveTimeframe,
          household: input.profile.household,
          residencyPath: input.profile.residencyPath,
          passportCountry: input.profile.passportCountry,
          incomeRange: input.profile.incomeRange,
          preferences: input.profile.preferences,
        })
        .onConflictDoUpdate({
          target: relocationProfiles.userId,
          set: {
            destinationCode: input.profile.destinationCode,
            stage: input.profile.stage,
            moveTimeframe: input.profile.moveTimeframe,
            household: input.profile.household,
            residencyPath: input.profile.residencyPath,
            passportCountry: input.profile.passportCountry,
            incomeRange: input.profile.incomeRange,
            preferences: input.profile.preferences,
            updatedAt: new Date(),
          },
        });

      await tx
        .update(journeys)
        .set({ status: "archived", updatedAt: new Date() })
        .where(and(eq(journeys.userId, user.id), eq(journeys.status, "active")));

      const [journey] = await tx
        .insert(journeys)
        .values({
          userId: user.id,
          destinationPackVersion: input.plan.packVersion,
        })
        .returning({ id: journeys.id });
      if (!journey) throw new Error("Failed to create journey");

      const stepRows = toJourneyStepRows(journey.id, input.plan);
      if (stepRows.length > 0) await tx.insert(journeySteps).values(stepRows);
    });

    const stored = await this.findActiveByClerkUserId(input.clerkUserId);
    if (!stored) throw new Error("Created journey could not be loaded");
    return stored;
  }

  async findActiveByClerkUserId(clerkUserId: string): Promise<StoredJourney | null> {
    const db = getDb();
    const ownerPredicate = and(
      eq(users.clerkUserId, clerkUserId),
      eq(journeys.userId, users.id),
      eq(journeys.status, "active"),
    );

    const [row] = await db
      .select({
        journeyId: journeys.id,
        userId: users.id,
        version: journeys.version,
        destinationCode: relocationProfiles.destinationCode,
        stage: relocationProfiles.stage,
        moveTimeframe: relocationProfiles.moveTimeframe,
        household: relocationProfiles.household,
        residencyPath: relocationProfiles.residencyPath,
        passportCountry: relocationProfiles.passportCountry,
        incomeRange: relocationProfiles.incomeRange,
        preferences: relocationProfiles.preferences,
      })
      .from(journeys)
      .innerJoin(users, eq(journeys.userId, users.id))
      .innerJoin(relocationProfiles, eq(relocationProfiles.userId, users.id))
      .where(ownerPredicate)
      .limit(1);

    if (!row) return null;

    const completed = await db
      .select({ definitionId: journeySteps.definitionId })
      .from(journeySteps)
      .where(
        and(
          eq(journeySteps.journeyId, row.journeyId),
          eq(journeySteps.state, "completed"),
        ),
      );

    return {
      id: row.journeyId,
      userId: row.userId,
      version: row.version,
      profile: relocationProfileSchema.parse({
        destinationCode: row.destinationCode,
        stage: row.stage,
        moveTimeframe: row.moveTimeframe,
        household: row.household,
        residencyPath: row.residencyPath,
        passportCountry: row.passportCountry,
        incomeRange: row.incomeRange,
        preferences: row.preferences,
      }),
      completedDefinitionIds: completed.map((item) => item.definitionId),
    };
  }

  async setStepCompleted(
    input: Parameters<JourneyRepository["setStepCompleted"]>[0],
  ): Promise<StoredJourney> {
    const db = getDb();

    await db.transaction(async (tx) => {
      const ownerPredicate = and(
        eq(users.clerkUserId, input.clerkUserId),
        eq(journeys.userId, users.id),
        eq(journeys.status, "active"),
      );
      const [ownedJourney] = await tx
        .select({
          id: journeys.id,
          version: journeys.version,
        })
        .from(journeys)
        .innerJoin(users, eq(journeys.userId, users.id))
        .where(ownerPredicate)
        .limit(1);
      if (!ownedJourney) throw new Error("Journey not found");

      const requestedStep = input.nextPlan.stepsById[input.definitionId];
      if (!requestedStep) throw new Error(`Unknown journey step ${input.definitionId}`);

      // Upsert instead of update: journeys created before a pack expansion
      // have no rows for newly added definitions, and a plain UPDATE would
      // silently drop their progress while still reporting success.
      const rows = toJourneyStepRows(ownedJourney.id, input.nextPlan);
      if (rows.length > 0) {
        await tx
          .insert(journeySteps)
          .values(rows)
          .onConflictDoUpdate({
            target: [journeySteps.journeyId, journeySteps.definitionId],
            set: {
              state: sql`excluded.state`,
              milestoneKey: sql`excluded.milestone_key`,
              position: sql`excluded.position`,
            },
          });
      }

      await tx
        .update(journeySteps)
        .set({ completedAt: input.completed ? new Date() : null })
        .where(
          and(
            eq(journeySteps.journeyId, ownedJourney.id),
            eq(journeySteps.definitionId, input.definitionId),
          ),
        );

      await tx
        .update(journeys)
        .set({
          version: ownedJourney.version + 1,
          destinationPackVersion: input.nextPlan.packVersion,
          updatedAt: new Date(),
        })
        .where(eq(journeys.id, ownedJourney.id));
    });

    const stored = await this.findActiveByClerkUserId(input.clerkUserId);
    if (!stored) throw new Error("Updated journey could not be loaded");
    return stored;
  }

  async createProposal(
    input: Parameters<JourneyRepository["createProposal"]>[0],
  ): Promise<StoredProposal> {
    const db = getDb();
    const ownerPredicate = and(
      eq(users.clerkUserId, input.clerkUserId),
      eq(journeys.userId, users.id),
      eq(journeys.status, "active"),
    );
    const [ownedJourney] = await db
      .select({ id: journeys.id, version: journeys.version })
      .from(journeys)
      .innerJoin(users, eq(journeys.userId, users.id))
      .where(ownerPredicate)
      .limit(1);

    if (!ownedJourney || ownedJourney.version !== input.journeyVersion) {
      throw new Error("Journey changed before proposal creation");
    }

    const [proposal] = await db
      .insert(assistantProposals)
      .values({
        journeyId: ownedJourney.id,
        journeyVersion: input.journeyVersion,
        proposalType: input.proposalType,
        payload: input.payload,
        expiresAt: input.expiresAt,
      })
      .returning();
    if (!proposal) throw new Error("Failed to create proposal");
    return mapProposal(proposal);
  }

  async findProposalForOwner(
    input: Parameters<JourneyRepository["findProposalForOwner"]>[0],
  ): Promise<StoredProposal | null> {
    const db = getDb();
    const [row] = await db
      .select({ proposal: assistantProposals })
      .from(assistantProposals)
      .innerJoin(journeys, eq(assistantProposals.journeyId, journeys.id))
      .innerJoin(users, eq(journeys.userId, users.id))
      .where(
        and(
          eq(assistantProposals.id, input.proposalId),
          eq(journeys.status, "active"),
          eq(users.clerkUserId, input.clerkUserId),
        ),
      )
      .limit(1);
    return row ? mapProposal(row.proposal) : null;
  }

  async markProposal(
    input: Parameters<JourneyRepository["markProposal"]>[0],
  ): Promise<void> {
    const db = getDb();
    await db.transaction(async (tx) => {
      const [owned] = await tx
        .select({ id: assistantProposals.id })
        .from(assistantProposals)
        .innerJoin(journeys, eq(assistantProposals.journeyId, journeys.id))
        .innerJoin(users, eq(journeys.userId, users.id))
        .where(
          and(
            eq(assistantProposals.id, input.proposalId),
            eq(journeys.status, "active"),
            eq(users.clerkUserId, input.clerkUserId),
          ),
        )
        .limit(1);
      if (!owned) throw new Error("Proposal not found");
      await tx
        .update(assistantProposals)
        .set({ status: input.status })
        .where(eq(assistantProposals.id, owned.id));
    });
  }

  async replaceProfileAndPlan(
    input: Parameters<JourneyRepository["replaceProfileAndPlan"]>[0],
  ): Promise<StoredJourney> {
    const db = getDb();

    await db.transaction(async (tx) => {
      const [owned] = await tx
        .select({
          journeyId: journeys.id,
          userId: users.id,
          journeyVersion: journeys.version,
        })
        .from(journeys)
        .innerJoin(users, eq(journeys.userId, users.id))
        .where(
          and(
            eq(users.clerkUserId, input.clerkUserId),
            eq(journeys.status, "active"),
            eq(journeys.version, input.expectedJourneyVersion),
          ),
        )
        .limit(1);

      if (!owned) throw new Error("Journey changed before the profile update");

      await tx
        .update(relocationProfiles)
        .set({
          destinationCode: input.profile.destinationCode,
          stage: input.profile.stage,
          moveTimeframe: input.profile.moveTimeframe,
          household: input.profile.household,
          residencyPath: input.profile.residencyPath,
          passportCountry: input.profile.passportCountry,
          incomeRange: input.profile.incomeRange,
          preferences: input.profile.preferences,
          updatedAt: new Date(),
        })
        .where(eq(relocationProfiles.userId, owned.userId));

      await tx
        .delete(journeySteps)
        .where(eq(journeySteps.journeyId, owned.journeyId));
      const rows = toJourneyStepRows(owned.journeyId, input.nextPlan);
      if (rows.length > 0) await tx.insert(journeySteps).values(rows);

      const bumped = await tx
        .update(journeys)
        .set({
          version: owned.journeyVersion + 1,
          destinationPackVersion: input.nextPlan.packVersion,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(journeys.id, owned.journeyId),
            eq(journeys.version, owned.journeyVersion),
          ),
        )
        .returning({ id: journeys.id });
      if (bumped.length === 0) {
        throw new Error("Journey changed before the profile update");
      }
    });

    const stored = await this.findActiveByClerkUserId(input.clerkUserId);
    if (!stored) throw new Error("Updated journey could not be loaded");
    return stored;
  }

  async applyProfileProposal(
    input: Parameters<JourneyRepository["applyProfileProposal"]>[0],
  ): Promise<StoredJourney> {
    const db = getDb();

    await db.transaction(async (tx) => {
      const [owned] = await tx
        .select({
          proposal: assistantProposals,
          journeyId: journeys.id,
          userId: users.id,
          journeyVersion: journeys.version,
        })
        .from(assistantProposals)
        .innerJoin(journeys, eq(assistantProposals.journeyId, journeys.id))
        .innerJoin(users, eq(journeys.userId, users.id))
        .where(
          and(
            eq(assistantProposals.id, input.proposalId),
            eq(assistantProposals.status, "pending"),
            gt(assistantProposals.expiresAt, new Date()),
            eq(journeys.status, "active"),
            eq(journeys.version, input.expectedJourneyVersion),
            eq(users.clerkUserId, input.clerkUserId),
          ),
        )
        .limit(1);

      if (!owned || owned.journeyVersion !== input.expectedJourneyVersion) {
        throw new Error("Proposal is stale or unavailable");
      }

      await tx
        .update(relocationProfiles)
        .set({
          destinationCode: input.profile.destinationCode,
          stage: input.profile.stage,
          moveTimeframe: input.profile.moveTimeframe,
          household: input.profile.household,
          residencyPath: input.profile.residencyPath,
          passportCountry: input.profile.passportCountry,
          incomeRange: input.profile.incomeRange,
          preferences: input.profile.preferences,
          updatedAt: new Date(),
        })
        .where(eq(relocationProfiles.userId, owned.userId));

      await tx
        .delete(journeySteps)
        .where(eq(journeySteps.journeyId, owned.journeyId));
      const rows = toJourneyStepRows(owned.journeyId, input.nextPlan);
      if (rows.length > 0) await tx.insert(journeySteps).values(rows);

      const bumped = await tx
        .update(journeys)
        .set({
          version: owned.journeyVersion + 1,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(journeys.id, owned.journeyId),
            eq(journeys.version, owned.journeyVersion),
          ),
        )
        .returning({ id: journeys.id });
      if (bumped.length === 0) {
        throw new Error("Proposal is stale or unavailable");
      }

      await tx
        .update(assistantProposals)
        .set({ status: "confirmed" })
        .where(
          and(
            eq(assistantProposals.id, input.proposalId),
            eq(assistantProposals.status, "pending"),
          ),
        );
    });

    const stored = await this.findActiveByClerkUserId(input.clerkUserId);
    if (!stored) throw new Error("Updated journey could not be loaded");
    return stored;
  }
}

export const neonJourneyRepository = new NeonJourneyRepository();
