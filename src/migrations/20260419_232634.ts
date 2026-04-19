import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "entries_slug_idx" ON "entries" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "creatures_slug_idx" ON "creatures" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "disciplines_slug_idx" ON "disciplines" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "techniques_slug_idx" ON "techniques" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "paths_slug_idx" ON "paths" USING btree ("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" USING btree ("slug");
    DROP TABLE IF EXISTS "scores_rels" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "entries_slug_idx";
    DROP INDEX IF EXISTS "creatures_slug_idx";
    DROP INDEX IF EXISTS "disciplines_slug_idx";
    DROP INDEX IF EXISTS "techniques_slug_idx";
    DROP INDEX IF EXISTS "paths_slug_idx";
    DROP INDEX IF EXISTS "categories_slug_idx";
  `)
}
