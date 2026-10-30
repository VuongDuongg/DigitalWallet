import React, { useState, useEffect } from 'react';
import { MobileHomeView } from './MobileHomeView';
import { MobileWalletHub } from './MobileWalletHub';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileRegistrationFlow } from './MobileRegistrationFlow';
import { MobileBankLinkingFlow } from './MobileBankLinkingFlow';
import { TransferModal } from '../wallet/TransferModal';
import { DepositModal } from '../wallet/DepositModal';
import { QrPaymentModal } from '../wallet/QrPaymentModal';
import { walletApi } from '../../api/walletApi';
import type { LinkedBank, MobileTab, TransferRequest } from '../../types';
import { Gift, Users, History, CheckCircle2, Monitor } from 'lucide-react';

interface MobileAppContainerProps {
  initialAccountId?: string;
  onSwitchToWeb?: () => void;
}

export const MobileAppContainer: React.FC<MobileAppContainerProps> = ({
  initialAccountId = '',
  onSwitchToWeb,
}) => {
  // Kiểm tra phiên đăng nhập từ LocalStorage
  const [session, setSession] = useState<{
    phone: string;
    accountId: string;
    pin: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('digital_wallet_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [userPhone, setUserPhone] = useState<string>(session?.phone || '');
  const [accountId, setAccountId] = useState<string>(session?.accountId || initialAccountId || '');
  const [balance, setBalance] = useState<number>(session ? 139999 : 0);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Flow State: Nếu chưa đăng ký/đăng nhập -> BẮT BUỘC hiện màn hình Đăng ký SĐT (Ảnh 1)!
  const [isRegistering, setIsRegistering] = useState<boolean>(!session);
  const [isBankLinkingOpen, setIsBankLinkingOpen] = useState(false);

  // Modals
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrInitialTab, setQrInitialTab] = useState<'scan' | 'my-qr'>('my-qr');

  // Danh sách ngân hàng liên kết: lưu trong LocalStorage (mặc định rỗng để người dùng tự tay trải nghiệm liên kết)
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[]>(() => {
    try {
      const saved = localStorage.getItem('digital_wallet_linked_banks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch balance from backend if accountId exists
  const fetchBalance = async (targetId: string) => {
    if (!targetId) return;
    setIsBalanceLoading(true);
    try {
      const res = await walletApi.getBalance(targetId);
      setBalance(res.balance);
    } catch {
      // Dùng số dư offline mô phỏng nếu chưa kết nối backend
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) {
      fetchBalance(accountId);
    }
  }, [accountId]);

  // Handle successful registration flow (Ảnh 1)
  const handleRegisterSuccess = async (phone: string, pin: string) => {
    setUserPhone(phone);
    setIsRegistering(false);
    showToast(`Kích hoạt thành công ví cho số ${phone}!`);

    let newAccountId = `acc_${Date.now()}`;
    // Tự động tạo account trên Spring Boot Backend
    try {
      const newAcc = await walletApi.createAccount({ userId: phone, currency: 'VND' });
      newAccountId = newAcc.accountId;
    } catch {
      // Dự phòng mã mô phỏng nếu backend chưa chạy
    }

    setAccountId(newAccountId);
    const newSession = { phone, accountId: newAccountId, pin };
    setSession(newSession);
    localStorage.setItem('digital_wallet_session', JSON.stringify(newSession));
    setActiveTab('home');
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('digital_wallet_session');
    setSession(null);
    setUserPhone('');
    setAccountId('');
    setIsRegistering(true);
    showToast('Đã đăng xuất tài khoản ví');
  };

  // Handle successful bank linking flow (Ảnh 2)
  const handleBankLinkingSuccess = (newBank: LinkedBank) => {
    setLinkedBanks((prev) => {
      const updated = [newBank, ...prev];
      localStorage.setItem('digital_wallet_linked_banks', JSON.stringify(updated));
      return updated;
    });
    setIsBankLinkingOpen(false);
    showToast(`Đã liên kết thành công thẻ ${newBank.shortName}!`);
    setActiveTab('wallet');
  };

  // Handle unlink bank
  const handleUnlinkBank = (bankId: string) => {
    setLinkedBanks((prev) => {
      const updated = prev.filter((b) => b.id !== bankId);
      localStorage.setItem('digital_wallet_linked_banks', JSON.stringify(updated));
      return updated;
    });
    showToast('Đã hủy liên kết thẻ ngân hàng');
  };

  // Handle Deposit
  const handleDeposit = async (accId: string, amount: number) => {
    try {
      await walletApi.deposit({ accountId: accId, amount });
    } catch {
      setBalance((prev) => prev + amount);
    }
    setBalance((prev) => prev + amount);
    showToast(`Nạp thành công ${amount.toLocaleString('vi-VN')} đ từ ${linkedBanks[0]?.shortName || 'Ngân hàng'}!`);
  };

  // Handle Transfer
  const handleTransfer = async (request: TransferRequest) => {
    try {
      await walletApi.transfer(request);
    } catch {
      setBalance((prev) => Math.max(0, prev - request.amount));
    }
    setBalance((prev) => Math.max(0, prev - request.amount));
    showToast(`Chuyển ${request.amount.toLocaleString('vi-VN')} đ thành công!`);
  };

  const handleOpenQr = (tab: 'scan' | 'my-qr' = 'my-qr') => {
    setQrInitialTab(tab);
    setIsQrOpen(true);
  };

  // 1. Nếu đang mở Quy trình Đăng ký & Kích hoạt ví (Ảnh 1)
  if (isRegistering) {
    return (
      <div className="max-w-md mx-auto w-full min-h-screen bg-slate-900 shadow-2xl relative">
        <MobileRegistrationFlow
          onSuccess={handleRegisterSuccess}
          onCancel={() => setIsRegistering(false)}
        />
      </div>
    );
  }

  // 2. Nếu đang mở Quy trình Liên kết Ngân hàng (Ảnh 2 - Màn 2, 3, 4)
  if (isBankLinkingOpen) {
    return (
      <div className="max-w-md mx-auto w-full min-h-screen bg-slate-50 shadow-2xl relative">
        <MobileBankLinkingFlow
          userPhone={userPhone}
          onSuccess={handleBankLinkingSuccess}
          onBack={() => setIsBankLinkingOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto w-full min-h-screen bg-slate-50 shadow-2xl relative flex flex-col justify-between font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-slate-900/90 text-white border border-ocean-400/40 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 max-w-xs text-center animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Toggle to Switch to Web (when viewed on PC) */}
      {onSwitchToWeb && (
        <div className="fixed top-3 right-3 z-50">
          <button
            type="button"
            onClick={onSwitchToWeb}
            className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-[11px] font-bold shadow-lg border border-slate-200 flex items-center gap-1.5 backdrop-blur-md active:scale-95 transition-all"
          >
            <Monitor className="w-3.5 h-3.5 text-ocean-600" />
            <span>Xem bản Web</span>
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 w-full">
        {/* TAB 1: TRANG CHỦ */}
        {activeTab === 'home' && (
          <MobileHomeView
            userPhone={userPhone}
            balance={balance}
            isBalanceLoading={isBalanceLoading}
            linkedBanks={linkedBanks}
            onOpenTransfer={() => setIsTransferOpen(true)}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenQr={handleOpenQr}
            onOpenBankLinking={() => setIsBankLinkingOpen(true)}
            onOpenWalletHub={() => setActiveTab('wallet')}
          />
        )}

        {/* TAB 2: ƯU ĐÃI */}
        {activeTab === 'promos' && (
          <div className="p-4 pt-10 space-y-4 animate-fade-in pb-24">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800">Kho Ưu đãi MoMo</h2>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                16 Voucher
              </span>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Giảm 50.000đ Nạp tiền điện thoại', exp: 'HSD: 30/11/2026', code: 'TOPUP50' },
                { title: 'Miễn phí chuyển tiền mọi ngân hàng', exp: 'Vô thời hạn', code: 'FREESHIP' },
                { title: 'Hoàn 20% thanh toán hóa đơn Điện/Nước', exp: 'HSD: 15/12/2026', code: 'BILL20' },
              ].map((v, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white border border-ocean-100 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{v.title}</div>
                      <div className="text-[10px] text-slate-400">{v.exp}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast(`Đã áp dụng mã ${v.code}`)}
                    className="px-3 py-1.5 rounded-xl bg-ocean-600 text-white font-bold text-[11px] active:scale-95"
                  >
                    Dùng
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LỊCH SỬ GIAO DỊCH */}
        {activeTab === 'history' && (
          <div className="p-4 pt-10 space-y-4 animate-fade-in pb-24">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-ocean-600" />
              Lịch sử giao dịch
            </h2>

            <div className="space-y-2.5">
              {[
                { type: 'Nhận tiền từ TPBank', amount: '+500,000 đ', time: '14:32 - Hôm nay', plus: true },
                { type: 'Chuyển tiền tới 0912***890', amount: '-120,000 đ', time: '11:15 - Hôm nay', plus: false },
                { type: 'Nạp Data 4G Viettel', amount: '-50,000 đ', time: '09:00 - Hôm qua', plus: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-ocean-100 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.type}</div>
                    <div className="text-[10px] text-slate-400">{item.time}</div>
                  </div>
                  <div
                    className={`text-xs font-black ${
                      item.plus ? 'text-emerald-600' : 'text-slate-800'
                    }`}
                  >
                    {item.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BẠN BÈ */}
        {activeTab === 'friends' && (
          <div className="p-4 pt-10 space-y-4 animate-fade-in pb-24">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-ocean-600" />
              Bạn bè & Danh bạ
            </h2>
            <p className="text-xs text-slate-500">Chuyển tiền và chia tiền nhóm tức thì</p>

            <div className="space-y-2">
              {['Trần Thị Mai (0978***112)', 'Lê Hoàng Nam (0982***334)', 'Phạm Quốc Bảo (0903***556)'].map(
                (name, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-ocean-100 shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-ocean-100 text-ocean-700 flex items-center justify-center font-bold text-xs">
                        {name[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTransferOpen(true)}
                      className="px-3 py-1 rounded-xl bg-ocean-50 text-ocean-700 font-bold text-[11px] active:scale-95"
                    >
                      Chuyển
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* TAB 5: VÍ CỦA TÔI (Ảnh 2 - Màn 1) */}
        {activeTab === 'wallet' && (
          <MobileWalletHub
            userPhone={userPhone}
            accountId={accountId}
            balance={balance}
            isBalanceLoading={isBalanceLoading}
            linkedBanks={linkedBanks}
            onOpenBankLinking={() => setIsBankLinkingOpen(true)}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenTransfer={() => setIsTransferOpen(true)}
            onOpenQr={() => handleOpenQr('my-qr')}
            onUnlinkBank={handleUnlinkBank}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* 5-Tab Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals for Transfer, Deposit, QR */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        sourceAccountId={accountId || 'acc_default'}
        onSuccess={() => fetchBalance(accountId)}
        onTransfer={handleTransfer}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        accountId={accountId || 'acc_default'}
        onSuccess={() => fetchBalance(accountId)}
        onDeposit={handleDeposit}
      />

      <QrPaymentModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        accountId={accountId || 'acc_default'}
        initialTab={qrInitialTab}
      />
    </div>
  );
};

