'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  ShieldCheck,
  Star,
  Zap,
  Award,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

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
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading Profile & Reputation Metrics...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8">
        <h3 className="font-bold text-slate-800">Please select a Demo Profile above to view metrics</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* User Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                    Verified Campus Identity
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.area} • {user.bio || 'Graphic Era University Student'}</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-center shadow-md shrink-0">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">Level {user.level}</div>
            <div className="text-lg font-black text-white">{user.level >= 5 ? 'Trusted Pillar' : 'Regular Member'}</div>
          </div>
        </div>

        {/* Reputation Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-indigo-700 font-bold text-xs">
              <Zap className="w-4 h-4 fill-indigo-600 text-indigo-600" />
              <span>COMMUNITY XP</span>
            </div>
            <div className="text-2xl font-black text-indigo-950 mt-1">{user.xp} XP</div>
            <div className="text-[10px] text-indigo-700 font-medium mt-0.5">Participation Score</div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-amber-700 font-bold text-xs">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>TRUST RATING</span>
            </div>
            <div className="text-2xl font-black text-amber-950 mt-1">{user.trustScore} / 5.0★</div>
            <div className="text-[10px] text-amber-700 font-medium mt-0.5">Exchange Reliability</div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-xs">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>PERMISSIONS</span>
            </div>
            <div className="text-base font-extrabold text-emerald-950 mt-1.5 flex items-center justify-center gap-1">
              {user.level >= 5 ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>Opportunities Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 text-xs">Level 5 Gate Required</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Level 5 + Verification Status</div>
          </div>
        </div>

        {/* Verified Student Credentials */}
        {user.verification && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Campus Identity Proof:</span>
            </div>
            <div>Student ID: <span className="font-mono font-bold text-slate-900">{user.verification.studentId}</span></div>
            <div>Department: <span className="font-semibold text-slate-900">{user.verification.department}</span></div>
            <div>Campus: <span className="font-semibold text-slate-900">{user.verification.campusName}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
