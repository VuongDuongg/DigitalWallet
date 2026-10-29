import axiosClient from './axiosClient';
import type {
  BalanceResponse,
  CreateAccountRequest,
  LedgerEntryResponse,
  PageResponse,
  SnapshotResponse,
  TransactionResponse,
  WalletAccount,
} from '../types';

export const adminApi = {
  /**
   * [ADMIN AUDIT] Lấy toàn bộ lịch sử Bút toán kép Sổ cái phục vụ kiểm toán
   */
  getLedgerAuditLog: async (accountId: string, page = 0, size = 10): Promise<PageResponse<LedgerEntryResponse>> => {
    return (await axiosClient.get(`/admin/wallets/ledger/${accountId}`, {
      params: { page, size, sort: 'createdAt,desc' },
    })) as unknown as PageResponse<LedgerEntryResponse>;
  },

  /**
   * [ADMIN ENGINE] Kích hoạt chốt Balance Snapshot để tối ưu hiệu năng O(1)
   */
  triggerSnapshot: async (accountId: string): Promise<SnapshotResponse> => {
    return (await axiosClient.post(`/admin/wallets/snapshots/${accountId}`)) as unknown as SnapshotResponse;
  },

  /**
   * [ADMIN SAGA] Tra cứu chi tiết giao dịch Saga & Outbox theo TxID
   */
  inspectTransaction: async (transactionId: string): Promise<TransactionResponse> => {
    return (await axiosClient.get(`/admin/wallets/transactions/${transactionId}`)) as unknown as TransactionResponse;
  },

  /**
   * [ADMIN] Mở tài khoản ví mới
   */
  createAccount: async (payload: CreateAccountRequest): Promise<WalletAccount> => {
    return (await axiosClient.post('/wallets/accounts', payload)) as unknown as WalletAccount;
  },

  /**
   * [ADMIN] Tra cứu số dư tức thời
   */
  getBalance: async (accountId: string): Promise<BalanceResponse> => {
    return (await axiosClient.get(`/wallets/${accountId}/balance`)) as unknown as BalanceResponse;
  },
};

