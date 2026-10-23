import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Users,
  ShieldAlert,
  BarChart3,
  DollarSign,
  Lock,
  Newspaper,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdminUnlocked: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  isAdminUnlocked,
}) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Báo Cáo Thời Gian Thực',
      icon: LayoutDashboard,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'tournaments',
      label: 'Giải Đấu',
      icon: Trophy,
      badge: 'Bốc Thăm',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'athletes',
      label: 'Vận Động Viên',
      icon: Users,
      badge: 'Xuất PDF',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      id: 'clubs',
      label: 'Nhóm & CLB',
      icon: ShieldAlert,
      badge: 'Bảo Mật',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'standings',
      label: 'Bảng Xếp Hạng Mùa Giải',
      icon: BarChart3,
    },
    {
      id: 'news',
      label: 'Tin Tức & Thông Báo',
      icon: Newspaper,
      badge: 'Mới',
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    {
      id: 'treasury',
      label: 'Quỹ & Kèo',
      icon: DollarSign,
      isProtected: true,
      badge: isAdminUnlocked ? 'Mở Khóa' : 'Khóa Pass',
      badgeColor: isAdminUnlocked
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
  ];

  return (
    <nav className="bg-white/90 border-b border-slate-200/90 sticky top-18 z-30 backdrop-blur-sm shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.isProtected && !isAdminUnlocked && (
                  <Lock className="w-3 h-3 text-rose-500 ml-0.5" />
                )}
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isActive ? 'bg-black/20 text-white' : tab.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
