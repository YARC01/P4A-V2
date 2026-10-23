import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  FileDown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Swords,
  Shield,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle,
  X,
  Medal,
  Clock,
  UserCheck,
  Activity,
  Heart,
  Dumbbell,
  Apple,
  RefreshCw,
  Sparkles,
  Zap,
  Upload,
  RotateCcw,
  LayoutGrid,
  List,
  AlignJustify,
  Crown,
  Tag,
  Key,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Athlete, ClubGroup, MatchHistoryRecord, Achievement, User, Tournament } from '../types.ts';
import { exportAthleteProfilePDF } from '../utils/pdfExport.ts';
import { calculateAthleteHealth } from '../utils/athleteHealth.ts';
import { calculatePerformanceRatings } from '../utils/ratingEngine.ts';
import { SuperAdminPasswordModal } from './SuperAdminPasswordModal.tsx';
import { SuperAdminEloCalibrationModal } from './SuperAdminEloCalibrationModal.tsx';

interface AthletesViewProps {
  athletes: Athlete[];
  clubs: ClubGroup[];
  tournaments?: Tournament[];
  currentUser: User;
  isSuperAdminUnlocked?: boolean;
  onUnlockSuperAdmin?: () => void;
  onLockSuperAdmin?: () => void;
  onAddAthlete: (athlete: Athlete) => void;
  onUpdateAthlete: (athlete: Athlete) => void;
  onDeleteAthlete: (id: string) => void;
  onResetDefaultAthletes?: () => void;
  onTriggerNotification: (title: string, message: string, type: any) => void;
  onUpdateCurrentUser?: (user: Partial<User>) => void;
}

const PRESET_AVATARS = {
  male: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
  ],
  female: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250&auto=format&fit=crop&q=80',
  ],
};

export const renderTierBadge = (tier: string) => {
  const t = (tier || '').trim().toLowerCase();

  if (t.includes('chuyên nghiệp')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
        <Crown className="w-3 h-3 text-rose-600" />
        <span>Chuyên Nghiệp</span>
      </span>
    );
  }
  if (t.includes('bán chuyên')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs">
        <Award className="w-3 h-3 text-sky-600" />
        <span>Bán Chuyên</span>
      </span>
    );
  }
  if (t.includes('nghiệp dư')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 shadow-2xs">
        <span>Nghiệp Dư</span>
      </span>
    );
  }
  if (t.includes('phong trào') || t.includes('newbie')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
        <span>Phong Trào</span>
      </span>
    );
  }
  if (t === 'cọp' || t.includes('cọp')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-950 border border-orange-300 shadow-2xs">
        <span>🐯 Cọp</span>
      </span>
    );
  }
  if (t === 'đại bàng' || t.includes('đại bàng')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-950 border border-purple-300 shadow-2xs">
        <span>🦅 Đại Bàng</span>
      </span>
    );
  }
  if (t === 'gà' || t.includes('gà')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
        <span>🐔 Gà</span>
      </span>
    );
  }
  if (t === 'muỗi' || t.includes('muỗi')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-lime-100 text-lime-950 border border-lime-300 shadow-2xs">
        <span>🦟 Muỗi</span>
      </span>
    );
  }
  if (t === 'ruồi' || t.includes('ruồi')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-900 border border-slate-300 shadow-2xs">
        <span>🪰 Ruồi</span>
      </span>
    );
  }
  if (t === 'voi' || t.includes('voi')) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-950 border border-cyan-300 shadow-2xs">
        <span>🐘 Voi</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-2xs">
      <Tag className="w-2.5 h-2.5 text-indigo-600" />
      <span>{tier || 'Hạng Tự Đặt'}</span>
    </span>
  );
};

