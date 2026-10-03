'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, MapPin, Tag, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';
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
        if (activeTab === 'BORROW_LEND') return p.type === 'BORROW' || p.type === 'LEND';
        if (activeTab === 'SELL_BUY') return p.type === 'SELL' || p.type === 'BUY';
        return ['SERVICE', 'GIVE', 'BORROW', 'LEND', 'SELL', 'BUY'].includes(p.type);
      });

      setItems(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2 border border-purple-400/30">
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            <span>HYPERLOCAL COMMUNITY EXCHANGE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Marketplace, Borrow & Services</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
            Borrow laptops & chargers, buy/sell campus items, get tutoring or PPT design, and collect free giveaways.
          </p>
        </div>

        <Link
          href="/posts/create"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Listing</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Listings' },
          { id: 'BORROW_LEND', label: '🤝 Borrow & Lend' },
          { id: 'SELL_BUY', label: '🛍️ Buy & Sell' },
          { id: 'SERVICES', label: '🛠️ Tutoring & Services' },
          { id: 'GIVEAWAY', label: '🎁 Free Giveaways' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold text-slate-500">Loading marketplace listings...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">No marketplace listings in this category</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-purple-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase">
                    {item.type}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {item.price ? `₹${item.price}` : 'FREE / BORROW'}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base">{item.title}</h3>
                <p className="text-slate-600 text-xs mt-1 line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {item.author.name.charAt(0)}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {item.author.name} ({item.author.trustScore}★)
                  </div>
                </div>

                <Link
                  href={`/posts/${item.id}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <span>Connect & Trade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
