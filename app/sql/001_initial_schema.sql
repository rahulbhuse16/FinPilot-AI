CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS vector;


-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    customer_code VARCHAR(50) UNIQUE NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    phone VARCHAR(30),

    monthly_income NUMERIC(15, 2) NOT NULL DEFAULT 0,

    credit_score INTEGER,

    risk_level VARCHAR(20),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- ACCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    customer_id UUID NOT NULL
        REFERENCES customers(id)
        ON DELETE CASCADE,

    account_number VARCHAR(50) UNIQUE NOT NULL,

    account_type VARCHAR(30) NOT NULL,

    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,

    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    account_id UUID NOT NULL
        REFERENCES accounts(id)
        ON DELETE CASCADE,

    amount NUMERIC(15, 2) NOT NULL,

    transaction_type VARCHAR(20) NOT NULL,

    category VARCHAR(50),

    merchant VARCHAR(150),

    description TEXT,

    transaction_time TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- LOANS
-- ============================================

CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    customer_id UUID NOT NULL
        REFERENCES customers(id)
        ON DELETE CASCADE,

    loan_type VARCHAR(50) NOT NULL,

    principal_amount NUMERIC(15, 2) NOT NULL,

    outstanding_amount NUMERIC(15, 2) NOT NULL,

    interest_rate NUMERIC(5, 2) NOT NULL,

    monthly_emi NUMERIC(15, 2) NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_accounts_customer_id
ON accounts(customer_id);

CREATE INDEX IF NOT EXISTS idx_transactions_account_id
ON transactions(account_id);

CREATE INDEX IF NOT EXISTS idx_transactions_time
ON transactions(transaction_time);

CREATE INDEX IF NOT EXISTS idx_loans_customer_id
ON loans(customer_id);