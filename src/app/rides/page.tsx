'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Car, MapPin, Clock, ArrowRight, ShieldCheck, PlusCircle, Navigation } from 'lucide-react';
import { formatDistance } from '@/lib/geo';

export default function RidesPage() {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await fetch('/api/posts?type=RIDE');
      const data = await res.json();
      setRides(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1E1E24] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#57886C]/20 text-[#57886C] text-xs font-semibold mb-2 border border-[#57886C]/30">
            <Navigation className="w-3.5 h-3.5 text-[#57886C]" />
            <span>ROUTE OVERLAP MATCHING ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Community Rides</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Going somewhere? Find a community ride.
          </p>
        </div>

        <Link
          href="/posts/create"
          className="bg-[#ED6A5A] hover:opacity-90 transition-opacity text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Ride</span>
        </Link>
      </div>

      {/* Ride Cards */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-[#57886C] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm font-semibold text-slate-500">Scanning route overlaps...</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-[#1E1E24] text-lg">No active rides posted</h3>
          <p className="text-sm text-slate-500 mt-1">Be the first to offer a community ride!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rides.map((ride) => (
            <div key={ride.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 hover:border-[#57886C]/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="bg-[#D8D8F6] text-[#1E1E24] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  {ride.contributionMode || 'FIXED'} CONTRIBUTION
                </span>
                <span className="text-sm font-bold text-[#57886C] bg-[#57886C]/10 px-3 py-1 rounded-full">
                  ₹{ride.price || 30} / seat
                </span>
              </div>

              {/* Route Hero Element */}
              <div className="bg-[#F7F7F5] rounded-xl p-4 border border-slate-100 flex items-center justify-between gap-3 relative">
                {/* Visual Line */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-8 border-t-2 border-dashed border-slate-300 hidden sm:block"></div>
                
                <div className="flex flex-col gap-1 z-10 bg-[#F7F7F5] pr-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1E1E24]"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Origin</span>
                  </div>
                  <div className="font-bold text-[#1E1E24] text-base truncate ml-4">
                    {ride.routeOrigin || 'GEU Campus'}
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />

                <div className="flex flex-col gap-1 z-10 bg-[#F7F7F5] pl-2 flex-1 items-end sm:items-start text-right sm:text-left">
                  <div className="flex items-center gap-2 justify-end sm:justify-start w-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#57886C]"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Destination</span>
                  </div>
                  <div className="font-bold text-[#1E1E24] text-base truncate mr-4 sm:mr-0 sm:ml-4">
                    {ride.routeDestination || 'Saharanpur Chowk'}
                  </div>
                </div>
              </div>

              {/* Departure Time */}
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Departure: {ride.departureTime ? new Date(ride.departureTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Flexible'}</span>
              </div>

              {/* Driver & Action */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EDCB96] text-[#1E1E24] font-bold text-sm flex items-center justify-center shadow-sm">
                    {ride.author.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1E1E24]">
                      {ride.author.name}
                    </span>
                    <span className="text-xs font-semibold text-[#57886C] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Trust Score {ride.author.trustScore}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/posts/${ride.id}`}
                  className="bg-[#57886C] hover:bg-[#57886C]/90 transition-colors text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <span>Request Seat</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
