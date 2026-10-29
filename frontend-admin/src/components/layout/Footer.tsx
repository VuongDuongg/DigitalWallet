import React from 'react';
import {
  Wallet,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  Globe,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-ocean-100 text-slate-600 text-xs">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-ocean-600 to-sky-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-ocean-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                Digital Wallet
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Ứng dụng Tài chính & Ví Điện Tử cung cấp giải pháp chuyển nhận tiền tức thì, thanh toán hóa đơn và quản trị tài chính cá nhân với chuẩn kiến trúc Core Banking bất biến.
            </p>

            <div className="space-y-2 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-ocean-600 shrink-0" />
                <span>Hotline hỗ trợ: <strong>1900 54 54 41</strong> (1.000 đ/phút)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-ocean-600 shrink-0" />
                <span>Email hỗ trợ: <strong>hotro@digitalwallet.vn</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-ocean-600 shrink-0 mt-0.5" />
                <span>Tòa nhà Digital Tower, Khu Công nghệ Cao, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* Col 2: Dịch vụ nổi bật */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Dịch vụ nổi bật
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Chuyển tiền liên ngân hàng 24/7</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Nạp & Rút tiền ví miễn phí</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Thanh toán Điện, Nước, Internet</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Cổng thanh toán VNPay QR</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">VietQR NAPAS</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Quản lý quỹ nhóm & Sổ cái kép</a></li>
            </ul>
          </div>

          {/* Col 3: Về chúng tôi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Về Digital Wallet
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Giới thiệu nền tảng</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Kiến trúc Core Banking & Saga</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Cơ hội nghề nghiệp</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Báo cáo minh bạch & Kiểm toán</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-ocean-600 transition-colors">Chính sách quyền riêng tư</a></li>
            </ul>
          </div>

          {/* Col 4: Chứng nhận & An toàn */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Chứng nhận an toàn
            </h4>
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-ocean-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">PCI DSS Level 1</div>
                  <div className="text-[10px] text-slate-500">Chuẩn bảo mật thẻ quốc tế</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-ocean-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-ocean-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">ISO 27001:2022</div>
                  <div className="text-[10px] text-slate-500">An toàn thông tin độc lập</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-ocean-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 text-[11px]">Ngân hàng Nhà nước</div>
                  <div className="text-[10px] text-slate-500">Giấy phép TGTT số 28/GP-NHNN</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Digital Wallet Corporation. Bảo lưu mọi quyền. Đã đăng ký bản quyền giải pháp thanh toán điện tử.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-ocean-600 cursor-pointer">Bảo mật giao dịch</span>
            <span>•</span>
            <span className="hover:text-ocean-600 cursor-pointer">Giải quyết khiếu nại</span>
            <span>•</span>
            <span className="hover:text-ocean-600 cursor-pointer">Sơ đồ trang web</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

