import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Wifi,
  Droplets,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Sparkles,
} from 'lucide-react';
import { Button } from '../common/Button';

export interface HeroBannerProps {
  onOpenTransfer: () => void;
  onOpenDeposit: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenTransfer,
  onOpenDeposit,
}) => {
  return (
    <section className="relative overflow-hidden momo-wave-bg border-b border-ocean-100 py-12 lg:py-16">
      {/* MoMo style wavy watermark pattern on the right */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 momo-wave-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Big Typography & Promotions (MoMo Style) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Carousel Previous Arrow Button like in screenshot */}
            <div className="inline-flex items-center gap-2">
              <button
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-ocean-200 text-slate-600 hover:text-ocean-600 shadow-sm flex items-center justify-center transition-all active:scale-95"
                title="Banner trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-ocean-700 bg-white/90 px-3 py-1 rounded-full border border-ocean-200/80 shadow-xs">
                Ưu đãi tài chính số
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                Mỗi lượt trải nghiệm chuyển tiền
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                Nhận tiền{' '}
                <span className="inline-block px-3 py-0.5 rounded-lg bg-ocean-600 text-white shadow-md shadow-ocean-600/30 font-black">
                  50k
                </span>{' '}
                không giới hạn
              </h2>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">
                Lần đầu, có thêm quà{' '}
                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-sky-500 text-white font-extrabold shadow-sm">
                  200k
                </span>
              </p>
            </div>

            {/* Sub-description with Core Banking Trust Signals */}
            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Ví điện tử thế hệ mới với kiến trúc Core Banking: Bảo đảm tiền an toàn 100% qua{' '}
              <strong className="text-ocean-700 font-semibold">Tài khoản Treo (Escrow)</strong>, tự động bù trừ qua{' '}
              <strong className="text-ocean-700 font-semibold">Saga Orchestrator</strong> và tính số dư siêu tốc O(1) qua Snapshot.
            </p>

            {/* MoMo style introduction badge & CTA buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {/* Badge "Giới thiệu Ví" like "Giới thiệu MoMo" in screenshot */}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-ocean-200 shadow-sm text-xs font-bold text-slate-800">
                <div className="w-6 h-6 rounded-lg bg-ocean-50 text-ocean-600 flex items-center justify-center font-black text-[10px]">
                  DW
                </div>
                <span>Giới thiệu Ví</span>
              </div>

              {/* Action Buttons in soft ocean blue & white */}
              <Button
                variant="primary"
                size="md"
                onClick={onOpenTransfer}
                icon={<ArrowUpRight className="w-4 h-4" />}
                className="shadow-md shadow-ocean-500/25"
              >
                Chuyển tiền ngay
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={onOpenDeposit}
                icon={<ArrowDownLeft className="w-4 h-4 text-ocean-600" />}
                className="bg-white hover:bg-ocean-50"
              >
                Nạp tiền vào ví
              </Button>
            </div>
          </div>

          {/* Right Column: MoMo Artwork Illustration Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            {/* Framed Graphic Artwork matching user screenshot */}
            <div className="relative w-full max-w-md">
              {/* Outer Backdrop Frame in Soft Ocean Blue Gradient */}
              <div className="rounded-3xl bg-gradient-to-br from-sky-400 via-ocean-500 to-ocean-700 p-6 sm:p-8 shadow-2xl shadow-ocean-600/25 text-white relative overflow-hidden">
                {/* Decorative background light circles */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-sky-200/20 rounded-full blur-lg pointer-events-none" />

                {/* Card 1: Utility Coupon (WiFi, Droplets, Zap) matching MoMo screenshot */}
                <div className="bg-white rounded-2xl p-4 shadow-lg text-slate-800 mb-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300 border border-ocean-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-dashed border-slate-200">
                    <span className="text-xs font-bold text-ocean-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      VOUCHER THANH TOÁN
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-ocean-100 text-ocean-700">
                      GIẢM 50K
                    </span>
                  </div>

                  <div className="flex items-center justify-around py-2">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
                        <Wifi className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600">Internet</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600">Nước sinh hoạt</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                        <Zap className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600">Tiền điện</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Money Bundle Coupon with Green Ribbon matching MoMo screenshot */}
                <div className="bg-white rounded-2xl p-4 shadow-xl text-slate-800 transform rotate-1 hover:rotate-0 transition-transform duration-300 border border-ocean-100 relative">
                  <div className="flex items-center gap-3">
                    {/* Money bundle representation with yellow/green ribbon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 relative">
                      <Coins className="w-7 h-7" />
                      <div className="absolute inset-x-0 h-2 bg-amber-300/90 top-1/2 -translate-y-1/2 shadow-xs" />
                    </div>

                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-800">Tiền Thưởng Ví Mới</div>
                      <div className="text-xl font-black text-emerald-600">+200,000 ₫</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-ocean-600" />
                        Bảo chứng bởi Double-Entry Ledger
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carousel Next Arrow on the Right Edge */}
              <button
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-ocean-200 text-slate-600 hover:text-ocean-600 shadow-md flex items-center justify-center transition-all active:scale-95 z-20"
                title="Banner kế tiếp"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

