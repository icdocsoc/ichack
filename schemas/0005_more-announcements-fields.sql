ALTER TABLE "announcements" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "location" text NOT NULL;--> statement-breakpoint
ALTER TABLE "announcements" ADD COLUMN "message_id" bigint;