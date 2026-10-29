import React, { useState } from 'react';
import {
  Wallet,
  Search,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  User,
  Settings,
} from 'lucide-react';

export interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  currentAccountId?: string;
  onOpenMyWallet?: () => void;
  currentPortal: 'user' | 'admin';
  onTogglePortal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  currentAccountId,
  onOpenMyWallet,
  currentPortal,
  onTogglePortal,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ocean-100 shadow-sm shadow-ocean-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        {/* Left: MoMo Style Square Logo & Menu */}
        <div className="flex items-center gap-6 lg:gap-8">
          <a href="#" onClick={(e) => { e.preventDefault(); if (currentPortal !== 'user') onTogglePortal(); }} className="flex items-center gap-2.5 group">
            {/* MoMo style rounded-2xl square brand icon in Soft Ocean Blue */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ocean-600 via-sky-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/30 group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-ocean-600 transition-colors">
                Digital Wallet
              </span>
              <span className="text-[10px] font-semibold text-ocean-600 tracking-wider uppercase -mt-1">
                {currentPortal === 'admin' ? 'Backoffice Admin' : 'Core Banking'}
              </span>
            </div>
          </a>

          {/* Navigation Links like MoMo */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-700">
            <div className="flex items-center gap-1 hover:text-ocean-600 cursor-pointer transition-colors py-2 group">
              <span>Dịch vụ</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-ocean-600 group-hover:rotate-180 transition-transform duration-200" />
            </div>
            <div className="flex items-center gap-1 hover:text-ocean-600 cursor-pointer transition-colors py-2 group">
              <span>Về chúng tôi</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-ocean-600 group-hover:rotate-180 transition-transform duration-200" />
            </div>
            <div className="flex items-center gap-1 hover:text-ocean-600 cursor-pointer transition-colors py-2 group">
              <span>Tiện ích</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-ocean-600 group-hover:rotate-180 transition-transform duration-200" />
            </div>
            <div className="flex items-center gap-1 hover:text-ocean-600 cursor-pointer transition-colors py-2 group">
              <span>Trợ giúp</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-ocean-600 group-hover:rotate-180 transition-transform duration-200" />
            </div>
            <div className="flex items-center gap-1 hover:text-ocean-600 cursor-pointer transition-colors py-2 group">
              <span>Đối tác</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-ocean-600 group-hover:rotate-180 transition-transform duration-200" />
            </div>
          </nav>
        </div>

        {/* Center/Right: Search bar like MoMo + Portal Switcher + Quick Actions */}
        <div className="flex items-center gap-3">
          {/* MoMo Search Input */}
          <div className="relative hidden md:block w-40 lg:w-56">
            <input
              type="text"
              placeholder="Bạn tìm gì..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-4 pr-9 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ocean-500/40 focus:bg-white focus:border-ocean-300 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2 pointer-events-none" />
          </div>

          {/* Portal Switcher Button (Người Dùng <-> Quản Trị) */}
          <button
            onClick={onTogglePortal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs ${
              currentPortal === 'admin'
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-ocean-50 hover:bg-ocean-100 text-ocean-700 border border-ocean-200'
            }`}
            title="Bấm để chuyển đổi giữa Giao diện Khách hàng và Giao diện Quản trị"
          >
            {currentPortal === 'admin' ? (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Xem Giao diện Khách</span>
              </>
            ) : (
              <>
                <Settings className="w-3.5 h-3.5 text-ocean-600" />
                <span>Trang Quản Trị</span>
              </>
            )}
          </button>

          {/* Escrow Protected Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-50 text-ocean-700 border border-ocean-200/80 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-ocean-600" />
            <span>Escrow 100%</span>
          </div>

          {/* Quick Wallet Button (in user portal) */}
          {currentPortal === 'user' && onOpenMyWallet ? (
            <button
              onClick={onOpenMyWallet}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-semibold shadow-sm shadow-ocean-600/20 active:scale-95 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>{currentAccountId ? 'Ví của tôi' : 'Chọn Ví'}</span>
            </button>
          ) : null}

          {/* Refresh Action Button */}
          {onRefresh ? (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-slate-500 hover:text-ocean-600 bg-slate-50 hover:bg-ocean-50 border border-slate-200/80 transition-all duration-200 active:scale-95 disabled:opacity-50"
              title="Làm mới dữ liệu từ server"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-ocean-600' : ''}`} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
