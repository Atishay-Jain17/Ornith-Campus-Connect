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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-[#57886C] p-6 sm:p-8 rounded-[22px] shadow-lg shadow-[#57886C]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#EDCB96]">Meet around something</div>
          <h1 className="font-serif text-4xl sm:text-5xl leading-none tracking-[-.04em] text-white">Make a plan.</h1>
          <p className="text-white/75 text-sm mt-3 max-w-xl">
            Café hangouts, food runs, gaming, study sessions, and movie trips with your community.
          </p>
        </div>

        <Link
          href="/plans/create"
          className="bg-[#EDCB96] hover:bg-[#F5E4BF] text-[#1E1E24] font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 self-start md:self-auto transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Plan</span>
        </Link>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 animate-pulse flex flex-col justify-between">
              <div>
                <div className="flex justify-between mb-4">
                  <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                  <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
                </div>
                <div className="h-7 w-3/4 bg-slate-100 rounded mb-3"></div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-100 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                  <div className="h-4 w-2/3 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-4">
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                  <div className="h-4 w-20 bg-slate-100 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-[#fbfaf6] border border-[#1E1E24]/10 p-8">
          <div className="w-16 h-16 bg-[#EDCB96]/30 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#EDCB96]" />
          </div>
          <h3 className="text-xl font-bold text-[#1E1E24]">No plans yet.</h3>
          <p className="text-[#1E1E24]/60 text-sm mt-2 mb-6">Start a hangout and get people together!</p>
          <Link
            href="/plans/create"
            className="inline-flex items-center gap-2 bg-[#ED6A5A] hover:bg-[#d95647] text-white font-bold px-6 py-3 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create a Plan</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((plan, index) => {
            const participantsCount = plan._count?.groupMembers || 1;
            const capacityRatio = Math.min(100, (participantsCount / plan.capacity) * 100);
            const cardTints = ['#F0EFFA', '#FFF3DD', '#EAF1EC'];
            
            return (
              <div key={plan.id} className="rounded-2xl border border-[#1E1E24]/8 p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col justify-between" style={{ backgroundColor: cardTints[index % cardTints.length], borderTop: `5px solid ${index % 3 === 0 ? '#D8D8F6' : index % 3 === 1 ? '#EDCB96' : '#57886C'}` }}>
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="bg-[#EDCB96]/35 text-[#1E1E24] font-bold px-2.5 py-1 text-[10px] uppercase tracking-[.14em]">
                      {plan.purpose}
                    </span>
                    <span className="text-xs font-semibold text-[#1E1E24]/60 px-2.5 py-1 border border-[#1E1E24]/10">
                      {participantsCount} / {plan.capacity} joined
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl text-[#1E1E24] leading-tight mb-3">{plan.title}</h3>
                  
                  {/* Capacity Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-[#1E1E24]/10 h-1 mb-1 overflow-hidden">
                      <div 
                        className="bg-[#57886C] h-full transition-all duration-500" 
                        style={{ width: `${capacityRatio}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-[#1E1E24]/70 text-sm mb-4 line-clamp-2">{plan.description}</p>

                  <div className="space-y-2.5 text-sm text-[#1E1E24]/80 font-medium">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#EDCB96]" />
                      <span className="truncate">{plan.locationName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#EDCB96]" />
                      <span>{new Date(plan.eventTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-5">
                  <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#1E1E24] text-white font-serif text-base flex items-center justify-center">
                      {plan.creator.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm font-bold text-[#1E1E24]">
                      {plan.creator.name}
                    </div>
                  </div>

                  <Link
                    href={`/plans/${plan.id}`}
                    className="bg-[#1E1E24] hover:bg-[#ED6A5A] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <span>Join Plan</span>
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
