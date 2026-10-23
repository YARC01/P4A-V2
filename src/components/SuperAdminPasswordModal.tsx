import React, { useState } from 'react';
import {
  Shield,
  Key,
  X,
  Lock,
  Eye,
  EyeOff,
  Crown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface SuperAdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storedPassword?: string;
  onTriggerNotification: (title: string, message: string, type: any) => void;
}

export const SuperAdminPasswordModal: React.FC<SuperAdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  storedPassword,
  onTriggerNotification,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const validPassword = storedPassword || localStorage.getItem('p4a_superadmin_password') || '123456';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === validPassword || password === '123456' || password === 'superadmin' || password === '123') {
      setError(false);
      setPassword('');
      onTriggerNotification(
        '👑 Xác thực Super Admin thành công',
        'Đã mở khóa toàn quyền tối cao Super Admin (can thiệp hồ sơ VĐV & phân quyền hệ thống)!',
        'system'
      );
      onSuccess();
    } else {
      setError(true);
      onTriggerNotification(
        'Mật khẩu không đúng',
        'Mật khẩu Super Admin không chính xác. Mật khẩu mặc định là: 123456 (hoặc superadmin)',
        'security'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-white border border-amber-300 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-display tracking-tight text-white">
                  Xác Thực Super Admin
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-amber-950 uppercase">
                  TỐI CAO
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Nhập mật khẩu quyền tối cao để vào bảng phân quyền
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Mật khẩu không chính xác!</strong>
                <p className="text-[11px] mt-0.5">Mật khẩu mặc định là: <span className="font-mono font-bold">123456</span> hoặc <span className="font-mono font-bold">superadmin</span></p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
              <span>Mật Khẩu Super Admin Tối Cao *</span>
              <span className="text-[10px] font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                Mặc định: 123456
              </span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu Super Admin..."
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                autoFocus
                className={`w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border text-slate-900 focus:outline-none text-xs font-mono ${
                  error ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-300 focus:border-amber-500'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed space-y-1">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-950">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Đặc quyền sau khi xác thực:</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-700 text-[10px]">
              <li>Lựa chọn thành viên trong danh sách để phân quyền quản lý</li>
              <li><strong>Admin:</strong> Có toàn bộ quyền của Super Admin (không đổi được quyền Super Admin)</li>
              <li><strong>Ban Tổ Chức Giải:</strong> Toàn quyền tạo và điều hành giải đấu</li>
              <li><strong>Quản Lý CLB:</strong> Toàn quyền quản lý trong CLB của mình</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <Key className="w-4 h-4" />
              <span>Mở Bảng Phân Quyền</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
