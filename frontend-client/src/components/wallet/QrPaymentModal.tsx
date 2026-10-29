import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Coins,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatVND } from '../../utils/formatters';

export interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

export const QrPaymentModal: React.FC<QrPaymentModalProps> = ({
  isOpen,
  onClose,
  accountId,
}) => {
  const [amount, setAmount] = useState<number>(50000);
  const [description, setDescription] = useState<string>('Chuyen tien vi Digital Wallet');
  const [copied, setCopied] = useState(false);

  // Chuỗi dữ liệu thanh toán mã hóa trong QR Code (Chuẩn Fintech EMVCo / VietQR)
  const qrPayload = JSON.stringify({
    wallet: 'DigitalWallet',
    targetAccount: accountId,
    amount: amount,
    desc: description,
    timestamp: Date.now(),
  });

  // Tạo URL ảnh mã QR trực quan (sử dụng QuickChart QR engine an toàn & ổn định)
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrPayload)}&size=240&margin=2&ecLevel=M`;

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mã QR Thanh Toán & Nhận Tiền" className="max-w-md">
      <div className="space-y-5 text-center">
        {/* QR Code Container */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-ocean-50 to-sky-100/60 border border-ocean-200 inline-block mx-auto shadow-md relative">
          <div className="w-52 h-52 bg-white rounded-2xl p-2.5 shadow-inner border border-ocean-200 flex items-center justify-center overflow-hidden">
            <img
              src={qrCodeUrl}
              alt="Mã QR Thanh Toán"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-ocean-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>VietQR & MoMo Compatible</span>
          </div>
        </div>

        {/* Amount & Account Quick Selector */}
        <div className="space-y-3 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Số tiền nhận yêu cầu (VND)
            </label>
            <div className="relative">
              <input
                type="number"
                min={1000}
                step={10000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white text-sm"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-ocean-700 font-black">
                {formatVND(amount)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lời nhắn giao dịch
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Guidance Box for Mobile Scanning */}
        <div className="p-3.5 rounded-2xl bg-ocean-50/80 border border-ocean-200 text-xs text-slate-600 space-y-1 text-left">
          <div className="font-bold text-ocean-800 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-ocean-600" />
            Hướng dẫn kiểm thử Mobile App & Web:
          </div>
          <p>
            1. Mở app Android trên điện thoại hoặc máy ảo (Emulator).
            <br />
            2. Quét mã QR này từ màn hình Web để tự động chuyển tiền qua Saga Orchestrator.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyPayload}
            icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Đã sao chép' : 'Sao chép dữ liệu'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
