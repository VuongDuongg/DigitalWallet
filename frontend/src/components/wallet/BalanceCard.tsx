import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Camera,
  Copy,
  Check,
  Eye,
  EyeOff,
  Coins,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { formatVND } from '../../utils/formatters';

export interface BalanceCardProps {
  accountId: string;
  balance: number;
  isLoading?: boolean;
  onOpenTransfer: () => void;
  onOpenDeposit: () => void;
  onCreateSnapshot: () => void;
  isCreatingSnapshot?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  accountId,
  balance,
  isLoading = false,
  onOpenTransfer,
  onOpenDeposit,
  onCreateSnapshot,
  isCreatingSnapshot = false,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyAccountId = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 via-slate-800/90 to-slate-900/90 border-indigo-500/20">
      {/* Background ambient glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Account info & Balance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Mã tài khoản Ví:</span>
            <button
              onClick={handleCopyAccountId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-mono text-slate-200 transition-colors"
              title="Sao chép mã tài khoản"
            >
              {accountId ? `${accountId.substring(0, 8)}...${accountId.substring(accountId.length - 6)}` : 'Chưa chọn'}
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Số dư khả dụng</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-1 flex items-baseline gap-3">
              {isLoading ? (
                <div className="h-10 w-48 bg-slate-700/50 rounded-lg animate-pulse" />
              ) : (
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {showBalance ? formatVND(balance) : '•••••••• ₫'}
                </h2>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                VND
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Tính từ Bút toán kép Sổ cái + Snapshot gần nhất
          </p>
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onCreateSnapshot}
            isLoading={isCreatingSnapshot}
            icon={<Camera className="w-4 h-4 text-indigo-400" />}
            title="Chốt snapshot số dư để tối ưu hiệu năng tính toán O(1)"
          >
            Chốt Snapshot
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onOpenDeposit}
            icon={<ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
          >
            Nạp tiền
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onOpenTransfer}
            icon={<ArrowUpRight className="w-4 h-4 text-white" />}
          >
            Chuyển tiền
          </Button>
        </div>
      </div>
    </Card>
  );
};

