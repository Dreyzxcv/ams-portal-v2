<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared(<<<'SQL'
CREATE OR REPLACE FUNCTION prevent_row_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION '% on % is not allowed: table is append-only', TG_OP, TG_TABLE_NAME;
END;
$$;
SQL);

        foreach (['audit_logs', 'grade_revisions'] as $table) {
            DB::statement("CREATE TRIGGER {$table}_no_update_delete BEFORE UPDATE OR DELETE ON {$table} FOR EACH ROW EXECUTE FUNCTION prevent_row_mutation()");
            DB::statement("CREATE TRIGGER {$table}_no_truncate BEFORE TRUNCATE ON {$table} FOR EACH STATEMENT EXECUTE FUNCTION prevent_row_mutation()");
        }

        // Row Level Security with no policies: Supabase's Data API (anon/authenticated roles)
        // cannot read these tables. Laravel connects as the table owner, which bypasses RLS.
        // RULE: every future migration that creates a table must enable RLS on it too.
        DB::unprepared(<<<'SQL'
DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    END LOOP;
END
$$;
SQL);
    }

    public function down(): void
    {
        foreach (['audit_logs', 'grade_revisions'] as $table) {
            DB::statement("DROP TRIGGER IF EXISTS {$table}_no_truncate ON {$table}");
            DB::statement("DROP TRIGGER IF EXISTS {$table}_no_update_delete ON {$table}");
        }

        DB::statement('DROP FUNCTION IF EXISTS prevent_row_mutation()');
        // RLS is intentionally left enabled on rollback.
    }
};
