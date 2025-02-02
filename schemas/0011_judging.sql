CREATE TABLE "judging" (
	"category" text PRIMARY KEY NOT NULL,
	"hackspace" "hackspaces"
);
--> statement-breakpoint
ALTER TABLE "judging" ADD CONSTRAINT "judging_category_categories_slug_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("slug") ON DELETE no action ON UPDATE no action;