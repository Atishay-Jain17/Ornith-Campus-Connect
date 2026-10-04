'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowRight,
  Zap,
  Filter,
  Car,
  ShoppingBag,
  Users,
  AlertCircle
} from 'lucide-react';
import { formatDistance } from '@/lib/geo';

const POST_TYPES = [
  { id: 'ALL', label: 'Everything' },
  { id: 'NEED', label: 'Needs' },
  { id: 'OFFER', label: 'Offers' },
  { id: 'BORROW', label: 'Borrow & lend' },
  { id: 'BUY', label: 'Buy' },
  { id: 'SELL', label: 'Sell' },
  { id: 'GIVE', label: 'Free' },
  { id: 'RENT', label: 'Rent' },
  { id: 'GROUP_BUY', label: 'Group buys' },
  { id: 'RIDE', label: 'Rides' },
  { id: 'PLAN', label: 'Plans' },
  { id: 'SERVICE', label: 'Services' },
  { id: 'OPPORTUNITY', label: 'Opportunities' },
  { id: 'LOST_FOUND', label: 'Lost & found' },
  { id: 'COMMUNITY', label: 'Campus notes' },
];

const RADII = [
  { value: 0.5, label: '500m' },
  { value: 1.0, label: '1 km' },
  { value: 2.0, label: '2 km (Campus)' },
  { value: 5.0, label: '5 km' },
  { value: 10.0, label: '10 km' },
  { value: 25.0, label: '25 km' },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRadius, setSelectedRadius] = useState(2.0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [selectedType, selectedRadius, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        type: selectedType,
        radius: selectedRadius.toString(),
        search: searchQuery,
      });
      const res = await fetch(`/api/posts?${queryParams}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error('Failed to fetch feed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial campus welcome */}
      <section className="relative grid overflow-hidden rounded-[24px] bg-[#1E1E24] shadow-[0_18px_55px_rgba(30,30,36,.16)] md:grid-cols-[1.08fr_.92fr]">
        <div className="relative z-10 flex flex-col items-start justify-center px-6 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#EDCB96]"><span className="h-2 w-2 rounded-full bg-[#ED6A5A]" /> Graphic Era University <span className="text-white/35">/</span> Dehradun</div>
          <h1 className="mt-6 max-w-2xl font-serif text-[clamp(2.6rem,5.2vw,4.75rem)] leading-[.98] tracking-[-.055em] text-white">Campus life,<br /><span className="text-[#ED6A5A]">a little closer.</span></h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/70">Find the charger, catch a lift, share a meal. Good things happen when nearby people find each other.</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link href="/posts/create" className="inline-flex min-h-[48px] items-center gap-3 rounded-xl bg-[#ED6A5A] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[#d95647]"><span>Post an intent</span><ArrowRight className="w-4 h-4 text-[#EDCB96]" /></Link>
            <span className="text-xs font-semibold text-white/55">Needs · offers · plans · rides</span>
          </div>
        </div>
        <div className="relative min-h-[210px] overflow-hidden bg-[#D8D8F6] md:min-h-[340px]">
          <div className="absolute left-5 top-5 text-[10px] font-bold uppercase tracking-[.18em] text-[#1E1E24]/55">Around your campus</div>
          <svg viewBox="0 0 520 300" className="absolute inset-0 h-full w-full" role="img" aria-label="Illustrated campus map showing nearby connections">
            <path d="M-15 226 C65 216 83 108 168 133 S273 233 342 174 414 66 548 91" fill="none" stroke="#ED6A5A" strokeWidth="30" strokeLinecap="round" />
            <path d="M-15 226 C65 216 83 108 168 133 S273 233 342 174 414 66 548 91" fill="none" stroke="#F5E4BF" strokeWidth="2" strokeDasharray="7 12" strokeLinecap="round" />
            <path d="M80 311 C149 234 194 197 195 126 S237 48 284 -14 M346 323 C349 260 382 218 440 205 S492 176 535 142" fill="none" stroke="#57886C" strokeOpacity=".4" strokeWidth="2" />
            <path d="M20 93l60-21 24 40-61 29zM272 63l52-18 17 42-57 22zM363 239l41-37 48 16-13 39z" fill="#D8D8F6" fillOpacity=".76" />
            <path d="M214 268l18-44 51 5 20 45-32 15zM431 45l42-19 33 33-21 37-43-9z" fill="#57886C" fillOpacity=".2" />
            <circle cx="168" cy="133" r="12" fill="#1E1E24" stroke="#D8D8F6" strokeWidth="5" />
            <circle cx="342" cy="174" r="9" fill="#57886C" stroke="#D8D8F6" strokeWidth="5" />
            <circle cx="440" cy="205" r="8" fill="#EDCB96" stroke="#D8D8F6" strokeWidth="4" />
          </svg>
          <div className="absolute left-[21%] top-[43%] rounded-xl border border-white/70 bg-white px-3 py-2 shadow-lg"><p className="text-[10px] font-bold text-[#1E1E24]">GEU Gate 1</p><p className="text-[10px] text-[#1E1E24]/50">A familiar meeting point</p></div>
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#1E1E24] px-3 py-2 text-white"><MapPin className="w-3.5 h-3.5 text-[#EDCB96]" /><span className="text-[10px] font-semibold">People, just around the corner</span></div>
        </div>
      </section>

      {/* Filter & Controls Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#1E1E24]/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search charger, ride, pizza, PPT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-xl bg-[#F7F6FB] border border-[#D8D8F6] text-sm focus:outline-none focus:border-[#57886C]"
          />
        </div>

        {/* Proximity Radius Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
            <MapPin className="w-4 h-4" style={{ color: '#1E1E24' }} />
            Radius:
          </span>
          {RADII.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRadius(r.value)}
              className="px-3.5 py-2 min-h-[40px] rounded-xl text-sm font-semibold transition whitespace-nowrap border border-[#1E1E24]/10"
              style={{
                backgroundColor: selectedRadius === r.value ? '#57886C' : '#F7F6FB',
                color: selectedRadius === r.value ? '#FFFFFF' : '#1E1E24',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intent index */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {POST_TYPES.map((pt) => (
          <button
            key={pt.id}
            onClick={() => setSelectedType(pt.id)}
            className="px-4 py-2.5 min-h-[42px] rounded-full text-[13px] font-semibold whitespace-nowrap transition border"
            style={{
              backgroundColor: selectedType === pt.id ? '#ED6A5A' : '#FFFFFF',
              color: selectedType === pt.id ? '#FFFFFF' : 'rgba(30,30,36,.72)',
              borderColor: selectedType === pt.id ? '#ED6A5A' : 'rgba(30,30,36,.1)',
            }}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className="bg-[#fbfaf6] border border-[#1E1E24]/10 p-5 animate-pulse flex flex-col justify-between h-48">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-20 h-6 bg-slate-200 rounded-md"></div>
                  <div className="w-16 h-5 bg-slate-200 rounded-md"></div>
                </div>
                <div className="w-3/4 h-5 bg-slate-200 rounded-md"></div>
                <div className="w-full h-4 bg-slate-200 rounded-md"></div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-slate-200 rounded"></div>
                    <div className="w-16 h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="w-24 h-8 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-[#E8E9DC] border border-[#57886C]/20 p-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 mb-6 bg-[#EDCB96]/40 flex items-center justify-center border border-[#1E1E24]/10">
            <Radio className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No nearby intents yet</h3>
          <p className="text-base text-slate-500 mb-8 max-w-sm mx-auto">
            Be the first to ask your community or offer help.
          </p>
          <Link
            href="/posts/create"
            className="inline-flex items-center justify-center text-white text-sm font-bold px-6 py-3.5 min-h-[44px] transition hover:opacity-90"
            style={{ backgroundColor: '#ED6A5A' }}
          >
            Create Intent Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => {
            const parsedTags = post.tags ? JSON.parse(post.tags) : [];
            const isNeed = post.type === 'NEED' || post.type === 'BORROW';
            const isOffer = post.type === 'OFFER' || post.type === 'GIVE' || post.type === 'LEND';
            const isRide = post.type === 'RIDE';
            const isPlan = post.type === 'PLAN';
            
            let borderColorStyle = { borderLeftColor: '#1E1E24', borderLeftWidth: '4px' };
            let badgeStyle = { backgroundColor: '#1E1E24', color: '#FFFFFF' };
            
            if (isNeed) {
              borderColorStyle = { borderLeftColor: '#ED6A5A', borderLeftWidth: '4px' };
              badgeStyle = { backgroundColor: '#ED6A5A', color: '#FFFFFF' };
            } else if (isOffer) {
              borderColorStyle = { borderLeftColor: '#57886C', borderLeftWidth: '4px' };
              badgeStyle = { backgroundColor: '#57886C', color: '#FFFFFF' };
            } else if (isPlan) {
              borderColorStyle = { borderLeftColor: '#EDCB96', borderLeftWidth: '4px' };
              badgeStyle = { backgroundColor: '#EDCB96', color: '#1E1E24' };
            } else if (isRide) {
              borderColorStyle = { borderLeftColor: '#D8D8F6', borderLeftWidth: '4px' };
              badgeStyle = { backgroundColor: '#D8D8F6', color: '#1E1E24' };
            }

            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-[#1E1E24]/10 p-5 shadow-[0_4px_18px_rgba(30,30,36,.045)] hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(30,30,36,.09)] transition flex flex-col justify-between"
                style={{ ...borderColorStyle }}
              >
                <div>
                  {/* Card Header: Type badge & distance */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em]"
                      style={badgeStyle}
                    >
                      {post.type}
                    </span>

                    <div className="flex items-center gap-2 text-xs font-semibold text-[#1E1E24]/65 px-2 py-1 border border-[#1E1E24]/10">
                      <MapPin className="w-3.5 h-3.5" style={{ color: '#1E1E24' }} />
                      {formatDistance(post.distanceKm)}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-serif text-[#1E1E24] text-[1.35rem] leading-snug hover:text-[#57886C] transition mt-2">
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-sm mt-2 line-clamp-2">{post.description}</p>

                  {/* Route information if RIDE */}
                  {isRide && post.routeOrigin && (
                    <div className="mt-4 p-3 bg-[#E8E9DC]/55 border border-[#1E1E24]/10 text-xs flex items-center justify-between font-medium">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Car className="w-4 h-4" />
                        <span>{post.routeOrigin} ➔ {post.routeDestination}</span>
                      </div>
                      {post.departureTime && (
                        <span className="text-[11px] font-bold" style={{ color: '#1E1E24' }}>
                          {new Date(post.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {parsedTags.map((t: string, idx: number) => (
                        <span key={idx} className="bg-[#D8D8F6]/35 border border-[#1E1E24]/5 text-[#1E1E24]/65 text-xs font-medium px-2.5 py-1">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Author Info & Match Action */}
                <div className="mt-5 pt-4 border-t border-[#1E1E24]/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                    className="w-10 h-10 font-serif text-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: '#1E1E24' }}
                    >
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        {post.author.name}
                        {post.author.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        L{post.author.level} • {post.author.trustScore}
                        <Sparkles className="w-3 h-3" style={{ color: '#EDCB96' }} />★
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className="flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2 transition min-h-[44px]"
                    style={{ backgroundColor: '#F8FAFC', color: '#1E1E24' }}
                  >
                    View & Match
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
