export type UserRole =
  | 'super_admin' // Super Admin quản lý toàn bộ trang & phân quyền
  | 'admin' // Admin quản lý Nhóm & CLB
  | 'organizer' // Ban Tổ Chức Giải (Tournament Organizer / BTC)
  | 'coach' // Huấn Luyện Viên
  | 'referee' // Trọng Tài
  | 'athlete'; // Vận Động Viên

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  clubId?: string;
  athleteId?: string;
  assignedRoleBy?: string; // ID of Super Admin who assigned role
  assignedDate?: string;
}

export interface ClubGuest {
  id: string;
  name: string;
  phone?: string;
  feePaid?: boolean;
  notes?: string;
}

export interface ClubJoinRequest {
  id: string;
  clubId: string;
  clubName: string;
  userId: string;
  userName: string;
  athleteId?: string;
  athleteName: string;
  athletePhone?: string;
  sportTier?: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ClubActivity {
  id: string;
  clubId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  description?: string;
  attendeeAthleteIds: string[]; // Member athlete IDs checked-in
  guests: ClubGuest[]; // Guest participants with auto-names Khách 01, Khách 02...
  notified?: boolean;
  createdAt: string;
}

export interface ClubGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  logoUrl: string;
  leaderId: string;
  leaderName: string;
  passwordHash: string; // Protected with password to prevent unauthorized edits
  createdAt: string;
  memberCount: number;
  fundBalance: number;
  contactPhone: string;
  slogan?: string;
  venueAddress?: string;
  activities?: ClubActivity[];
  customTiers?: string[];
  joinRequests?: ClubJoinRequest[];
}

export interface MatchHistoryRecord {
  id: string;
  tournamentId?: string;
  tournamentName: string;
  date: string;
  discipline: string;
  opponentName: string;
  result: 'win' | 'loss';
  score: string;
  round: string;
  stage: string;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  tournamentName: string;
  year: number;
  medal: 'gold' | 'silver' | 'bronze' | 'mvp';
  discipline: string;
}

export interface Athlete {
  id: string;
  fullName: string;
  nickname: string;
  avatarUrl: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string; // YYYY-MM-DD
  age: number;
  phone: string;
  email: string;
  address: string;
  identityNumber: string; // CCCD / ID
  clubId: string;
  clubName: string;
  sportType: 'Pickleball' | 'Billiards' | 'Cầu Lông' | 'Tennis' | 'Bóng Đá' | string;
  rankingTier:
    | 'Chuyên Nghiệp'
    | 'Bán Chuyên'
    | 'Nghiệp Dư'
    | 'Phong Trào Hạng A'
    | 'Phong Trào Hạng B'
    | 'Newbie'
    | 'Muỗi'
    | 'Ruồi'
    | 'Gà'
    | 'Cọp'
    | 'Đại Bàng'
    | 'Voi'
    | string;
  customTierGroup?: string;
  eloRating: number;
  duprRating?: number; // for Pickleball
  status: 'active' | 'suspended';
  bio: string;
  heightCm?: number;
  weightKg?: number;
  dominantHand?: 'Phải' | 'Trái' | 'Cả hai';
  careerHistory: MatchHistoryRecord[];
  achievements: Achievement[];
}

export type TournamentFormat = 'single_elimination' | 'round_robin' | 'double_elimination';

export type SportDiscipline =
  | 'Pickleball Đôi Nam'
  | 'Pickleball Đôi Nữ'
  | 'Pickleball Đôi Nam Nữ'
  | 'Pickleball Đơn'
  | 'Bida Carom 3 Băng'
  | 'Bida Pool 9 Bi'
  | 'Cầu Lông Đôi'
  | 'Tennis Phong Trào';

export interface TournamentRules {
  matchFormatDesc: string;
  pointsToWinSet: number;
  setsToWinMatch: number;
  maxPointsPerSet: number;
  tiebreakSummary: string;
  tiebreakCriteria: string[]; // 1. Điểm, 2. Đối đầu, 3. Hiệu số ván, 4. Hiệu số điểm, 5. Điểm thắng, 6. Bốc thăm
  internationalStandards: string;
  scoringSystem?: 'win2_loss1_forfeit0' | 'win3_loss0' | 'win2_loss0' | 'win1_loss0';
  winPoints?: number; // mặc định 2
  lossPoints?: number; // mặc định 1
  forfeitPoints?: number; // mặc định 0
}

