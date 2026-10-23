import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Shuffle,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Shield,
  Clock,
  CheckCircle,
  PlayCircle,
  ChevronRight,
  BookOpen,
  GitBranch,
  Flame,
  Award,
  Sparkles,
  RefreshCw,
  X,
  Radio,
  FileCheck,
  Search,
  UserCheck,
  UserX,
  UserPlus,
  CheckSquare,
  Square,
  Crown,
  Dices,
  ChevronDown,
  Check,
  AlertCircle,
  ArrowRight,
  Megaphone,
  Bell,
  Edit2,
  Trash2,
  RotateCcw,
  LayoutGrid,
  List,
  FileText,
  CheckCheck,
  History,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Tournament,
  TournamentMilestone,
  TournamentTeam,
  TournamentMatch,
  TournamentRound,
  StandingRow,
  SportDiscipline,
  TournamentFormat,
  Athlete,
  User,
} from '../types.ts';
import {
  DEFAULT_INTERNATIONAL_RULES,
  buildRoundRobinTournament,
  buildKnockoutBracket,
  calculateStandings,
  pairAthletesIntoTeams,
  buildBracketFromCaptainDraw,
  buildManualMatchupsTournament,
} from '../utils/tournamentScheduling.ts';
import { EditTournamentModal } from './EditTournamentModal.tsx';

