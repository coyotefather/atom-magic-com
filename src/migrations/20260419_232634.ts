import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_additional_scores_additional_calculations_calculation_type" AS ENUM('sum', 'difference', 'multiply', 'divide');
  CREATE TYPE "public"."enum_additional_scores_calculation" AS ENUM('sum', 'difference', 'multiply', 'divide');
  CREATE TYPE "public"."enum_creatures_challenge_level" AS ENUM('harmless', 'trivial', 'easy', 'moderate', 'hard', 'deadly');
  CREATE TYPE "public"."enum_timeline_icon" AS ENUM('person', 'people', 'map', 'waves', 'mountain', 'swords', 'shield', 'tree', 'bird', 'wolf', 'snake', 'fire', 'poison', 'hammer', 'atom', 'nuke');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "entries_card_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"detail_name" varchar,
  	"detail_description" varchar
  );
  
  CREATE TABLE "entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"author_id" integer,
  	"main_image_id" integer,
  	"category_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"description" varchar,
  	"toc" jsonb,
  	"entry_body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cultures_aspects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"aspect_name" varchar,
  	"aspect_id" varchar,
  	"aspect_content_slug" varchar,
  	"aspect_description" jsonb
  );
  
  CREATE TABLE "cultures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"entry_id" integer,
  	"main_image_id" integer,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "paths_modifiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"modifier_subscore_id" integer NOT NULL,
  	"modifier_value" numeric
  );
  
  CREATE TABLE "paths" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"latin" varchar,
  	"slug" varchar,
  	"main_image_id" integer,
  	"description" jsonb,
  	"category_id" integer,
  	"toc" jsonb,
  	"entry_body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "disciplines" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"main_image_id" integer,
  	"description" jsonb,
  	"category_id" integer,
  	"toc" jsonb,
  	"entry_body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "disciplines_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"paths_id" integer,
  	"techniques_id" integer
  );
  
  CREATE TABLE "techniques" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"latin" varchar,
  	"slug" varchar,
  	"main_image_id" integer,
  	"cooldown" numeric,
  	"description" jsonb,
  	"category_id" integer,
  	"toc" jsonb,
  	"entry_body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "patronages_effects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"title_latin" varchar,
  	"entry_id" integer,
  	"description" jsonb
  );
  
  CREATE TABLE "patronages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"title_latin" varchar,
  	"epithet" varchar,
  	"epithet_latin" varchar,
  	"entry_id" integer,
  	"main_image_id" integer,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "scores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"score_id" varchar,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"subscore_id" varchar,
  	"score_id" integer,
  	"default_value" numeric,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "additional_scores_additional_calculations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"calculation_type" "enum_additional_scores_additional_calculations_calculation_type",
  	"value" numeric
  );
  
  CREATE TABLE "additional_scores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"entry_id" integer,
  	"calculation" "enum_additional_scores_calculation" NOT NULL,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "additional_scores_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"scores_id" integer,
  	"subscores_id" integer
  );
  
  CREATE TABLE "creatures_attacks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"damage" varchar
  );
  
  CREATE TABLE "creatures_special_abilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "creatures_environments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"environment" varchar
  );
  
  CREATE TABLE "creatures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"main_image_id" integer,
  	"physical" numeric DEFAULT 10,
  	"interpersonal" numeric DEFAULT 10,
  	"intellect" numeric DEFAULT 10,
  	"psyche" numeric DEFAULT 10,
  	"health" numeric,
  	"physical_shield" numeric,
  	"psychic_shield" numeric,
  	"armor_capacity" numeric,
  	"challenge_level" "enum_creatures_challenge_level" DEFAULT 'moderate',
  	"creature_type" varchar,
  	"is_swarm" boolean DEFAULT false,
  	"is_unique" boolean DEFAULT false,
  	"category_id" integer,
  	"toc" jsonb,
  	"entry_body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enhancements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"latin" varchar,
  	"entry_id" integer,
  	"cooldown" numeric,
  	"description" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "timeline" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"year" numeric NOT NULL,
  	"major" boolean DEFAULT false,
  	"icon" "enum_timeline_icon",
  	"description" varchar,
  	"url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"entries_find" boolean DEFAULT false,
  	"entries_create" boolean DEFAULT false,
  	"entries_update" boolean DEFAULT false,
  	"entries_delete" boolean DEFAULT false,
  	"creatures_find" boolean DEFAULT false,
  	"creatures_create" boolean DEFAULT false,
  	"creatures_update" boolean DEFAULT false,
  	"creatures_delete" boolean DEFAULT false,
  	"disciplines_find" boolean DEFAULT false,
  	"disciplines_create" boolean DEFAULT false,
  	"disciplines_update" boolean DEFAULT false,
  	"disciplines_delete" boolean DEFAULT false,
  	"techniques_find" boolean DEFAULT false,
  	"techniques_create" boolean DEFAULT false,
  	"techniques_update" boolean DEFAULT false,
  	"techniques_delete" boolean DEFAULT false,
  	"paths_find" boolean DEFAULT false,
  	"paths_create" boolean DEFAULT false,
  	"paths_update" boolean DEFAULT false,
  	"paths_delete" boolean DEFAULT false,
  	"cultures_find" boolean DEFAULT false,
  	"cultures_create" boolean DEFAULT false,
  	"cultures_update" boolean DEFAULT false,
  	"cultures_delete" boolean DEFAULT false,
  	"patronages_find" boolean DEFAULT false,
  	"patronages_create" boolean DEFAULT false,
  	"patronages_update" boolean DEFAULT false,
  	"patronages_delete" boolean DEFAULT false,
  	"scores_find" boolean DEFAULT false,
  	"scores_create" boolean DEFAULT false,
  	"scores_update" boolean DEFAULT false,
  	"scores_delete" boolean DEFAULT false,
  	"subscores_find" boolean DEFAULT false,
  	"subscores_create" boolean DEFAULT false,
  	"subscores_update" boolean DEFAULT false,
  	"subscores_delete" boolean DEFAULT false,
  	"additional_scores_find" boolean DEFAULT false,
  	"additional_scores_create" boolean DEFAULT false,
  	"additional_scores_update" boolean DEFAULT false,
  	"additional_scores_delete" boolean DEFAULT false,
  	"enhancements_find" boolean DEFAULT false,
  	"enhancements_create" boolean DEFAULT false,
  	"enhancements_update" boolean DEFAULT false,
  	"enhancements_delete" boolean DEFAULT false,
  	"categories_find" boolean DEFAULT false,
  	"categories_create" boolean DEFAULT false,
  	"categories_update" boolean DEFAULT false,
  	"categories_delete" boolean DEFAULT false,
  	"timeline_find" boolean DEFAULT false,
  	"timeline_create" boolean DEFAULT false,
  	"timeline_update" boolean DEFAULT false,
  	"timeline_delete" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"categories_id" integer,
  	"entries_id" integer,
  	"cultures_id" integer,
  	"paths_id" integer,
  	"disciplines_id" integer,
  	"techniques_id" integer,
  	"patronages_id" integer,
  	"scores_id" integer,
  	"subscores_id" integer,
  	"additional_scores_id" integer,
  	"creatures_id" integer,
  	"enhancements_id" integer,
  	"timeline_id" integer,
  	"payload_mcp_api_keys_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"payload_mcp_api_keys_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entries_card_details" ADD CONSTRAINT "entries_card_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "entries" ADD CONSTRAINT "entries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entries" ADD CONSTRAINT "entries_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "entries" ADD CONSTRAINT "entries_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cultures_aspects" ADD CONSTRAINT "cultures_aspects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures" ADD CONSTRAINT "cultures_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cultures" ADD CONSTRAINT "cultures_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paths_modifiers" ADD CONSTRAINT "paths_modifiers_modifier_subscore_id_subscores_id_fk" FOREIGN KEY ("modifier_subscore_id") REFERENCES "public"."subscores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paths_modifiers" ADD CONSTRAINT "paths_modifiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paths"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paths" ADD CONSTRAINT "paths_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paths" ADD CONSTRAINT "paths_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "disciplines_rels" ADD CONSTRAINT "disciplines_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."disciplines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "disciplines_rels" ADD CONSTRAINT "disciplines_rels_paths_fk" FOREIGN KEY ("paths_id") REFERENCES "public"."paths"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "disciplines_rels" ADD CONSTRAINT "disciplines_rels_techniques_fk" FOREIGN KEY ("techniques_id") REFERENCES "public"."techniques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "techniques" ADD CONSTRAINT "techniques_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "techniques" ADD CONSTRAINT "techniques_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "patronages_effects" ADD CONSTRAINT "patronages_effects_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "patronages_effects" ADD CONSTRAINT "patronages_effects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."patronages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "patronages" ADD CONSTRAINT "patronages_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "patronages" ADD CONSTRAINT "patronages_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscores" ADD CONSTRAINT "subscores_score_id_scores_id_fk" FOREIGN KEY ("score_id") REFERENCES "public"."scores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "additional_scores_additional_calculations" ADD CONSTRAINT "additional_scores_additional_calculations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."additional_scores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "additional_scores" ADD CONSTRAINT "additional_scores_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "additional_scores_rels" ADD CONSTRAINT "additional_scores_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."additional_scores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "additional_scores_rels" ADD CONSTRAINT "additional_scores_rels_scores_fk" FOREIGN KEY ("scores_id") REFERENCES "public"."scores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "additional_scores_rels" ADD CONSTRAINT "additional_scores_rels_subscores_fk" FOREIGN KEY ("subscores_id") REFERENCES "public"."subscores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "creatures_attacks" ADD CONSTRAINT "creatures_attacks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."creatures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "creatures_special_abilities" ADD CONSTRAINT "creatures_special_abilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."creatures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "creatures_environments" ADD CONSTRAINT "creatures_environments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."creatures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "creatures" ADD CONSTRAINT "creatures_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "creatures" ADD CONSTRAINT "creatures_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enhancements" ADD CONSTRAINT "enhancements_entry_id_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."entries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_entries_fk" FOREIGN KEY ("entries_id") REFERENCES "public"."entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cultures_fk" FOREIGN KEY ("cultures_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paths_fk" FOREIGN KEY ("paths_id") REFERENCES "public"."paths"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_disciplines_fk" FOREIGN KEY ("disciplines_id") REFERENCES "public"."disciplines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_techniques_fk" FOREIGN KEY ("techniques_id") REFERENCES "public"."techniques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_patronages_fk" FOREIGN KEY ("patronages_id") REFERENCES "public"."patronages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_scores_fk" FOREIGN KEY ("scores_id") REFERENCES "public"."scores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscores_fk" FOREIGN KEY ("subscores_id") REFERENCES "public"."subscores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_additional_scores_fk" FOREIGN KEY ("additional_scores_id") REFERENCES "public"."additional_scores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_creatures_fk" FOREIGN KEY ("creatures_id") REFERENCES "public"."creatures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enhancements_fk" FOREIGN KEY ("enhancements_id") REFERENCES "public"."enhancements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_timeline_fk" FOREIGN KEY ("timeline_id") REFERENCES "public"."timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "entries_card_details_order_idx" ON "entries_card_details" USING btree ("_order");
  CREATE INDEX "entries_card_details_parent_id_idx" ON "entries_card_details" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "entries_slug_idx" ON "entries" USING btree ("slug");
  CREATE INDEX "entries_author_idx" ON "entries" USING btree ("author_id");
  CREATE INDEX "entries_main_image_idx" ON "entries" USING btree ("main_image_id");
  CREATE INDEX "entries_category_idx" ON "entries" USING btree ("category_id");
  CREATE INDEX "entries_updated_at_idx" ON "entries" USING btree ("updated_at");
  CREATE INDEX "entries_created_at_idx" ON "entries" USING btree ("created_at");
  CREATE INDEX "cultures_aspects_order_idx" ON "cultures_aspects" USING btree ("_order");
  CREATE INDEX "cultures_aspects_parent_id_idx" ON "cultures_aspects" USING btree ("_parent_id");
  CREATE INDEX "cultures_entry_idx" ON "cultures" USING btree ("entry_id");
  CREATE INDEX "cultures_main_image_idx" ON "cultures" USING btree ("main_image_id");
  CREATE INDEX "cultures_updated_at_idx" ON "cultures" USING btree ("updated_at");
  CREATE INDEX "cultures_created_at_idx" ON "cultures" USING btree ("created_at");
  CREATE INDEX "paths_modifiers_order_idx" ON "paths_modifiers" USING btree ("_order");
  CREATE INDEX "paths_modifiers_parent_id_idx" ON "paths_modifiers" USING btree ("_parent_id");
  CREATE INDEX "paths_modifiers_modifier_subscore_idx" ON "paths_modifiers" USING btree ("modifier_subscore_id");
  CREATE UNIQUE INDEX "paths_slug_idx" ON "paths" USING btree ("slug");
  CREATE INDEX "paths_main_image_idx" ON "paths" USING btree ("main_image_id");
  CREATE INDEX "paths_category_idx" ON "paths" USING btree ("category_id");
  CREATE INDEX "paths_updated_at_idx" ON "paths" USING btree ("updated_at");
  CREATE INDEX "paths_created_at_idx" ON "paths" USING btree ("created_at");
  CREATE UNIQUE INDEX "disciplines_slug_idx" ON "disciplines" USING btree ("slug");
  CREATE INDEX "disciplines_main_image_idx" ON "disciplines" USING btree ("main_image_id");
  CREATE INDEX "disciplines_category_idx" ON "disciplines" USING btree ("category_id");
  CREATE INDEX "disciplines_updated_at_idx" ON "disciplines" USING btree ("updated_at");
  CREATE INDEX "disciplines_created_at_idx" ON "disciplines" USING btree ("created_at");
  CREATE INDEX "disciplines_rels_order_idx" ON "disciplines_rels" USING btree ("order");
  CREATE INDEX "disciplines_rels_parent_idx" ON "disciplines_rels" USING btree ("parent_id");
  CREATE INDEX "disciplines_rels_path_idx" ON "disciplines_rels" USING btree ("path");
  CREATE INDEX "disciplines_rels_paths_id_idx" ON "disciplines_rels" USING btree ("paths_id");
  CREATE INDEX "disciplines_rels_techniques_id_idx" ON "disciplines_rels" USING btree ("techniques_id");
  CREATE UNIQUE INDEX "techniques_slug_idx" ON "techniques" USING btree ("slug");
  CREATE INDEX "techniques_main_image_idx" ON "techniques" USING btree ("main_image_id");
  CREATE INDEX "techniques_category_idx" ON "techniques" USING btree ("category_id");
  CREATE INDEX "techniques_updated_at_idx" ON "techniques" USING btree ("updated_at");
  CREATE INDEX "techniques_created_at_idx" ON "techniques" USING btree ("created_at");
  CREATE INDEX "patronages_effects_order_idx" ON "patronages_effects" USING btree ("_order");
  CREATE INDEX "patronages_effects_parent_id_idx" ON "patronages_effects" USING btree ("_parent_id");
  CREATE INDEX "patronages_effects_entry_idx" ON "patronages_effects" USING btree ("entry_id");
  CREATE INDEX "patronages_entry_idx" ON "patronages" USING btree ("entry_id");
  CREATE INDEX "patronages_main_image_idx" ON "patronages" USING btree ("main_image_id");
  CREATE INDEX "patronages_updated_at_idx" ON "patronages" USING btree ("updated_at");
  CREATE INDEX "patronages_created_at_idx" ON "patronages" USING btree ("created_at");
  CREATE INDEX "scores_updated_at_idx" ON "scores" USING btree ("updated_at");
  CREATE INDEX "scores_created_at_idx" ON "scores" USING btree ("created_at");
  CREATE INDEX "subscores_score_idx" ON "subscores" USING btree ("score_id");
  CREATE INDEX "subscores_updated_at_idx" ON "subscores" USING btree ("updated_at");
  CREATE INDEX "subscores_created_at_idx" ON "subscores" USING btree ("created_at");
  CREATE INDEX "additional_scores_additional_calculations_order_idx" ON "additional_scores_additional_calculations" USING btree ("_order");
  CREATE INDEX "additional_scores_additional_calculations_parent_id_idx" ON "additional_scores_additional_calculations" USING btree ("_parent_id");
  CREATE INDEX "additional_scores_entry_idx" ON "additional_scores" USING btree ("entry_id");
  CREATE INDEX "additional_scores_updated_at_idx" ON "additional_scores" USING btree ("updated_at");
  CREATE INDEX "additional_scores_created_at_idx" ON "additional_scores" USING btree ("created_at");
  CREATE INDEX "additional_scores_rels_order_idx" ON "additional_scores_rels" USING btree ("order");
  CREATE INDEX "additional_scores_rels_parent_idx" ON "additional_scores_rels" USING btree ("parent_id");
  CREATE INDEX "additional_scores_rels_path_idx" ON "additional_scores_rels" USING btree ("path");
  CREATE INDEX "additional_scores_rels_scores_id_idx" ON "additional_scores_rels" USING btree ("scores_id");
  CREATE INDEX "additional_scores_rels_subscores_id_idx" ON "additional_scores_rels" USING btree ("subscores_id");
  CREATE INDEX "creatures_attacks_order_idx" ON "creatures_attacks" USING btree ("_order");
  CREATE INDEX "creatures_attacks_parent_id_idx" ON "creatures_attacks" USING btree ("_parent_id");
  CREATE INDEX "creatures_special_abilities_order_idx" ON "creatures_special_abilities" USING btree ("_order");
  CREATE INDEX "creatures_special_abilities_parent_id_idx" ON "creatures_special_abilities" USING btree ("_parent_id");
  CREATE INDEX "creatures_environments_order_idx" ON "creatures_environments" USING btree ("_order");
  CREATE INDEX "creatures_environments_parent_id_idx" ON "creatures_environments" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "creatures_slug_idx" ON "creatures" USING btree ("slug");
  CREATE INDEX "creatures_main_image_idx" ON "creatures" USING btree ("main_image_id");
  CREATE INDEX "creatures_category_idx" ON "creatures" USING btree ("category_id");
  CREATE INDEX "creatures_updated_at_idx" ON "creatures" USING btree ("updated_at");
  CREATE INDEX "creatures_created_at_idx" ON "creatures" USING btree ("created_at");
  CREATE INDEX "enhancements_entry_idx" ON "enhancements" USING btree ("entry_id");
  CREATE INDEX "enhancements_updated_at_idx" ON "enhancements" USING btree ("updated_at");
  CREATE INDEX "enhancements_created_at_idx" ON "enhancements" USING btree ("created_at");
  CREATE INDEX "timeline_updated_at_idx" ON "timeline" USING btree ("updated_at");
  CREATE INDEX "timeline_created_at_idx" ON "timeline" USING btree ("created_at");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("entries_id");
  CREATE INDEX "payload_locked_documents_rels_cultures_id_idx" ON "payload_locked_documents_rels" USING btree ("cultures_id");
  CREATE INDEX "payload_locked_documents_rels_paths_id_idx" ON "payload_locked_documents_rels" USING btree ("paths_id");
  CREATE INDEX "payload_locked_documents_rels_disciplines_id_idx" ON "payload_locked_documents_rels" USING btree ("disciplines_id");
  CREATE INDEX "payload_locked_documents_rels_techniques_id_idx" ON "payload_locked_documents_rels" USING btree ("techniques_id");
  CREATE INDEX "payload_locked_documents_rels_patronages_id_idx" ON "payload_locked_documents_rels" USING btree ("patronages_id");
  CREATE INDEX "payload_locked_documents_rels_scores_id_idx" ON "payload_locked_documents_rels" USING btree ("scores_id");
  CREATE INDEX "payload_locked_documents_rels_subscores_id_idx" ON "payload_locked_documents_rels" USING btree ("subscores_id");
  CREATE INDEX "payload_locked_documents_rels_additional_scores_id_idx" ON "payload_locked_documents_rels" USING btree ("additional_scores_id");
  CREATE INDEX "payload_locked_documents_rels_creatures_id_idx" ON "payload_locked_documents_rels" USING btree ("creatures_id");
  CREATE INDEX "payload_locked_documents_rels_enhancements_id_idx" ON "payload_locked_documents_rels" USING btree ("enhancements_id");
  CREATE INDEX "payload_locked_documents_rels_timeline_id_idx" ON "payload_locked_documents_rels" USING btree ("timeline_id");
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "entries_card_details" CASCADE;
  DROP TABLE "entries" CASCADE;
  DROP TABLE "cultures_aspects" CASCADE;
  DROP TABLE "cultures" CASCADE;
  DROP TABLE "paths_modifiers" CASCADE;
  DROP TABLE "paths" CASCADE;
  DROP TABLE "disciplines" CASCADE;
  DROP TABLE "disciplines_rels" CASCADE;
  DROP TABLE "techniques" CASCADE;
  DROP TABLE "patronages_effects" CASCADE;
  DROP TABLE "patronages" CASCADE;
  DROP TABLE "scores" CASCADE;
  DROP TABLE "subscores" CASCADE;
  DROP TABLE "additional_scores_additional_calculations" CASCADE;
  DROP TABLE "additional_scores" CASCADE;
  DROP TABLE "additional_scores_rels" CASCADE;
  DROP TABLE "creatures_attacks" CASCADE;
  DROP TABLE "creatures_special_abilities" CASCADE;
  DROP TABLE "creatures_environments" CASCADE;
  DROP TABLE "creatures" CASCADE;
  DROP TABLE "enhancements" CASCADE;
  DROP TABLE "timeline" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_additional_scores_additional_calculations_calculation_type";
  DROP TYPE "public"."enum_additional_scores_calculation";
  DROP TYPE "public"."enum_creatures_challenge_level";
  DROP TYPE "public"."enum_timeline_icon";`)
}
