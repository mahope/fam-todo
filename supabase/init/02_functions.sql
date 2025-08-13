
-- 02_functions.sql

-- updated_at trigger function
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

-- tsv update functions
create or replace function update_lists_tsv() returns trigger language plpgsql as $$
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(new.name,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description,'')), 'B');
  return new;
end; $$;

create or replace function update_tasks_tsv() returns trigger language plpgsql as $$
declare
  tag_names text := (
    select string_agg(t.name, ' ')
    from task_tags tt join tags t on t.id=tt.tag_id
    where tt.task_id = new.id
  );
begin
  new.search_tsv :=
    setweight(to_tsvector('simple', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.description,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(tag_names,'')), 'C');
  return new;
end; $$;

-- shopping normalization
create or replace function normalize_shopping_item()
returns trigger language plpgsql as $$
declare
  k text;
  rec record;
begin
  k := lower(regexp_replace(coalesce(new.name,''), '[^a-zA-Z0-9æøåÆØÅ ]', '', 'g'));
  new.normalized_name := trim(k);

  select * into rec
  from shopping_dictionary d
  where (d.family_id = new.family_id or d.family_id is null)
    and (d.key = new.normalized_name or (d.synonyms is not null and new.normalized_name = any(d.synonyms)))
  order by d.family_id nulls last
  limit 1;

  if found then
    new.category := rec.category;
    if new.unit is null then new.unit := rec.default_unit; end if;
  end if;

  return new;
end; $$;

-- JWT claim helpers (PostgREST): extract app_user_id & family_id from JWT
create or replace function jwt_app_user_id() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb->>'app_user_id','')::uuid;
$$;

create or replace function jwt_family_id() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb->>'family_id','')::uuid;
$$;

create or replace function jwt_role_name() returns text language sql stable as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role_name','');
$$;

-- Realtime publication
drop publication if exists supabase_realtime;
create publication supabase_realtime for table
  lists, tasks, subtasks, tags, task_tags, shopping_items;
