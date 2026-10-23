import React, { useState } from 'react';
import {
  Trophy,
  X,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Award,
  AlertTriangle,
  RotateCcw,
  Check,
  Shield,
  Trash2,
} from 'lucide-react';
import { Tournament, TournamentFormat, SportDiscipline } from '../types.ts';
import {
  buildRoundRobinTournament,
  buildKnockoutBracket,
  calculateStandings,
} from '../utils/tournamentScheduling.ts';

interface EditTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  onSaveTournament: (updated: Tournament) => void;
  onDeleteTournament?: (id: string) => void;
  onTriggerNotification: (title: string, message: string, type?: any, priority?: any) => void;
}

export const EditTournamentModal: React.FC<EditTournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onSaveTournament,
  onDeleteTournament,
  onTriggerNotification,
}) => {
  const [formData, setFormData] = useState({
    name: tournament.name,
    code: tournament.code,
    sportCategory: tournament.sportCategory || 'Pickleball',
    competitionForm: tournament.competitionForm || 'Đôi Nam Nữ',
    format: tournament.format as TournamentFormat,
    venue: tournament.venue,
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    registrationDeadline: tournament.registrationDeadline,
    entryFee: tournament.entryFee,
    totalPrizePool: tournament.totalPrizePool,
    maxTeams: tournament.maxTeams,
    status: tournament.status,
    bannerUrl: tournament.bannerUrl,
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Tournament = {
      ...tournament,
      name: formData.name.trim(),
      code: formData.code.toUpperCase().trim(),
      sportCategory: formData.sportCategory,
      competitionForm: formData.competitionForm,
      discipline: `${formData.sportCategory} ${formData.competitionForm}` as SportDiscipline,
      format: formData.format,
      venue: formData.venue.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      registrationDeadline: formData.registrationDeadline,
      entryFee: Number(formData.entryFee) || 0,
      totalPrizePool: Number(formData.totalPrizePool) || 0,
      maxTeams: Number(formData.maxTeams) || 8,
      status: formData.status,
      bannerUrl: formData.bannerUrl,
    };

    onSaveTournament(updated);
    onClose();
    onTriggerNotification(
      '✅ Đã cập nhật thông tin giải đấu',
      `Super Admin đã hiệu chỉnh thành công giải đấu "${updated.name}".`,
      'tournament'
    );
  };

  // Re-generate & fix corrupted bracket
  const handleRebuildBracket = () => {
    if (!window.confirm('Xác nhận tái lập lại toàn bộ nhánh đấu và lịch thi đấu từ danh sách các đội tham gia?')) {
      return;
    }

    let rebuiltRounds = [];
    if (formData.format === 'round_robin') {
      rebuiltRounds = buildRoundRobinTournament(tournament.registeredTeams);
    } else {
      rebuiltRounds = buildKnockoutBracket(tournament.registeredTeams, 'seed');
    }

    const updated: Tournament = {
      ...tournament,
      format: formData.format,
      rounds: rebuiltRounds,
      standings:
        formData.format === 'round_robin'
          ? calculateStandings(tournament.registeredTeams, rebuiltRounds.flatMap(r => r.matches))
          : [],
    };

    onSaveTournament(updated);
    onTriggerNotification(
      '🔧 Đã sửa lỗi & tái lập nhánh đấu',
      `Đã khởi tạo lại ${rebuiltRounds.length} vòng thi đấu hoàn chỉnh không còn lỗi hỏng.`,
      'system'
    );
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDeleteTournament) {
      onDeleteTournament(tournament.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg font-display">
                  Hiệu Chỉnh & Quản Lý Giải Đấu
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chỉnh sửa thông số, sửa giải tạo sai, tái lập nhánh đấu hỏng hoặc xóa giải.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Tournament Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Tên Giải Đấu *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Mã Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold uppercase focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Sport & Form & Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Bộ Môn</label>
              <select
                value={formData.sportCategory}
                onChange={e => setFormData({ ...formData, sportCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="Pickleball">Pickleball</option>
                <option value="Cầu Lông">Cầu Lông</option>
                <option value="Tennis">Tennis</option>
                <option value="Bida Carom 3 Băng">Bida Carom 3 Băng</option>
                <option value="Bida Pool 9 Bi">Bida Pool 9 Bi</option>
                <option value="Bóng Bàn">Bóng Bàn</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hình Thức Thi Đấu</label>
              <select
                value={formData.competitionForm}
                onChange={e => setFormData({ ...formData, competitionForm: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="Đôi Nam Nữ">Đôi Nam Nữ</option>
                <option value="Đôi Nam">Đôi Nam</option>
                <option value="Đôi Nữ">Đôi Nữ</option>
                <option value="Đơn Nam">Đơn Nam</option>
                <option value="Đơn Nữ">Đơn Nữ</option>
                <option value="Đồng Đội">Đồng Đội</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Thể Thức Giải</label>
              <select
                value={formData.format}
                onChange={e => setFormData({ ...formData, format: e.target.value as TournamentFormat })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="round_robin">Vòng Tròn Tính Điểm (Round Robin)</option>
                <option value="single_elimination">Loại Trực Tiếp (Knockout Cúp)</option>
                <option value="double_elimination">Nhánh Thắng - Nhánh Thua</option>
              </select>
            </div>
          </div>

          {/* Status & Max Teams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Trạng Thái Giải Đấu</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="upcoming">⏳ Sắp Diễn Ra (Chuẩn Bị)</option>
                <option value="registering">📝 Đang Mở Đăng Ký</option>
                <option value="draw_pending">🎲 Chờ Bốc Thăm & Điểm Danh</option>
                <option value="in_progress">⚡ Đang Thi Đấu (Live)</option>
                <option value="completed">🏆 Đã Hoàn Tất & Trao Giải (Lịch Sử)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Số Đội Tối Đa</label>
              <input
                type="number"
                min="2"
                max="64"
                value={formData.maxTeams}
                onChange={e => setFormData({ ...formData, maxTeams: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Dates & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hạn Đăng Ký</label>
              <input
                type="date"
                value={formData.registrationDeadline}
                onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Ngày Bắt Đầu</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Ngày Kết Thúc</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Địa Điểm Thi Đấu</label>
            <input
              type="text"
              value={formData.venue}
              onChange={e => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Entry Fee & Prize Pool */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Lệ Phí Tham Gia (VNĐ)</label>
              <input
                type="number"
                step="50000"
                value={formData.entryFee}
                onChange={e => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Tổng Giải Thưởng (VNĐ)</label>
              <input
                type="number"
                step="1000000"
                value={formData.totalPrizePool}
                onChange={e => setFormData({ ...formData, totalPrizePool: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Special Super Admin Bracket Repair Box */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Khắc Phục Lỗi Nhánh Đấu Hoặc VĐV Tạo Sai</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Nếu bảng đấu bị kẹt, thiếu cặp đối đầu, hoặc bị tạo sai cấu trúc, bạn có thể tái thiết lập lại toàn bộ nhánh đấu tự động theo chuẩn từ {tournament.registeredTeams.length} đội hiện có.
            </p>
            <button
              type="button"
              onClick={handleRebuildBracket}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tái Lập & Sửa Lỗi Nhánh Đấu Chuẩn</span>
            </button>
          </div>

          {/* Delete Danger Section */}
          {onDeleteTournament && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3">
              <div>
                <div className="font-extrabold text-xs text-rose-900">Xóa Vĩnh Viễn Giải Đấu</div>
                <div className="text-[11px] text-rose-700">Dành cho trường hợp giải tạo nháp, tạo sai hoặc trùng lặp.</div>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
                  confirmDelete
                    ? 'bg-rose-700 text-white animate-pulse'
                    : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmDelete ? 'Bấm Lần Nữa Để Xóa Hẳn' : 'Xóa Giải Đấu'}</span>
              </button>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lưu Cập Nhật</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
