DO $$ BEGIN
 CREATE TYPE "public"."user_roles" AS ENUM('god', 'admin', 'hacker', 'sponsor', 'volunteer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"pin_until" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sponsor_company" (
	"user_id" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"role" "user_roles" NOT NULL,
	"photos_opt_out" boolean DEFAULT false NOT NULL,
	"dietary_restrictions" text[] DEFAULT '{}'::text[] NOT NULL,
	"allergies" text[] DEFAULT '{}'::text[] NOT NULL,
	"pronouns" text,
	"meals" boolean[] DEFAULT '{false,false,false}'::boolean[] NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"title" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"image" text NOT NULL,
	"short_description" text NOT NULL,
	"long_description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"title" text PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"public" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_invites" (
	"team_id" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "team_invites_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" text NOT NULL,
	"sponsor_category" text,
	"docsoc_category" text,
	"leader" text NOT NULL,
	"submission_link" text,
	"phone" text NOT NULL,
	"phone2" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_team" (
	"user_id" text PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sponsor_company" ADD CONSTRAINT "sponsor_company_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token" ADD CONSTRAINT "token_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_sponsor_category_categories_title_fk" FOREIGN KEY ("sponsor_category") REFERENCES "public"."categories"("title") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_docsoc_category_categories_title_fk" FOREIGN KEY ("docsoc_category") REFERENCES "public"."categories"("title") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teams" ADD CONSTRAINT "teams_leader_users_id_fk" FOREIGN KEY ("leader") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_team" ADD CONSTRAINT "user_team_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_team" ADD CONSTRAINT "user_team_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
