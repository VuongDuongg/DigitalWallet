import React, { useState } from 'react';
import { POPULAR_BANKS } from '../../data/mockBanks';
import type { BankInfo, LinkedBank, BankLinkingStep } from '../../types';
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  Building2,
  Lock,
  PhoneCall,
} from 'lucide-react';

interface MobileBankLinkingFlowProps {
  userPhone: string;
  onSuccess: (newBank: LinkedBank) => void;
  onBack: () => void;
}

export const MobileBankLinkingFlow: React.FC<MobileBankLinkingFlowProps> = ({
  userPhone,
  onSuccess,
  onBack,
}) => {
  const [step, setStep] = useState<BankLinkingStep>('SELECT_BANK');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankInfo>(POPULAR_BANKS[8]); // Default TPBank as in screenshot
  const [cardNumber, setCardNumber] = useState('9704231899210045');
  const [cardHolder, setCardHolder] = useState('NGUYEN VAN A');
  const [citizenId, setCitizenId] = useState('001201018992');
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter banks by search query
  const filteredBanks = POPULAR_BANKS.filter(
    (b) =>
      b.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle select bank
  const handleSelectBank = (bank: BankInfo) => {
    setSelectedBank(bank);
    setErrorMsg('');
    setStep('CARD_INFO');
  };

  // Submit card info
  const handleCardInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber.trim() || cardNumber.length < 12) {
      setErrorMsg('Vui lòng nhập số thẻ ATM hợp lệ (ít nhất 12 chữ số)');
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMsg('Vui lòng nhập họ tên chủ thẻ');
      return;
    }
    if (!citizenId.trim() || citizenId.length < 9) {
      setErrorMsg('Vui lòng nhập CMND/CCCD hợp lệ');
      return;
    }
    setErrorMsg('');
    setOtpCode('889922'); // Mô phỏng mã OTP
    setStep('OTP_CONFIRM');
  };

  // Confirm OTP linking
  const handleConfirmOtp = () => {
    if (otpCode.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP xác thực');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const maskedCard = `${cardNumber.slice(0, 6)} **** ${cardNumber.slice(-4)}`;
      const newLinkedBank: LinkedBank = {
        id: `bank_${Date.now()}`,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
        shortName: selectedBank.shortName,
        accountNumberMasked: maskedCard,
        cardHolderName: cardHolder.toUpperCase(),
        linkedAt: new Date().toLocaleDateString('vi-VN'),
        color: selectedBank.color,
        bgColor: selectedBank.bgColor,
      };

      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess(newLinkedBank);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto w-full text-slate-800 relative">
      {/* 1. TOP HEADER (Màu Xanh Nước Biển Nhạt / Trắng) */}
      <header className="bg-gradient-to-r from-ocean-600 via-ocean-500 to-ocean-600 text-white pt-8 pb-4 px-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 'CARD_INFO') setStep('SELECT_BANK');
              else if (step === 'OTP_CONFIRM') setStep('CARD_INFO');
              else onBack();
            }}
            className="p-2 -ml-2 rounded-full hover:bg-white/20 active:scale-95 transition-all"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-base font-extrabold tracking-tight text-white">
            {step === 'SELECT_BANK' && 'Thêm thẻ / tài khoản'}
            {step === 'CARD_INFO' && selectedBank.shortName}
            {step === 'OTP_CONFIRM' && 'Nhập mã PIN / OTP thẻ ATM'}
            {step === 'SUCCESS' && 'Liên kết thành công'}
          </h1>

          <div className="w-8 flex justify-end">
            <Lock className="w-4 h-4 text-ocean-100" />
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT */}
      <main className="flex-1 p-4 pb-20 space-y-4">
        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: CHỌN NGÂN HÀNG (Ảnh 2 - Màn 2)                        */}
        {/* ============================================================ */}
        {step === 'SELECT_BANK' && (
          <div className="space-y-4 animate-fade-in">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập ngân hàng cần tìm..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-ocean-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500 shadow-xs"
              />
            </div>

            {/* Security Guarantee Box (PCI-DSS) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3 shadow-xs">
              <div className="p-1.5 rounded-xl bg-white border border-emerald-300 shadow-xs shrink-0">
                <span className="font-black text-[10px] text-emerald-700 tracking-wider">
                  PCI DSS
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-emerald-900 leading-relaxed font-medium">
                <p>
                  Ví điện tử không trực tiếp lưu thông tin Thẻ/Tài khoản của bạn. Toàn bộ thông tin được bảo mật theo tiêu chuẩn <strong>PCI-DSS</strong>, chứng chỉ bảo mật toàn cầu cấp độ cao nhất.
                </p>
                <p className="font-bold text-emerald-800 flex items-center gap-1 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Hơn 11 triệu người đã liên kết thành công.
                </p>
              </div>
            </div>

            {/* Bank Grid */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Ngân hàng liên kết trực tiếp ({filteredBanks.length})
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {filteredBanks.map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => handleSelectBank(bank)}
                    className="p-2.5 rounded-2xl bg-white border border-ocean-100/80 hover:border-ocean-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-2 group active:scale-95 shadow-xs"
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shadow-xs transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: bank.bgColor,
                        color: bank.color,
                        border: `1.5px solid ${bank.color}30`,
                      }}
                    >
                      {bank.logoText}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 text-center leading-tight line-clamp-1">
                      {bank.shortName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: NHẬP THÔNG TIN THẺ NGÂN HÀNG (Ảnh 2 - Màn 3)           */}
        {/* ============================================================ */}
        {step === 'CARD_INFO' && (
          <form onSubmit={handleCardInfoSubmit} className="space-y-4 animate-fade-in">
            {/* Bank Header Card */}
            <div
              className="p-4 rounded-3xl text-white shadow-lg flex items-center gap-3.5"
              style={{
                backgroundColor: selectedBank.color,
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
                <span className="font-black text-sm" style={{ color: selectedBank.color }}>
                  {selectedBank.logoText}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/80 font-bold uppercase tracking-wider">
                  Ngân hàng đã chọn
                </div>
                <h3 className="text-base font-extrabold text-white truncate">
                  {selectedBank.shortName}
                </h3>
                <div className="text-[11px] text-white/80 truncate">{selectedBank.name}</div>
              </div>
            </div>

            {/* Inputs Group */}
            <div className="p-4 rounded-3xl bg-white border border-ocean-100 shadow-sm space-y-4">
              {/* Field 1: Số thẻ ATM */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Số thẻ ATM
                  </label>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
                    placeholder="9704 xxxx xxxx xxxx"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-800 tracking-wider focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
                  />
                  <CreditCard className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Field 2: Tên chủ thẻ */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Họ và tên
                  </label>
                  <span className="text-[10px] text-slate-400">Viết hoa không dấu</span>
                </div>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="Tên in trên mặt thẻ..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
                />
              </div>

              {/* Field 3: CMND/CCCD */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Số CMND / CCCD / Hộ chiếu
                  </label>
                </div>
                <input
                  type="text"
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="Nhập 12 số CCCD..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Terms & Conditions Box (Giống Ảnh 2 - Màn 3) */}
            <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-[11px] text-slate-600 space-y-1.5 leading-relaxed font-medium">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 pb-0.5">
                <Building2 className="w-3.5 h-3.5 text-ocean-600" />
                Điều kiện liên kết:
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  Khách hàng đã đăng ký dịch vụ <strong>SMS Banking</strong> tại ngân hàng{' '}
                  {selectedBank.shortName}.
                </li>
                <li>
                  Số điện thoại ví <strong>{userPhone}</strong> cần trùng với số đã đăng ký tại ngân
                  hàng.
                </li>
                <li>
                  Số CMND/CCCD cần trùng khớp với thông tin đã mở tài khoản tại ngân hàng{' '}
                  {selectedBank.shortName}.
                </li>
                <li>Thẻ/tài khoản này hiện tại chưa liên kết với tài khoản ví nào khác.</li>
              </ul>
            </div>

            <p className="text-[11px] text-center text-ocean-700 font-semibold cursor-pointer hover:underline">
              Bạn không có thẻ ATM? Liên kết bằng Internet Banking của {selectedBank.shortName}.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-ocean-600 hover:bg-ocean-700 text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-lg shadow-ocean-500/25 active:scale-[0.98]"
            >
              Tiếp tục
            </button>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 3: NHẬP MÃ PIN / OTP XÁC THỰC (Ảnh 2 - Màn 4)             */}
        {/* ============================================================ */}
        {step === 'OTP_CONFIRM' && (
          <div className="space-y-4 animate-fade-in">
            {/* Information Summary Card */}
            <div className="p-4 rounded-3xl bg-white border border-ocean-200 shadow-sm space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Thông tin liên kết</span>
                <span className="text-[10px] font-bold text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full">
                  {selectedBank.shortName}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã giao dịch</span>
                  <span className="font-mono font-bold text-slate-800">
                    {Math.floor(100000 + Math.random() * 900000)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số thẻ/Tài khoản</span>
                  <span className="font-mono font-bold text-slate-800">
                    {cardNumber.slice(0, 6)} **** {cardNumber.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Chủ thẻ</span>
                  <span className="font-bold text-slate-800 uppercase">{cardHolder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số điện thoại</span>
                  <span className="font-mono font-bold text-slate-800">{userPhone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Thời gian thực hiện</span>
                  <span className="font-semibold text-slate-600">
                    {new Date().toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            {/* OTP Input Card */}
            <div className="p-5 rounded-3xl bg-white border border-ocean-200 shadow-sm text-center space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">
                  Vui lòng nhập mã xác thực OTP
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mã SMS OTP đã được gửi từ ngân hàng {selectedBank.shortName}
                </p>
              </div>

              {/* 6 OTP Dots / Digits */}
              <div className="flex items-center justify-center gap-2.5">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const val = otpCode[idx] || '';
                  return (
                    <div
                      key={idx}
                      className={`w-10 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        val
                          ? 'border-2 border-ocean-600 bg-ocean-50 text-ocean-800'
                          : 'border border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {val ? val : <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />}
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Xác thực bằng <strong>SMS OTP</strong>. Nếu bạn không nhận được mã OTP, vui lòng liên hệ
                Hotline:{' '}
                <a
                  href="tel:1900585885"
                  className="font-bold text-ocean-600 underline inline-flex items-center gap-0.5"
                >
                  <PhoneCall className="w-3 h-3" /> 1900 585 885
                </a>
              </div>
            </div>

            {/* Two Action Buttons: Hủy & Tiếp tục (Giống Ảnh 2 - Màn 4) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('CARD_INFO')}
                className="py-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs tracking-wider uppercase transition-all active:scale-[0.98]"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleConfirmOtp}
                disabled={isSubmitting}
                className="py-3.5 rounded-2xl bg-ocean-600 hover:bg-ocean-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg shadow-ocean-500/25 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Đang liên kết...' : 'Tiếp tục'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SUCCESS MODAL / SCREEN                               */}
        {/* ============================================================ */}
        {step === 'SUCCESS' && (
          <div className="py-12 text-center space-y-4 animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">Liên kết thẻ thành công!</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tài khoản <strong>{selectedBank.shortName}</strong> đã được liên kết với ví của bạn. Bạn có thể nạp rút tiền ngay bây giờ.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

