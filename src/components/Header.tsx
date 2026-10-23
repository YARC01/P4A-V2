import React, { useState } from 'react';
import {
  Bell,
  Shield,
  UserCheck,
  Trophy,
  Activity,
  ChevronDown,
  Sparkles,
  Lock,
  LogOut,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { User, UserRole, PushNotification } from '../types.ts';
import { INITIAL_USERS } from '../mockData.ts';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  notifications: PushNotification[];
  onOpenNotifications: () => void;
  onOpenRoleManagement: () => void;
  onMarkAllNotificationsRead: () => void;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
  onLogout?: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  onSelectUser,
  notifications,
  onOpenNotifications,
  onOpenRoleManagement,
  onOpenAuthModal,
  onLogout,
  activeTab,
  onNavigate,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; color: string; badge: string }> = {
    super_admin: { label: 'BQT', color: 'from-amber-500 to-orange-600', badge: 'SUPER ADMIN' },
    admin: { label: 'Admin CLB', color: 'from-blue-600 to-indigo-600', badge: 'ADMIN CLB' },
    organizer: { label: 'Ban Tổ Chức', color: 'from-emerald-600 to-teal-700', badge: 'BTC GIẢI' },
    coach: { label: 'Huấn Luyện Viên', color: 'from-emerald-500 to-teal-600', badge: 'COACH' },
    athlete: { label: 'Vận Động Viên', color: 'from-cyan-500 to-blue-600', badge: 'ATHLETE' },
    referee: { label: 'Trọng Tài', color: 'from-rose-500 to-pink-600', badge: 'REFEREE' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-lime-400 shadow-md shadow-emerald-500/25">
              <span className="font-display font-black text-white text-lg tracking-tighter">P4A</span>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                  PICKLE <span className="text-emerald-600">4 ALL</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  V.2026 PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Hệ Thống Thể Thao & Bốc Thăm Giải Đấu Chuẩn Quốc Tế
              </p>
            </div>
          </div>

          {/* Quick Stats or Live Match Ticker indicator */}
          <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 font-medium">Hệ thống trực tiếp:</span>
              <span className="text-emerald-700 font-bold">1 Trận Đang Đấu</span>
            </div>
            <div className="h-3 w-px bg-slate-300"></div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold">3 Giải Khởi Tranh</span>
            </div>
          </div>

          {/* Action Center: Role Switcher & Push Notification Bell */}
          <div className="flex items-center gap-2.5">
            {/* Super Admin & Role Management Button - SHIELD ICON ONLY (Bỏ chữ phân quyền) */}
            <button
              type="button"
              onClick={onOpenRoleManagement}
              className={`relative p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xs border ${
                currentUser.role === 'super_admin'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white border-amber-400 shadow-amber-500/20'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
              }`}
              title="Super Admin"
              aria-label="Super Admin Shield"
            >
              <Shield className="w-5 h-5 text-current" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
            </button>

            {/* Push Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Thông báo đẩy"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile Info - CHỈ HIỆN THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP, KHÔNG CÓ BỘ LỰA CHỌN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all hover:scale-105 active:scale-95 shadow-2xs group"
                title={`Tài khoản: ${currentUser.name} (${roleLabels[currentUser.role]?.label || 'Thành viên'}). Bấm để xem thông tin.`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-slate-300 shadow-sm"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                    {roleLabels[currentUser.role]?.badge || 'THÀNH VIÊN'}
                  </div>
                </div>
              </button>

              {/* Clean Account Menu - CHỈ HIỆN THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP & LIÊN KẾT HỒ SƠ, KHÔNG CÓ DANH SÁCH CHỌN VAI TRÒ */}
              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3"
                  onMouseLeave={() => setShowRoleMenu(false)}
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {currentUser.email || 'user@pickle4all.vn'}
                      </div>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {roleLabels[currentUser.role]?.label || 'Thành viên'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for current account */}
                  <div className="space-y-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoleMenu(false);
                        onNavigate('athletes');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold flex items-center gap-2 border border-emerald-200 transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Hồ Sơ Vận Động Viên Của Tôi</span>
                    </button>

                    {onOpenAuthModal && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRoleMenu(false);
                            onOpenAuthModal('login');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-2 border border-slate-200 transition-colors text-left"
                        >
                          <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span>Đăng Nhập Tài Khoản Khác</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowRoleMenu(false);
                            onOpenAuthModal('register');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-2 border border-slate-200 transition-colors text-left"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>Đăng Ký Tài Khoản Mới</span>
                        </button>
                      </>
                    )}

                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowRoleMenu(false);
                          onLogout();
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold flex items-center gap-2 border border-rose-200 transition-colors text-left mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>Đăng Xuất (Thoát Tài Khoản)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
