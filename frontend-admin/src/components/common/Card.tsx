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
        'bg-white rounded-2xl p-6 border border-ocean-100/90 shadow-sm shadow-ocean-500/5 hover:border-ocean-200 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
