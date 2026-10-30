import React, { useState, useEffect } from 'react';
import { MobileKeypad } from './MobileKeypad';
import { Wallet, ShieldCheck, CheckCircle2, ArrowLeft, XCircle, Terminal } from 'lucide-react';
import { authApi } from '../../api/authApi';
import type { RegistrationStep } from '../../types';

interface MobileRegistrationFlowProps {
  onSuccess: (phone: string, pin: string) => void;
  onCancel?: () => void;
}

export const MobileRegistrationFlow: React.FC<MobileRegistrationFlowProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<RegistrationStep>('PHONE');
  const [phone, setPhone] = useState('0968891234');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [activePinField, setActivePinField] = useState<'pin' | 'confirmPin'>('pin');
  const [countdown, setCountdown] = useState(120);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'OTP' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleNumberInput = (num: string) => {
    setErrorMsg('');
    if (step === 'PHONE') {
      if (phone.length < 11) setPhone((prev) => prev + num);
    } else if (step === 'OTP') {
      if (otp.length < 6) setOtp((prev) => prev + num);
    } else if (step === 'PIN') {
      if (activePinField === 'pin') {
        if (pin.length < 6) {
          const next = pin + num;
          setPin(next);
          if (next.length === 6) setActivePinField('confirmPin');
        }
      } else {
        if (confirmPin.length < 6) setConfirmPin((prev) => prev + num);
      }
    }
  };

  const handleDelete = () => {
    setErrorMsg('');
    if (step === 'PHONE') {
      setPhone((prev) => prev.slice(0, -1));
    } else if (step === 'OTP') {
      setOtp((prev) => prev.slice(0, -1));
    } else if (step === 'PIN') {
      if (activePinField === 'confirmPin') {
        if (confirmPin.length > 0) {
          setConfirmPin((prev) => prev.slice(0, -1));
        } else {
          setActivePinField('pin');
        }
      } else {
        setPin((prev) => prev.slice(0, -1));
      }
    }
  };

  const handleClear = () => {
    setErrorMsg('');
    if (step === 'PHONE') setPhone('');
    else if (step === 'OTP') setOtp('');
    else if (step === 'PIN') {
      if (activePinField === 'confirmPin') setConfirmPin('');
      else setPin('');
    }
  };

  // Submit Phone -> Gọi Spring Boot Backend sinh mã OTP lưu Redis (120s) và in ra Console
  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (10 số)');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      await authApi.sendOtp(phone);
      setCountdown(120);
      setOtp('');
      setStep('OTP');
    } catch (err: unknown) {
      console.warn('Backend chưa sẵn sàng hoặc lỗi gọi sendOtp:', err);
      // Vẫn cho phép vào màn OTP để test
      setCountdown(120);
      setOtp('');
      setStep('OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit OTP -> Gọi Spring Boot xác thực với Redis
  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã xác thực');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.verifyOtp(phone, otp);
      if (res && res.success) {
        setStep('PIN');
      } else {
        setErrorMsg(res?.message || 'Mã OTP không chính xác hoặc đã hết hạn (sau 120s)!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Mã OTP không chính xác hoặc đã hết hạn sau 120s!';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await authApi.sendOtp(phone);
      setCountdown(120);
      setOtp('');
    } catch (err: unknown) {
      console.warn('Lỗi gửi lại OTP:', err);
      setCountdown(120);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit PIN
  const handlePinSubmit = () => {
    if (pin.length !== 6) {
      setErrorMsg('Mật khẩu ví phải đủ 6 chữ số');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMsg('Mật khẩu nhập lại không khớp!');
      return;
    }
    onSuccess(phone, pin);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-ocean-600 via-ocean-500 to-ocean-700 text-white relative">
      {/* Top Header Bar */}
      <div className="pt-8 px-5 flex items-center justify-between">
        {step !== 'PHONE' ? (
          <button
            type="button"
            onClick={() => setStep(step === 'PIN' ? 'OTP' : 'PHONE')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all active:scale-90"
            aria-label="Quay lại"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        ) : (
          onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-ocean-100 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all"
            >
              Hủy
            </button>
          )
        )}

        <div className="flex items-center gap-2 mx-auto pr-6">
          <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-ocean-900/30">
            <Wallet className="w-5 h-5 text-ocean-600" />
          </div>
          <span className="font-black text-lg tracking-tight text-white drop-shadow-sm">
            Digital Wallet
          </span>
        </div>
      </div>

      {/* Main Content Card (Step View) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 max-w-sm mx-auto w-full">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/90 text-white text-xs font-bold text-center backdrop-blur-md shadow-lg animate-shake flex items-center justify-center gap-1.5">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: NHẬP SỐ ĐIỆN THOẠI (Ảnh 1 - Màn 2) */}
        {step === 'PHONE' && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center border border-white/30 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
                <span className="font-black text-2xl text-ocean-600">DW</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Đăng ký & Đăng nhập</h2>
              <p className="text-xs text-ocean-100 font-medium">
                Sử dụng số điện thoại của bạn để kích hoạt ví
              </p>
            </div>

            {/* Input Phone Display Box */}
            <div className="relative">
              <div className="w-full bg-white text-slate-800 rounded-2xl py-4 px-4 shadow-xl flex items-center justify-center font-bold text-2xl tracking-widest text-center">
                {phone ? (
                  <span>{phone}</span>
                ) : (
                  <span className="text-slate-300 font-normal text-base">
                    Nhập số điện thoại...
                  </span>
                )}
              </div>
              {phone && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handlePhoneSubmit}
              disabled={phone.length < 10 || isLoading}
              className="w-full py-4 rounded-2xl bg-ocean-900/90 hover:bg-ocean-900 text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-xl disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
            >
              {isLoading ? 'Đang gửi mã OTP...' : 'TIẾP TỤC'}
            </button>

            <p className="text-xs text-ocean-100/90 font-medium">
              Một mã xác thực sẽ được gửi cho bạn
            </p>
          </div>
        )}

        {/* STEP 2: NHẬP MÃ XÁC THỰC OTP (Ảnh 1 - Màn 3) */}
        {step === 'OTP' && (
          <div className="space-y-5 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center border border-white/30 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Xác thực số điện thoại</h2>
              <p className="text-xs text-ocean-100 font-medium leading-relaxed">
                Một tin nhắn chứa mã xác thực đã gửi đến{' '}
                <strong className="text-white underline">{phone}</strong>
              </p>
            </div>

            {/* Terminal Hint Banner */}
            <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-white/20 text-[11px] text-ocean-200 flex items-center gap-2 text-left shadow-inner">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Nhìn vào <strong>Console / Terminal Spring Boot</strong> ở máy tính để lấy mã OTP!
              </span>
            </div>

            {/* 6-digit OTP Box */}
            <div className="w-full bg-white text-slate-800 rounded-2xl py-4 px-3 shadow-xl flex items-center justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const char = otp[idx] || '';
                return (
                  <div
                    key={idx}
                    className={`w-10 h-12 rounded-xl flex items-center justify-center text-xl font-black ${
                      char
                        ? 'border-2 border-ocean-600 bg-ocean-50/50 text-ocean-800'
                        : 'border border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {char ? char : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                  </div>
                );
              })}
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleOtpSubmit}
              disabled={otp.length !== 6 || isLoading}
              className="w-full py-4 rounded-2xl bg-ocean-900/90 hover:bg-ocean-900 text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-xl disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
            >
              {isLoading ? 'Đang xác thực...' : 'TIẾP TỤC'}
            </button>

            {/* Resend OTP */}
            <div className="text-xs text-ocean-100 flex items-center justify-center gap-3">
              <span>Bạn không nhận được mã?</span>
              {countdown > 0 ? (
                <span className="font-bold text-white">GỬI LẠI ({countdown}s)</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-white underline hover:text-ocean-200"
                >
                  GỬI LẠI
                </button>
              )}
              <span>•</span>
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="font-bold text-white underline hover:text-ocean-200"
              >
                ĐỔI SĐT
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: THIẾT LẬP MẬT KHẨU VÍ (Ảnh 1 - Màn 4) */}
        {step === 'PIN' && (
          <div className="space-y-5 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center border border-white/30 shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-white leading-snug px-2">
                Thiết lập mật khẩu để bảo vệ tài khoản Ví của bạn (gồm 6 chữ số)
              </h2>
            </div>

            <div className="space-y-3">
              {/* Box 1: Nhập mật khẩu */}
              <button
                type="button"
                onClick={() => setActivePinField('pin')}
                className={`w-full py-3.5 px-4 rounded-2xl text-center font-bold text-lg transition-all shadow-lg ${
                  activePinField === 'pin'
                    ? 'bg-white text-slate-800 ring-2 ring-ocean-200'
                    : 'bg-white/90 text-slate-700'
                }`}
              >
                {pin ? (
                  <span className="tracking-widest">
                    {'•'.repeat(pin.length)}
                    <span className="text-slate-300">{'•'.repeat(6 - pin.length)}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal text-sm">Nhập mật khẩu (6 số)</span>
                )}
              </button>

              {/* Box 2: Nhập lại mật khẩu */}
              <button
                type="button"
                onClick={() => setActivePinField('confirmPin')}
                className={`w-full py-3.5 px-4 rounded-2xl text-center font-bold text-lg transition-all shadow-lg ${
                  activePinField === 'confirmPin'
                    ? 'bg-white text-slate-800 ring-2 ring-ocean-200'
                    : 'bg-white/90 text-slate-700'
                }`}
              >
                {confirmPin ? (
                  <span className="tracking-widest">
                    {'•'.repeat(confirmPin.length)}
                    <span className="text-slate-300">{'•'.repeat(6 - confirmPin.length)}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal text-sm">Nhập lại mật khẩu</span>
                )}
              </button>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handlePinSubmit}
              disabled={pin.length !== 6 || confirmPin.length !== 6}
              className="w-full py-4 rounded-2xl bg-ocean-900/90 hover:bg-ocean-900 text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-xl disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
            >
              XÁC NHẬN
            </button>
          </div>
        )}
      </div>

      {/* Numeric Keypad Component at the bottom */}
      <div className="w-full pb-6 pt-2">
        <MobileKeypad
          onNumberClick={handleNumberInput}
          onDeleteClick={handleDelete}
          onClearClick={handleClear}
          variant="dark"
        />
      </div>
    </div>
  );
};
