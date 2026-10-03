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
      if (res.ok) fetchPlan();
    } catch (e) {
      console.error(e);
    }
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
        <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500 font-semibold">Calculating Group Expenses & Settlement Engine...</p>
      </div>
    );
  }

  if (!planData?.plan) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8">
        <h3 className="font-bold text-slate-800">Plan Not Found</h3>
        <Link href="/plans" className="mt-4 inline-block text-xs font-bold text-amber-600">
          ← Back to Plans
        </Link>
      </div>
    );
  }

  const { plan, settlementSummary, isMember } = planData;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/plans" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-amber-600">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Plans</span>
      </Link>

      {/* Plan Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded text-xs font-black uppercase">
            {plan.purpose}
          </span>
          <div className="flex items-center gap-2">
            {!isMember ? (
              <button
                onClick={() => handleJoinLeave('JOIN')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm"
              >
                Join Plan (+ Member)
              </button>
            ) : (
              <button
                onClick={() => handleJoinLeave('LEAVE')}
                className="bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs px-3 py-1.5 rounded-lg"
              >
                Leave Plan
              </button>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">{plan.title}</h1>
          <p className="text-slate-600 text-sm mt-1">{plan.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-700">
          <div><MapPin className="w-4 h-4 text-amber-600 inline mr-1" />{plan.locationName}</div>
          <div><Calendar className="w-4 h-4 text-amber-600 inline mr-1" />{new Date(plan.eventTime).toLocaleString()}</div>
          <div><Users className="w-4 h-4 text-amber-600 inline mr-1" />{plan.groupMembers.length} / {plan.capacity} Joined</div>
        </div>

        {/* Group Members List */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 mb-2">Plan Participants:</h4>
          <div className="flex flex-wrap gap-2">
            {plan.groupMembers.map((gm: any) => (
              <div key={gm.id} className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{gm.user.name}</span>
                {gm.role === 'HOST' && <span className="bg-amber-500 text-white text-[9px] px-1 rounded">HOST</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXPENSE ACCOUNTING & SETTLEMENT ENGINE SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Add & View Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Receipt className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">Expense Log</h3>
          </div>

          {/* Add Expense Form */}
          <form onSubmit={handleAddExpense} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Record New Expense:</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.01"
                required
                placeholder="Amount (₹)"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="p-2 bg-white border border-slate-200 rounded text-xs font-semibold"
              />
              <input
                type="text"
                required
                placeholder="Description (e.g. Shared Taxi)"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="p-2 bg-white border border-slate-200 rounded text-xs font-semibold"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExpenseShared}
                  onChange={(e) => setIsExpenseShared(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span>Shared Expense (Split among members)</span>
              </label>

              <button
                type="submit"
                disabled={isSubmittingExpense}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded text-xs transition"
              >
                {isSubmittingExpense ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>

          {/* Expenses List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {plan.expenses.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No expenses recorded yet.</p>
            ) : (
              plan.expenses.map((exp: any) => (
                <div key={exp.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{exp.description}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Paid by {exp.payer.name} • {exp.isShared ? 'Shared Split' : 'Personal Item'}
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">₹{exp.amount}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Calculated Debt Settlement Transfers */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Calculated Settlement Transfers</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 bg-slate-800 p-3 rounded-xl">
            <div>Total Plan Cost: <span className="font-extrabold text-white">₹{settlementSummary?.totalPlanExpense || 0}</span></div>
            <div>Shared Cost: <span className="font-extrabold text-emerald-400">₹{settlementSummary?.totalSharedExpense || 0}</span></div>
          </div>

          {/* Minimal Debt Settlement Output */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400">Suggested Minimal Debt Transfers:</h4>
            {settlementSummary?.settlements.length === 0 ? (
              <div className="p-3 bg-slate-800 rounded-lg text-xs text-emerald-300 font-semibold text-center">
                ✅ Everyone is completely settled!
              </div>
            ) : (
              settlementSummary?.settlements.map((st: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-rose-300">{st.fromUserName}</span> owes{' '}
                    <span className="font-bold text-emerald-300">{st.toUserName}</span>
                  </div>
                  <span className="font-extrabold text-amber-300 text-sm">₹{st.amount}</span>
                </div>
              ))
            )}
          </div>

          {/* Participant Balances Table */}
          <div className="pt-2">
            <h4 className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Participant Balance Sheet:</h4>
            <div className="space-y-1 text-[11px]">
              {settlementSummary?.balances.map((b: any) => (
                <div key={b.userId} className="flex items-center justify-between bg-slate-800/60 p-2 rounded text-slate-300">
                  <span className="font-bold text-white">{b.userName}</span>
                  <span>Paid: ₹{b.totalPaid} | Share: ₹{b.totalShare}</span>
                  <span className={`font-extrabold ${b.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {b.netBalance >= 0 ? `+₹${b.netBalance}` : `-₹${Math.abs(b.netBalance)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
