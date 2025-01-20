CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"displayName" text NOT NULL,
	"email" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
