ALTER TABLE "subject" DROP CONSTRAINT "subject_slug_unique";--> statement-breakpoint
ALTER TABLE "organization" DROP CONSTRAINT "organization_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'member'::text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('member', 'owner', 'admin');--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."role";--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parent" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "parent" ALTER COLUMN "role" SET DEFAULT 'parent';--> statement-breakpoint
ALTER TABLE "subject" ALTER COLUMN "subject_name" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "class" ADD COLUMN "member_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "is_assigned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subject" ADD COLUMN "member_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "class" ADD CONSTRAINT "class_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject" ADD CONSTRAINT "subject_member_id_member_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "subject" DROP COLUMN "slug";--> statement-breakpoint
ALTER TABLE "subject" DROP COLUMN "class";