export const AthletesView: React.FC<AthletesViewProps> = ({
  athletes,
  clubs,
  tournaments = [],
  currentUser,
  isSuperAdminUnlocked = false,
  onUnlockSuperAdmin,
  onLockSuperAdmin,
  onAddAthlete,
  onUpdateAthlete,
  onDeleteAthlete,
  onResetDefaultAthletes,
  onTriggerNotification,
  onUpdateCurrentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedClub, setSelectedClub] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'compact'>('grid');

  // Modals
  const [viewingAthlete, setViewingAthlete] = useState<Athlete | null>(null);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'info' | 'fitness' | 'history' | 'achievements'>('info');
  const [isEloCalibrationModalOpen, setIsEloCalibrationModalOpen] = useState(false);

  // Super Admin Password Gate for Editing Other Athletes
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [pendingAthleteForAction, setPendingAthleteForAction] = useState<Athlete | null>(null);
  const [pendingActionType, setPendingActionType] = useState<'edit' | 'delete'>('edit');

  // Match History Form State
  const [showAddMatchForm, setShowAddMatchForm] = useState(false);
  const [newMatch, setNewMatch] = useState<Partial<MatchHistoryRecord>>({
    tournamentName: '',
    date: new Date().toISOString().slice(0, 10),
    discipline: 'Pickleball Đôi',
    opponentName: '',
    result: 'win',
    score: '11-7, 11-8',
    round: 'Tứ Kết',
  });

  // Achievement Form State
  const [showAddAchievementForm, setShowAddAchievementForm] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    title: '',
    tournamentName: '',
    year: 2026,
    medal: 'gold',
    discipline: 'Pickleball',
  });

  // Form State for Adding / Editing Athlete
  const [formData, setFormData] = useState<Partial<Athlete>>({
    fullName: '',
    nickname: '',
    avatarUrl: PRESET_AVATARS.male[0],
    gender: 'male',
    birthDate: '1998-05-15',
    age: 28,
    phone: '',
    email: '',
    address: '',
    identityNumber: '',
    clubId: clubs[0]?.id || '',
    clubName: clubs[0]?.name || '',
    sportType: 'Pickleball',
    rankingTier: 'Chuyên Nghiệp',
    eloRating: 1500,
    duprRating: 4.0,
    status: 'active',
    bio: '',
    heightCm: 175,
    weightKg: 70,
    dominantHand: 'Phải',
  });

  const [athleteToDelete, setAthleteToDelete] = useState<Athlete | null>(null);

  // Check if an athlete profile belongs to the currently logged-in user
  const isOwnAthleteProfile = (ath: Athlete | null | undefined): boolean => {
    if (!ath) return false;
    if (currentUser.athleteId && currentUser.athleteId === ath.id) return true;
    if (ath.email && currentUser.email && ath.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()) return true;
    if (ath.phone && currentUser.phone && ath.phone.trim() === currentUser.phone.trim()) return true;
    if (ath.fullName && currentUser.name && ath.fullName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    return false;
  };

  const myAthleteProfile = athletes.find(isOwnAthleteProfile);
  const isViewingMyProfile = viewingAthlete ? isOwnAthleteProfile(viewingAthlete) : false;

  // Quyền lực tối cao: Admin CLB hoặc Super Admin
  const isAdmin = currentUser.role === 'admin';
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Check if direct edit is currently allowed
  const canEditAthleteDirectly = (ath: Athlete): boolean => {
    if (isOwnAthleteProfile(ath)) return true;
    if (isAdmin) return true; // Supreme authority without password
    if (isSuperAdmin && isSuperAdminUnlocked) return true; // Supreme authority when unlocked
    return false;
  };

  const canManageAthletes =
    isSuperAdmin ||
    isAdmin ||
    currentUser.role === 'organizer' ||
    currentUser.role === 'coach';

  // Live health calculation for form
  const liveHealth = calculateAthleteHealth(
    Number(formData.heightCm) || 175,
    Number(formData.weightKg) || 70,
    formData.gender as any
  );

  // Filter athletes
  const filteredAthletes = athletes.filter(ath => {
    const matchesSearch =
      ath.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ath.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ath.phone.includes(searchTerm) ||
      ath.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ath.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSport = selectedSport === 'all' || ath.sportType === selectedSport;
    const matchesClub = selectedClub === 'all' || ath.clubId === selectedClub;
    const matchesGender = selectedGender === 'all' || ath.gender === selectedGender;
    return matchesSearch && matchesSport && matchesClub && matchesGender;
  });

  const handleBirthDateChange = (dateStr: string) => {
    const birthYear = new Date(dateStr).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = Math.max(10, currentYear - birthYear);
    setFormData(prev => ({
      ...prev,
      birthDate: dateStr,
      age: calculatedAge,
    }));
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            avatarUrl: event.target!.result as string,
          }));
          onTriggerNotification(
            'Đã tải ảnh đại diện thành công',
            'Ảnh đại diện VĐV đã được tải lên trực tiếp và sẵn sàng lưu vào hồ sơ.',
            'tournament'
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = (gender: 'male' | 'female' = 'male', prefillUser: boolean = false) => {
    setFormData({
      fullName: prefillUser ? currentUser.name : '',
      nickname: '',
      avatarUrl: gender === 'female' ? PRESET_AVATARS.female[0] : PRESET_AVATARS.male[0],
      gender,
      birthDate: '1998-06-20',
      age: 28,
      phone: prefillUser ? (currentUser.phone || '') : '',
      email: prefillUser ? (currentUser.email || '') : '',
      address: '',
      identityNumber: '',
      clubId: clubs[0]?.id || '',
      clubName: clubs[0]?.name || '',
      sportType: 'Pickleball',
      rankingTier: 'Phong Trào',
      eloRating: 1500,
      duprRating: 4.0,
      status: 'active',
      bio: prefillUser ? `Vận động viên ${currentUser.name}` : '',
      heightCm: gender === 'female' ? 165 : 175,
      weightKg: gender === 'female' ? 55 : 70,
      dominantHand: 'Phải',
    });
    setEditingAthlete(null);
    setIsAddModalOpen(true);
  };

  // Open edit modal directly
  const openAthleteEditModal = (ath: Athlete) => {
    setFormData(ath);
    setEditingAthlete(ath);
    setIsAddModalOpen(true);
  };

  // User click "Sửa": checks permission and triggers Super Admin password gate if locked
  const handleRequestEdit = (ath: Athlete) => {
    if (isOwnAthleteProfile(ath)) {
      openAthleteEditModal(ath);
      return;
    }
    if (isAdmin) {
      openAthleteEditModal(ath);
      return;
    }
    if (isSuperAdmin) {
      if (isSuperAdminUnlocked) {
        openAthleteEditModal(ath);
      } else {
        setPendingAthleteForAction(ath);
        setPendingActionType('edit');
        setIsPassModalOpen(true);
      }
      return;
    }
    // Regular users cannot edit other athletes
    onTriggerNotification(
      'Không có quyền chỉnh sửa',
      `Tài khoản của bạn chỉ có quyền chỉnh sửa hồ sơ VĐV của chính mình. Chỉ Super Admin hoặc Admin mới có quyền can thiệp vào hồ sơ VĐV khác.`,
      'tournament'
    );
  };

  // User click "Xóa": checks permission and triggers Super Admin password gate if locked
  const handleRequestDelete = (ath: Athlete) => {
    if (isOwnAthleteProfile(ath) || isAdmin) {
      setAthleteToDelete(ath);
      return;
    }
    if (isSuperAdmin) {
      if (isSuperAdminUnlocked) {
        setAthleteToDelete(ath);
      } else {
        setPendingAthleteForAction(ath);
        setPendingActionType('delete');
        setIsPassModalOpen(true);
      }
      return;
    }
    onTriggerNotification(
      'Không có quyền xóa',
      'Bạn chỉ có thể xóa hồ sơ của chính mình hoặc cần quyền Admin / Super Admin để xóa.',
      'tournament'
    );
  };

  // Super Admin Password Unlock Success Callback
  const handleSuperAdminPassSuccess = () => {
    setIsPassModalOpen(false);
    if (onUnlockSuperAdmin) {
      onUnlockSuperAdmin();
    }
    if (pendingAthleteForAction) {
      if (pendingActionType === 'edit') {
        openAthleteEditModal(pendingAthleteForAction);
      } else if (pendingActionType === 'delete') {
        setAthleteToDelete(pendingAthleteForAction);
      }
      setPendingAthleteForAction(null);
    }
  };

  // Duplicate / Clone Athlete
  const handleDuplicateAthlete = (ath: Athlete) => {
    const isAllowed = isOwnAthleteProfile(ath) || isAdmin || (isSuperAdmin && isSuperAdminUnlocked);
    if (!isAllowed) {
      if (isSuperAdmin && !isSuperAdminUnlocked) {
        setPendingAthleteForAction(ath);
        setPendingActionType('edit');
        setIsPassModalOpen(true);
        return;
      }
      onTriggerNotification(
        'Không có quyền thao tác',
        `Bạn chỉ có quyền nhân bản hồ sơ vận động viên của chính mình!`,
        'tournament'
      );
      return;
    }
    const cloned: Athlete = {
      ...ath,
      id: `ath-${Date.now()}`,
      fullName: `${ath.fullName} (Bản Sao)`,
      nickname: `${ath.nickname} 2`,
      email: `copy_${Date.now().toString().slice(-4)}_${ath.email}`,
      phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      careerHistory: [...ath.careerHistory],
      achievements: [...ath.achievements],
    };
    onAddAthlete(cloned);
    onTriggerNotification(
      'Đã nhân bản VĐV',
      `Tạo thành công bản sao vận động viên "${cloned.fullName}".`,
      'tournament'
    );
  };

  // Re-sync ratings from match and achievements
  const handleRecalculateRatings = (ath: Athlete) => {
    const isAllowed = isOwnAthleteProfile(ath) || isAdmin || (isSuperAdmin && isSuperAdminUnlocked);
    if (!isAllowed) {
      if (isSuperAdmin && !isSuperAdminUnlocked) {
        setPendingAthleteForAction(ath);
        setPendingActionType('edit');
        setIsPassModalOpen(true);
        return;
      }
      onTriggerNotification(
        'Không có quyền tính toán lại',
        `Chỉ chủ sở hữu, Admin hoặc Super Admin mới được cập nhật lại điểm Elo/DUPR cho VĐV này.`,
        'tournament'
      );
      return;
    }
    const ratings = calculatePerformanceRatings(
      ath.careerHistory,
      ath.achievements,
      1400,
      3.5
    );
    const updated: Athlete = {
      ...ath,
      eloRating: ratings.eloRating,
      duprRating: ratings.duprRating,
    };
    onUpdateAthlete(updated);
    if (viewingAthlete?.id === updated.id) {
      setViewingAthlete(updated);
    }
    onTriggerNotification(
      '⚡ Đã cập nhật Elo & DUPR',
      `${ath.fullName}: Elo mới ${ratings.eloRating} | DUPR ${ratings.duprRating} (Thắng ${ratings.totalMatchesWon}/${ath.careerHistory.length} trận).`,
      'tournament'
    );
  };

  const handleSaveAthlete = (e?: React.FormEvent, lockAfterSave: boolean = false) => {
    if (e) e.preventDefault();
    const effectiveName = formData.fullName?.trim() || `Vận Động Viên #${athletes.length + 1}`;
    const club = clubs.find(c => c.id === formData.clubId);

    if (editingAthlete) {
      const isOwn = isOwnAthleteProfile(editingAthlete);
      const isAllowed = isOwn || isAdmin || (isSuperAdmin && isSuperAdminUnlocked);

      if (!isAllowed) {
        onTriggerNotification(
          'Không có quyền chỉnh sửa',
          'Tài khoản đăng nhập chỉ được phép chỉnh sửa hồ sơ VĐV của chính mình, trừ khi là Admin hoặc Super Admin đã mở khóa!',
          'tournament'
        );
        return;
      }

      // Recompute rating if career history exists
      const ratings = calculatePerformanceRatings(
        editingAthlete.careerHistory,
        editingAthlete.achievements,
        Number(formData.eloRating) || 1400,
        Number(formData.duprRating) || 3.5
      );

      const updated: Athlete = {
        ...editingAthlete,
        ...(formData as Athlete),
        fullName: effectiveName,
        eloRating: ratings.eloRating,
        duprRating: ratings.duprRating,
        clubName: club?.name || formData.clubName || 'CLB Tự Do',
      };
      onUpdateAthlete(updated);
      if (viewingAthlete?.id === updated.id) {
        setViewingAthlete(updated);
      }

      // Only synchronize with currentUser if this athlete profile is the current user's OWN profile!
      if (isOwn && onUpdateCurrentUser) {
        onUpdateCurrentUser({
          name: updated.fullName,
          email: updated.email,
          phone: updated.phone,
          avatar: updated.avatarUrl,
        });
      }

      setIsAddModalOpen(false);
      setEditingAthlete(null);

      // Lock Super Admin back if requested
      if (lockAfterSave && onLockSuperAdmin) {
        onLockSuperAdmin();
      }

      onTriggerNotification(
        'Hồ sơ VĐV đã cập nhật',
        isOwn
          ? `Thông tin vận động viên ${updated.fullName} đã được đồng bộ với tài khoản đăng nhập thành công.`
          : `Quyền tối cao: Đã lưu can thiệp hồ sơ VĐV ${updated.fullName} thành công!${lockAfterSave ? ' (Đã khóa lại Super Admin)' : ''}`,
        'tournament'
      );
    } else {
      const newAthlete: Athlete = {
        id: `ath-${Date.now()}`,
        fullName: effectiveName,
        nickname: formData.nickname?.trim() || '',
        avatarUrl: formData.avatarUrl || PRESET_AVATARS.male[0],
        gender: formData.gender || 'male',
        birthDate: formData.birthDate || '1998-01-01',
        age: formData.age || 28,
        phone: formData.phone?.trim() || '',
        email: formData.email?.trim() || '',
        address: formData.address?.trim() || '',
        identityNumber: formData.identityNumber?.trim() || '',
        clubId: formData.clubId || clubs[0]?.id || '',
        clubName: club?.name || 'CLB Tự Do',
        sportType: formData.sportType || 'Pickleball',
        rankingTier: formData.rankingTier || 'Chuyên Nghiệp',
        eloRating: Number(formData.eloRating) || 1500,
        duprRating: Number(formData.duprRating) || 4.0,
        status: 'active',
        bio: formData.bio || '',
        heightCm: Number(formData.heightCm) || 175,
        weightKg: Number(formData.weightKg) || 70,
        dominantHand: formData.dominantHand || 'Phải',
        careerHistory: [],
        achievements: [],
      };
      onAddAthlete(newAthlete);
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser({
          name: newAthlete.fullName,
          email: newAthlete.email,
          phone: newAthlete.phone,
          avatar: newAthlete.avatarUrl,
          athleteId: newAthlete.id,
        });
      }
      onTriggerNotification(
        'Thêm VĐV mới thành công',
        `Đã tạo hồ sơ vận động viên ${newAthlete.fullName} gắn kết với tài khoản của bạn.`,
        'tournament'
      );
    }
    setIsAddModalOpen(false);
  };

  // Add Match History with automatic Elo & DUPR increment
  const handleAddMatchHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingAthlete || !newMatch.tournamentName || !newMatch.opponentName) return;
    const isAllowed = isOwnAthleteProfile(viewingAthlete) || isAdmin || (isSuperAdmin && isSuperAdminUnlocked);
    if (!isAllowed) {
      if (isSuperAdmin && !isSuperAdminUnlocked) {
        setPendingAthleteForAction(viewingAthlete);
        setPendingActionType('edit');
        setIsPassModalOpen(true);
        return;
      }
      onTriggerNotification(
        'Không có quyền',
        'Bạn chỉ có thể ghi nhận trận đấu cho hồ sơ của chính mình (hoặc cần quyền Admin / Super Admin đã mở khóa)!',
        'tournament'
      );
      return;
    }

    const record: MatchHistoryRecord = {
      id: `h-${Date.now()}`,
      tournamentName: newMatch.tournamentName || '',
      date: newMatch.date || new Date().toISOString().slice(0, 10),
      discipline: newMatch.discipline || 'Pickleball Đôi',
      opponentName: newMatch.opponentName || '',
      result: (newMatch.result as 'win' | 'loss') || 'win',
      score: newMatch.score || '11-8',
      round: newMatch.round || 'Vòng 1',
      stage: 'Knockout',
    };

    const newHistory = [record, ...viewingAthlete.careerHistory];
    const newRatings = calculatePerformanceRatings(
      newHistory,
      viewingAthlete.achievements,
      1400,
      3.5
    );

    const updated: Athlete = {
      ...viewingAthlete,
      careerHistory: newHistory,
      eloRating: newRatings.eloRating,
      duprRating: newRatings.duprRating,
    };

    onUpdateAthlete(updated);
    setViewingAthlete(updated);
    setShowAddMatchForm(false);
    setNewMatch({
      tournamentName: '',
      date: new Date().toISOString().slice(0, 10),
      discipline: 'Pickleball Đôi',
      opponentName: '',
      result: 'win',
      score: '11-7, 11-8',
      round: 'Tứ Kết',
    });

    onTriggerNotification(
      '🏆 Trận đấu ghi nhận & Cập nhật thứ hạng',
      `Điểm Elo của ${updated.fullName} cập nhật: ${newRatings.eloRating} (DUPR: ${newRatings.duprRating}).`,
      'tournament'
    );
  };

  // Add Achievement with automatic Elo & DUPR boost
  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingAthlete || !newAchievement.title) return;
    const isAllowed = isOwnAthleteProfile(viewingAthlete) || isAdmin || (isSuperAdmin && isSuperAdminUnlocked);
    if (!isAllowed) {
      if (isSuperAdmin && !isSuperAdminUnlocked) {
        setPendingAthleteForAction(viewingAthlete);
        setPendingActionType('edit');
        setIsPassModalOpen(true);
        return;
      }
      onTriggerNotification(
        'Không có quyền',
        'Bạn chỉ có thể thêm thành tích cho hồ sơ của chính mình (hoặc cần quyền Admin / Super Admin đã mở khóa)!',
        'tournament'
      );
      return;
    }

    const ach: Achievement = {
      id: `ach-${Date.now()}`,
      title: newAchievement.title || '',
      tournamentName: newAchievement.tournamentName || 'Giải Mở Rộng PICKLE 4 ALL',
      year: Number(newAchievement.year) || 2026,
      medal: (newAchievement.medal as 'gold' | 'silver' | 'bronze' | 'mvp') || 'gold',
      discipline: newAchievement.discipline || viewingAthlete.sportType,
    };

    const newAchievements = [ach, ...viewingAthlete.achievements];
    const newRatings = calculatePerformanceRatings(
      viewingAthlete.careerHistory,
      newAchievements,
      1400,
      3.5
    );

    const updated: Athlete = {
      ...viewingAthlete,
      achievements: newAchievements,
      eloRating: newRatings.eloRating,
      duprRating: newRatings.duprRating,
    };

    onUpdateAthlete(updated);
    setViewingAthlete(updated);
    setShowAddAchievementForm(false);
    setNewAchievement({
      title: '',
      tournamentName: '',
      year: 2026,
      medal: 'gold',
      discipline: 'Pickleball',
    });

    onTriggerNotification(
      '🎉 Vinh danh thành tích & Tăng Elo/DUPR',
      `${updated.fullName} nhận danh hiệu "${ach.title}": Elo +${newRatings.eloBreakdown.fromMedals} pts!`,
      'tournament'
    );
  };

  const viewingAthleteHealth = viewingAthlete
    ? calculateAthleteHealth(
        viewingAthlete.heightCm || 175,
        viewingAthlete.weightKg || 70,
        viewingAthlete.gender
      )
    : null;

  // Render Edit button based on role & permissions
  const renderAthleteEditButton = (ath: Athlete, size: 'normal' | 'table' | 'compact' = 'normal') => {
    const isOwn = isOwnAthleteProfile(ath);
    if (isOwn) {
      if (size === 'compact') {
        return (
          <button
            type="button"
            onClick={() => handleRequestEdit(ath)}
            className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition-all hover:scale-105 active:scale-95"
            title="Sửa hồ sơ VĐV của bạn"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        );
      }
      return (
        <button
          type="button"
          onClick={() => handleRequestEdit(ath)}
          className={`rounded-xl font-black flex items-center gap-1 shadow-xs transition-all hover:scale-105 active:scale-95 bg-amber-500 hover:bg-amber-600 text-white ${
            size === 'table' ? 'px-2.5 py-1 text-[11px]' : 'py-1.5 px-3 text-xs'
          }`}
          title="Chỉnh sửa hồ sơ của bạn"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Sửa Hồ Sơ</span>
        </button>
      );
    }

    if (isAdmin) {
      if (size === 'compact') {
        return (
          <button
            type="button"
            onClick={() => handleRequestEdit(ath)}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all hover:scale-105 active:scale-95"
            title="Sửa (Quyền Admin tối cao)"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        );
      }
      return (
        <button
          type="button"
          onClick={() => handleRequestEdit(ath)}
          className={`rounded-xl font-black flex items-center gap-1 shadow-xs transition-all hover:scale-105 active:scale-95 bg-blue-600 hover:bg-blue-700 text-white ${
            size === 'table' ? 'px-2.5 py-1 text-[11px]' : 'py-1.5 px-3 text-xs'
          }`}
          title="Can thiệp & chỉnh sửa với quyền Admin tối cao"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Sửa (Admin)</span>
        </button>
      );
    }

    if (isSuperAdmin) {
      if (size === 'compact') {
        return (
          <button
            type="button"
            onClick={() => handleRequestEdit(ath)}
            className={`p-1.5 rounded-lg shadow-2xs transition-all hover:scale-105 active:scale-95 ${
              isSuperAdminUnlocked
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-amber-300 border border-amber-400/40'
            }`}
            title={
              isSuperAdminUnlocked
                ? 'Sửa (Super Admin đã mở khóa)'
                : 'Cần mật khẩu Super Admin để sửa'
            }
          >
            {isSuperAdminUnlocked ? (
              <Unlock className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        );
      }
      return (
        <button
          type="button"
          onClick={() => handleRequestEdit(ath)}
          className={`rounded-xl font-black flex items-center gap-1 shadow-xs transition-all hover:scale-105 active:scale-95 ${
            size === 'table' ? 'px-2.5 py-1 text-[11px]' : 'py-1.5 px-3 text-xs'
          } ${
            isSuperAdminUnlocked
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40'
          }`}
          title={
            isSuperAdminUnlocked
              ? 'Can thiệp chỉnh sửa hồ sơ VĐV (Super Admin tối cao)'
              : 'Cần nhập mật khẩu Super Admin (123456) để mở khóa chỉnh sửa'
          }
        >
          {isSuperAdminUnlocked ? (
            <>
              <Unlock className="w-3.5 h-3.5" />
              <span>Sửa (Super Admin)</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sửa (Cần Pass)</span>
            </>
          )}
        </button>
      );
    }

    if (size === 'compact') return null;

    return (
      <span
        className={`rounded-xl bg-slate-100 text-slate-400 font-bold border border-slate-200 ${
          size === 'table' ? 'text-[10px] px-2 py-1' : 'py-1.5 px-2.5 text-[11px]'
        }`}
        title="Chỉ chủ tài khoản mới được chỉnh sửa hồ sơ này"
      >
        Chỉ xem
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Quản Lý Vận Động Viên & Hồ Sơ Điện Tử
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Điểm ELO và DUPR cập nhật tự động theo thành tích. Tự động tính toán cân nặng chuẩn, BMI, đưa ra giáo án dinh dưỡng & tập luyện chuyên sâu. Phân biệt màu sắc sinh động Nam (Xanh Biển) - Nữ (Hồng Phấn).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onResetDefaultAthletes && canManageAthletes && (
            <button
              type="button"
              onClick={onResetDefaultAthletes}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-all hover:scale-105 active:scale-95"
              title="Khôi phục danh sách VĐV mẫu ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi Phục Mẫu</span>
            </button>
          )}

          {/* Button for current user to edit or create their own athlete profile */}
          {myAthleteProfile ? (
            <button
              type="button"
              onClick={() => handleRequestEdit(myAthleteProfile)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95"
              title="Chỉnh sửa hồ sơ vận động viên của chính bạn"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Sửa Hồ Sơ Của Tôi</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenAddModal('male', true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95"
              title="Tạo hồ sơ vận động viên của chính bạn"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tạo Hồ Sơ VĐV Của Tôi</span>
            </button>
          )}

          {canManageAthletes && (
            <>
              <button
                type="button"
                onClick={() => handleOpenAddModal('male', false)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Thêm Nam</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddModal('female', false)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Thêm Nữ</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUPER ADMIN STATUS BANNER - BẢO MẬT & MỞ KHÓA / KHÓA LẠI KHI SỬA XONG */}
      {currentUser.role === 'super_admin' && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-all ${
            isSuperAdminUnlocked
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-300 shadow-amber-500/10'
              : 'bg-slate-900 text-white border-amber-500/40 shadow-slate-900/10'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                isSuperAdminUnlocked
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
              }`}
            >
              {isSuperAdminUnlocked ? (
                <Unlock className="w-6 h-6 animate-pulse" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-black text-sm sm:text-base tracking-tight">
                  {isSuperAdminUnlocked
                    ? '🔓 QUYỀN LỰC TỐI CAO SUPER ADMIN: ĐÃ MỞ KHÓA'
                    : '🔒 CHẾ ĐỘ BẢO VỆ SUPER ADMIN: ĐANG KHÓA'}
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    isSuperAdminUnlocked
                      ? 'bg-white text-amber-900'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {isSuperAdminUnlocked ? 'Toàn Quyền Can Thiệp' : 'Bảo Vệ An Toàn'}
                </span>
              </div>
              <p className="text-xs mt-1 opacity-90 max-w-2xl">
                {isSuperAdminUnlocked
                  ? 'Bạn đang có toàn quyền can thiệp, chỉnh sửa, xóa và cập nhật mọi hồ sơ VĐV trong hệ thống. Hãy nhấp "Khóa lại khi sửa xong" sau khi hoàn tất.'
                  : 'Tài khoản Super Admin chỉ thực hiện can thiệp vào hồ sơ VĐV khác khi nhập mật khẩu để mở khóa. Nhấp "Mở Khóa Super Admin" hoặc nhấp Sửa vào bất kỳ hồ sơ nào.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center flex-shrink-0">
            {/* Super Admin Confidential Elo & DUPR Calibration Tool Button */}
            <button
              type="button"
              onClick={() => {
                if (!isSuperAdminUnlocked) {
                  setPendingAthleteForAction(null);
                  setIsPassModalOpen(true);
                } else {
                  setIsEloCalibrationModalOpen(true);
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 border border-amber-300"
              title="Phân tích số liệu thi đấu và tự động đề xuất, điều chỉnh điểm Elo/DUPR toàn thể VĐV (Bảo mật nội bộ)"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 stroke-none" />
              <span>Hiệu Chỉnh Elo & DUPR Nội Bộ</span>
            </button>

            {isSuperAdminUnlocked ? (
              <button
                type="button"
                onClick={onLockSuperAdmin}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 border border-amber-400/40"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Khóa Lại Khi Sửa Xong</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPendingAthleteForAction(null);
                  setIsPassModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 border border-amber-300"
              >
                <Key className="w-4 h-4" />
                <span>🔑 Mở Khóa Super Admin</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ADMIN STATUS BANNER */}
      {currentUser.role === 'admin' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-400/30 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>🛡️ QUYỀN LỰC TỐI CAO ADMIN (BAN QUẢN TRỊ CLB)</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold">
                  TOÀN QUYỀN CAN THIỆP
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Bạn có toàn quyền chỉnh sửa thông tin, điểm số Elo/DUPR, chuyển CLB và can thiệp hồ sơ của mọi vận động viên.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Dedicated Logged-In User Athlete Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={myAthleteProfile?.avatarUrl || currentUser.avatar}
                alt={myAthleteProfile?.fullName || currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 uppercase shadow-xs">
                Bạn
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  👑 Hồ Sơ Vận Động Viên Của Bạn
                </span>
                {myAthleteProfile && renderTierBadge(myAthleteProfile.rankingTier)}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2 font-display">
                {myAthleteProfile?.fullName || currentUser.name}
                {myAthleteProfile?.nickname && (
                  <span className="text-emerald-300 text-sm font-semibold">"{myAthleteProfile.nickname}"</span>
                )}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                <span>📧 {myAthleteProfile?.email || currentUser.email}</span>
                <span>📞 {myAthleteProfile?.phone || currentUser.phone || 'Chưa cập nhật SĐT'}</span>
                <span>CLB: <strong className="text-emerald-200">{myAthleteProfile?.clubName || 'Tự do'}</strong></span>
                {myAthleteProfile && (
                  <span className="text-emerald-300 font-mono font-bold">
                    Elo: {myAthleteProfile.eloRating} {myAthleteProfile.duprRating ? `• DUPR: ${myAthleteProfile.duprRating.toFixed(2)}` : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300/80 mt-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>
                  Thông tin đăng nhập liên kết trực tiếp với hồ sơ này. <strong>Bạn chỉ có quyền chỉnh sửa hồ sơ của chính mình</strong>, các VĐV khác chỉ được xem & xuất PDF.
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {myAthleteProfile ? (
              <>
                <button
                  type="button"
                  onClick={() => handleRequestEdit(myAthleteProfile)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Chỉnh Sửa Hồ Sơ Của Tôi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewingAthlete(myAthleteProfile);
                    setModalTab('info');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all hover:scale-105"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Xem Chi Tiết & Thể Lực</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportAthleteProfilePDF(myAthleteProfile)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-105"
                  title="Xuất file PDF hồ sơ của bạn"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenAddModal('male', true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Hoàn Tất Hồ Sơ VĐV Của Tôi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Visual Gender Filter & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedGender('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              selectedGender === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>Tất Cả ({athletes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedGender('male')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              selectedGender === 'male'
                ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-300'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300'
            }`}
          >
            <span>♂ VĐV Nam (Xanh) ({athletes.filter(a => a.gender === 'male').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedGender('female')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              selectedGender === 'female'
                ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            <span>♀ VĐV Nữ (Hồng) ({athletes.filter(a => a.gender === 'female').length})</span>
          </button>
        </div>

        {/* View Mode Toggle: Grid / Table / Compact */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start md:self-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase px-2 hidden sm:inline">
            Hiển thị:
          </span>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Dạng thẻ lưới trực quan"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dạng Lưới</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Dạng danh sách bảng"
          >
            <List className="w-3.5 h-3.5" />
            <span>Danh Sách</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('compact')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'compact'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Dạng thu gọn siêu nhanh"
          >
            <AlignJustify className="w-3.5 h-3.5" />
            <span>Thu Gọn</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, nickname, SĐT, email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Gender */}
        <div>
          <select
            value={selectedGender}
            onChange={e => setSelectedGender(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả giới tính (Nam & Nữ)</option>
            <option value="male">♂ Chỉ VĐV Nam (Nền Xanh)</option>
            <option value="female">♀ Chỉ VĐV Nữ (Nền Hồng)</option>
          </select>
        </div>

        {/* Filter Sport */}
        <div>
          <select
            value={selectedSport}
            onChange={e => setSelectedSport(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả môn thể thao</option>
            <option value="Pickleball">Pickleball</option>
            <option value="Billiards">Bida (Carom/Pool)</option>
            <option value="Cầu Lông">Cầu Lông</option>
            <option value="Tennis">Tennis</option>
            <option value="Bóng Đá">Bóng Đá</option>
          </select>
        </div>

        {/* Filter Club */}
        <div>
          <select
            value={selectedClub}
            onChange={e => setSelectedClub(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả câu lạc bộ</option>
            {clubs.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW MODE 1: CARDS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAthletes.map(ath => {
            const isFemale = ath.gender === 'female';
            const cardTheme = isFemale
              ? 'bg-gradient-to-br from-rose-50/95 via-pink-50/70 to-white border-2 border-rose-300 text-slate-900 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-100/80'
              : 'bg-gradient-to-br from-sky-50/95 via-blue-50/70 to-white border-2 border-sky-300 text-slate-900 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-100/80';

            const genderBadge = isFemale
              ? 'bg-rose-600 text-white border-white shadow-xs'
              : 'bg-sky-600 text-white border-white shadow-xs';

            const avatarBorder = isFemale ? 'border-rose-400' : 'border-sky-400';

            return (
              <div
                key={ath.id}
                className={`group rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
                  isOwnAthleteProfile(ath) ? 'ring-2 ring-emerald-500 shadow-md ' : ''
                }${cardTheme}`}
              >
                {/* Own Profile Indicator */}
                {isOwnAthleteProfile(ath) && (
                  <div className="mb-3 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-between shadow-2xs">
                    <span className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      <span>👑 Hồ Sơ VĐV Của Bạn</span>
                    </span>
                    <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-md font-bold">Đang Đăng Nhập</span>
                  </div>
                )}

                {/* Top Card Info */}
                <div>
                  <div className="flex items-start gap-3.5">
                    <div className="relative flex-shrink-0">
                      <img
                        src={ath.avatarUrl}
                        alt={ath.fullName}
                        className={`w-16 h-16 rounded-2xl object-cover border-2 shadow-sm ${avatarBorder}`}
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-black border ${genderBadge}`}
                      >
                        {isFemale ? '♀ Nữ' : '♂ Nam'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-base text-slate-900 truncate">
                          {ath.fullName}
                        </span>
                        {renderTierBadge(ath.rankingTier)}
                      </div>

                      <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mt-0.5">
                        <span className={isFemale ? 'text-rose-600' : 'text-sky-700'}>
                          "{ath.nickname || 'N/A'}"
                        </span>
                        <span>•</span>
                        <span className="truncate">{ath.clubName}</span>
                      </div>

                      {/* Elo & DUPR live metrics */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-lg bg-white text-sky-800 font-extrabold border border-sky-200 shadow-2xs flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          Elo: {ath.eloRating}
                        </span>
                        {ath.duprRating && (
                          <span className="px-2 py-0.5 rounded-lg bg-white text-emerald-800 font-extrabold border border-emerald-200 shadow-2xs">
                            DUPR: {ath.duprRating.toFixed(2)}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          {ath.sportType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Anthropometrics & Hand */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white/90 border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Chiều Cao</div>
                      <div className="font-extrabold text-slate-900">{ath.heightCm || 175} cm</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/90 border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Cân Nặng</div>
                      <div className="font-extrabold text-slate-900">{ath.weightKg || 70} kg</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/90 border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Tay Thuận</div>
                      <div className="font-extrabold text-emerald-700">{ath.dominantHand || 'Phải'}</div>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>
                        Sinh: <strong className="text-slate-900">{ath.birthDate}</strong> ({ath.age} tuổi)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-800 font-mono font-medium">{ath.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate text-slate-600">{ath.email}</span>
                    </div>
                  </div>

                  {/* Career record counts */}
                  <div className="mt-3 flex items-center justify-between text-xs px-2 py-1.5 rounded-xl bg-white border border-slate-200">
                    <span className="font-bold text-slate-700">
                      Trận: <strong className="text-emerald-700">{ath.careerHistory?.length || 0}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-bold text-slate-700">
                      Huy chương: <strong className="text-amber-600">{ath.achievements?.length || 0}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRecalculateRatings(ath)}
                      title="Cập nhật tự động điểm Elo & DUPR theo thành tích"
                      className="p-1 text-slate-400 hover:text-emerald-600"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200/90 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingAthlete(ath);
                      setModalTab('info');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Hồ Sơ & Thể Lực</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportAthleteProfilePDF(ath)}
                    className="py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs flex items-center gap-1 transition-all"
                    title="Xuất file PDF hồ sơ vận động viên"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>

                  {renderAthleteEditButton(ath, 'normal')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABLE LIST VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vận Động Viên</th>
                  <th className="py-3 px-3">Giới Tính</th>
                  <th className="py-3 px-3">CLB & Môn</th>
                  <th className="py-3 px-3">Hạng Đấu</th>
                  <th className="py-3 px-3 text-center">Elo / DUPR</th>
                  <th className="py-3 px-3 text-center">Thể Lực</th>
                  <th className="py-3 px-3">Liên Hệ</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAthletes.map(ath => {
                  const isFemale = ath.gender === 'female';
                  return (
                    <tr
                      key={ath.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isFemale ? 'hover:bg-rose-50/40' : 'hover:bg-sky-50/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ath.avatarUrl}
                            alt={ath.fullName}
                            className={`w-10 h-10 rounded-xl object-cover border-2 shadow-2xs flex-shrink-0 ${
                              isFemale ? 'border-rose-300' : 'border-sky-300'
                            }`}
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{ath.fullName}</span>
                              {isOwnAthleteProfile(ath) && (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  👑 Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              "{ath.nickname || 'N/A'}"
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                            isFemale
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-sky-100 text-sky-800 border-sky-300'
                          }`}
                        >
                          {isFemale ? '♀ Nữ' : '♂ Nam'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{ath.clubName}</div>
                        <div className="text-[10px] text-slate-500">{ath.sportType}</div>
                      </td>

                      <td className="py-3 px-3">
                        {renderTierBadge(ath.rankingTier)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="font-extrabold text-sky-800 font-mono">
                          Elo: {ath.eloRating}
                        </div>
                        {ath.duprRating && (
                          <div className="text-[10px] text-emerald-700 font-bold font-mono">
                            DUPR: {ath.duprRating.toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center text-[11px] text-slate-600">
                        <div>{ath.heightCm || 175}cm • {ath.weightKg || 70}kg</div>
                        <div className="text-[10px] text-slate-400">Tay {ath.dominantHand || 'Phải'}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                        <div>{ath.phone || '—'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{ath.email}</div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setViewingAthlete(ath);
                              setModalTab('info');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800"
                          >
                            Hồ Sơ
                          </button>
                          <button
                            type="button"
                            onClick={() => exportAthleteProfilePDF(ath)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            title="Xuất PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          {renderAthleteEditButton(ath, 'table')}
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

      {/* VIEW MODE 3: COMPACT CARDS VIEW (THU GỌN) */}
      {viewMode === 'compact' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAthletes.map(ath => {
            const isFemale = ath.gender === 'female';
            return (
              <div
                key={ath.id}
                className={`p-3 rounded-2xl border transition-all shadow-2xs hover:shadow-md flex items-center justify-between gap-3 ${
                  isFemale
                    ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                    : 'bg-sky-50/50 border-sky-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={ath.avatarUrl}
                    alt={ath.fullName}
                    className={`w-10 h-10 rounded-xl object-cover border flex-shrink-0 ${
                      isFemale ? 'border-rose-300' : 'border-sky-300'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1">
                      <span>{ath.fullName}</span>
                      <span className={`text-[9px] font-black ${isFemale ? 'text-rose-600' : 'text-sky-600'}`}>
                        {isFemale ? '♀' : '♂'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{ath.clubName}</div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {renderTierBadge(ath.rankingTier)}
                      <span className="text-[10px] font-mono font-bold text-emerald-700">
                        Elo: {ath.eloRating}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setViewingAthlete(ath);
                      setModalTab('info');
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                    title="Xem chi tiết"
                  >
                    <Users className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => exportAthleteProfilePDF(ath)}
                    className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    title="Xuất PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                  {renderAthleteEditButton(ath, 'compact')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredAthletes.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Không tìm thấy vận động viên phù hợp</h4>
          <p className="text-xs text-slate-500 mt-1">
            Hãy thử tìm kiếm với từ khóa khác hoặc bấm "+ Thêm VĐV Nam / Nữ" ở phía trên.
          </p>
        </div>
      )}

      {/* DETAIL MODAL: ATHLETE DOSSIER, NUTRITION, FITNESS & WORKOUT PLAN */}
      {viewingAthlete && viewingAthleteHealth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div
              className={`p-6 border-b flex items-start justify-between ${
                viewingAthlete.gender === 'female'
                  ? 'bg-gradient-to-r from-rose-50 via-pink-50 to-white border-rose-200'
                  : 'bg-gradient-to-r from-sky-50 via-blue-50 to-white border-sky-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={viewingAthlete.avatarUrl}
                  alt={viewingAthlete.fullName}
                  className={`w-18 h-18 rounded-2xl object-cover border-2 shadow-md ${
                    viewingAthlete.gender === 'female' ? 'border-rose-400' : 'border-sky-400'
                  }`}
                />
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black text-slate-900 font-display">
                        {viewingAthlete.fullName}
                      </h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold border ${
                          viewingAthlete.gender === 'female'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-sky-100 text-sky-800 border-sky-300'
                        }`}
                      >
                        {viewingAthlete.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
                      </span>
                      {renderTierBadge(viewingAthlete.rankingTier)}
                    </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Biệt danh: <strong className="text-emerald-700">"{viewingAthlete.nickname}"</strong> • {viewingAthlete.clubName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Mã hồ sơ: VDV-{viewingAthlete.id.toUpperCase()} • Bộ môn: {viewingAthlete.sportType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {renderAthleteEditButton(viewingAthlete, 'normal')}
                <button
                  type="button"
                  onClick={() => exportAthleteProfilePDF(viewingAthlete)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm transition-all hover:scale-105"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Xuất File PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingAthlete(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setModalTab('info')}
                className={`py-3 px-4 border-b-2 transition-colors ${
                  modalTab === 'info'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Thông Tin Cá Nhân & Liên Lạc
              </button>
              <button
                type="button"
                onClick={() => setModalTab('fitness')}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'fitness'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Thể Lực, Cân Nặng Chuẩn & Dinh Dưỡng</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('history')}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'history'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Lịch Sử Thi Đấu</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                  {viewingAthlete.careerHistory?.length || 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('achievements')}
                className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
                  modalTab === 'achievements'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Huy Chương & Cúp</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                  {viewingAthlete.achievements?.length || 0}
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
              {modalTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Thông Tin Nhân Thân
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Ngày sinh (DOB):</span>
                        <span className="font-bold text-slate-900">{viewingAthlete.birthDate}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Tuổi:</span>
                        <span className="font-bold text-emerald-700">{viewingAthlete.age} tuổi</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Giới tính:</span>
                        <span className="font-bold text-slate-900">
                          {viewingAthlete.gender === 'female' ? 'Nữ (Female)' : 'Nam (Male)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Số CCCD / ID:</span>
                        <span className="font-mono font-bold text-slate-900">{viewingAthlete.identityNumber || 'Chưa cập nhật'}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Liên Lạc & Địa Chỉ Thường Trú
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Số điện thoại:</span>
                        <span className="font-mono font-bold text-slate-900">{viewingAthlete.phone}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-sky-700 font-semibold truncate max-w-[180px]">{viewingAthlete.email}</span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 block mb-1">Địa chỉ thường trú:</span>
                        <span className="text-slate-900 font-medium">{viewingAthlete.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Athletic Metrics Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Chỉ Số Elo & DUPR Tự Động Theo Thành Tích
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRecalculateRatings(viewingAthlete)}
                        className="text-xs text-emerald-700 font-extrabold flex items-center gap-1 hover:underline"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Cập nhật Elo/DUPR</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Điểm Elo</div>
                        <div className="text-xl font-black text-sky-700 font-display">{viewingAthlete.eloRating}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">DUPR Rating</div>
                        <div className="text-xl font-black text-emerald-700 font-display">
                          {viewingAthlete.duprRating ? viewingAthlete.duprRating.toFixed(2) : 'N/A'}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Chiều Cao / Cân Nặng</div>
                        <div className="text-sm font-bold text-slate-900">
                          {viewingAthlete.heightCm || 175}cm / {viewingAthlete.weightKg || 70}kg
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Tay Thuận</div>
                        <div className="text-sm font-bold text-emerald-700">
                          {viewingAthlete.dominantHand || 'Phải'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FITNESS & NUTRITION TAB */}
              {modalTab === 'fitness' && (
                <div className="space-y-4">
                  {/* Health Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          Đánh Giá Thể Hình & Cân Nặng Chuẩn Cho Pickleball
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Dựa trên chiều cao <strong>{viewingAthlete.heightCm}cm</strong> và cân nặng <strong>{viewingAthlete.weightKg}kg</strong>.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-white text-emerald-800 font-black text-xs border border-emerald-300 shadow-2xs">
                        {viewingAthleteHealth.bmiCategory} (BMI: {viewingAthleteHealth.bmi})
                      </span>
                    </div>
                  </div>

                  {/* Ideal Weight Range & Daily Targets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[11px] font-bold">Khung Cân Nặng Chuẩn VĐV</div>
                      <div className="text-lg font-black text-emerald-700 mt-0.5">
                        {viewingAthleteHealth.idealWeightMinKg}kg - {viewingAthleteHealth.idealWeightMaxKg}kg
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {viewingAthleteHealth.weightDifferenceKg === 0
                          ? '✓ Cân nặng hoàn hảo'
                          : viewingAthleteHealth.weightDifferenceKg > 0
                          ? `Chênh lệch +${viewingAthleteHealth.weightDifferenceKg}kg`
                          : `Chênh lệch ${viewingAthleteHealth.weightDifferenceKg}kg`}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[11px] font-bold">Nhu Cầu Nước Thi Đấu</div>
                      <div className="text-lg font-black text-sky-700 mt-0.5">
                        {viewingAthleteHealth.dailyWaterLiters} Lít / Ngày
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Đã tính bù khoáng mồ hôi trên sân</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[11px] font-bold">Nhu Cầu Đạm (Protein)</div>
                      <div className="text-lg font-black text-amber-700 mt-0.5">
                        {viewingAthleteHealth.dailyProteinGrams} g / Ngày
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Tối ưu phục hồi cơ bắp</div>
                    </div>
                  </div>

                  {/* Nutrition Guidance Accordion */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-800 uppercase tracking-wider">
                      <Apple className="w-4 h-4 text-emerald-600" />
                      <span>Hướng Dẫn Dinh Dưỡng Thể Thao Đề Xuất</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
                      {viewingAthleteHealth.nutritionAdvice.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Workout Guidance Accordion */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-sky-800 uppercase tracking-wider">
                      <Dumbbell className="w-4 h-4 text-sky-600" />
                      <span>Giáo Án Bổ Trợ Thể Lực & Kỹ Thuật Pickleball</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
                      {viewingAthleteHealth.workoutAdvice.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-sky-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {modalTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Lịch Sử Các Trận Thi Đấu</h4>
                      <p className="text-xs text-slate-500">Mỗi trận thắng tự động cộng +24 Elo và +0.05 DUPR</p>
                    </div>
                    {isViewingMyProfile ? (
                      <button
                        type="button"
                        onClick={() => setShowAddMatchForm(!showAddMatchForm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddMatchForm ? 'Hủy' : '+ Thêm Trận Đấu'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                        Chỉ VĐV sở hữu mới có quyền ghi nhận trận
                      </span>
                    )}
                  </div>

                  {/* Add Match Form */}
                  {showAddMatchForm && (
                    <form
                      onSubmit={handleAddMatchHistory}
                      className="p-4 rounded-2xl bg-slate-50 border border-emerald-300 space-y-3"
                    >
                      <div className="text-xs font-bold text-emerald-800 uppercase">Ghi Nhận Trận Đấu Mới (Tự Động Cộng Điểm Elo & DUPR)</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 block mb-1">Tên Giải Đấu *</label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Cúp Vô Địch PICKLE 4 ALL"
                            value={newMatch.tournamentName}
                            onChange={e => setNewMatch({ ...newMatch, tournamentName: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 block mb-1">Đối Thủ *</label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Nguyễn Văn A - Trần Văn B"
                            value={newMatch.opponentName}
                            onChange={e => setNewMatch({ ...newMatch, opponentName: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 block mb-1">Tỉ Số Trận Đấu</label>
                          <input
                            type="text"
                            placeholder="VD: 11-7, 11-9"
                            value={newMatch.score}
                            onChange={e => setNewMatch({ ...newMatch, score: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 block mb-1">Kết Quả</label>
                          <select
                            value={newMatch.result}
                            onChange={e => setNewMatch({ ...newMatch, result: e.target.value as any })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900"
                          >
                            <option value="win">Thắng (Win - Tăng Elo & DUPR)</option>
                            <option value="loss">Thua (Loss)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddMatchForm(false)}
                          className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 rounded bg-emerald-600 text-white font-bold text-xs"
                        >
                          Lưu & Tự Động Cập Nhật Elo
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Matches List Table */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Ngày</th>
                          <th className="py-2.5 px-3">Giải Đấu</th>
                          <th className="py-2.5 px-3">Vòng</th>
                          <th className="py-2.5 px-3">Đối Thủ</th>
                          <th className="py-2.5 px-3">Tỉ Số</th>
                          <th className="py-2.5 px-3 text-right">Kết Quả</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {viewingAthlete.careerHistory && viewingAthlete.careerHistory.length > 0 ? (
                          viewingAthlete.careerHistory.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 text-slate-500">{m.date}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{m.tournamentName}</td>
                              <td className="py-2.5 px-3 text-slate-600">{m.round}</td>
                              <td className="py-2.5 px-3 text-slate-600">{m.opponentName}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.score}</td>
                              <td className="py-2.5 px-3 text-right">
                                {m.result === 'win' ? (
                                  <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    THẮNG (+24 Elo)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded font-black text-[10px] bg-rose-100 text-rose-800 border border-rose-300">
                                    THUA
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              Chưa có lịch sử trận đấu nào được ghi nhận.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalTab === 'achievements' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Bảng Thành Tích & Cúp Danh Dự</h4>
                      <p className="text-xs text-slate-500">Mỗi huy chương Vàng cộng +60 Elo và +0.15 DUPR</p>
                    </div>
                    {isViewingMyProfile ? (
                      <button
                        type="button"
                        onClick={() => setShowAddAchievementForm(!showAddAchievementForm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs hover:bg-amber-100 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddAchievementForm ? 'Hủy' : '+ Thêm Danh Hiệu'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                        Chỉ VĐV sở hữu mới có quyền thêm thành tích
                      </span>
                    )}
                  </div>

                  {/* Add Achievement Form */}
                  {showAddAchievementForm && (
                    <form
                      onSubmit={handleAddAchievement}
                      className="p-4 rounded-2xl bg-amber-50/60 border border-amber-300 space-y-3"
                    >
                      <div className="text-xs font-bold text-amber-900 uppercase">Thêm Thành Tích Mới (Cộng Thưởng Elo & DUPR)</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-slate-600 block mb-1">Tên Danh Hiệu *</label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Vô Địch Đôi Nam PICKLE 4 ALL"
                            value={newAchievement.title}
                            onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-slate-600 block mb-1">Loại Huy Chương</label>
                          <select
                            value={newAchievement.medal}
                            onChange={e => setNewAchievement({ ...newAchievement, medal: e.target.value as any })}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900"
                          >
                            <option value="gold">Huy Chương Vàng (+60 Elo, +0.15 DUPR)</option>
                            <option value="silver">Huy Chương Bạc (+35 Elo, +0.08 DUPR)</option>
                            <option value="bronze">Huy Chương Đồng (+20 Elo, +0.04 DUPR)</option>
                            <option value="mvp">VĐV Xuất Sắc MVP (+50 Elo, +0.10 DUPR)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddAchievementForm(false)}
                          className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 rounded bg-amber-600 text-white font-bold text-xs"
                        >
                          Lưu & Tăng Thứ Hạng
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Achievements List */}
                  <div className="space-y-2.5">
                    {viewingAthlete.achievements && viewingAthlete.achievements.length > 0 ? (
                      viewingAthlete.achievements.map(ach => (
                        <div
                          key={ach.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                              <Medal className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900">{ach.title}</div>
                              <div className="text-xs text-slate-500">
                                {ach.tournamentName} • Năm {ach.year}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 uppercase text-amber-700">
                            {ach.medal === 'gold'
                              ? 'Huy Chương Vàng'
                              : ach.medal === 'silver'
                              ? 'Huy Chương Bạc'
                              : ach.medal === 'bronze'
                              ? 'Huy Chương Đồng'
                              : 'Danh Hiệu MVP'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        Chưa có huy chương nào được cập nhật.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {canManageAthletes && (
                  <button
                    type="button"
                    onClick={() => handleRequestDelete(viewingAthlete)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa Hồ Sơ VĐV Này</span>
                  </button>
                )}
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Xác thực số hóa PICKLE 4 ALL • Chuẩn xuất file PDF quốc tế
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingAthlete(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ATHLETE MODAL WITH HEIGHT/WEIGHT/HAND/AVATAR/IDEAL CALC */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div
              className={`p-6 border-b flex items-center justify-between ${
                formData.gender === 'female'
                  ? 'bg-rose-50 border-rose-200'
                  : 'bg-sky-50 border-sky-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-5 h-5 ${formData.gender === 'female' ? 'text-rose-600' : 'text-sky-600'}`} />
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-display">
                    {editingAthlete
                      ? isOwnAthleteProfile(editingAthlete)
                        ? 'Cập Nhật Hồ Sơ Vận Động Viên Của Bạn'
                        : 'Cập Nhật Hồ Sơ Vận Động Viên'
                      : `Thêm Vận Động Viên ${formData.gender === 'female' ? 'Nữ (Hồng)' : 'Nam (Xanh)'}`}
                  </h3>
                  {editingAthlete && isOwnAthleteProfile(editingAthlete) && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Thông tin cơ bản sẽ tự động đồng bộ với tài khoản đăng nhập ({currentUser.name}).
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-white text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAthlete} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs text-slate-800">
              {/* Avatar Selector Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Ảnh Đại Diện Vận Động Viên *</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tải từ máy, dán URL hoặc chọn mẫu
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="relative group flex-shrink-0">
                    <img
                      src={formData.avatarUrl}
                      alt="Preview"
                      className={`w-20 h-20 rounded-2xl object-cover border-3 shadow-md ${
                        formData.gender === 'female' ? 'border-rose-400' : 'border-sky-400'
                      }`}
                    />
                    <label className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold">
                      <Upload className="w-4 h-4 mb-0.5" />
                      <span>Đổi ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    {/* Action buttons: Upload from device vs URL */}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-300 shadow-2xs cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tải ảnh từ máy tính / ĐT</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400 font-semibold">hoặc nhập đường link bên dưới</span>
                    </div>

                    <input
                      type="url"
                      placeholder="Dán link ảnh online (https://...)"
                      value={formData.avatarUrl}
                      onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                    />

                    {/* Presets Gallery */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] text-slate-600 font-bold">
                        Ảnh mẫu {formData.gender === 'female' ? 'Nữ ♀' : 'Nam ♂'}:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(formData.gender === 'female' ? PRESET_AVATARS.female : PRESET_AVATARS.male).map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Preset ${idx}`}
                            onClick={() => setFormData({ ...formData, avatarUrl: url })}
                            className={`w-7 h-7 rounded-lg object-cover cursor-pointer border hover:scale-115 transition-transform ${
                              formData.avatarUrl === url
                                ? 'ring-2 ring-emerald-500 border-white shadow-sm'
                                : 'border-slate-300 opacity-80 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Họ và Tên VĐV (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: Trần Tuấn Kiệt (để trống sẽ tạo tên tự động)"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Nickname */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Biệt Danh / Nickname (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="VD: Kiệt Flash"
                    value={formData.nickname}
                    onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Giới Tính (Quyết định màu thẻ)</label>
                  <select
                    value={formData.gender}
                    onChange={e => {
                      const newG = e.target.value as 'male' | 'female';
                      setFormData({
                        ...formData,
                        gender: newG,
                        avatarUrl: newG === 'female' ? PRESET_AVATARS.female[0] : PRESET_AVATARS.male[0],
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="male">♂ Nam (Nền Xanh Biển)</option>
                    <option value="female">♀ Nữ (Nền Hồng Phấn)</option>
                  </select>
                </div>

                {/* BirthDate */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Ngày Sinh (Tùy chọn)</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => handleBirthDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Height, Weight & Dominant Hand Section */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Chiều Cao (cm) (Tùy chọn)</label>
                  <input
                    type="number"
                    min={120}
                    max={220}
                    placeholder="175"
                    value={formData.heightCm}
                    onChange={e => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Cân Nặng (kg) (Tùy chọn)</label>
                  <input
                    type="number"
                    min={30}
                    max={180}
                    placeholder="70"
                    value={formData.weightKg}
                    onChange={e => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tay Thuận (Tùy chọn)</label>
                  <select
                    value={formData.dominantHand}
                    onChange={e => setFormData({ ...formData, dominantHand: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Phải">Tay Phải (Right-handed)</option>
                    <option value="Trái">Tay Trái (Left-handed)</option>
                    <option value="Cả hai">Cả Hai Tay (Ambidextrous)</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Số Điện Thoại (Tùy chọn)</label>
                  <input
                    type="tel"
                    placeholder="VD: 0933 112 233 (Không bắt buộc)"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* LIVE REAL-TIME ATHLETE HEALTH & NUTRITION CALCULATION BOX */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-emerald-900">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Tự Động Tính Cân Nặng Chuẩn & Tư Vấn Dinh Dưỡng Thể Thao</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-black border border-emerald-300">
                    {liveHealth.bmiCategory} (BMI: {liveHealth.bmi})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500">Khung Cân Nặng Chuẩn</span>
                    <div className="font-extrabold text-emerald-700 text-sm">
                      {liveHealth.idealWeightMinKg}kg - {liveHealth.idealWeightMaxKg}kg
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500">Nhu Cầu Nước Mỗi Ngày</span>
                    <div className="font-extrabold text-sky-700 text-sm">
                      {liveHealth.dailyWaterLiters} Lít/ngày
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500">Lượng Đạm Khuyến Nghị</span>
                    <div className="font-extrabold text-amber-700 text-sm">
                      {liveHealth.dailyProteinGrams} g/ngày
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-700 pt-1 border-t border-emerald-200/80">
                  💡 <strong>Gợi ý:</strong> {liveHealth.nutritionAdvice[0]}
                </div>
              </div>

              {/* Extra Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Số Căn Cước / CCCD</label>
                  <input
                    type="text"
                    value={formData.identityNumber}
                    onChange={e => setFormData({ ...formData, identityNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">Địa Chỉ Nhà Thường Trú</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Câu Lạc Bộ</label>
                  <select
                    value={formData.clubId}
                    onChange={e => {
                      const selected = clubs.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        clubId: e.target.value,
                        clubName: selected?.name || '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  >
                    {clubs.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Bộ Môn Sở Trường</label>
                  <select
                    value={formData.sportType}
                    onChange={e => setFormData({ ...formData, sportType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold"
                  >
                    <option value="Pickleball">Pickleball</option>
                    <option value="Billiards">Billiards (Bida)</option>
                    <option value="Cầu Lông">Cầu Lông</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Bóng Đá">Bóng Đá</option>
                  </select>
                </div>

                {/* HẠNG, CẤP BẬC VĐV (NGHIỆP DƯ, BÁN CHUYÊN, CHUYÊN NGHIỆP, TỰ ĐẶT CHO NHÓM: MUỖI, RUỒI, GÀ, CỌP...) */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-slate-50 border border-purple-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-slate-800 font-black text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>Hạng / Cấp Bậc Vận Động Viên *</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-medium">Hạng hiện tại:</span>
                      {renderTierBadge(formData.rankingTier || 'Chưa chọn')}
                    </div>
                  </div>

                  {/* Standard Tiers */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      1. Hạng Thể Thao Chuẩn:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Chuyên Nghiệp', icon: '👑', color: 'hover:bg-rose-100 hover:text-rose-800' },
                        { label: 'Bán Chuyên', icon: '⭐', color: 'hover:bg-sky-100 hover:text-sky-800' },
                        { label: 'Nghiệp Dư', icon: '🎾', color: 'hover:bg-teal-100 hover:text-teal-800' },
                        { label: 'Phong Trào', icon: '⚡', color: 'hover:bg-emerald-100 hover:text-emerald-800' },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, rankingTier: preset.label as any })}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                            formData.rankingTier === preset.label
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs scale-105'
                              : `bg-white text-slate-700 border-slate-200 ${preset.color}`
                          }`}
                        >
                          <span>{preset.icon}</span>
                          <span>{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Club-Specific Tiers: Muỗi, Ruồi, Gà, Cọp, Đại Bàng, Voi... */}
                  <div>
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1.5">
                      2. Hạng Đặt Riêng Cho Nhóm / CLB (Muỗi, Ruồi, Gà, Cọp, Đại Bàng, Voi...):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Muỗi', icon: '🦟', desc: 'Tập sự' },
                        { label: 'Ruồi', icon: '🪰', desc: 'Khởi đầu' },
                        { label: 'Gà', icon: '🐔', desc: 'Trung bình' },
                        { label: 'Cọp', icon: '🐯', desc: 'Bán chuyên' },
                        { label: 'Đại Bàng', icon: '🦅', desc: 'Thượng thừa' },
                        { label: 'Voi', icon: '🐘', desc: 'Lực sĩ / Lão làng' },
                      ].map(tier => (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, rankingTier: tier.label as any })}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                            formData.rankingTier === tier.label
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs scale-105'
                              : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100 hover:text-purple-900'
                          }`}
                        >
                          <span>{tier.icon}</span>
                          <span>{tier.label}</span>
                          <span className="text-[9px] opacity-75">({tier.desc})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Free text custom tier */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      3. Hoặc tự gõ tên hạng riêng tùy chỉnh cho CLB của bạn:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Muỗi, Ruồi, Gà, Cọp, Hạng B+, Tay Cơ Vàng..."
                      value={formData.rankingTier}
                      onChange={e => setFormData({ ...formData, rankingTier: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-purple-300 text-slate-900 font-bold focus:border-purple-600 focus:outline-none text-xs shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <div>
                  {editingAthlete && !isOwnAthleteProfile(editingAthlete) && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {currentUser.role === 'super_admin' ? 'Quyền lực tối cao Super Admin' : 'Quyền lực tối cao Admin'}
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                  >
                    Hủy Bỏ
                  </button>

                  {/* Button "Lưu & Khóa Lại Khi Sửa Xong" for Super Admin */}
                  {currentUser.role === 'super_admin' && isSuperAdminUnlocked && onLockSuperAdmin && (
                    <button
                      type="button"
                      onClick={(e) => handleSaveAthlete(e, true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 border border-amber-400/40"
                      title="Lưu hồ sơ và ngay lập tức khóa lại quyền can thiệp Super Admin"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lưu & Khóa Lại Super Admin</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md"
                  >
                    {editingAthlete ? 'Lưu Thay Đổi & Cập Nhật' : 'Xác Nhận Thêm VĐV'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ATHLETE MODAL (REPLACES WINDOW.CONFIRM) */}
      {athleteToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border-2 border-rose-200 shadow-inner">
              <Trash2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Xác Nhận Xóa Hồ Sơ Vận Động Viên?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ của VĐV{' '}
                <strong className="text-slate-900 font-bold">{athleteToDelete.fullName}</strong>
                {athleteToDelete.nickname ? ` ("${athleteToDelete.nickname}")` : ''} thuộc{' '}
                <strong className="text-slate-800">{athleteToDelete.clubName}</strong>?
              </p>
              <div className="mt-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-800 text-[11px] text-left">
                ⚠️ <strong>Cảnh báo:</strong> Thao tác này sẽ xóa hồ sơ, chỉ số Elo ({athleteToDelete.eloRating}), DUPR, số đo thể lực và toàn bộ lịch sử thi đấu khỏi hệ thống.
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAthleteToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = athleteToDelete;
                  setAthleteToDelete(null);
                  if (viewingAthlete?.id === target.id) {
                    setViewingAthlete(null);
                  }
                  if (editingAthlete?.id === target.id) {
                    setEditingAthlete(null);
                  }
                  onDeleteAthlete(target.id);
                  onTriggerNotification(
                    '🗑️ Đã xóa hồ sơ VĐV',
                    `Đã xóa thành công hồ sơ của VĐV ${target.fullName} khỏi hệ thống.`,
                    'system'
                  );
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Unlock Password Modal inside AthletesView */}
      <SuperAdminPasswordModal
        isOpen={isPassModalOpen}
        onClose={() => {
          setIsPassModalOpen(false);
          setPendingAthleteForAction(null);
        }}
        onSuccess={handleSuperAdminPassSuccess}
        onTriggerNotification={onTriggerNotification}
      />

      {/* Super Admin Confidential Elo & DUPR Calibration Modal */}
      {currentUser.role === 'super_admin' && (
        <SuperAdminEloCalibrationModal
          isOpen={isEloCalibrationModalOpen}
          onClose={() => setIsEloCalibrationModalOpen(false)}
          athletes={athletes}
          tournaments={tournaments}
          onUpdateAthlete={onUpdateAthlete}
          onTriggerNotification={onTriggerNotification}
        />
      )}
    </div>
  );
};
