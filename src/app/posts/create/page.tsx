'use client';

import React, { useState } from 'react';
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
  CheckCircle2
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        setCustomTitle(data.intent.title || rawText);
        setCustomDescription(rawText);
        setRadiusKm(data.intent.radiusKm ? data.intent.radiusKm.toString() : '2.0');
        if (data.intent.routeOrigin) setRouteOrigin(data.intent.routeOrigin);
        if (data.intent.routeDestination) setRouteDestination(data.intent.routeDestination);
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
          typeOverride: aiIntent?.type || 'NEED',
          radiusKm: parseFloat(radiusKm),
          routeOrigin,
          routeDestination,
          areaName: 'Graphic Era Area',
          latitude: 30.2687,
          longitude: 78.0076,
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wide mb-1">
          <Sparkles className="w-4 h-4" />
          <span>AI Intent Engine</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">Post an Intent to Hyperlocal Radar</h1>
        <p className="text-slate-600 text-xs mt-1">
          Write naturally in plain English (e.g., <i>"Need Lenovo charger near campus for tonight"</i> or <i>"Graphic Era to Saharanpur at 5 PM"</i>).
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Natural Text Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Express your intent in plain words:
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Need Lenovo charger near Graphic Era for tonight submission OR Graphic Era to Saharanpur Chowk at 5 PM 2 seats"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />

            <button
              type="button"
              onClick={handleAiParse}
              disabled={isParsing || !rawText.trim()}
              className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span>{isParsing ? 'Analyzing Intent...' : 'Auto-Extract Structured Fields'}</span>
            </button>
          </div>

          {/* AI Extracted Panel */}
          {aiIntent && (
            <div className="bg-indigo-950 text-white rounded-xl p-4 text-xs space-y-3 shadow-md border border-indigo-800">
              <div className="flex items-center justify-between border-b border-indigo-800/80 pb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  AI Structured Intent Analysis:
                </span>
                <span className="bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded font-extrabold text-[10px] uppercase">
                  {aiIntent.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Category:</span>
                  <span className="font-semibold text-white">{aiIntent.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Suggested Expiry:</span>
                  <span className="font-semibold text-white">{aiIntent.suggestedExpiryHours} Hours</span>
                </div>
              </div>

              {aiIntent.tags && aiIntent.tags.length > 0 && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {aiIntent.tags.map((t: string, idx: number) => (
                      <span key={idx} className="bg-indigo-900 text-indigo-200 px-1.5 py-0.5 rounded text-[10px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aiIntent.riskIndicators && aiIntent.riskIndicators.length > 0 && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-200">
                  <span className="font-bold flex items-center gap-1 text-rose-300 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    AI Safety Check Indicator:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {aiIntent.riskIndicators.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visibility Radius</label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Location Area</label>
                <input
                  type="text"
                  readOnly
                  value="Graphic Era Campus (Approx)"
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-600"
                />
              </div>
            </div>

            {/* Route Fields if RIDE */}
            {(aiIntent?.type === 'RIDE' || rawText.toLowerCase().includes('ride') || rawText.toLowerCase().includes('going to')) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  🚗 Route Matching Setup:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-800">Origin</label>
                    <input
                      type="text"
                      placeholder="e.g. Graphic Era Gate 1"
                      value={routeOrigin}
                      onChange={(e) => setRouteOrigin(e.target.value)}
                      className="w-full p-2 bg-white border border-blue-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-blue-800">Destination</label>
                    <input
                      type="text"
                      placeholder="e.g. Saharanpur Chowk"
                      value={routeDestination}
                      onChange={(e) => setRouteDestination(e.target.value)}
                      className="w-full p-2 bg-white border border-blue-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Publishing...' : 'Publish Intent to Radar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
