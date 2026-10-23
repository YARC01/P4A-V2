import React from 'react';
import {
  Users,
  Trophy,
  Activity,
  DollarSign,
  TrendingUp,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Radio,
  FileText,
  UserPlus,
  PlayCircle,
  Zap,
} from 'lucide-react';
import { Athlete, ClubGroup, Tournament, PushNotification } from '../types.ts';

interface DashboardViewProps {
  athletes: Athlete[];
  clubs: ClubGroup[];
  tournaments: Tournament[];
  notifications: PushNotification[];
  onNavigate: (tab: string) => void;
  onOpenLiveScoreModal?: (tournamentId: string, matchId: string) => void;
  onQuickSimulateAlert: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  athletes,
  clubs,
  tournaments,
  notifications,
  onNavigate,
  onOpenLiveScoreModal,
  onQuickSimulateAlert,
}) => {
  // Aggregate stats
  const totalAthletes = athletes.length;
  const activeTournaments = tournaments.filter(t => t.status === 'in_progress' || t.status === 'registering');
  const allMatches = tournaments.flatMap(t => t.rounds.flatMap(r => r.matches));
  const liveMatches = allMatches.filter(m => m.status === 'live');
  const finishedMatches = allMatches.filter(m => m.status === 'finished');
  const totalFund = clubs.reduce((acc, c) => acc + c.fundBalance, 0);

  // Active live match
  const currentLiveTournament = tournaments.find(t => t.rounds.some(r => r.matches.some(m => m.status === 'live')));
  const currentLiveMatch = currentLiveTournament?.rounds.flatMap(r => r.matches).find(m => m.status === 'live');

  return (
    <div className="space-y-6">
      {/* Hero Banner with Energetic Style & Bright High-End Sports Aesthetics */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 border border-emerald-600/30 p-6 sm:p-8 shadow-lg text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold mb-3 shadow-2xs">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
              <span>TRUNG TÂM ĐIỀU HÀNH PICKLE 4 ALL - REALTIME V.2026</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Hệ Thống Quản Lý Thể Thao & Bốc Thăm Giải Đấu Tối Ưu
            </h1>
            <p className="mt-2 text-sm sm:text-base text-emerald-100 font-medium">
              Quản lý tập trung vận động viên, tự động tính toán ELO/DUPR và thể trạng dinh dưỡng, bảo mật đa lớp nhóm CLB, bốc thăm chống đánh 2 trận liền và xuất hồ sơ PDF quốc tế.
            </p>

            {/* Quick action buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('tournaments')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-black text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
              >
                <Trophy className="w-4 h-4 text-emerald-700" />
                <span>Xem Bảng Đấu & Bốc Thăm</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('athletes')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 text-white font-bold text-xs sm:text-sm border border-emerald-400/40 transition-all hover:scale-105 active:scale-95"
              >
                <FileText className="w-4 h-4 text-cyan-300" />
                <span>Hồ Sơ VĐV & Xuất PDF</span>
              </button>
              <button
                type="button"
                onClick={onQuickSimulateAlert}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/30 transition-all hover:scale-105"
                title="Bắn thông báo thử nghiệm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Thử Thông Báo Đẩy</span>
              </button>
            </div>
          </div>

          {/* Live Quick Counter Card */}
          <div className="flex-shrink-0 bg-white/95 backdrop-blur border border-white/40 rounded-2xl p-4 sm:p-5 shadow-xl w-full md:w-72 text-slate-900">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider">HỆ THỐNG TRỰC TUYẾN</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                24/7 Live
              </span>
            </div>
            <div className="mt-3 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Giải đang khởi tranh:</span>
                <span className="font-extrabold text-slate-900">{tournaments.length} giải đấu</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">VĐV chính thức:</span>
                <span className="font-extrabold text-emerald-700">{athletes.length} VĐV</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">CLB thành viên:</span>
                <span className="font-extrabold text-sky-700">{clubs.length} Nhóm có Pass</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Tiến độ thi đấu:</span>
                <span className="font-extrabold text-amber-600">
                  {finishedMatches.length} / {allMatches.length} trận
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards in Bright Modern Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Stat 1: Athletes */}
        <div
          onClick={() => onNavigate('athletes')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-sky-400 p-5 transition-all duration-200 hover:shadow-md shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Vận Động Viên</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-display">{totalAthletes}</span>
            <span className="text-xs text-emerald-700 font-extrabold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> ELO & DUPR Tự Động
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Đầy đủ Tuổi, DOB, SĐT, Chiều cao, Cân nặng & PDF</p>
        </div>

        {/* Stat 2: Active Tournaments */}
        <div
          onClick={() => onNavigate('tournaments')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-400 p-5 transition-all duration-200 hover:shadow-md shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Giải Đấu Thể Thao</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-display">{tournaments.length}</span>
            <span className="text-xs text-emerald-700 font-extrabold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Chuẩn Quốc Tế
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Bốc thăm Vòng Bảng & Nhánh Knockout thông minh</p>
        </div>

        {/* Stat 3: Matches & Spacing */}
        <div
          onClick={() => onNavigate('tournaments')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 p-5 transition-all duration-200 hover:shadow-md shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Trận Đấu & Xếp Lịch</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform shadow-2xs">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-display">{allMatches.length}</span>
            <span className="text-xs text-amber-700 font-extrabold">
              Giãn cách hồi sức
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Thuật toán hạn chế 1 đội phải đánh 2 trận liền</p>
        </div>

        {/* Stat 4: Treasury / Funds */}
        <div
          onClick={() => onNavigate('treasury')}
          className="group cursor-pointer rounded-2xl bg-white border border-slate-200/90 hover:border-purple-400 p-5 transition-all duration-200 hover:shadow-md shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Quỹ & Kèo Thưởng</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform shadow-2xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              {(totalFund / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs text-purple-700 font-extrabold">Khóa Pass Admin</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Bảo mật mật mã BQT & Dự đoán tỉ số kết quả</p>
        </div>
      </div>

      {/* Main Grid: Live Match Board & Club Roster Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Live Ticker & Featured Match */}
        <div className="lg:col-span-2 space-y-5">
          {/* Live Match Alert Box */}
          {currentLiveMatch && currentLiveTournament && (
            <div className="rounded-2xl bg-white border-2 border-emerald-500/40 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white font-black text-[11px] px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                TRẬN ĐẤU TRỰC TIẾP (LIVE)
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold mb-3">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>{currentLiveTournament.name}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-700 font-semibold">{currentLiveMatch.court}</span>
              </div>

              {/* Match Face-off */}
              <div className="grid grid-cols-3 items-center py-4 px-3 sm:px-6 bg-slate-50 rounded-xl border border-slate-200">
                {/* Team 1 */}
                <div className="text-center sm:text-left">
                  <span className="text-xs font-extrabold text-emerald-700">ĐỘI 1</span>
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {currentLiveMatch.team1?.name || 'Đội 1'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {currentLiveMatch.team1?.player1.fullName} & {currentLiveMatch.team1?.player2?.fullName}
                  </div>
                </div>

                {/* Live Sets Score Display */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 font-display">
                      {currentLiveMatch.scoreTeam1.join(' : ')}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">VS</span>
                    <span className="text-xl sm:text-2xl font-black text-sky-700 font-display">
                      {currentLiveMatch.scoreTeam2.join(' : ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-700 font-bold mt-1">
                    Set 3 đang diễn ra (Chạm 11)
                  </div>
                </div>

                {/* Team 2 */}
                <div className="text-center sm:text-right">
                  <span className="text-xs font-extrabold text-sky-700">ĐỘI 2</span>
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {currentLiveMatch.team2?.name || 'Đội 2'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {currentLiveMatch.team2?.player1.fullName} & {currentLiveMatch.team2?.player2?.fullName}
                  </div>
                </div>
              </div>

              {/* Notice & Button */}
              <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-600">
                <span className="text-emerald-800 font-semibold">{currentLiveMatch.restNotice}</span>
                <button
                  type="button"
                  onClick={() => onNavigate('tournaments')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
                >
                  Vào Cập Nhật Tỉ Số & Bảng Đấu <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Athlete Spotlight & Ranking */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Vận Động Viên Tiêu Biểu & Thành Tích Xuất Sắc
                </h3>
                <p className="text-xs text-slate-500">Dữ liệu được số hóa với điểm ELO, DUPR và hồ sơ xuất PDF</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('athletes')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                Xem tất cả ({athletes.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {athletes.slice(0, 4).map(ath => {
                const isFemale = ath.gender === 'female';
                return (
                  <div
                    key={ath.id}
                    onClick={() => onNavigate('athletes')}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                      isFemale
                        ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                        : 'bg-sky-50/70 border-sky-200 hover:border-sky-400'
                    }`}
                  >
                    <img
                      src={ath.avatarUrl}
                      alt={ath.fullName}
                      className={`w-12 h-12 rounded-xl object-cover border-2 flex-shrink-0 ${
                        isFemale ? 'border-rose-300' : 'border-sky-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 truncate">{ath.fullName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isFemale ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                        }`}>
                          {isFemale ? '♀ Nữ' : '♂ Nam'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 truncate mt-0.5">
                        {ath.clubName} • {ath.age} tuổi
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-white text-sky-800 font-extrabold text-[10px] border border-sky-200 shadow-2xs">
                          Elo: {ath.eloRating}
                        </span>
                        {ath.duprRating && (
                          <span className="px-1.5 py-0.5 rounded bg-white text-emerald-800 font-extrabold text-[10px] border border-emerald-200 shadow-2xs">
                            DUPR: {ath.duprRating.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Protected Clubs & Push Notifications Feed */}
        <div className="space-y-5">
          {/* Protected Clubs / Groups Quick Panel */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider font-display">
                  Nhóm & CLB Bảo Mật Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('clubs')}
                className="text-xs font-bold text-purple-700 hover:text-purple-900"
              >
                Chi tiết
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Mã hóa mật mã bảo vệ từng nhóm, ngăn chặn chỉnh sửa trái phép từ CLB đối thủ.
            </p>

            <div className="space-y-2.5">
              {clubs.map(club => (
                <div
                  key={club.id}
                  onClick={() => onNavigate('clubs')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={club.logoUrl}
                      alt={club.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-300"
                    />
                    <div>
                      <div className="text-xs font-extrabold text-slate-900 leading-snug">{club.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {club.memberCount} VĐV • Quỹ: {(club.fundBalance / 1000000).toFixed(1)} tr
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-purple-100 text-purple-800 border border-purple-200">
                    Đã Khóa Pass
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Notifications Preview */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider font-display">
                  Thông Báo Tự Động
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">Đẩy tức thì</span>
            </div>

            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif, idx) => (
                <div
                  key={`${notif.id || 'notif'}-${idx}`}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="font-extrabold text-slate-900 text-xs mb-0.5">{notif.title}</div>
                  <div className="text-slate-600 text-[11px] line-clamp-2">{notif.message}</div>
                  <div className="mt-1 text-[10px] text-slate-400 font-medium">{notif.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
