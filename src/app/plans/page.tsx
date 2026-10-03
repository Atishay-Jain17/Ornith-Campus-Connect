'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Calendar, MapPin, DollarSign, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PlansListPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-400/30">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>GROUP HANGOUTS & EXPENSE SETTLEMENT ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Campus Plans & Shared Expenses</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
            Café hangouts, food runs, gaming, study sessions, and movie trips with automatic debt settlement calculation.
          </p>
        </div>

        <Link
          href="/plans/create"
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Plan</span>
        </Link>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold text-slate-500">Loading campus plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">No active plans found</h3>
          <p className="text-xs text-slate-500 mt-1">Create a hangout or pizza plan for fellow campus members!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-amber-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded text-[11px] uppercase">
                    {plan.purpose}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {plan._count?.groupMembers || 1} / {plan.capacity} Participants
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">{plan.title}</h3>
                <p className="text-slate-600 text-xs mt-1 line-clamp-2">{plan.description}</p>

                <div className="mt-3 space-y-1 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{plan.locationName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{new Date(plan.eventTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {plan.creator.name.charAt(0)}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Host: {plan.creator.name}
                  </div>
                </div>

                <Link
                  href={`/plans/${plan.id}`}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <span>View Plan & Expenses</span>
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
