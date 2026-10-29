import React from 'react';
import {
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';
import { formatVND, formatDateTime, truncateUUID } from '../../utils/formatters';
import type { LedgerEntryResponse, PageResponse } from '../../types';

export interface LedgerHistoryTableProps {
  ledgerPage: PageResponse<LedgerEntryResponse> | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export const LedgerHistoryTable: React.FC<LedgerHistoryTableProps> = ({
  ledgerPage,
  isLoading,
  error,
  currentPage,
  onPageChange,
  onRetry,
}) => {
  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Nhật ký Sổ cái Kép (Double-Entry Ledger)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dữ liệu bút toán bất biến (Immutable Journal) minh bạch từng dòng tiền
          </p>
        </div>
        {ledgerPage ? (
          <span className="text-xs text-slate-400 font-medium">
            Tổng cộng: <strong className="text-slate-200">{ledgerPage.totalElements}</strong> bút toán
          </span>
        ) : null}
      </div>

      {/* 4 UI States */}

      {/* State 1: ERROR */}
      {error ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-rose-300 font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={onRetry} icon={<RotateCcw className="w-4 h-4" />}>
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        /* State 2: LOADING */
        <div className="p-16 flex items-center justify-center">
          <Spinner size="lg" label="Đang tải dữ liệu sổ cái..." />
        </div>
      ) : !ledgerPage || ledgerPage.content.length === 0 ? (
        /* State 3: EMPTY */
        <div className="p-16 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
          <FileText className="w-12 h-12 stroke-[1.25] text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">Chưa có bút toán nào phát sinh</p>
          <p className="text-xs text-slate-500 max-w-sm">
            Thực hiện nạp tiền hoặc chuyển tiền để ghi nhận bút toán đầu tiên vào hệ thống.
          </p>
        </div>
      ) : (
        /* State 4: DATA */
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Loại bút toán</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Mã giao dịch (TxID)</th>
                  <th className="py-3 px-4">Mã bút toán (Entry ID)</th>
                  <th className="py-3 px-4 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {ledgerPage.content.map((entry) => {
                  const isCredit = entry.entryType === 'CREDIT';
                  return (
                    <tr
                      key={entry.entryId}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isCredit
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <Badge variant="entry" entryType={entry.entryType} />
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold">
                        <span className={isCredit ? 'text-emerald-400' : 'text-rose-400'}>
                          {isCredit ? '+' : '-'}{formatVND(entry.amount)}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-400" title={entry.transactionId || ''}>
                        {truncateUUID(entry.transactionId)}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-slate-500" title={entry.entryId}>
                        {truncateUUID(entry.entryId)}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-400 text-right">
                        {formatDateTime(entry.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {ledgerPage.totalPages > 1 ? (
            <div className="p-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <div>
                Trang <span className="font-semibold text-slate-200">{currentPage + 1}</span> / {ledgerPage.totalPages}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 0}
                  icon={<ChevronLeft className="w-4 h-4" />}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= ledgerPage.totalPages - 1}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Sau
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
};

