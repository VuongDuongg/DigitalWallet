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
  ShieldCheck,
  Sparkles,
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-white via-ocean-50/50 to-sky-100/60 border-ocean-200/90 shadow-md shadow-ocean-500/10">
      {/* Decorative ambient subtle circle */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-ocean-300/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Column: Account info & Balance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Mã tài khoản Ví:</span>
            <button
              onClick={handleCopyAccountId}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-ocean-50 border border-ocean-200 text-xs font-mono font-bold text-ocean-700 transition-colors shadow-2xs"
              title="Bấm để sao chép mã tài khoản"
            >
              {accountId ? `${accountId.substring(0, 8)}...${accountId.substring(accountId.length - 6)}` : 'Chưa chọn'}
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-ocean-500" />
              )}
            </button>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              ACTIVE
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Số dư khả dụng</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-ocean-600 transition-colors p-0.5"
                title={showBalance ? 'Ẩn số dư' : 'Hiện số dư'}
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="mt-1 flex items-baseline gap-3">
              {isLoading ? (
                <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
              ) : (
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {showBalance ? formatVND(balance) : '•••••••• ₫'}
                </h2>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-ocean-100 text-ocean-800 font-bold border border-ocean-200">
                VND
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Snapshot + Bút toán kép Sổ cái
            </span>
            <span className="flex items-center gap-1 text-ocean-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Bảo mật Redisson Watchdog
            </span>
          </div>
        </div>

        {/* Right Column: Actions matching light blue & white palette */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onCreateSnapshot}
            isLoading={isCreatingSnapshot}
            icon={<Camera className="w-4 h-4 text-ocean-600" />}
            title="Chốt snapshot số dư để tối ưu hiệu năng tính toán O(1)"
            className="border-ocean-300 text-ocean-700 hover:bg-ocean-50"
          >
            Chốt Snapshot
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onOpenDeposit}
            icon={<ArrowDownLeft className="w-4 h-4 text-ocean-600" />}
          >
            Nạp tiền
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onOpenTransfer}
            icon={<ArrowUpRight className="w-4 h-4 text-white" />}
            className="shadow-md shadow-ocean-500/25"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Chuyển tiền
          </Button>
        </div>
      </div>
    </Card>
  );
};
