/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Navigation } from './components/Navigation.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TournamentsView } from './components/TournamentsView.tsx';
import { AthletesView } from './components/AthletesView.tsx';
import { ClubsView } from './components/ClubsView.tsx';
import { StandingsLeaderboardView } from './components/StandingsLeaderboardView.tsx';
import { TreasuryBetsView } from './components/TreasuryBetsView.tsx';
import { NewsView } from './components/NewsView.tsx';
import { NotificationCenterModal } from './components/NotificationCenterModal.tsx';
import { RoleManagementModal } from './components/RoleManagementModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { SuperAdminPasswordModal } from './components/SuperAdminPasswordModal.tsx';
import {
  INITIAL_USERS,
  INITIAL_CLUBS,
  INITIAL_ATHLETES,
  INITIAL_TOURNAMENTS,
  INITIAL_TREASURY,
  INITIAL_BETS,
  INITIAL_NOTIFICATIONS,
  INITIAL_NEWS,
} from './mockData.ts';
import {
  User,
  UserRole,
  ClubGroup,
  Athlete,
  Tournament,
  TreasuryRecord,
  BetPrediction,
  PushNotification,
  NewsArticle,
} from './types.ts';
import { Bell, Flame, Shield, CheckCircle, Trophy, Sparkles } from 'lucide-react';

