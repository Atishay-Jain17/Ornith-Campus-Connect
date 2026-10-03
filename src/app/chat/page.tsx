'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Clock, ChevronRight, User } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">In-App Messages</h1>
          <p className="text-xs text-slate-500 mt-0.5">Private 1:1 & Group chats. Phone numbers are protected.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold text-slate-500">Loading messages...</p>
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">No active chat conversations</h3>
          <p className="text-xs text-slate-500 mt-1">Accept a post interest or join a plan to start chatting!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
          {chats.map((chat) => {
            const lastMsg = chat.messages[0];
            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {chat.name ? chat.name.charAt(0) : 'C'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{chat.name || 'Chat Conversation'}</div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {lastMsg ? `${lastMsg.text}` : 'No messages yet.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
