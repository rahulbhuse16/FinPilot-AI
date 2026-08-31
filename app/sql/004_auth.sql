-- ============================================
-- USERS (authentication + role based access)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    email VARCHAR(255) UNIQUE NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',

    customer_id UUID
        REFERENCES customers(id)
        ON DELETE CASCADE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_role_check
        CHECK (role IN ('ADMIN', 'CUSTOMER')),

    CONSTRAINT users_customer_link_check
        CHECK (role = 'ADMIN' OR customer_id IS NOT NULL)
);


CREATE INDEX IF NOT EXISTS idx_users_customer_id
ON users(customer_id);