export default function App() {
  // Users state with Super Admin permission delegation
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('P4A_users') || localStorage.getItem('nesa333_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_USERS;
  });

  const [isRoleManagementOpen, setIsRoleManagementOpen] = useState(false);
  const [isSuperAdminPassModalOpen, setIsSuperAdminPassModalOpen] = useState(false);
  const [isSuperAdminUnlocked, setIsSuperAdminUnlocked] = useState(false);

  // Quick Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Current logged in user (with role switcher)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('P4A_user') || localStorage.getItem('nesa333_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_USERS[0]; // Super Admin
  });

  // State with LocalStorage persistence
  const [clubs, setClubs] = useState<ClubGroup[]>(() => {
    const saved = localStorage.getItem('P4A_clubs') || localStorage.getItem('nesa333_clubs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_CLUBS;
  });

  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const saved = localStorage.getItem('P4A_athletes') || localStorage.getItem('nesa333_athletes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_ATHLETES;
  });

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('P4A_tournaments') || localStorage.getItem('nesa333_tournaments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TOURNAMENTS;
  });

  const [treasury, setTreasury] = useState<TreasuryRecord[]>(() => {
    const saved = localStorage.getItem('P4A_treasury') || localStorage.getItem('nesa333_treasury');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TREASURY;
  });

  const [bets, setBets] = useState<BetPrediction[]>(() => {
    const saved = localStorage.getItem('P4A_bets') || localStorage.getItem('nesa333_bets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_BETS;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('P4A_notifications') || localStorage.getItem('nesa333_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seenIds = new Set<string>();
          return parsed.filter(item => {
            if (!item || !item.id || seenIds.has(item.id)) return false;
            seenIds.add(item.id);
            return true;
          });
        }
      } catch {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem('P4A_news');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_NEWS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('P4A_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('P4A_clubs', JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem('P4A_athletes', JSON.stringify(athletes));
  }, [athletes]);

  useEffect(() => {
    localStorage.setItem('P4A_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);

  useEffect(() => {
    localStorage.setItem('P4A_treasury', JSON.stringify(treasury));
  }, [treasury]);

  useEffect(() => {
    localStorage.setItem('P4A_bets', JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem('P4A_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('P4A_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('P4A_news', JSON.stringify(news));
  }, [news]);

  // User Role Management Handlers
  const handleUpdateUserRole = (userId: string, newRole: UserRole, clubId?: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole, clubId: clubId || u.clubId } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, role: newRole, clubId: clubId || prev.clubId }));
    }
  };

  const handleAddUserFromAthlete = (athlete: Athlete, role: UserRole, clubId?: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: athlete.fullName,
      email: `${athlete.fullName.toLowerCase().replace(/\s+/g, '.')}@pickle4all.vn`,
      password: '123',
      role,
      avatar: athlete.avatarUrl,
      phone: athlete.phone,
      clubId: clubId || athlete.clubId,
      athleteId: athlete.id,
    };
    setUsers(prev => [newUser, ...prev]);
  };

  // Header Shield Click Handler -> Super Admin pass prompt
  const handleOpenRoleManagement = () => {
    setIsSuperAdminPassModalOpen(true);
  };

  const handleSuperAdminPassSuccess = () => {
    setIsSuperAdminUnlocked(true);
    setIsSuperAdminPassModalOpen(false);
    const superAdmin = users.find(u => u.role === 'super_admin');
    if (superAdmin) {
      setCurrentUser(superAdmin);
    }
    setIsRoleManagementOpen(true);
    triggerNotification(
      '👑 Đăng nhập Super Admin thành công',
      'Bạn đã xác thực mật mã Super Admin tối cao và mở bảng phân quyền hệ thống.',
      'tournament'
    );
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  // Switch session on login (auto logout previous user)
  const handleLogin = (user: User) => {
    const previousUserName = currentUser?.name;
    // Reset unlocked status on session switch
    setIsSuperAdminUnlocked(false);
    setIsAdminUnlocked(false);
    setCurrentUser(user);

    triggerNotification(
      'Đăng nhập thành công',
      previousUserName && previousUserName !== user.name
        ? `Đã tự động thoát tài khoản "${previousUserName}" và đăng nhập vào tài khoản "${user.name}" (${user.role.toUpperCase()}).`
        : `Chào mừng ${user.name} (${user.role.toUpperCase()}) đã đăng nhập vào hệ thống.`,
      'system'
    );
  };

  // Logout current user and switch to default athlete account
  const handleLogout = () => {
    const previousUserName = currentUser?.name;
    setIsSuperAdminUnlocked(false);
    setIsAdminUnlocked(false);
    const defaultUser = users.find(u => u.role === 'athlete') || INITIAL_USERS[2];
    setCurrentUser(defaultUser);
    triggerNotification(
      'Đã đăng xuất tài khoản',
      `Đã tự động thoát tài khoản "${previousUserName}". Chuyển về chế độ thành viên khách.`,
      'system'
    );
  };

  const handleLockSuperAdmin = () => {
    setIsSuperAdminUnlocked(false);
    triggerNotification(
      '🔒 Đã khóa lại Super Admin',
      'Đã khóa lại quyền can thiệp hệ thống của Super Admin để bảo vệ dữ liệu an toàn.',
      'system'
    );
  };

  const handleUnlockSuperAdmin = () => {
    setIsSuperAdminUnlocked(true);
    triggerNotification(
      '🔓 Đã mở khóa Super Admin',
      'Đã mở toàn quyền can thiệp, chỉnh sửa hồ sơ VĐV cho Super Admin.',
      'system'
    );
  };

  const handleUpdateCurrentUser = (updatedUser: Partial<User>) => {
    setCurrentUser(prev => {
      const merged = { ...prev, ...updatedUser };
      setUsers(allUsers =>
        allUsers.map(u => (u.id === prev.id ? { ...u, ...updatedUser } : u))
      );
      return merged;
    });
  };

  // Switch session on registration (auto logout previous user)
  const handleRegister = (newUser: User, createAthlete: boolean, athleteData?: Partial<Athlete>) => {
    const previousUserName = currentUser?.name;
    setIsSuperAdminUnlocked(false);
    setIsAdminUnlocked(false);
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    if (createAthlete && athleteData) {
      setAthletes(prev => [athleteData as Athlete, ...prev]);
    }
    triggerNotification(
      'Đăng ký tài khoản mới thành công',
      `Đã tự động thoát phiên cũ${previousUserName ? ` của "${previousUserName}"` : ''} và kích hoạt tài khoản mới "${newUser.name}". Hồ sơ VĐV đã được đồng bộ trực tiếp.`,
      'system'
    );
  };

  // Ensure currentUser has a linked athlete profile with basic info
  useEffect(() => {
    if (!currentUser) return;
    const existing = athletes.find(a =>
      (currentUser.athleteId && a.id === currentUser.athleteId) ||
      (a.email && currentUser.email && a.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) ||
      (a.fullName && currentUser.name && a.fullName.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
    );

    if (!existing) {
      const newAthId = currentUser.athleteId || `ath-${currentUser.id}`;
      const newAth: Athlete = {
        id: newAthId,
        fullName: currentUser.name,
        nickname: currentUser.name.split(' ').pop() || 'Pro',
        avatarUrl: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        gender: 'male',
        birthDate: '1995-05-15',
        age: 31,
        phone: currentUser.phone || '0908 333 333',
        email: currentUser.email || 'user@pickle4all.vn',
        address: 'TP. Hà Nội',
        identityNumber: '',
        clubId: currentUser.clubId || clubs[0]?.id || '',
        clubName: clubs.find(c => c.id === currentUser.clubId)?.name || clubs[0]?.name || 'CLB Tự Do',
        sportType: 'Pickleball',
        rankingTier: 'Chuyên Nghiệp',
        eloRating: 1600,
        duprRating: 4.5,
        status: 'active',
        bio: `Hồ sơ vận động viên của ${currentUser.name}`,
        heightCm: 175,
        weightKg: 70,
        dominantHand: 'Phải',
        achievements: [],
        careerHistory: [],
      };
      setAthletes(prev => [newAth, ...prev]);
      if (currentUser.athleteId !== newAthId) {
        setCurrentUser(prev => ({ ...prev, athleteId: newAthId }));
      }
    } else if (currentUser.athleteId !== existing.id) {
      setCurrentUser(prev => ({ ...prev, athleteId: existing.id }));
    }
  }, [currentUser.id, currentUser.name, currentUser.email]);

  // Batch Update Athletes' Club
  const handleBatchUpdateAthletesClub = (clubId: string, clubName: string, selectedAthleteIds: string[]) => {
    setAthletes(prev =>
      prev.map(ath => {
        if (selectedAthleteIds.includes(ath.id)) {
          return { ...ath, clubId, clubName };
        } else if (ath.clubId === clubId) {
          return { ...ath, clubId: '', clubName: 'Tự do' };
        }
        return ath;
      })
    );
    setClubs(prev =>
      prev.map(c => (c.id === clubId ? { ...c, memberCount: selectedAthleteIds.length } : c))
    );
  };

  // Trigger Notification helper - cập nhật danh sách thông báo và số lượng tin trên chuông (không hiển thị popup xem nhanh)
  const triggerNotification = (
    title: string,
    message: string,
    type: PushNotification['type'] = 'tournament',
    priority: PushNotification['priority'] = 'normal'
  ) => {
    const uniqueSuffix = Math.random().toString(36).substring(2, 9);
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}-${uniqueSuffix}`,
      title,
      message,
      type,
      priority,
      timestamp: 'Vừa xong',
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  // Quick simulate push alert
  const handleQuickSimulateAlert = () => {
    triggerNotification(
      '⚡ Thông báo đẩy từ BQT NESA 333',
      'Đã cập nhật lịch thi đấu vòng bán kết trên Sân Trung Tâm A. VĐV vui lòng có mặt trước 15 phút.',
      'match_alert',
      'urgent'
    );
  };

  // Club Handlers
  const handleAddClub = (newClub: ClubGroup) => {
    setClubs(prev => [newClub, ...prev]);
  };

  const handleUpdateClub = (updatedClub: ClubGroup) => {
    setClubs(prev => prev.map(c => (c.id === updatedClub.id ? updatedClub : c)));
  };

  const handleDeleteClub = (clubId: string) => {
    setClubs(prev => prev.filter(c => c.id !== clubId));
  };

  // Athlete Handlers
  const handleAddAthlete = (newAthlete: Athlete) => {
    setAthletes(prev => [newAthlete, ...prev]);
  };

  const handleUpdateAthlete = (updatedAthlete: Athlete) => {
    setAthletes(prev => prev.map(a => (a.id === updatedAthlete.id ? updatedAthlete : a)));
  };

  const handleDeleteAthlete = (athleteId: string) => {
    setAthletes(prev => prev.filter(a => a.id !== athleteId));
  };

  const handleResetDefaultAthletes = () => {
    setAthletes(INITIAL_ATHLETES);
    triggerNotification(
      '🔄 Đã khôi phục danh sách VĐV mẫu',
      'Đã nạp lại danh sách VĐV đầy đủ chỉ số ELO, DUPR, chiều cao, cân nặng và hồ sơ chuẩn.',
      'tournament'
    );
  };

  // Tournament Handlers
  const handleAddTournament = (newTour: Tournament) => {
    setTournaments(prev => [newTour, ...prev]);
  };

  const handleUpdateTournament = (updatedTour: Tournament) => {
    setTournaments(prev => prev.map(t => (t.id === updatedTour.id ? updatedTour : t)));
  };

  const handleDeleteTournament = (tournamentId: string) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    triggerNotification(
      '🗑️ Đã xóa giải đấu thành công',
      'Super Admin đã gỡ bỏ giải đấu khỏi hệ thống dữ liệu.',
      'system'
    );
  };

  const handleResetDefaultTournaments = () => {
    setTournaments(INITIAL_TOURNAMENTS);
    triggerNotification(
      '🔄 Đã khôi phục danh sách giải đấu mẫu',
      'Đã tái lập danh sách các giải đấu tiêu chuẩn (Đang diễn ra, Sắp diễn ra và Lịch sử hoàn tất).',
      'tournament'
    );
  };

  // Treasury Handlers
  const handleAddTreasuryRecord = (record: TreasuryRecord) => {
    setTreasury(prev => [record, ...prev]);
  };

  // Bet Pick Handler
  const handlePlaceBetPick = (betId: string, teamId: string, points: number) => {
    setBets(prev =>
      prev.map(b => {
        if (b.id !== betId) return b;
        const isTeam1 = b.team1.id === teamId;
        return {
          ...b,
          team1: { ...b.team1, votes: isTeam1 ? b.team1.votes + 1 : b.team1.votes },
          team2: { ...b.team2, votes: !isTeam1 ? b.team2.votes + 1 : b.team2.votes },
          totalPoolPoints: b.totalPoolPoints + points,
          picks: [
            ...b.picks,
            {
              userId: currentUser.id,
              userName: currentUser.name,
              pickTeamId: teamId,
              pointsWagered: points,
              timestamp: new Date().toLocaleTimeString('vi-VN'),
            },
          ],
        };
      })
    );
    triggerNotification(
      'Dự đoán thành công',
      `Bạn đã bình chọn cho đội trong trận đấu với ${points.toLocaleString()} điểm MVP.`,
      'tournament'
    );
  };

  // News Handlers
  const handleAddNews = (article: NewsArticle) => {
    setNews(prev => [article, ...prev]);
  };

  const handleUpdateNews = (article: NewsArticle) => {
    setNews(prev => prev.map(n => (n.id === article.id ? article : n)));
  };

  const handleDeleteNews = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  // Notifications Handlers
  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={handleLogin}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenRoleManagement={handleOpenRoleManagement}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />

      {/* Main Tab Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdminUnlocked={isAdminUnlocked}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            athletes={athletes}
            clubs={clubs}
            tournaments={tournaments}
            notifications={notifications}
            onNavigate={setActiveTab}
            onQuickSimulateAlert={handleQuickSimulateAlert}
          />
        )}

        {activeTab === 'tournaments' && (
          <TournamentsView
            tournaments={tournaments}
            athletes={athletes}
            currentUser={currentUser}
            isSuperAdminUnlocked={isSuperAdminUnlocked}
            onUnlockSuperAdmin={handleUnlockSuperAdmin}
            onAddTournament={handleAddTournament}
            onUpdateTournament={handleUpdateTournament}
            onDeleteTournament={handleDeleteTournament}
            onResetDefaultTournaments={handleResetDefaultTournaments}
            onTriggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'athletes' && (
          <AthletesView
            athletes={athletes}
            clubs={clubs}
            tournaments={tournaments}
            currentUser={currentUser}
            isSuperAdminUnlocked={isSuperAdminUnlocked}
            onUnlockSuperAdmin={handleUnlockSuperAdmin}
            onLockSuperAdmin={handleLockSuperAdmin}
            onAddAthlete={handleAddAthlete}
            onUpdateAthlete={handleUpdateAthlete}
            onDeleteAthlete={handleDeleteAthlete}
            onResetDefaultAthletes={handleResetDefaultAthletes}
            onTriggerNotification={triggerNotification}
            onUpdateCurrentUser={handleUpdateCurrentUser}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsView
            clubs={clubs}
            athletes={athletes}
            currentUser={currentUser}
            onAddClub={handleAddClub}
            onUpdateClub={handleUpdateClub}
            onDeleteClub={handleDeleteClub}
            onBatchUpdateAthletesClub={handleBatchUpdateAthletesClub}
            onTriggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'standings' && (
          <StandingsLeaderboardView
            athletes={athletes}
            tournaments={tournaments}
          />
        )}

        {activeTab === 'news' && (
          <NewsView
            news={news}
            currentUser={currentUser}
            onAddNews={handleAddNews}
            onUpdateNews={handleUpdateNews}
            onDeleteNews={handleDeleteNews}
            onTriggerNotification={triggerNotification}
          />
        )}

        {activeTab === 'treasury' && (
          <TreasuryBetsView
            treasury={treasury}
            bets={bets}
            currentUser={currentUser}
            isAdminUnlocked={isAdminUnlocked}
            onSetAdminUnlocked={setIsAdminUnlocked}
            onAddTreasuryRecord={handleAddTreasuryRecord}
            onPlaceBetPick={handlePlaceBetPick}
            onTriggerNotification={triggerNotification}
          />
        )}
      </main>

      {/* Super Admin Password Authentication Gate Modal */}
      <SuperAdminPasswordModal
        isOpen={isSuperAdminPassModalOpen}
        onClose={() => setIsSuperAdminPassModalOpen(false)}
        onSuccess={handleSuperAdminPassSuccess}
        onTriggerNotification={triggerNotification}
      />

      {/* Quick Login / Register Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onTriggerNotification={triggerNotification}
        initialTab={authModalTab}
      />

      {/* Super Admin Role Delegation & Access Control Center */}
      <RoleManagementModal
        isOpen={isRoleManagementOpen}
        onClose={() => setIsRoleManagementOpen(false)}
        currentUser={currentUser}
        users={users}
        clubs={clubs}
        athletes={athletes}
        onUpdateUserRole={handleUpdateUserRole}
        onAddUserFromAthlete={handleAddUserFromAthlete}
        onTriggerNotification={triggerNotification}
      />

      {/* Push Notifications Center Slide-Over */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        currentUser={currentUser}
        onSendNotification={(title, msg, type, priority) => triggerNotification(title, msg, type, priority)}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearNotifications={handleClearNotifications}
        onNavigateTab={tab => {
          setActiveTab(tab);
          setIsNotificationsOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12 text-xs text-slate-500 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-slate-900 font-display text-base">
              PICKLE <span className="text-emerald-600">4 ALL</span>
            </span>
            <span>•</span>
            <span className="text-slate-600">Hệ Thống Quản Lý Thể Thao & Giải Đấu Quốc Tế (Tham khảo 333.nesagroups.com)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Bảo mật nhóm mã hóa SHA-256</span>
            <span>•</span>
            <span>Bốc thăm xếp lịch chống 2 trận liền</span>
            <span>•</span>
            <span>Hồ sơ VĐV xuất PDF</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
