'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

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
      <div className="h-screen md:h-[80vh] flex flex-col items-center justify-center bg-white md:rounded-2xl md:border border-slate-200">
        <div className="w-8 h-8 border-4 border-[#57886C] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] md:h-[80vh] flex flex-col bg-[#FAFAFA] w-full max-w-3xl mx-auto md:rounded-2xl md:border border-slate-200 shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="p-4 bg-[#1E1E24] text-white flex items-center justify-between shrink-0 z-10 safe-top">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="text-slate-300 hover:text-white transition p-1 -ml-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg leading-tight text-white">{chat?.name || 'Chat Room'}</h2>
          </div>
        </div>

        {chat?.post && (
          <Link
            href={`/posts/${chat.post.id}`}
            className="text-xs font-bold text-[#EDCB96] bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-full border border-white/10 truncate max-w-[120px]"
          >
            {chat.post.title}
          </Link>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/50">
        {messages.map((msg: any, index: number) => {
          // Color coding by sender ID (mocking right-align vs left-align with colors as requested)
          // Simple hash to alternate colors or just distinct colors based on sender ID
          const isSender1 = messages[0] && msg.senderId === messages[0].senderId;
          
          return (
            <div key={msg.id} className="flex flex-col items-start gap-1 w-full">
              <div className="text-xs font-semibold text-slate-400 ml-1">{msg.sender?.name}</div>
              <div className="flex gap-2 max-w-[85%] sm:max-w-[75%] items-end">
                <div 
                  className={`p-3.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
                    isSender1 
                      ? 'bg-white border border-slate-100 text-[#1E1E24] rounded-bl-sm' 
                      : 'bg-[#D8D8F6]/30 border border-[#D8D8F6]/50 text-[#1E1E24] rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 ml-1 mt-0.5">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Box */}
      <div className="bg-white border-t border-slate-100 p-3 pb-safe shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-[#57886C] focus:ring-1 focus:ring-[#57886C] text-[#1E1E24] font-medium transition placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="bg-[#ED6A5A] hover:bg-[#d65e4f] disabled:opacity-50 disabled:hover:bg-[#ED6A5A] text-white p-3.5 rounded-full transition shadow-sm flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
