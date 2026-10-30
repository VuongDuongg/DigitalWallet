import React, { useState } from 'react';
import type { LinkedBank } from '../../types';
import {
  Eye,
  EyeOff,
  CreditCard,
  Receipt,
  Gift,
  Link as LinkIcon,
  ChevronRight,
  ShieldAlert,
  Camera,
  Plus,
  Trash2,
  Lock,
  Sparkles,
} from 'lucide-react';

interface MobileWalletHubProps {
  userPhone: string;
  accountId: string;
  balance: number;
  isBalanceLoading: boolean;
  linkedBanks: LinkedBank[];
  onOpenBankLinking: () => void;
  onOpenDeposit: () => void;
  onOpenTransfer: () => void;
  onOpenQr: () => void;
  onUnlinkBank: (bankId: string) => void;
}

export const MobileWalletHub: React.FC<MobileWalletHubProps> = ({
  userPhone,
  accountId,
  balance,
  isBalanceLoading,
  linkedBanks,
  onOpenBankLinking,
  onOpenDeposit,
  onOpenTransfer,
  onOpenQr,
  onUnlinkBank,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="space-y-3.5 pb-24 animate-fade-in text-slate-800">
      {/* 1. TOP HEADER (Ví của tôi) */}
      <div className="bg-gradient-to-r from-ocean-600 via-ocean-500 to-ocean-600 text-white pt-9 pb-5 px-5 rounded-b-3xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-white">Ví của tôi</h2>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-ocean-100 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
              ID: {userPhone || '0968 *** 123'}
            </span>
          </div>
        </div>

        {/* 2. CARD SỐ DƯ TRONG VÍ (Ảnh 2 - Màn 1) */}
        <div className="p-4 rounded-2xl bg-white text-slate-800 shadow-xl border border-ocean-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>Số dư trong ví</span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 hover:text-slate-800 transition-colors"
                aria-label={showBalance ? 'Ẩn số dư' : 'Hiện số dư'}
              >
                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] font-bold text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full">
              Khả dụng
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {isBalanceLoading ? (
                <span className="text-sm font-normal text-slate-400">Đang cập nhật...</span>
              ) : showBalance ? (
                <>
                  {balance.toLocaleString('vi-VN')}{' '}
                  <span className="text-sm font-bold text-ocean-600">đ</span>
                </>
              ) : (
                '••••••••'
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenQr}
                className="px-2.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-extrabold text-xs active:scale-95 transition-all"
                title="Mã QR ví của tôi"
              >
                Mã QR
              </button>
              <button
                type="button"
                onClick={onOpenDeposit}
                className="px-3 py-1.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-extrabold text-xs shadow-md shadow-ocean-500/20 active:scale-95 transition-all"
              >
                Nạp tiền
              </button>
              <button
                type="button"
                onClick={onOpenTransfer}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs active:scale-95 transition-all"
              >
                Chuyển
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* 3. CARD eKYC XÁC THỰC DANH TÍNH (Ảnh 2 - Màn 1) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-extrabold text-slate-800">Xác thực tài khoản (eKYC)</div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Hoàn tất để tăng hạn mức chuyển tiền lên 50.000.000đ/ngày
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs shrink-0 flex items-center gap-1 active:scale-95 transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Chụp ngay</span>
          </button>
        </div>

        {/* 4. KHỐI THÀNH VIÊN & ƯU ĐÃI (Ảnh 2 - Màn 1) */}
        <div className="p-3 rounded-2xl bg-white border border-ocean-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-ocean-100 text-ocean-700 flex items-center justify-center font-bold text-xs">
                ⭐
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Thành viên Chuẩn</div>
                <div className="text-[10px] text-slate-400">
                  Còn 100 điểm để trở thành Thành viên Bạc
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-ocean-500 h-full w-2/5 rounded-full" />
          </div>

          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Săn thưởng cùng ví: Mở kho báu nhận quà</span>
            </div>
            <span className="font-bold text-ocean-600 text-[11px]">Tham gia</span>
          </div>
        </div>

        {/* 5. KHỐI QUẢN LÝ THẺ / TÀI KHOẢN NGÂN HÀNG (Ảnh 2 - Màn 1) */}
        <div className="p-4 rounded-3xl bg-white border border-ocean-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-ocean-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Quản lý thẻ / tài khoản
              </h3>
            </div>
            <button
              type="button"
              onClick={onOpenBankLinking}
              className="text-xs font-bold text-ocean-600 hover:text-ocean-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mới</span>
            </button>
          </div>

          {/* List of Linked Banks */}
          {linkedBanks.length > 0 ? (
            <div className="space-y-2">
              {linkedBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="p-3 rounded-2xl border border-slate-200/90 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                      style={{ backgroundColor: bank.color }}
                    >
                      {bank.shortName.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{bank.shortName}</span>
                        <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-mono">
                          Đã liên kết
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {bank.accountNumberMasked}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUnlinkBank(bank.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Hủy liên kết thẻ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={onOpenBankLinking}
              className="p-4 rounded-2xl border-2 border-dashed border-ocean-200 bg-ocean-50/40 text-center space-y-1.5 cursor-pointer hover:bg-ocean-50/70 transition-all group"
            >
              <CreditCard className="w-6 h-6 text-ocean-500 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-slate-700">Chưa có thẻ/tài khoản liên kết</div>
              <p className="text-[11px] text-ocean-700 font-medium">
                Bấm vào đây để liên kết ngân hàng nhận ưu đãi nạp tiền miễn phí
              </p>
            </div>
          )}
        </div>

        {/* 6. LIST GROUP DỊCH VỤ VÀ HÓA ĐƠN (Ảnh 2 - Màn 1) */}
        <div className="rounded-3xl bg-white border border-ocean-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {/* Hóa đơn */}
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Hóa đơn</div>
                <div className="text-[11px] text-slate-400">Chưa có hóa đơn nào</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          {/* Thẻ quà tặng */}
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Thẻ quà tặng</div>
                <div className="text-[11px] text-rose-600 font-bold">16 thẻ quà tặng chưa dùng</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          {/* Dịch vụ liên kết */}
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Dịch vụ liên kết</div>
                <div className="text-[11px] text-slate-400">Apple, Google Play, Netflix...</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          {/* Bảo mật ví */}
          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Bảo mật tài khoản</div>
                <div className="text-[11px] text-slate-400">Mã PIN 6 số, Sinh trắc học</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </div>

        {/* Thông tin ví UUID hệ thống */}
        <div className="text-center text-[10px] text-slate-400 font-mono pt-1">
          UUID: {accountId ? `${accountId.slice(0, 16)}...` : 'Chưa kết nối'}
        </div>
      </div>
    </div>
  );
};
