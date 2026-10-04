'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Sparkles, MessageSquare, DollarSign, Star, ExternalLink } from 'lucide-react';

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notifications & Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Nearby matches, chat alerts, expense settlement updates & trust ratings</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold text-slate-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">No notifications yet</h3>
          <p className="text-xs text-slate-500 mt-1">Notifications will appear here when nearby matches or chat messages arrive.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  {notif.type === 'MATCH' ? (
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  ) : notif.type === 'CHAT' ? (
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  ) : notif.type === 'EXPENSE' ? (
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  ) : notif.type === 'TRUST' ? (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ) : (
                    <Bell className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div>
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <span>{notif.title}</span>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{notif.message}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-medium">
                    {new Date(notif.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
              </div>

              {notif.link && (
                <Link
                  href={notif.link}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition shrink-0"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
