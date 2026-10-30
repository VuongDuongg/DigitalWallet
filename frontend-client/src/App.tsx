import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { MobileAppContainer } from './components/mobile/MobileAppContainer';
import { Header } from './components/layout/Header';
import { HeroBanner } from './components/home/HeroBanner';
import { ServiceCategories } from './components/home/ServiceCategories';
import { WhyChooseUs } from './components/home/WhyChooseUs';
import { PartnerLogos } from './components/home/PartnerLogos';
import { SecurityCompliance } from './components/home/SecurityCompliance';
import { AppDownloadCTA } from './components/home/AppDownloadCTA';
import { Footer } from './components/layout/Footer';
import { BalanceCard } from './components/wallet/BalanceCard';
import { TransferModal } from './components/wallet/TransferModal';
import { DepositModal } from './components/wallet/DepositModal';
import { QrPaymentModal } from './components/wallet/QrPaymentModal';
import { Button } from './components/common/Button';
import { walletApi } from './api/walletApi';
import type { TransferRequest } from './types';
import {
  Wallet,
  User,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function App() {
  const isNative = Capacitor.isNativePlatform();
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [accountId, setAccountId] = useState<string>('');
  const [userIdInput, setUserIdInput] = useState<string>('customer_vip_01');
  const [balance, setBalance] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>('transfer');
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const walletSectionRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const scrollToWallet = () => {
    walletSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch Balance
  const fetchBalance = useCallback(async (targetId: string) => {
    if (!targetId) return;
    setIsBalanceLoading(true);
    try {
      const data = await walletApi.getBalance(targetId);
      setBalance(data.balance);
    } catch {
      // Ignored for uncreated accounts
    } finally {
      setIsBalanceLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    if (accountId) {
      fetchBalance(accountId);
    }
  }, [accountId, fetchBalance]);

  // Create new customer account
  const handleCreateAccount = async () => {
    if (!userIdInput.trim()) return;
    try {
      const account = await walletApi.createAccount({ userId: userIdInput.trim(), currency: 'VND' });
      setAccountId(account.accountId);
      showToast(`Mở thành công tài khoản ví mới: ${account.accountId}`);
      scrollToWallet();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tài khoản đã tồn tại hoặc có lỗi';
      showToast(msg);
    }
  };

  // Customer snapshot
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

  // Deposit
  const handleDeposit = async (accId: string, amount: number) => {
    await walletApi.deposit({ accountId: accId, amount });
    showToast(`Nạp thành công ${amount.toLocaleString()} VND vào ví!`);
    handleRefresh();
  };

  // Transfer
  const handleTransfer = async (request: TransferRequest) => {
    await walletApi.transfer(request);
    showToast('Đã gửi lệnh chuyển tiền qua Saga Orchestrator');
    setTimeout(handleRefresh, 1000);
  };

  // Service select
  const handleSelectService = (serviceId: string) => {
    setActiveCategory(serviceId);
    if (serviceId === 'transfer') {
      if (accountId) setIsTransferOpen(true);
      else scrollToWallet();
    } else if (serviceId === 'deposit') {
      if (accountId) setIsDepositOpen(true);
      else scrollToWallet();
    } else if (serviceId === 'snapshot') {
      if (accountId) handleCreateSnapshot();
      else scrollToWallet();
    } else {
      scrollToWallet();
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (accountId && isMounted) {
      fetchBalance(accountId);
    }
    return () => {
      isMounted = false;
    };
  }, [accountId, fetchBalance]);

  // 1. Khi chạy trên Native Android (Capacitor): Tự động hiển thị 100% Giao diện Mobile App MoMo
  if (isNative) {
    return <MobileAppContainer initialAccountId={accountId} />;
  }

  // 2. Khi người dùng bấm chuyển sang chế độ Mobile App trên Web
  if (isMobileMode) {
    return (
      <div className="min-h-screen bg-slate-900/95 flex items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md h-screen sm:h-[94vh] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-y-auto relative bg-slate-50">
          <MobileAppContainer
            initialAccountId={accountId}
            onSwitchToWeb={() => setIsMobileMode(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* 1. Header Navigation Bar */}
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isBalanceLoading}
        currentAccountId={accountId}
        onOpenMyWallet={scrollToWallet}
        onOpenMobileMode={() => setIsMobileMode(true)}
      />

      {/* Global Toast Notification */}
      {toastMessage ? (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-white border border-ocean-300 shadow-2xl shadow-ocean-500/20 text-sm text-slate-800 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      ) : null}

      <main className="flex-1 space-y-0">
        {/* 2. MoMo Hero Banner (Wavy Soft Blue Background, Typography & Voucher Art) */}
        <HeroBanner
          onOpenTransfer={() => (accountId ? setIsTransferOpen(true) : scrollToWallet())}
          onOpenDeposit={() => (accountId ? setIsDepositOpen(true) : scrollToWallet())}
        />

        {/* 3. Tiện ích và dịch vụ MoMo Style */}
        <ServiceCategories
          activeServiceId={activeCategory}
          onSelectAction={handleSelectService}
        />

        {/* 4. Khung "Ví của tôi" (Customer Wallet Card) */}
        <section ref={walletSectionRef} className="py-12 bg-slate-50/70 border-b border-ocean-100" id="my-wallet-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-ocean-100 text-ocean-700 text-xs font-bold border border-ocean-200">
                  <Wallet className="w-3.5 h-3.5 text-ocean-600" />
                  <span>Ví Của Tôi (Customer Account)</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  Tài khoản & Số dư Khả dụng
                </h3>
              </div>
            </div>

            {/* Account Onboarding Bar */}
            <div className="p-4 rounded-2xl bg-white border border-ocean-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-ocean-600" />
                  User ID:
                </label>
                <input
                  type="text"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="Nhập tên người dùng..."
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white w-full sm:w-44"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateAccount}
                  icon={<PlusCircle className="w-3.5 h-3.5" />}
                >
                  Mở Ví Mới
                </Button>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
                  Mã ví (UUID):
                </label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value.trim())}
                  placeholder="Dán mã Account UUID của bạn..."
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-ocean-800 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white w-full sm:w-80"
                />
              </div>
            </div>

            {/* Balance Card Component */}
            {accountId ? (
              <BalanceCard
                accountId={accountId}
                balance={balance}
                isLoading={isBalanceLoading}
                onOpenTransfer={() => setIsTransferOpen(true)}
                onOpenDeposit={() => setIsDepositOpen(true)}
                onCreateSnapshot={handleCreateSnapshot}
                isCreatingSnapshot={isCreatingSnapshot}
                onOpenQr={() => setIsQrOpen(true)}
              />
            ) : (
              <div className="p-10 rounded-3xl bg-white border border-ocean-200/90 text-center space-y-3 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-ocean-50 text-ocean-600 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Chưa kết nối tài khoản ví
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Nhập tên ở thanh trên và bấm <strong>&ldquo;Mở Ví Mới&rdquo;</strong> hoặc dán mã ví UUID để quản lý số dư và chuyển tiền ngay.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 5. Tại sao chọn Ví Điện Tử */}
        <WhyChooseUs />

        {/* 6. Đối tác ngân hàng & Cổng thanh toán */}
        <PartnerLogos />

        {/* 7. Bảo mật chuẩn quốc tế */}
        <SecurityCompliance />

        {/* 8. Tải ứng dụng trên App Store / Google Play */}
        <AppDownloadCTA />
      </main>

      {/* 9. Chân trang đa cột */}
      <Footer />

      {/* Modals for User Transfers & Deposits */}
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

          <QrPaymentModal
            isOpen={isQrOpen}
            onClose={() => setIsQrOpen(false)}
            accountId={accountId}
          />
        </>
      ) : null}
    </div>
  );
}

export default App;
