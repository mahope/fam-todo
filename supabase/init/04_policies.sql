
-- 04_policies.sql

-- Enable RLS
alter table families enable row level security;
alter table app_users enable row level security;
alter table folders enable row level security;
alter table lists enable row level security;
alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table tags enable row level security;
alter table task_tags enable row level security;
alter table shopping_items enable row level security;
alter table shopping_dictionary enable row level security;
alter table activity_logs enable row level security;
alter table push_subscriptions enable row level security;
alter table notifications enable row level security;
alter table user_settings enable row level security;

-- Helper checks
create or replace function same_family(fid uuid) returns boolean language sql stable as $$
  select fid = jwt_family_id();
$$;

create or replace function is_admin_or_owner(owner uuid) returns boolean language sql stable as $$
  select (jwt_role_name() = 'admin') or (owner = jwt_app_user_id());
$$;

-- Minimal policies (expand as needed)

-- families: read own family, only admin can write
create policy families_sel on families for select using (id = jwt_family_id());
create policy families_mod on families for all using (jwt_role_name() = 'admin');

-- app_users: visible within family
create policy users_sel on app_users for select using (family_id = jwt_family_id());
create policy users_mod on app_users for all using (family_id = jwt_family_id() and jwt_role_name() = 'admin');

-- folders
create policy folders_sel on folders for select using (family_id = jwt_family_id());
create policy folders_ins on folders for insert with check (family_id = jwt_family_id());
create policy folders_mod on folders for update using (family_id = jwt_family_id());
create policy folders_del on folders for delete using (family_id = jwt_family_id());

-- lists (respect visibility)
create policy lists_sel on lists for select using (
  family_id = jwt_family_id() and (
    visibility = 'family' or
    (visibility = 'adults' and jwt_role_name() in ('admin','adult')) or
    (visibility = 'private' and owner_id = jwt_app_user_id())
  )
);
create policy lists_ins on lists for insert with check (family_id = jwt_family_id());
create policy lists_mod on lists for update using (
  family_id = jwt_family_id() and (owner_id = jwt_app_user_id() or jwt_role_name() = 'admin')
);
create policy lists_del on lists for delete using (
  family_id = jwt_family_id() and (owner_id = jwt_app_user_id() or jwt_role_name() = 'admin')
);

-- tasks
create policy tasks_sel on tasks for select using (family_id = jwt_family_id());
create policy tasks_ins on tasks for insert with check (family_id = jwt_family_id());
create policy tasks_mod on tasks for update using (family_id = jwt_family_id());
create policy tasks_del on tasks for delete using (family_id = jwt_family_id());

-- subtasks
create policy subtasks_all on subtasks for all using (
  exists (select 1 from tasks t where t.id = subtasks.task_id and t.family_id = jwt_family_id())
) with check (
  exists (select 1 from tasks t where t.id = subtasks.task_id and t.family_id = jwt_family_id())
);

-- tags / task_tags
create policy tags_sel on tags for select using (family_id = jwt_family_id());
create policy tags_mod on tags for all using (family_id = jwt_family_id());

create policy task_tags_all on task_tags for all using (
  exists (select 1 from tasks t where t.id = task_tags.task_id and t.family_id = jwt_family_id())
);

-- shopping
create policy shop_items_sel on shopping_items for select using (family_id = jwt_family_id());
create policy shop_items_mod on shopping_items for all using (family_id = jwt_family_id());

create policy shop_dict_sel on shopping_dictionary for select using (family_id is null or family_id = jwt_family_id());
create policy shop_dict_mod on shopping_dictionary for all using (family_id = jwt_family_id());

-- logs / notifications / subs / settings
create policy logs_sel on activity_logs for select using (family_id = jwt_family_id());
create policy logs_ins on activity_logs for insert with check (family_id = jwt_family_id());

create policy subs_sel on push_subscriptions for select using (user_id = jwt_app_user_id());
create policy subs_mod on push_subscriptions for all using (user_id = jwt_app_user_id());

create policy noti_sel on notifications for select using (family_id = jwt_family_id() and user_id = jwt_app_user_id());
create policy noti_mod on notifications for all using (family_id = jwt_family_id() and user_id = jwt_app_user_id());

create policy settings_sel on user_settings for select using (user_id = jwt_app_user_id());
create policy settings_mod on user_settings for all using (user_id = jwt_app_user_id());