interface TournamentsViewProps {
  tournaments: Tournament[];
  athletes: Athlete[];
  currentUser: User;
  isSuperAdminUnlocked?: boolean;
  onUnlockSuperAdmin?: () => void;
  onAddTournament: (tournament: Tournament) => void;
  onUpdateTournament: (tournament: Tournament) => void;
  onDeleteTournament?: (tournamentId: string) => void;
  onResetDefaultTournaments?: () => void;
  onTriggerNotification: (title: string, message: string, type?: any, priority?: any) => void;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  tournaments,
  athletes,
  currentUser,
  isSuperAdminUnlocked = false,
  onUnlockSuperAdmin,
  onAddTournament,
  onUpdateTournament,
  onDeleteTournament,
  onResetDefaultTournaments,
  onTriggerNotification,
}) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    tournaments[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'hub' | 'bracket' | 'milestones' | 'rules' | 'operations' | 'standings'>('hub');
  const [hubFilter, setHubFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [hubSearchTerm, setHubSearchTerm] = useState('');
  const [isEditTourModalOpen, setIsEditTourModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [tourToDelete, setTourToDelete] = useState<Tournament | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Milestones State
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [newMilestoneData, setNewMilestoneData] = useState({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    time: '08:00',
    venueOrNotes: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
  });

  // Participant Management Modal State
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');

  // Captain Draw interactive Modal/State
  const [isCaptainDrawModalOpen, setIsCaptainDrawModalOpen] = useState(false);

  // Live Score Modal State
  const [scoringMatch, setScoringMatch] = useState<{
    tournamentId: string;
    match: TournamentMatch;
  } | null>(null);

  const [scoreSet1T1, setScoreSet1T1] = useState(0);
  const [scoreSet1T2, setScoreSet1T2] = useState(0);
  const [scoreSet2T1, setScoreSet2T1] = useState(0);
  const [scoreSet2T2, setScoreSet2T2] = useState(0);
  const [scoreSet3T1, setScoreSet3T1] = useState(0);
  const [scoreSet3T2, setScoreSet3T2] = useState(0);

  // Registration modal
  const [isRegisterTeamModalOpen, setIsRegisterTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [player1Id, setPlayer1Id] = useState(athletes[0]?.id || '');
  const [player2Id, setPlayer2Id] = useState(athletes[1]?.id || '');

  // Bracket display mode: interactive Tree Bracket diagram vs Cards Grid
  const [bracketDisplayMode, setBracketDisplayMode] = useState<'tree' | 'cards'>('tree');

  // Match Schedule editing modal state
  const [editingScheduleMatch, setEditingScheduleMatch] = useState<{
    matchId: string;
    roundName: string;
    team1Name: string;
    team2Name: string;
    date: string;
    time: string;
    court: string;
  } | null>(null);

  // Cancel / Reset Draw confirmation modal
  const [isCancelDrawModalOpen, setIsCancelDrawModalOpen] = useState(false);

  // Step 3: Manual Team Pairing Modal & Form State
  const [isManualTeamModalOpen, setIsManualTeamModalOpen] = useState(false);
  const [manualTeamName, setManualTeamName] = useState('');
  const [manualPlayer1Id, setManualPlayer1Id] = useState(athletes[0]?.id || '');
  const [manualPlayer2Id, setManualPlayer2Id] = useState(athletes[1]?.id || '');

  // Step 4: Manual Matchup Pairing Modal & Form State
  const [isManualMatchupModalOpen, setIsManualMatchupModalOpen] = useState(false);
  const [manualPairs, setManualPairs] = useState<
    Array<{ team1Id: string; team2Id: string; court: string; time: string; date: string }>
  >([]);

  // Form state for creating tournament
  const [newTourData, setNewTourData] = useState({
    name: '',
    code: '',
    sportCategory: 'Pickleball',
    competitionForm: 'Đôi Nam Nữ',
    discipline: 'Pickleball Đôi Nam Nữ' as SportDiscipline,
    format: 'round_robin' as TournamentFormat,
    startingRound: 'round_robin' as 'round_robin' | 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'finals',
    setsCount: 3 as 1 | 3 | 5,
    pointsPerSet: 11,
    scoringRule: 'win2_loss1_forfeit0' as 'win2_loss1_forfeit0' | 'win1_loss0' | 'win3_loss0',
    venue: 'Cụm Liên Hợp Thể Thao PICKLE 4 ALL Center, TP. Hà Nội',
    startDate: '2026-04-10',
    endDate: '2026-04-12',
    registrationDeadline: '2026-04-05',
    entryFee: 500000,
    totalPrizePool: 25000000,
    maxTeams: 8,
    bannerUrl: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=800&auto=format&fit=crop&q=80',
    matchFormatDesc: DEFAULT_INTERNATIONAL_RULES.matchFormatDesc,
    pointsToWinSet: DEFAULT_INTERNATIONAL_RULES.pointsToWinSet,
    setsToWinMatch: DEFAULT_INTERNATIONAL_RULES.setsToWinMatch,
    selectedAthleteIds: athletes.slice(0, 8).map(a => a.id),
  });

  const currentTournament = tournaments.find(t => t.id === selectedTournamentId) || tournaments[0];

  const isCreatorOfCurrentTournament = currentTournament?.creatorId === currentUser.id;

  const canManageTournaments =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'organizer' ||
    currentUser.role === 'referee' ||
    isCreatorOfCurrentTournament;

  const isOrganizer =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'organizer' ||
    isCreatorOfCurrentTournament;

  const filteredHubTournaments = tournaments.filter(t => {
    const term = hubSearchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      t.name.toLowerCase().includes(term) ||
      t.code.toLowerCase().includes(term) ||
      (t.venue || '').toLowerCase().includes(term) ||
      (t.discipline || '').toLowerCase().includes(term) ||
      (t.sportCategory || '').toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (hubFilter === 'live') return t.status === 'in_progress';
    if (hubFilter === 'upcoming') return t.status === 'upcoming' || t.status === 'registering' || t.status === 'draw_pending';
    if (hubFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const handleConfirmDeleteTournament = () => {
    if (!tourToDelete) return;
    const deletedId = tourToDelete.id;
    if (onDeleteTournament) {
      onDeleteTournament(deletedId);
    }
    setTourToDelete(null);
    if (selectedTournamentId === deletedId) {
      const remaining = tournaments.filter(t => t.id !== deletedId);
      if (remaining.length > 0) {
        setSelectedTournamentId(remaining[0].id);
      }
    }
  };

  // Derived participants and checked-in list
  const participantIds: string[] =
    currentTournament?.participantAthleteIds && currentTournament.participantAthleteIds.length > 0
      ? currentTournament.participantAthleteIds
      : currentTournament?.registeredTeams && currentTournament.registeredTeams.length > 0
      ? currentTournament.registeredTeams.flatMap(t => [t.player1.id, t.player2?.id].filter(Boolean) as string[])
      : athletes.slice(0, 8).map(a => a.id);

  const participantAthletes = athletes.filter(a => participantIds.includes(a.id));
  const checkedInIds: string[] = currentTournament?.checkedInAthleteIds ?? participantIds;

  // Open Live Score Modal
  const handleOpenScoreModal = (match: TournamentMatch) => {
    setScoringMatch({
      tournamentId: currentTournament.id,
      match,
    });
    setScoreSet1T1(match.scoreTeam1[0] || 0);
    setScoreSet1T2(match.scoreTeam2[0] || 0);
    setScoreSet2T1(match.scoreTeam1[1] || 0);
    setScoreSet2T2(match.scoreTeam2[1] || 0);
    setScoreSet3T1(match.scoreTeam1[2] || 0);
    setScoreSet3T2(match.scoreTeam2[2] || 0);
  };

  // Submit Live Score & Advance Tournament
  const handleSaveScore = (isFinished: boolean) => {
    if (!scoringMatch || !currentTournament) return;

    const s1: [number, number, number] = [scoreSet1T1, scoreSet2T1, scoreSet3T1];
    const s2: [number, number, number] = [scoreSet1T2, scoreSet2T2, scoreSet3T2];

    let setsWon1 = 0;
    let setsWon2 = 0;
    for (let i = 0; i < 3; i++) {
      if (s1[i] > s2[i]) setsWon1++;
      else if (s2[i] > s1[i]) setsWon2++;
    }

    const winnerId = setsWon1 > setsWon2 ? scoringMatch.match.team1?.id : scoringMatch.match.team2?.id;

    // Trigger celebratory confetti if final match finished!
    if (isFinished && scoringMatch.match.roundName.includes('Chung Kết')) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }

    // Update matches inside tournament
    const updatedRounds = currentTournament.rounds.map(round => {
      return {
        ...round,
        matches: round.matches.map(m => {
          if (m.id === scoringMatch.match.id) {
            return {
              ...m,
              scoreTeam1: s1,
              scoreTeam2: s2,
              status: isFinished ? ('finished' as const) : ('live' as const),
              winnerTeamId: winnerId,
            };
          }
          return m;
        }),
      };
    });

    // If Knockout, advance winner to next round
    if (currentTournament.format === 'single_elimination' && isFinished && winnerId) {
      const curRoundIndex = scoringMatch.match.roundIndex;
      const nextRoundIndex = curRoundIndex + 1;
      const curMatchIndex = scoringMatch.match.matchIndex;
      const nextMatchIndex = Math.floor(curMatchIndex / 2);
      const isSlot1 = curMatchIndex % 2 === 0;

      const winningTeam =
        winnerId === scoringMatch.match.team1?.id
          ? scoringMatch.match.team1
          : scoringMatch.match.team2;

      if (updatedRounds[nextRoundIndex]?.matches[nextMatchIndex]) {
        const nextMatch = updatedRounds[nextRoundIndex].matches[nextMatchIndex];
        if (isSlot1) {
          nextMatch.team1 = winningTeam;
        } else {
          nextMatch.team2 = winningTeam;
        }
      }
    }

    // Recalculate standings for Round Robin
    const updatedStandings =
      currentTournament.format === 'round_robin'
        ? calculateStandings(
            currentTournament.registeredTeams,
            updatedRounds.flatMap(r => r.matches)
          )
        : currentTournament.standings;

    const updatedTour: Tournament = {
      ...currentTournament,
      rounds: updatedRounds,
      standings: updatedStandings,
    };

    onUpdateTournament(updatedTour);
    setScoringMatch(null);

    const matchName = `${scoringMatch.match.team1?.name} vs ${scoringMatch.match.team2?.name}`;
    onTriggerNotification(
      isFinished ? '🏆 Trận đấu đã kết thúc' : '⚡ Tỉ số trực tiếp cập nhật',
      `${matchName}: Tỉ số hiện tại (${s1.join('-')} / ${s2.join('-')}).`,
      'match_alert'
    );
  };

  // Toggle individual participant
  const handleToggleParticipant = (athleteId: string) => {
    if (!currentTournament) return;
    const currentList = currentTournament.participantAthleteIds || participantIds;
    const newList = currentList.includes(athleteId)
      ? currentList.filter(id => id !== athleteId)
      : [...currentList, athleteId];

    const updatedTour: Tournament = {
      ...currentTournament,
      participantAthleteIds: newList,
    };
    onUpdateTournament(updatedTour);
  };

  const handleSelectAllParticipants = () => {
    if (!currentTournament) return;
    const allIds = athletes.map(a => a.id);
    const updatedTour: Tournament = {
      ...currentTournament,
      participantAthleteIds: allIds,
    };
    onUpdateTournament(updatedTour);
    onTriggerNotification('Đã thêm toàn bộ VĐV', `Đã thêm tất cả ${allIds.length} VĐV vào giải đấu.`, 'tournament');
  };

  const handleClearParticipants = () => {
    if (!currentTournament) return;
    const updatedTour: Tournament = {
      ...currentTournament,
      participantAthleteIds: [],
      checkedInAthleteIds: [],
    };
    onUpdateTournament(updatedTour);
  };

  // Check-in handlers
  const handleToggleCheckIn = (athleteId: string) => {
    if (!currentTournament) return;
    const currentChecked = currentTournament.checkedInAthleteIds ?? checkedInIds;
    const newChecked = currentChecked.includes(athleteId)
      ? currentChecked.filter(id => id !== athleteId)
      : [...currentChecked, athleteId];

    const updatedTour: Tournament = {
      ...currentTournament,
      checkedInAthleteIds: newChecked,
    };
    onUpdateTournament(updatedTour);
  };

  const handleCheckInAll = () => {
    if (!currentTournament) return;
    const updatedTour: Tournament = {
      ...currentTournament,
      checkedInAthleteIds: [...participantIds],
    };
    onUpdateTournament(updatedTour);
    onTriggerNotification('Điểm danh thành công', `Đã điểm danh sẵn sàng cho toàn bộ ${participantIds.length} VĐV.`, 'tournament');
  };

  const handleResetCheckIn = () => {
    if (!currentTournament) return;
    const updatedTour: Tournament = {
      ...currentTournament,
      checkedInAthleteIds: [],
    };
    onUpdateTournament(updatedTour);
  };

  // Team Pairing Draw
  const handlePairTeams = (method: 'auto_balanced' | 'auto_random' | 'manual_lottery') => {
    if (!currentTournament) return;
    const checkedAthletes = athletes.filter(a => checkedInIds.includes(a.id));
    if (checkedAthletes.length < 2) {
      onTriggerNotification('Cảnh báo điểm danh', 'Cần tối thiểu 2 VĐV đã điểm danh để tiến hành chia đội.', 'system');
      return;
    }

    const isDoubles = !currentTournament.discipline.toLowerCase().includes('đơn');
    const newTeams = pairAthletesIntoTeams(checkedAthletes, method, isDoubles);

    const updatedTour: Tournament = {
      ...currentTournament,
      pairingMethod: method,
      registeredTeams: newTeams,
      status: 'draw_pending',
    };

    onUpdateTournament(updatedTour);
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {}

    onTriggerNotification(
      '🎲 Bốc thăm chia đội hoàn tất',
      `Đã ghép ${newTeams.length} đội thi đấu (${method === 'auto_balanced' ? 'Cân bằng Elo/DUPR' : 'Ngẫu nhiên'}). Đội trưởng đã sẵn sàng bốc thăm đối đầu.`,
      'tournament'
    );
  };

  // Matchup Draw: Option 1 - Auto Schedule
  const handleAutoScheduleMatchups = () => {
    if (!currentTournament) return;
    if (currentTournament.registeredTeams.length < 2) {
      onTriggerNotification('Chưa đủ đội', 'Cần tối thiểu 2 đội đã chia để xếp lịch thi đấu.', 'system');
      return;
    }

    let updatedRounds: TournamentRound[] = [];
    if (currentTournament.format === 'round_robin') {
      updatedRounds = buildRoundRobinTournament(currentTournament.registeredTeams);
    } else {
      updatedRounds = buildKnockoutBracket(currentTournament.registeredTeams, 'random');
    }

    const updatedTour: Tournament = {
      ...currentTournament,
      matchupDrawMethod: 'auto_schedule',
      rounds: updatedRounds,
      status: 'in_progress',
      standings:
        currentTournament.format === 'round_robin'
          ? calculateStandings(currentTournament.registeredTeams, updatedRounds.flatMap(r => r.matches))
          : [],
    };

    onUpdateTournament(updatedTour);
    setActiveTab('bracket');
    onTriggerNotification(
      '🏆 Lịch thi đấu đã tự động xếp hoàn tất',
      `Đã tạo các nhánh đấu, phân sân và thời gian nghỉ chuẩn quốc tế. Khởi tranh giải đấu!`,
      'tournament'
    );
  };

  // Matchup Draw: Option 2 - Captains Draw
  const handleCaptainDrawNumber = (teamId: string) => {
    if (!currentTournament) return;
    const total = currentTournament.registeredTeams.length;
    const usedLots = currentTournament.registeredTeams.map(t => t.drawLotNumber).filter(Boolean) as number[];
    const available = Array.from({ length: total }, (_, i) => i + 1).filter(n => !usedLots.includes(n));
    if (available.length === 0) return;

    const pickedLot = available[Math.floor(Math.random() * available.length)];
    const updatedTeams = currentTournament.registeredTeams.map(t =>
      t.id === teamId ? { ...t, drawLotNumber: pickedLot, bracketSlot: pickedLot } : t
    );

    const updatedTour: Tournament = {
      ...currentTournament,
      registeredTeams: updatedTeams,
      matchupDrawMethod: 'captain_draw',
    };
    onUpdateTournament(updatedTour);

    const team = currentTournament.registeredTeams.find(t => t.id === teamId);
    onTriggerNotification(
      '🎯 Đội trưởng bốc thăm',
      `Đội trưởng ${team?.captainName || team?.name} đã bốc được Lá Thăm Vị Trí #${pickedLot}!`,
      'tournament'
    );
  };

  const handleCaptainDrawAllAtOnce = () => {
    if (!currentTournament) return;
    const total = currentTournament.registeredTeams.length;
    const shuffled = Array.from({ length: total }, (_, i) => i + 1).sort(() => Math.random() - 0.5);

    const updatedTeams = currentTournament.registeredTeams.map((t, idx) => ({
      ...t,
      drawLotNumber: shuffled[idx],
      bracketSlot: shuffled[idx],
    }));

    const updatedTour: Tournament = {
      ...currentTournament,
      registeredTeams: updatedTeams,
      matchupDrawMethod: 'captain_draw',
    };
    onUpdateTournament(updatedTour);
    onTriggerNotification(
      '🎲 Bốc thăm toàn bộ Đội Trưởng hoàn tất',
      `Toàn bộ ${total} Đội Trưởng đã nhận được lá thăm nhánh đấu chính thức.`,
      'tournament'
    );
  };

  const handleFinalizeCaptainDraw = () => {
    if (!currentTournament || currentTournament.registeredTeams.length < 2) return;
    const updatedRounds = buildBracketFromCaptainDraw(currentTournament.registeredTeams, currentTournament.format);

    const updatedTour: Tournament = {
      ...currentTournament,
      rounds: updatedRounds,
      status: 'in_progress',
      standings:
        currentTournament.format === 'round_robin'
          ? calculateStandings(currentTournament.registeredTeams, updatedRounds.flatMap(r => r.matches))
          : [],
    };

    onUpdateTournament(updatedTour);
    try {
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.5 } });
    } catch {}
    setActiveTab('bracket');
    onTriggerNotification(
      '🎉 Khởi tranh giải đấu thành công!',
      `Sơ đồ nhánh đấu đã được phân bổ chính xác theo kết quả bốc thăm của các Đội Trưởng.`,
      'tournament'
    );
  };

  // Matchup Draw: Option 3 - Manual Matchup Pairing
  const handleOpenManualMatchupModal = () => {
    if (!currentTournament) return;
    const teams = currentTournament.registeredTeams;
    if (teams.length < 2) {
      onTriggerNotification('Chưa đủ đội', 'Cần tối thiểu 2 đội để thực hiện ghép cặp thủ công.', 'system');
      return;
    }

    const defaultCourts = ['Sân Trung Tâm A', 'Sân 1', 'Sân 2', 'Sân 3'];
    const pairsCount = Math.floor(teams.length / 2);
    const initialPairs = [];
    for (let i = 0; i < pairsCount; i++) {
      initialPairs.push({
        team1Id: teams[i * 2]?.id || '',
        team2Id: teams[i * 2 + 1]?.id || '',
        court: defaultCourts[i % defaultCourts.length],
        time: `${String(8 + Math.floor(i * 0.75)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '45'}`,
        date: currentTournament.startDate || new Date().toISOString().slice(0, 10),
      });
    }
    setManualPairs(initialPairs);
    setIsManualMatchupModalOpen(true);
  };

  const handleConfirmManualMatchups = () => {
    if (!currentTournament || manualPairs.length === 0) return;

    const pairs = manualPairs.map(p => {
      const t1 = currentTournament.registeredTeams.find(t => t.id === p.team1Id) || currentTournament.registeredTeams[0];
      const t2 = currentTournament.registeredTeams.find(t => t.id === p.team2Id) || currentTournament.registeredTeams[1];
      return {
        team1: t1,
        team2: t2,
        court: p.court,
        scheduledTime: p.time,
        scheduledDate: p.date,
      };
    });

    const updatedRounds = buildManualMatchupsTournament(pairs, currentTournament.format);

    const updatedTour: Tournament = {
      ...currentTournament,
      matchupDrawMethod: 'manual_pairing',
      rounds: updatedRounds,
      status: 'in_progress',
      standings:
        currentTournament.format === 'round_robin'
          ? calculateStandings(currentTournament.registeredTeams, updatedRounds.flatMap(r => r.matches), currentTournament.rules)
          : [],
    };

    onUpdateTournament(updatedTour);
    setIsManualMatchupModalOpen(false);
    setActiveTab('bracket');
    try {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.5 } });
    } catch {}

    onTriggerNotification(
      '🎯 Đã phân cặp thủ công thành công!',
      `Đã xếp ${pairs.length} trận đấu theo sự chỉ định của Ban Tổ Chức. Giải đấu chính thức khởi tranh!`,
      'tournament'
    );
  };

  // Step 3: Manual Team Creation & Deletion Handlers
  const handleCreateManualTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTournament) return;
    const p1 = athletes.find(a => a.id === manualPlayer1Id);
    if (!p1) {
      onTriggerNotification('Lỗi', 'Vui lòng chọn Vận động viên 1.', 'system');
      return;
    }
    const p2 = manualPlayer2Id ? athletes.find(a => a.id === manualPlayer2Id) : undefined;
    const teamName =
      manualTeamName.trim() ||
      (p2 ? `Đội ${p1.fullName} & ${p2.fullName}` : `VĐV ${p1.fullName}`);

    const newTeam: TournamentTeam = {
      id: `tm-man-${Date.now()}`,
      name: teamName,
      seed: currentTournament.registeredTeams.length + 1,
      status: 'paid',
      registrationDate: new Date().toISOString().slice(0, 10),
      captainId: p1.id,
      captainName: p1.fullName,
      player1: {
        id: p1.id,
        fullName: p1.fullName,
        nickname: p1.nickname,
        avatarUrl: p1.avatarUrl,
        clubName: p1.clubName,
        phone: p1.phone,
      },
      player2: p2
        ? {
            id: p2.id,
            fullName: p2.fullName,
            nickname: p2.nickname,
            avatarUrl: p2.avatarUrl,
            clubName: p2.clubName,
            phone: p2.phone,
          }
        : undefined,
    };

    const updatedTour: Tournament = {
      ...currentTournament,
      registeredTeams: [...currentTournament.registeredTeams, newTeam],
      pairingMethod: 'manual_custom',
    };
    onUpdateTournament(updatedTour);
    setManualTeamName('');
    setIsManualTeamModalOpen(false);
    onTriggerNotification(
      '✅ Thêm đội thủ công thành công',
      `Đã thêm "${teamName}" vào danh sách các đội tham gia thi đấu.`,
      'tournament'
    );
  };

  const handleDeleteTeam = (teamId: string) => {
    if (!currentTournament) return;
    const updatedTour: Tournament = {
      ...currentTournament,
      registeredTeams: currentTournament.registeredTeams.filter(t => t.id !== teamId),
    };
    onUpdateTournament(updatedTour);
    onTriggerNotification('Đã xóa đội', 'Đã loại bỏ đội khỏi danh sách thi đấu.', 'tournament');
  };

  // Schedule Editing Handlers
  const handleOpenEditSchedule = (match: TournamentMatch) => {
    setEditingScheduleMatch({
      matchId: match.id,
      roundName: match.roundName,
      team1Name: match.team1?.name || 'Chờ xác định',
      team2Name: match.team2?.name || 'Chờ xác định',
      date: match.scheduledDate || currentTournament?.startDate || new Date().toISOString().slice(0, 10),
      time: match.scheduledTime || '08:30',
      court: match.court || 'Sân Trung Tâm A',
    });
  };

  const handleSaveMatchSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduleMatch || !currentTournament) return;

    const updatedRounds = currentTournament.rounds.map(round => ({
      ...round,
      matches: round.matches.map(m => {
        if (m.id === editingScheduleMatch.matchId) {
          return {
            ...m,
            scheduledDate: editingScheduleMatch.date,
            scheduledTime: editingScheduleMatch.time,
            court: editingScheduleMatch.court,
          };
        }
        return m;
      }),
    }));

    const updatedTour: Tournament = {
      ...currentTournament,
      rounds: updatedRounds,
    };
    onUpdateTournament(updatedTour);
    onTriggerNotification(
      '📅 Đã cập nhật lịch thi đấu',
      `Trận đấu đã chuyển sang ${editingScheduleMatch.court} vào ${editingScheduleMatch.time} ngày ${editingScheduleMatch.date}.`,
      'tournament'
    );
    setEditingScheduleMatch(null);
  };

  // Reset / Cancel Draw to re-do
  const handleCancelDraw = () => {
    if (!currentTournament) return;
    const updatedTour: Tournament = {
      ...currentTournament,
      rounds: [],
      standings: [],
      status: 'draw_pending',
      matchupDrawMethod: undefined,
      registeredTeams: currentTournament.registeredTeams.map(t => ({
        ...t,
        drawLotNumber: undefined,
        bracketSlot: undefined,
      })),
    };
    onUpdateTournament(updatedTour);
    setIsCancelDrawModalOpen(false);
    setActiveTab('operations');
    onTriggerNotification(
      '🔄 Đã hủy lịch và kết quả bốc thăm',
      'Bạn có thể tiến hành chia đội hoặc bốc thăm lại từ Bước 3 và Bước 4.',
      'tournament'
    );
  };

  // Step 5: Court Selection and Announcements Handlers
  const handleUpdateMatchCourt = (matchId: string, newCourt: string) => {
    if (!currentTournament) return;
    const updatedRounds = currentTournament.rounds.map(round => ({
      ...round,
      matches: round.matches.map(m => (m.id === matchId ? { ...m, court: newCourt } : m)),
    }));
    onUpdateTournament({ ...currentTournament, rounds: updatedRounds });
  };

  const handleNotifyCourt = (match: TournamentMatch) => {
    if (!currentTournament) return;
    const t1 = match.team1?.name || 'Đội 1';
    const t2 = match.team2?.name || 'Đội 2';
    const court = match.court || 'Sân Trung Tâm A';

    const updatedRounds = currentTournament.rounds.map(round => ({
      ...round,
      matches: round.matches.map(m => (m.id === match.id ? { ...m, courtNotified: true } : m)),
    }));
    onUpdateTournament({ ...currentTournament, rounds: updatedRounds });

    onTriggerNotification(
      `📢 THÔNG BÁO VÀO SÂN THI ĐẤU [${court}]`,
      `Mời 2 đội: "${t1}" và "${t2}" di chuyển vào ${court} để khởi động và bắt đầu trận đấu ${match.roundName} (Giờ dự kiến: ${match.scheduledTime}).`,
      'match_alert',
      'urgent'
    );
  };

  const handleBulkNotifyCourts = (roundIndex?: number) => {
    if (!currentTournament) return;
    const roundToNotify = roundIndex !== undefined
      ? currentTournament.rounds[roundIndex]
      : currentTournament.rounds[0];

    if (!roundToNotify) return;

    const updatedRounds = currentTournament.rounds.map((round, idx) => {
      if (roundIndex === undefined || idx === roundIndex) {
        return {
          ...round,
          matches: round.matches.map(m => ({ ...m, courtNotified: true })),
        };
      }
      return round;
    });

    onUpdateTournament({ ...currentTournament, rounds: updatedRounds });

    onTriggerNotification(
      `📣 PHÁT LOA GỌI SÂN TOÀN BỘ ${roundToNotify.name.toUpperCase()}`,
      `Ban Tổ Chức thông báo tất cả các cặp đấu thuộc "${roundToNotify.name}" khẩn trương có mặt tại các sân thi đấu đã được chỉ định để chuẩn bị thi đấu!`,
      'match_alert',
      'urgent'
    );
  };

  // Perform Draw backwards compatible fallback
  const handlePerformDraw = (drawType: 'seed' | 'random') => {
    handleAutoScheduleMatchups();
  };

  // Create Tournament Handler
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourData.name.trim() || !newTourData.code.trim()) {
      onTriggerNotification('Lỗi thông tin', 'Vui lòng nhập tên giải và mã code.', 'system');
      return;
    }

    const selectedAthletes = athletes.filter(a => newTourData.selectedAthleteIds.includes(a.id));
    const effectiveAthletes = selectedAthletes.length >= 2 ? selectedAthletes : athletes.slice(0, 8);
    const isDoubles = !newTourData.competitionForm.toLowerCase().includes('đơn');
    const defaultTeams = pairAthletesIntoTeams(effectiveAthletes, 'auto_balanced', isDoubles);

    const initialRounds =
      newTourData.format === 'round_robin'
        ? buildRoundRobinTournament(defaultTeams)
        : buildKnockoutBracket(defaultTeams, 'seed');

    const defaultMilestones: TournamentMilestone[] = [
      { id: `ms-${Date.now()}-1`, title: 'Hạn đăng ký & Chốt danh sách', date: newTourData.registrationDeadline, time: '17:00', venueOrNotes: `${newTourData.maxTeams} đội tối đa`, status: 'completed' },
      { id: `ms-${Date.now()}-2`, title: 'Họp kỹ thuật & Bốc thăm', date: newTourData.startDate, time: '08:00', venueOrNotes: newTourData.venue, status: 'completed' },
      { id: `ms-${Date.now()}-3`, title: 'Khai mạc & Thi đấu', date: newTourData.startDate, time: '08:30', venueOrNotes: newTourData.venue, status: 'ongoing' },
      { id: `ms-${Date.now()}-4`, title: 'Chung kết & Lễ Trao Giải', date: newTourData.endDate, time: '16:00', venueOrNotes: newTourData.venue, status: 'upcoming' },
    ];

    const created: Tournament = {
      id: `tour-${Date.now()}`,
      name: newTourData.name.trim(),
      code: newTourData.code.toUpperCase().trim(),
      seasonId: '2026-S1',
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      discipline: `${newTourData.sportCategory} ${newTourData.competitionForm}` as SportDiscipline,
      sportCategory: newTourData.sportCategory,
      competitionForm: newTourData.competitionForm,
      startingRound: newTourData.startingRound,
      setsCount: newTourData.setsCount,
      pointsPerSet: newTourData.pointsPerSet,
      milestones: defaultMilestones,
      format: newTourData.format,
      venue: newTourData.venue,
      startDate: newTourData.startDate,
      endDate: newTourData.endDate,
      registrationDeadline: newTourData.registrationDeadline,
      entryFee: Number(newTourData.entryFee) || 0,
      totalPrizePool: Number(newTourData.totalPrizePool) || 0,
      maxTeams: Number(newTourData.maxTeams) || 8,
      bannerUrl: newTourData.bannerUrl,
      status: 'in_progress',
      rules: {
        ...DEFAULT_INTERNATIONAL_RULES,
        matchFormatDesc: newTourData.matchFormatDesc,
        pointsToWinSet: Number(newTourData.pointsPerSet) || 11,
        setsToWinMatch: newTourData.setsCount === 1 ? 1 : newTourData.setsCount === 5 ? 3 : 2,
        scoringSystem: newTourData.scoringRule,
        winPoints: newTourData.scoringRule === 'win3_loss0' ? 3 : newTourData.scoringRule === 'win1_loss0' ? 1 : 2,
        lossPoints: newTourData.scoringRule === 'win2_loss1_forfeit0' ? 1 : 0,
        forfeitPoints: 0,
      },
      participantAthleteIds: effectiveAthletes.map(a => a.id),
      checkedInAthleteIds: effectiveAthletes.map(a => a.id),
      pairingMethod: 'auto_balanced',
      matchupDrawMethod: 'auto_schedule',
      registeredTeams: defaultTeams,
      rounds: initialRounds,
      standings:
        newTourData.format === 'round_robin'
          ? calculateStandings(defaultTeams, initialRounds.flatMap(r => r.matches), {
              ...DEFAULT_INTERNATIONAL_RULES,
              scoringSystem: newTourData.scoringRule,
              winPoints: newTourData.scoringRule === 'win3_loss0' ? 3 : newTourData.scoringRule === 'win1_loss0' ? 1 : 2,
              lossPoints: newTourData.scoringRule === 'win2_loss1_forfeit0' ? 1 : 0,
              forfeitPoints: 0,
            })
          : [],
    };

    onAddTournament(created);
    setSelectedTournamentId(created.id);
    setIsCreateModalOpen(false);

    onTriggerNotification(
      '🏆 Khởi tạo giải đấu thành công',
      `Giải đấu "${created.name}" (${created.sportCategory} - ${created.competitionForm}) đã được tạo với ${effectiveAthletes.length} VĐV tham gia.`,
      'tournament'
    );
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTournament || !newMilestoneData.title.trim()) return;

    const newMs: TournamentMilestone = {
      id: `ms-${Date.now()}`,
      title: newMilestoneData.title.trim(),
      date: newMilestoneData.date,
      time: newMilestoneData.time,
      venueOrNotes: newMilestoneData.venueOrNotes.trim(),
      status: newMilestoneData.status,
    };

    const updatedMilestones = [...(currentTournament.milestones || []), newMs];
    onUpdateTournament({
      ...currentTournament,
      milestones: updatedMilestones,
    });
    setIsAddMilestoneModalOpen(false);
    setNewMilestoneData({
      title: '',
      date: currentTournament.startDate || new Date().toISOString().slice(0, 10),
      time: '08:00',
      venueOrNotes: '',
      status: 'upcoming',
    });
    onTriggerNotification(
      'Đã thêm mốc thời gian giải đấu',
      `Mốc "${newMs.title}" đã được bổ sung vào lịch trình giải đấu.`,
      'tournament'
    );
  };

  const handleToggleMilestoneStatus = (milestoneId: string) => {
    if (!currentTournament) return;
    const cycle: Record<'upcoming' | 'ongoing' | 'completed', 'upcoming' | 'ongoing' | 'completed'> = {
      upcoming: 'ongoing',
      ongoing: 'completed',
      completed: 'upcoming',
    };
    const updatedMilestones = (currentTournament.milestones || []).map(ms => {
      if (ms.id !== milestoneId) return ms;
      const nextStatus = cycle[ms.status || 'upcoming'];
      return { ...ms, status: nextStatus };
    });
    onUpdateTournament({
      ...currentTournament,
      milestones: updatedMilestones,
    });
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (!currentTournament) return;
    const updatedMilestones = (currentTournament.milestones || []).filter(ms => ms.id !== milestoneId);
    onUpdateTournament({
      ...currentTournament,
      milestones: updatedMilestones,
    });
    onTriggerNotification(
      'Đã xóa mốc thời gian',
      'Mốc thời gian đã được gỡ bỏ khỏi lịch trình.',
      'tournament'
    );
  };

  // Approve / Reject Team Registration
  const handleApproveTeam = (teamId: string) => {
    if (!currentTournament) return;
    const team = currentTournament.registeredTeams.find(t => t.id === teamId);
    const updatedTour: Tournament = {
      ...currentTournament,
      registeredTeams: currentTournament.registeredTeams.map(t =>
        t.id === teamId ? { ...t, status: 'paid' } : t
      ),
    };
    onUpdateTournament(updatedTour);
    onTriggerNotification(
      '✅ Đã phê duyệt đội thi đấu',
      `Đội "${team?.name || teamId}" đã được Ban tổ chức phê duyệt chính thức tham gia giải đấu.`,
      'tournament'
    );
  };

  const handleRejectTeam = (teamId: string) => {
    if (!currentTournament) return;
    const team = currentTournament.registeredTeams.find(t => t.id === teamId);
    const updatedTour: Tournament = {
      ...currentTournament,
      registeredTeams: currentTournament.registeredTeams.filter(t => t.id !== teamId),
    };
    onUpdateTournament(updatedTour);
    onTriggerNotification(
      '✕ Đã từ chối đơn đăng ký',
      `Đã từ chối đơn đăng ký của đội "${team?.name || teamId}".`,
      'tournament'
    );
  };

  // Register Team into current tournament
  const handleRegisterTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) {
      onTriggerNotification('Thiếu thông tin', 'Vui lòng nhập tên đội đăng ký.', 'system');
      return;
    }

    const p1 = athletes.find(a => a.id === player1Id);
    const p2 = athletes.find(a => a.id === player2Id);

    if (!p1) return;

    const isDirectOrganizer = isOrganizer || canManageTournaments;

    const newTeam: TournamentTeam = {
      id: `tm-${Date.now()}`,
      name: newTeamName,
      seed: currentTournament.registeredTeams.length + 1,
      player1: {
        id: p1.id,
        fullName: p1.fullName,
        nickname: p1.nickname,
        avatarUrl: p1.avatarUrl,
        clubName: p1.clubName,
        phone: p1.phone,
      },
      player2: p2
        ? {
            id: p2.id,
            fullName: p2.fullName,
            nickname: p2.nickname,
            avatarUrl: p2.avatarUrl,
            clubName: p2.clubName,
            phone: p2.phone,
          }
        : undefined,
      status: isDirectOrganizer ? 'paid' : 'pending',
      registrationDate: new Date().toISOString().slice(0, 10),
    };

    const updatedTeams = [...currentTournament.registeredTeams, newTeam];
    const updatedTour: Tournament = {
      ...currentTournament,
      registeredTeams: updatedTeams,
    };

    onUpdateTournament(updatedTour);
    setIsRegisterTeamModalOpen(false);
    setNewTeamName('');

    onTriggerNotification(
      isDirectOrganizer ? 'Đăng ký đội thành công' : 'Đã gửi đơn đăng ký tham gia giải',
      isDirectOrganizer
        ? `Đội "${newTeam.name}" đã hoàn tất thủ tục đăng ký tham gia ${currentTournament.name}.`
        : `Đơn đăng ký của đội "${newTeam.name}" đã được gửi tới Ban tổ chức giải để phê duyệt.`,
      'tournament'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tournament Selector */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 border border-emerald-600/30 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold mb-2 border border-white/30">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>HỆ THỐNG THỂ LỆ & BỐC THĂM CHUẨN QUỐC TẾ (USAPA / UMB / BWF)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display">
            {currentTournament?.name || 'Quản Lý Giải Đấu Thể Thao'}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-medium">
            <span className="flex items-center gap-1 font-bold text-white">
              <Award className="w-3.5 h-3.5 text-amber-300" /> {currentTournament?.discipline}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-200" /> {currentTournament?.startDate} đến {currentTournament?.endDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-200" /> {currentTournament?.venue}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Hub button */}
          <button
            type="button"
            onClick={() => setActiveTab('hub')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs hover:scale-105 active:scale-95 ${
              activeTab === 'hub'
                ? 'bg-white text-emerald-950 font-black'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title="Mở Trung Tâm Tổng Hợp Giải Đấu"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>Tổng Hợp Giải ({tournaments.length})</span>
          </button>

          {/* Tournament Switcher */}
          {tournaments.length > 0 && (
            <select
              value={selectedTournamentId}
              onChange={e => {
                setSelectedTournamentId(e.target.value);
                if (activeTab === 'hub') setActiveTab('bracket');
              }}
              className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white focus:outline-none focus:border-white shadow-2xs"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id} className="text-slate-900 bg-white">
                  {t.name.slice(0, 32)}...
                </option>
              ))}
            </select>
          )}

          {/* Super Admin & Admin Direct Edit & Delete Buttons */}
          {canManageTournaments && currentTournament && (
            <button
              type="button"
              onClick={() => {
                setEditingTournament(currentTournament);
                setIsEditTourModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs hover:scale-105 active:scale-95 transition-all"
              title="Sửa thông số, sửa giải tạo sai (Super Admin)"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Sửa Giải</span>
            </button>
          )}

          {canManageTournaments && currentTournament && onDeleteTournament && (
            <button
              type="button"
              onClick={() => setTourToDelete(currentTournament)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-black text-xs shadow-xs hover:scale-105 active:scale-95 transition-all"
              title="Xóa giải đấu này khỏi hệ thống (Super Admin)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsRegisterTeamModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/40 shadow-xs hover:scale-105 active:scale-95 transition-all"
            title="Gửi đơn đăng ký đội tham gia giải đấu này"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Đăng Ký</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-emerald-950 font-black text-xs shadow-md hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all"
            title="Tạo giải đấu riêng của bạn"
          >
            <Plus className="w-4 h-4 stroke-[3] text-emerald-700" />
            <span>+ Tạo Giải Mới</span>
          </button>
        </div>
      </div>

      {/* Tournament Navigation Sub-Tabs in Bright Style */}
      <div className="flex border border-slate-200 bg-slate-200/70 rounded-2xl p-1 gap-1 text-xs font-bold shadow-2xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('hub')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'hub'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>🏛️ Tổng Hợp Giải Đấu</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-black">
            {tournaments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bracket')}
          className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'bracket'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Sơ Đồ Nhánh & Lịch Đấu</span>
        </button>

        {currentTournament?.format === 'round_robin' && (
          <button
            type="button"
            onClick={() => setActiveTab('standings')}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'standings'
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Bảng Xếp Hạng</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('milestones')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'milestones'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Mốc Thời Gian</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900 font-black">
            {currentTournament?.milestones?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('operations')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'operations' || (activeTab as any) === 'teams'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>VĐV, Điểm Danh & Bốc Thăm</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
            BTC
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-emerald-600 text-white shadow-sm font-black'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Thể Lệ & Chỉ Số Phụ</span>
        </button>
      </div>

      {/* TAB: TỔNG HỢP & LỊCH SỬ GIẢI ĐẤU (HUB) */}
      {activeTab === 'hub' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-display">
                  Trung Tâm Tổng Hợp & Lịch Sử Giải Đấu
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Theo dõi các giải đang thi đấu (Live), giải chuẩn bị khởi tranh và click vào xem lại lịch sử các giải đấu đã khép lại cùng bảng vàng nhà vô địch.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onResetDefaultTournaments && canManageTournaments && (
                <button
                  type="button"
                  onClick={onResetDefaultTournaments}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-all hover:scale-105 active:scale-95"
                  title="Khôi phục danh sách giải đấu tiêu chuẩn mẫu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi Phục Mẫu</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Tạo Giải Mới</span>
              </button>
            </div>
          </div>

          {/* Sub-Filters and Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setHubFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  hubFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất Cả ({tournaments.length})
              </button>

              <button
                type="button"
                onClick={() => setHubFilter('live')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  hubFilter === 'live'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Đang Diễn Ra ({tournaments.filter(t => t.status === 'in_progress').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setHubFilter('upcoming')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  hubFilter === 'upcoming'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Chuẩn Bị Diễn Ra ({tournaments.filter(t => t.status === 'upcoming' || t.status === 'registering' || t.status === 'draw_pending').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setHubFilter('completed')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  hubFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Lịch Sử & Đã Kết Thúc ({tournaments.filter(t => t.status === 'completed').length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên giải, địa điểm, bộ môn..."
                value={hubSearchTerm}
                onChange={e => setHubSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tournament Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHubTournaments.map(tour => {
              const isCompleted = tour.status === 'completed';
              const isLive = tour.status === 'in_progress';
              const isUpcoming = tour.status === 'upcoming' || tour.status === 'registering' || tour.status === 'draw_pending';
              const championTeam = tour.registeredTeams.find(t => t.id === tour.championTeamId) || tour.registeredTeams[0];

              return (
                <div
                  key={tour.id}
                  className={`rounded-3xl bg-white border overflow-hidden flex flex-col shadow-xs transition-all duration-200 hover:shadow-md ${
                    isCompleted
                      ? 'border-amber-300 hover:border-amber-400'
                      : isLive
                      ? 'border-emerald-300 hover:border-emerald-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Banner & Badges */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={tour.bannerUrl}
                      alt={tour.name}
                      className="w-full h-full object-cover transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    {/* Top Status Badge */}
                    <div className="absolute top-3 left-3">
                      {isLive && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          ĐANG DIỄN RA (LIVE)
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Clock className="w-3 h-3" />
                          SẮP DIỄN RA
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Crown className="w-3 h-3" />
                          ĐÃ BẾ MẠC & LỊCH SỬ
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[10px] border border-white/20">
                        {tour.code}
                      </span>
                    </div>

                    {/* Discipline overlay at bottom of banner */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-600/90 text-[11px]">
                        {tour.discipline}
                      </span>
                      <span className="text-[11px] text-emerald-200">
                        {tour.format === 'round_robin' ? 'Vòng Tròn' : 'Loại Trực Tiếp'}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 leading-snug font-display line-clamp-2">
                        {tour.name}
                      </h4>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{tour.startDate} đến {tour.endDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{tour.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{tour.registeredTeams.length} / {tour.maxTeams} Đội tham gia</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-bold text-emerald-700">Thưởng: {(tour.totalPrizePool / 1000000).toFixed(0)}M VNĐ</span>
                        </div>
                      </div>

                      {/* Completed Tournament History Banner */}
                      {isCompleted && (
                        <div className="mt-3 p-3 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-950 font-black">
                            <Crown className="w-4 h-4 text-amber-600" />
                            <span>QUÁN QUÂN VÔ ĐỊCH:</span>
                            <span className="text-amber-900 font-extrabold">{championTeam?.name}</span>
                          </div>
                          <div className="text-[11px] text-amber-800">
                            Thành viên: {championTeam?.player1.fullName} {championTeam?.player2 ? `& ${championTeam?.player2.fullName}` : ''}
                          </div>
                          <div className="text-[10px] text-amber-700 font-semibold pt-0.5">
                            Click bên dưới để xem lại lịch sử sơ đồ thi đấu và bảng điểm chi tiết.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTournamentId(tour.id);
                          setActiveTab('bracket');
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] active:scale-95 ${
                          isCompleted
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Xem Lịch Sử Giải' : 'Vào Xem Trực Tiếp'}</span>
                      </button>

                      {/* Super Admin & Admin management controls */}
                      {canManageTournaments && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTournament(tour);
                              setIsEditTourModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 border border-slate-200 transition-colors"
                            title="Chỉnh sửa thông số giải đấu (Super Admin)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteTournament && (
                            <button
                              type="button"
                              onClick={() => setTourToDelete(tour)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-200 transition-colors"
                              title="Xóa giải đấu này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredHubTournaments.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-extrabold text-slate-800">Không tìm thấy giải đấu phù hợp</h4>
              <p className="text-xs text-slate-500 mt-1">Vui lòng thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: MỐC THỜI GIAN GIẢI ĐẤU (FLEXIBLE MILESTONES / TIMELINE) */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Lịch Trình & Các Mốc Thời Gian Giải Đấu (Milestones)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Tự do thêm và đặt tên các mốc thời gian linh hoạt (Hạn đăng ký, Bốc thăm, Khai mạc, Vòng bảng, Tứ kết, Bán kết, Chung kết & Gala Trao giải).
              </p>
            </div>

            {canManageTournaments && (
              <button
                type="button"
                onClick={() => setIsAddMilestoneModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex-shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Thêm Mốc Thời Gian Mới</span>
              </button>
            )}
          </div>

          {/* Timeline Milestones Cards */}
          {(!currentTournament.milestones || currentTournament.milestones.length === 0) ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white border border-dashed border-slate-300">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Chưa có mốc thời gian nào được thiết lập</p>
              <p className="text-xs text-slate-400 mt-1">Bấm nút "+ Thêm Mốc Thời Gian Mới" ở trên để bổ sung lịch trình cho giải đấu.</p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-300 space-y-6 my-4 ml-4">
              {currentTournament.milestones.map((ms, idx) => {
                const isCompleted = ms.status === 'completed';
                const isOngoing = ms.status === 'ongoing';

                return (
                  <div key={ms.id} className="relative group">
                    {/* Circle icon on timeline bar */}
                    <div
                      onClick={() => canManageTournaments && handleToggleMilestoneStatus(ms.id)}
                      className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600 border-white text-white'
                          : isOngoing
                          ? 'bg-amber-500 border-white text-white animate-pulse'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                      title={canManageTournaments ? 'Bấm để chuyển trạng thái mốc thời gian' : ''}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : isOngoing ? (
                        <Radio className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[11px] font-mono font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Milestone Card */}
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isOngoing
                          ? 'bg-amber-50/70 border-amber-300 shadow-sm'
                          : isCompleted
                          ? 'bg-white border-emerald-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {ms.title}
                          </h4>
                          <span
                            onClick={() => canManageTournaments && handleToggleMilestoneStatus(ms.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer border ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : isOngoing
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isCompleted ? '✓ Đã Hoàn Thành' : isOngoing ? '⚡ Đang Diễn Ra' : '⏳ Sắp Tới'}
                          </span>
                        </div>

                        {canManageTournaments && (
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => handleToggleMilestoneStatus(ms.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                              title="Chuyển trạng thái: Sắp tới -> Đang diễn ra -> Đã xong"
                            >
                              Đổi Trạng Thái
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMilestone(ms.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Xóa mốc thời gian"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {ms.date}
                        </span>
                        {ms.time && (
                          <span className="flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {ms.time}
                          </span>
                        )}
                        {ms.venueOrNotes && (
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {ms.venueOrNotes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: BRACKET & MATCHES SCHEDULE WITH REST INTERVAL RESTRICTION */}
      {activeTab === 'bracket' && (
        <div className="space-y-6">
          {/* Scheduling and View Mode Switcher Header */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Sơ Đồ Nhánh & Lịch Thi Đấu Chuẩn Quốc Tế</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black border border-emerald-300">
                    ANTI-CONSECUTIVE ENGINE
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Tự động chống 2 trận liền, quản lý ngày giờ, chỉ định sân thi đấu và phát thông báo trực tiếp cho VĐV.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle between Tree Diagram and Cards Grid */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBracketDisplayMode('tree')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    bracketDisplayMode === 'tree'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Sơ Đồ Cây (Tree)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBracketDisplayMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    bracketDisplayMode === 'cards'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Danh Sách Thẻ</span>
                </button>
              </div>

              {canManageTournaments && currentTournament.rounds?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCancelDrawModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-300 shadow-2xs"
                  title="Hủy bỏ lịch thi đấu và bốc thăm để làm lại từ đầu"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hủy / Reset Bốc Thăm</span>
                </button>
              )}
            </div>
          </div>

          {/* VIEW MODE 1: INTERACTIVE TREE BRACKET DIAGRAM */}
          {bracketDisplayMode === 'tree' && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <h3 className="font-extrabold text-slate-900 text-base font-display">
                    Sơ Đồ Nhánh Thi Đấu Loại Trực Tiếp (Elimination Tree Bracket)
                  </h3>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {currentTournament.rounds?.length || 0} Vòng đấu • {currentTournament.registeredTeams.length} Đội
                </div>
              </div>

              {currentTournament.rounds && currentTournament.rounds.length > 0 ? (
                <div className="overflow-x-auto pb-6 pt-2">
                  <div className="flex items-stretch gap-8 min-w-[850px]">
                    {currentTournament.rounds.map((round, rIdx) => {
                      const isFinalRound = rIdx === currentTournament.rounds.length - 1;
                      return (
                        <div key={round.roundIndex} className="flex-1 min-w-[260px] flex flex-col">
                          {/* Round Header Column */}
                          <div className="mb-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black uppercase tracking-wider shadow-xs">
                              {isFinalRound ? <Trophy className="w-3.5 h-3.5 text-amber-400" /> : <GitBranch className="w-3.5 h-3.5 text-emerald-400" />}
                              <span>{round.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-bold mt-1">
                              {round.matches.length} Trận Đấu
                            </div>
                          </div>

                          {/* Matches in Round Column */}
                          <div className="flex-1 flex flex-col justify-around gap-6">
                            {round.matches.map(match => {
                              const isFinished = match.status === 'finished';
                              const isLive = match.status === 'live';
                              const isT1Winner = match.winnerTeamId === match.team1?.id;
                              const isT2Winner = match.winnerTeamId === match.team2?.id;

                              return (
                                <div
                                  key={match.id}
                                  className={`relative rounded-2xl p-3 border transition-all ${
                                    isLive
                                      ? 'bg-emerald-50/50 border-2 border-emerald-500 shadow-md shadow-emerald-500/10'
                                      : isFinished
                                      ? 'bg-white border-slate-300 shadow-2xs'
                                      : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                                  }`}
                                >
                                  {/* Match Meta Top */}
                                  <div className="flex items-center justify-between text-[11px] pb-1.5 mb-1.5 border-b border-slate-100">
                                    <span className="font-bold text-slate-600 truncate flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-emerald-600" />
                                      <span>{match.court}</span>
                                      {match.scheduledTime && (
                                        <span className="text-slate-400 font-mono">({match.scheduledTime})</span>
                                      )}
                                    </span>

                                    <div className="flex items-center gap-1">
                                      {canManageTournaments && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditSchedule(match)}
                                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                                          title="Chỉnh sửa ngày, giờ, sân đấu"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                      )}

                                      {match.courtNotified && (
                                        <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[9px] font-black" title="Đã phát loa gọi sân">
                                          ĐÃ BÁO SÂN
                                        </span>
                                      )}

                                      {isLive && (
                                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black animate-pulse">
                                          LIVE
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Team 1 Row */}
                                  <div
                                    className={`flex items-center justify-between p-1.5 rounded-xl text-xs mb-1 transition-all ${
                                      isT1Winner
                                        ? 'bg-emerald-100/70 border border-emerald-300 font-black text-emerald-950'
                                        : 'bg-slate-50 text-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {match.team1?.seed && (
                                        <span className="w-4 h-4 rounded bg-white text-slate-700 text-[10px] font-black flex items-center justify-center border border-slate-200">
                                          #{match.team1.seed}
                                        </span>
                                      )}
                                      <span className="truncate font-bold">
                                        {match.team1?.name || 'TBD (Chờ bốc thăm)'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 font-mono font-black text-[11px]">
                                      {match.scoreTeam1.map((s, idx) => (
                                        <span key={idx} className="w-5 h-5 rounded bg-white text-slate-900 border border-slate-200 flex items-center justify-center shadow-2xs">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Team 2 Row */}
                                  <div
                                    className={`flex items-center justify-between p-1.5 rounded-xl text-xs transition-all ${
                                      isT2Winner
                                        ? 'bg-emerald-100/70 border border-emerald-300 font-black text-emerald-950'
                                        : 'bg-slate-50 text-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {match.team2?.seed && (
                                        <span className="w-4 h-4 rounded bg-white text-slate-700 text-[10px] font-black flex items-center justify-center border border-slate-200">
                                          #{match.team2.seed}
                                        </span>
                                      )}
                                      <span className="truncate font-bold">
                                        {match.team2?.name || 'TBD (Chờ bốc thăm)'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 font-mono font-black text-[11px]">
                                      {match.scoreTeam2.map((s, idx) => (
                                        <span key={idx} className="w-5 h-5 rounded bg-white text-slate-900 border border-slate-200 flex items-center justify-center shadow-2xs">
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Match Node Footer Actions */}
                                  {canManageTournaments && match.team1 && match.team2 && (
                                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                                      <button
                                        type="button"
                                        onClick={() => handleNotifyCourt(match)}
                                        className="px-2 py-0.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold flex items-center gap-1 border border-sky-200"
                                        title="Phát loa gọi 2 đội vào sân"
                                      >
                                        <Megaphone className="w-3 h-3 text-sky-600" />
                                        <span>Báo Sân</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenScoreModal(match)}
                                        className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 border border-emerald-300"
                                      >
                                        <PlayCircle className="w-3 h-3 text-emerald-600" />
                                        <span>Tỉ Số</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Final Champion Column */}
                    {(() => {
                      const lastRound = currentTournament.rounds[currentTournament.rounds.length - 1];
                      const finalMatch = lastRound?.matches[0];
                      const championTeam = finalMatch?.winnerTeamId
                        ? finalMatch.winnerTeamId === finalMatch.team1?.id
                          ? finalMatch.team1
                          : finalMatch.team2
                        : null;

                      return (
                        <div className="w-[200px] flex flex-col justify-center items-center text-center">
                          <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-100/90 to-amber-200/50 border-2 border-amber-400 shadow-lg space-y-3 w-full">
                            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto shadow-md">
                              <Trophy className="w-8 h-8 text-amber-950 animate-bounce" />
                            </div>
                            <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider">
                              🏆 NHÀ VÔ ĐỊCH
                            </div>
                            {championTeam ? (
                              <div className="space-y-1">
                                <div className="font-black text-sm text-slate-900 leading-tight">
                                  {championTeam.name}
                                </div>
                                <div className="text-[11px] font-bold text-emerald-700">
                                  Đội Trưởng: {championTeam.captainName || championTeam.player1.fullName}
                                </div>
                                <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white text-amber-900 font-black border border-amber-300 shadow-2xs">
                                  TIỀN THƯỞNG: {currentTournament.totalPrizePool.toLocaleString('vi-VN')} Đ
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 font-medium italic">
                                Đang chờ trận Chung Kết phân định ngôi vương
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <GitBranch className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">Chưa tiến hành bốc thăm phân nhánh</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Chuyển sang tab "Hồ Sơ Đội & Bốc Thăm" để thực hiện bốc thăm tự động hoặc thủ công.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('operations')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Tới Mục Bốc Thăm
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: CARDS GRID VIEW */}
          {bracketDisplayMode === 'cards' && (
            <div className="space-y-6">
              {currentTournament.rounds && currentTournament.rounds.length > 0 ? (
                currentTournament.rounds.map((round, rIdx) => (
                  <div key={round.roundIndex} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <h3 className="font-extrabold text-slate-900 text-base font-display">
                          {round.name}
                        </h3>
                        <span className="text-xs text-slate-500 font-semibold">
                          ({round.matches.length} trận)
                        </span>
                      </div>

                      {canManageTournaments && (
                        <button
                          type="button"
                          onClick={() => handleBulkNotifyCourts(rIdx)}
                          className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-300 flex items-center gap-1"
                        >
                          <Megaphone className="w-3.5 h-3.5 text-sky-600" />
                          <span>Gọi Sân Cả Vòng</span>
                        </button>
                      )}
                    </div>

                    {/* Matches Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {round.matches.map(match => {
                        const isFinished = match.status === 'finished';
                        const isLive = match.status === 'live';

                        return (
                          <div
                            key={match.id}
                            className={`rounded-2xl p-4 transition-all border ${
                              isLive
                                ? 'bg-white border-2 border-emerald-500 shadow-md shadow-emerald-500/10'
                                : isFinished
                                ? 'bg-white border border-slate-200/90 shadow-xs'
                                : 'bg-white border border-slate-200/90 shadow-xs'
                            }`}
                          >
                            {/* Top match header */}
                            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                              <span className="font-bold text-slate-600 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                {match.court} • {match.scheduledDate || currentTournament.startDate} ({match.scheduledTime})
                              </span>
                              <div className="flex items-center gap-1.5">
                                {canManageTournaments && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditSchedule(match)}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                                    title="Chỉnh sửa ngày, giờ, sân đấu"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {match.courtNotified && (
                                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                                    ĐÃ GỌI SÂN
                                  </span>
                                )}

                                {isLive && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] animate-pulse border border-emerald-300">
                                    <Radio className="w-3 h-3 text-emerald-600" /> ĐANG THI ĐẤU
                                  </span>
                                )}
                                {isFinished && (
                                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200">
                                    ĐÃ HOÀN THÀNH
                                  </span>
                                )}
                                {!isLive && !isFinished && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                                    CHỜ VÀO SÂN
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Teams Faceoff */}
                            <div className="py-3 space-y-2">
                              {/* Team 1 */}
                              <div
                                className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                                  match.winnerTeamId === match.team1?.id
                                    ? 'bg-emerald-50 border border-emerald-300 font-bold'
                                    : 'bg-slate-50 border border-slate-200/70'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {match.team1?.seed && (
                                    <span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[10px] font-black text-sky-700 shadow-2xs">
                                      #{match.team1.seed}
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                    {match.team1?.name || 'TBD (Chờ bốc thăm)'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-sm font-black text-emerald-700">
                                  {match.scoreTeam1.map((s, idx) => (
                                    <span
                                      key={idx}
                                      className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-xs shadow-2xs"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Team 2 */}
                              <div
                                className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                                  match.winnerTeamId === match.team2?.id
                                    ? 'bg-emerald-50 border border-emerald-300 font-bold'
                                    : 'bg-slate-50 border border-slate-200/70'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {match.team2?.seed && (
                                    <span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-[10px] font-black text-sky-700 shadow-2xs">
                                      #{match.team2.seed}
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                    {match.team2?.name || 'TBD (Chờ bốc thăm)'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-sm font-black text-sky-700">
                                  {match.scoreTeam2.map((s, idx) => (
                                    <span
                                      key={idx}
                                      className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-xs shadow-2xs"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Rest Notification & Referee Action */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                <span className="text-amber-500 font-bold">⚡</span>
                                {match.restNotice || '✓ Nghỉ tiêu chuẩn'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {canManageTournaments && match.team1 && match.team2 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleNotifyCourt(match)}
                                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 font-bold text-xs flex items-center gap-1 transition-all"
                                      title="Phát loa thông báo gọi sân"
                                    >
                                      <Megaphone className="w-3.5 h-3.5 text-sky-600" />
                                      <span>Gọi Sân</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenScoreModal(match)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-all"
                                    >
                                      <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Tỉ Số</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <GitBranch className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">Chưa tiến hành bốc thăm phân nhánh</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Chuyển sang tab "Hồ Sơ Đội & Bốc Thăm" để thực hiện bốc thăm tự động hoặc thủ công.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('operations')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Tới Mục Bốc Thăm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RULES & INTERNATIONAL STANDARDS & TIEBREAKER */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>Thể Lệ & Điều Lệ Thi Đấu Chính Thức</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Người chơi cần đọc kỹ thể lệ, luật tính điểm và chỉ số phụ trước khi đăng ký tham gia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterTeamModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-500/20"
              >
                + Đăng Ký Tham Gia Ngay
              </button>
            </div>

            {/* Rules Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                  1. Hình Thức & Thể Thức Thi Đấu
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {currentTournament.rules.matchFormatDesc}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-bold shadow-2xs">
                    Điểm chạm set: {currentTournament.rules.pointsToWinSet} pts
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-bold shadow-2xs">
                    Số set thắng: {currentTournament.rules.setsToWinMatch} sets
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-emerald-700 font-bold shadow-2xs">
                    Cách 2 điểm thắng
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] font-black text-sky-800 uppercase tracking-wider">
                  2. Quy Chuẩn & Tiêu Chuẩn Quốc Tế
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {currentTournament.rules.internationalStandards}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Áp dụng bóng thi đấu đạt chuẩn quốc tế, kích thước sân bãi và vợt thi đấu được trọng tài kiểm duyệt trước giờ thi đấu.
                </p>
              </div>
            </div>

            {/* Tiebreaker Standards Section */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Quy Tắc Xếp Hạng & Chỉ Số Phụ Quốc Tế (International Tiebreaker Order)</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                Khi có từ 2 đội trở lên bằng điểm số, thứ hạng trong bảng đấu sẽ được phân định theo thứ tự ưu tiên nghiêm ngặt sau:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {currentTournament.rules.tiebreakCriteria.map((crit, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-amber-200 flex items-center gap-3 text-xs shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center flex-shrink-0 border border-amber-200">
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-slate-800">{crit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics & Registration Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Lệ phí thi đấu</div>
                <div className="text-base font-black text-emerald-700 font-display mt-0.5">
                  {currentTournament.entryFee.toLocaleString('vi-VN')} VNĐ / Đội
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Tổng giải thưởng (Prize Pool)</div>
                <div className="text-base font-black text-amber-600 font-display mt-0.5">
                  {currentTournament.totalPrizePool.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500 font-medium">Hạn chót đăng ký hồ sơ</div>
                <div className="text-base font-black text-sky-700 font-display mt-0.5">
                  {currentTournament.registrationDeadline}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VĐV THAM GIA, ĐIỂM DANH & BỐC THĂM (BTC WORKFLOW) */}
      {(activeTab === 'operations' || (activeTab as any) === 'teams') && (
        <div className="space-y-6">
          {/* Workflow Stepper Header */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-300 uppercase mb-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Quy Trình Điều Hành Giải Đấu Chuẩn Quốc Tế</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 font-display">
                  VĐV Tham Gia, Điểm Danh & Điều Hành Bốc Thăm
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Ban Tổ Chức (BTC) quản lý danh sách VĐV, điểm danh thực tế, bốc thăm chia đội và bốc thăm đối đầu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsParticipantModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm / Bớt VĐV Từ Danh Sách Chung</span>
                </button>
              </div>
            </div>

            {/* Stepper Steps Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Bước 1: Danh Sách VĐV</div>
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>{participantAthletes.length} VĐV Ghi Danh</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Bước 2: Điểm Danh</div>
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>
                    {checkedInIds.length}/{participantAthletes.length} Có Mặt
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      checkedInIds.length >= 2 ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  ></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Bước 3: Chia Đội</div>
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>{currentTournament.registeredTeams.length} Đội Thi Đấu</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentTournament.registeredTeams.length >= 2 ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  ></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Bước 4: Bốc Thăm Nhánh</div>
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>
                    {currentTournament.status === 'in_progress'
                      ? 'Đã Bốc Nhánh'
                      : currentTournament.matchupDrawMethod === 'captain_draw'
                      ? 'Đội Trưởng Bốc'
                      : currentTournament.matchupDrawMethod === 'manual_pairing'
                      ? 'Ghép Thủ Công'
                      : 'Chờ Bốc Thăm'}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentTournament.status === 'in_progress' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  ></span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Bước 5: Phân Sân & Báo Sân</div>
                <div className="font-extrabold text-slate-900 flex items-center justify-between">
                  <span>
                    {currentTournament.rounds?.flatMap(r => r.matches).filter(m => m.courtNotified).length || 0}/
                    {currentTournament.rounds?.flatMap(r => r.matches).length || 0} Đã Gọi Sân
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentTournament.rounds?.length ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  ></span>
                </div>
              </div>
            </div>
          </div>

          {/* BAN TỔ CHỨC & ĐƠN ĐĂNG KÝ THAM GIA GIẢI ĐẤU CHỜ DUYỆT */}
          {currentTournament.registeredTeams.some(t => t.status === 'pending') && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-amber-950 flex items-center gap-2">
                      <span>Đơn Đăng Ký Đội Chờ Phê Duyệt</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-300">
                        {currentTournament.registeredTeams.filter(t => t.status === 'pending').length} đơn mới
                      </span>
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      {isOrganizer
                        ? 'Thành viên đăng ký tham gia giải. Ban tổ chức vui lòng kiểm tra và duyệt đội thi đấu.'
                        : 'Các đội đã gửi đơn đăng ký đang chờ Ban tổ chức giải phê duyệt danh sách chính thức.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRegisterTeamModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Đăng Ký Thêm Đội</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTournament.registeredTeams
                  .filter(t => t.status === 'pending')
                  .map(team => (
                    <div
                      key={team.id}
                      className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                            <span>{team.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-black bg-amber-100 text-amber-800 border border-amber-200">
                              Chờ Duyệt
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Ngày đăng ký: {team.registrationDate || 'Hôm nay'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 truncate">
                          <img
                            src={team.player1.avatarUrl}
                            alt={team.player1.fullName}
                            className="w-7 h-7 rounded-md object-cover"
                          />
                          <div className="truncate">
                            <div className="font-bold text-slate-900 truncate">{team.player1.fullName}</div>
                            <div className="text-[10px] text-slate-500 truncate">{team.player1.clubName || 'VĐV Tự do'}</div>
                          </div>
                        </div>
                        {team.player2 ? (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 truncate">
                            <img
                              src={team.player2.avatarUrl}
                              alt={team.player2.fullName}
                              className="w-7 h-7 rounded-md object-cover"
                            />
                            <div className="truncate">
                              <div className="font-bold text-slate-900 truncate">{team.player2.fullName}</div>
                              <div className="text-[10px] text-slate-500 truncate">{team.player2.clubName || 'VĐV Tự do'}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
                            Thi đấu đơn
                          </div>
                        )}
                      </div>

                      {isOrganizer && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleRejectTeam(team.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-extrabold text-xs transition-colors"
                          >
                            Từ Chối
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApproveTeam(team.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Phê Duyệt Đội</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* BƯỚC 1 & BƯỚC 2: DANH SÁCH VĐV THAM GIA & ĐIỂM DANH */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>Bước 1 & 2: VĐV Tham Gia & Điểm Danh Trước Trận</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tích chọn trạng thái có mặt thực tế tại sân trước khi tiến hành chia đội bốc thăm.
                </p>
              </div>

              {canManageTournaments && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCheckInAll}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Điểm Danh Nhanh Tất Cả</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCheckIn}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs border border-slate-300"
                  >
                    Bỏ Điểm Danh
                  </button>
                </div>
              )}
            </div>

            {/* Participants Grid with Check-in Status */}
            {participantAthletes.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">Chưa có VĐV nào trong danh sách tham gia giải</p>
                <p className="text-[11px] text-slate-500 mt-1 mb-3">
                  Bấm nút bên dưới để chọn bổ sung VĐV từ danh sách quản lý chung của hệ thống.
                </p>
                <button
                  type="button"
                  onClick={() => setIsParticipantModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md"
                >
                  + Thêm VĐV Vào Giải Đấu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {participantAthletes.map(ath => {
                  const isCheckedIn = checkedInIds.includes(ath.id);
                  const isFemale = ath.gender === 'female';

                  return (
                    <div
                      key={ath.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCheckedIn
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                          : 'bg-white border-slate-200 opacity-90'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={ath.avatarUrl}
                            alt={ath.fullName}
                            className={`w-11 h-11 rounded-xl object-cover border-2 flex-shrink-0 ${
                              isFemale ? 'border-rose-300' : 'border-sky-300'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="font-extrabold text-sm text-slate-900 truncate flex items-center gap-1.5">
                              <span>{ath.fullName}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                                  isFemale ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {isFemale ? '♀ Nữ' : '♂ Nam'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              "{ath.nickname || 'N/A'}" • {ath.clubName}
                            </div>
                            <div className="text-[11px] font-extrabold text-emerald-700 mt-0.5">
                              Elo: {ath.eloRating} {ath.duprRating ? `• DUPR: ${ath.duprRating.toFixed(2)}` : ''}
                            </div>
                          </div>
                        </div>

                        {canManageTournaments && (
                          <button
                            type="button"
                            onClick={() => handleToggleParticipant(ath.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa khỏi giải đấu"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-semibold text-slate-500">
                          Trạng thái thi đấu:
                        </span>
                        {canManageTournaments ? (
                          <button
                            type="button"
                            onClick={() => handleToggleCheckIn(ath.id)}
                            className={`px-3 py-1 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-2xs ${
                              isCheckedIn
                                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                            }`}
                          >
                            {isCheckedIn ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>ĐÃ ĐIỂM DANH</span>
                              </>
                            ) : (
                              <span>CHƯA CÓ MẶT</span>
                            )}
                          </button>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isCheckedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isCheckedIn ? 'ĐÃ ĐIỂM DANH' : 'CHƯA CÓ MẶT'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BƯỚC 3: BỐC THĂM CHIA ĐỘI (PAIRING DRAW) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Dices className="w-5 h-5 text-indigo-600" />
                  <span>Bước 3: Bốc Thăm Chia Đội (Tự Động Hoặc VĐV Bốc Thăm)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sau khi điểm danh ({checkedInIds.length} VĐV sẵn sàng), tiến hành ghép cặp thi đấu và chỉ định Đội Trưởng.
                </p>
              </div>

              {canManageTournaments && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualTeamName('');
                      setManualPlayer1Id(checkedInIds[0] || athletes[0]?.id || '');
                      setManualPlayer2Id(checkedInIds[1] || athletes[1]?.id || '');
                      setIsManualTeamModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20"
                    title="Tự tay chọn 2 VĐV ghép thành đội và đặt tên đội"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>👥 Chọn Đội Thủ Công</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePairTeams('auto_balanced')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20"
                    title="Ghép VĐV Elo cao nhất với Elo thấp nhất để cân bằng sức mạnh đôi"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ Bốc Tự Động Cân Bằng Elo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePairTeams('auto_random')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20"
                    title="Xáo trộn ngẫu nhiên hoàn toàn"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>🎲 Bốc Ngẫu Nhiên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePairTeams('manual_lottery')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shadow-purple-600/20"
                    title="Vận động viên bốc thăm số thứ tự cặp"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>🎯 VĐV Bốc Thẻ Số</span>
                  </button>
                </div>
              )}
            </div>

            {/* Paired Teams Display */}
            {currentTournament.registeredTeams.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa tiến hành chia đội. Hãy điểm danh các VĐV và chọn phương thức bốc thăm chia đội phía trên.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTournament.registeredTeams.map(team => (
                  <div
                    key={team.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center border border-indigo-200">
                          #{team.seed || '—'}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900 truncate">
                          {team.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {team.drawLotNumber ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            <span>Lá Thăm #{team.drawLotNumber}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Chưa bốc nhánh</span>
                        )}

                        {canManageTournaments && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTeam(team.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa đội này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Players Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                        <img
                          src={team.player1.avatarUrl}
                          alt={team.player1.fullName}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="truncate">
                          <div className="font-extrabold text-slate-900 truncate flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                            <span className="truncate">{team.player1.fullName}</span>
                          </div>
                          <div className="text-[10px] text-emerald-700 font-bold">Đội Trưởng (Captain)</div>
                        </div>
                      </div>

                      {team.player2 ? (
                        <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                          <img
                            src={team.player2.avatarUrl}
                            alt={team.player2.fullName}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div className="truncate">
                            <div className="font-bold text-slate-900 truncate">
                              {team.player2.fullName}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">{team.player2.clubName}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[11px] text-slate-400 font-medium">
                          Thi đấu đơn
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BƯỚC 4: BỐC THĂM ĐỐI ĐẦU (MATCHUP DRAW - TỰ ĐỘNG, ĐỘI TRƯỞNG HOẶC THỦ CÔNG) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>Bước 4: Bốc Thăm Đối Đầu (Tự Động, Đội Trưởng Hoặc Ghép Thủ Công)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ban Tổ Chức có thể lựa chọn tự động xếp lịch, để các Đội Trưởng bốc thăm số nhánh, hoặc chỉ định cặp đấu thủ công.
                </p>
              </div>

              {canManageTournaments && currentTournament.registeredTeams.length >= 2 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoScheduleMatchups}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Hình Thức 1: Tự Động Xếp Lịch</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCaptainDrawAllAtOnce}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Hình Thức 2: Đội Trưởng Bốc Thăm</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenManualMatchupModal}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md shadow-teal-600/20"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Hình Thức 3: Lựa Chọn Thủ Công</span>
                  </button>

                  {currentTournament.rounds?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCancelDrawModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-300 shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Hủy / Reset Bốc Thăm</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Captains Draw Cards */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                    <span>Khu Vực Bốc Thăm Đối Đầu Của Các Đội Trưởng</span>
                  </h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mỗi Đội Trưởng bấm nút để bốc lá thăm xác định vị trí trong sơ đồ nhánh đấu.
                  </p>
                </div>

                {canManageTournaments && (
                  <button
                    type="button"
                    onClick={handleFinalizeCaptainDraw}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4 text-amber-300" />
                    <span>Xác Nhận Nhánh Đấu & Khởi Tranh</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentTournament.registeredTeams.map(team => {
                  const hasDrawn = team.drawLotNumber !== undefined;

                  return (
                    <div
                      key={team.id}
                      className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-2 text-center"
                    >
                      <div className="text-[11px] font-bold text-slate-500 uppercase truncate">
                        {team.name}
                      </div>

                      <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-black text-xl border-2 transition-all shadow-inner bg-slate-50 border-slate-200 text-slate-700">
                        {hasDrawn ? (
                          <span className="text-amber-600 font-extrabold text-2xl animate-in zoom-in">
                            #{team.drawLotNumber}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">?</span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-900 truncate">
                        Đội Trưởng: <span className="text-emerald-700">{team.captainName || team.player1.fullName}</span>
                      </div>

                      {canManageTournaments && (
                        <button
                          type="button"
                          onClick={() => handleCaptainDrawNumber(team.id)}
                          className={`w-full py-1.5 px-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1 ${
                            hasDrawn
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          }`}
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>{hasDrawn ? 'Bốc Lại Lá Thăm' : 'Đội Trưởng Bốc Thăm'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BƯỚC 5: LỰA CHỌN SÂN THI ĐẤU CHO TỪNG TRẬN VÀ THÔNG BÁO SÂN THI ĐẤU */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-emerald-600" />
                  <span>Bước 5: Lựa Chọn Sân Thi Đấu Cho Từng Trận & Thông Báo Sân Thi Đấu</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chỉ định sân thi đấu cụ thể cho từng cặp trận và phát loa thông báo đẩy realtime cho vận động viên, trọng tài và khán giả.
                </p>
              </div>

              {canManageTournaments && currentTournament.rounds?.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBulkNotifyCourts()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20"
                  >
                    <Bell className="w-4 h-4 animate-bounce" />
                    <span>📣 Phát Loa Gọi Sân Toàn Bộ Trận</span>
                  </button>
                </div>
              )}
            </div>

            {(!currentTournament.rounds || currentTournament.rounds.length === 0) ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                Chưa có lịch thi đấu. Vui lòng hoàn thành Bước 3 (Chia đội) và Bước 4 (Bốc thăm nhánh) trước.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-3 px-3">Vòng Đấu</th>
                        <th className="py-3 px-3">Cặp Đấu (Đội 1 vs Đội 2)</th>
                        <th className="py-3 px-3">Lựa Chọn Sân Thi Đấu</th>
                        <th className="py-3 px-3">Ngày & Giờ Thi Đấu</th>
                        <th className="py-3 px-3 text-center">Trạng Thái Gọi Sân</th>
                        <th className="py-3 px-3 text-right">Thao Tác BTC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {currentTournament.rounds.flatMap(round =>
                        round.matches.map(match => {
                          const courtOptions = [
                            'Sân Trung Tâm A',
                            'Sân Trung Tâm B',
                            'Sân 1',
                            'Sân 2',
                            'Sân 3',
                            'Sân 4',
                            'Sân VIP 1',
                            'Sân VIP 2',
                          ];

                          return (
                            <tr key={match.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-3 font-extrabold text-slate-800 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[11px] font-black">
                                  {match.roundName}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <div className="space-y-0.5 font-bold text-slate-900">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-emerald-700 font-extrabold">•</span>
                                    <span>{match.team1?.name || 'Chờ xác định'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <span className="text-sky-700 font-extrabold">•</span>
                                    <span>{match.team2?.name || 'Chờ xác định'}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                {canManageTournaments ? (
                                  <select
                                    value={match.court || 'Sân Trung Tâm A'}
                                    onChange={e => handleUpdateMatchCourt(match.id, e.target.value)}
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-300 font-extrabold text-slate-900 text-xs focus:outline-none focus:border-emerald-500 shadow-2xs"
                                  >
                                    {courtOptions.map(c => (
                                      <option key={c} value={c}>
                                        {c}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="font-extrabold text-slate-800">{match.court}</span>
                                )}
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-slate-700">
                                    {match.scheduledDate || currentTournament.startDate} ({match.scheduledTime})
                                  </span>
                                  {canManageTournaments && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditSchedule(match)}
                                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                                      title="Chỉnh sửa giờ và ngày"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                {match.courtNotified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] border border-emerald-300">
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>ĐÃ PHÁT LOA</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] border border-slate-200">
                                    CHƯA GỌI SÂN
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                {canManageTournaments && match.team1 && match.team2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleNotifyCourt(match)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-xs"
                                  >
                                    <Megaphone className="w-3.5 h-3.5" />
                                    <span>Thông Báo Sân</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STANDINGS TABLE (ROUND ROBIN) WITH INTERNATIONAL TIEBREAK CRITERIA */}
      {activeTab === 'standings' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display">
                Bảng Xếp Hạng Vòng Bảng Quốc Tế
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Thứ hạng được tự động xếp theo: Điểm trận &gt; Đối đầu &gt; Hiệu số Set &gt; Hiệu số Điểm &gt; Tổng Điểm.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-3 text-center">Hạng</th>
                  <th className="py-3 px-3">Đội Thi Đấu</th>
                  <th className="py-3 px-2 text-center">Trận</th>
                  <th className="py-3 px-2 text-center">Thắng</th>
                  <th className="py-3 px-2 text-center">Thua</th>
                  <th className="py-3 px-2 text-center">Set T/B</th>
                  <th className="py-3 px-2 text-center">HS Set</th>
                  <th className="py-3 px-2 text-center">Điểm T/B</th>
                  <th className="py-3 px-2 text-center">HS Điểm</th>
                  <th className="py-3 px-3 text-center text-emerald-700 font-black">Điểm Số</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentTournament.standings && currentTournament.standings.length > 0 ? (
                  currentTournament.standings.map(row => (
                    <tr key={row.teamId} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex w-6 h-6 items-center justify-center rounded-full font-black text-xs ${
                            row.rank === 1
                              ? 'bg-amber-400 text-amber-950 font-black'
                              : row.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : row.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {row.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">{row.teamName}</td>
                      <td className="py-3 px-2 text-center text-slate-700 font-bold">{row.played}</td>
                      <td className="py-3 px-2 text-center text-emerald-700 font-bold">{row.won}</td>
                      <td className="py-3 px-2 text-center text-rose-600 font-bold">{row.lost}</td>
                      <td className="py-3 px-2 text-center text-slate-600">
                        {row.setsWon}/{row.setsLost}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-800">
                        {row.setDiff > 0 ? `+${row.setDiff}` : row.setDiff}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-600">
                        {row.pointsWon}/{row.pointsLost}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-bold text-slate-800">
                        {row.pointDiff > 0 ? `+${row.pointDiff}` : row.pointDiff}
                      </td>
                      <td className="py-3 px-3 text-center font-black text-emerald-700 text-sm font-display">
                        {row.points}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      Chưa có kết quả trận đấu vòng bảng nào được hoàn thành.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIVE SCORING MODAL */}
      {scoringMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Cập Nhật Tỉ Số Trực Tiếp - {scoringMatch.match.court}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setScoringMatch(null)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center font-bold text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-emerald-800 uppercase text-[10px] font-black">Đội 1</div>
                  <div className="text-slate-900 text-sm mt-0.5 font-extrabold">{scoringMatch.match.team1?.name}</div>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="text-sky-800 uppercase text-[10px] font-black">Đội 2</div>
                  <div className="text-slate-900 text-sm mt-0.5 font-extrabold">{scoringMatch.match.team2?.name}</div>
                </div>
              </div>

              {/* Set 1 Inputs */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-700 uppercase">Hiệp 1 (Set 1)</div>
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="number"
                    value={scoreSet1T1}
                    onChange={e => setScoreSet1T1(Number(e.target.value))}
                    className="w-16 py-2 rounded-xl bg-white border border-slate-300 text-center text-lg font-black text-emerald-700 shadow-2xs"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    value={scoreSet1T2}
                    onChange={e => setScoreSet1T2(Number(e.target.value))}
                    className="w-16 py-2 rounded-xl bg-white border border-slate-300 text-center text-lg font-black text-sky-700 shadow-2xs"
                  />
                </div>
              </div>

              {/* Set 2 Inputs */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-700 uppercase">Hiệp 2 (Set 2)</div>
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="number"
                    value={scoreSet2T1}
                    onChange={e => setScoreSet2T1(Number(e.target.value))}
                    className="w-16 py-2 rounded-xl bg-white border border-slate-300 text-center text-lg font-black text-emerald-700 shadow-2xs"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    value={scoreSet2T2}
                    onChange={e => setScoreSet2T2(Number(e.target.value))}
                    className="w-16 py-2 rounded-xl bg-white border border-slate-300 text-center text-lg font-black text-sky-700 shadow-2xs"
                  />
                </div>
              </div>

              {/* Set 3 Inputs (Tiebreak set if needed) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold text-slate-700 uppercase">
                  Hiệp 3 (Set Quyết Định - Nếu Hòa)
                </div>
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="number"
                    value={scoreSet3T1}
                    onChange={e => setScoreSet3T1(Number(e.target.value))}
                    className="w-16 py-2 rounded-xl bg-white border border-slate-300 text-center text-lg font-black text-emerald-700 shadow-2xs"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    value={scoreSet3T2}
                    onChange={e => setScoreSet3T2(Number(e.target.value))}
                    className="w-16 py-2 rounded-xl bg-white border border-slate-300 text-center text-lg font-black text-sky-700 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveScore(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  Lưu Tiến Độ (Đang Đấu)
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveScore(true)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/30"
                >
                  Hoàn Thành & Đẩy Đội Thắng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-black text-slate-900 font-display">
                  Tạo Giải Đấu Thể Thao Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg bg-white text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">Tên Giải Đấu *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: GIẢI VÔ ĐỊCH PICKLEBALL TOÀN THÀNH 2026"
                    value={newTourData.name}
                    onChange={e => setNewTourData({ ...newTourData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Mã Giải Đấu *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: PICKLE-SUMMER"
                    value={newTourData.code}
                    onChange={e => setNewTourData({ ...newTourData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 uppercase font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Bộ Môn Thể Thao *</label>
                  <select
                    value={newTourData.sportCategory}
                    onChange={e => setNewTourData({ ...newTourData, sportCategory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Pickleball">Pickleball</option>
                    <option value="Cầu Lông">Cầu Lông</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Bida Carom 3 Băng">Bida Carom 3 Băng</option>
                    <option value="Bida Pool 9 Bi">Bida Pool 9 Bi</option>
                    <option value="Bóng Bàn">Bóng Bàn</option>
                    <option value="Bóng Đá Mini">Bóng Đá Mini</option>
                    <option value="Khác">Bộ Môn Khác...</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Hình Thức Thi Đấu *</label>
                  <select
                    value={newTourData.competitionForm}
                    onChange={e => setNewTourData({ ...newTourData, competitionForm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Đôi Nam Nữ">Đôi Nam Nữ (Mixed Doubles)</option>
                    <option value="Đôi Nam">Đôi Nam (Men's Doubles)</option>
                    <option value="Đôi Nữ">Đôi Nữ (Women's Doubles)</option>
                    <option value="Đơn Nam">Đơn Nam (Men's Singles)</option>
                    <option value="Đơn Nữ">Đơn Nữ (Women's Singles)</option>
                    <option value="Đồng Đội Tự Do">Đồng Đội / Tự Do</option>
                    <option value="Khác">Hình Thức Khác...</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Quy Mô Thể Thức Thi Đấu</label>
                  <select
                    value={newTourData.format}
                    onChange={e => setNewTourData({ ...newTourData, format: e.target.value as TournamentFormat })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="round_robin">Vòng Tròn Tính Điểm (Round Robin)</option>
                    <option value="single_elimination">Loại Trực Tiếp (Knockout Bracket)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Lựa Chọn Vòng Đấu Bắt Đầu *</label>
                  <select
                    value={newTourData.startingRound}
                    onChange={e => setNewTourData({ ...newTourData, startingRound: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="quarter_finals">Tứ Kết (8 đội / cặp)</option>
                    <option value="semi_finals">Bán Kết (4 đội / cặp)</option>
                    <option value="finals">Chung Kết (2 đội / cặp)</option>
                    <option value="round_of_16">Vòng 1/8 (16 đội / cặp)</option>
                    <option value="round_robin">Vòng Bảng Tính Điểm (Toàn bảng)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Số Set Thi Đấu Cho 1 Trận *</label>
                  <select
                    value={newTourData.setsCount}
                    onChange={e => setNewTourData({ ...newTourData, setsCount: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 Set (Đánh 1 hiệp chạm điểm thắng)</option>
                    <option value={3}>3 Set Thắng 2 (Bo3 - Chuẩn thi đấu)</option>
                    <option value={5}>5 Set Thắng 3 (Bo5 - Đỉnh cao chung kết)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Điểm Chạm Thắng Mỗi Set</label>
                  <select
                    value={newTourData.pointsPerSet}
                    onChange={e => setNewTourData({ ...newTourData, pointsPerSet: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={11}>11 Điểm (Chuẩn Pickleball - Cách 2 điểm)</option>
                    <option value={15}>15 Điểm (Chuẩn mở rộng)</option>
                    <option value={21}>21 Điểm (Chuẩn Cầu Lông / Pickleball Rally)</option>
                    <option value={30}>30 Điểm (Chuẩn Bida Carom)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    Thể Lệ Tính Điểm BXH
                  </label>
                  <select
                    value={newTourData.scoringRule}
                    onChange={e =>
                      setNewTourData({
                        ...newTourData,
                        scoringRule: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="win2_loss1_forfeit0">Thắng 2 điểm - Thua 1 điểm - Bỏ cuộc 0 điểm</option>
                    <option value="win3_loss0">Thắng 3 điểm - Thua 0 điểm</option>
                    <option value="win1_loss0">Thắng 1 điểm - Thua 0 điểm</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold block">Số Đội Tham Gia (Tùy Chọn) *</label>
                    <span className="text-[11px] font-mono font-bold text-emerald-700">{newTourData.maxTeams} đội</span>
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="number"
                      min={2}
                      max={64}
                      required
                      placeholder="Nhập số đội tùy ý..."
                      value={newTourData.maxTeams}
                      onChange={e => setNewTourData({ ...newTourData, maxTeams: Number(e.target.value) || 2 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {[4, 6, 8, 12, 16, 24, 32].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNewTourData({ ...newTourData, maxTeams: n })}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                            newTourData.maxTeams === n
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {n} đội
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-700 font-bold block mb-1">Địa Điểm Tổ Chức</label>
                  <input
                    type="text"
                    value={newTourData.venue}
                    onChange={e => setNewTourData({ ...newTourData, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Lệ Phí Thi Đấu (VNĐ)</label>
                  <input
                    type="number"
                    value={newTourData.entryFee}
                    onChange={e => setNewTourData({ ...newTourData, entryFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Tổng Tiền Thưởng (VNĐ)</label>
                  <input
                    type="number"
                    value={newTourData.totalPrizePool}
                    onChange={e => setNewTourData({ ...newTourData, totalPrizePool: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/20"
                >
                  Khởi Tạo Giải Đấu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM MỐC THỜI GIAN LINH HOẠT CHO GIẢI ĐẤU */}
      {isAddMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Thêm Mốc Thời Gian Cho Giải Đấu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMilestoneModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Tên Mốc Thời Gian (Tự đặt linh hoạt) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hạn nộp danh sách chốt, Vòng Tứ Kết, Gala Trao Giải..."
                  value={newMilestoneData.title}
                  onChange={e => setNewMilestoneData({ ...newMilestoneData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                />
                {/* Quick suggestions pills */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    'Hạn nộp danh sách & lệ phí',
                    'Họp kỹ thuật & Bốc thăm',
                    'Lễ Khai Mạc Giải',
                    'Thi đấu Vòng Bảng',
                    'Vòng Tứ Kết',
                    'Vòng Bán Kết',
                    'Chung Kết & Trao Giải',
                  ].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setNewMilestoneData({ ...newMilestoneData, title: sug })}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-[10px] text-slate-600 font-semibold"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Ngày Diễn Ra *</label>
                  <input
                    type="date"
                    required
                    value={newMilestoneData.date}
                    onChange={e => setNewMilestoneData({ ...newMilestoneData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Khung Giờ</label>
                  <input
                    type="time"
                    value={newMilestoneData.time}
                    onChange={e => setNewMilestoneData({ ...newMilestoneData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Địa Điểm / Ghi Chú</label>
                <input
                  type="text"
                  placeholder="VD: Sân Trung Tâm Court A / Trực tiếp Fanpage"
                  value={newMilestoneData.venueOrNotes}
                  onChange={e => setNewMilestoneData({ ...newMilestoneData, venueOrNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Trạng Thái Ban Đầu</label>
                <select
                  value={newMilestoneData.status}
                  onChange={e => setNewMilestoneData({ ...newMilestoneData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="upcoming">⏳ Sắp Tới (Upcoming)</option>
                  <option value="ongoing">⚡ Đang Diễn Ra (Ongoing)</option>
                  <option value="completed">✓ Đã Hoàn Thành (Completed)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMilestoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/20"
                >
                  + Lưu Mốc Thời Gian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER TEAM MODAL */}
      {isRegisterTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-base text-slate-900">Đăng Ký Tham Gia Giải Đấu</h3>
              <button
                type="button"
                onClick={() => setIsRegisterTeamModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterTeam} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Tên Đội Thi Đấu *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Song Sát Sài Gòn"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Vận Động Viên 1 *</label>
                <select
                  value={player1Id}
                  onChange={e => setPlayer1Id(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.clubName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Vận Động Viên 2 (Nếu đánh đôi)</label>
                <select
                  value={player2Id}
                  onChange={e => setPlayer2Id(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Không có (Đánh đơn)</option>
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.clubName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  {isOrganizer
                    ? 'Bạn là Ban tổ chức: Đội sẽ được tự động kích hoạt và xác nhận ngay lập tức.'
                    : `Lưu ý: Đơn đăng ký sẽ được gửi tới Ban tổ chức (${currentTournament.creatorName || 'BTC'}) để phê duyệt trước khi xếp lịch thi đấu.`}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/20"
                >
                  {isOrganizer ? 'Xác Nhận Đăng Ký' : 'Gửi Đơn Đăng Ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT MATCH SCHEDULE (DATE, TIME, COURT) */}
      {editingScheduleMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Chỉnh Sửa Lịch & Sân Thi Đấu
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingScheduleMatch(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                {editingScheduleMatch.roundName}
              </span>
              <div className="font-black text-slate-900 text-sm">
                {editingScheduleMatch.team1Name} <span className="text-emerald-600">VS</span> {editingScheduleMatch.team2Name}
              </div>
            </div>

            <form onSubmit={handleSaveMatchSchedule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Ngày Thi Đấu
                </label>
                <input
                  type="date"
                  value={editingScheduleMatch.date}
                  onChange={e =>
                    setEditingScheduleMatch({ ...editingScheduleMatch, date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Giờ Thi Đấu (Dự kiến)
                </label>
                <input
                  type="time"
                  value={editingScheduleMatch.time}
                  onChange={e =>
                    setEditingScheduleMatch({ ...editingScheduleMatch, time: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Sân Thi Đấu
                </label>
                <select
                  value={editingScheduleMatch.court}
                  onChange={e =>
                    setEditingScheduleMatch({ ...editingScheduleMatch, court: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Sân Trung Tâm A">Sân Trung Tâm A</option>
                  <option value="Sân Trung Tâm B">Sân Trung Tâm B</option>
                  <option value="Sân 1">Sân 1</option>
                  <option value="Sân 2">Sân 2</option>
                  <option value="Sân 3">Sân 3</option>
                  <option value="Sân 4">Sân 4</option>
                  <option value="Sân VIP 1">Sân VIP 1</option>
                  <option value="Sân VIP 2">Sân VIP 2</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingScheduleMatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-600/20"
                >
                  Lưu Lịch Thi Đấu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM CANCEL / RESET DRAW */}
      {isCancelDrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Hủy Lịch & Reset Bốc Thăm?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thao tác sẽ xóa sơ đồ nhánh hiện tại để bạn tạo lại.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed font-medium">
              Bạn có chắc chắn muốn hủy bỏ toàn bộ lịch thi đấu và kết quả bốc thăm hiện tại? 
              <br />
              <span className="font-bold">Lưu ý:</span> Danh sách vận động viên và các đội đã tham gia vẫn được lưu trữ nguyên vẹn để bạn thực hiện lại Bước 3 hoặc Bước 4.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setIsCancelDrawModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Không, Quay Lại
              </button>
              <button
                type="button"
                onClick={handleCancelDraw}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xác Nhận Hủy & Làm Lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: STEP 3 MANUAL TEAM PAIRING */}
      {isManualTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Chọn Đội Thủ Công (Bước 3)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualTeamModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualTeam} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Vận Động Viên 1 (Đội Trưởng) *
                </label>
                <select
                  value={manualPlayer1Id}
                  onChange={e => setManualPlayer1Id(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  required
                >
                  {athletes.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.clubName}) • ELO: {a.eloRating}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Vận Động Viên 2 (Nếu đánh đôi)
                </label>
                <select
                  value={manualPlayer2Id}
                  onChange={e => setManualPlayer2Id(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Không có (Đánh đơn) --</option>
                  {athletes
                    .filter(a => a.id !== manualPlayer1Id)
                    .map(a => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.clubName}) • ELO: {a.eloRating}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Tên Đội (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Để trống sẽ tự động lấy tên 2 VĐV"
                  value={manualTeamName}
                  onChange={e => setManualTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsManualTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md shadow-indigo-600/20"
                >
                  + Thêm Đội Này
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: STEP 4 MANUAL MATCHUP PAIRING */}
      {isManualMatchupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Lựa Chọn Thủ Công Cặp Đối Đầu (Bước 4 - Hình Thức 3)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chỉ định trực tiếp các cặp đấu, sân đấu và thời gian thi đấu cho giải.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualMatchupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {manualPairs.map((pair, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-slate-800 uppercase">
                      Cặp Đấu #{idx + 1}
                    </span>
                    {manualPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setManualPairs(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-800 text-xs font-bold"
                      >
                        Xóa cặp này
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Đội 1 *</label>
                      <select
                        value={pair.team1Id}
                        onChange={e => {
                          const val = e.target.value;
                          setManualPairs(prev =>
                            prev.map((p, i) => (i === idx ? { ...p, team1Id: val } : p))
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                      >
                        {currentTournament.registeredTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Đội 2 *</label>
                      <select
                        value={pair.team2Id}
                        onChange={e => {
                          const val = e.target.value;
                          setManualPairs(prev =>
                            prev.map((p, i) => (i === idx ? { ...p, team2Id: val } : p))
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                      >
                        {currentTournament.registeredTeams.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Sân Thi Đấu</label>
                      <select
                        value={pair.court}
                        onChange={e => {
                          const val = e.target.value;
                          setManualPairs(prev =>
                            prev.map((p, i) => (i === idx ? { ...p, court: val } : p))
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                      >
                        <option value="Sân Trung Tâm A">Sân Trung Tâm A</option>
                        <option value="Sân Trung Tâm B">Sân Trung Tâm B</option>
                        <option value="Sân 1">Sân 1</option>
                        <option value="Sân 2">Sân 2</option>
                        <option value="Sân 3">Sân 3</option>
                        <option value="Sân 4">Sân 4</option>
                        <option value="Sân VIP 1">Sân VIP 1</option>
                        <option value="Sân VIP 2">Sân VIP 2</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Giờ Dự Kiến</label>
                      <input
                        type="time"
                        value={pair.time}
                        onChange={e => {
                          const val = e.target.value;
                          setManualPairs(prev =>
                            prev.map((p, i) => (i === idx ? { ...p, time: val } : p))
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const teams = currentTournament.registeredTeams;
                  setManualPairs(prev => [
                    ...prev,
                    {
                      team1Id: teams[0]?.id || '',
                      team2Id: teams[1]?.id || '',
                      court: 'Sân 1',
                      time: '09:00',
                      date: currentTournament.startDate || new Date().toISOString().slice(0, 10),
                    },
                  ]);
                }}
                className="w-full py-2.5 rounded-xl border border-dashed border-teal-400 bg-teal-50/50 hover:bg-teal-50 text-teal-800 font-bold text-xs"
              >
                + Thêm Cặp Trận Đấu Nữa
              </button>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setIsManualMatchupModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmManualMatchups}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-md shadow-teal-600/20 flex items-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Xác Nhận Cặp Đấu & Tạo Sơ Đồ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Edit Tournament Modal */}
      {isEditTourModalOpen && editingTournament && (
        <EditTournamentModal
          isOpen={isEditTourModalOpen}
          onClose={() => {
            setIsEditTourModalOpen(false);
            setEditingTournament(null);
          }}
          tournament={editingTournament}
          onSaveTournament={updated => {
            onUpdateTournament(updated);
            if (selectedTournamentId === updated.id) {
              setSelectedTournamentId(updated.id);
            }
          }}
          onDeleteTournament={onDeleteTournament}
          onTriggerNotification={onTriggerNotification}
        />
      )}

      {/* Delete Tournament Confirmation Dialog */}
      {tourToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Xác Nhận Xóa Giải Đấu?
                </h3>
                <p className="text-xs text-slate-500">Quyền quản trị Super Admin / Admin</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn giải đấu <strong className="text-slate-900 font-extrabold">"{tourToDelete.name}"</strong>? Mọi thông số, lịch thi đấu và tỉ số sẽ được dọn dẹp khỏi hệ thống.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setTourToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTournament}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-md shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
              >
                Xác Nhận Xóa Giải
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
