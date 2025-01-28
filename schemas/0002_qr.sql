CREATE TABLE "qr" (
	"user_id" text PRIMARY KEY NOT NULL,
	"uuid" text NOT NULL,
	CONSTRAINT "qr_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
ALTER TABLE "qr" ADD CONSTRAINT "qr_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;