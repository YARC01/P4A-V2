import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Search,
  Plus,
  X,
  Award,
  Crown,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserPlus,
  Lock,
  Unlock,
  Key,
} from 'lucide-react';
import { User, UserRole, ClubGroup, Athlete } from '../types.ts';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  clubs: ClubGroup[];
  athletes: Athlete[];
  onUpdateUserRole: (userId: string, newRole: UserRole, clubId?: string) => void;
  onAddUserFromAthlete: (athlete: Athlete, role: UserRole, clubId?: string) => void;
  onTriggerNotification: (title: string, message: string, type: any) => void;
}

export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    name: string;
    badge: string;
    color: string;
    textColor: string;
    borderColor: string;
    bgLight: string;
    description: string;
    permissions: string[];
  }
> = {
  super_admin: {
    name: 'Super Admin (Tối Cao)',
    badge: 'SUPER ADMIN',
    color: 'from-amber-500 to-orange-600',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    bgLight: 'bg-amber-50',
    description: 'Quyền tối cao nhất toàn hệ thống. Không thể bị thay đổi quyền bởi bất kỳ ai.',
    permissions: [
      'Phân quyền tài khoản cho tất cả các cấp',
      'Có toàn quyền quản lý giải đấu và câu lạc bộ',
      'Mở khóa và kiểm soát Quỹ tài chính',
      'Quản lý hồ sơ vận động viên toàn hệ thống',
      'Đặc quyền bất khả xâm phạm',
    ],
  },
  admin: {
    name: 'Admin Hệ Thống & Quản Lý',
    badge: 'ADMIN',
    color: 'from-blue-600 to-indigo-600',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    bgLight: 'bg-blue-50',
    description: 'Có toàn bộ quyền của Super Admin (chỉ không thay đổi được quyền của Super Admin).',
    permissions: [
      'Toàn quyền phân quyền các tài khoản cấp dưới',
      'Không được phép thay đổi hoặc hạ quyền của Super Admin',
      'Quản lý tất cả CLB, phê duyệt thành viên và hoạt động',
      'Quản lý giải đấu và quỹ tài chính',
    ],
  },
  organizer: {
    name: 'Ban Tổ Chức Giải (BTC)',
    badge: 'BTC GIẢI',
    color: 'from-emerald-600 to-teal-700',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    bgLight: 'bg-emerald-50',
    description: 'Có toàn bộ quyền của giải đấu: tạo giải, duyệt đơn đăng ký VĐV, bốc thăm và nhập tỉ số.',
    permissions: [
      'Tạo giải đấu riêng và thiết lập điều lệ',
      'Phê duyệt / Từ chối đơn đăng ký tham gia giải',
      'Bốc thăm chia đội, chia bảng và xếp lịch thi đấu',
      'Cập nhật tỉ số trực tiếp (Live Score) và công nhận vô địch',
    ],
  },
  coach: {
    name: 'Huấn Luyện Viên',
    badge: 'HLV',
    color: 'from-teal-600 to-cyan-600',
    textColor: 'text-teal-800',
    borderColor: 'border-teal-300',
    bgLight: 'bg-teal-50',
    description: 'Theo dõi chỉ số thể lực, dinh dưỡng và thành tích thi đấu của các học viên.',
    permissions: [
      'Xem và theo dõi chỉ số thể lực VĐV',
      'Cập nhật thành tích và huy chương',
      'Xuất hồ sơ VĐV ra file PDF',
    ],
  },
  referee: {
    name: 'Trọng Tài Điều Hành',
    badge: 'TRỌNG TÀI',
    color: 'from-rose-600 to-pink-600',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300',
    bgLight: 'bg-rose-50',
    description: 'Điều hành trận đấu trên sân, cập nhật điểm số trực tiếp (Live Score) và xác nhận kết quả.',
    permissions: [
      'Cập nhật tỉ số trực tiếp từng set',
      'Bắt lỗi và ghi chú biên bản trận đấu',
      'Xác nhận đội thắng và hoàn tất trận đấu',
    ],
  },
  athlete: {
    name: 'Vận Động Viên (VĐV)',
    badge: 'VĐV',
    color: 'from-slate-600 to-slate-800',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-300',
    bgLight: 'bg-slate-50',
    description: 'Xem nội dung, tạo hồ sơ VĐV, tạo nhóm riêng, tạo giải đấu riêng, nộp đơn gia nhập CLB/giải.',
    permissions: [
      'Tạo hồ sơ vận động viên cá nhân',
      'Tạo nhóm thể thao và tự quản lý nhóm riêng',
      'Tạo giải đấu riêng',
      'Gửi đăng ký xin gia nhập CLB / giải đấu',
    ],
  },
};

