import React from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';

export const SecurityCompliance: React.FC = () => {
  const certifications = [
    {
      title: 'PCI DSS Level 1',
      subtitle: 'Tiêu chuẩn bảo mật thẻ thanh toán quốc tế cao nhất',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'ISO 27001:2022',
      subtitle: 'Hệ thống quản lý an toàn thông tin được kiểm định độc lập',
      icon: <FileCheck2 className="w-6 h-6 text-ocean-600" />,
      color: 'bg-ocean-50 text-ocean-700 border-ocean-200',
    },
    {
      title: 'Redisson Watchdog Lock',
      subtitle: 'Khóa phân tán tự động gia hạn, bảo vệ chống xung đột dữ liệu',
      icon: <Lock className="w-6 h-6 text-sky-600" />,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      title: 'HMAC-SHA256 & Constant-Time',
      subtitle: 'Chống tấn công giả mạo Webhook Spoofing và Timing Attack',
      icon: <KeyRound className="w-6 h-6 text-indigo-600" />,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-ocean-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-ocean-900 via-slate-900 to-ocean-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle light effect */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Heading */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-500/20 text-ocean-300 text-xs font-bold border border-ocean-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-ocean-400" />
                <span>An Toàn & Bảo Mật Tuyệt Đối</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Hệ thống Bảo mật Tài chính Đa tầng Tiêu chuẩn Toàn cầu
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Mỗi giao dịch nạp, rút và chuyển tiền trên Ví Điện Tử được kiểm soát qua kiến trúc Saga Orchestrator với cơ chế hoàn trả bù trừ tự động. Tiền luôn được ký quỹ tại tài khoản treo trước khi ghi nhận tới ví thụ hưởng.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Mã hóa đường truyền TLS 1.3
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Xác thực Idempotency SHA-256
                </span>
              </div>
            </div>

            {/* Right Column: 4 Security Badges Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certifications.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-ocean-400/50 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center mb-3 shadow-md">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
