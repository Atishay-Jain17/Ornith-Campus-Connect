'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, ShieldCheck, User } from 'lucide-react';

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Auto refresh
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${id}/messages`);
      const data = await res.json();
      if (data.chat) {
        setChat(data.chat);
        setMessages(data.chat.messages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    try {
      const res = await fetch(`/api/chats/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      });
      if (res.ok) {
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading chat room...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-[80vh] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/chat" className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="font-bold text-sm text-white">{chat?.name || 'Chat Room'}</h2>
            <p className="text-[11px] text-slate-400">Protected Privacy • In-App Messaging</p>
          </div>
        </div>

        {chat?.post && (
          <Link
            href={`/posts/${chat.post.id}`}
            className="text-[11px] font-bold text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded border border-indigo-700"
          >
            Post: {chat.post.title.substring(0, 20)}...
          </Link>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
        {messages.map((msg: any) => {
          return (
            <div key={msg.id} className="flex items-start gap-2 max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-indigo-200 text-indigo-800 font-bold text-xs flex items-center justify-center shrink-0">
                {msg.sender.name.charAt(0)}
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-0.5">{msg.sender.name}</div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-slate-800 text-xs shadow-sm font-medium">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold p-2.5 rounded-xl transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
