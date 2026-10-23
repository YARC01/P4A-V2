import React, { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Search,
  Calendar,
  Sparkles,
  Crown,
  History,
  FileDown,
} from 'lucide-react';
import { Athlete, Tournament } from '../types.ts';
import { exportAthleteProfilePDF } from '../utils/pdfExport.ts';

interface StandingsLeaderboardViewProps {
  athletes: Athlete[];
  tournaments: Tournament[];
}

export const StandingsLeaderboardView: React.FC<StandingsLeaderboardViewProps> = ({
  athletes,
  tournaments,
}) => {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026-S1');

  // Filter athletes and sort by Elo rating & medals
  const rankedAthletes = athletes
    .filter(a => selectedSport === 'all' || a.sportType === selectedSport)
    .sort((a, b) => {
      if (b.eloRating !== a.eloRating) return b.eloRating - a.eloRating;
      return (b.achievements?.length || 0) - (a.achievements?.length || 0);
    });

  const top3 = rankedAthletes.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 border border-amber-600/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-amber-100 text-xs font-bold mb-2 border border-white/30">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>BẢNG PHONG THẦN & XẾP HẠNG TỔNG HỢP THEO MÙA GIẢI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display">
            Bảng Xếp Hạng Mùa Giải {selectedSeason}
          </h2>
          <p className="text-xs text-amber-100 mt-1 max-w-2xl font-medium">
            Tổng hợp điểm Elo chuẩn quốc tế, chỉ số DUPR, số lượng huy chương và lịch sử thi đấu của toàn bộ vận động viên trong hệ thống PICKLE 4 ALL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSeason}
            onChange={e => setSelectedSeason(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white focus:outline-none focus:border-white shadow-2xs"
          >
            <option value="2026-S1" className="text-slate-900 bg-white">Mùa Giải 2026 - Season 1</option>
          </select>

          <select
            value={selectedSport}
            onChange={e => setSelectedSport(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white focus:outline-none focus:border-white shadow-2xs"
          >
            <option value="all" className="text-slate-900 bg-white">Tất cả môn</option>
            <option value="Pickleball" className="text-slate-900 bg-white">Pickleball</option>
            <option value="Billiards" className="text-slate-900 bg-white">Bida (Carom/Pool)</option>
            <option value="Cầu Lông" className="text-slate-900 bg-white">Cầu Lông</option>
            <option value="Tennis" className="text-slate-900 bg-white">Tennis</option>
          </select>
        </div>
      </div>

      {/* Podium Top 3 in Bright Modern Layout */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 p-5 rounded-2xl bg-white border-2 border-slate-300 text-center relative flex flex-col justify-between shadow-xs">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-300 text-slate-800 font-black text-xs uppercase tracking-wider shadow-sm border border-slate-400">
              HẠNG 2 • BẠC
            </div>
            <div>
              <img
                src={top3[1].avatarUrl}
                alt={top3[1].fullName}
                className="w-20 h-20 rounded-2xl object-cover mx-auto mt-2 border-2 border-slate-400 shadow-md"
              />
              <h3 className="font-extrabold text-base text-slate-900 mt-3">{top3[1].fullName}</h3>
              <p className="text-xs text-slate-600 font-medium">"{top3[1].nickname}" • {top3[1].clubName}</p>
              <div className="mt-3 inline-block px-3 py-1 rounded-xl bg-slate-100 text-sky-800 font-black text-sm border border-slate-200">
                Elo {top3[1].eloRating}
              </div>
            </div>
            <button
              type="button"
              onClick={() => exportAthleteProfilePDF(top3[1])}
              className="mt-4 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold flex items-center justify-center gap-1 mx-auto border border-slate-300"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Hồ Sơ PDF</span>
            </button>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-amber-50 via-white to-amber-50/60 border-2 border-amber-400 text-center relative flex flex-col justify-between shadow-lg shadow-amber-500/10 md:-translate-y-2">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span>HẠNG 1 • QUÁN QUÂN</span>
            </div>
            <div>
              <img
                src={top3[0].avatarUrl}
                alt={top3[0].fullName}
                className="w-24 h-24 rounded-2xl object-cover mx-auto mt-2 border-3 border-amber-400 shadow-lg"
              />
              <h3 className="font-black text-lg text-slate-900 mt-3">{top3[0].fullName}</h3>
              <p className="text-xs text-amber-800 font-bold">"{top3[0].nickname}" • {top3[0].clubName}</p>
              <div className="mt-3 inline-block px-4 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-black text-base shadow-2xs">
                Elo {top3[0].eloRating} {top3[0].duprRating ? `• DUPR ${top3[0].duprRating}` : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={() => exportAthleteProfilePDF(top3[0])}
              className="mt-4 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 mx-auto shadow-md"
            >
              <FileDown className="w-4 h-4" />
              <span>Xuất Hồ Sơ PDF Quán Quân</span>
            </button>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 p-5 rounded-2xl bg-white border-2 border-amber-300 text-center relative flex flex-col justify-between shadow-xs">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-sm">
              HẠNG 3 • ĐỒNG
            </div>
            <div>
              <img
                src={top3[2].avatarUrl}
                alt={top3[2].fullName}
                className="w-20 h-20 rounded-2xl object-cover mx-auto mt-2 border-2 border-amber-600 shadow-md"
              />
              <h3 className="font-extrabold text-base text-slate-900 mt-3">{top3[2].fullName}</h3>
              <p className="text-xs text-slate-600 font-medium">"{top3[2].nickname}" • {top3[2].clubName}</p>
              <div className="mt-3 inline-block px-3 py-1 rounded-xl bg-slate-100 text-sky-800 font-black text-sm border border-slate-200">
                Elo {top3[2].eloRating}
              </div>
            </div>
            <button
              type="button"
              onClick={() => exportAthleteProfilePDF(top3[2])}
              className="mt-4 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold flex items-center justify-center gap-1 mx-auto border border-slate-300"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Hồ Sơ PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* Comprehensive Leaderboard Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-display">Bảng Xếp Hạng Chi Tiết Toàn Hệ Thống</h3>
            <p className="text-xs text-slate-500 font-medium">Cập nhật tự động sau mỗi giải đấu và trận đấu chính thức</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3 text-center">Hạng</th>
                <th className="py-3 px-3">Vận Động Viên</th>
                <th className="py-3 px-3">Câu Lạc Bộ</th>
                <th className="py-3 px-3">Bộ Môn</th>
                <th className="py-3 px-2 text-center">Trận Đã Đấu</th>
                <th className="py-3 px-2 text-center">Huy Chương</th>
                <th className="py-3 px-3 text-center text-sky-700 font-black">Điểm Elo</th>
                <th className="py-3 px-3 text-center text-emerald-700 font-black">DUPR</th>
                <th className="py-3 px-3 text-right">Xuất File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rankedAthletes.map((ath, index) => {
                const isFemale = ath.gender === 'female';
                return (
                  <tr key={ath.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-black text-xs ${
                          index === 0
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : index === 1
                            ? 'bg-slate-300 text-slate-900 font-bold'
                            : index === 2
                            ? 'bg-amber-700 text-white font-bold'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ath.avatarUrl}
                          alt={ath.fullName}
                          className={`w-9 h-9 rounded-xl object-cover border-2 ${
                            isFemale ? 'border-rose-300' : 'border-sky-300'
                          }`}
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                            <span>{ath.fullName}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              isFemale ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                            }`}>
                              {isFemale ? '♀ Nữ' : '♂ Nam'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">"{ath.nickname}"</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{ath.clubName}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                        {ath.sportType}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-slate-800 font-bold">
                      {ath.careerHistory?.length || 0}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-amber-600 font-black">
                        {ath.achievements?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-black text-sky-800 font-mono text-sm">
                      {ath.eloRating}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-700 font-mono text-sm">
                      {ath.duprRating ? ath.duprRating.toFixed(2) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => exportAthleteProfilePDF(ath)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-[11px] transition-colors border border-slate-300"
                        title="Xuất hồ sơ PDF"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
