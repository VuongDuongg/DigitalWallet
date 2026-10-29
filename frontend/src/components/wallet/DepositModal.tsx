import React, { useState } from 'react';
import { ArrowDownLeft, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatVND } from '../../utils/formatters';

export interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onSuccess: () => void;
  onDeposit: (accountId: string, amount: number) => Promise<void>;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  accountId,
  onSuccess,
  onDeposit,
}) => {
  const [amount, setAmount] = useState<number>(100000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Số tiền nạp phải lớn hơn 0');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await onDeposit(accountId, amount);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Nạp tiền thất bại';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nạp tiền vào ví">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Số tiền cần nạp (VND)
          </label>
          <div className="relative">
            <input
              type="number"
              min={10000}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
              {formatVND(amount)}
            </span>
          </div>
        </div>

        {/* Quick select buttons */}
        <div>
          <span className="text-xs text-slate-400 block mb-2">Chọn nhanh mệnh giá:</span>
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((qAmount) => (
              <button
                key={qAmount}
                type="button"
                onClick={() => setAmount(qAmount)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors ${
                  amount === qAmount
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                }`}
              >
                {formatVND(qAmount)}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-700/60 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            icon={<ArrowDownLeft className="w-4 h-4" />}
          >
            Xác nhận nạp
          </Button>
        </div>
      </form>
    </Modal>
  );
};

