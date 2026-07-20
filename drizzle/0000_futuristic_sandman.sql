CREATE TYPE "public"."journey_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."journey_step_state" AS ENUM('completed', 'current', 'available', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('pending', 'confirmed', 'rejected', 'expired');--> statement-breakpoint
CREATE TABLE "assistant_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journey_id" uuid NOT NULL,
	"journey_version" integer NOT NULL,
	"proposal_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "proposal_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journey_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journey_id" uuid NOT NULL,
	"definition_id" text NOT NULL,
	"milestone_key" text NOT NULL,
	"position" integer NOT NULL,
	"state" "journey_step_state" NOT NULL,
	"completed_at" timestamp with time zone,
	"personal_note" text
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"destination_pack_version" text NOT NULL,
	"status" "journey_status" DEFAULT 'active' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key_hash" text PRIMARY KEY NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relocation_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"destination_code" text NOT NULL,
	"stage" text NOT NULL,
	"move_timeframe" text NOT NULL,
	"household" jsonb NOT NULL,
	"residency_path" text NOT NULL,
	"passport_country" text NOT NULL,
	"income_range" text,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assistant_proposals" ADD CONSTRAINT "assistant_proposals_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_steps" ADD CONSTRAINT "journey_steps_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journeys" ADD CONSTRAINT "journeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relocation_profiles" ADD CONSTRAINT "relocation_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assistant_proposals_journey_idx" ON "assistant_proposals" USING btree ("journey_id");--> statement-breakpoint
CREATE UNIQUE INDEX "journey_steps_definition_uq" ON "journey_steps" USING btree ("journey_id","definition_id");--> statement-breakpoint
CREATE INDEX "journey_steps_journey_position_idx" ON "journey_steps" USING btree ("journey_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "journeys_active_user_uq" ON "journeys" USING btree ("user_id") WHERE "journeys"."status" = 'active';--> statement-breakpoint
CREATE INDEX "journeys_user_id_idx" ON "journeys" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_id_uq" ON "relocation_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_uq" ON "users" USING btree ("clerk_user_id");