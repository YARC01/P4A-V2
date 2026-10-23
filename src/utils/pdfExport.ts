import jsPDF from 'jspdf';
import { Athlete } from '../types.ts';

// Helper to sanitize Vietnamese diacritics for standard PDF fonts, while providing high quality representation
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function exportAthleteProfilePDF(athlete: Athlete): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top Sports Header Bar
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setFillColor(16, 185, 129); // Emerald accent line
  doc.rect(0, 26, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('P4A SPORTS - HO SO VAN DONG VIEN', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('HE THONG QUAN LY GIAI DAU & CAU LAC BO CHUYEN NGHIEP - VERIFIED ATHLETE PROFILE', 14, 19);

  // Date and ID
  const dateStr = new Date().toLocaleDateString('vi-VN');
  doc.text(`Ma so: VDV-${athlete.id.toUpperCase()} | Ngay xuat: ${dateStr}`, pageWidth - 14, 19, { align: 'right' });

  // Main Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 34, pageWidth - 28, 62, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, pageWidth - 28, 62, 3, 3, 'S');

  // Photo Avatar Box
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(20, 40, 36, 44, 2, 2, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text('[ ANH 3x4 ]', 38, 64, { align: 'center' });

  // Athlete Primary Information
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(removeDiacritics(athlete.fullName).toUpperCase(), 64, 45);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(16, 185, 129);
  doc.text(`Nickname: "${removeDiacritics(athlete.nickname || 'N/A')}" - CLB: ${removeDiacritics(athlete.clubName)}`, 64, 51);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  // Column 1
  doc.text(`Ngay sinh: ${athlete.birthDate || 'N/A'} (Tuoi: ${athlete.age || 'N/A'})`, 64, 58);
  doc.text(`Gioi tinh: ${athlete.gender === 'male' ? 'Nam' : athlete.gender === 'female' ? 'Nu' : 'Khac'}`, 64, 64);
  doc.text(`So CCCD/ID: ${athlete.identityNumber || 'Chua cap nhat'}`, 64, 70);
  doc.text(`Bo mon: ${removeDiacritics(athlete.sportType)}`, 64, 76);
  doc.text(`Hang thi dau: ${removeDiacritics(athlete.rankingTier)}`, 64, 82);

  // Column 2
  const col2X = 130;
  doc.text(`So dien thoai: ${athlete.phone || 'N/A'}`, col2X, 58);
  doc.text(`Email: ${athlete.email || 'N/A'}`, col2X, 64);
  doc.text(`Dia chi nha: ${removeDiacritics(athlete.address || 'N/A').slice(0, 35)}`, col2X, 70);
  doc.text(`Diem Elo: ${athlete.eloRating || 1200} pts`, col2X, 76);
  if (athlete.duprRating) {
    doc.text(`Chi so DUPR: ${athlete.duprRating.toFixed(2)}`, col2X, 82);
  } else {
    doc.text(`Trang thai: ${athlete.status === 'active' ? 'Dang hoat dong' : 'Tam dung'}`, col2X, 82);
  }

  // Section: Achievements / Medals
  let currentY = 104;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('I. BANG THANH TICH & HUY CHUONG CA NHAN', 18, currentY + 5);

  currentY += 12;
  if (athlete.achievements && athlete.achievements.length > 0) {
    athlete.achievements.slice(0, 4).forEach((ach) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129);
      const medalStr = ach.medal === 'gold' ? '[VANG]' : ach.medal === 'silver' ? '[BAC]' : ach.medal === 'bronze' ? '[DONG]' : '[MVP]';
      doc.text(`${medalStr} ${removeDiacritics(ach.title)} (${ach.year})`, 18, currentY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Giai dau: ${removeDiacritics(ach.tournamentName)} | Bo mon: ${removeDiacritics(ach.discipline)}`, 18, currentY + 4.5);
      currentY += 10;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('- Chua co du lieu thanh tich giai lon trong he thong.', 18, currentY);
    currentY += 8;
  }

  // Section: Competition History Table
  currentY += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('II. LICH SU THI DAU & KET QUA CAC TRAN DAU GAN NHAT', 18, currentY + 5);

  currentY += 12;

  // Table header
  doc.setFillColor(226, 232, 240);
  doc.rect(14, currentY, pageWidth - 28, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Ngay', 16, currentY + 4);
  doc.text('Giai Dau', 36, currentY + 4);
  doc.text('Vong/San', 88, currentY + 4);
  doc.text('Doi Thu', 120, currentY + 4);
  doc.text('Ti So', 158, currentY + 4);
  doc.text('Ket Qua', 180, currentY + 4);

  currentY += 8;
  doc.setFont('helvetica', 'normal');

  const history = athlete.careerHistory && athlete.careerHistory.length > 0 ? athlete.careerHistory.slice(0, 7) : [];
  if (history.length > 0) {
    history.forEach((m, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY - 3, pageWidth - 28, 6, 'F');
      }
      doc.setTextColor(51, 65, 85);
      doc.text(m.date || '---', 16, currentY + 1);
      doc.text(removeDiacritics(m.tournamentName).slice(0, 26), 36, currentY + 1);
      doc.text(removeDiacritics(m.round || 'Vong bang').slice(0, 16), 88, currentY + 1);
      doc.text(removeDiacritics(m.opponentName).slice(0, 20), 120, currentY + 1);
      doc.text(m.score || '2 - 0', 158, currentY + 1);

      if (m.result === 'win') {
        doc.setTextColor(16, 185, 129);
        doc.setFont('helvetica', 'bold');
        doc.text('THANG', 180, currentY + 1);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
        doc.text('THUA', 180, currentY + 1);
      }
      doc.setFont('helvetica', 'normal');
      currentY += 6.5;
    });
  } else {
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text('Chua co tran dau ghi nhan.', 18, currentY + 2);
    currentY += 8;
  }

  // Footer & Official Seal Section
  currentY = Math.max(currentY + 10, pageHeight - 45);
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, pageWidth - 14, currentY);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('XAC NHAN CUA BAN QUAN TRI / CLB', 24, currentY + 6);
  doc.text('CHU KY VAN DONG VIEN', pageWidth - 55, currentY + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('(Ky va ghi ro ho ten)', 33, currentY + 11);
  doc.text('(Toi cam doan thong tin tren la chinh xac)', pageWidth - 55, currentY + 11);

  // Digital verification stamp
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(pageWidth / 2 - 25, currentY + 4, 50, 18, 2, 2, 'S');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('NESA 333 VERIFIED', pageWidth / 2, currentY + 11, { align: 'center' });
  doc.text('HE THONG XAC THUC SO HOA', pageWidth / 2, currentY + 16, { align: 'center' });

  // Save PDF
  const safeName = removeDiacritics(athlete.fullName).toLowerCase().replace(/\s+/g, '_');
  doc.save(`ho_so_vdv_${safeName}_nesa333.pdf`);
}
