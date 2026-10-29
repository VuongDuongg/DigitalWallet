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
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = children;

  if (variant === 'status' && status) {
    switch (status) {
      case 'COMPLETED':
        badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = label || 'Hoàn tất';
        break;
      case 'PENDING':
        badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
        label = label || 'Đang xử lý';
        break;
      case 'FAILED':
        badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
        label = label || 'Thất bại';
        break;
    }
  } else if (variant === 'entry' && entryType) {
    switch (entryType) {
      case 'CREDIT':
        badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = label || 'Ghi Có (+)';
        break;
      case 'DEBIT':
        badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
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
