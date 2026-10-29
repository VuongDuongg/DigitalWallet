import React from 'react';
import { cn } from '../../utils/cn';
import type { EntryType, TransactionStatus } from '../../types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'entry' | 'default';
  status?: TransactionStatus;
  entryType?: EntryType;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  entryType,
  className,
}) => {
  let badgeStyles = 'bg-slate-700/60 text-slate-300 border-slate-600';
  let label = children;

  if (variant === 'status' && status) {
    switch (status) {
      case 'COMPLETED':
        badgeStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        label = label || 'Hoàn tất';
        break;
      case 'PENDING':
        badgeStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
        label = label || 'Đang xử lý';
        break;
      case 'FAILED':
        badgeStyles = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
        label = label || 'Thất bại';
        break;
    }
  } else if (variant === 'entry' && entryType) {
    switch (entryType) {
      case 'CREDIT':
        badgeStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        label = label || 'Ghi Có (+)';
        break;
      case 'DEBIT':
        badgeStyles = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
        label = label || 'Ghi Nợ (-)';
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        badgeStyles,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};

