import React from 'react';
import type { MobileTab } from '../../types';
import { Home, Gift, History, Users, Wallet } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    {
      id: 'home' as MobileTab,
      label: 'Trang chủ',
      icon: Home,
    },
    {
      id: 'promos' as MobileTab,
      label: 'Ưu đãi',
      icon: Gift,
      badge: '16',
    },
    {
      id: 'history' as MobileTab,
      label: 'Lịch sử GD',
      icon: History,
    },
    {
      id: 'friends' as MobileTab,
      label: 'Bạn bè',
      icon: Users,
    },
    {
      id: 'wallet' as MobileTab,
      label: 'Ví của tôi',
      icon: Wallet,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-ocean-100 z-40 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-1 flex flex-col items-center justify-center gap-0.5 relative transition-all active:scale-90 ${
                isActive ? 'text-ocean-600 font-extrabold' : 'text-slate-400 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-ocean-600' : 'text-slate-400'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[14px] h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'text-ocean-600' : 'text-slate-500'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-6 h-0.5 rounded-full bg-ocean-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

