'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Star,
  User,
  ArrowLeft,
  Check
} from 'lucide-react';
import { formatDistance } from '@/lib/geo';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [postData, setPostData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestMsg, setInterestMsg] = useState('');
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);
  const [ratingAttribute, setRatingAttribute] = useState('Helpful');
  const [ratingNote, setRatingNote] = useState('');
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchMatches();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      setPostData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`/api/posts/${id}/match`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExpressInterest = async () => {
    setIsSubmittingInterest(true);
    try {
      const res = await fetch(`/api/posts/${id}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: interestMsg }),
      });
      if (res.ok) {
        await fetchPost();
        setInterestMsg('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingInterest(false);
    }
  };

  const handleInterestAction = async (interestId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      const res = await fetch(`/api/posts/${id}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interestId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.chatId) {
          router.push(`/chat/${data.chatId}`);
        } else {
          await fetchPost();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchPost();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRateTrust = async () => {
    if (!postData?.post?.authorId) return;
    try {
      const res = await fetch('/api/trust/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: postData.post.authorId,
          scoreChange: 0.2,
          feedbackAttribute: ratingAttribute,
          note: ratingNote || 'Completed exchange through post matching',
          postId: id,
        }),
      });
      if (res.ok) {
        setIsRatingSubmitted(true);
        fetchPost();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading Post & AI Matches...</p>
      </div>
    );
  }

  if (!postData?.post) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Post Not Found</h3>
        <Link href="/feed" className="mt-4 inline-block text-xs font-bold text-indigo-600">
          ← Back to Help Radar
        </Link>
      </div>
    );
  }

  const { post, isAuthor } = postData;
  const parsedTags = post.tags ? JSON.parse(post.tags) : [];
  const parsedRisk = post.riskIndicators ? JSON.parse(post.riskIndicators) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/feed" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Help Radar</span>
      </Link>

      {/* Main Post Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
              {post.type}
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
              STATUS: {post.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span>{post.areaName} ({post.radiusKm} km radius)</span>
          </div>
        </div>

        {/* Title & Body */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">{post.title}</h1>
          <p className="text-slate-700 text-sm mt-2 whitespace-pre-line leading-relaxed">{post.description}</p>
        </div>

        {/* Route Details if present */}
        {post.routeOrigin && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900">
            🚗 Route: <span className="underline">{post.routeOrigin}</span> ➔ <span className="underline">{post.routeDestination}</span>
          </div>
        )}

        {/* Author Card */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-200 text-indigo-800 font-bold flex items-center justify-center text-sm">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {post.author.name}
                {post.author.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-50" />}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Level {post.author.level} • {post.author.trustScore}★ Trust Score
              </div>
            </div>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Lifecycle:</span>
              <select
                value={post.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-bold bg-white border border-slate-300 rounded-lg p-1.5"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          )}
        </div>

        {/* Safety Risk Panel */}
        {parsedRisk.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <div className="font-bold text-amber-800 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>AI Advisory Safety Indicator:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {parsedRisk.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Express Interest Action (If not author) */}
        {!isAuthor && post.status === 'ACTIVE' && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-indigo-900">Express Interest / Connect with {post.author.name}:</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. I have a charger near GEU Gate 2! Ready to lend."
                value={interestMsg}
                onChange={(e) => setInterestMsg(e.target.value)}
                className="flex-1 p-2 bg-white border border-indigo-200 rounded-lg text-xs"
              />
              <button
                onClick={handleExpressInterest}
                disabled={isSubmittingInterest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Interest</span>
              </button>
            </div>
          </div>
        )}

        {/* Interested Users list (If Author) */}
        {isAuthor && post.interests && post.interests.length > 0 && (
          <div className="p-4 bg-slate-100 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Interested People ({post.interests.length}):</h4>
            <div className="space-y-2">
              {post.interests.map((int: any) => (
                <div key={int.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{int.user.name} ({int.user.trustScore}★)</div>
                    <div className="text-xs text-slate-600 mt-0.5">"{int.message}"</div>
                  </div>
                  {int.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInterestAction(int.id, 'ACCEPT')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded text-xs"
                      >
                        Accept & Chat
                      </button>
                      <button
                        onClick={() => handleInterestAction(int.id, 'REJECT')}
                        className="bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      ACCEPTED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI MATCH RECOMMENDATION ENGINE SECTION */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">AI Proximity & Intent Matches</h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{matches.length} Matches Found</span>
        </div>

        {matches.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">
            No active intent matches currently found in proximity. AI will notify you when a nearby match posts!
          </p>
        ) : (
          <div className="space-y-3">
            {matches.map((m: any, idx: number) => (
              <div key={idx} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded text-[10px]">
                      {Math.round(m.matchScore * 100)}% AI RELEVANCE
                    </span>
                    <span className="text-xs font-bold text-slate-300">{m.targetPost.type}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{m.targetPost.title}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{m.matchReason}</p>
                </div>

                <Link
                  href={`/posts/${m.targetPost.id}`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg text-center transition shrink-0"
                >
                  View Matched Post ➔
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRUST RATING AFTER EXCHANGE */}
      {!isAuthor && post.status === 'COMPLETED' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Rate Exchange Trust & Reliability for {post.author.name}:</span>
          </h3>

          {isRatingSubmitted ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Trust rating submitted! +100 XP awarded to exchange peers.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Reliable', 'Helpful', 'On_time', 'Honest', 'Good_communicator'].map((attr) => (
                  <button
                    key={attr}
                    onClick={() => setRatingAttribute(attr)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      ratingAttribute === attr ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {attr}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Optional note e.g. Met on time at GEU Gate 2, super helpful!"
                value={ratingNote}
                onChange={(e) => setRatingNote(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button
                onClick={handleRateTrust}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm"
              >
                Submit Trust Review (+0.2★)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
