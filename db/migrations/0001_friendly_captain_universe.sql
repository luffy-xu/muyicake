CREATE TABLE "customers" (
	"whatsapp_key" text PRIMARY KEY NOT NULL,
	"whatsapp_display" text NOT NULL,
	"name" text NOT NULL,
	"first_reservation_id" text,
	"latest_reservation_id" text,
	"reservation_count" integer DEFAULT 0 NOT NULL,
	"completed_reservation_count" integer DEFAULT 0 NOT NULL,
	"cancelled_reservation_count" integer DEFAULT 0 NOT NULL,
	"total_quoted_base_price" integer DEFAULT 0 NOT NULL,
	"preferred_delivery_area" text,
	"preferred_product_category" text,
	"last_status" text,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
