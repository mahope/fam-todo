
-- 00_enums.sql
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;
create extension if not exists tsm_system_rows;
create extension if not exists pgroonga; -- optional, comment out if not installed
create extension if not exists vector;   -- optional
create extension if not exists pgjwt;    -- for JWT helpers (if available)

do $$ begin
  create type user_role as enum ('admin', 'adult', 'child');
exception when duplicate_object then null; end $$;
do $$ begin
  create type list_visibility as enum ('private', 'family', 'adults');
exception when duplicate_object then null; end $$;
do $$ begin
  create type list_type as enum ('generic', 'shopping');
exception when duplicate_object then null; end $$;
do $$ begin
  create type task_status as enum ('open', 'in_progress', 'done', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type task_priority as enum ('none', 'low', 'medium', 'high');
exception when duplicate_object then null; end $$;
do $$ begin
  create type repeat_freq as enum ('daily', 'weekly', 'monthly', 'yearly', 'custom');
exception when duplicate_object then null; end $$;
do $$ begin
  create type shopping_category as enum (
    'bakery','produce','meat','fish','dairy','frozen','pantry','beverages',
    'snacks','household','personal_care','baby','pets','other'
  );
exception when duplicate_object then null; end $$;
do $$ begin
  create type device_type as enum ('web','ios','android');
exception when duplicate_object then null; end $$;
