CREATE TABLE "user_auth" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"provider" text NOT NULL,
	"authToken" text NOT NULL,
	"refreshToken" text NOT NULL,
	"subject" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profilePictureUrl" text;--> statement-breakpoint
ALTER TABLE "user_auth" ADD CONSTRAINT "user_auth_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;