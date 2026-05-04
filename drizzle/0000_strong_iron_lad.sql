CREATE TABLE IF NOT EXISTS "day_posts" (
	"date" date PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sentences" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"order_index" integer NOT NULL,
	"text" text NOT NULL,
	"audio_url" text,
	"study_info" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sentences" ADD CONSTRAINT "sentences_date_day_posts_date_fk" FOREIGN KEY ("date") REFERENCES "public"."day_posts"("date") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
