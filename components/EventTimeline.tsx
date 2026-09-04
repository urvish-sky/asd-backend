'use client';

import React from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { BehavioralEvent } from '@/lib/types';

interface EventTimelineProps {
  events: BehavioralEvent[];
  activeVideoSlot: 1 | 2 | 3;
  onEventClick: (timestampSeconds: number) => void;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function EventTimeline({
  events,
  activeVideoSlot,
  onEventClick,
}: EventTimelineProps) {
  const filteredEvents = events
    .filter((e) => e.videoSlot === activeVideoSlot)
    .sort((a, b) => a.timestampSeconds - b.timestampSeconds);

  const severityConfig = {
    normal: {
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      color: 'text-green-600',
      bg: 'bg-green-50 hover:bg-green-100',
      border: 'border-green-200',
      dot: 'bg-green-500',
    },
    borderline: {
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50 hover:bg-amber-100',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    atypical: {
      icon: <XCircle className="w-3.5 h-3.5" />,
      color: 'text-red-600',
      bg: 'bg-red-50 hover:bg-red-100',
      border: 'border-red-200',
      dot: 'bg-red-500',
    },
  };

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No events detected for this video clip</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
        <Clock className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Behavioral Events ({filteredEvents.length})
        </span>
      </div>

      {filteredEvents.map((event) => {
        const config = severityConfig[event.severity];
        return (
          <button
            key={event.id}
            onClick={() => onEventClick(event.timestampSeconds)}
            className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border ${config.border} ${config.bg} transition-all duration-150 cursor-pointer group`}
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-0.5">
              <div className={`w-2.5 h-2.5 rounded-full ${config.dot} ring-2 ring-white`} />
              <div className="w-px h-full bg-slate-200 mt-1" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-xs font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded">
                  {formatTimestamp(event.timestampSeconds)}
                </span>
                <div className={`flex items-center gap-1 ${config.color}`}>
                  {config.icon}
                </div>
              </div>
              <p className="text-sm text-slate-700 font-medium leading-snug group-hover:text-slate-900">
                {event.label}
              </p>
              {event.durationSeconds > 0 && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Duration: {event.durationSeconds.toFixed(1)}s
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
