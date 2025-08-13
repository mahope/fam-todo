-- 00_roles.sql - Create necessary database roles
-- This must be run first to create the roles required by PostgREST and Storage

-- Create the supabase_admin role first (required by Supabase extensions)
DO $$ 
BEGIN 
    CREATE ROLE supabase_admin SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS;
    EXCEPTION WHEN duplicate_object THEN 
        NULL;
END 
$$;

-- Create the anon role
DO $$ 
BEGIN 
    CREATE ROLE anon NOINHERIT NOLOGIN;
    EXCEPTION WHEN duplicate_object THEN 
        NULL;
END 
$$;

-- Create the authenticated role  
DO $$ 
BEGIN 
    CREATE ROLE authenticated NOINHERIT NOLOGIN;
    EXCEPTION WHEN duplicate_object THEN 
        NULL;
END 
$$;

-- Create the service_role
DO $$ 
BEGIN 
    CREATE ROLE service_role NOINHERIT NOLOGIN BYPASSRLS;
    EXCEPTION WHEN duplicate_object THEN 
        NULL;
END 
$$;

-- Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant all permissions to service_role
GRANT ALL PRIVILEGES ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Set up default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO service_role;

-- Enable RLS by default (this can be overridden per table)
-- ALTER TABLE IF EXISTS tablename ENABLE ROW LEVEL SECURITY;