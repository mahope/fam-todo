
-- 01_tables.sql

-- families & users
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  family_id uuid not null references families(id) on delete cascade,
  role user_role not null default 'adult',
  email citext unique not null,
  display_name text not null,
  avatar_url text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamamptz not null default now()
);

-- fix typo in updated_at type for app_users in case of reruns
do $$ begin
  alter table app_users
    alter column updated_at type timestamptz using updated_at::timestamptz;
exception when others then null; end $$;

create index if not exists idx_app_users_family on app_users(family_id);
create index if not exists idx_app_users_email on app_users(email);

-- folders
create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  owner_id uuid references app_users(id) on delete set null,
  name text not null,
  color text null,
  visibility list_visibility not null default 'private',
  parent_id uuid null references folders(id) on delete cascade,
  sort_index int not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_folders_family on folders(family_id);
create index if not exists idx_folders_parent on folders(parent_id);

-- lists
create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  owner_id uuid references app_users(id) on delete set null,
  folder_id uuid references folders(id) on delete set null,
  name text not null,
  description text null,
  color text null,
  visibility list_visibility not null default 'private',
  type list_type not null default 'generic',
  sort_index int not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_tsv tsvector
);
create index if not exists idx_lists_family on lists(family_id);
create index if not exists idx_lists_folder on lists(folder_id);
create index if not exists idx_lists_visibility on lists(visibility);
create index if not exists idx_lists_search on lists using gin(search_tsv);

-- tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  owner_id uuid references app_users(id) on delete set null,
  assigned_user_id uuid references app_users(id) on delete set null,
  title text not null,
  description text null,
  status task_status not null default 'open',
  priority task_priority not null default 'none',
  due_at timestamptz null,
  completed_at timestamptz null,
  is_recurring boolean not null default false,
  sort_index int not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_tsv tsvector
);
create index if not exists idx_tasks_list on tasks(list_id);
create index if not exists idx_tasks_family on tasks(family_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_due on tasks(due_at);
create index if not exists idx_tasks_assigned on tasks(assigned_user_id);
create index if not exists idx_tasks_search on tasks using gin(search_tsv);

-- subtasks
create table if not exists subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  sort_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subtasks_task on subtasks(task_id);

-- tags
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  color text null,
  unique (family_id, name)
);

create table if not exists task_tags (
  task_id uuid not null references tasks(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

-- repeat rules & exceptions
create table if not exists repeat_rules (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  freq repeat_freq not null,
  interval int not null default 1,
  byweekday int[] null,
  bymonthday int[] null,
  count int null,
  until timestamptz null,
  timezone text not null default 'Europe/Copenhagen',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists repeat_exceptions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references repeat_rules(id) on delete cascade,
  exception_date date not null,
  reason text null,
  unique (rule_id, exception_date)
);

-- shopping
create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  normalized_name text null,
  quantity numeric(12,3) null,
  unit text null,
  category shopping_category not null default 'other',
  is_purchased boolean not null default false,
  last_purchased_at timestamptz null,
  suggestion_hits int not null default 0,
  sort_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_shop_items_list on shopping_items(list_id);
create index if not exists idx_shop_items_family on shopping_items(family_id);
create index if not exists idx_shop_items_cat on shopping_items(category);
create index if not exists idx_shop_items_purchased on shopping_items(is_purchased);

create table if not exists shopping_dictionary (
  id uuid primary key default gen_random_uuid(),
  family_id uuid null references families(id) on delete cascade,
  key text not null,
  category shopping_category not null,
  default_unit text null,
  synonyms text[] null,
  unique (coalesce(family_id, '00000000-0000-0000-0000-000000000000'::uuid), key)
);
create index if not exists idx_shop_dict_key on shopping_dictionary(key);

-- activity log
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  actor_id uuid references app_users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_family on activity_logs(family_id);
create index if not exists idx_activity_entity on activity_logs(entity_type, entity_id);

-- push subscriptions & notifications
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  device device_type not null default 'web',
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  body text null,
  send_at timestamptz not null,
  delivered_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user_sendat on notifications(user_id, send_at);

-- user settings
create table if not exists user_settings (
  user_id uuid primary key references app_users(id) on delete cascade,
  theme text not null default 'system',
  locale text not null default 'da-DK',
  time_zone text not null default 'Europe/Copenhagen',
  notifications_enabled boolean not null default true,
  pwa_tips_dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
