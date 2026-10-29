import React from 'react';
import {
  ShieldCheck,
  Zap,
  Building2,
  Layers,
  Sparkles,
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-ocean-600" />,
      title: 'Bảo mật đa tầng & An toàn tuyệt đối',
      desc: 'Áp dụng mã hóa HMAC-SHA256, Khóa phân tán Redisson Watchdog và cơ chế Tài khoản Treo (SYSTEM_ESCROW) chống rút ruột tài khoản.',
      badge: 'PCI DSS Level 1',
    },
    {
      icon: <Layers className="w-8 h-8 text-sky-600" />,
      title: 'Sổ cái kép (Double-Entry Bookkeeping)',
      desc: 'Chuẩn kế toán ngân hàng quốc tế. Mọi giao dịch ghi nhận đồng thời 2 dòng bút toán bất biến: Tổng Nợ (Debit) luôn bằng Tổng Có (Credit).',
      badge: 'Minh bạch 100%',
    },
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      title: 'Liên kết 40+ Ngân hàng & Cổng thanh toán',
      desc: 'Hỗ trợ nạp rút và chuyển tiền liên ngân hàng 24/7 qua VietQR NAPAS, VNPay, MoMo và ZaloPay theo Strategy Pattern mở rộng dễ dàng.',
      badge: 'Miễn phí 24/7',
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      title: 'Hiệu năng siêu tốc với Ledger Snapshot',
      desc: 'Cơ chế Checkpointing chốt số dư định kỳ giúp tính số dư khả dụng với độ phức tạp O(1), không nghẽn CPU khi dữ liệu phình to.',
      badge: 'Tốc độ O(1)',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-ocean-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading like momo.vn */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-50 text-ocean-700 text-xs font-bold border border-ocean-200">
            <Sparkles className="w-3.5 h-3.5 text-ocean-600" />
            <span>Nền tảng Tài chính Thế hệ mới</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Tại sao hàng triệu người tin dùng Ví Điện Tử?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Kết hợp giữa trải nghiệm thanh toán 1-chạm mượt mà của Siêu ứng dụng và kiến trúc Core Banking vững chắc của hệ thống ngân hàng số.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-50/60 hover:bg-white border border-ocean-100 hover:border-ocean-300 shadow-xs hover:shadow-lg hover:shadow-ocean-500/10 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-ocean-200 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-ocean-100/80 text-ocean-700 border border-ocean-200">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-ocean-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-ocean-600 group-hover:translate-x-1 transition-transform">
                <span>Khám phá công nghệ &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
