'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Sparkles, MessageSquare, Receipt, Star, ExternalLink } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      // Mark as read
      await fetch('/api/notifications', { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 pt-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1E1E24]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-[#ED6A5A] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-[#1E1E24] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium text-slate-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="w-16 h-16 bg-[#57886C]/10 flex items-center justify-center rounded-full mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[#57886C]" />
          </div>
          <h3 className="text-xl font-bold text-[#1E1E24]">You're all caught up!</h3>
          <p className="text-sm text-slate-500 mt-2">No new notifications to show right now.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {notifications.map((notif, idx) => {
            const isUnread = !notif.isRead;
            return (
              <div 
                key={notif.id} 
                className={`p-4 flex items-center justify-between transition-colors ${
                  isUnread ? 'bg-[#D8D8F6]/10' : 'bg-white hover:bg-slate-50'
                } ${idx !== notifications.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === 'MATCH' ? 'bg-[#D8D8F6] text-[#1E1E24]' :
                    notif.type === 'CHAT' ? 'bg-[#ED6A5A] text-white' :
                    notif.type === 'EXPENSE' ? 'bg-[#57886C] text-white' :
                    notif.type === 'TRUST' ? 'bg-[#EDCB96] text-[#1E1E24]' :
                    'bg-[#1E1E24] text-white'
                  }`}>
                    {notif.type === 'MATCH' ? <Sparkles className="w-6 h-6" /> :
                     notif.type === 'CHAT' ? <MessageSquare className="w-6 h-6" /> :
                     notif.type === 'EXPENSE' ? <Receipt className="w-6 h-6" /> :
                     notif.type === 'TRUST' ? <Star className="w-6 h-6 fill-current" /> :
                     <Bell className="w-6 h-6" />}
                  </div>

                  <div className="flex flex-col">
                    <div className="font-bold text-[#1E1E24] text-sm flex items-center gap-2">
                      <span>{notif.title}</span>
                      {isUnread && <span className="w-2 h-2 rounded-full bg-[#ED6A5A]"></span>}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                    <div className="text-xs text-slate-400 mt-1.5 font-medium">
                      {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                {notif.link && (
                  <Link
                    href={notif.link}
                    className="ml-4 flex items-center justify-center gap-1.5 text-xs font-bold text-[#1E1E24] bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition shrink-0"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
