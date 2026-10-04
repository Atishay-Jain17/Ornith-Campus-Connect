'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Radio,
  PlusCircle,
  Car,
  Users,
  ShoppingBag,
  MessageSquare,
  ShieldAlert,
  User,
  Bell,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const DEMO_USERS = [
  { email: 'aarav@geu.ac.in', name: 'Aarav (L5)', role: 'Tech Lead / Poster' },
  { email: 'ananya@geu.ac.in', name: 'Ananya (L3)', role: 'Lender / Designer' },
  { email: 'rohan@geu.ac.in', name: 'Rohan (L2)', role: 'Driver / Carpool' },
  { email: 'shreya@geu.ac.in', name: 'Shreya (L3)', role: 'Passenger / Foodie' },
  { email: 'atishay@geu.ac.in', name: 'Atishay (L6)', role: 'Giver / Coder' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  };

  const handleDemoSwitch = async (email: string) => {
    setIsSwitching(true);
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        await fetchUser();
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Demo Switcher Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-amber-300">DEMO PROFILE SWITCHER:</span>
          <span className="hidden sm:inline text-slate-300">Switch identity to test end-to-end interactions</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {DEMO_USERS.map((u) => {
            const isSelected = currentUser?.email === u.email;
            return (
              <button
                key={u.email}
                onClick={() => handleDemoSwitch(u.email)}
                disabled={isSwitching}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold ring-1 ring-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {u.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/feed" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-indigo-200">
              O
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">ORNITH</span>
              <span className="text-xs text-indigo-600 font-semibold block -mt-1">Hyperlocal Network</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/feed"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === '/feed' || pathname === '/' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Radio className="w-4 h-4 text-indigo-600" />
              <span>Help Radar</span>
            </Link>

            <Link
              href="/rides"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === '/rides' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Rides</span>
            </Link>

            <Link
              href="/plans"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith('/plans') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Plans & Expenses</span>
            </Link>

            <Link
              href="/marketplace"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === '/marketplace' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span>Marketplace</span>
            </Link>

            <Link
              href="/chat"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith('/chat') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Chat</span>
            </Link>

            <Link
              href="/moderation"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === '/moderation' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Safety</span>
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {currentUser?.unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {currentUser.unreadNotificationsCount}
                </span>
              )}
            </Link>

            <Link
              href="/posts/create"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Intent</span>
            </Link>

            {/* Profile Info */}
            {currentUser && (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/50 transition"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center text-xs overflow-hidden">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-slate-800 leading-none flex items-center gap-1">
                    {currentUser.name}
                    {currentUser.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-50" />}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    L{currentUser.level} • {currentUser.trustScore}★ Trust
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
