ALTER TABLE "teams" ADD COLUMN "intersystems" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "hackspace" "hackspaces";--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "table_number" text;