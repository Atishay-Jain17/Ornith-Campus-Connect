'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, UserX, Flag } from 'lucide-react';

export default function ModerationPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-rose-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 border border-rose-400/30">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>COMMUNITY SAFETY & MODERATION CENTER</span>
          </div>
          <h1 className="text-2xl font-black text-white">Safety Baseline & Reports</h1>
          <p className="text-slate-300 text-xs mt-1">
            Privacy enforcement, evidence-based AI risk indicators, and community reports queue.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Flag className="w-4 h-4 text-rose-600" />
          <span>Active Reports Queue ({reports.length}):</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500 font-semibold">Loading safety reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold text-center">
            ✅ No unresolved community safety flags.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep: any) => (
              <div key={rep.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">Report Reason: {rep.reason}</div>
                  <div className="text-slate-500 mt-0.5">
                    Reporter: {rep.reporter?.name} • Target Post: {rep.targetPost?.title || 'User Profile'}
                  </div>
                </div>

                <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded">
                  {rep.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
