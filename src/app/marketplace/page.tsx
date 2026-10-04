'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, MapPin, Tag, PlusCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { formatDistance } from '@/lib/geo';

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchMarketplace();
  }, [activeTab]);

  const fetchMarketplace = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/posts';
      const res = await fetch(endpoint);
      const data = await res.json();
      const allPosts = data.posts || [];

      const filtered = allPosts.filter((p: any) => {
        if (activeTab === 'SERVICES') return p.type === 'SERVICE';
        if (activeTab === 'GIVEAWAY') return p.type === 'GIVE';
        if (activeTab === 'BORROW_LEND') return ['BORROW', 'LEND'].includes(p.type);
        if (activeTab === 'SELL_BUY') return p.type === 'SELL' || p.type === 'BUY';
        if (activeTab === 'RENT') return p.type === 'RENT';
        if (activeTab === 'GROUP_BUY') return p.type === 'GROUP_BUY';
        return ['SERVICE', 'GIVE', 'BORROW', 'LEND', 'SELL', 'BUY', 'RENT', 'GROUP_BUY'].includes(p.type);
      });

      setItems(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyle = (type: string) => {
    if (['BUY', 'NEED'].includes(type)) {
      return { 
        bg: 'bg-[#ED6A5A]/10', 
        text: 'text-[#ED6A5A]', 
        icon: <Search className="w-3.5 h-3.5" /> 
      };
    }
    return { 
      bg: 'bg-[#57886C]/10', 
      text: 'text-[#57886C]', 
      icon: <Tag className="w-3.5 h-3.5" /> 
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-8">
      {/* Banner */}
      <div className="bg-[#D8D8F6] border border-[#A0A0E8]/35 p-6 sm:p-8 rounded-[22px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 text-[#1E1E24] text-[10px] font-bold uppercase tracking-[.16em] mb-3">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>COMMUNITY EXCHANGE</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl leading-[1.04] tracking-[-.04em] text-[#1E1E24]">Good finds, close by.</h1>
          <p className="text-[#1E1E24]/70 text-sm mt-2 max-w-xl">
            Borrow laptops & chargers, buy/sell campus items, get tutoring or PPT design, and collect free giveaways.
          </p>
        </div>

        <Link
          href="/posts/create"
          className="bg-[#ED6A5A] hover:bg-[#d95647] text-white font-bold px-5 py-3 rounded-xl text-sm flex items-center justify-center gap-2 self-stretch md:self-auto transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Listing</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'ALL', label: 'All Listings' },
          { id: 'BORROW_LEND', label: 'Borrow & Lend' },
          { id: 'SELL_BUY', label: 'Buy & Sell' },
          { id: 'SERVICES', label: 'Services' },
          { id: 'GIVEAWAY', label: 'Free' },
          { id: 'RENT', label: 'Rentals' },
          { id: 'GROUP_BUY', label: 'Group Buy' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#1E1E24] text-white'
                : 'bg-white text-[#1E1E24] border border-[#1E1E24]/10 hover:bg-[#1E1E24]/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#1E1E24]/5 shadow-sm">
          <div className="w-8 h-8 border-4 border-[#D8D8F6] border-t-[#1E1E24] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-[#1E1E24]/60">Discovering items nearby...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#1E1E24]/5 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#F7F7F5] rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#1E1E24]/40" />
          </div>
          <h3 className="font-bold text-lg text-[#1E1E24]">No listings found</h3>
          <p className="text-[#1E1E24]/60 text-sm mt-1 max-w-sm mx-auto">Be the first to post something in this category and help out your community.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {items.map((item) => {
            const style = getTypeStyle(item.type);
            
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-[#1E1E24]/10 p-3 md:p-5 shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all">
                <div>
                  <div className={`mb-4 h-2 w-full ${style.bg}`} />
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-md text-[10px] md:text-xs font-bold uppercase flex items-center gap-1 ${style.bg} ${style.text}`}>
                      {style.icon}
                      {item.type}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-[#1E1E24] bg-[#F7F7F5] px-2 py-1 rounded-md border border-[#1E1E24]/5">
                      {item.price ? `₹${item.price}` : 'FREE'}
                    </span>
                  </div>

                  <h3 className="font-serif text-[#1E1E24] text-base md:text-xl leading-tight mb-1.5 line-clamp-2">{item.title}</h3>
                  <p className="text-[#1E1E24]/60 text-xs md:text-sm line-clamp-2 mb-3">{item.description}</p>
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex items-center text-[#1E1E24]/60 text-[10px] md:text-xs font-medium bg-[#FAFAFA] px-2 py-1.5 rounded-lg border border-[#1E1E24]/5">
                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                    <span className="truncate">{typeof item.distanceKm === 'number' ? formatDistance(item.distanceKm) : 'Nearby'}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-[#1E1E24]/5 flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#D8D8F6] text-[#1E1E24] font-bold text-xs flex items-center justify-center shrink-0">
                        {item.author.name.charAt(0)}
                      </div>
                      <div className="text-[10px] md:text-xs font-bold text-[#1E1E24] truncate">
                        {item.author.name} <span className="text-[#EDCB96]">★</span>{item.author.trustScore}
                      </div>
                    </div>

                    <Link
                      href={`/posts/${item.id}`}
                      className="bg-[#1E1E24] hover:bg-[#2a2a32] text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors shrink-0"
                    >
                      <span>Connect</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