export interface TournamentTeam {
  id: string;
  name: string;
  player1: {
    id: string;
    fullName: string;
    nickname?: string;
    avatarUrl: string;
    clubName: string;
    phone?: string;
  };
  player2?: {
    id: string;
    fullName: string;
    nickname?: string;
    avatarUrl: string;
    clubName: string;
    phone?: string;
  };
  seed?: number;
  status: 'pending' | 'approved' | 'paid';
  registrationDate: string;
  captainId?: string; // Player ID of the team captain
  captainName?: string;
  drawLotNumber?: number; // Lá thăm số bốc được
  bracketSlot?: number; // Vị trí trong sơ đồ nhánh
}

export interface TournamentMatch {
  id: string;
  roundIndex: number;
  roundName: string;
  matchIndex: number;
  court: string;
  scheduledTime: string;
  scheduledDate?: string;
  courtNotified?: boolean;
  team1?: TournamentTeam;
  team2?: TournamentTeam;
  scoreTeam1: number[];
  scoreTeam2: number[];
  winnerTeamId?: string;
  status: 'scheduled' | 'live' | 'finished';
  notes?: string;
  restNotice?: string; // Info about rest time between matches
}

export interface TournamentRound {
  roundIndex: number;
  name: string;
  matches: TournamentMatch[];
}

export interface StandingRow {
  rank: number;
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  forfeited?: number;
  setsWon: number;
  setsLost: number;
  setDiff: number;
  pointsWon: number;
  pointsLost: number;
  pointDiff: number;
  points: number; // 2 for win, 1 for loss, 0 for forfeit (or custom rules)
  headToHeadWon?: string[]; // IDs of teams beaten
}

export interface TournamentMilestone {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  venueOrNotes?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

export interface Tournament {
  id: string;
  name: string;
  code: string;
  seasonId: string;
  creatorId?: string;
  creatorName?: string;
  discipline: SportDiscipline;
  sportCategory?: string; // Bộ môn: Pickleball, Cầu Lông, Tennis, Bida Carom 3 Băng, Bida Pool 9 Bi, Bóng Bàn...
  competitionForm?: string; // Hình thức thi đấu: Đôi Nam Nữ, Đôi Nam, Đôi Nữ, Đơn Nam, Đơn Nữ, Tự Do...
  startingRound?: 'round_robin' | 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'finals';
  setsCount?: 1 | 3 | 5;
  pointsPerSet?: number; // 11 | 15 | 21
  milestones?: TournamentMilestone[];
  format: TournamentFormat;
  bannerUrl: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  venue: string;
  entryFee: number;
  totalPrizePool: number;
  maxTeams: number;
  status: 'upcoming' | 'registering' | 'draw_pending' | 'in_progress' | 'completed';
  rules: TournamentRules;
  participantAthleteIds?: string[]; // Danh sách ID các VĐV tham gia giải
  checkedInAthleteIds?: string[]; // Danh sách ID các VĐV đã điểm danh trước giờ đấu
  pairingMethod?: 'auto_balanced' | 'auto_random' | 'manual_lottery' | 'manual_custom'; // Hình thức chia đội
  matchupDrawMethod?: 'auto_schedule' | 'captain_draw' | 'manual_pairing'; // Hình thức bốc thăm đối đầu
  registeredTeams: TournamentTeam[];
  rounds: TournamentRound[];
  standings: StandingRow[];
  championTeamId?: string;
}

export interface TreasuryRecord {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'Lệ phí thi đấu' | 'Tài trợ giải' | 'Tiền thưởng trao giải' | 'Thuê sân bãi & Trọng tài' | 'Trang thiết bị / Nước uống' | 'Quỹ câu lạc bộ' | 'Khác';
  amount: number;
  description: string;
  performer: string;
  relatedTournament?: string;
  receiptNumber: string;
}

export interface UserPredictionPick {
  userId: string;
  userName: string;
  pickTeamId: string;
  pointsWagered: number;
  timestamp: string;
}

export interface BetPrediction {
  id: string;
  tournamentId: string;
  tournamentName: string;
  matchId: string;
  matchTitle: string;
  discipline: string;
  team1: { id: string; name: string; odds: number; votes: number };
  team2: { id: string; name: string; odds: number; votes: number };
  totalPoolPoints: number;
  status: 'open' | 'closed' | 'settled';
  winningTeamId?: string;
  closingTime: string;
  picks: UserPredictionPick[];
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'match_alert' | 'tournament' | 'system' | 'security' | 'treasury';
  timestamp: string;
  read: boolean;
  priority: 'normal' | 'high' | 'urgent';
  targetRole?: UserRole;
  linkTab?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageSourceType: 'google_drive' | 'upload' | 'url';
  originalDriveUrl?: string;
  category: 'Tin Giải Đấu' | 'Thông Báo BTC' | 'Luật & Thể Lệ' | 'Tin CLB & VĐV';
  authorName: string;
  authorRole: string;
  publishedDate: string;
  featured?: boolean;
  viewsCount?: number;
}

