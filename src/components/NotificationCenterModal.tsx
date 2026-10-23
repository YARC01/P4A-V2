import React, { useState } from 'react';
import {
  Bell,
  X,
  Send,
  Shield,
  Trophy,
  Flame,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { PushNotification, User } from '../types.ts';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  currentUser: User;
  onSendNotification: (title: string, message: string, type: any, priority: any) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onSendNotification,
  onMarkAllAsRead,
  onClearNotifications,
  onNavigateTab,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'match_alert' | 'tournament' | 'system' | 'security'>('match_alert');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'high' | 'urgent'>('high');

  if (!isOpen) return null;

  const canBroadcast =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'referee';

  const filtered = notifications.filter(
    n => filterType === 'all' || n.type === filterType
  );

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    onSendNotification(broadcastTitle, broadcastMsg, broadcastType, broadcastPriority);
    setBroadcastTitle('');
    setBroadcastMsg('');
    setShowBroadcastForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full sm:max-w-md h-full sm:h-[90vh] bg-slate-900 border-l sm:border border-slate-700 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-display">
                Trung Tâm Thông Báo Đẩy Tự Động
              </h3>
              <p className="text-[11px] text-slate-400">Real-time alerts cho BQT & VĐV</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng thông báo"
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                  filterType === 'all' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('match_alert')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                  filterType === 'match_alert' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Trận đấu
              </button>
              <button
                type="button"
                onClick={() => setFilterType('security')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                  filterType === 'security' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Bảo mật
              </button>
            </div>

            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
            >
              Đã đọc tất cả
            </button>
          </div>

          {canBroadcast && (
            <button
              type="button"
              onClick={() => setShowBroadcastForm(!showBroadcastForm)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{showBroadcastForm ? 'Đóng Trình Bắn Thông Báo' : 'Phát Lệnh Thông Báo Đẩy Mới (Broadcast)'}</span>
            </button>
          )}
        </div>

        {/* Broadcast Form (If opened) */}
        {showBroadcastForm && (
          <form onSubmit={handleBroadcast} className="p-4 bg-slate-950 border-b border-emerald-500/40 space-y-2.5 text-xs animate-in fade-in">
            <div className="font-bold text-emerald-400 uppercase text-[10px] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Gửi thông báo đẩy tức thì tới điện thoại / thiết bị VĐV</span>
            </div>
            <input
              type="text"
              required
              placeholder="Tiêu đề thông báo..."
              value={broadcastTitle}
              onChange={e => setBroadcastTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
            />
            <textarea
              required
              rows={2}
              placeholder="Nội dung thông báo chi tiết..."
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
            />
            <div className="flex gap-2">
              <select
                value={broadcastType}
                onChange={e => setBroadcastType(e.target.value as any)}
                className="w-1/2 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px]"
              >
                <option value="match_alert">Trận Đấu & Sân Bãi</option>
                <option value="tournament">Giải Đấu Mới</option>
                <option value="security">Cảnh Báo Bảo Mật</option>
                <option value="system">Hệ Thống BQT</option>
              </select>
              <button
                type="submit"
                className="w-1/2 py-1 px-3 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Gửi Đẩy Ngay</span>
              </button>
            </div>
          </form>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length > 0 ? (
            filtered.map((notif, idx) => (
              <div
                key={`${notif.id || 'notif'}-${idx}`}
                onClick={() => {
                  if (notif.linkTab) {
                    onNavigateTab(notif.linkTab);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  !notif.read
                    ? 'bg-slate-800/90 border-emerald-500/40 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                    <h4 className="font-extrabold text-xs sm:text-sm text-white">
                      {notif.title}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {notif.timestamp}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {notif.message}
                </p>

                {notif.priority === 'urgent' && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                    <Flame className="w-3 h-3" /> ƯU TIÊN KHẨN
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Không có thông báo mới nào.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Chuông báo tự động 24/7</span>
          <button
            type="button"
            onClick={onClearNotifications}
            className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Xóa danh sách</span>
          </button>
        </div>
      </div>
    </div>
  );
};
