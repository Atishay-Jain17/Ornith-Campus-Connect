'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Radio,
  Plus,
  Car,
  Users,
  ShoppingBag,
  MessageSquare,
  Bell,
  Sparkles,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

export const DEMO_USERS = [
  { email: 'aarav@geu.ac.in', name: 'Aarav', role: 'Tech Lead / Poster' },
  { email: 'ananya@geu.ac.in', name: 'Ananya', role: 'Lender / Designer' },
  { email: 'rohan@geu.ac.in', name: 'Rohan', role: 'Driver / Carpool' },
  { email: 'shreya@geu.ac.in', name: 'Shreya', role: 'Passenger / Foodie' },
  { email: 'atishay@geu.ac.in', name: 'Atishay', role: 'Giver / Coder' },
];

const NAV_ITEMS = [
  { href: '/feed', label: 'Radar', icon: Radio, activeColor: '#ED6A5A' },
  { href: '/rides', label: 'Rides', icon: Car, activeColor: '#57886C' },
  { href: '/plans', label: 'Plans', icon: Users, activeColor: '#EDCB96' },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag, activeColor: '#D8D8F6' },
  { href: '/chat', label: 'Chat', icon: MessageSquare, activeColor: '#ED6A5A' },
];

const demoModeEnabled = process.env.NODE_ENV !== 'production';

