'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, ChevronRight } from 'lucide-react';

export default function ChatInboxPage() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats');
      const data = await res.json();
      setChats(data.chats || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto md:p-6 pb-20">
      <div className="px-4 py-6 md:px-0 border-b border-slate-100">
        <h1 className="text-3xl font-black text-[#1E1E24]">Messages</h1>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-[#57886C] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm font-medium text-slate-500">Loading messages...</p>
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-20 px-4">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1E1E24]">No conversations yet</h3>
          <p className="text-sm text-slate-500 mt-2">Start exploring posts and plans to connect with others.</p>
        </div>
      ) : (
        <div className="bg-white md:rounded-2xl md:border border-slate-100 shadow-sm divide-y divide-slate-50">
          {chats.map((chat) => {
            const lastMsg = chat.messages?.[0];
            const dateStr = lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition min-h-[72px]"
              >
                <div className="w-12 h-12 rounded-full bg-[#57886C] text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-sm">
                  {chat.name ? chat.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[#1E1E24] text-base truncate pr-2">
                      {chat.name || 'Chat Conversation'}
                    </h3>
                    {dateStr && (
                      <span className="text-xs text-slate-400 shrink-0">{dateStr}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-sm text-slate-500 truncate">
                      {lastMsg ? lastMsg.text : 'No messages yet.'}
                    </p>
                    {/* Mock Unread Indicator */}
                    {lastMsg && <div className="w-2.5 h-2.5 rounded-full bg-[#ED6A5A] shrink-0" />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
