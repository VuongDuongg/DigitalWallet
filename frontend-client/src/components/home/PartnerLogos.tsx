import React from 'react';
import { Building, Shield } from 'lucide-react';

export const PartnerLogos: React.FC = () => {
  const bankPartners = [
    { name: 'Vietcombank', code: 'VCB', type: 'Ngân hàng Ngoại thương' },
    { name: 'BIDV', code: 'BIDV', type: 'Đầu tư & Phát triển' },
    { name: 'VietinBank', code: 'CTG', type: 'Công Thương VN' },
    { name: 'Agribank', code: 'VBA', type: 'Nông nghiệp & PTNT' },
    { name: 'Techcombank', code: 'TCB', type: 'Kỹ thương Việt Nam' },
    { name: 'MB Bank', code: 'MBB', type: 'Quân Đội' },
    { name: 'VPBank', code: 'VPB', type: 'Việt Nam Thịnh Vượng' },
    { name: 'ACB', code: 'ACB', type: 'Á Châu' },
  ];

  const gatewayPartners = [
    { name: 'VNPay QR', desc: 'Cổng thanh toán quốc gia' },
    { name: 'VietQR NAPAS', desc: 'Chuyển nhanh 24/7' },
    { name: 'MoMo IPN', desc: 'Ví điện tử đối tác' },
    { name: 'ZaloPay', desc: 'Ví điện tử liên kết' },
    { name: 'Apple Pay', desc: 'Thanh toán quốc tế' },
    { name: 'Google Pay', desc: 'Thanh toán Android' },
  ];

  return (
    <section className="py-14 bg-slate-50/60 border-b border-ocean-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ocean-700 mb-1">
              <Shield className="w-4 h-4 text-ocean-600" />
              <span>Mạng lưới đối tác uy tín</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Được tín nhiệm bởi hơn 40+ Ngân hàng & Tổ chức Tài chính
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Kết nối trực tiếp liên ngân hàng qua giao thức thanh toán NAPAS và hạ tầng mở rộng linh hoạt theo Strategy Pattern.
          </p>
        </div>

        {/* Bank Partner Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {bankPartners.map((bank, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white border border-ocean-100 hover:border-ocean-300 hover:shadow-sm text-center flex flex-col items-center justify-center transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-ocean-50 text-ocean-700 font-black text-xs flex items-center justify-center mb-1.5 group-hover:bg-ocean-100 group-hover:scale-105 transition-all">
                {bank.code}
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {bank.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-full">
                {bank.type}
              </span>
            </div>
          ))}
        </div>

        {/* Payment Gateways Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {gatewayPartners.map((gw, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/80 border border-slate-200/80 hover:border-ocean-300 flex items-center gap-2.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-ocean-600 flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">{gw.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{gw.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

