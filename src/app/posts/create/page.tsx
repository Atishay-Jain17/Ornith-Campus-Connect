'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Tag,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Car
} from 'lucide-react';

export default function CreatePostPage() {
  const router = useRouter();
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiIntent, setAiIntent] = useState<any>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [radiusKm, setRadiusKm] = useState('2.0');
  const [routeOrigin, setRouteOrigin] = useState('');
  const [routeDestination, setRouteDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [contributionMode, setContributionMode] = useState('');
  const [canPostOpportunity, setCanPostOpportunity] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then((res) => res.json()).then((data) => {
      setCanPostOpportunity(Boolean(data.user?.isVerified && data.user?.level >= 5));
    }).catch(() => {}).finally(() => setUserLoaded(true));
  }, []);

  const handleAiParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/posts/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });
      const data = await res.json();
      if (data.intent) {
        setAiIntent(data.intent);
        setSelectedType(data.intent.type || '');
        setCustomTitle(data.intent.title || rawText);
        setCustomDescription(rawText);
        setRadiusKm(data.intent.radiusKm ? data.intent.radiusKm.toString() : '2.0');
        if (data.intent.routeOrigin) setRouteOrigin(data.intent.routeOrigin);
        if (data.intent.routeDestination) setRouteDestination(data.intent.routeDestination);
        if (data.intent.price) setPrice(String(data.intent.price));
        if (data.intent.capacity) setCapacity(String(data.intent.capacity));
        setContributionMode(data.intent.contributionMode || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          customTitle,
          customDescription,
          // When the user skips the preview, let the API classify the raw text.
          typeOverride: selectedType || undefined,
          radiusKm: parseFloat(radiusKm),
          routeOrigin,
          routeDestination,
          departureTime: departureTime || undefined,
          areaName: 'Graphic Era Area',
          latitude: 30.2687,
          longitude: 78.0076,
          price: price ? parseFloat(price) : undefined,
          capacity: capacity ? parseInt(capacity, 10) : undefined,
          contributionMode: contributionMode || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to publish post');
        return;
      }

      router.push(`/posts/${data.post.id}`);
    } catch (e) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-20 px-4 sm:px-0">
      <div className="bg-[#fbfaf6] border-y border-[#1E1E24]/10 py-7 sm:p-10 space-y-7">
        
        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#57886C] mb-4">
            <span className="h-2 w-2 bg-[#ED6A5A]" />
            Write it your way
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl leading-none tracking-[-.045em] text-[#1E1E24]">What brings you here?</h1>
          <p className="text-[#1E1E24]/60 text-sm mt-3 leading-6">
            Ask for something, offer what you have, or tell campus what you&apos;re planning.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#ED6A5A]/10 border border-[#ED6A5A]/25 text-[#9b3d33] text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Natural Text Box */}
          <div className="space-y-3">
            <label htmlFor="intent-description" className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#1E1E24]/55">Tell your campus community</label>
            <textarea
              id="intent-description"
              rows={4}
              required
              placeholder="e.g. Need a Lenovo charger near campus for tonight... or Graphic Era to Saharanpur at 5 PM, 2 seats available."
              value={rawText}
              onChange={(e) => { setRawText(e.target.value); setAiIntent(null); setSelectedType(''); setCustomTitle(e.target.value); setCustomDescription(e.target.value); setContributionMode(''); setPrice(''); setCapacity(''); setRouteOrigin(''); setRouteDestination(''); setDepartureTime(''); setRadiusKm('2.0'); }}
              className="w-full p-5 sm:p-6 bg-[#E8E9DC]/45 border border-[#1E1E24]/15 text-base leading-7 focus:outline-none focus:border-[#57886C] text-[#1E1E24] placeholder:text-[#1E1E24]/40 transition-all resize-y min-h-36"
            />

            <p className="text-xs text-[#1E1E24]/55">Share a campus area, not a room or home address. Keep the exact meetup point for private chat.</p>

            <button
              type="button"
              onClick={handleAiParse}
              disabled={isParsing || !rawText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#57886C] hover:bg-[#3d6450] text-white font-bold px-5 py-3 transition-colors disabled:opacity-50 text-sm"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isParsing ? 'Analyzing...' : 'Parse with AI ✦'}</span>
            </button>
          </div>

          {/* AI Extracted Panel */}
          {aiIntent && (
            <div className="bg-[#1E1E24] text-white p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-bold text-[#EDCB96] flex items-center gap-2 text-sm uppercase tracking-wide">
                  ✦ AI Analysis
                </span>
                <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                  aiIntent.type === 'OFFER' ? 'bg-[#57886C] text-white' : 'bg-[#ED6A5A] text-white'
                }`}>
                  {aiIntent.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-white/50 block text-[11px] font-semibold uppercase mb-0.5">Category</span>
                  <span className="font-bold text-[15px]">{aiIntent.category}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[11px] font-semibold uppercase mb-0.5">Expiry</span>
                  <span className="font-bold text-[15px]">{aiIntent.suggestedExpiryHours} Hours</span>
                </div>
              </div>

              {aiIntent.tags && aiIntent.tags.length > 0 && (
                <div>
                  <span className="text-white/50 block text-[11px] font-semibold uppercase mb-1.5">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiIntent.tags.map((t: string, idx: number) => (
                      <span key={idx} className="bg-white/10 text-white px-2 py-1 rounded-md text-[11px] font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiIntent.riskIndicators && aiIntent.riskIndicators.length > 0 && (
                <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10 text-[#EDCB96]">
                  <span className="font-bold flex items-center gap-1.5 text-sm mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    Safety Check
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                    {aiIntent.riskIndicators.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-5 pt-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#1E1E24]/60 mb-2">Intent type</label>
              <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="w-full p-3.5 bg-white border border-[#1E1E24]/15 text-sm font-medium focus:outline-none focus:border-[#57886C]">
                <option value="">Let AI decide from your description</option>
                {['NEED','OFFER','BORROW','LEND','BUY','SELL','GIVE','RENT','SERVICE','RIDE','GROUP_BUY','PLAN','OPPORTUNITY','LOST_FOUND','COMMUNITY'].map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
              </select>
              {selectedType === 'OPPORTUNITY' && <p className={`mt-2 text-xs font-semibold ${canPostOpportunity ? 'text-[#57886C]' : 'text-[#9b3d33]'}`}>
                {canPostOpportunity ? 'Your verified Level 5 profile can publish opportunities.' : userLoaded ? 'Opportunity posts need a verified Level 5 profile.' : 'Checking opportunity access…'}
              </p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#1E1E24]/60 mb-2">A short title</label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full p-3.5 bg-white border border-[#1E1E24]/15 text-sm font-medium focus:outline-none focus:border-[#57886C] transition-all"
              />
            </div>

            {(selectedType === 'BUY' || selectedType === 'SELL' || selectedType === 'RENT' || selectedType === 'SERVICE' || aiIntent?.price) && <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div><label className="block text-sm font-bold text-[#1E1E24] mb-2">Price or contribution (₹)</label><input type="number" min="0" step="1" value={price} onChange={(event) => { setPrice(event.target.value); if (event.target.value) setContributionMode('FIXED'); }} placeholder="Free if left blank" className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm" /></div>
              <div><label className="block text-sm font-bold text-[#1E1E24] mb-2">Contribution style</label><select value={contributionMode || 'FREE'} onChange={(event) => setContributionMode(event.target.value)} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm"><option value="FREE">Free / Good Samaritan</option><option value="EQUAL_SPLIT">Split equally</option><option value="FIXED">Fixed contribution</option><option value="CUSTOM">Custom amounts</option></select></div>
            </div>}
            {selectedType === 'RIDE' && <div><label className="block text-sm font-bold text-[#1E1E24] mb-2">Available seats</label><input type="number" min="1" max="20" value={capacity} onChange={(event) => setCapacity(event.target.value)} placeholder="How many people can join?" className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm" /></div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-[#1E1E24] mb-2">Visibility Radius</label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#57886C]/30 focus:border-[#57886C] transition-all"
                >
                  <option value="0.5">500 m</option>
                  <option value="1.0">1 km</option>
                  <option value="2.0">2 km (Campus area)</option>
                  <option value="5.0">5 km</option>
                  <option value="10.0">10 km</option>
                  <option value="25.0">25 km</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1E1E24] mb-2">Location Area</label>
                <input
                  type="text"
                  readOnly
                  value="Graphic Era Campus (Approx)"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Route Fields if RIDE */}
            {(selectedType === 'RIDE' || aiIntent?.type === 'RIDE' || rawText.toLowerCase().includes('ride') || rawText.toLowerCase().includes('going to') || rawText.toLowerCase().includes('carpool')) && (
              <div className="p-5 bg-[#E8E9DC]/45 border border-[#1E1E24]/10 space-y-4">
                <span className="text-sm font-bold text-[#1E1E24] flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#57886C]" />
                  Route Setup
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24]/70 mb-1.5 uppercase tracking-wide">Origin</label>
                    <input
                      type="text"
                      placeholder="e.g. Graphic Era Gate 1"
                      value={routeOrigin}
                      onChange={(e) => setRouteOrigin(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#57886C]/30 focus:border-[#57886C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24]/70 mb-1.5 uppercase tracking-wide">Destination</label>
                    <input
                      type="text"
                      placeholder="e.g. Saharanpur Chowk"
                      value={routeDestination}
                      onChange={(e) => setRouteDestination(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#57886C]/30 focus:border-[#57886C]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#1E1E24]/70 mb-1.5 uppercase tracking-wide">Departure time</label>
                    <input type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || (selectedType === 'OPPORTUNITY' && userLoaded && !canPostOpportunity)}
              className="w-full bg-[#ED6A5A] hover:bg-[#d95647] text-white py-4 font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span>{isSubmitting ? 'Publishing...' : 'Publish to Radar'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
