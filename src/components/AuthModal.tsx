import React, { useState } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  LogIn,
  KeyRound,
  Shield,
  Trophy,
  Sparkles,
  Phone,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { User, Athlete, UserRole } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User, createAthlete: boolean, athleteData?: Partial<Athlete>) => void;
  onTriggerNotification: (title: string, message: string, type: any) => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  onLogin,
  onRegister,
  onTriggerNotification,
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSport, setRegSport] = useState('Pickleball');
  const [regTier, setRegTier] = useState('Phong Trào');
  const [autoCreateAthlete, setAutoCreateAthlete] = useState(true);
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginIdentifier.trim()) {
      setLoginError('Vui lòng nhập Tên hoặc Email tài khoản');
      return;
    }

    const trimmedIdent = loginIdentifier.trim().toLowerCase();
    const foundUser = users.find(
      u =>
        u.name.toLowerCase() === trimmedIdent ||
        u.email.toLowerCase() === trimmedIdent ||
        (u.phone && u.phone.includes(trimmedIdent))
    );

    if (!foundUser) {
      setLoginError('Không tìm thấy tài khoản với tên hoặc email này. Bạn có thể chọn tài khoản demo bên dưới hoặc bấm Đăng Ký.');
      return;
    }

    // Verify password if set on user, or allow default '123' / '123456' / 'superadmin'
    const expectedPass = foundUser.password || '123';
    if (loginPassword && loginPassword !== expectedPass && loginPassword !== '123456' && loginPassword !== '123') {
      setLoginError('Mật khẩu không chính xác. Mật khẩu mặc định là: 123');
      return;
    }

    onLogin(foundUser);
    onTriggerNotification(
      'Đăng nhập thành công',
      `Chào mừng ${foundUser.name} đã quay trở lại hệ thống!`,
      'system'
    );
    onClose();
  };

  const handleQuickLoginUser = (user: User) => {
    onLogin(user);
    onTriggerNotification(
      'Đăng nhập thành công',
      `Đã chuyển sang tài khoản ${user.name} (${user.role.toUpperCase()})`,
      'system'
    );
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || regName.trim().length < 2) {
      setRegError('Họ và tên cần ít nhất 2 ký tự');
      return;
    }

    if (!regPassword.trim() || regPassword.trim().length < 3) {
      setRegError('Mật khẩu cần ít nhất 3 ký tự');
      return;
    }

    const userId = `usr-${Date.now()}`;
    const athleteId = `ath-${Date.now()}`;
    const cleanName = regName.trim();
    const emailPrefix = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '.');

    const newUser: User = {
      id: userId,
      name: cleanName,
      email: `${emailPrefix || 'user'}.${Date.now().toString().slice(-4)}@pickle4all.vn`,
      password: regPassword.trim(),
      role: 'athlete',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      phone: regPhone.trim() || '0900 000 000',
      athleteId: autoCreateAthlete ? athleteId : undefined,
    };

    const athleteData: Partial<Athlete> | undefined = autoCreateAthlete
      ? {
          id: athleteId,
          fullName: cleanName,
          nickname: cleanName.split(' ').slice(-1)[0] || cleanName,
          avatarUrl: newUser.avatar,
          gender: 'male',
          birthDate: '1998-01-01',
          age: 28,
          phone: newUser.phone || '',
          email: newUser.email,
          address: 'TP. Hồ Chí Minh',
          identityNumber: '079' + Math.floor(100000000 + Math.random() * 900000000),
          clubId: '',
          clubName: 'Tự do',
          sportType: regSport,
          rankingTier: regTier,
          eloRating: 1400,
          status: 'active',
          bio: `Vận động viên ${regSport} mới tham gia hệ thống PICKLE 4 ALL.`,
          careerHistory: [],
          achievements: [],
        }
      : undefined;

    onRegister(newUser, autoCreateAthlete, athleteData);
    onTriggerNotification(
      '🎉 Đăng ký tài khoản thành công',
      `Tài khoản "${cleanName}" đã được tạo và kích hoạt tức thì!`,
      'system'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display tracking-tight text-white">
                {tab === 'login' ? 'Đăng Nhập Nhanh' : 'Đăng Ký Tài Khoản'}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {tab === 'login'
                  ? 'Đăng nhập để tạo giải, lập nhóm và thi đấu'
                  : 'Chỉ mất 3 giây với Tên và Mật khẩu'}
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setLoginError('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              tab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setRegError('');
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              tab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng Ký Nhanh</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* Notification about auto logout of current session */}
          <div className="mb-4 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Khi đăng nhập tài khoản khác hoặc đăng ký mới, hệ thống sẽ <strong>tự động thoát tài khoản hiện tại</strong> và chuyển sang phiên mới.
            </span>
          </div>

          {tab === 'login' ? (
            <div className="space-y-5">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tên Tài Khoản hoặc Email *
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Lê Hoàng Quân hoặc kiet.tran@..."
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Mật Khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mật khẩu của bạn..."
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Pass mặc định cho tài khoản demo: <span className="font-mono font-bold text-slate-700">123</span> (Super Admin: <span className="font-mono font-bold text-slate-700">superadmin</span>)
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập Ngay</span>
                </button>
              </form>

              {/* 1-Click Fast Switch Demo Accounts */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2 text-center">
                  Hoặc 1-click đăng nhập nhanh bằng vai trò demo
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {users.slice(0, 4).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLoginUser(u)}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-colors flex items-center gap-2 group"
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 truncate text-[11px]">
                          {u.name}
                        </div>
                        <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-tight">
                          {u.role === 'super_admin'
                            ? '👑 SUPER ADMIN'
                            : u.role === 'admin'
                            ? '🏢 QUẢN LÝ CLB'
                            : u.role === 'organizer'
                            ? '🏆 BTC GIẢI'
                            : '🏸 VẬN ĐỘNG VIÊN'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Họ và Tên *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Hoàng"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mật Khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 3 ký tự (Ví dụ: 123456)"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs font-mono"
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

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Số Điện Thoại (Tùy chọn)
                </label>
                <input
                  type="tel"
                  placeholder="0912 xxx xxx"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Bộ Môn Chính
                  </label>
                  <select
                    value={regSport}
                    onChange={e => setRegSport(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs"
                  >
                    <option value="Pickleball">Pickleball</option>
                    <option value="Cầu Lông">Cầu Lông</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Billiards">Bida (Pool/Carom)</option>
                    <option value="Bóng Đá">Bóng Đá</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Trình Độ / Hạng
                  </label>
                  <select
                    value={regTier}
                    onChange={e => setRegTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs"
                  >
                    <option value="Phong Trào">Phong Trào</option>
                    <option value="Nghiệp Dư">Nghiệp Dư</option>
                    <option value="Bán Chuyên">Bán Chuyên</option>
                    <option value="Chuyên Nghiệp">Chuyên Nghiệp</option>
                    <option value="Gà">Hạng Gà</option>
                    <option value="Cọp">Hạng Cọp</option>
                    <option value="Đại Bàng">Hạng Đại Bàng</option>
                    <option value="Voi">Hạng Voi</option>
                  </select>
                </div>
              </div>

              {/* Auto Create Athlete Profile Checkbox */}
              <label className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoCreateAthlete}
                  onChange={e => setAutoCreateAthlete(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-extrabold text-emerald-950 block">
                    Tự động tạo ngay Hồ sơ Vận Động Viên (VĐV)
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Bạn có thể xin gia nhập các CLB, đăng ký tham gia các giải đấu và theo dõi điểm ELO cá nhân ngay sau khi đăng ký.
                  </span>
                </div>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Hoàn Tất Đăng Ký (3 Giây)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