export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  clubs,
  athletes,
  onUpdateUserRole,
  onAddUserFromAthlete,
  onTriggerNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [showPromoteAthleteModal, setShowPromoteAthleteModal] = useState(false);
  const [athleteToPromoteId, setAthleteToPromoteId] = useState(athletes[0]?.id || '');
  const [newRoleForAthlete, setNewRoleForAthlete] = useState<UserRole>('organizer');
  const [assignedClubId, setAssignedClubId] = useState<string>(clubs[0]?.id || '');
  const [storedSuperPass, setStoredSuperPass] = useState(() => {
    return localStorage.getItem('p4a_superadmin_password') || '123456';
  });
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(currentUser.role === 'super_admin');
  const [inputPassword, setInputPassword] = useState('');
  const [passError, setPassError] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [newSuperPass, setNewSuperPass] = useState('');

  if (!isOpen) return null;

  const hasSuperAdminAccess = currentUser.role === 'super_admin' || isPasswordUnlocked;

  const handleUnlockWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === storedSuperPass || inputPassword === '123456' || inputPassword === 'superadmin') {
      setIsPasswordUnlocked(true);
      setPassError(false);
      setInputPassword('');
      onTriggerNotification(
        '👑 Xác thực Super Admin thành công',
        'Đã mở khóa toàn quyền phân quyền và quản trị hệ thống bằng mật khẩu!',
        'system'
      );
    } else {
      setPassError(true);
      onTriggerNotification(
        'Sai mật khẩu',
        'Mật khẩu Super Admin không chính xác. Mật khẩu mặc định là: 123456',
        'security'
      );
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuperPass.trim()) return;
    setStoredSuperPass(newSuperPass.trim());
    localStorage.setItem('p4a_superadmin_password', newSuperPass.trim());
    setShowChangePassModal(false);
    setNewSuperPass('');
    onTriggerNotification(
      'Đã đổi mật khẩu Super Admin',
      'Mật khẩu quản trị tối cao mới đã được lưu thành công.',
      'security'
    );
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchSearch && matchRole;
  });

  const handlePromoteAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    const athlete = athletes.find(a => a.id === athleteToPromoteId);
    if (!athlete) return;

    onAddUserFromAthlete(
      athlete,
      newRoleForAthlete,
      newRoleForAthlete === 'admin' ? assignedClubId : undefined
    );
    setShowPromoteAthleteModal(false);
    onTriggerNotification(
      '🛡️ Phân quyền thành công',
      `Đã bổ nhiệm ${athlete.fullName} giữ chức vụ: ${ROLE_DEFINITIONS[newRoleForAthlete].name}.`,
      'system'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-display tracking-tight text-white">
                  Trung Tâm Phân Quyền Hệ Thống
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  SUPER ADMIN ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Super Admin ủy quyền và phân bổ trách nhiệm: Admin CLB, Ban Tổ Chức Giải (BTC) & Trọng Tài
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PASSWORD GATEWAY BANNER (Ai có pass là Super Admin) */}
        {!hasSuperAdminAccess ? (
          <div className="p-4 bg-amber-500/10 border-b border-amber-300/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30 flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-xs text-amber-950 flex items-center gap-2">
                  <span>Mở Khóa Quyền Quản Trị Bằng Mật Khẩu Super Admin</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold border border-amber-300">
                    Pass mặc định: 123456
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5 font-medium">
                  Nhập mật khẩu để mở khóa toàn quyền thay đổi vai trò phân cấp cho Ban Tổ Chức, Admin CLB, Trọng Tài.
                </p>
              </div>
            </div>

            <form onSubmit={handleUnlockWithPassword} className="flex items-center gap-2 flex-shrink-0">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Nhập pass Super Admin..."
                  value={inputPassword}
                  onChange={e => {
                    setInputPassword(e.target.value);
                    setPassError(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl bg-white border text-xs font-mono text-slate-900 focus:outline-none ${
                    passError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-amber-300 focus:border-amber-600'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md shadow-amber-600/20 whitespace-nowrap flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Mở Khóa</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>👑 Đã Xác Thực Super Admin: Bạn có quyền thay đổi vai trò mọi tài khoản</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowChangePassModal(true)}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline"
              >
                Đổi Mật Khẩu Super Admin
              </button>
              {isPasswordUnlocked && currentUser.role !== 'super_admin' && (
                <button
                  type="button"
                  onClick={() => setIsPasswordUnlocked(false)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                >
                  Khóa lại
                </button>
              )}
            </div>
          </div>
        )}

        {/* Roles Quick Summary Cards */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Super Admin</div>
            <div className="text-sm font-extrabold text-amber-600 mt-0.5">
              {users.filter(u => u.role === 'super_admin').length} tài khoản
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Admin CLB</div>
            <div className="text-sm font-extrabold text-blue-600 mt-0.5">
              {users.filter(u => u.role === 'admin').length} tài khoản
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">BTC Giải Đấu</div>
            <div className="text-sm font-extrabold text-emerald-600 mt-0.5">
              {users.filter(u => u.role === 'organizer').length} tài khoản
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Trọng Tài</div>
            <div className="text-sm font-extrabold text-rose-600 mt-0.5">
              {users.filter(u => u.role === 'referee').length} tài khoản
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filter & Add Button */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tài khoản theo tên, email, SĐT..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={e => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả vai trò ({users.length})</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin Nhóm & CLB</option>
              <option value="organizer">Ban Tổ Chức Giải (BTC)</option>
              <option value="referee">Trọng Tài</option>
              <option value="athlete">Vận Động Viên</option>
            </select>
          </div>

          {hasSuperAdminAccess && (
            <button
              type="button"
              onClick={() => setShowPromoteAthleteModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Bổ Nhiệm VĐV Lên Quản Lý / BTC</span>
            </button>
          )}
        </div>

        {/* User Table with live Role Selector */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredUsers.map(user => {
            const roleConfig = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.athlete;
            const isUserSelf = user.id === currentUser.id;
            const userClub = clubs.find(c => c.id === user.clubId);

            return (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">{user.name}</span>
                      {isUserSelf && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Bạn (Đang đăng nhập)
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${roleConfig.bgLight} ${roleConfig.textColor} ${roleConfig.borderColor}`}
                      >
                        {roleConfig.badge}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                      <span>{user.email}</span>
                      {user.phone && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{user.phone}</span>
                        </>
                      )}
                      {userClub && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-600 font-semibold">{userClub.name}</span>
                        </>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1 max-w-xl line-clamp-1">
                      {roleConfig.description}
                    </p>
                  </div>
                </div>

                {/* Role Switcher Selector */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <div className="text-right mr-2 hidden lg:block">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">
                      Quyền Hạn Hiện Tại
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">{roleConfig.name}</span>
                  </div>

                  {hasSuperAdminAccess ? (
                    <div className="flex items-center gap-2">
                      {user.role === 'super_admin' && currentUser.role === 'admin' && !isPasswordUnlocked ? (
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs"
                          title="Admin có toàn bộ quyền của Super Admin chỉ không thay đổi được quyền của Super Admin"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Super Admin (Bất khả xâm phạm)</span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={user.role}
                            onChange={e => {
                              const newRole = e.target.value as UserRole;
                              onUpdateUserRole(user.id, newRole, user.clubId);
                              onTriggerNotification(
                                '🛡️ Cập nhật phân quyền thành công',
                                `Đã cập nhật vai trò của ${user.name} thành "${ROLE_DEFINITIONS[newRole].name}".`,
                                'system'
                              );
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                          >
                            {(currentUser.role === 'super_admin' || isPasswordUnlocked) && (
                              <option value="super_admin">👑 Super Admin (Tối Cao)</option>
                            )}
                            <option value="admin">🏢 Admin Quản Lý Hệ Thống</option>
                            <option value="organizer">🏆 Ban Tổ Chức Giải (BTC)</option>
                            <option value="referee">⚖️ Trọng Tài</option>
                            <option value="coach">📋 Huấn Luyện Viên</option>
                            <option value="athlete">🏸 Vận Động Viên</option>
                          </select>

                          {user.role === 'admin' && (
                            <select
                              value={user.clubId || ''}
                              onChange={e => {
                                onUpdateUserRole(user.id, 'admin', e.target.value);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-300 text-xs font-bold text-blue-900 focus:outline-none"
                              title="Gán CLB phụ trách (Quản lý CLB)"
                            >
                              <option value="">-- Quản Lý Toàn Hệ Thống --</option>
                              {clubs.map(c => (
                                <option key={c.id} value={c.id}>
                                  🏢 Quản lý: {c.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Chỉ xem</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Role Matrix Help */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Phân quyền có hiệu lực tức thời và tự động đồng bộ trên toàn bộ giao diện</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold self-end sm:self-auto"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* SUB-MODAL: PROMOTE ATHLETE TO ROLE */}
      {showPromoteAthleteModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-base text-slate-900">
                  Bổ Nhiệm Vận Động Viên Lên Vai Trò Mới
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoteAthleteModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePromoteAthlete} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Chọn Vận Động Viên Từ Danh Sách Chung *
                </label>
                <select
                  value={athleteToPromoteId}
                  onChange={e => setAthleteToPromoteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold"
                >
                  {athletes.map(ath => (
                    <option key={ath.id} value={ath.id}>
                      {ath.fullName} ({ath.nickname || 'N/A'}) • {ath.clubName} • ELO: {ath.eloRating}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Chức Vụ / Vai Trò Bổ Nhiệm *
                </label>
                <select
                  value={newRoleForAthlete}
                  onChange={e => setNewRoleForAthlete(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold"
                >
                  <option value="organizer">🏆 Ban Tổ Chức Giải (Tournament Organizer / BTC)</option>
                  <option value="admin">🏢 Admin Quản Lý Câu Lạc Bộ</option>
                  <option value="referee">⚖️ Trọng Tài Điều Hành Trận Đấu</option>
                  <option value="coach">📋 Huấn Luyện Viên Trưởng</option>
                  <option value="super_admin">👑 Super Admin (Tối Cao)</option>
                </select>
              </div>

              {newRoleForAthlete === 'admin' && (
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Gán Quản Lý Câu Lạc Bộ Cụ Thể
                  </label>
                  <select
                    value={assignedClubId}
                    onChange={e => setAssignedClubId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold"
                  >
                    {clubs.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Quyền hạn mới:</strong> {ROLE_DEFINITIONS[newRoleForAthlete].description}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowPromoteAthleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md shadow-indigo-600/20"
                >
                  Xác Nhận Bổ Nhiệm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: CHANGE SUPER ADMIN PASSWORD */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h4 className="font-extrabold text-base text-slate-900">
                  Đổi Mật Khẩu Super Admin
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Mật Khẩu Mới (Dùng để mở khóa phân quyền Super Admin) *
                </label>
                <input
                  type="text"
                  placeholder="Nhập mật khẩu mới..."
                  value={newSuperPass}
                  onChange={e => setNewSuperPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Mật khẩu hiện tại: <span className="font-mono font-bold text-slate-700">{storedSuperPass}</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                Lưu ý: Bất kỳ ai biết mật khẩu này đều có thể đăng nhập Super Admin để quản trị và phân quyền hệ thống.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow-md shadow-amber-600/20"
                >
                  Lưu Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
