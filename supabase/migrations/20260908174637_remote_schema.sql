drop extension if exists "pg_net";

alter table "public"."auditoria_termos" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

grant delete on table "public"."auditoria_termos" to "anon";

grant insert on table "public"."auditoria_termos" to "anon";

grant select on table "public"."auditoria_termos" to "anon";

grant update on table "public"."auditoria_termos" to "anon";

grant delete on table "public"."auditoria_termos" to "authenticated";

grant insert on table "public"."auditoria_termos" to "authenticated";

grant select on table "public"."auditoria_termos" to "authenticated";

grant update on table "public"."auditoria_termos" to "authenticated";

grant delete on table "public"."park_status" to "anon";

grant insert on table "public"."park_status" to "anon";

grant update on table "public"."park_status" to "anon";

grant delete on table "public"."park_status" to "authenticated";

grant delete on table "public"."reserva_tokens" to "anon";

grant insert on table "public"."reserva_tokens" to "anon";

grant select on table "public"."reserva_tokens" to "anon";

grant update on table "public"."reserva_tokens" to "anon";

grant delete on table "public"."reserva_tokens" to "authenticated";

grant insert on table "public"."reserva_tokens" to "authenticated";

grant select on table "public"."reserva_tokens" to "authenticated";

grant update on table "public"."reserva_tokens" to "authenticated";

grant delete on table "public"."reservas" to "anon";


