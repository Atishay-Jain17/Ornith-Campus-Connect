'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Flag, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ModerationPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load the moderation queue.');
      setReports(data.reports || []);
    } catch (e) {
      setAccessError(e instanceof Error ? e.message : 'Could not load the moderation queue.');
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId: string, status: 'REVIEWED' | 'ACTIONED') => {
    setUpdatingId(reportId);
    try {
      const res = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, actionTaken: status === 'ACTIONED' ? 'Reviewed by community moderator' : 'Reviewed; no action required' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update this report.');
      setReports((current) => current.filter((report) => report.id !== reportId));
    } catch (e) {
      setAccessError(e instanceof Error ? e.message : 'Could not update this report.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div
        className="p-6 rounded-2xl"
        style={{ background: '#1E1E24', color: '#FFFFFF' }}
      >
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{
            background: 'rgba(237,106,90,0.15)',
            color: '#F5948A',
            border: '1px solid rgba(237,106,90,0.2)',
          }}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>COMMUNITY SAFETY</span>
        </div>
        <h1 className="text-2xl font-black" style={{ letterSpacing: '-0.03em' }}>
          Safety & Moderation
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Privacy enforcement, AI risk indicators, and community reports.
        </p>
      </div>

      {/* Reports */}
      {accessError && (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {accessError === 'Moderator access required' ? 'This queue is available to campus moderators. You can still report unsafe posts from their detail pages.' : accessError}
        </div>
      )}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #EEEDE8' }}
      >
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid #EEEDE8' }}
        >
          <Flag className="w-4 h-4" style={{ color: '#ED6A5A' }} />
          <h3 className="font-bold text-sm" style={{ color: '#1E1E24' }}>
            Active Reports ({reports.length})
          </h3>
        </div>

        {accessError === 'Moderator access required' ? (
          <div className="p-8 text-center text-sm text-slate-500">Moderator access is required to view reports.</div>
        ) : loading ? (
          <div className="p-8 text-center">
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent mx-auto animate-spin mb-2"
              style={{ borderColor: '#1E1E24', borderTopColor: 'transparent' }}
            />
            <p className="text-xs" style={{ color: '#A8A8A0' }}>Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#57886C' }} />
            <p className="font-bold text-sm" style={{ color: '#1E1E24' }}>Community looks good!</p>
            <p className="text-xs mt-1" style={{ color: '#A8A8A0' }}>
              No unresolved safety flags in the queue.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#EEEDE8' }}>
            {reports.map((rep: any) => (
              <div key={rep.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(237,106,90,0.1)' }}
                  >
                    <AlertTriangle className="w-4 h-4" style={{ color: '#ED6A5A' }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: '#1E1E24' }}>
                      {rep.reason}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#A8A8A0' }}>
                      Reported by {rep.reporter?.name}
                      {rep.targetPost?.title && ` · Post: "${rep.targetPost.title}"`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0"
                  style={{
                    background: rep.status === 'RESOLVED' ? 'rgba(87,136,108,0.1)' : 'rgba(237,203,150,0.2)',
                    color: rep.status === 'RESOLVED' ? '#2D5E42' : '#7A5420',
                  }}
                >
                  {rep.status}
                </span>
                <button disabled={updatingId === rep.id} onClick={() => updateReport(rep.id, 'REVIEWED')} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 disabled:opacity-50">Dismiss</button>
                <button disabled={updatingId === rep.id} onClick={() => updateReport(rep.id, 'ACTIONED')} className="rounded-lg bg-[#ED6A5A] px-2.5 py-1 text-xs font-bold text-white disabled:opacity-50">Action</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
