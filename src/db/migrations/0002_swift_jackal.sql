ALTER TABLE "class" ADD COLUMN "limit" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "parent" ADD COLUMN "student_ids" text[] NOT NULL;