import React, { useState } from 'react';
import type { LinkedBank } from '../../types';
import {
  Search,
  Bell,
  Eye,
  EyeOff,
  Send,
  PlusCircle,
  QrCode,
  ScanLine,
  Smartphone,
  Wifi,
  Zap,
  Film,
  Plane,
  Building,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface MobileHomeViewProps {
  userPhone: string;
  balance: number;
  isBalanceLoading: boolean;
  linkedBanks: LinkedBank[];
  onOpenTransfer: () => void;
  onOpenDeposit: () => void;
  onOpenQr: (initialTab?: 'scan' | 'my-qr') => void;
  onOpenBankLinking: () => void;
  onOpenWalletHub: () => void;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  userPhone,
  balance,
  isBalanceLoading,
  linkedBanks,
  onOpenTransfer,
  onOpenDeposit,
  onOpenQr,
  onOpenBankLinking,
  onOpenWalletHub,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // 4 Nút Hành Động Tròn Đặc Trưng MoMo
  const quickActions = [
    {
      id: 'transfer',
      title: 'Chuyển tiền',
      icon: Send,
      action: onOpenTransfer,
      bgColor: 'bg-ocean-50 text-ocean-600',
    },
    {
      id: 'deposit',
      title: 'Nạp/Rút ví',
      icon: PlusCircle,
      action: onOpenDeposit,
      bgColor: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'scan-qr',
      title: 'Quét mã QR',
      icon: ScanLine,
      action: () => onOpenQr('scan'),
      bgColor: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'my-qr',
      title: 'Mã QR nhận',
      icon: QrCode,
      action: () => onOpenQr('my-qr'),
      bgColor: 'bg-sky-50 text-sky-600',
    },
  ];

  // 8 Icon Tiện Ích Dịch Vụ Chuẩn MoMo
  const services = [
    { id: 'topup', name: 'Nạp tiền ĐT', icon: Smartphone, color: 'text-orange-500 bg-orange-50' },
    { id: 'data4g', name: 'Data 4G/5G', icon: Wifi, color: 'text-sky-500 bg-sky-50' },
    { id: 'bills', name: 'Điện & Nước', icon: Zap, color: 'text-amber-500 bg-amber-50' },
    { id: 'cinema', name: 'Vé xem phim', icon: Film, color: 'text-rose-500 bg-rose-50' },
    { id: 'travel', name: 'Vé máy bay', icon: Plane, color: 'text-blue-500 bg-blue-50' },
    {
      id: 'bank',
      name: 'Liên kết NH',
      icon: Building,
      color: 'text-purple-500 bg-purple-50',
      action: onOpenBankLinking,
    },
  ];

  return (
    <div className="space-y-3.5 pb-24 animate-fade-in text-slate-800">
      {/* 1. TOP HEADER DI ĐỘNG (Xanh Nước Biển Nhạt / Trắng) */}
      <div className="bg-gradient-to-r from-ocean-600 via-ocean-500 to-ocean-600 text-white pt-8 pb-5 px-4 rounded-b-3xl shadow-md space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Avatar & Welcome */}
          <div
            onClick={onOpenWalletHub}
            className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-white text-ocean-600 flex items-center justify-center font-extrabold text-sm shadow-md border-2 border-white/60">
              DW
            </div>
            <div>
              <div className="text-[11px] text-ocean-100 font-medium">Xin chào,</div>
              <div className="text-xs font-black text-white leading-tight">
                {userPhone || 'Khách hàng VIP'}
              </div>
            </div>
          </div>

          {/* Search Bar & Bell */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <div className="relative max-w-[170px] w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm dịch vụ..."
                className="w-full pl-8 pr-2 py-1.5 rounded-full bg-white/90 text-slate-800 placeholder-slate-400 text-[11px] font-semibold focus:outline-none focus:bg-white"
              />
            </div>
            <button
              type="button"
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white relative active:scale-95"
              aria-label="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-400 absolute top-1.5 right-1.5 border border-ocean-600" />
            </button>
          </div>
        </div>

        {/* 2. THẺ SỐ DƯ VÍ NỔI BẬT */}
        <div className="p-3.5 rounded-2xl bg-white text-slate-800 shadow-xl border border-ocean-100/90 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Số dư ví</span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="p-0.5 hover:text-slate-800"
                aria-label={showBalance ? 'Ẩn số dư' : 'Hiện số dư'}
              >
                {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {isBalanceLoading ? (
                <span className="text-xs font-normal text-slate-400">Đang tải...</span>
              ) : showBalance ? (
                <>
                  {balance.toLocaleString('vi-VN')}{' '}
                  <span className="text-xs font-bold text-ocean-600">đ</span>
                </>
              ) : (
                '••••••••'
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {linkedBanks.length > 0 ? (
              <div
                onClick={onOpenWalletHub}
                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: linkedBanks[0].color }}
                />
                <span>{linkedBanks[0].shortName}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenBankLinking}
                className="px-2.5 py-1.5 rounded-xl bg-ocean-50 text-ocean-700 font-bold text-[11px] border border-ocean-200 hover:bg-ocean-100 active:scale-95 flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3 text-ocean-600" />
                <span>Liên kết NH</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 3. CỤM 4 NÚT TRÒN ĐẶC TRƯNG MOMO */}
        <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-white border border-ocean-100 shadow-xs">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={action.action}
                className="flex flex-col items-center justify-center gap-1.5 p-1 group active:scale-90 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${action.bgColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. BANNER QUẢNG CÁO TIỆN ÍCH (Xanh nước nhạt + Khuyến mãi) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-ocean-500 to-sky-400 text-white shadow-md flex items-center justify-between gap-3 relative overflow-hidden">
          <div className="space-y-1 z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Ưu đãi MoMo Fintech
            </span>
            <h4 className="text-xs font-black text-white leading-tight">
              Liên kết Ngân hàng nhận gói quà 200.000đ
            </h4>
            <p className="text-[10px] text-ocean-100">Miễn phí 100% mọi giao dịch chuyển tiền</p>
          </div>
          <button
            type="button"
            onClick={onOpenBankLinking}
            className="px-3 py-1.5 rounded-xl bg-white text-ocean-700 font-extrabold text-[11px] shadow-sm shrink-0 active:scale-95"
          >
            Nhận ngay
          </button>
        </div>

        {/* 5. LƯỚI TIỆN ÍCH DỊCH VỤ */}
        <div className="p-3.5 rounded-3xl bg-white border border-ocean-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-800 uppercase tracking-wider">
              Dịch vụ tài chính & Tiện ích
            </span>
            <span className="text-[11px] font-bold text-ocean-600 flex items-center cursor-pointer">
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {services.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action || onOpenWalletHub}
                  className="p-2.5 rounded-2xl bg-slate-50/80 hover:bg-ocean-50/50 border border-slate-100 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${item.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. CAM KẾT BẢO MẬT CHUẨN PCI-DSS */}
        <div className="p-3 rounded-2xl bg-white border border-ocean-100 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-[11px] text-slate-600 leading-tight">
            <span className="font-bold text-slate-800">Bảo mật chuẩn quốc tế PCI-DSS Level 1</span>
            <p className="text-[10px] text-slate-400">
              Mã hóa dữ liệu kép & Chống gian lận thời gian thực
            </p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-auto" />
        </div>
      </div>
    </div>
  );
};
