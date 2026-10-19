-- 1. Bảng tài khoản ví (Wallet Accounts)
CREATE TABLE IF NOT EXISTS wallet_accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(64) NOT NULL UNIQUE,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, LOCKED, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng giao dịch tổng (Transaction Master)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(128) NOT NULL UNIQUE, -- Chống trừ tiền 2 lần
    source_account_id UUID REFERENCES wallet_accounts(account_id),
    target_account_id UUID REFERENCES wallet_accounts(account_id),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(30) NOT NULL, -- PENDING, COMPLETED, FAILED, ROLLED_BACK
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sổ cái hạch toán kép (Ledger Entries - Bất biến & Append Only)
CREATE TABLE IF NOT EXISTS ledger_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(transaction_id),
    account_id UUID NOT NULL REFERENCES wallet_accounts(account_id),
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Outbox phục vụ Transactional Outbox Pattern
CREATE TABLE IF NOT EXISTS outbox_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'INIT', -- INIT, PUBLISHED, FAILED
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partial Index tối ưu cực cao cho Polling Worker quét sự kiện chưa xuất bản
CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox_events(status) WHERE status = 'INIT';
