import React from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { ServiceCategories } from '../components/home/ServiceCategories';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { PartnerLogos } from '../components/home/PartnerLogos';
import { SecurityCompliance } from '../components/home/SecurityCompliance';
import { AppDownloadCTA } from '../components/home/AppDownloadCTA';
import { BalanceCard } from '../components/wallet/BalanceCard';
import { Button } from '../components/common/Button';
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  User,
  PlusCircle,
} from 'lucide-react';

export interface UserPortalProps {
  accountId: string;
  balance: number;
  isBalanceLoading: boolean;
  userIdInput: string;
  onUserIdInputChange: (val: string) => void;
  onAccountIdChange: (val: string) => void;
  onCreateAccount: () => void;
  onOpenTransfer: () => void;
  onOpenDeposit: () => void;
  onCreateSnapshot: () => void;
  isCreatingSnapshot: boolean;
  onSwitchToAdmin: () => void;
  onSelectService: (serviceId: string) => void;
  activeServiceCategory: string;
}

export const UserPortal: React.FC<UserPortalProps> = ({
  accountId,
  balance,
  isBalanceLoading,
  userIdInput,
  onUserIdInputChange,
  onAccountIdChange,
  onCreateAccount,
  onOpenTransfer,
  onOpenDeposit,
  onCreateSnapshot,
  isCreatingSnapshot,
  onSwitchToAdmin,
  onSelectService,
  activeServiceCategory,
}) => {
  return (
    <div className="space-y-0">
      {/* 1. Hero Banner MoMo Style */}
      <HeroBanner
        onOpenTransfer={onOpenTransfer}
        onOpenDeposit={onOpenDeposit}
      />

      {/* 2. Tiện ích và dịch vụ MoMo */}
      <ServiceCategories
        activeServiceId={activeServiceCategory}
        onSelectAction={onSelectService}
      />

      {/* 3. Khung "Ví của tôi" (Customer Wallet Experience) */}
      <section className="py-12 bg-slate-50/70 border-b border-ocean-100" id="my-wallet-section">
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

            {/* Switch to Admin portal button */}
            <button
              onClick={onSwitchToAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-ocean-50 border border-ocean-200 text-xs font-bold text-ocean-700 shadow-2xs hover:shadow-xs transition-all active:scale-95 self-start sm:self-auto"
            >
              <span>Vào trang Quản trị Hệ thống (Admin)</span>
              <ArrowRight className="w-4 h-4 text-ocean-600" />
            </button>
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
                onChange={(e) => onUserIdInputChange(e.target.value)}
                placeholder="Nhập tên người dùng..."
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white w-full sm:w-44"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={onCreateAccount}
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
                onChange={(e) => onAccountIdChange(e.target.value.trim())}
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
              onOpenTransfer={onOpenTransfer}
              onOpenDeposit={onOpenDeposit}
              onCreateSnapshot={onCreateSnapshot}
              isCreatingSnapshot={isCreatingSnapshot}
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

      {/* 4. Tại sao chọn Ví Điện Tử */}
      <WhyChooseUs />

      {/* 5. Đối tác ngân hàng & Cổng thanh toán */}
      <PartnerLogos />

      {/* 6. Bảo mật chuẩn quốc tế */}
      <SecurityCompliance />

      {/* 7. Tải ứng dụng trên App Store / Google Play */}
      <AppDownloadCTA />
    </div>
  );
};

