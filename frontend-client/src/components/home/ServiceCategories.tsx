import React from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Camera,
  FileText,
  CreditCard,
  QrCode,
  Smartphone,
  Zap,
  Droplets,
  Wifi,
  PiggyBank,
  ReceiptText,
} from 'lucide-react';

export interface ServiceCategoriesProps {
  onSelectAction: (actionId: string) => void;
  activeServiceId?: string;
}

export const ServiceCategories: React.FC<ServiceCategoriesProps> = ({
  onSelectAction,
  activeServiceId = 'transfer',
}) => {
  const services = [
    {
      id: 'transfer',
      name: 'Chuyển tiền',
      badge: 'Miễn phí',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      icon: <ArrowUpRight className="w-6 h-6 text-ocean-600" />,
      bgColor: 'bg-ocean-50 hover:bg-ocean-100',
    },
    {
      id: 'deposit',
      name: 'Nạp tiền ví',
      badge: 'Tức thì',
      badgeColor: 'bg-sky-100 text-sky-700',
      icon: <ArrowDownLeft className="w-6 h-6 text-sky-600" />,
      bgColor: 'bg-sky-50 hover:bg-sky-100',
    },
    {
      id: 'snapshot',
      name: 'Chốt Snapshot O(1)',
      badge: 'Tối ưu',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      icon: <Camera className="w-6 h-6 text-indigo-600" />,
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    },
    {
      id: 'ledger',
      name: 'Sổ cái kép',
      badge: 'Minh bạch',
      badgeColor: 'bg-blue-100 text-blue-700',
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'vnpay',
      name: 'VNPay QR',
      badge: 'Cổng TT',
      badgeColor: 'bg-blue-100 text-blue-700',
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      id: 'vietqr',
      name: 'VietQR NAPAS',
      badge: '24/7',
      badgeColor: 'bg-amber-100 text-amber-700',
      icon: <QrCode className="w-6 h-6 text-amber-600" />,
      bgColor: 'bg-amber-50 hover:bg-amber-100',
    },
    {
      id: 'momo_gate',
      name: 'Ví MoMo IPN',
      badge: 'HMAC-SHA256',
      badgeColor: 'bg-pink-100 text-pink-700',
      icon: <Smartphone className="w-6 h-6 text-pink-600" />,
      bgColor: 'bg-pink-50 hover:bg-pink-100',
    },
    {
      id: 'electric_bill',
      name: 'Tiền Điện',
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      bgColor: 'bg-amber-50 hover:bg-amber-100',
    },
    {
      id: 'water_bill',
      name: 'Nước Sinh hoạt',
      icon: <Droplets className="w-6 h-6 text-cyan-500" />,
      bgColor: 'bg-cyan-50 hover:bg-cyan-100',
    },
    {
      id: 'internet_bill',
      name: 'Internet / WiFi',
      icon: <Wifi className="w-6 h-6 text-sky-500" />,
      bgColor: 'bg-sky-50 hover:bg-sky-100',
    },
    {
      id: 'saving',
      name: 'Tích lũy ví',
      badge: '6.5%/năm',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      icon: <PiggyBank className="w-6 h-6 text-emerald-600" />,
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    },
    {
      id: 'receipt',
      name: 'Hóa đơn tổng',
      icon: <ReceiptText className="w-6 h-6 text-slate-600" />,
      bgColor: 'bg-slate-100 hover:bg-slate-200',
    },
  ];

  return (
    <section className="py-10 bg-white border-b border-ocean-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching user screenshot */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tiện ích và dịch vụ
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Ứng dụng tài chính Ví Điện Tử giúp bạn tiếp cận nhiều dịch vụ tài chính đa dạng với chi phí hợp lý,
            được bảo chứng tuyệt đối bởi hệ thống Sổ cái kép và Saga Orchestrator.
          </p>
        </div>

        {/* Categories Grid matching MoMo icon navigation */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {services.map((item) => {
            const isActive = activeServiceId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectAction(item.id)}
                className={`flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl border transition-all duration-200 group active:scale-95 ${
                  isActive
                    ? 'bg-ocean-50/80 border-ocean-300 ring-2 ring-ocean-400/40 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-ocean-200 hover:bg-ocean-50/30'
                }`}
              >
                <div className="relative mb-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs ${item.bgColor}`}
                  >
                    {item.icon}
                  </div>
                  {item.badge ? (
                    <span
                      className={`absolute -top-1.5 -right-3 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-2xs ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-ocean-700 leading-tight">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

