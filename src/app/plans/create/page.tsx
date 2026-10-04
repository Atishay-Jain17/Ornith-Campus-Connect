'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, MapPin, ArrowRight, Coffee, Gamepad2, BookOpen, Film, Activity, Network } from 'lucide-react';

const PLAN_PURPOSES = [
  { value: 'Hangout', label: 'Hangout', icon: '😄' },
  { value: 'Food', label: 'Food / Pizza', icon: '🍕' },
  { value: 'Gaming', label: 'Gaming', icon: '🎮' },
  { value: 'Study', label: 'Study Session', icon: '📚' },
  { value: 'Movie', label: 'Movie Trip', icon: '🎬' },
  { value: 'Activity', label: 'Activity / Sport', icon: '⚽' },
  { value: 'Networking', label: 'Networking', icon: '🤝' },
];

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

  const selectedPurpose = PLAN_PURPOSES.find(p => p.value === purpose);

  return (
    <div className="max-w-3xl mx-auto bg-[#fbfaf6] border-y border-[#1E1E24]/10 p-5 sm:p-9">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#57886C] mb-4">
          <span className="h-2 w-2 bg-[#ED6A5A]" />
          <span>A reason to get together</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl leading-none tracking-[-.045em] text-[#1E1E24]">Bring people together.</h1>
        <p className="text-sm mt-3 leading-6 max-w-xl" style={{ color: '#6A6A72' }}>
          Café run, pizza night, gaming session, study group — whatever brings your community together.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Purpose Selection */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[.14em] mb-2" style={{ color: 'rgba(30,30,36,.65)' }}>
            What kind of plan?
          </label>
          <div className="flex flex-wrap gap-2">
            {PLAN_PURPOSES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPurpose(p.value)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-all border"
                style={{
                  background: purpose === p.value ? '#1E1E24' : 'rgba(237,203,150,0.15)',
                  color: purpose === p.value ? '#FFFFFF' : '#7A5420',
                  border: purpose === p.value ? '1.5px solid #1E1E24' : '1.5px solid rgba(237,203,150,0.4)',
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[.14em] mb-2" style={{ color: '#1E1E24' }}>
            Plan Name
          </label>
          <input
            type="text"
            required
            placeholder={`e.g. ${selectedPurpose?.icon} ${selectedPurpose?.label} at ${locationName}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[#1E1E24]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#57886C]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[.14em] mb-2" style={{ color: '#1E1E24' }}>
            Details
          </label>
          <textarea
            rows={3}
            required
            placeholder="Describe the vibe, meet point, what to bring..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-[#1E1E24]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#57886C] resize-y"
          />
        </div>

        {/* Grid Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E1E24' }}>
              <MapPin className="w-3 h-3 inline mr-1" style={{ color: '#EDCB96' }} />
              Location
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full border border-[#1E1E24]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#57886C]"
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">Choose a public meeting point, like the campus gate or a café. Never post a room or home address.</p>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E1E24' }}>
              <Calendar className="w-3 h-3 inline mr-1" style={{ color: '#EDCB96' }} />
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full border border-[#1E1E24]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#57886C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E1E24' }}>
              👥 Max People
            </label>
            <input
              type="number"
              min="2"
              max="50"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border border-[#1E1E24]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#57886C]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#1E1E24' }}>
              💰 Budget/Person (₹)
            </label>
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full border border-[#1E1E24]/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#57886C]"
            />
          </div>
        </div>

        {/* Preview Card */}
        {title && (
          <div
            className="p-4"
            style={{
              background: 'rgba(237,203,150,0.1)',
              border: '1.5px solid rgba(237,203,150,0.3)',
            }}
          >
            <div className="text-xs font-bold mb-2" style={{ color: '#7A5420' }}>Preview</div>
            <div className="font-bold" style={{ color: '#1E1E24' }}>
              {selectedPurpose?.icon} {title}
            </div>
            <div className="text-xs mt-1" style={{ color: '#6A6A72' }}>
              {locationName} · {capacity} people · ₹{budget}/person
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 text-base font-bold transition-all"
          style={{
            background: isSubmitting ? '#B8B7B0' : '#ED6A5A',
            color: '#FFFFFF',
          }}
        >
          <span>{isSubmitting ? 'Creating Plan...' : 'Create Plan'}</span>
          {!isSubmitting && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
