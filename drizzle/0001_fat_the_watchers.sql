CREATE TYPE "public"."document_status" AS ENUM('not_started', 'in_progress', 'ready');--> statement-breakpoint
CREATE TABLE "document_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document_key" text NOT NULL,
	"status" "document_status" DEFAULT 'not_started' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "document_checks" ADD CONSTRAINT "document_checks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "document_checks_user_document_uq" ON "document_checks" USING btree ("user_id","document_key");