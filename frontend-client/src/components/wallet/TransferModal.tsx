import React, { useState } from 'react';
import {
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatVND } from '../../utils/formatters';
import type { PaymentMethod, TransferRequest } from '../../types';

export interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceAccountId: string;
  onSuccess: () => void;
  onTransfer: (request: TransferRequest) => Promise<void>;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  sourceAccountId,
  onSuccess,
  onTransfer,
}) => {
  const [targetAccountId, setTargetAccountId] = useState('');
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VNPAY');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(
    () => `tx-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  );
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const gateways: { id: PaymentMethod; name: string; tag: string; color: string }[] = [
    { id: 'VNPAY', name: 'VNPay QR', tag: 'Cổng Quốc Gia', color: 'border-blue-300 text-blue-700 bg-blue-50/70' },
    { id: 'MOMO', name: 'Ví MoMo', tag: 'Ví Điện Tử', color: 'border-pink-300 text-pink-700 bg-pink-50/70' },
    { id: 'ZALOPAY', name: 'ZaloPay', tag: 'Siêu ứng dụng', color: 'border-emerald-300 text-emerald-700 bg-emerald-50/70' },
    { id: 'VIETQR', name: 'VietQR NAPAS', tag: 'Liên ngân hàng 24/7', color: 'border-amber-300 text-amber-700 bg-amber-50/70' },
  ];

  const handleRegenerateKey = () => {
    setIdempotencyKey(`tx-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountId.trim()) {
      setError('Vui lòng nhập tài khoản đích (UUID)');
      return;
    }
    if (targetAccountId.trim() === sourceAccountId) {
      setError('Tài khoản nguồn và đích không được trùng nhau');
      return;
    }
    if (amount < 1000) {
      setError('Số tiền chuyển tối thiểu là 1,000 VND');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      await onTransfer({
        idempotencyKey,
        sourceAccountId,
        targetAccountId: targetAccountId.trim(),
        amount,
        paymentMethod,
        description,
      });

      setSuccessMsg('Lệnh chuyển tiền đã tiếp nhận thành công qua Saga Orchestrator!');
      onSuccess();
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        handleRegenerateKey();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Chuyển tiền thất bại';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chuyển tiền qua Saga & Escrow" className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        {successMsg ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        ) : null}

        {/* Idempotency Key Bar */}
        <div className="p-2.5 rounded-xl bg-ocean-50/60 border border-ocean-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-ocean-600" />
            <span>X-Idempotency-Key:</span>
            <span className="font-mono text-ocean-700 font-bold">{idempotencyKey}</span>
          </div>
          <button
            type="button"
            onClick={handleRegenerateKey}
            className="text-slate-500 hover:text-ocean-700 p-1 rounded transition-colors"
            title="Đổi mã Idempotency mới"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Target Account */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Mã tài khoản thụ hưởng (Target Account UUID)
          </label>
          <input
            type="text"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            value={targetAccountId}
            onChange={(e) => setTargetAccountId(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Số tiền chuyển (VND)
          </label>
          <div className="relative">
            <input
              type="number"
              min={1000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-ocean-700 font-black">
              {formatVND(amount)}
            </span>
          </div>
        </div>

        {/* Payment Gateway Strategy */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Cổng thanh toán đối tác (Strategy Pattern)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {gateways.map((gw) => (
              <button
                key={gw.id}
                type="button"
                onClick={() => setPaymentMethod(gw.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  paymentMethod === gw.id
                    ? `${gw.color} ring-2 ring-ocean-500 shadow-sm`
                    : 'bg-white border-slate-200 text-slate-600 hover:border-ocean-300'
                }`}
              >
                <div className="font-bold text-sm">{gw.name}</div>
                <div className="text-[10px] opacity-80">{gw.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Note / Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nội dung chuyển tiền
          </label>
          <input
            type="text"
            placeholder="Chuyển khoản thanh toán"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
          />
        </div>

        {/* Technical Explainer */}
        <div className="p-3 rounded-xl bg-ocean-50 border border-ocean-200 text-xs text-ocean-800 space-y-1">
          <div className="font-bold text-ocean-900 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-ocean-600" />
            Cơ chế bảo vệ Tài khoản Treo (SYSTEM_ESCROW):
          </div>
          <p className="text-slate-600">
            Tiền được tạm giữ ở <code className="bg-white px-1.5 py-0.5 rounded border border-ocean-200 font-bold text-ocean-700">SYSTEM_ESCROW</code>.
            Ví thụ hưởng chỉ nhận tiền khi cổng thanh toán xác thực thành công.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Đóng
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            icon={<ArrowUpRight className="w-4 h-4" />}
          >
            Chuyển ngay
          </Button>
        </div>
      </form>
    </Modal>
  );
};
