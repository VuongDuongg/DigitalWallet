import React from 'react';
import {
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  BookOpen,
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
    <Card className="p-0 overflow-hidden border-ocean-200/80 shadow-sm" id="ledger-section">
      {/* Table Header */}
      <div className="p-5 border-b border-ocean-100 bg-gradient-to-r from-ocean-50/60 to-white flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-ocean-600" />
            Nhật ký Sổ cái Kép (Double-Entry Ledger)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi giao dịch được bảo chứng bất biến với nguyên tắc: Tổng Nợ (Debit) ≡ Tổng Có (Credit)
          </p>
        </div>
        {ledgerPage ? (
          <span className="text-xs text-slate-600 font-medium bg-white px-3 py-1 rounded-full border border-ocean-200 shadow-2xs">
            Tổng cộng: <strong className="text-ocean-700">{ledgerPage.totalElements}</strong> bút toán
          </span>
        ) : null}
      </div>

      {/* 4 UI States */}

      {/* State 1: ERROR */}
      {error ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-rose-600 font-medium">{error}</p>
          <Button variant="secondary" size="sm" onClick={onRetry} icon={<RotateCcw className="w-4 h-4" />}>
            Thử lại
          </Button>
        </div>
      ) : isLoading ? (
        /* State 2: LOADING */
        <div className="p-16 flex items-center justify-center">
          <Spinner size="lg" label="Đang đối chiếu dữ liệu sổ cái..." />
        </div>
      ) : !ledgerPage || ledgerPage.content.length === 0 ? (
        /* State 3: EMPTY */
        <div className="p-16 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
          <FileText className="w-12 h-12 stroke-[1.25] text-slate-300 mb-2" />
          <p className="text-sm font-bold text-slate-800">Chưa có bút toán nào phát sinh</p>
          <p className="text-xs text-slate-400 max-w-sm">
            Thực hiện nạp tiền hoặc chuyển tiền để ghi nhận bút toán đầu tiên vào hệ thống Core Banking.
          </p>
        </div>
      ) : (
        /* State 4: DATA */
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-ocean-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Loại bút toán</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Mã giao dịch (TxID)</th>
                  <th className="py-3 px-4">Mã bút toán (Entry ID)</th>
                  <th className="py-3 px-4 text-right">Thời gian ghi nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {ledgerPage.content.map((entry) => {
                  const isCredit = entry.entryType === 'CREDIT';
                  return (
                    <tr
                      key={entry.entryId}
                      className="hover:bg-ocean-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isCredit
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
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

                      <td className="py-3.5 px-4 font-bold text-base">
                        <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
                          {isCredit ? '+' : '-'}{formatVND(entry.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-semibold" title={entry.transactionId || ''}>
                        {truncateUUID(entry.transactionId)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400" title={entry.entryId}>
                        {truncateUUID(entry.entryId)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 text-right font-medium">
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
            <div className="p-4 border-t border-ocean-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
              <div>
                Trang <span className="font-bold text-ocean-700">{currentPage + 1}</span> / {ledgerPage.totalPages}
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
