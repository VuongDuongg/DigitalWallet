import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { BalanceCard } from './components/wallet/BalanceCard';
import { LedgerHistoryTable } from './components/wallet/LedgerHistoryTable';
import { TransferModal } from './components/wallet/TransferModal';
import { DepositModal } from './components/wallet/DepositModal';
import { Button } from './components/common/Button';
import { walletApi } from './api/walletApi';
import type { LedgerEntryResponse, PageResponse, TransferRequest } from './types';
import { PlusCircle, Info, CheckCircle2 } from 'lucide-react';

export function App() {
  // Test/Active Account ID (Default state)
  const [accountId, setAccountId] = useState<string>('');
  const [userIdInput, setUserIdInput] = useState<string>('user_vip_01');
  const [balance, setBalance] = useState<number>(0);
  const [ledgerPage, setLedgerPage] = useState<PageResponse<LedgerEntryResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
  });

  // Loading & Error States (4 UI States)
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch Balance
  const fetchBalance = useCallback(async (targetId: string) => {
    if (!targetId) return;
    setIsBalanceLoading(true);
    try {
      const data = await walletApi.getBalance(targetId);
      setBalance(data.balance);
    } catch {
      // Ignored for initial uncreated accounts
    } finally {
      setIsBalanceLoading(false);
    }
  }, []);

  // 2. Fetch Ledger History
  const fetchLedger = useCallback(async (targetId: string, page = 0) => {
    if (!targetId) return;
    setIsLedgerLoading(true);
    setLedgerError(null);
    try {
      const data = await walletApi.getLedgerHistory(targetId, page, 10);
      setLedgerPage(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải lịch sử sổ cái';
      setLedgerError(msg);
    } finally {
      setIsLedgerLoading(false);
    }
  }, []);

  // Refresh all account data
  const handleRefresh = useCallback(() => {
    if (accountId) {
      fetchBalance(accountId);
      fetchLedger(accountId, currentPage);
    }
  }, [accountId, currentPage, fetchBalance, fetchLedger]);

  // Handle Create Account (or connect)
  const handleCreateAccount = async () => {
    if (!userIdInput.trim()) return;
    try {
      const account = await walletApi.createAccount({ userId: userIdInput.trim(), currency: 'VND' });
      setAccountId(account.accountId);
      showToast(`Tạo thành công tài khoản ví: ${account.accountId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tài khoản đã tồn tại hoặc có lỗi';
      showToast(msg);
    }
  };

  // Handle Snapshot
  const handleCreateSnapshot = async () => {
    if (!accountId) return;
    setIsCreatingSnapshot(true);
    try {
      const res = await walletApi.createSnapshot(accountId);
      showToast(`Đã chốt Snapshot: ${res.snapshotBalance.toLocaleString()} VND (Tối ưu truy vấn O(1))`);
      handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Chốt snapshot thất bại';
      showToast(msg);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Handle Deposit
  const handleDeposit = async (accId: string, amount: number) => {
    await walletApi.deposit({ accountId: accId, amount });
    showToast(`Nạp thành công ${amount.toLocaleString()} VND!`);
    handleRefresh();
  };

  // Handle Transfer
  const handleTransfer = async (request: TransferRequest) => {
    await walletApi.transfer(request);
    showToast('Đã gửi lệnh chuyển tiền qua Saga Orchestrator');
    setTimeout(handleRefresh, 1000);
  };

  useEffect(() => {
    let isMounted = true;
    if (accountId && isMounted) {
      fetchBalance(accountId);
      fetchLedger(accountId, currentPage);
    }
    return () => {
      isMounted = false;
    };
  }, [accountId, currentPage, fetchBalance, fetchLedger]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Header onRefresh={handleRefresh} isRefreshing={isBalanceLoading || isLedgerLoading} />

      {/* Global Toast Notification */}
      {toastMessage ? (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-800 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 text-sm text-slate-100 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      ) : null}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Account Selector / Quick Onboarding */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              User ID:
            </label>
            <input
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="Nhập mã user..."
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateAccount}
              icon={<PlusCircle className="w-3.5 h-3.5 text-indigo-400" />}
            >
              Tạo Ví Mới
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Account UUID:
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value.trim());
                setCurrentPage(0);
              }}
              placeholder="Dán mã Account UUID tại đây..."
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-72"
            />
          </div>
        </div>

        {/* Balance & Actions Section */}
        {accountId ? (
          <>
            <BalanceCard
              accountId={accountId}
              balance={balance}
              isLoading={isBalanceLoading}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onOpenDeposit={() => setIsDepositOpen(true)}
              onCreateSnapshot={handleCreateSnapshot}
              isCreatingSnapshot={isCreatingSnapshot}
            />

            {/* Double-Entry Ledger History */}
            <LedgerHistoryTable
              ledgerPage={ledgerPage}
              isLoading={isLedgerLoading}
              error={ledgerError}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onRetry={handleRefresh}
            />
          </>
        ) : (
          <div className="p-16 glass-card rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
              <Info className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Chưa chọn hoặc chưa tạo tài khoản ví</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Nhập tên người dùng ở trên và bấm <strong>&ldquo;Tạo Ví Mới&rdquo;</strong> hoặc dán mã <strong>Account UUID</strong> có sẵn để trải nghiệm luồng giao dịch Core Banking.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {accountId ? (
        <>
          <TransferModal
            isOpen={isTransferOpen}
            onClose={() => setIsTransferOpen(false)}
            sourceAccountId={accountId}
            onSuccess={handleRefresh}
            onTransfer={handleTransfer}
          />

          <DepositModal
            isOpen={isDepositOpen}
            onClose={() => setIsDepositOpen(false)}
            accountId={accountId}
            onSuccess={handleRefresh}
            onDeposit={handleDeposit}
          />
        </>
      ) : null}
    </div>
  );
}

export default App;

