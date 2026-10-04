'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldCheck,
  Star,
  Zap,
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetch('/api/blocks').then((res) => res.ok ? res.json() : null).then((data) => setBlockedUsers(data?.blocks || [])).catch(() => {});
  }, []);

  const unblockUser = async (blockedUserId: string) => {
    const res = await fetch('/api/blocks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blockedUserId }) });
    if (res.ok) setBlockedUsers((current) => current.filter((block) => block.blockedUserId !== blockedUserId));
  };

  const signOut = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.replace('/auth');
    router.refresh();
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-[#D8D8F6] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-[#1E1E24] font-semibold">Loading Profile & Reputation Metrics...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="font-bold text-[#1E1E24]">Sign in to see your campus profile</h3>
        <Link href="/auth" className="inline-flex mt-4 rounded-xl bg-[#ED6A5A] px-4 py-2.5 text-sm font-bold text-white">Sign in or create account</Link>
      </div>
    );
  }

  // Calculate XP progress (mock logic for demo: assumes 1000 XP per level)
  const xpForCurrentLevel = (user.level - 1) * 1000;
  const xpForNextLevel = user.level * 1000;
  const xpProgress = Math.min(100, Math.max(0, ((user.xp - xpForCurrentLevel) / 1000) * 100));

  const trustAttributes = user.trustAttributes || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* User Header */}
      <div className="bg-[#1E1E24] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-white relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-[#57886C] text-white font-black text-3xl flex items-center justify-center shadow-lg border-4 border-[#1E1E24]">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-black">{user.name}</h1>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-white/10 text-[#EDCB96] text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-300 font-medium">
                {user.area} • {user.bio || 'Graphic Era University Student'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-2xl text-center shrink-0">
              <div className="text-xs text-[#EDCB96] font-bold uppercase tracking-wider mb-1">Level {user.level}</div>
              <div className="text-lg font-black text-white">{user.level >= 6 ? 'Connector' : user.level === 5 ? 'Trusted' : 'Campus Member'}</div>
            </div>
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10 hover:text-white"><LogOut className="w-3.5 h-3.5" /> Sign out</button>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="relative z-10 pt-4 border-t border-white/10">
          <div className="flex justify-between items-end mb-2">
            <div className="text-sm font-semibold text-gray-300">XP Progress</div>
            <div className="text-xs font-bold text-[#EDCB96]">{user.xp} / {xpForNextLevel} XP</div>
          </div>
          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ED6A5A] rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${xpProgress}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Attributes */}
      {blockedUsers.length > 0 && <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#1E1E24] mb-3">Blocked accounts</h3>
        <div className="space-y-2">
          {blockedUsers.map((block) => <div key={block.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="text-sm font-semibold text-slate-700">{block.blockedUser.name}</span>
            <button onClick={() => unblockUser(block.blockedUserId)} className="text-xs font-bold text-[#ED6A5A]">Unblock</button>
          </div>)}
        </div>
      </section>}

      {/* Trust Attributes */}
      {trustAttributes && trustAttributes.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#1E1E24] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-[#EDCB96] fill-[#EDCB96]" /> Community Endorsements
          </h3>
          <div className="flex flex-wrap gap-2">
            {trustAttributes.map((attr: string, idx: number) => (
              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-[#F7F7F5] text-[#1E1E24] border border-gray-200">
                {attr}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reputation Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center shadow-sm relative overflow-hidden group hover:border-[#D8D8F6] transition-colors">
          <div className="absolute inset-0 bg-[#D8D8F6]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-1.5 text-[#1E1E24] font-bold text-xs mb-2">
              <Zap className="w-4 h-4 text-[#D8D8F6] fill-[#D8D8F6]" />
              <span className="uppercase tracking-wider">Community XP</span>
            </div>
            <div className="text-4xl font-black text-[#1E1E24]">{user.xp}</div>
            <div className="text-xs text-gray-500 font-medium mt-1">Total Participation</div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center shadow-sm relative overflow-hidden group hover:border-[#EDCB96] transition-colors">
          <div className="absolute inset-0 bg-[#EDCB96]/10 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-1.5 text-[#1E1E24] font-bold text-xs mb-2">
              <Star className="w-4 h-4 text-[#EDCB96] fill-[#EDCB96]" />
              <span className="uppercase tracking-wider">Trust Rating</span>
            </div>
            <div className="text-4xl font-black text-[#1E1E24]">{user.trustScore} <span className="text-lg text-gray-400">/5</span></div>
            <div className="text-xs text-gray-500 font-medium mt-1">Exchange Reliability</div>
          </div>
        </div>

        <div className={`p-6 bg-white border border-gray-200 rounded-2xl text-center shadow-sm relative overflow-hidden group ${user.level >= 5 ? 'hover:border-[#57886C]' : ''} transition-colors`}>
          <div className={`absolute inset-0 ${user.level >= 5 ? 'bg-[#57886C]/10' : 'bg-gray-50'} transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-2xl`}></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-1.5 text-[#1E1E24] font-bold text-xs mb-2">
              <Award className={`w-4 h-4 ${user.level >= 5 ? 'text-[#57886C]' : 'text-gray-400'}`} />
              <span className="uppercase tracking-wider">Permissions</span>
            </div>
            <div className="text-xl font-extrabold text-[#1E1E24] mt-3 flex items-center justify-center gap-2">
              {user.level >= 5 ? (
                <>
                  <Unlock className="w-5 h-5 text-[#57886C]" />
                  <span className="text-[#57886C]">Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500 text-sm">Level 5 Req</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-2">Verified Status Needed</div>
          </div>
        </div>
      </div>

      {/* Verified Student Credentials */}
      {!user.isVerified && user.verification?.status === 'PENDING' && (
        <div className="flex items-start gap-3 rounded-2xl border border-[#EDCB96]/60 bg-[#EDCB96]/15 p-5 text-sm text-[#1E1E24]">
          <ShieldCheck className="w-5 h-5 shrink-0 text-[#57886C]" />
          <div><p className="font-bold">Campus verification is pending</p><p className="mt-1 text-xs leading-relaxed text-[#1E1E24]/65">Your account is ready to use. A moderator must review your campus identity before opportunity posting is unlocked.</p></div>
        </div>
      )}
      {user.verification?.status === 'VERIFIED' && (
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#57886C]"></div>
          <div className="font-bold text-[#1E1E24] flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5 text-[#57886C]" />
            <span>Campus Identity Proof</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student ID</div>
              <div className="font-mono font-bold text-[#1E1E24] text-lg">{user.verification.studentId}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Department</div>
              <div className="font-bold text-[#1E1E24] text-lg">{user.verification.department}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Campus</div>
              <div className="font-bold text-[#1E1E24] text-lg">{user.verification.campusName}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
