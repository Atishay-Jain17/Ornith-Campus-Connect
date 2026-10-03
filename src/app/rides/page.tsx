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
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/30">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>ROUTE OVERLAP MATCHING ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Campus Rides & Carpools</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
            Going somewhere? Take a fellow campus member. Matches routes based on path overlap rather than simple radius!
          </p>
        </div>

        <Link
          href="/posts/create"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Route / Ride</span>
        </Link>
      </div>

      {/* Ride Cards */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs font-semibold text-slate-500">Scanning route overlaps...</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800">No active rides posted</h3>
          <p className="text-xs text-slate-500 mt-1">Be the first to offer a carpool ride!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rides.map((ride) => (
            <div key={ride.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-emerald-300 transition">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase">
                  {ride.contributionMode || 'FIXED'} CONTRIBUTION
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  ₹{ride.price || 30} / seat
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{ride.title}</h3>
                <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 space-y-1">
                  <div>🟢 Departure: <span className="font-bold text-slate-900">{ride.routeOrigin || 'GEU Campus'}</span></div>
                  <div>🔴 Destination: <span className="font-bold text-slate-900">{ride.routeDestination || 'Saharanpur Chowk'}</span></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {ride.author.name.charAt(0)}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {ride.author.name} ({ride.author.trustScore}★)
                  </div>
                </div>

                <Link
                  href={`/posts/${ride.id}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <span>Request Seat</span>
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
