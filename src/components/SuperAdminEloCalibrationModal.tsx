import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Check,
  Search,
  Filter,
  RefreshCw,
  Award,
  Swords,
  Lock,
  ChevronRight,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Athlete, Tournament, Achievement, MatchHistoryRecord } from '../types.ts';
import { calculatePerformanceRatings } from '../utils/ratingEngine.ts';

interface SuperAdminEloCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  athletes: Athlete[];
  tournaments: Tournament[];
  onUpdateAthlete: (athlete: Athlete) => void;
  onTriggerNotification: (title: string, message: string, type?: any, priority?: any) => void;
}

interface AthleteCalibrationRow {
  athlete: Athlete;
  totalWins: number;
  totalLosses: number;
  totalMatches: number;
  winRate: number;
  medalsCount: number;
  proposedElo: number;
  proposedDupr: number;
  eloDelta: number;
  duprDelta: number;
  customElo: number;
  customDupr: number;
  adminNote: string;
}

export const SuperAdminEloCalibrationModal: React.FC<SuperAdminEloCalibrationModalProps> = ({
  isOpen,
  onClose,
  athletes,
  tournaments,
  onUpdateAthlete,
  onTriggerNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'divergent' | 'pickleball'>('all');
  const [editingRows, setEditingRows] = useState<Record<string, { elo: number; dupr: number; note: string }>>({});
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [appliedSuccessId, setAppliedSuccessId] = useState<string | null>(null);

  // Compute performance & recommendations for each athlete
  const rows: AthleteCalibrationRow[] = useMemo(() => {
    return athletes.map(ath => {
      // 1. Career history matches
      const careerWins = ath.careerHistory.filter(m => m.result === 'win').length;
      const careerLosses = ath.careerHistory.filter(m => m.result === 'loss').length;

      // 2. Tournament matches participated across all tournaments
      let tourWins = 0;
      let tourLosses = 0;

      tournaments.forEach(tour => {
        tour.rounds?.forEach(r => {
          r.matches?.forEach(m => {
            if (m.status === 'finished') {
              const inTeam1 = m.team1?.player1.id === ath.id || m.team1?.player2?.id === ath.id;
              const inTeam2 = m.team2?.player1.id === ath.id || m.team2?.player2?.id === ath.id;

              if (inTeam1) {
                if (m.winnerTeamId === m.team1?.id) tourWins++;
                else if (m.winnerTeamId === m.team2?.id) tourLosses++;
              } else if (inTeam2) {
                if (m.winnerTeamId === m.team2?.id) tourWins++;
                else if (m.winnerTeamId === m.team1?.id) tourLosses++;
              }
            }
          });
        });
      });

      const totalWins = careerWins + tourWins;
      const totalLosses = careerLosses + tourLosses;
      const totalMatches = totalWins + totalLosses;
      const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;
      const medalsCount = ath.achievements?.length || 0;

      // Base ratings by tier
      const baseElo = ath.rankingTier.includes('Chuyên Nghiệp') ? 1600 : ath.rankingTier.includes('Bán Chuyên') ? 1500 : 1400;
      const baseDupr = 3.5;

      const calc = calculatePerformanceRatings(ath.careerHistory, ath.achievements, baseElo, baseDupr);

      // Add tournament matches bonus
      const extraElo = (tourWins * 20) - (tourLosses * 10);
      const extraDupr = Number(((tourWins * 0.04) - (tourLosses * 0.02)).toFixed(2));

      const proposedElo = Math.max(1000, Math.min(2800, calc.eloRating + extraElo));
      const proposedDupr = Number(Math.max(2.0, Math.min(6.5, calc.duprRating + extraDupr)).toFixed(2));

      const currentElo = ath.eloRating || 1400;
      const currentDupr = ath.duprRating ?? 3.5;

      const eloDelta = proposedElo - currentElo;
      const duprDelta = Number((proposedDupr - currentDupr).toFixed(2));

      const rowState = editingRows[ath.id];

      return {
        athlete: ath,
        totalWins,
        totalLosses,
        totalMatches,
        winRate,
        medalsCount,
        proposedElo,
        proposedDupr,
        eloDelta,
        duprDelta,
        customElo: rowState ? rowState.elo : currentElo,
        customDupr: rowState ? rowState.dupr : currentDupr,
        adminNote: rowState ? rowState.note : '',
      };
    });
  }, [athletes, tournaments, editingRows]);

  if (!isOpen) return null;

  // Filtered rows
  const filteredRows = rows.filter(r => {
    const matchesSearch =
      r.athlete.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.athlete.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.athlete.clubName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSport = selectedSport === 'all' || r.athlete.sportType === selectedSport;

    if (!matchesSearch || !matchesSport) return false;

    if (filterMode === 'divergent') {
      return Math.abs(r.eloDelta) >= 15 || Math.abs(r.duprDelta) >= 0.05;
    }
    if (filterMode === 'pickleball') {
      return r.athlete.sportType === 'Pickleball';
    }
    return true;
  });

  const handleFieldChange = (athleteId: string, field: 'elo' | 'dupr' | 'note', value: any) => {
    setEditingRows(prev => {
      const existing = prev[athleteId] || {
        elo: athletes.find(a => a.id === athleteId)?.eloRating || 1400,
        dupr: athletes.find(a => a.id === athleteId)?.duprRating || 3.5,
        note: '',
      };
      return {
        ...prev,
        [athleteId]: {
          ...existing,
          [field]: field === 'elo' || field === 'dupr' ? Number(value) : String(value),
        },
      };
    });
  };

  const handleApplyProposedToInputs = (r: AthleteCalibrationRow) => {
    setEditingRows(prev => ({
      ...prev,
      [r.athlete.id]: {
        elo: r.proposedElo,
        dupr: r.proposedDupr,
        note: `Thuật toán tự động đề xuất dựa trên ${r.totalMatches} trận (Thắng ${r.totalWins}/${r.totalMatches}, TL: ${r.winRate}%) & ${r.medalsCount} danh hiệu.`,
      },
    }));
  };

  const handleSaveAthleteRating = (r: AthleteCalibrationRow) => {
    const effectiveElo = r.customElo;
    const effectiveDupr = r.customDupr;

    const updated: Athlete = {
      ...r.athlete,
      eloRating: effectiveElo,
      duprRating: effectiveDupr,
    };

    onUpdateAthlete(updated);
    setAppliedSuccessId(r.athlete.id);
    setTimeout(() => setAppliedSuccessId(null), 2500);

    onTriggerNotification(
      '🔒 Đã cập nhật Elo & DUPR nội bộ',
      `Super Admin đã hiệu chỉnh ${r.athlete.fullName}: Elo ${effectiveElo} (Lệch ${effectiveElo - r.athlete.eloRating > 0 ? '+' : ''}${effectiveElo - r.athlete.eloRating}) | DUPR ${effectiveDupr}.`,
      'system'
    );
  };

  // Batch calibrate all filtered athletes according to algorithm
  const handleBatchCalibrateAll = () => {
    if (!window.confirm(`Xác nhận áp dụng tự động đề xuất Elo & DUPR thuật toán cho ${filteredRows.length} vận động viên?`)) {
      return;
    }

    let count = 0;
    filteredRows.forEach(r => {
      const updated: Athlete = {
        ...r.athlete,
        eloRating: r.proposedElo,
        duprRating: r.proposedDupr,
      };
      onUpdateAthlete(updated);
      count++;
    });

    setEditingRows({});

    onTriggerNotification(
      '⚡ Đã hiệu chỉnh Elo & DUPR tự động hàng loạt',
      `Đã đồng bộ hóa chỉ số xếp hạng cho toàn bộ ${count} VĐV theo số liệu thi đấu thực tế và giải thuật đề xuất.`,
      'system',
      'high'
    );
  };

  const sportsList = Array.from(new Set(athletes.map(a => a.sportType))).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header - Confidential Super Admin Branding */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 border-b border-amber-500/30 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white font-display tracking-tight">
                  Trung Tâm Hiệu Chỉnh Elo & DUPR Nội Bộ
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Tuyệt Đối Bảo Mật BQT
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Không Công Khai
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kết hợp tự động số liệu thi đấu (thắng, thua, giải thưởng) & đề xuất thuật toán quốc tế để Super Admin tinh chỉnh chính xác.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Đóng bảng hiệu chỉnh"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên VĐV, CLB, nickname..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            {/* Filter Tabs */}
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Tất cả ({athletes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('divergent')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterMode === 'divergent'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Lệch Điểm Cần Cân Chỉnh ({rows.filter(r => Math.abs(r.eloDelta) >= 15 || Math.abs(r.duprDelta) >= 0.05).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('pickleball')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterMode === 'pickleball'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Pickleball ({athletes.filter(a => a.sportType === 'Pickleball').length})
            </button>

            {/* Sport select */}
            <select
              value={selectedSport}
              onChange={e => setSelectedSport(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              <option value="all">Mọi Bộ Môn</option>
              {sportsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Batch Sync Button */}
          <button
            type="button"
            onClick={handleBatchCalibrateAll}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            title="Tự động áp dụng tất cả đề xuất thuật toán cho các VĐV đang hiển thị"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 stroke-none" />
            <span>Đồng Bộ Tự Động Toàn Bộ ({filteredRows.length})</span>
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 sticky top-0 z-10 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Vận Động Viên</th>
                <th className="py-3 px-3">Số Liệu Thi Đấu</th>
                <th className="py-3 px-3">Điểm Hiện Tại</th>
                <th className="py-3 px-3">Hệ Thống Đề Xuất</th>
                <th className="py-3 px-3">Điều Chỉnh Super Admin</th>
                <th className="py-3 px-3">Ghi Chú Kỹ Thuật BQT</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredRows.map(r => {
                const isPickleball = r.athlete.sportType === 'Pickleball';
                const isSuccess = appliedSuccessId === r.athlete.id;

                return (
                  <tr
                    key={r.athlete.id}
                    className={`hover:bg-slate-800/50 transition-colors ${
                      isSuccess ? 'bg-emerald-950/40' : ''
                    }`}
                  >
                    {/* Athlete info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.athlete.avatarUrl}
                          alt={r.athlete.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                            <span>{r.athlete.fullName}</span>
                            {r.athlete.nickname && (
                              <span className="text-[10px] text-amber-400 font-medium">({r.athlete.nickname})</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-emerald-400">{r.athlete.sportType}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{r.athlete.clubName}</span>
                            <span>•</span>
                            <span className="text-slate-400">{r.athlete.rankingTier}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Performance Stats */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-emerald-400 font-extrabold">{r.totalWins}T</span>
                          <span className="text-slate-500">-</span>
                          <span className="text-rose-400 font-extrabold">{r.totalLosses}B</span>
                          <span className="text-slate-400 text-[10px]">({r.totalMatches} trận)</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-slate-300">Tỉ lệ thắng: <strong className="text-amber-300">{r.winRate}%</strong></span>
                          {r.medalsCount > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                              <Award className="w-3 h-3" /> {r.medalsCount} danh hiệu
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Current Rating */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-bold">
                          <span className="text-slate-400 text-[10px]">ELO:</span>
                          <span className="text-white font-extrabold text-sm">{r.athlete.eloRating || 1400}</span>
                        </div>
                        {isPickleball && (
                          <div className="flex items-center gap-1 font-bold">
                            <span className="text-slate-400 text-[10px]">DUPR:</span>
                            <span className="text-cyan-300 font-extrabold text-xs">{(r.athlete.duprRating ?? 3.5).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Proposed Rating & Delta */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-amber-300">{r.proposedElo}</span>
                          <span
                            className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded ${
                              r.eloDelta > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : r.eloDelta < 0
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {r.eloDelta > 0 ? <TrendingUp className="w-3 h-3" /> : r.eloDelta < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                            <span>{r.eloDelta > 0 ? `+${r.eloDelta}` : r.eloDelta}</span>
                          </span>
                        </div>

                        {isPickleball && (
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-cyan-300">{r.proposedDupr}</span>
                            <span
                              className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded ${
                                r.duprDelta > 0
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : r.duprDelta < 0
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              <span>{r.duprDelta > 0 ? `+${r.duprDelta}` : r.duprDelta}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Super Admin Direct Edit Inputs */}
                    <td className="py-3 px-3">
                      <div className="space-y-1.5 min-w-[140px]">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 w-10">ELO:</label>
                          <input
                            type="number"
                            min="1000"
                            max="2800"
                            step="5"
                            value={r.customElo}
                            onChange={e => handleFieldChange(r.athlete.id, 'elo', e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-extrabold text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        {isPickleball && (
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 w-10">DUPR:</label>
                            <input
                              type="number"
                              min="2.0"
                              max="6.5"
                              step="0.05"
                              value={r.customDupr}
                              onChange={e => handleFieldChange(r.athlete.id, 'dupr', e.target.value)}
                              className="w-20 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 font-extrabold text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Admin Confidential Notes */}
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        placeholder="Lý do điều chỉnh (Bảo mật BQT)..."
                        value={r.adminNote}
                        onChange={e => handleFieldChange(r.athlete.id, 'note', e.target.value)}
                        className="w-full min-w-[140px] px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 placeholder-slate-600 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplyProposedToInputs(r)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[11px] border border-amber-400/30 transition-all hover:scale-105 active:scale-95"
                          title="Lấy chỉ số đề xuất của thuật toán"
                        >
                          Lấy Đề Xuất
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveAthleteRating(r)}
                          className={`px-3 py-1 rounded-lg font-black text-xs transition-all flex items-center gap-1 shadow-sm ${
                            isSuccess
                              ? 'bg-emerald-500 text-slate-950 scale-105'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 active:scale-95'
                          }`}
                          title="Lưu chỉ số mới cho VĐV này"
                        >
                          {isSuccess ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã Lưu</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Lưu</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRows.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Không tìm thấy vận động viên nào phù hợp bộ lọc.
            </div>
          )}
        </div>

        {/* Footer info & security reminder */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-[11px]">
              Giao diện dành riêng cho Super Admin. Mọi thay đổi điểm Elo & DUPR sẽ cập nhật trực tiếp vào hệ thống thi đấu và hồ sơ VĐV.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
          >
            Đóng Bảng Hiệu Chỉnh
          </button>
        </div>
      </div>
    </div>
  );
};
