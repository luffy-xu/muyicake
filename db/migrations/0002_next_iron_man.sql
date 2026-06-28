CREATE TABLE "cake_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_zh" text NOT NULL,
	"title_en" text NOT NULL,
	"description_zh" text,
	"description_en" text,
	"type" text NOT NULL,
	"cover_image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cake_collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cake_size_options" (
	"id" text PRIMARY KEY NOT NULL,
	"style_id" text,
	"size_label" text NOT NULL,
	"servings_zh" text,
	"servings_en" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'SGD' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cake_style_images" (
	"id" text PRIMARY KEY NOT NULL,
	"style_id" text,
	"image_url" text NOT NULL,
	"alt_zh" text,
	"alt_en" text,
	"image_type" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cake_style_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"style_id" text,
	"section_key" text NOT NULL,
	"title_zh" text NOT NULL,
	"title_en" text NOT NULL,
	"body_zh" text,
	"body_en" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cake_styles" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_id" text,
	"slug" text NOT NULL,
	"name_zh" text NOT NULL,
	"name_en" text NOT NULL,
	"subtitle_zh" text,
	"subtitle_en" text,
	"description_zh" text,
	"description_en" text,
	"main_image_url" text,
	"badge_zh" text,
	"badge_en" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "selected_collection_id" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "selected_style_id" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "selected_style_name" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "selected_size_option_id" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "selected_size_label" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "selected_price" integer;--> statement-breakpoint
ALTER TABLE "cake_size_options" ADD CONSTRAINT "cake_size_options_style_id_cake_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."cake_styles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cake_style_images" ADD CONSTRAINT "cake_style_images_style_id_cake_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."cake_styles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cake_style_sections" ADD CONSTRAINT "cake_style_sections_style_id_cake_styles_id_fk" FOREIGN KEY ("style_id") REFERENCES "public"."cake_styles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cake_styles" ADD CONSTRAINT "cake_styles_collection_id_cake_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."cake_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cake_styles_collection_slug_unique" ON "cake_styles" USING btree ("collection_id","slug");