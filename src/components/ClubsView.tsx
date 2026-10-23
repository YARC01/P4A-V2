import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  Edit3,
  Trash2,
  Users,
  DollarSign,
  Phone,
  AlertTriangle,
  X,
  CheckCircle2,
  Search,
  UserMinus,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Megaphone,
  Bell,
  LayoutGrid,
  List,
  AlignJustify,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  UserCheck,
  Tag,
  Send,
} from 'lucide-react';
import { ClubGroup, Athlete, User, ClubActivity, ClubGuest, ClubJoinRequest } from '../types.ts';
import { hashPassword, verifyPassword } from '../utils/security.ts';

interface ClubsViewProps {
  clubs: ClubGroup[];
  athletes: Athlete[];
  currentUser: User;
  onAddClub: (club: ClubGroup) => void;
  onUpdateClub: (club: ClubGroup) => void;
  onDeleteClub: (id: string) => void;
  onBatchUpdateAthletesClub?: (clubId: string, clubName: string, selectedAthleteIds: string[]) => void;
  onTriggerNotification: (title: string, message: string, type: any) => void;
}

export const ClubsView: React.FC<ClubsViewProps> = ({
  clubs,
  athletes,
  currentUser,
  onAddClub,
  onUpdateClub,
  onDeleteClub,
  onBatchUpdateAthletesClub,
  onTriggerNotification,
}) => {
  // View mode: Grid, Table (Danh sách chi tiết), Compact (Thu gọn)
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClubDetails, setSelectedClubDetails] = useState<ClubGroup | null>(null);
  const [detailsTab, setDetailsTab] = useState<'info' | 'activities' | 'roster' | 'join_requests' | 'security'>('info');

  // Join Club Modal State
  const [joinClubModal, setJoinClubModal] = useState<{
    isOpen: boolean;
    club: ClubGroup | null;
  }>({
    isOpen: false,
    club: null,
  });
  const [joinAthleteId, setJoinAthleteId] = useState('');
  const [joinNote, setJoinNote] = useState('');

  // Security Verification Modal
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    club: ClubGroup | null;
    action: 'edit' | 'delete' | null;
  }>({
    isOpen: false,
    club: null,
    action: null,
  });
  const [authPasswordInput, setAuthPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Editing Club (after authenticated)
  const [editingClub, setEditingClub] = useState<ClubGroup | null>(null);

  // Form State for Adding / Editing Club
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slogan: '',
    venueAddress: '',
    description: '',
    logoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
    leaderName: '',
    contactPhone: '',
    fundBalance: 5000000,
    password: '',
    confirmPassword: '',
  });

  // Selected Athletes from global pool for this club
  const [selectedAthleteIdsForClub, setSelectedAthleteIdsForClub] = useState<string[]>([]);
  const [athleteRosterSearch, setAthleteRosterSearch] = useState('');
  const [formError, setFormError] = useState('');

  // Quick Roster Add drawer in roster modal
  const [showRosterQuickAdd, setShowRosterQuickAdd] = useState(false);
  const [quickAddSearch, setQuickAddSearch] = useState('');

  // New Activity Form State inside Club Details Modal
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActivityData, setNewActivityData] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '18:00',
    endTime: '21:00',
    venue: '',
    description: '',
  });

  // Check if current user is manager of the club
  const isClubManager = (club: ClubGroup) => {
    return (
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      club.leaderId === currentUser.id ||
      currentUser.clubId === club.id
    );
  };

  // Handle Open Detailed Club Settings Modal
  const handleOpenClubDetails = (
    club: ClubGroup,
    defaultTab: 'info' | 'activities' | 'roster' | 'join_requests' = 'info'
  ) => {
    setSelectedClubDetails(club);
    setDetailsTab(defaultTab);
    setIsAddActivityOpen(false);
  };

  // Join Club Handlers
  const handleOpenJoinClubModal = (club: ClubGroup) => {
    const myAth = athletes.find(
      a =>
        a.id === currentUser.athleteId ||
        a.fullName.toLowerCase() === currentUser.name.toLowerCase()
    );
    setJoinAthleteId(myAth?.id || athletes[0]?.id || '');
    setJoinNote('');
    setJoinClubModal({ isOpen: true, club });
  };

  const handleSubmitJoinClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinClubModal.club) return;
    const ath = athletes.find(a => a.id === joinAthleteId);
    if (!ath) return;

    const newReq: ClubJoinRequest = {
      id: `req-${Date.now()}`,
      clubId: joinClubModal.club.id,
      clubName: joinClubModal.club.name,
      userId: currentUser.id,
      userName: currentUser.name,
      athleteId: ath.id,
      athleteName: ath.fullName,
      athletePhone: ath.phone,
      sportTier: ath.rankingTier,
      note: joinNote.trim() || 'Em muốn gia nhập câu lạc bộ để tập luyện và giao lưu thi đấu!',
      status: 'pending',
      requestedAt:
        new Date().toLocaleDateString('vi-VN') +
        ' ' +
        new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedReqs = [newReq, ...(joinClubModal.club.joinRequests || [])];
    const updatedClub: ClubGroup = {
      ...joinClubModal.club,
      joinRequests: updatedReqs,
    };

    onUpdateClub(updatedClub);
    setJoinClubModal({ isOpen: false, club: null });
    onTriggerNotification(
      '📨 Đã gửi đơn xin gia nhập CLB',
      `Đơn đăng ký của ${ath.fullName} đã được gửi tới Quản lý "${joinClubModal.club.name}" để phê duyệt.`,
      'system'
    );
  };

  const handleApproveJoinRequest = (req: ClubJoinRequest) => {
    if (!selectedClubDetails) return;
    const targetAthlete = athletes.find(a => a.id === req.athleteId);
    const updatedReqs = (selectedClubDetails.joinRequests || []).map(r =>
      r.id === req.id
        ? {
            ...r,
            status: 'approved' as const,
            resolvedAt: new Date().toISOString(),
            resolvedBy: currentUser.name,
          }
        : r
    );

    const updatedClub: ClubGroup = {
      ...selectedClubDetails,
      memberCount: selectedClubDetails.memberCount + 1,
      joinRequests: updatedReqs,
    };

    onUpdateClub(updatedClub);
    setSelectedClubDetails(updatedClub);

    if (targetAthlete && onBatchUpdateAthletesClub) {
      const existingClubAthletes = athletes
        .filter(a => a.clubId === selectedClubDetails.id)
        .map(a => a.id);
      onBatchUpdateAthletesClub(selectedClubDetails.id, selectedClubDetails.name, [
        ...existingClubAthletes,
        targetAthlete.id,
      ]);
    }

    onTriggerNotification(
      '🎉 Đã duyệt thành viên vào CLB',
      `Vận động viên ${req.athleteName} đã chính thức được phê duyệt gia nhập "${selectedClubDetails.name}"!`,
      'system'
    );
  };

  const handleRejectJoinRequest = (req: ClubJoinRequest) => {
    if (!selectedClubDetails) return;
    const updatedReqs = (selectedClubDetails.joinRequests || []).map(r =>
      r.id === req.id
        ? {
            ...r,
            status: 'rejected' as const,
            resolvedAt: new Date().toISOString(),
            resolvedBy: currentUser.name,
          }
        : r
    );

    const updatedClub: ClubGroup = {
      ...selectedClubDetails,
      joinRequests: updatedReqs,
    };

    onUpdateClub(updatedClub);
    setSelectedClubDetails(updatedClub);

    onTriggerNotification(
      'Đã từ chối đơn gia nhập',
      `Đã từ chối yêu cầu gia nhập của ${req.athleteName}.`,
      'system'
    );
  };

  const handleOpenAddModal = () => {
    setEditingClub(null);
    setFormData({
      name: '',
      code: '',
      slogan: '',
      venueAddress: '',
      description: '',
      logoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
      leaderName: currentUser.name || 'Trưởng Nhóm Mới',
      contactPhone: currentUser.phone || '0900 000 000',
      fundBalance: 5000000,
      password: '',
      confirmPassword: '',
    });
    setSelectedAthleteIdsForClub([]);
    setAthleteRosterSearch('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.code.trim() || !formData.leaderName.trim()) {
      setFormError('Vui lòng điền đủ tên CLB, mã viết tắt và tên trưởng nhóm');
      return;
    }

    if (!editingClub) {
      if (!formData.password) {
        setFormError('Vui lòng thiết lập mật mã bảo vệ nhóm');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Mật khẩu xác nhận không khớp');
        return;
      }

      const passHash = await hashPassword(formData.password);
      const newClubId = `club-${Date.now()}`;

      const newClub: ClubGroup = {
        id: newClubId,
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim(),
        slogan: formData.slogan.trim() || 'Đam Mê Bất Tận - Tinh Thần Thể Thao',
        venueAddress: formData.venueAddress.trim() || 'Sân tập thể thao thành phố',
        description: formData.description || 'Câu lạc bộ thành viên hệ thống PICKLE 4 ALL',
        logoUrl: formData.logoUrl,
        leaderId: currentUser.id || `usr-${Date.now()}`,
        leaderName: formData.leaderName.trim(),
        contactPhone: formData.contactPhone || '0900 000 000',
        createdAt: new Date().toISOString().slice(0, 10),
        memberCount: selectedAthleteIdsForClub.length,
        fundBalance: Number(formData.fundBalance) || 0,
        passwordHash: passHash,
        customTiers: ['Muỗi', 'Ruồi', 'Gà', 'Cọp', 'Đại Bàng', 'Voi'],
        activities: [],
      };

      onAddClub(newClub);

      if (onBatchUpdateAthletesClub && selectedAthleteIdsForClub.length > 0) {
        onBatchUpdateAthletesClub(newClub.id, newClub.name, selectedAthleteIdsForClub);
      }

      onTriggerNotification(
        'Đã tạo CLB mới thành công',
        `Câu lạc bộ "${newClub.name}" đã được khởi tạo với mật mã bảo mật riêng.`,
        'system'
      );
      setIsAddModalOpen(false);
    } else {
      // Editing existing club
      let passHash = editingClub.passwordHash;
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          setFormError('Mật khẩu xác nhận không khớp');
          return;
        }
        passHash = await hashPassword(formData.password);
      }

      const updatedClub: ClubGroup = {
        ...editingClub,
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim(),
        slogan: formData.slogan.trim() || editingClub.slogan,
        venueAddress: formData.venueAddress.trim() || editingClub.venueAddress,
        description: formData.description,
        logoUrl: formData.logoUrl,
        leaderName: formData.leaderName.trim(),
        contactPhone: formData.contactPhone,
        fundBalance: Number(formData.fundBalance) || 0,
        passwordHash: passHash,
      };

      onUpdateClub(updatedClub);

      if (onBatchUpdateAthletesClub) {
        onBatchUpdateAthletesClub(updatedClub.id, updatedClub.name, selectedAthleteIdsForClub);
      }

      // If active modal is open for this club, sync it
      if (selectedClubDetails && selectedClubDetails.id === updatedClub.id) {
        setSelectedClubDetails(updatedClub);
      }

      onTriggerNotification(
        'Đã cập nhật CLB',
        `Thông tin câu lạc bộ "${updatedClub.name}" đã được cập nhật thành công.`,
        'system'
      );
      setIsAddModalOpen(false);
    }
  };

  // Direct edit from the General Info Tab inside Club Details Modal
  const handleUpdateClubGeneralInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubDetails) return;

    onUpdateClub(selectedClubDetails);
    onTriggerNotification(
      'Đã lưu thông tin CLB',
      `Thông tin chung của nhóm "${selectedClubDetails.name}" đã được lưu thành công.`,
      'system'
    );
  };

  // Activity: Add new activity
  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubDetails || !newActivityData.title.trim()) return;

    const newAct: ClubActivity = {
      id: `act-${Date.now()}`,
      clubId: selectedClubDetails.id,
      title: newActivityData.title.trim(),
      date: newActivityData.date,
      startTime: newActivityData.startTime,
      endTime: newActivityData.endTime,
      venue: newActivityData.venue.trim() || selectedClubDetails.venueAddress || 'Sân tập CLB',
      description: newActivityData.description.trim(),
      attendeeAthleteIds: [],
      guests: [
        { id: `g-${Date.now()}-1`, name: 'Khách 01', phone: '', feePaid: false },
      ],
      notified: false,
      createdAt: new Date().toISOString(),
    };

    const updatedActivities = [newAct, ...(selectedClubDetails.activities || [])];
    const updatedClub: ClubGroup = {
      ...selectedClubDetails,
      activities: updatedActivities,
    };

    onUpdateClub(updatedClub);
    setSelectedClubDetails(updatedClub);
    setIsAddActivityOpen(false);
    setNewActivityData({
      title: '',
      date: new Date().toISOString().slice(0, 10),
      startTime: '18:00',
      endTime: '21:00',
      venue: selectedClubDetails.venueAddress || '',
      description: '',
    });

    onTriggerNotification(
      'Đã lên lịch sinh hoạt mới',
      `Buổi sinh hoạt "${newAct.title}" vào ngày ${newAct.date} đã được tạo thành công!`,
      'system'
    );
  };

  // Activity: Broadcast notification to group
  const handleBroadcastActivityNotification = (activity: ClubActivity) => {
    if (!selectedClubDetails) return;

    const updatedActivities = (selectedClubDetails.activities || []).map(act =>
      act.id === activity.id ? { ...act, notified: true } : act
    );

    const updatedClub: ClubGroup = {
      ...selectedClubDetails,
      activities: updatedActivities,
    };

    onUpdateClub(updatedClub);
    setSelectedClubDetails(updatedClub);

    onTriggerNotification(
      `📢 THÔNG BÁO LỊCH SINH HOẠT CLB: ${activity.title}`,
      `CLB ${selectedClubDetails.name} thông báo lịch sinh hoạt lúc ${activity.startTime} - ${activity.endTime} ngày ${activity.date} tại ${activity.venue}. Kính mời toàn thể thành viên và khách mời có mặt đúng giờ!`,
      'system'
    );
  };

  // Activity: Toggle Member Attendance (Điểm danh bằng click chọn thành viên)
  const handleToggleMemberAttendance = (activityId: string, athleteId: string) => {
    if (!selectedClubDetails) return;

    const updatedActivities = (selectedClubDetails.activities || []).map(act => {
      if (act.id !== activityId) return act;
      const alreadyChecked = act.attendeeAthleteIds.includes(athleteId);
      const newAttendees = alreadyChecked
        ? act.attendeeAthleteIds.filter(id => id !== athleteId)
        : [...act.attendeeAthleteIds, athleteId];
      return { ...act, attendeeAthleteIds: newAttendees };
    });

    const updatedClub = { ...selectedClubDetails, activities: updatedActivities };
    onUpdateClub(updatedClub);
    setSelectedClubDetails(updatedClub);
  };

  // Activity: Add Guest (Tên mặc định tăng dần: Khách 01, Khách 02...)
  const handleAddGuest = (activityId: string) => {
    if (!selectedClubDetails) return;

    const updatedActivities = (selectedClubDetails.activities || []).map(act => {
      if (act.id !== activityId) return act;
      const currentGuestCount = act.guests?.length || 0;
      const defaultNumber = (currentGuestCount + 1).toString().padStart(2, '0');
      const defaultName = `Khách ${defaultNumber}`;

      const newGuest: ClubGuest = {
        id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: defaultName,
        phone: '',
        feePaid: false,
      };

      return {
        ...act,
        guests: [...(act.guests || []), newGuest],
      };
    });

    const updatedClub = { ...selectedClubDetails, activities: updatedActivities };
    onUpdateClub(updatedClub);
    setSelectedClubDetails(updatedClub);
  };

  // Activity: Update Guest Name or Paid Fee
  const handleUpdateGuest = (
    activityId: string,
    guestId: string,
    updates: Partial<ClubGuest>
  ) => {
    if (!selectedClubDetails) return;

    const updatedActivities = (selectedClubDetails.activities || []).map(act => {
      if (act.id !== activityId) return act;
      const updatedGuests = (act.guests || []).map(g =>
        g.id === guestId ? { ...g, ...updates } : g
      );
      return { ...act, guests: updatedGuests };
    });

    const updatedClub = { ...selectedClubDetails, activities: updatedActivities };
    onUpdateClub(updatedClub);
    setSelectedClubDetails(updatedClub);
  };

  // Activity: Remove Guest
  const handleRemoveGuest = (activityId: string, guestId: string) => {
    if (!selectedClubDetails) return;

    const updatedActivities = (selectedClubDetails.activities || []).map(act => {
      if (act.id !== activityId) return act;
      return {
        ...act,
        guests: (act.guests || []).filter(g => g.id !== guestId),
      };
    });

    const updatedClub = { ...selectedClubDetails, activities: updatedActivities };
    onUpdateClub(updatedClub);
    setSelectedClubDetails(updatedClub);
  };

  // Request action requiring password
  const requestClubAction = (club: ClubGroup, action: 'edit' | 'delete') => {
    setAuthModal({
      isOpen: true,
      club,
      action,
    });
    setAuthPasswordInput('');
    setAuthError('');
  };

  const handleVerifyPasswordAndProceed = () => {
    if (!authModal.club || !authModal.action) return;

    const isSuperAdmin = currentUser.role === 'super_admin';
    const isCorrect = verifyPassword(authPasswordInput, authModal.club.passwordHash);

    if (!isCorrect && !isSuperAdmin) {
      setAuthError('Mật mã bảo vệ không chính xác! Hãy kiểm tra lại mật khẩu đã thiết lập.');
      return;
    }

    const action = authModal.action;
    const targetClub = authModal.club;
    setAuthModal({ isOpen: false, club: null, action: null });

    if (action === 'delete') {
      onDeleteClub(targetClub.id);
      if (selectedClubDetails?.id === targetClub.id) {
        setSelectedClubDetails(null);
      }
      onTriggerNotification(
        'Đã xóa CLB',
        `Câu lạc bộ "${targetClub.name}" đã được gỡ khỏi hệ thống sau khi xác thực.`,
        'security'
      );
    } else if (action === 'edit') {
      setEditingClub(targetClub);
      setFormData({
        name: targetClub.name,
        code: targetClub.code,
        slogan: targetClub.slogan || '',
        venueAddress: targetClub.venueAddress || '',
        description: targetClub.description,
        logoUrl: targetClub.logoUrl,
        leaderName: targetClub.leaderName,
        contactPhone: targetClub.contactPhone,
        fundBalance: targetClub.fundBalance,
        password: '',
        confirmPassword: '',
      });
      setSelectedAthleteIdsForClub(athletes.filter(a => a.clubId === targetClub.id).map(a => a.id));
      setAthleteRosterSearch('');
      setFormError('');
      setIsAddModalOpen(true);
    }
  };

  // Filter clubs by search term
  const filteredClubs = clubs.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.venueAddress && c.venueAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-700/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-200 text-xs font-bold mb-2 border border-white/20">
            <Lock className="w-3.5 h-3.5 text-purple-300" />
            <span>QUẢN LÝ NHÓM & CÂU LẠC BỘ THỂ THAO THÀNH VIÊN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
            Quản Lý Câu Lạc Bộ, Lịch Sinh Hoạt & Phân Hạng
          </h2>
          <p className="text-xs text-purple-200 mt-1 max-w-2xl font-medium leading-relaxed">
            Xem thông tin chung, cài đặt nhóm, lên lịch sinh hoạt CLB, phát thông báo đẩy, điểm danh thành viên và tiếp nhận khách ngoài linh hoạt.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Thêm Nhóm Mới (Đặt Pass)</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên CLB, mã code, sân tập, trưởng nhóm..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Hiển thị:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dạng Lưới Thẻ (Grid)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưới</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dạng Danh Sách Chi Tiết (Table)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh Sách</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'compact'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Dạng Thu Gọn (Compact)"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thu Gọn</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLUBS DISPLAY: GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredClubs.map(club => {
            const clubMembers = athletes.filter(a => a.clubId === club.id);
            const activitiesCount = club.activities?.length || 0;
            const isManager = isClubManager(club);
            const isMember =
              currentUser.clubId === club.id ||
              clubMembers.some(
                a =>
                  a.id === currentUser.athleteId ||
                  a.fullName.toLowerCase() === currentUser.name.toLowerCase()
              );
            const pendingReqsCount = (club.joinRequests || []).filter(r => r.status === 'pending').length;
            const hasPendingMyRequest = (club.joinRequests || []).some(
              r =>
                r.status === 'pending' &&
                (r.userId === currentUser.id || r.athleteId === currentUser.athleteId)
            );

            return (
              <div
                key={club.id}
                onClick={() => handleOpenClubDetails(club)}
                className="group rounded-3xl bg-white border border-slate-200 hover:border-purple-400 p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={club.logoUrl}
                        alt={club.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 group-hover:border-purple-400 flex-shrink-0 shadow-sm transition-all"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                            {club.name}
                          </h3>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                            {club.code}
                          </span>
                          {isManager && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              👑 Quản Lý CLB
                            </span>
                          )}
                          {isMember && !isManager && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ✓ Thành Viên
                            </span>
                          )}
                          {hasPendingMyRequest && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                              ⏳ Chờ Quản lý duyệt
                            </span>
                          )}
                        </div>
                        {club.slogan && (
                          <p className="text-xs text-purple-600 font-semibold italic mt-0.5">
                            "{club.slogan}"
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">
                          {club.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Có Pass</span>
                    </div>
                  </div>

                  {club.venueAddress && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{club.venueAddress}</span>
                    </div>
                  )}

                  {/* Club Quick Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trưởng Nhóm</div>
                      <div className="font-black text-slate-900 truncate mt-0.5">{club.leaderName}</div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                      <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Thành Viên</div>
                      <div className="font-black text-purple-900 font-display text-sm mt-0.5">
                        {clubMembers.length || club.memberCount} VĐV
                      </div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Lịch Sinh Hoạt</div>
                      <div className="font-black text-emerald-800 font-display text-sm mt-0.5">
                        {activitiesCount} buổi
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  {isManager ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenClubDetails(club, pendingReqsCount > 0 ? 'join_requests' : 'activities')
                        }
                        className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-300" />
                        <span>Quản Lý CLB</span>
                        {pendingReqsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] animate-pulse">
                            {pendingReqsCount} Duyệt
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenClubDetails(club, 'info')}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors border border-slate-200"
                      >
                        <Info className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cài Đặt</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {hasPendingMyRequest ? (
                        <div className="flex-1 py-2 px-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs flex items-center justify-center gap-1.5">
                          <span>⏳ Đang chờ duyệt</span>
                        </div>
                      ) : isMember ? (
                        <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã tham gia</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenJoinClubModal(club)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Xin Gia Nhập CLB</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenClubDetails(club, 'activities')}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors border border-slate-200"
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Lịch ({activitiesCount})</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => requestClubAction(club, 'delete')}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                    title="Xóa nhóm (Cần mật mã)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLUBS DISPLAY: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">CLB / Nhóm</th>
                  <th className="py-3.5 px-4">Khẩu Hiệu & Sân Tập</th>
                  <th className="py-3.5 px-4">Trưởng Nhóm</th>
                  <th className="py-3.5 px-4 text-center">Thành Viên</th>
                  <th className="py-3.5 px-4 text-center">Lịch Sinh Hoạt</th>
                  <th className="py-3.5 px-4 text-right">Quỹ Nhóm</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClubs.map(club => {
                  const clubMembers = athletes.filter(a => a.clubId === club.id);
                  const activitiesCount = club.activities?.length || 0;

                  return (
                    <tr
                      key={club.id}
                      onClick={() => handleOpenClubDetails(club)}
                      className="hover:bg-purple-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={club.logoUrl}
                            alt={club.name}
                            className="w-10 h-10 rounded-xl object-cover border border-purple-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm hover:text-purple-700">
                              {club.name}
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
                              {club.code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {club.slogan && (
                          <div className="font-semibold text-purple-700 italic text-[11px]">"{club.slogan}"</div>
                        )}
                        <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                          <span className="truncate max-w-xs">{club.venueAddress || 'Chưa cập nhật'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{club.leaderName}</div>
                        <div className="text-slate-400 text-[11px]">{club.contactPhone}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold font-mono">
                          {clubMembers.length || club.memberCount} VĐV
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                          {activitiesCount} buổi
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="font-black text-emerald-700 font-mono text-sm">
                          {(club.fundBalance / 1000000).toFixed(1)} tr VNĐ
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenClubDetails(club, 'info')}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs"
                          >
                            Cài Đặt
                          </button>
                          <button
                            type="button"
                            onClick={() => requestClubAction(club, 'delete')}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Xóa nhóm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CLUBS DISPLAY: COMPACT VIEW */}
      {viewMode === 'compact' && (
        <div className="space-y-2">
          {filteredClubs.map(club => {
            const clubMembers = athletes.filter(a => a.clubId === club.id);
            const activitiesCount = club.activities?.length || 0;

            return (
              <div
                key={club.id}
                onClick={() => handleOpenClubDetails(club)}
                className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/20 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={club.logoUrl}
                    alt={club.name}
                    className="w-10 h-10 rounded-xl object-cover border border-purple-200 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">{club.name}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-mono">
                        {club.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {club.slogan ? `"${club.slogan}" • ` : ''}Sân: {club.venueAddress || 'CLB Hub'} • Trưởng nhóm: {club.leaderName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
                      {clubMembers.length || club.memberCount} VĐV
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 font-bold text-emerald-800">
                      {activitiesCount} Lịch SH
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleOpenClubDetails(club);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs"
                  >
                    Xem & Cài Đặt
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BẢNG THÔNG TIN VÀ CÀI ĐẶT NHÓM (WHEN CLICKING ON A CLUB)           */}
      {/* ========================================================================= */}
      {selectedClubDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={selectedClubDetails.logoUrl}
                  alt={selectedClubDetails.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-300 shadow-md flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-lg sm:text-xl text-white font-display truncate">
                      {selectedClubDetails.name}
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-400/30 text-purple-200 border border-purple-300/30 font-mono">
                      {selectedClubDetails.code}
                    </span>
                  </div>
                  <p className="text-xs text-purple-200 italic mt-0.5 truncate">
                    {selectedClubDetails.slogan ? `"${selectedClubDetails.slogan}"` : 'Bảng Điều Khiển & Cài Đặt Nhóm'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClubDetails(null)}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 sm:gap-2 px-5 pt-3 border-b border-slate-200 bg-slate-50/80 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setDetailsTab('info')}
                className={`py-2.5 px-3.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  detailsTab === 'info'
                    ? 'border-purple-600 text-purple-800 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-4 h-4 text-purple-600" />
                <span>Thông Tin Chung & Cài Đặt</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailsTab('activities')}
                className={`py-2.5 px-3.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  detailsTab === 'activities'
                    ? 'border-purple-600 text-purple-800 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Lịch Sinh Hoạt CLB & Điểm Danh</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px]">
                  {selectedClubDetails.activities?.length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDetailsTab('roster')}
                className={`py-2.5 px-3.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  detailsTab === 'roster'
                    ? 'border-purple-600 text-purple-800 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Danh Sách VĐV CLB</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px]">
                  {athletes.filter(a => a.clubId === selectedClubDetails.id).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDetailsTab('join_requests')}
                className={`py-2.5 px-3.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  detailsTab === 'join_requests'
                    ? 'border-purple-600 text-purple-800 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 text-purple-600" />
                <span>Duyệt Thành Viên</span>
                {((selectedClubDetails.joinRequests || []).filter(r => r.status === 'pending').length > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black text-[10px] animate-pulse">
                    {(selectedClubDetails.joinRequests || []).filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDetailsTab('security')}
                className={`py-2.5 px-3.5 rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  detailsTab === 'security'
                    ? 'border-purple-600 text-purple-800 bg-white shadow-2xs font-black'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Bảo Mật Nhóm</span>
              </button>
            </div>

            {/* Modal Body with Tab Contents */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {/* TAB 1: THÔNG TIN CHUNG CỦA NHÓM (QUẢN LÝ NHÓM CÓ THỂ SỬA ĐỔI) */}
              {detailsTab === 'info' && (
                <form onSubmit={handleUpdateClubGeneralInfo} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-purple-900 font-bold">
                      <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>Quản lý nhóm có thể trực tiếp chỉnh sửa và lưu các thông tin chung dưới đây.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Tên Nhóm / Câu Lạc Bộ *</label>
                      <input
                        type="text"
                        required
                        value={selectedClubDetails.name}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Mã Viết Tắt (Code) *</label>
                      <input
                        type="text"
                        required
                        value={selectedClubDetails.code}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, code: e.target.value.toUpperCase() })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Khẩu Hiệu CLB (Slogan)</label>
                      <input
                        type="text"
                        placeholder="VD: Đam Mê Bất Tận - Kết Nối Đỉnh Cao"
                        value={selectedClubDetails.slogan || ''}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, slogan: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Địa Bàn / Sân Tập Chính</label>
                      <input
                        type="text"
                        placeholder="VD: Cụm Liên Hợp P4A Center, 333 Phạm Văn Đồng"
                        value={selectedClubDetails.venueAddress || ''}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, venueAddress: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Trưởng Nhóm / Người Quản Lý *</label>
                      <input
                        type="text"
                        required
                        value={selectedClubDetails.leaderName}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, leaderName: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Số Điện Thoại Liên Hệ *</label>
                      <input
                        type="tel"
                        required
                        value={selectedClubDetails.contactPhone}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, contactPhone: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Số Dư Quỹ Nội Bộ (VNĐ)</label>
                      <input
                        type="number"
                        value={selectedClubDetails.fundBalance}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, fundBalance: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">URL Logo CLB</label>
                      <input
                        type="url"
                        value={selectedClubDetails.logoUrl}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, logoUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-slate-700 font-bold block mb-1">Giới Thiệu & Mô Tả Nhóm</label>
                      <textarea
                        rows={3}
                        value={selectedClubDetails.description}
                        onChange={e =>
                          setSelectedClubDetails({ ...selectedClubDetails, description: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/30 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Lưu Thay Đổi Thông Tin Nhóm</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: LỊCH SINH HOẠT CLB, THÔNG BÁO LÊN NHÓM, ĐIỂM DANH, THÊM KHÁCH NGOÀI */}
              {detailsTab === 'activities' && (
                <div className="space-y-6">
                  {/* Top Bar inside activities: Add Button & summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Quản Lý Lịch Sinh Hoạt & Giao Lưu CLB
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Lên lịch theo ngày giờ, phát thông báo lên nhóm, điểm danh VĐV và ghi nhận khách ngoài.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddActivityOpen(!isAddActivityOpen)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/30 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{isAddActivityOpen ? 'Đóng Form' : '+ Thêm Lịch Sinh Hoạt'}</span>
                    </button>
                  </div>

                  {/* INLINE FORM: THÊM LỊCH SINH HOẠT CLB */}
                  {isAddActivityOpen && (
                    <form
                      onSubmit={handleCreateActivity}
                      className="p-5 rounded-3xl bg-white border-2 border-purple-300 shadow-md space-y-4 animate-in fade-in"
                    >
                      <div className="flex items-center gap-2 font-black text-sm text-purple-900 border-b border-purple-100 pb-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>Khởi Tạo Lịch Sinh Hoạt / Buổi Tập Mới</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="sm:col-span-2">
                          <label className="text-slate-700 font-bold block mb-1">
                            Tiêu Đề Buổi Sinh Hoạt *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Sinh Hoạt CLB & Giao Lưu Cọ Xát Thứ 7"
                            value={newActivityData.title}
                            onChange={e =>
                              setNewActivityData({ ...newActivityData, title: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:bg-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-700 font-bold block mb-1">
                            Lựa Chọn Theo Lịch (Ngày) *
                          </label>
                          <input
                            type="date"
                            required
                            value={newActivityData.date}
                            onChange={e =>
                              setNewActivityData({ ...newActivityData, date: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:bg-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-700 font-bold block mb-1">Từ Giờ *</label>
                            <input
                              type="time"
                              required
                              value={newActivityData.startTime}
                              onChange={e =>
                                setNewActivityData({ ...newActivityData, startTime: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:bg-white focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-slate-700 font-bold block mb-1">Đến Giờ *</label>
                            <input
                              type="time"
                              required
                              value={newActivityData.endTime}
                              onChange={e =>
                                setNewActivityData({ ...newActivityData, endTime: e.target.value })
                              }
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:bg-white focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-700 font-bold block mb-1">
                            Sân Tập / Địa Điểm
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Sân Trung Tâm Court 3 & 4"
                            value={newActivityData.venue}
                            onChange={e =>
                              setNewActivityData({ ...newActivityData, venue: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-slate-700 font-bold block mb-1">
                            Ghi Chú / Nội Dung Tập
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Chia bảng đánh đôi, test bóng mới..."
                            value={newActivityData.description}
                            onChange={e =>
                              setNewActivityData({ ...newActivityData, description: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddActivityOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Lưu Lịch Sinh Hoạt</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* LIST OF ACTIVITIES */}
                  {(!selectedClubDetails.activities || selectedClubDetails.activities.length === 0) ? (
                    <div className="text-center py-10 px-4 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
                      <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-700">Chưa có lịch sinh hoạt nào</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Hãy nhấn nút "+ Thêm Lịch Sinh Hoạt" ở trên để tạo buổi tập, thông báo lên nhóm và điểm danh thành viên.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedClubDetails.activities.map(activity => {
                        const clubMembers = athletes.filter(a => a.clubId === selectedClubDetails.id);
                        const attendeeCount = activity.attendeeAthleteIds?.length || 0;
                        const guestsCount = activity.guests?.length || 0;
                        const totalParticipants = attendeeCount + guestsCount;

                        return (
                          <div
                            key={activity.id}
                            className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 space-y-4 hover:border-purple-300 transition-all"
                          >
                            {/* Activity Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-extrabold text-base text-slate-900">
                                    {activity.title}
                                  </h4>
                                  {activity.notified && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Đã phát thông báo
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5 flex-wrap">
                                  <span className="flex items-center gap-1 font-bold text-purple-700">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {activity.date}
                                  </span>
                                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {activity.startTime} - {activity.endTime}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-600">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                    {activity.venue}
                                  </span>
                                </div>
                                {activity.description && (
                                  <p className="text-xs text-slate-600 mt-1 italic">
                                    Ghi chú: {activity.description}
                                  </p>
                                )}
                              </div>

                              {/* Button: Thông Báo Lên Nhóm */}
                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleBroadcastActivityNotification(activity)}
                                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all"
                                  title="Phát thông báo đẩy lịch sinh hoạt tới toàn bộ thành viên nhóm"
                                >
                                  <Megaphone className="w-3.5 h-3.5" />
                                  <span>Thông Báo Lên Nhóm</span>
                                </button>
                              </div>
                            </div>

                            {/* ATTENDANCE SECTION: ĐIỂM DANH THÀNH VIÊN CLB (CLICK CHỌN) */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                  <UserCheck className="w-4 h-4 text-emerald-600" />
                                  <span>Điểm Danh Thành Viên CLB (Bấm chọn thành viên có mặt):</span>
                                </div>
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  Đã có mặt: {attendeeCount} / {clubMembers.length} thành viên
                                </span>
                              </div>

                              {clubMembers.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">
                                  Chưa có thành viên nào trong CLB để điểm danh.
                                </p>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                                  {clubMembers.map(member => {
                                    const isAttending = activity.attendeeAthleteIds?.includes(member.id);
                                    return (
                                      <div
                                        key={member.id}
                                        onClick={() => handleToggleMemberAttendance(activity.id, member.id)}
                                        className={`p-2 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 select-none ${
                                          isAttending
                                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 opacity-70 hover:opacity-100'
                                        }`}
                                      >
                                        <div className="relative flex-shrink-0">
                                          <img
                                            src={member.avatarUrl}
                                            alt={member.fullName}
                                            className="w-7 h-7 rounded-lg object-cover"
                                          />
                                          {isAttending && (
                                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-xs font-bold truncate">
                                            {member.fullName}
                                          </div>
                                          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                                            <span className="font-semibold text-purple-700">{member.rankingTier}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* GUEST SECTION: THÊM KHÁCH NGOÀI (TÊN MẶC ĐỊNH: KHÁCH 01, KHÁCH 02... HOẶC SỬA TAY) */}
                            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                                    <Users className="w-4 h-4 text-amber-600" />
                                    <span>Khách Ngoài Tham Gia Giao Lưu:</span>
                                  </div>
                                  <p className="text-[11px] text-amber-800/80 mt-0.5">
                                    Tên mặc định tự tăng dần (Khách 01, Khách 02...) hoặc bấm vào ô để sửa tên thủ công.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleAddGuest(activity.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs shadow-xs self-start sm:self-auto"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>+ Thêm Khách Ngoài</span>
                                </button>
                              </div>

                              {(!activity.guests || activity.guests.length === 0) ? (
                                <p className="text-xs text-amber-700/70 italic">
                                  Chưa có khách ngoài nào tham gia buổi sinh hoạt này.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                  {activity.guests.map((guest, idx) => (
                                    <div
                                      key={guest.id}
                                      className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs flex flex-col gap-2"
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                          <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                            #{idx + 1}
                                          </span>
                                          <input
                                            type="text"
                                            value={guest.name}
                                            onChange={e =>
                                              handleUpdateGuest(activity.id, guest.id, {
                                                name: e.target.value,
                                              })
                                            }
                                            placeholder="Tên khách ngoài..."
                                            className="font-bold text-xs text-slate-900 bg-transparent border-b border-dashed border-amber-300 focus:border-amber-500 focus:outline-none w-full"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveGuest(activity.id, guest.id)}
                                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                                          title="Xóa khách"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>

                                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                                          <input
                                            type="checkbox"
                                            checked={guest.feePaid || false}
                                            onChange={e =>
                                              handleUpdateGuest(activity.id, guest.id, {
                                                feePaid: e.target.checked,
                                              })
                                            }
                                            className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                                          />
                                          <span className={guest.feePaid ? 'text-emerald-700 font-bold' : ''}>
                                            {guest.feePaid ? 'Đã đóng phí' : 'Chưa đóng phí'}
                                          </span>
                                        </label>

                                        <input
                                          type="text"
                                          placeholder="SĐT / Ghi chú"
                                          value={guest.phone || ''}
                                          onChange={e =>
                                            handleUpdateGuest(activity.id, guest.id, {
                                              phone: e.target.value,
                                            })
                                          }
                                          className="w-24 text-[10px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Total attendance summary pill */}
                              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold text-slate-700">
                                <span>Tổng người tham gia buổi sinh hoạt:</span>
                                <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-900 font-black">
                                  {totalParticipants} người ({attendeeCount} VĐV CLB + {guestsCount} Khách Ngoài)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DANH SÁCH THÀNH VIÊN VĐV CLB (ROSTER) */}
              {detailsTab === 'roster' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        Danh Sách Vận Động Viên Chính Thức
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {athletes.filter(a => a.clubId === selectedClubDetails.id).length} vận động viên đang sinh hoạt trong câu lạc bộ này.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowRosterQuickAdd(!showRosterQuickAdd)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/30 flex-shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{showRosterQuickAdd ? 'Đóng Thêm VĐV' : '+ Thêm VĐV Từ Hệ Thống'}</span>
                    </button>
                  </div>

                  {/* QUICK ADD DRAWER */}
                  {showRosterQuickAdd && (
                    <div className="p-4 rounded-3xl bg-slate-50 border border-purple-200 space-y-3">
                      <div className="text-xs font-bold text-purple-900">
                        Chọn VĐV từ danh sách quản lý để thêm vào CLB {selectedClubDetails.name}:
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Tìm VĐV chưa vào nhóm theo tên, biệt danh..."
                          value={quickAddSearch}
                          onChange={e => setQuickAddSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {athletes
                          .filter(
                            a =>
                              a.clubId !== selectedClubDetails.id &&
                              (a.fullName.toLowerCase().includes(quickAddSearch.toLowerCase()) ||
                                a.nickname.toLowerCase().includes(quickAddSearch.toLowerCase()))
                          )
                          .map(ath => (
                            <div
                              key={ath.id}
                              className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={ath.avatarUrl}
                                  alt={ath.fullName}
                                  className="w-8 h-8 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate">
                                    {ath.fullName}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    Hạng: {ath.rankingTier} • Hiện tại: {ath.clubName || 'Tự do'}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onBatchUpdateAthletesClub) {
                                    const currentMemberIds = athletes
                                      .filter(a => a.clubId === selectedClubDetails.id)
                                      .map(a => a.id);
                                    onBatchUpdateAthletesClub(
                                      selectedClubDetails.id,
                                      selectedClubDetails.name,
                                      [...currentMemberIds, ath.id]
                                    );
                                    onTriggerNotification(
                                      'Đã thêm VĐV vào nhóm',
                                      `${ath.fullName} đã được thêm vào CLB ${selectedClubDetails.name}`,
                                      'system'
                                    );
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-[11px] flex-shrink-0"
                              >
                                + Thêm
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* MEMBER LIST */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {athletes
                      .filter(a => a.clubId === selectedClubDetails.id)
                      .map(member => (
                        <div
                          key={member.id}
                          className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={member.avatarUrl}
                              alt={member.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-purple-200 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs truncate">
                                {member.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {member.nickname ? `(${member.nickname}) • ` : ''}
                                <span className="font-bold text-purple-700">{member.rankingTier}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ELO: {member.eloRating} {member.duprRating ? `• DUPR: ${member.duprRating}` : ''}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (onBatchUpdateAthletesClub) {
                                const currentMemberIds = athletes
                                  .filter(a => a.clubId === selectedClubDetails.id && a.id !== member.id)
                                  .map(a => a.id);
                                onBatchUpdateAthletesClub(
                                  selectedClubDetails.id,
                                  selectedClubDetails.name,
                                  currentMemberIds
                                );
                                onTriggerNotification(
                                  'Đã gỡ VĐV khỏi nhóm',
                                  `${member.fullName} đã được gỡ khỏi danh sách CLB ${selectedClubDetails.name}`,
                                  'system'
                                );
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Gỡ khỏi CLB"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DUYỆT THÀNH VIÊN GIA NHẬP CLB */}
              {detailsTab === 'join_requests' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-extrabold text-purple-950 text-sm flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-purple-700" />
                        <span>Phê Duyệt Đơn Đăng Ký Gia Nhập Nhóm</span>
                      </h4>
                      <p className="text-purple-800 text-[11px] mt-0.5">
                        Thành viên khác muốn tham gia nhóm cần gửi đăng ký để Quản lý CLB phê duyệt.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-200 text-purple-900 font-extrabold text-xs whitespace-nowrap self-start sm:self-auto">
                      {(selectedClubDetails.joinRequests || []).filter(r => r.status === 'pending').length} Chờ Duyệt
                    </span>
                  </div>

                  {/* PENDING REQUESTS LIST */}
                  <div className="space-y-3">
                    <h5 className="font-extrabold text-slate-900 text-xs">
                      Danh Sách Đang Chờ Phê Duyệt
                    </h5>

                    {(selectedClubDetails.joinRequests || []).filter(r => r.status === 'pending').length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="font-bold text-slate-700">Tất cả yêu cầu đã được xử lý</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Hiện không có thành viên nào đang chờ phê duyệt vào câu lạc bộ này.
                        </p>
                      </div>
                    ) : (
                      (selectedClubDetails.joinRequests || [])
                        .filter(r => r.status === 'pending')
                        .map(req => {
                          const athlete = athletes.find(a => a.id === req.athleteId);
                          return (
                            <div
                              key={req.id}
                              className="p-4 rounded-2xl bg-white border-2 border-purple-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={
                                    athlete?.avatarUrl ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                                  }
                                  alt={req.athleteName}
                                  className="w-12 h-12 rounded-xl object-cover border border-purple-300 flex-shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-sm text-slate-900">{req.athleteName}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                                      {req.sportTier || 'VĐV'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                    <span>SĐT: {req.athletePhone || 'N/A'}</span>
                                    <span>•</span>
                                    <span className="text-slate-400 font-mono text-[11px]">{req.requestedAt}</span>
                                  </div>
                                  {req.note && (
                                    <p className="text-xs text-slate-700 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                      "{req.note}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleRejectJoinRequest(req)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs border border-slate-200 transition-colors"
                                >
                                  Từ Chối
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveJoinRequest(req)}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-transform active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Phê Duyệt Vào CLB</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>

                  {/* PROCESSED HISTORY */}
                  {(selectedClubDetails.joinRequests || []).filter(r => r.status !== 'pending').length > 0 && (
                    <div className="pt-4 border-t border-slate-200 space-y-2">
                      <h5 className="font-bold text-slate-500 text-xs">Lịch Sử Đã Xử Lý</h5>
                      <div className="space-y-1.5">
                        {(selectedClubDetails.joinRequests || [])
                          .filter(r => r.status !== 'pending')
                          .map(r => (
                            <div
                              key={r.id}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{r.athleteName}</span>
                                <span className="text-[11px] text-slate-400">({r.sportTier})</span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                  r.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {r.status === 'approved' ? '✓ Đã Phê Duyệt' : '✕ Đã Từ Chối'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BẢO MẬT NHÓM & MẬT MÃ */}
              {detailsTab === 'security' && (
                <div className="space-y-4 max-w-lg mx-auto py-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      Cơ Chế Bảo Mật Đa Lớp Nhóm
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Mỗi câu lạc bộ có mật mã riêng để ngăn chặn các thành viên khác sửa đổi trái phép quỹ, logo hoặc danh sách đội.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Trạng Thái Khóa Pass:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                        Đang bảo vệ (Active)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Mã Nhóm:</span>
                      <span className="font-mono font-bold text-purple-800">{selectedClubDetails.code}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Trưởng Nhóm Ủy Quyền:</span>
                      <span className="font-bold text-slate-900">{selectedClubDetails.leaderName}</span>
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClubDetails(null);
                        requestClubAction(selectedClubDetails, 'edit');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
                    >
                      Đổi Mật Khẩu Bảo Mật Của Nhóm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VERIFY PASSCODE TO EDIT OR DELETE GROUP */}
      {authModal.isOpen && authModal.club && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 mx-auto mb-3 shadow-sm">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 font-display">
                Xác Thực Mật Khẩu Nhóm
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Nhập mật mã bảo vệ của CLB <strong className="text-purple-700 font-bold">{authModal.club.name}</strong> để {authModal.action === 'edit' ? 'chỉnh sửa' : 'xóa'} nhóm.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                (Mật mã mẫu mặc định: <code className="text-emerald-700 font-mono font-bold">123456</code> hoặc quyền Super Admin)
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mật Mã Nhóm *</label>
                <input
                  type="password"
                  autoFocus
                  placeholder="Nhập pass nhóm..."
                  value={authPasswordInput}
                  onChange={e => {
                    setAuthPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleVerifyPasswordAndProceed();
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-center tracking-widest text-base focus:outline-none focus:border-purple-500"
                />
              </div>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAuthModal({ isOpen: false, club: null, action: null })}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPasswordAndProceed}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/30"
                >
                  Xác Thực & Mở Khóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CLUB WITH MANDATORY PASSWORD PROTECTION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-700" />
                <h3 className="text-lg font-black text-slate-900 font-display">
                  {editingClub ? 'Chỉnh Sửa Thông Tin Nhóm' : 'Thêm Nhóm & Thiết Lập Mật Khẩu Bảo Mật'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-white text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClub} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tên Câu Lạc Bộ / Nhóm *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: CLB Pickleball NESA"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Mã Viết Tắt (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: NESA-PB"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Khẩu Hiệu CLB (Slogan)</label>
                  <input
                    type="text"
                    placeholder="VD: Đam Mê Bất Tận - Tinh Thần Thể Thao"
                    value={formData.slogan}
                    onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Địa Bàn / Sân Tập Chính</label>
                  <input
                    type="text"
                    placeholder="VD: Cụm Liên Hợp P4A Center, 333 Phạm Văn Đồng"
                    value={formData.venueAddress}
                    onChange={e => setFormData({ ...formData, venueAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Trưởng Nhóm / Đại Diện *</label>
                  <input
                    type="text"
                    required
                    value={formData.leaderName}
                    onChange={e => setFormData({ ...formData, leaderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Số Điện Thoại Trưởng Nhóm *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">Mô Tả Giới Thiệu Nhóm</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả phong trào, lịch sinh hoạt..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Quỹ Khởi Điểm (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.fundBalance}
                    onChange={e => setFormData({ ...formData, fundBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">URL Logo Đại Diện</label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Protection Section */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 font-extrabold">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  <span>
                    {editingClub ? 'Đổi Mật Khẩu Nhóm (Để trống nếu giữ nguyên)' : 'Thiết Lập Mật Khẩu Bảo Mật Cho Nhóm *'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Mật mã này dùng để xác thực đa lớp, mã hóa và bảo vệ nhóm khỏi việc các thành viên hoặc nhóm đối thủ sửa đổi tùy tiện.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Mật Khẩu Mới</label>
                    <input
                      type="password"
                      placeholder="Nhập pass..."
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Xác Nhận Mật Khẩu</label>
                    <input
                      type="password"
                      placeholder="Xác nhận lại pass..."
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-purple-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-md shadow-purple-600/30"
                >
                  {editingClub ? 'Lưu Thông Tin Nhóm' : 'Tạo Nhóm & Khóa Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: JOIN CLUB REQUEST */}
      {joinClubModal.isOpen && joinClubModal.club && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Đăng Ký Gia Nhập CLB
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setJoinClubModal({ isOpen: false, club: null })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitJoinClub} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 flex items-center gap-3">
                <img
                  src={joinClubModal.club.logoUrl}
                  alt={joinClubModal.club.name}
                  className="w-12 h-12 rounded-xl object-cover border border-purple-300"
                />
                <div>
                  <div className="font-black text-sm">{joinClubModal.club.name}</div>
                  <div className="text-[11px] text-purple-700">
                    Trưởng nhóm: <strong>{joinClubModal.club.leaderName}</strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Chọn Hồ Sơ VĐV Của Bạn *
                </label>
                <select
                  value={joinAthleteId}
                  onChange={e => setJoinAthleteId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold"
                >
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.nickname || 'VĐV'}) • Hạng: {a.rankingTier} • ELO: {a.eloRating}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Lời Nhắn Gửi Quản Lý CLB (Tùy chọn)
                </label>
                <textarea
                  rows={3}
                  placeholder="Em muốn gia nhập để tập luyện định kỳ, giao lưu và thi đấu giải..."
                  value={joinNote}
                  onChange={e => setJoinNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                ℹ️ Yêu cầu của bạn sẽ được gửi tới Ban Quản lý CLB để xem xét và phê duyệt theo đúng quy định.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setJoinClubModal({ isOpen: false, club: null })}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-md shadow-purple-600/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Yêu Cầu Gia Nhập</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
