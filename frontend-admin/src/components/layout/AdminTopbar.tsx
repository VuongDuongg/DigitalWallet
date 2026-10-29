import React from 'react';
import {
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Lock,
} from 'lucide-react';

export interface AdminTopbarProps {
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  title,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Architecture Badges */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SYSTEM_ESCROW</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold">
          <Server className="w-3.5 h-3.5 text-sky-600" />
          <span>Kafka 3-Partitions FIFO</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Redisson Watchdog 30s</span>
        </div>

        {/* Link to Client Portal (Port 5173) */}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 border border-slate-200"
          title="Mở cổng giao dịch người dùng (wallet.com:5173)"
        >
          <span>Mở Web Khách</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>

        {/* Refresh Action */}
        {onRefresh ? (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-500 hover:text-ocean-600 bg-slate-100 hover:bg-ocean-50 border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-ocean-600' : ''}`} />
          </button>
        ) : null}
      </div>
    </header>
  );
};

