
-- 03_triggers.sql

-- updated_at triggers
create trigger trg_upd_families before update on families
for each row execute function set_updated_at();

create trigger trg_upd_app_users before update on app_users
for each row execute function set_updated_at();

create trigger trg_upd_folders before update on folders
for each row execute function set_updated_at();

create trigger trg_upd_lists before update on lists
for each row execute function set_updated_at();

create trigger trg_upd_tasks before update on tasks
for each row execute function set_updated_at();

create trigger trg_upd_subtasks before update on subtasks
for each row execute function set_updated_at();

create trigger trg_upd_shopping_items before update on shopping_items
for each row execute function set_updated_at();

-- tsv triggers
create trigger trg_lists_tsv before insert or update on lists
for each row execute function update_lists_tsv();

create trigger trg_tasks_tsv before insert or update on tasks
for each row execute function update_tasks_tsv();

-- shopping normalization
create trigger trg_shop_item_norm before insert on shopping_items
for each row execute function normalize_shopping_item();
