import React, { useState } from 'react';
import {
  DollarSign,
  Lock,
  Unlock,
  KeyRound,
  TrendingUp,
  TrendingDown,
  Plus,
  Flame,
  Award,
  AlertTriangle,
  Receipt,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { TreasuryRecord, BetPrediction, User } from '../types.ts';
import { verifyPassword } from '../utils/security.ts';

interface TreasuryBetsViewProps {
  treasury: TreasuryRecord[];
  bets: BetPrediction[];
  currentUser: User;
  isAdminUnlocked: boolean;
  onSetAdminUnlocked: (unlocked: boolean) => void;
  onAddTreasuryRecord: (record: TreasuryRecord) => void;
  onPlaceBetPick: (betId: string, teamId: string, points: number) => void;
  onTriggerNotification: (title: string, message: string, type: any) => void;
}

export const TreasuryBetsView: React.FC<TreasuryBetsViewProps> = ({
  treasury,
  bets,
  currentUser,
  isAdminUnlocked,
  onSetAdminUnlocked,
  onAddTreasuryRecord,
  onPlaceBetPick,
  onTriggerNotification,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'treasury' | 'bets'>('treasury');
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);

  // New Record Form State
  const [recordForm, setRecordForm] = useState<Partial<TreasuryRecord>>({
    type: 'income',
    category: 'Lệ phí thi đấu',
    amount: 50000,
    description: '',
    performer: currentUser.name,
    receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
  });

  // Calculate totals
  const totalIncome = treasury
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = treasury
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Handle Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '333admin' || currentUser.role === 'super_admin' || currentUser.role === 'admin') {
      onSetAdminUnlocked(true);
      setAuthError('');
      onTriggerNotification(
        '🔓 Mở khóa Quỹ & Kèo thành công',
        'Phiên làm việc quản trị tài chính và dự đoán thể thao đã được kích hoạt.',
        'treasury'
      );
    } else {
      setAuthError('Mật mã Admin không chính xác! Hãy nhập 333admin hoặc chuyển sang tài khoản BQT.');
    }
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.amount || !recordForm.description) {
      alert('Vui lòng nhập số tiền và mô tả giao dịch');
      return;
    }

    const newRecord: TreasuryRecord = {
      id: `tr-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: recordForm.type || 'income',
      category: recordForm.category as any,
      amount: Number(recordForm.amount) || 0,
      description: recordForm.description || '',
      performer: recordForm.performer || currentUser.name,
      receiptNumber: recordForm.receiptNumber || `REC-${Date.now().toString().slice(-6)}`,
    };

    onAddTreasuryRecord(newRecord);
    setIsAddRecordModalOpen(false);
    setRecordForm({
      type: 'income',
      category: 'Lệ phí thi đấu',
      amount: 50000,
      description: '',
      performer: currentUser.name,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    });

    onTriggerNotification(
      'Ghi nhận quỹ mới',
      `Đã thêm giao dịch: ${newRecord.description} (${newRecord.amount.toLocaleString()}đ).`,
      'treasury'
    );
  };

  // If locked, render the Admin Password Gate
  if (!isAdminUnlocked) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="relative w-full max-w-md bg-white border border-rose-200 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-2 border border-rose-200">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>KHU VỰC BẢO MẬT ADMIN TỐI CAO</span>
          </div>

          <h3 className="text-xl font-black text-slate-900 font-display">
            Mục Quỹ & Kèo Dự Đoán Đã Được Đặt Pass
          </h3>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Theo chính sách bảo mật, dữ liệu thu chi quỹ giải thưởng và quản lý tỉ lệ dự đoán yêu cầu mật khẩu Admin để truy cập.
          </p>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 text-left">
                Mật Khẩu Admin (Passcode)
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  placeholder="Nhập pass admin..."
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-center tracking-widest text-base focus:outline-none focus:border-rose-500 focus:bg-white"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left font-medium">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Mở Khóa Quản Trị Quỹ & Kèo
            </button>
          </form>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Pass mặc định: <strong className="text-emerald-700 font-mono">333admin</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Once unlocked, display full Treasury & Sports Prediction Pool
  return (
    <div className="space-y-6">
      {/* Top Unlocked Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 border border-purple-600/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-purple-100 text-xs font-bold mb-2 border border-white/30">
            <Unlock className="w-3.5 h-3.5" />
            <span>ĐÃ XÁC THỰC ADMIN: QUẢN LÝ QUỸ & TỈ LỆ KÈO DỰ ĐOÁN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display">
            Sổ Quỹ Thu Chi & Kèo Dự Đoán Thể Thao
          </h2>
          <p className="text-xs text-purple-100 mt-1 font-medium max-w-2xl">
            Ghi nhận minh bạch mọi dòng tiền tài trợ, lệ phí thi đấu và tạo không khí sôi động với tỉ lệ dự đoán thể thao vui cho cộng đồng PICKLE 4 ALL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSetAdminUnlocked(false)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all hover:scale-105"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Khóa Lại</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddRecordModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-purple-950 font-black text-xs shadow-md hover:bg-purple-50 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Ghi Nhận Thu/Chi</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Thu Giải & CLB</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 font-display">
            +{totalIncome.toLocaleString('vi-VN')} đ
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Lệ phí thi đấu + Tài trợ từ các đối tác</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Chi Hoạt Động</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shadow-2xs">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700 font-display">
            -{totalExpense.toLocaleString('vi-VN')} đ
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Thuê cụm sân + Trọng tài + Nước uống & Cúp</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số Dư Quỹ Hiện Hữu</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shadow-2xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-900 font-display">
            {netBalance.toLocaleString('vi-VN')} đ
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Sẵn sàng giải ngân các vòng chung kết</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border border-slate-200 bg-slate-200/70 rounded-2xl p-1 gap-1 text-xs font-bold shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('treasury')}
          className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'treasury'
              ? 'bg-purple-700 text-white shadow-md font-black'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Sổ Nhật Ký Thu Chi Quỹ ({treasury.length} Giao dịch)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('bets')}
          className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'bets'
              ? 'bg-purple-700 text-white shadow-md font-black'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Kèo Tỉ Lệ & Dự Đoán Thể Thao ({bets.length} Trận)</span>
        </button>
      </div>

      {/* SUB-TAB 1: TREASURY LEDGER */}
      {activeSubTab === 'treasury' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-display">Lịch Sử Giao Dịch Tài Chính</h3>
              <p className="text-xs text-slate-500 font-medium">Minh bạch chứng từ và người thực hiện thu chi</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddRecordModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100 text-xs font-bold transition-all shadow-2xs"
            >
              + Thêm Thu / Chi
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-3">Ngày</th>
                  <th className="py-3 px-3">Mã Phiếu</th>
                  <th className="py-3 px-3">Danh Mục</th>
                  <th className="py-3 px-3">Nội Dung Chi Tiết</th>
                  <th className="py-3 px-3">Người Lập</th>
                  <th className="py-3 px-3 text-right">Số Tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {treasury.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-500 font-medium">{rec.date}</td>
                    <td className="py-3 px-3 font-mono text-cyan-800 font-bold">{rec.receiptNumber}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        {rec.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-900 font-semibold">{rec.description}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{rec.performer}</td>
                    <td
                      className={`py-3 px-3 text-right font-black font-mono text-sm ${
                        rec.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {rec.type === 'income' ? '+' : '-'}
                      {rec.amount.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BETS & SPORTS PREDICTION POOL */}
      {activeSubTab === 'bets' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-amber-500 animate-pulse flex-shrink-0" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-950 font-display">
                  Đấu Trường Dự Đoán Tỉ Số & Bình Chọn Đội Thắng (Sports Prediction)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 font-medium">
                  Dành riêng cho cộng đồng VĐV và cổ động viên hệ thống PICKLE 4 ALL - Tích lũy điểm thưởng MVP và vinh danh bảng xếp hạng.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bets.map(bet => {
              const isClosed = bet.status === 'closed';
              return (
                <div
                  key={bet.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-purple-300 space-y-4 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                    <span className="font-extrabold text-purple-800 uppercase tracking-wider text-[11px]">{bet.discipline}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                        isClosed ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isClosed ? 'ĐÃ ĐÓNG KÈO' : 'ĐANG MỞ DỰ ĐOÁN'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 font-display">{bet.matchTitle}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{bet.tournamentName}</p>
                  </div>

                  {/* 2 Teams Odds Cards */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    {/* Team 1 Option */}
                    <div
                      onClick={() => !isClosed && onPlaceBetPick(bet.id, bet.team1.id, 1000)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        bet.winningTeamId === bet.team1.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{bet.team1.name}</div>
                      <div className="mt-1 text-base font-black text-amber-700 font-display">
                        x{bet.team1.odds.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {bet.team1.votes} lượt bình chọn
                      </div>
                    </div>

                    {/* Team 2 Option */}
                    <div
                      onClick={() => !isClosed && onPlaceBetPick(bet.id, bet.team2.id, 1000)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        bet.winningTeamId === bet.team2.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{bet.team2.name}</div>
                      <div className="mt-1 text-base font-black text-sky-700 font-display">
                        x{bet.team2.odds.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {bet.team2.votes} lượt bình chọn
                      </div>
                    </div>
                  </div>

                  {/* Pool info */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>
                      Tổng quỹ điểm: <strong className="text-slate-900 font-bold">{bet.totalPoolPoints.toLocaleString()} pts</strong>
                    </span>
                    <span>Đóng cổng: {bet.closingTime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD TREASURY RECORD */}
      {isAddRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-base text-slate-900 font-display">Ghi Nhận Giao Dịch Quỹ Mới</h3>
              <button
                type="button"
                onClick={() => setIsAddRecordModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Loại Giao Dịch</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecordForm({ ...recordForm, type: 'income' })}
                    className={`py-2 rounded-xl font-bold transition-all shadow-2xs ${
                      recordForm.type === 'income'
                        ? 'bg-emerald-600 text-white font-black'
                        : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    + Thu Tiền (Income)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecordForm({ ...recordForm, type: 'expense' })}
                    className={`py-2 rounded-xl font-bold transition-all shadow-2xs ${
                      recordForm.type === 'expense'
                        ? 'bg-rose-600 text-white font-black'
                        : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    - Chi Tiền (Expense)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Danh Mục</label>
                <select
                  value={recordForm.category}
                  onChange={e => setRecordForm({ ...recordForm, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:bg-white"
                >
                  <option value="Lệ phí thi đấu">Lệ phí thi đấu</option>
                  <option value="Tài trợ giải">Tài trợ giải</option>
                  <option value="Tiền thưởng trao giải">Tiền thưởng trao giải</option>
                  <option value="Thuê sân bãi & Trọng tài">Thuê sân bãi & Trọng tài</option>
                  <option value="Trang thiết bị / Nước uống">Trang thiết bị / Nước uống</option>
                  <option value="Quỹ câu lạc bộ">Quỹ câu lạc bộ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Số Tiền (VNĐ) *</label>
                <input
                  type="number"
                  required
                  placeholder="VD: 5000000"
                  value={recordForm.amount}
                  onChange={e => setRecordForm({ ...recordForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-base font-bold focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Nội Dung Giao Dịch *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ghi rõ mục đích chi hoặc nguồn thu..."
                  value={recordForm.description}
                  onChange={e => setRecordForm({ ...recordForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black shadow-md shadow-purple-700/20"
                >
                  Lưu Vào Sổ Quỹ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
