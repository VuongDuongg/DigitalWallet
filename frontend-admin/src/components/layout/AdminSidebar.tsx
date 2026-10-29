import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Camera,
  Search,
  Users,
  Wallet,
  Shield,
  Activity,
} from 'lucide-react';

export type AdminTab = 'overview' | 'ledger' | 'snapshot' | 'saga' | 'accounts';

export interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Tổng quan Hệ thống',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'ledger',
      label: 'Kiểm toán Sổ cái kép',
      icon: <FileCheck2 className="w-5 h-5" />,
      badge: 'Audit',
    },
    {
      id: 'snapshot',
      label: 'Chốt Snapshot O(1)',
      icon: <Camera className="w-5 h-5" />,
      badge: 'Engine',
    },
    {
      id: 'saga',
      label: 'Tra cứu Saga & Outbox',
      icon: <Search className="w-5 h-5" />,
    },
    {
      id: 'accounts',
      label: 'Quản lý Tài khoản Ví',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen text-slate-300">
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ocean-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-ocean-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-tight">Digital Wallet</div>
            <div className="text-[10px] font-bold text-ocean-400 uppercase tracking-wider -mt-0.5">
              Admin Backoffice
            </div>
          </div>
        </div>

        {/* System Health Pill */}
        <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold text-[11px]">Core Banking Active</span>
          </div>
          <Activity className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Menu Quản Trị
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-ocean-600 text-white shadow-md shadow-ocean-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-ocean-500/20 border border-ocean-500/30 text-ocean-400 flex items-center justify-center font-bold text-xs">
          <Shield className="w-4 h-4" />
        </div>
        <div className="overflow-hidden">
          <div className="text-xs font-bold text-white truncate">Administrator</div>
          <div className="text-[10px] text-ocean-400 font-mono font-medium">ROLE_ADMIN • VPN Only</div>
        </div>
      </div>
    </aside>
  );
};

