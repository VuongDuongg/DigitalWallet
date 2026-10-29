import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 border border-slate-700/60 shadow-xl shadow-black/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

