CREATE TYPE "public"."token_type" AS ENUM('forgot_password', 'registration_link');--> statement-breakpoint
CREATE TYPE "public"."user_roles" AS ENUM('god', 'admin', 'hacker', 'volunteer');--> statement-breakpoint
CREATE TYPE "public"."gender_types" AS ENUM('Male', 'Female', 'Non-binary', 'Other', 'N/A');--> statement-breakpoint
CREATE TYPE "public"."t_shirt_sizes" AS ENUM('S', 'M', 'L', 'XL', '2XL');--> statement-breakpoint
CREATE TYPE "public"."year_of_study" AS ENUM('Undergraduate Year 1', 'Undergraduate Year 2', 'Undergraduate Year 3', 'Undergraduate Year 4', 'Undergraduate Year 5', 'Undergraduate Year 6', 'Graduated', 'Postgraduate');--> statement-breakpoint
CREATE TYPE "public"."location_enum" AS ENUM('HXLY', 'JCR', 'SCR', 'QTR', 'QLWN', 'HBAR', 'ICME', 'GRHL', 'SF', 'HF', 'H308', 'H311', 'H340', 'CLR');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"pin_until" timestamp
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"type" "token_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"role" "user_roles" NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"owner" text NOT NULL,
	"image" text NOT NULL,
	"short_description" text NOT NULL,
	"long_description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"name" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsor_company" (
	"user_id" text PRIMARY KEY NOT NULL,
	"company_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demograph" (
	"id" serial PRIMARY KEY NOT NULL,
	"gender" "gender_types",
	"university" text,
	"course_of_study" text,
	"year_of_study" "year_of_study",
	"t_shirt_size" "t_shirt_sizes" NOT NULL,
	"age" integer
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"public" boolean NOT NULL,
	"locations" "location_enum"[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"photos_opt_out" boolean NOT NULL,
	"dietary_restrictions" text[] NOT NULL,
	"pronouns" text,
	"meals" boolean[] DEFAULT '{false,false,false}' NOT NULL,
	"cv_uploaded" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_invites" (
	"team_id" integer NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"user_id" text PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"is_leader" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_name" text NOT NULL,
	"sponsor_category" text,
	"docsoc_category" text,
	"submission_link" text,
	"phone" text,
	"phone2" text
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token" ADD CONSTRAINT "token_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_owner_companies_name_fk" FOREIGN KEY ("owner") REFERENCES "public"."companies"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor_company" ADD CONSTRAINT "sponsor_company_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sponsor_company" ADD CONSTRAINT "sponsor_company_company_name_companies_name_fk" FOREIGN KEY ("company_name") REFERENCES "public"."companies"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_sponsor_category_categories_slug_fk" FOREIGN KEY ("sponsor_category") REFERENCES "public"."categories"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_docsoc_category_categories_slug_fk" FOREIGN KEY ("docsoc_category") REFERENCES "public"."categories"("slug") ON DELETE no action ON UPDATE no action;