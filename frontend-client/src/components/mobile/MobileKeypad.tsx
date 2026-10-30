import React from 'react';
import { Delete } from 'lucide-react';

interface MobileKeypadProps {
  onNumberClick: (num: string) => void;
  onDeleteClick: () => void;
  onClearClick?: () => void;
  variant?: 'light' | 'dark';
}

export const MobileKeypad: React.FC<MobileKeypadProps> = ({
  onNumberClick,
  onDeleteClick,
  onClearClick,
  variant = 'dark',
}) => {
  const rows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'backspace'],
  ];

  const isDark = variant === 'dark';

  return (
    <div
      className={`w-full max-w-sm mx-auto p-2 select-none ${
        isDark ? 'bg-slate-900/90 text-white' : 'bg-slate-100 text-slate-800'
      } rounded-t-3xl backdrop-blur-md`}
    >
      <div className="grid grid-cols-3 gap-2">
        {rows.flat().map((item, index) => {
          if (item === 'clear') {
            return (
              <button
                key={index}
                type="button"
                onClick={onClearClick || onDeleteClick}
                className={`h-14 flex items-center justify-center font-bold text-sm tracking-wider uppercase rounded-2xl active:scale-95 transition-all ${
                  isDark
                    ? 'text-slate-400 hover:bg-white/10 active:bg-white/20'
                    : 'text-slate-500 hover:bg-slate-200 active:bg-slate-300'
                }`}
              >
                Xóa
              </button>
            );
          }

          if (item === 'backspace') {
            return (
              <button
                key={index}
                type="button"
                onClick={onDeleteClick}
                className={`h-14 flex items-center justify-center rounded-2xl active:scale-95 transition-all ${
                  isDark
                    ? 'text-ocean-300 hover:bg-white/10 active:bg-white/20'
                    : 'text-ocean-600 hover:bg-slate-200 active:bg-slate-300'
                }`}
                aria-label="Xóa 1 ký tự"
              >
                <Delete className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => onNumberClick(item)}
              className={`h-14 flex items-center justify-center text-2xl font-bold rounded-2xl active:scale-95 transition-all ${
                isDark
                  ? 'bg-slate-800/80 text-white hover:bg-slate-700 active:bg-ocean-600 active:text-white'
                  : 'bg-white text-slate-800 hover:bg-slate-50 active:bg-ocean-50 active:text-ocean-600 shadow-xs'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
};
