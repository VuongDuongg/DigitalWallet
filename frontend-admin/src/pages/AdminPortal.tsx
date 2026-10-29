import React, { useState } from 'react';
import { LedgerHistoryTable } from '../components/wallet/LedgerHistoryTable';
import { Button } from '../components/common/Button';
import { walletApi } from '../api/walletApi';
import type { LedgerEntryResponse, PageResponse, TransactionResponse } from '../types';
import {
  ShieldCheck,
  Lock,
  Layers,
  Search,
  Camera,
  ArrowLeft,
  Server,
  FileCheck2,
  Clock,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { formatVND, formatDateTime } from '../utils/formatters';

export interface AdminPortalProps {
  onSwitchToUser: () => void;
  showToast: (msg: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onSwitchToUser,
  showToast,
}) => {
  // Selected Account for Ledger Inspection
  const [inspectAccountId, setInspectAccountId] = useState<string>('');
  const [ledgerPage, setLedgerPage] = useState<PageResponse<LedgerEntryResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  // Account creation state
  const [newUserId, setNewUserId] = useState<string>('admin_test_01');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Snapshot Engine state
  const [snapshotAccountId, setSnapshotAccountId] = useState<string>('');
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);

  // Transaction Lookup state
  const [searchTxId, setSearchTxId] = useState<string>('');
  const [searchedTx, setSearchedTx] = useState<TransactionResponse | null>(null);
  const [isTxLoading, setIsTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  // Load ledger history for selected account
  const handleLoadLedger = async (accId: string, page = 0) => {
    if (!accId.trim()) return;
    setIsLedgerLoading(true);
    setLedgerError(null);
    try {
      const data = await walletApi.getLedgerHistory(accId.trim(), page, 10);
      setLedgerPage(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải lịch sử sổ cái';
      setLedgerError(msg);
    } finally {
      setIsLedgerLoading(false);
    }
  };

  // Create account
  const handleCreateAccount = async () => {
    if (!newUserId.trim()) return;
    setIsCreatingAccount(true);
    try {
      const account = await walletApi.createAccount({ userId: newUserId.trim(), currency: 'VND' });
      showToast(`Tạo thành công tài khoản: ${account.accountId}`);
      setInspectAccountId(account.accountId);
      handleLoadLedger(account.accountId, 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tạo tài khoản thất bại';
      showToast(msg);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Create Snapshot
  const handleTriggerSnapshot = async () => {
    const target = snapshotAccountId || inspectAccountId;
    if (!target.trim()) {
      showToast('Vui lòng nhập Account UUID cần chốt Snapshot');
      return;
    }
    setIsSnapshotLoading(true);
    try {
      const res = await walletApi.createSnapshot(target.trim());
      showToast(`Đã chốt Snapshot số dư: ${res.snapshotBalance.toLocaleString()} VND (Tối ưu truy vấn O(1))`);
      if (target.trim() === inspectAccountId) {
        handleLoadLedger(target.trim(), currentPage);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Chốt snapshot thất bại';
      showToast(msg);
    } finally {
      setIsSnapshotLoading(false);
    }
  };

  // Lookup Transaction
  const handleLookupTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTxId.trim()) return;
    setIsTxLoading(true);
    setTxError(null);
    setSearchedTx(null);
    try {
      const tx = await walletApi.getTransaction(searchTxId.trim());
      setSearchedTx(tx);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không tìm thấy giao dịch';
      setTxError(msg);
    } finally {
      setIsTxLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ocean-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-ocean-600 text-white text-[10px] font-black uppercase tracking-wider">
                Admin Backoffice
              </span>
              <span className="text-xs font-bold text-slate-500">
                Core Banking Engine v2.0
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Trung Tâm Quản Trị & Kiểm Toán Hệ Thống
            </h2>
            <p className="text-xs text-slate-600">
              Giám sát luồng Saga Orchestrator, kiểm định Bút toán kép và tối ưu hóa số dư Snapshot
            </p>
          </div>

          <button
            onClick={onSwitchToUser}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-ocean-50 border border-ocean-300 text-xs font-bold text-ocean-700 shadow-sm transition-all active:scale-95 self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4 text-ocean-600" />
            <span>Về Giao diện Người dùng (User Portal)</span>
          </button>
        </div>

        {/* 4 System Architecture KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-ocean-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Tài khoản Treo Ký quỹ</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-slate-900">SYSTEM_ESCROW</div>
            <p className="text-[11px] text-slate-500">
              Tiền tạm giữ trong bước PENDING, triệt tiêu 100% rủi ro rút ruột ví thụ hưởng.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-ocean-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Khóa Phân Tán</span>
              <Lock className="w-5 h-5 text-sky-600" />
            </div>
            <div className="text-lg font-black text-slate-900">Redisson Watchdog</div>
            <p className="text-[11px] text-slate-500">
              Tự động gia hạn khóa định kỳ mỗi 10s, không bị nhả lock sớm khi Database chậm.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-ocean-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Transactional Outbox</span>
              <Server className="w-5 h-5 text-ocean-600" />
            </div>
            <div className="text-lg font-black text-slate-900">SKIP LOCKED</div>
            <p className="text-[11px] text-slate-500">
              Khóa bi quan ngăn ngừa nhiều node backend đọc trùng bản ghi, đảm bảo gửi tin duy nhất.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-ocean-100 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Tính Số Dư Tối Ưu</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-lg font-black text-slate-900">Checkpoint O(1)</div>
            <p className="text-[11px] text-slate-500">
              Snapshot số dư cố định, chỉ quét các bút toán phát sinh sau thời điểm chốt.
            </p>
          </div>
        </div>

        {/* Section 1: Quick Tools (Account Creator + Snapshot Engine) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tool A: Create Account */}
          <div className="p-6 rounded-3xl bg-white border border-ocean-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Tạo Tài Khoản Ví Mới</h4>
                <p className="text-[11px] text-slate-500">Khởi tạo ví điện tử mới với trạng thái ACTIVE</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="User ID (ví dụ: customer_99)..."
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateAccount}
                isLoading={isCreatingAccount}
              >
                Khởi tạo
              </Button>
            </div>
          </div>

          {/* Tool B: Trigger Snapshot */}
          <div className="p-6 rounded-3xl bg-white border border-ocean-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Công Cụ Chốt Snapshot Số Dư</h4>
                <p className="text-[11px] text-slate-500">Chốt checkpoint số dư định kỳ để tối ưu hiệu năng O(1)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Dán Account UUID cần chốt số dư..."
                value={snapshotAccountId}
                onChange={(e) => setSnapshotAccountId(e.target.value.trim())}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTriggerSnapshot}
                isLoading={isSnapshotLoading}
                icon={<Camera className="w-3.5 h-3.5 text-indigo-600" />}
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                Chốt ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Section 2: Transaction & Saga Inspector */}
        <div className="p-6 rounded-3xl bg-white border border-ocean-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Tra Cứu Giao Dịch Saga (Transaction Inspector)</h4>
                <p className="text-[11px] text-slate-500">Xem trạng thái PENDING &rarr; COMPLETED/FAILED, Khóa Idempotency & Gateway</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLookupTx} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Nhập mã Transaction ID (UUID) cần kiểm tra..."
              value={searchTxId}
              onChange={(e) => setSearchTxId(e.target.value.trim())}
              className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isTxLoading}
              icon={<Search className="w-3.5 h-3.5" />}
            >
              Tra cứu
            </Button>
          </form>

          {/* Transaction Result Display */}
          {txError ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{txError}</span>
            </div>
          ) : searchedTx ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-ocean-200 text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-700">Mã giao dịch: {searchedTx.transactionId}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  searchedTx.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : searchedTx.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {searchedTx.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">Số tiền:</span>
                  <strong className="text-slate-900 font-bold text-sm">{formatVND(searchedTx.amount)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Cổng thanh toán:</span>
                  <strong className="text-ocean-700 font-bold">{searchedTx.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Ví nguồn:</span>
                  <span className="font-mono text-[11px] truncate block">{searchedTx.sourceAccountId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Ví thụ hưởng:</span>
                  <span className="font-mono text-[11px] truncate block">{searchedTx.targetAccountId || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>X-Idempotency-Key: <code className="font-mono text-ocean-700">{searchedTx.idempotencyKey}</code></span>
                <span>Thời gian: {formatDateTime(searchedTx.createdAt)}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Section 3: Double-Entry Ledger Inspector */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-ocean-600" />
                Kiểm Toán Bút Toán Kép Sổ Cái (Ledger Audit Log)
              </h3>
              <p className="text-xs text-slate-500">
                Nhập mã Account UUID của bất kỳ ví nào để kiểm tra toàn bộ dòng tiền DEBIT / CREDIT bất biến
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Dán Account UUID cần kiểm toán..."
                value={inspectAccountId}
                onChange={(e) => {
                  setInspectAccountId(e.target.value.trim());
                  setCurrentPage(0);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-ocean-500 w-full sm:w-72"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleLoadLedger(inspectAccountId, 0)}
                icon={<Search className="w-3.5 h-3.5" />}
              >
                Tải Sổ cái
              </Button>
            </div>
          </div>

          {inspectAccountId ? (
            <LedgerHistoryTable
              ledgerPage={ledgerPage}
              isLoading={isLedgerLoading}
              error={ledgerError}
              currentPage={currentPage}
              onPageChange={(p) => {
                setCurrentPage(p);
                handleLoadLedger(inspectAccountId, p);
              }}
              onRetry={() => handleLoadLedger(inspectAccountId, currentPage)}
            />
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-ocean-200 text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Chọn một tài khoản để kiểm toán</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Nhập Account UUID ở trên để tra cứu lịch sử bút toán kép Sổ cái phục vụ đối soát tài chính.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
