'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BiomarkerCardProps {
  title: string;
  measured: number | string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'borderline' | 'atypical';
  percentage?: number; // 0-100 for the progress bar
  detail?: string;
}

export default function BiomarkerCard({
  title,
  measured,
  unit,
  normalRange,
  status,
  percentage = 50,
  detail,
}: BiomarkerCardProps) {
  const statusConfig = {
    normal: {
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      barColor: 'bg-green-500',
      label: 'Within Normal Range',
    },
    borderline: {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      barColor: 'bg-amber-500',
      label: 'Borderline',
    },
    atypical: {
      icon: <XCircle className="w-4 h-4" />,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      barColor: 'bg-red-500',
      label: 'Outside Normal Range',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-800 leading-tight">{title}</h4>
        <div className={`flex items-center gap-1 ${config.color}`}>
          {config.icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className={`text-2xl font-bold ${config.color}`}>{measured}</span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Normal: <span className="font-medium text-slate-600">{normalRange}</span>
      </p>

      {/* Progress indicator */}
      <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${config.barColor} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-semibold ${config.color}`}>{config.label}</span>
        {detail && (
          <span className="text-[11px] text-slate-500">{detail}</span>
        )}
      </div>
    </div>
  );
}
