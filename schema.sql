
-- Nuvabase Core Shard Schema (Hardened v2.2)
-- Purpose: Fail-closed production security for public SaaS deployment.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE TENANT TABLE
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. AUDIT & AUTH LEDGERS (IMMUTABLE)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    session_context JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auth_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    event_type TEXT NOT NULL, -- LOGIN, LOGOUT, REFRESH, RLS_VIOLATION
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Deny all mutations to audit ledgers
CREATE RULE no_update_audit AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_update_auth AS ON UPDATE TO auth_events DO INSTEAD NOTHING;
CREATE RULE no_delete_auth AS ON DELETE TO auth_events DO INSTEAD NOTHING;

-- 4. TENANT DATA TABLES
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'member',
    is_online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FAIL-CLOSED SECURITY POLICIES
-- RULES: 
-- 1. If GUC is missing, fail.
-- 2. If GUC is empty, fail.
-- 3. If GUC doesn't match row tenant, fail.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

-- Security Predicate Helper
CREATE OR REPLACE FUNCTION is_tenant_context_safe() RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        current_setting('app.current_tenant', true) IS NOT NULL 
        AND current_setting('app.current_tenant', true) <> ''
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY tenant_isolation_users ON users
    FOR ALL USING (
        is_tenant_context_safe() 
        AND tenant_id = (current_setting('app.current_tenant'))::uuid
    );

CREATE POLICY tenant_isolation_audit ON audit_logs
    FOR SELECT USING (
        is_tenant_context_safe() 
        AND tenant_id = (current_setting('app.current_tenant'))::uuid
    );

CREATE POLICY tenant_isolation_auth ON auth_events
    FOR SELECT USING (
        is_tenant_context_safe() 
        AND tenant_id = (current_setting('app.current_tenant'))::uuid
    );

-- 6. ABSOLUTE WRITE PROTECTION
CREATE OR REPLACE FUNCTION force_tenant_isolation() RETURNS TRIGGER AS $$
BEGIN
    IF NOT is_tenant_context_safe() THEN
        RAISE EXCEPTION 'CRITICAL SECURITY VIOLATION: Operation attempted without tenant context.';
    END IF;

    IF (TG_OP = 'INSERT') THEN
        NEW.tenant_id := (current_setting('app.current_tenant'))::uuid;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (NEW.tenant_id <> OLD.tenant_id) THEN
            RAISE EXCEPTION 'CRITICAL SECURITY VIOLATION: Cross-tenant data migration is forbidden.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lockdown_users BEFORE INSERT OR UPDATE ON users FOR EACH ROW EXECUTE FUNCTION force_tenant_isolation();
