'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  Users,
  Calendar,
  MapPin,
  DollarSign,
  PlusCircle,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Receipt,
  ArrowRightLeft,
  UserCheck
} from 'lucide-react';

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [isExpenseShared, setIsExpenseShared] = useState(true);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const res = await fetch(`/api/plans/${id}`);
      const data = await res.json();
      setPlanData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async (action: 'JOIN' | 'LEAVE') => {
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update membership.');
      fetchPlan();
    } catch (e) {
      console.error(e);
    }
  };

  const reviewJoinRequest = async (memberId: string, action: 'APPROVE' | 'REJECT') => {
    const res = await fetch(`/api/plans/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, memberId }),
    });
    if (res.ok) fetchPlan();
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDesc) return;
    setIsSubmittingExpense(true);
    try {
      const res = await fetch(`/api/plans/${id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(expenseAmount),
          description: expenseDesc,
          isShared: isExpenseShared,
        }),
      });
      if (res.ok) {
        setExpenseAmount('');
        setExpenseDesc('');
        fetchPlan();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-[#EDCB96] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-[#1E1E24] font-semibold">Calculating Group Expenses & Settlement Engine...</p>
      </div>
    );
  }

  if (!planData?.plan) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <h3 className="font-bold text-[#1E1E24]">Plan Not Found</h3>
        <Link href="/plans" className="mt-4 inline-block text-sm font-bold text-[#EDCB96]">
          ← Back to Plans
        </Link>
      </div>
    );
  }

  const { plan, settlementSummary, isMember, isPending, isHost } = planData;
  const joinedMembers = plan.groupMembers.filter((member: any) => member.status === 'JOINED');
  const pendingMembers = plan.groupMembers.filter((member: any) => member.status === 'PENDING');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-6">
      <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E1E24]/60 hover:text-[#1E1E24] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Plans</span>
      </Link>

      {/* Plan Header Card */}
      <div className="bg-white rounded-2xl border border-[#EDCB96]/30 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <span className="bg-[#EDCB96] text-[#1E1E24] px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase">
            {plan.purpose}
          </span>
          <div className="flex items-center gap-2">
            {isHost ? (
              <span className="text-xs font-bold text-[#57886C]">You’re hosting</span>
            ) : isPending ? (
              <button onClick={() => handleJoinLeave('LEAVE')} className="bg-[#EDCB96]/30 text-[#1E1E24] font-bold text-sm px-4 py-2 rounded-xl">Request sent · Cancel</button>
            ) : !isMember ? (
              <button
                onClick={() => handleJoinLeave('JOIN')}
                className="bg-[#ED6A5A] hover:bg-[#ED6A5A]/90 text-white font-bold text-sm px-5 py-2 rounded-xl shadow-sm transition-colors"
              >
                Request to join
              </button>
            ) : (
              <button
                onClick={() => handleJoinLeave('LEAVE')}
                className="bg-slate-100 text-[#1E1E24] hover:bg-slate-200 font-bold text-sm px-4 py-2 rounded-xl transition-colors"
              >
                Leave Plan
              </button>
            )}
            {isMember && plan.chats?.[0] && <Link href={`/chat/${plan.chats[0].id}`} className="inline-flex items-center gap-2 rounded-xl bg-[#1E1E24] px-4 py-2 text-sm font-bold text-white">Open group chat</Link>}
          </div>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1E1E24] leading-tight">{plan.title}</h1>
          <p className="text-[#1E1E24]/70 text-base mt-2">{plan.description}</p>
        </div>

          <div className="flex flex-wrap gap-4 p-4 bg-[#FAFAFA] rounded-xl text-sm font-semibold text-[#1E1E24]/80">
          <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#EDCB96]" />{plan.locationName}</div>
          <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#EDCB96]" />{new Date(plan.eventTime).toLocaleString()}</div>
          <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#EDCB96]" />{joinedMembers.length} / {plan.capacity} joined</div>
        </div>

        {/* Group Members List (Horizontal Scroll) */}
        <div>
          <h4 className="text-sm font-bold text-[#1E1E24] mb-3">Participants</h4>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {joinedMembers.map((gm: any) => (
              <div key={gm.id} className="flex flex-col items-center min-w-[64px]">
                <div className="w-12 h-12 bg-[#EDCB96]/20 text-[#1E1E24] rounded-full flex items-center justify-center text-lg font-bold relative border-2 border-[#EDCB96]">
                  {gm.user.name.charAt(0).toUpperCase()}
                  {gm.role === 'HOST' && (
                    <span className="absolute -bottom-1 bg-[#1E1E24] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10 border border-white">
                      HOST
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-[#1E1E24]/80 mt-1 truncate w-full text-center">{gm.user.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {isHost && pendingMembers.length > 0 && <div className="border-t border-slate-100 pt-4">
          <h4 className="text-sm font-bold text-[#1E1E24] mb-3">Join requests <span className="ml-1 rounded-full bg-[#EDCB96]/40 px-2 py-0.5 text-xs">{pendingMembers.length}</span></h4>
          <div className="space-y-2">{pendingMembers.map((member: any) => <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FAFAFA] p-3">
            <span className="text-sm font-semibold text-[#1E1E24]">{member.user.name}</span>
            <div className="flex gap-2"><button onClick={() => reviewJoinRequest(member.id, 'REJECT')} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500">Decline</button><button onClick={() => reviewJoinRequest(member.id, 'APPROVE')} className="rounded-lg bg-[#57886C] px-3 py-2 text-xs font-bold text-white">Approve</button></div>
          </div>)}</div>
        </div>}
      </div>

      {/* EXPENSE ACCOUNTING & SETTLEMENT ENGINE SECTION */}
      {isMember ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Add & View Expenses */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Receipt className="w-5 h-5 text-[#EDCB96]" />
            <h3 className="font-bold text-[#1E1E24] text-lg">Expense Log</h3>
          </div>

          {/* Add Expense Form */}
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full text-center text-3xl font-black p-4 bg-[#FAFAFA] border-2 border-slate-100 rounded-xl text-[#1E1E24] focus:border-[#EDCB96] focus:ring-0 outline-none transition-colors placeholder:text-slate-300"
              />
            </div>
            <div>
              <input
                type="text"
                required
                placeholder="What was this for? (e.g. Taxi, Dinner)"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="w-full p-3 bg-[#FAFAFA] border-2 border-slate-100 rounded-xl text-sm font-medium text-[#1E1E24] focus:border-[#EDCB96] outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExpenseShared}
                  onChange={(e) => setIsExpenseShared(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-slate-200 text-[#EDCB96] focus:ring-[#EDCB96]"
                />
                <span className="text-sm font-bold text-[#1E1E24]/80">Split expense</span>
              </label>

              <button
                type="submit"
                disabled={isSubmittingExpense}
                className="w-full sm:w-auto bg-[#1E1E24] hover:bg-[#1E1E24]/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
              >
                {isSubmittingExpense ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>

          {/* Expenses List */}
          <div className="space-y-3 mt-6 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {plan.expenses.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium py-6 text-center bg-slate-50 rounded-xl">No expenses recorded yet.</p>
            ) : (
              plan.expenses.map((exp: any) => (
                <div key={exp.id} className="p-4 bg-[#FAFAFA] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#1E1E24] text-sm">{exp.description}</div>
                    <div className="text-xs text-[#1E1E24]/50 font-medium mt-1">
                      {exp.payer.name} • {exp.isShared ? 'Shared' : 'Personal'}
                    </div>
                  </div>
                  <div className="text-base font-black text-[#1E1E24]">₹{exp.amount}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Calculated Debt Settlement Transfers */}
        <div className="bg-[#1E1E24] text-white rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <ArrowRightLeft className="w-5 h-5 text-[#57886C]" />
            <h3 className="font-bold text-white text-lg">Settlement Engine</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="text-xs font-semibold text-white/50 mb-1">Total Expenses</div>
              <div className="text-xl font-black text-white">₹{settlementSummary?.totalPlanExpense || 0}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="text-xs font-semibold text-white/50 mb-1">Shared Total</div>
              <div className="text-xl font-black text-[#57886C]">₹{settlementSummary?.totalSharedExpense || 0}</div>
            </div>
          </div>

          {/* Debt Settlement Output */}
          <div className="space-y-3">
            <h4 className="text-xs font-black tracking-wider text-white/40 uppercase">Who owes whom</h4>
            {settlementSummary?.settlements.length === 0 ? (
              <div className="p-4 bg-[#57886C]/20 border border-[#57886C]/30 rounded-xl text-sm text-[#57886C] font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                All settled up!
              </div>
            ) : (
              settlementSummary?.settlements.map((st: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-sm">
                  <div className="font-medium text-white/80">
                    <span className="font-bold text-white">{st.fromUserName}</span> owes <span className="font-bold text-white">{st.toUserName}</span>
                  </div>
                  <span className="font-black text-[#ED6A5A] text-lg">₹{st.amount}</span>
                </div>
              ))
            )}
          </div>

          {/* Participant Balances Table */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-black tracking-wider text-white/40 uppercase mb-3">Balance Sheet</h4>
            <div className="space-y-2">
              {settlementSummary?.balances.map((b: any) => (
                <div key={b.userId} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <div className="font-bold text-sm text-white">{b.userName}</div>
                    <div className="text-[10px] font-semibold text-white/40 mt-0.5">
                      Paid: ₹{b.totalPaid} • Share: ₹{b.totalShare}
                    </div>
                  </div>
                  <div className={`font-black text-base ${b.netBalance >= 0 ? 'text-[#57886C]' : 'text-[#ED6A5A]'}`}>
                    {b.netBalance >= 0 ? `+₹${b.netBalance}` : `-₹${Math.abs(b.netBalance)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> : <div className="rounded-2xl border border-[#EDCB96]/40 bg-[#EDCB96]/10 p-5 text-sm text-[#1E1E24]/70">Join this plan with host approval to view shared expenses and settlements.</div>}
    </div>
  );
}
