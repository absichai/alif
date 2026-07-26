import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const journeyStatus = pgEnum("journey_status", ["active", "archived"]);
export const journeyStepState = pgEnum("journey_step_state", [
  "completed",
  "current",
  "available",
  "blocked",
]);
export const proposalStatus = pgEnum("proposal_status", [
  "pending",
  "confirmed",
  "rejected",
  "expired",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("users_clerk_user_id_uq").on(table.clerkUserId)],
);

export const relocationProfiles = pgTable(
  "relocation_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    destinationCode: text("destination_code").notNull(),
    stage: text("stage").notNull(),
    moveTimeframe: text("move_timeframe").notNull(),
    household: jsonb("household").notNull(),
    residencyPath: text("residency_path").notNull(),
    passportCountry: text("passport_country").notNull(),
    incomeRange: text("income_range"),
    preferences: jsonb("preferences").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("profiles_user_id_uq").on(table.userId)],
);

export const journeys = pgTable(
  "journeys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    destinationPackVersion: text("destination_pack_version").notNull(),
    status: journeyStatus("status").notNull().default("active"),
    version: integer("version").notNull().default(1),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("journeys_active_user_uq")
      .on(table.userId)
      .where(sql`${table.status} = 'active'`),
    index("journeys_user_id_idx").on(table.userId),
  ],
);

export const journeySteps = pgTable(
  "journey_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    definitionId: text("definition_id").notNull(),
    milestoneKey: text("milestone_key").notNull(),
    position: integer("position").notNull(),
    state: journeyStepState("state").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    personalNote: text("personal_note"),
  },
  (table) => [
    uniqueIndex("journey_steps_definition_uq").on(
      table.journeyId,
      table.definitionId,
    ),
    index("journey_steps_journey_position_idx").on(
      table.journeyId,
      table.position,
    ),
  ],
);

export const assistantProposals = pgTable(
  "assistant_proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    journeyVersion: integer("journey_version").notNull(),
    proposalType: text("proposal_type").notNull(),
    payload: jsonb("payload").notNull(),
    status: proposalStatus("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("assistant_proposals_journey_idx").on(table.journeyId)],
);

export const documentStatus = pgEnum("document_status", [
  "not_started",
  "in_progress",
  "ready",
]);

export const documentChecks = pgTable(
  "document_checks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    documentKey: text("document_key").notNull(),
    status: documentStatus("status").notNull().default("not_started"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("document_checks_user_document_uq").on(
      table.userId,
      table.documentKey,
    ),
  ],
);

export const rateLimits = pgTable("rate_limits", {
  keyHash: text("key_hash").primaryKey(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