export default function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userResolved, setUserResolved] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showDemoPicker, setShowDemoPicker] = useState(false);

  const setupNativeBackButton = useCallback(async () => {
    try {
      const { App } = await import('@capacitor/app');
      App.addListener('backButton', () => {
        if (window.location.pathname === '/feed' || window.location.pathname === '/') {
          App.minimizeApp();
        } else {
          window.history.back();
        }
      });
    } catch {
      // Running standard browser
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setCurrentUser(data.user);
    } catch (e) {
      console.error('Failed to fetch user:', e);
      setCurrentUser(null);
    } finally {
      setUserResolved(true);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [pathname, fetchUser]);

  useEffect(() => {
    setupNativeBackButton();
    const refreshUser = () => void fetchUser();
    const handleAuthChanged = (event: Event) => {
      const user = (event as CustomEvent).detail?.user;
      if (user) {
        setCurrentUser(user);
        setUserResolved(true);
      } else {
        void fetchUser();
      }
    };
    window.addEventListener('ornith:auth-changed', handleAuthChanged);
    window.addEventListener('focus', refreshUser);
    return () => {
      window.removeEventListener('ornith:auth-changed', handleAuthChanged);
      window.removeEventListener('focus', refreshUser);
    };
  }, [fetchUser, setupNativeBackButton]);

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
        setShowDemoPicker(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSwitching(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed' || pathname === '/';
    if (href === '/plans') return pathname.startsWith('/plans');
    if (href === '/chat') return pathname.startsWith('/chat');
    return pathname === href;
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <>
      {/* ── TOP HEADER ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: '#1E1E24',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Demo Switcher Bar */}
        {!isAuthPage && demoModeEnabled && <div
          style={{
            background: 'rgba(237,203,150,0.08)',
            borderBottom: '1px solid rgba(237,203,150,0.12)',
          }}
          className="px-4 py-1.5 flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" style={{ color: '#EDCB96' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#EDCB96' }}>
              Demo Mode
            </span>
            <span className="text-[10px] hidden sm:inline" style={{ color: 'rgba(237,203,150,0.6)' }}>
              — Switch identity to test features
            </span>
          </div>

          {/* Current user + dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoPicker(!showDemoPicker)}
              disabled={isSwitching}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-all"
              style={{
                background: 'rgba(237,203,150,0.12)',
                color: '#EDCB96',
              }}
            >
              <span className="text-[11px] font-bold">
                {isSwitching ? 'Switching...' : (currentUser?.name || 'Select User')}
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showDemoPicker && (
              <div
                className="absolute right-0 top-full mt-1 z-[100] rounded-xl overflow-hidden shadow-2xl"
                style={{ background: '#2A2A33', border: '1px solid rgba(255,255,255,0.08)', minWidth: '200px' }}
              >
                {DEMO_USERS.map((u) => {
                  const isSelected = currentUser?.email === u.email;
                  return (
                    <button
                      key={u.email}
                      onClick={() => handleDemoSwitch(u.email)}
                      disabled={isSwitching}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
                      style={{
                        background: isSelected ? 'rgba(237,106,90,0.15)' : 'transparent',
                        borderLeft: isSelected ? '2px solid #ED6A5A' : '2px solid transparent',
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: isSelected ? '#ED6A5A' : '#3A3A45', color: '#FFFFFF' }}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: '#FFFFFF' }}>{u.name}</div>
                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{u.role}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" style={{ color: '#ED6A5A' }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>}

        {/* Main Header Row */}
        <div className="px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/feed" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-base shadow-lg"
              style={{ background: '#ED6A5A', color: '#FFFFFF' }}
            >
              O
            </div>
            <div>
              <span className="font-black text-lg tracking-tight" style={{ color: '#FFFFFF', letterSpacing: '-0.04em' }}>
                ORNITH
              </span>
              <span
                className="text-[9px] font-bold block -mt-0.5 tracking-widest uppercase"
                style={{ color: 'rgba(237,203,150,0.7)' }}
              >
                Hyperlocal Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className={`${isAuthPage ? 'hidden' : 'hidden md:flex'} items-center gap-0.5`}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: active ? `${item.activeColor}18` : 'transparent',
                    color: active ? item.activeColor : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthPage && <Link href="/feed" className="px-3 py-2 rounded-xl text-sm font-semibold text-white/75 hover:text-white">Explore Radar</Link>}
            {!isAuthPage && userResolved && !currentUser && (
              <Link href="/auth" className="px-3 py-2 rounded-xl text-sm font-bold text-white/80 hover:bg-white/10">Sign in</Link>
            )}
            {/* Notifications */}
            {!isAuthPage && <Link
              href="/notifications"
              className="relative p-2 rounded-xl transition-all"
              style={{ color: 'rgba(255,255,255,0.5)' }}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {currentUser?.unreadNotificationsCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ background: '#ED6A5A', color: '#FFFFFF' }}
                >
                  {currentUser.unreadNotificationsCount}
                </span>
              )}
            </Link>}

            {/* Create CTA */}
            {!isAuthPage && <Link
              href="/posts/create"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
              style={{ background: '#ED6A5A', color: '#FFFFFF' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post Intent</span>
            </Link>}

            {/* Profile */}
            {!isAuthPage && currentUser && (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 p-1 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center overflow-hidden"
                  style={{ background: '#57886C', color: '#FFFFFF' }}
                >
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </div>
                <div className="text-left hidden lg:block pr-1">
                  <div className="text-xs font-bold flex items-center gap-1" style={{ color: '#FFFFFF' }}>
                    {currentUser.name}
                    {currentUser.isVerified && <CheckCircle2 className="w-3 h-3" style={{ color: '#7AAF8F' }} />}
                  </div>
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    L{currentUser.level} · {currentUser.trustScore}★
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Click outside to close demo picker */}
      {!isAuthPage && showDemoPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDemoPicker(false)}
        />
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <div
        className={`${isAuthPage ? 'hidden' : 'md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bottom-nav'}`}
        style={{
          background: '#1E1E24',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Radar */}
        <Link
          href="/feed"
          className="flex flex-col items-center gap-0.5 py-2 px-2 min-w-[48px]"
          style={{ color: isActive('/feed') ? '#ED6A5A' : 'rgba(255,255,255,0.35)' }}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px]" style={{ fontWeight: isActive('/feed') ? 700 : 500 }}>Radar</span>
        </Link>

        {/* Plans */}
        <Link
          href="/plans"
          className="flex flex-col items-center gap-0.5 py-2 px-2 min-w-[48px]"
          style={{ color: isActive('/plans') ? '#EDCB96' : 'rgba(255,255,255,0.35)' }}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]" style={{ fontWeight: isActive('/plans') ? 700 : 500 }}>Plans</span>
        </Link>

        {/* Center CREATE button */}
        <Link
          href="/posts/create"
          className="flex flex-col items-center gap-0.5 py-1 px-2 -mt-4"
        >
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-xl"
            style={{ background: '#ED6A5A', width: '52px', height: '52px' }}
          >
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="text-[9px] text-white/40 mt-0.5">Post</span>
        </Link>

        {/* Market */}
        <Link
          href="/marketplace"
          className="flex flex-col items-center gap-0.5 py-2 px-2 min-w-[48px]"
          style={{ color: isActive('/marketplace') ? '#D8D8F6' : 'rgba(255,255,255,0.35)' }}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]" style={{ fontWeight: isActive('/marketplace') ? 700 : 500 }}>Market</span>
        </Link>

        {/* Chat */}
        <Link
          href="/chat"
          className="flex flex-col items-center gap-0.5 py-2 px-2 min-w-[48px]"
          style={{ color: isActive('/chat') ? '#ED6A5A' : 'rgba(255,255,255,0.35)' }}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]" style={{ fontWeight: isActive('/chat') ? 700 : 500 }}>Chat</span>
        </Link>
      </div>
    </>
  );
}
