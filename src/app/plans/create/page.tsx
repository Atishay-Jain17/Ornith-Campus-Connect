'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, MapPin, DollarSign, ArrowRight } from 'lucide-react';

export default function CreatePlanPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Graphic Era Campus');
  const [eventTime, setEventTime] = useState('');
  const [capacity, setCapacity] = useState('6');
  const [budget, setBudget] = useState('300');
  const [purpose, setPurpose] = useState('Food');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          locationName,
          eventTime: eventTime || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          capacity: parseInt(capacity),
          budget: parseFloat(budget),
          purpose,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/plans/${data.plan.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wide">
        <Users className="w-4 h-4" />
        <span>Create Group Plan</span>
      </div>
      <h1 className="text-2xl font-black text-slate-900">Plan a Campus Hangout or Activity</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Plan Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Weekend Café Hangout & Pizza Party"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <textarea
            rows={3}
            required
            placeholder="Describe the plan, purpose, meet point..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category / Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
            >
              <option value="Hangout">Hangout</option>
              <option value="Food">Food / Pizza</option>
              <option value="Gaming">Gaming</option>
              <option value="Study">Study Session</option>
              <option value="Movie">Movie Trip</option>
              <option value="Activity">Activity / Sport</option>
              <option value="Networking">Networking</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Capacity (Max People)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Est. Budget per Person (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-sm shadow flex items-center justify-center gap-2 transition"
        >
          <span>{isSubmitting ? 'Creating...' : 'Create Plan'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
