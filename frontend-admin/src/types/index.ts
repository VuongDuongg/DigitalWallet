export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED';

export type PaymentMethod = 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'VIETQR';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type EntryType = 'DEBIT' | 'CREDIT';

export interface WalletAccount {
  accountId: string;
  userId: string;
  currency: string;
  status: AccountStatus;
  createdAt: string;
}

export interface BalanceResponse {
  accountId: string;
  balance: number;
  currency: string;
}

export interface TransactionResponse {
  transactionId: string;
  idempotencyKey: string;
  sourceAccountId: string | null;
  targetAccountId: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  message?: string;
  createdAt: string;
}

export interface LedgerEntryResponse {
  entryId: string;
  transactionId: string | null;
  accountId: string;
  entryType: EntryType;
  amount: number;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TransferRequest {
  idempotencyKey?: string;
  sourceAccountId: string;
  targetAccountId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface DepositRequest {
  accountId: string;
  amount: number;
}

export interface CreateAccountRequest {
  userId: string;
  currency?: string;
}

export interface SnapshotResponse {
  snapshotId: string;
  accountId: string;
  snapshotBalance: number;
  createdAt: string;
  message: string;
}

