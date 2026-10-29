import { useState } from 'react';
import { AdminSidebar, type AdminTab } from './components/layout/AdminSidebar';
import { AdminTopbar } from './components/layout/AdminTopbar';
import { LedgerHistoryTable } from './components/wallet/LedgerHistoryTable';
import { Button } from './components/common/Button';
import { adminApi } from './api/adminApi';
import type { LedgerEntryResponse, PageResponse, TransactionResponse } from './types';
import {
  ShieldCheck,
  Lock,
  Search,
  Camera,
  Server,
  FileCheck2,
  Clock,
  AlertCircle,
  PlusCircle,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { formatVND, formatDateTime } from './utils/formatters';

export function App() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ledger Audit Log State
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load ledger history for selected account
  const handleLoadLedger = async (accId: string, page = 0) => {
    if (!accId.trim()) return;
    setIsLedgerLoading(true);
    setLedgerError(null);
    try {
      const data = await adminApi.getLedgerAuditLog(accId.trim(), page, 10);
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
      const account = await adminApi.createAccount({ userId: newUserId.trim(), currency: 'VND' });
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

  // Trigger Snapshot
  const handleTriggerSnapshot = async () => {
    const target = snapshotAccountId || inspectAccountId;
    if (!target.trim()) {
      showToast('Vui lòng nhập Account UUID cần chốt Snapshot');
      return;
    }
    setIsSnapshotLoading(true);
    try {
      const res = await adminApi.triggerSnapshot(target.trim());
      showToast(`Đã chốt Snapshot số dư: ${res.snapshotBalance.toLocaleString()} VND (Tối ưu hóa O(1))`);
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
      const tx = await adminApi.inspectTransaction(searchTxId.trim());
      setSearchedTx(tx);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không tìm thấy giao dịch';
      setTxError(msg);
    } finally {
      setIsTxLoading(false);
    }
  };

  const tabTitles: Record<AdminTab, string> = {
    overview: 'Tổng quan Hệ sinh thái Core Banking',
    ledger: 'Kiểm toán Sổ cái kép (Double-Entry Ledger Audit Log)',
    snapshot: 'Hệ thống Chốt Snapshot Số Dư Định Kỳ (Engine O(1))',
    saga: 'Trình Tra Cứu Giao Dịch Saga & Outbox Events',
    accounts: 'Quản trị Danh bạ & Tài khoản Ví Khách hàng',
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. Main Administration Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          title={tabTitles[activeTab]}
          onRefresh={() => {
            setIsRefreshing(true);
            if (inspectAccountId) handleLoadLedger(inspectAccountId, currentPage);
            setTimeout(() => setIsRefreshing(false), 800);
          }}
          isRefreshing={isRefreshing}
        />

        {/* Global Toast Notification */}
        {toastMessage ? (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-2.5 shadow-2xl animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        ) : null}

        <main className="p-8 space-y-8 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* 4 Architecture KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Tài khoản Treo Ký quỹ</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900">SYSTEM_ESCROW</div>
                  <p className="text-[11px] text-slate-500">
                    Tiền tạm giữ trong bước PENDING, triệt tiêu 100% rủi ro rút ruột ví thụ hưởng.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Khóa Phân Tán</span>
                    <Lock className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900">Redisson Watchdog</div>
                  <p className="text-[11px] text-slate-500">
                    Tự động gia hạn khóa định kỳ mỗi 10s, không bị nhả lock sớm khi Database chậm.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Transactional Outbox</span>
                    <Server className="w-5 h-5 text-ocean-600" />
                  </div>
                  <div className="text-lg font-black text-slate-900">SKIP LOCKED</div>
                  <p className="text-[11px] text-slate-500">
                    Khóa bi quan ngăn ngừa nhiều node backend đọc trùng bản ghi, đảm bảo gửi tin duy nhất.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
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

              {/* Quick Operation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
                      <PlusCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Tạo Tài Khoản Ví Mới</h4>
                      <p className="text-[11px] text-slate-500">Khởi tạo ví mới với trạng thái ACTIVE</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="User ID..."
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
                    />
                    <Button variant="primary" size="sm" onClick={handleCreateAccount} isLoading={isCreatingAccount}>
                      Khởi tạo
                    </Button>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Chốt Snapshot Số Dư</h4>
                      <p className="text-[11px] text-slate-500">Chốt checkpoint số dư để tối ưu hiệu năng O(1)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Dán Account UUID..."
                      value={snapshotAccountId}
                      onChange={(e) => setSnapshotAccountId(e.target.value.trim())}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                    <Button variant="outline" size="sm" onClick={handleTriggerSnapshot} isLoading={isSnapshotLoading}>
                      Chốt ngay
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEDGER AUDIT */}
          {activeTab === 'ledger' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tìm kiếm Sổ cái theo Account UUID</h3>
                  <p className="text-xs text-slate-500">Đối soát toàn bộ bút toán Ghi Nợ (DEBIT) và Ghi Có (CREDIT) bất biến</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Dán mã Account UUID tại đây..."
                    value={inspectAccountId}
                    onChange={(e) => {
                      setInspectAccountId(e.target.value.trim());
                      setCurrentPage(0);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white w-full sm:w-80"
                  />
                  <Button variant="primary" size="sm" onClick={() => handleLoadLedger(inspectAccountId, 0)} icon={<Search className="w-3.5 h-3.5" />}>
                    Kiểm toán
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
                <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
                  <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">Chưa chọn tài khoản kiểm toán</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Nhập mã Account UUID ở trên để tra cứu lịch sử bút toán kép Sổ cái phục vụ đối soát tài chính.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SNAPSHOT ENGINE */}
          {activeTab === 'snapshot' && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Khởi chạy Checkpoint Snapshotting</h3>
                    <p className="text-xs text-slate-500">Giảm thời gian tính tổng SUM() từ O(N) xuống O(1) bằng cách chốt số dư định kỳ</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Mã tài khoản (Account UUID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    value={snapshotAccountId}
                    onChange={(e) => setSnapshotAccountId(e.target.value.trim())}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleTriggerSnapshot}
                    isLoading={isSnapshotLoading}
                    icon={<Camera className="w-4 h-4" />}
                    className="w-full"
                  >
                    Kích hoạt Chốt Snapshot Ngay
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAGA INSPECTOR */}
          {activeTab === 'saga' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Tra cứu Giao dịch Saga & Outbox Events</h3>
                    <p className="text-xs text-slate-500">Kiểm tra trạng thái PENDING &rarr; COMPLETED / FAILED, Idempotency Hash và Cổng thanh toán</p>
                  </div>
                </div>

                <form onSubmit={handleLookupTx} className="flex items-center gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Nhập mã Transaction ID (UUID)..."
                    value={searchTxId}
                    onChange={(e) => setSearchTxId(e.target.value.trim())}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
                  />
                  <Button type="submit" variant="primary" size="md" isLoading={isTxLoading} icon={<Search className="w-4 h-4" />}>
                    Tra cứu
                  </Button>
                </form>

                {txError ? (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{txError}</span>
                  </div>
                ) : searchedTx ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <span className="font-bold text-slate-800 text-sm">Giao dịch: {searchedTx.transactionId}</span>
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                        searchedTx.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : searchedTx.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {searchedTx.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Số tiền</span>
                        <strong className="text-slate-900 font-extrabold text-base">{formatVND(searchedTx.amount)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Cổng đối tác</span>
                        <strong className="text-ocean-700 font-bold">{searchedTx.paymentMethod}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Tài khoản nguồn</span>
                        <span className="font-mono text-xs text-slate-800 truncate block">{searchedTx.sourceAccountId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Tài khoản thụ hưởng</span>
                        <span className="font-mono text-xs text-slate-800 truncate block">{searchedTx.targetAccountId || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span>X-Idempotency-Key: <code className="font-mono text-ocean-700 font-bold">{searchedTx.idempotencyKey}</code></span>
                      <span>Thời gian khởi tạo: {formatDateTime(searchedTx.createdAt)}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* TAB 5: ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Đăng ký & Kích hoạt Tài khoản Ví</h3>
                    <p className="text-xs text-slate-500">Mở tài khoản ví điện tử mới với trạng thái ACTIVE</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">User ID</label>
                  <input
                    type="text"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
                  />
                  <Button variant="primary" size="md" onClick={handleCreateAccount} isLoading={isCreatingAccount} className="w-full">
                    Tạo Tài Khoản
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
