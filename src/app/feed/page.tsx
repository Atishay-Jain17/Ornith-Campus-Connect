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
  { id: 'ALL', label: 'All Intents' },
  { id: 'NEED', label: '⚡ Need Help' },
  { id: 'OFFER', label: '🎁 Offer / Give' },
  { id: 'BORROW', label: '🤝 Borrow / Lend' },
  { id: 'RIDE', label: '🚗 Ride / Route' },
  { id: 'PLAN', label: '🍕 Hangouts & Plans' },
  { id: 'SERVICE', label: '🛠️ Services' },
  { id: 'OPPORTUNITY', label: '💼 Opportunities' },
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
  const [selectedRadius, setSelectedRadius] = useState(10.0);
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
      {/* Help Radar Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
              <span>HYPERLOCAL HELP RADAR • GRAPHIC ERA CAMPUS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Need something? Ask nearby. Have something? Share.
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Instant proximity matching for laptop chargers, carpools, café plans, group buys, borrow/lend items, and verified campus help.
            </p>
          </div>

          <Link
            href="/posts/create"
            className="self-start md:self-auto bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition hover:scale-105"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Post Intent with AI</span>
          </Link>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search charger, ride, pizza, PPT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Proximity Radius Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            Radius:
          </span>
          {RADII.map((r) => (
            <button
              key={r.value}
              onClick={() => setSelectedRadius(r.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedRadius === r.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {POST_TYPES.map((pt) => (
          <button
            key={pt.id}
            onClick={() => setSelectedType(pt.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedType === pt.id
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm font-semibold text-slate-500">Scanning Hyperlocal Radar...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No active intents found in this radius</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try expanding your search radius or post a new intent to invite nearby campus members!
          </p>
          <Link
            href="/posts/create"
            className="inline-block mt-4 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
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

            return (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Type badge & distance */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide ${
                        isNeed
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isOffer
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isRide
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {post.type}
                    </span>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        {formatDistance(post.distanceKm)}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition">
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-slate-600 text-xs mt-1.5 line-clamp-2">{post.description}</p>

                  {/* Route information if RIDE */}
                  {isRide && post.routeOrigin && (
                    <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-center justify-between font-medium">
                      <span>🚗 {post.routeOrigin} ➔ {post.routeDestination}</span>
                      {post.departureTime && (
                        <span className="text-[11px] text-blue-700 font-bold">
                          {new Date(post.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {parsedTags.map((t: string, idx: number) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer: Author Info & Match Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        {post.author.name}
                        {post.author.isVerified && <ShieldCheck className="w-3 h-3 text-blue-500 fill-blue-50" />}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        L{post.author.level} • {post.author.trustScore}★ Trust
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/posts/${post.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>View & Match</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
