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
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isUpdatingBlock, setIsUpdatingBlock] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchMatches();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      setPostData(data);
      if (data.post?.authorId) {
        const blockStatus = await fetch(`/api/blocks?userId=${encodeURIComponent(data.post.authorId)}`);
        if (blockStatus.ok) setIsBlockedByMe(Boolean((await blockStatus.json()).blockedByMe));
      }
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

  const handleReportPost = async () => {
    if (!reportReason.trim()) return;
    setIsReporting(true);
    setReportMessage('');
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPostId: id, reason: reportReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit report.');
      setReportMessage('Thanks. Your report is now in the campus safety queue.');
      setReportReason('');
      setShowReportForm(false);
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : 'Could not submit report.');
    } finally {
      setIsReporting(false);
    }
  };

  const handleBlockToggle = async () => {
    const nextBlocked = !isBlockedByMe;
    setIsUpdatingBlock(true);
    try {
      const res = await fetch('/api/blocks', {
        method: nextBlocked ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedUserId: post.authorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update block list.');
      setIsBlockedByMe(nextBlocked);
    } catch (error) {
      setReportMessage(error instanceof Error ? error.message : 'Could not update block list.');
    } finally {
      setIsUpdatingBlock(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-[#D8D8F6] border-t-[#ED6A5A] rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-[#1E1E24]/60 font-semibold">Loading Post & AI Matches...</p>
      </div>
    );
  }

  if (!postData?.post) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-[#ED6A5A] mx-auto mb-2" />
        <h3 className="font-bold text-[#1E1E24]">Post Not Found</h3>
        <Link href="/feed" className="mt-4 inline-block text-xs font-bold text-[#57886C]">
          ← Back to Help Radar
        </Link>
      </div>
    );
  }

  const { post, isAuthor } = postData;
  const linkedPlan = post.plans?.[0];
  const parsedTags = post.tags ? JSON.parse(post.tags) : [];
  const parsedRisk = post.riskIndicators ? JSON.parse(post.riskIndicators) : [];

  const getTypeColor = (type: string) => {
    const t = type.toUpperCase();
    if (['NEED', 'BORROW'].includes(t)) return 'bg-[#ED6A5A]/10 text-[#ED6A5A] border-[#ED6A5A]/20';
    if (['OFFER', 'GIVE', 'LEND'].includes(t)) return 'bg-[#57886C]/10 text-[#57886C] border-[#57886C]/20';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Back Button */}
      <Link href="/feed" className="inline-flex items-center gap-1 text-xs font-bold text-[#1E1E24]/60 hover:text-[#1E1E24] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Help Radar</span>
      </Link>

      {/* Main Post Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase border ${getTypeColor(post.type)}`}>
              {post.type}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1E1E24] text-white tracking-wider">
              {post.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#1E1E24]/70 bg-slate-50 px-3 py-1.5 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-[#ED6A5A]" />
            <span>{post.areaName} ({post.radiusKm} km)</span>
          </div>
        </div>

        {/* Title & Body */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1E1E24] leading-tight tracking-tight">{post.title}</h1>
          <p className="text-[#1E1E24]/80 text-[15px] mt-3 whitespace-pre-line leading-relaxed">{post.description}</p>
        </div>

        {/* Route Details if present */}
        {post.routeOrigin && (
          <div className="p-3.5 bg-[#57886C]/5 border border-[#57886C]/20 rounded-xl text-sm font-semibold text-[#1E1E24] flex items-center gap-2">
            🚗 <span className="opacity-70">Route:</span> <span className="underline decoration-[#57886C]/30">{post.routeOrigin}</span> <span className="text-[#57886C]">➔</span> <span className="underline decoration-[#57886C]/30">{post.routeDestination}</span>
          </div>
        )}

        {/* Author Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#57886C] text-white font-black flex items-center justify-center text-lg shadow-sm">
              {post.author.name.charAt(0)}
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#1E1E24] flex items-center gap-1.5">
                {post.author.name}
                {post.author.isVerified && <ShieldCheck className="w-4 h-4 text-[#57886C] fill-[#57886C]/10" />}
              </div>
              <div className="text-xs text-[#1E1E24]/60 font-semibold mt-0.5 flex items-center gap-1.5">
                <span>Lvl {post.author.level}</span>
                <span className="w-1 h-1 rounded-full bg-[#1E1E24]/20"></span>
                <span className="flex items-center gap-0.5">
                  {post.author.trustScore} <Star className="w-3 h-3 fill-[#EDCB96] text-[#EDCB96]" /> Trust
                </span>
              </div>
            </div>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-[#1E1E24]/60 uppercase tracking-wider">Lifecycle</span>
              <select
                value={post.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm font-bold text-[#1E1E24] bg-transparent outline-none cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          )}
        </div>

        {!isAuthor && <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Meet in a public campus location. Keep private contact details in ORNITH chat.</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setShowReportForm((shown) => !shown)} className="text-xs font-bold text-slate-500 underline underline-offset-2 hover:text-[#ED6A5A]">Report this post</button>
            <button type="button" onClick={handleBlockToggle} disabled={isUpdatingBlock} className="text-xs font-bold text-slate-500 underline underline-offset-2 hover:text-[#ED6A5A] disabled:opacity-50">{isUpdatingBlock ? 'Saving…' : isBlockedByMe ? 'Unblock user' : 'Block user'}</button>
          </div>
        </div>}
        {showReportForm && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <label className="block text-sm font-bold text-slate-800">What should moderators know?
            <textarea value={reportReason} onChange={(event) => setReportReason(event.target.value)} maxLength={500} rows={3} placeholder="Describe the safety concern or policy issue" className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm outline-none focus:border-[#ED6A5A]" />
          </label>
          <button type="button" onClick={handleReportPost} disabled={isReporting || !reportReason.trim()} className="rounded-xl bg-[#1E1E24] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{isReporting ? 'Sending…' : 'Send report'}</button>
        </div>}
        {reportMessage && <p role="status" className="text-xs text-slate-600">{reportMessage}</p>}

        {/* Safety Risk Panel */}
        {parsedRisk.length > 0 && (
          <div className="p-4 bg-[#EDCB96]/10 border border-[#EDCB96]/30 rounded-2xl text-[13px] text-[#1E1E24]/80 space-y-1.5">
            <div className="font-bold text-[#1E1E24] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#EDCB96]" />
              <span>Safety Advisory</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              {parsedRisk.map((r: string, idx: number) => (
                <li key={idx} className="opacity-90">{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Express Interest Action (If not author) */}
        {!isAuthor && !isBlockedByMe && post.status === 'ACTIVE' && (
          linkedPlan ? <div className="p-5 bg-[#E8E9DC] border border-[#57886C]/20 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div><h4 className="text-sm font-bold text-[#1E1E24]">This post is a campus plan</h4><p className="mt-1 text-xs text-[#1E1E24]/60">The host reviews every join request.</p></div>
            <Link href={`/plans/${linkedPlan.id}`} className="rounded-xl bg-[#1E1E24] px-4 py-3 text-sm font-bold text-white">View plan & request to join</Link>
          </div> : <div className="p-5 bg-white border-2 border-[#1E1E24]/5 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-[#1E1E24]">Interested in this {post.type.toLowerCase()}?</h4>
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <input
                type="text"
                placeholder="e.g. I can help with this! I'm nearby."
                value={interestMsg}
                onChange={(e) => setInterestMsg(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#ED6A5A] focus:ring-1 focus:ring-[#ED6A5A] transition-all"
              />
              <button
                onClick={handleExpressInterest}
                disabled={isSubmittingInterest}
                className="bg-[#ED6A5A] hover:bg-[#ED6A5A]/90 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>I'm Interested</span>
              </button>
            </div>
          </div>
        )}

        {/* Interested Users list (If Author) */}
        {isAuthor && post.interests && post.interests.length > 0 && (
          <div className="p-5 bg-slate-50 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-[#1E1E24] flex items-center justify-between">
              <span>Interested People</span>
              <span className="bg-[#1E1E24] text-white px-2 py-0.5 rounded-full text-xs">{post.interests.length}</span>
            </h4>
            <div className="space-y-3">
              {post.interests.map((int: any) => (
                <div key={int.id} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-[#1E1E24] flex items-center gap-2">
                      {int.user.name}
                      <span className="text-xs bg-[#EDCB96]/20 text-[#1E1E24]/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        {int.user.trustScore} <Star className="w-3 h-3 text-[#EDCB96] fill-[#EDCB96]" />
                      </span>
                    </div>
                    <div className="text-[13px] text-[#1E1E24]/70 mt-1 italic">"{int.message}"</div>
                  </div>
                  {int.status === 'PENDING' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleInterestAction(int.id, 'REJECT')}
                        className="bg-slate-100 hover:bg-slate-200 text-[#1E1E24]/70 font-bold px-3 py-2 rounded-lg text-xs transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleInterestAction(int.id, 'ACCEPT')}
                        className="bg-[#57886C] hover:bg-[#57886C]/90 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm"
                      >
                        Accept & Chat
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-black text-[#57886C] bg-[#57886C]/10 px-3 py-1.5 rounded-lg border border-[#57886C]/20 shrink-0 uppercase tracking-wider">
                      Accepted
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI MATCH RECOMMENDATION ENGINE SECTION - DIFFERENTIATOR */}
      <div className="bg-[#1E1E24] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#D8D8F6]" />
            <h2 className="text-lg font-black text-white tracking-wide">✦ AI Proximity Matches</h2>
          </div>
          {matches.length > 0 && (
            <span className="px-2.5 py-1 bg-[#D8D8F6]/20 text-[#D8D8F6] text-[11px] font-black rounded-full border border-[#D8D8F6]/30">
              {matches.length} FOUND
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-[#D8D8F6]/40 mx-auto" />
            <p className="text-white/60 text-sm font-medium">
              No active intent matches currently found in proximity.
            </p>
            <p className="text-[#D8D8F6]/80 text-xs font-bold">
              AI will notify you when a nearby match posts!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((m: any, idx: number) => (
              <div key={idx} className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-[#D8D8F6] tracking-tighter">
                      {Math.round(m.matchScore * 100)}%
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/50 bg-white/10 px-2 py-0.5 rounded">
                      {m.targetPost.type}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-[15px]">{m.targetPost.title}</h4>
                  
                  {/* Match Reasons as Bullets */}
                  <ul className="text-white/70 text-xs space-y-1 ml-4 list-disc marker:text-[#D8D8F6]">
                    {m.matchReason.split('. ').filter(Boolean).map((reason: string, i: number) => (
                      <li key={i}>{reason.replace(/\.$/, '')}</li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/posts/${m.targetPost.id}`}
                  className="bg-[#ED6A5A] hover:bg-[#ED6A5A]/90 text-white font-bold text-sm px-5 py-2.5 rounded-xl text-center transition-all shrink-0 shadow-lg shadow-[#ED6A5A]/20"
                >
                  View Match ➔
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRUST RATING AFTER EXCHANGE */}
      {!isAuthor && post.status === 'COMPLETED' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-[#1E1E24] text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-[#EDCB96] fill-[#EDCB96]" />
            <span>Rate Exchange Trust & Reliability for {post.author.name}</span>
          </h3>

          {isRatingSubmitted ? (
            <div className="p-4 bg-[#57886C]/10 border border-[#57886C]/20 text-[#57886C] text-sm rounded-xl font-bold flex items-center gap-2.5">
              <div className="bg-[#57886C] text-white p-1 rounded-full">
                <Check className="w-3 h-3" />
              </div>
            <span>Your feedback is recorded. The person who completed this exchange earned community XP.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Reliable', 'Helpful', 'On Time', 'Honest', 'Communicative'].map((attr) => {
                  const dbAttr = attr.replace(' ', '_');
                  return (
                    <button
                      key={attr}
                      onClick={() => setRatingAttribute(dbAttr)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        ratingAttribute === dbAttr 
                          ? 'bg-[#1E1E24] text-white border-[#1E1E24] shadow-md' 
                          : 'bg-white text-[#1E1E24]/70 border-slate-200 hover:border-[#1E1E24]/30'
                      }`}
                    >
                      {attr}
                    </button>
                  )
                })}
              </div>
              <input
                type="text"
                placeholder="Optional note e.g. Met on time, super helpful!"
                value={ratingNote}
                onChange={(e) => setRatingNote(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#EDCB96] focus:ring-1 focus:ring-[#EDCB96] transition-all"
              />
              <button
                onClick={handleRateTrust}
                className="w-full sm:w-auto bg-[#1E1E24] hover:bg-black text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
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
