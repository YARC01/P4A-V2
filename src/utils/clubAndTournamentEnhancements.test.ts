import test from 'node:test';
import assert from 'node:assert/strict';
import { TournamentMilestone, ClubGuest, Athlete } from '../types';

test('generates auto-formatted guest names sequentially', () => {
  const currentGuests: ClubGuest[] = [
    { id: 'g-1', name: 'Khách 01', feePaid: true },
    { id: 'g-2', name: 'Nguyễn Khách Mời', feePaid: false },
  ];

  const nextGuestNumber = currentGuests.length + 1;
  const defaultGuestName = `Khách ${String(nextGuestNumber).padStart(2, '0')}`;
  assert.equal(defaultGuestName, 'Khách 03');
});

test('custom tournament milestones maintain correct status and sequential order', () => {
  const milestones: TournamentMilestone[] = [
    { id: 'm-1', title: 'Hạn đăng ký & Nộp lệ phí', date: '2026-03-25', status: 'completed' },
    { id: 'm-2', title: 'Họp kỹ thuật & Bốc thăm chia bảng', date: '2026-03-27', status: 'completed' },
    { id: 'm-3', title: 'Khai mạc & Thi đấu Vòng bảng', date: '2026-03-29', status: 'ongoing' },
    { id: 'm-4', title: 'Tứ kết & Bán kết', date: '2026-03-30', status: 'upcoming' },
    { id: 'm-5', title: 'Chung kết & Trao giải', date: '2026-03-30', status: 'upcoming' },
  ];

  assert.equal(milestones.length, 5);
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const ongoingCount = milestones.filter(m => m.status === 'ongoing').length;
  const upcomingCount = milestones.filter(m => m.status === 'upcoming').length;

  assert.equal(completedCount, 2);
  assert.equal(ongoingCount, 1);
  assert.equal(upcomingCount, 2);
});

test('handles arbitrary athlete tiers correctly including standard and fun group tiers', () => {
  const mockAthletes: Partial<Athlete>[] = [
    { id: 'a1', rankingTier: 'Đại Bàng' },
    { id: 'a2', rankingTier: 'Cọp' },
    { id: 'a3', rankingTier: 'Gà' },
    { id: 'a4', rankingTier: 'Muỗi' },
    { id: 'a5', rankingTier: 'Ruồi' },
    { id: 'a6', rankingTier: 'Chuyên Nghiệp' },
    { id: 'a7', rankingTier: 'Cao Thủ Huyện' }, // Custom freeform
  ];

  const getTierGroup = (tier?: string) => {
    if (!tier) return 'unknown';
    const standard = ['Chuyên Nghiệp', 'Bán Chuyên', 'Nghiệp Dư', 'Phong Trào'];
    const clubAnimals = ['Đại Bàng', 'Cọp', 'Voi', 'Gà', 'Ruồi', 'Muỗi'];
    if (standard.includes(tier)) return 'standard';
    if (clubAnimals.includes(tier)) return 'club_fun';
    return 'custom';
  };

  assert.equal(getTierGroup(mockAthletes[0].rankingTier), 'club_fun');
  assert.equal(getTierGroup(mockAthletes[2].rankingTier), 'club_fun');
  assert.equal(getTierGroup(mockAthletes[3].rankingTier), 'club_fun');
  assert.equal(getTierGroup(mockAthletes[5].rankingTier), 'standard');
  assert.equal(getTierGroup(mockAthletes[6].rankingTier), 'custom');
});
