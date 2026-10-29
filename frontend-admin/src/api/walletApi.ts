import axiosClient from './axiosClient';
import type {
  BalanceResponse,
  CreateAccountRequest,
  DepositRequest,
  LedgerEntryResponse,
  PageResponse,
  SnapshotResponse,
  TransactionResponse,
  TransferRequest,
  WalletAccount,
} from '../types';

export const walletApi = {
  /**
   * Tạo tài khoản ví mới
   */
  createAccount: async (payload: CreateAccountRequest): Promise<WalletAccount> => {
    return (await axiosClient.post('/wallets/accounts', payload)) as unknown as WalletAccount;
  },

  /**
   * Lấy số dư tài khoản thời gian thực (từ Snapshot + Sổ cái kép)
   */
  getBalance: async (accountId: string): Promise<BalanceResponse> => {
    return (await axiosClient.get(`/wallets/${accountId}/balance`)) as unknown as BalanceResponse;
  },

  /**
   * Nạp tiền vào ví
   */
  deposit: async (payload: DepositRequest): Promise<TransactionResponse> => {
    return (await axiosClient.post('/wallets/deposit', payload)) as unknown as TransactionResponse;
  },

  /**
   * Chuyển tiền an toàn qua Saga + Escrow + Redisson Watchdog + Idempotency
   */
  transfer: async (payload: TransferRequest): Promise<TransactionResponse> => {
    const idempotencyKey = payload.idempotencyKey || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return (await axiosClient.post('/wallets/transfer', payload, {
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    })) as unknown as TransactionResponse;
  },

  /**
   * Lấy lịch sử biến động số dư (Double-Entry Ledger) có phân trang
   */
  getLedgerHistory: async (accountId: string, page = 0, size = 10): Promise<PageResponse<LedgerEntryResponse>> => {
    return (await axiosClient.get(`/wallets/${accountId}/ledger`, {
      params: { page, size, sort: 'createdAt,desc' },
    })) as unknown as PageResponse<LedgerEntryResponse>;
  },

  /**
   * Chốt Balance Snapshot (Ledger Checkpoint) tối ưu hiệu năng
   */
  createSnapshot: async (accountId: string): Promise<SnapshotResponse> => {
    return (await axiosClient.post(`/wallets/${accountId}/snapshot`)) as unknown as SnapshotResponse;
  },

  /**
   * Tra cứu chi tiết giao dịch theo ID
   */
  getTransaction: async (transactionId: string): Promise<TransactionResponse> => {
    return (await axiosClient.get(`/wallets/transactions/${transactionId}`)) as unknown as TransactionResponse;
  },
};

