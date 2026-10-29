import React from 'react';
import {
  QrCode,
  Smartphone,
  Apple,
  Play,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export const AppDownloadCTA: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-ocean-50/50 border-b border-ocean-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-ocean-200/90 shadow-xl shadow-ocean-500/10 p-8 sm:p-12 overflow-hidden relative">
          {/* Subtle water-wave ambient shape */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 momo-wave-pattern pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-50 text-ocean-700 text-xs font-bold border border-ocean-200">
                <Sparkles className="w-3.5 h-3.5 text-ocean-600" />
                <span>Trải nghiệm đa nền tảng</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Tải Siêu Ứng Dụng Ví Điện Tử
                <br />
                <span className="text-ocean-600">Thanh toán 1-chạm mọi lúc, mọi nơi</span>
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                Quản lý số dư, chuyển tiền miễn phí không giới hạn và nhận hàng ngàn voucher hoàn tiền hấp dẫn mỗi ngày ngay trên thiết bị di động của bạn.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Chuyển tiền 24/7 chỉ với 1 chạm</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Xác thực FaceID & TouchID an toàn</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Tự động nhắc lịch hóa đơn định kỳ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Đồng bộ tức thời với Sổ cái Kép</span>
                </div>
              </div>

              {/* App store buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95 transition-all">
                  <Apple className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase text-slate-400 font-medium">Tải về trên</div>
                    <div className="text-sm font-bold leading-none">App Store</div>
                  </div>
                </button>

                <button className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95 transition-all">
                  <Play className="w-5 h-5 fill-current" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase text-slate-400 font-medium">Khám phá trên</div>
                    <div className="text-sm font-bold leading-none">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right: QR Code Scanner box like MoMo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-ocean-50 to-sky-100/70 border border-ocean-200 text-center space-y-4 shadow-sm max-w-xs w-full">
                <div className="w-40 h-40 mx-auto bg-white rounded-2xl p-3 border border-ocean-200 shadow-md flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Quét mã QR để tải ngay
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Sử dụng camera điện thoại để quét mã và cài đặt ứng dụng trong 30 giây
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-ocean-700">
                  <Smartphone className="w-4 h-4" />
                  <span>Tương thích iOS & Android</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

