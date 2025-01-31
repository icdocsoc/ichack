CREATE TABLE "devices" (
	"device_library_identifier" text PRIMARY KEY NOT NULL,
	"push_token" text NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passes" (
	"serial_number" text PRIMARY KEY NOT NULL,
	"authentication_token" text NOT NULL,
	"pass_type_identifier" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	"back_fields" text[] DEFAULT '{}' NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"qr_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"device_library_identifier" text NOT NULL,
	"serial_number" text NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "registrations_device_library_identifier_serial_number_pk" PRIMARY KEY("device_library_identifier","serial_number")
);
--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_device_library_identifier_devices_device_library_identifier_fk" FOREIGN KEY ("device_library_identifier") REFERENCES "public"."devices"("device_library_identifier") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_serial_number_passes_serial_number_fk" FOREIGN KEY ("serial_number") REFERENCES "public"."passes"("serial_number") ON DELETE no action ON UPDATE no action;