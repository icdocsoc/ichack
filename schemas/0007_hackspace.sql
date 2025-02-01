CREATE TYPE "public"."hackspaces" AS ENUM('jcr', 'qtr', 'scr');--> statement-breakpoint
CREATE TABLE "challenges" (
	"name" text PRIMARY KEY NOT NULL,
	"qtr" integer DEFAULT 0 NOT NULL,
	"scr" integer DEFAULT 0 NOT NULL,
	"jcr" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_hackspace" (
	"user_id" text PRIMARY KEY NOT NULL,
	"hackspace" "hackspaces" NOT NULL,
	"points" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_hackspace" ADD CONSTRAINT "user_hackspace_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;