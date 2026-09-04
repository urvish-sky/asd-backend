'use client';

import React from 'react';
import { CheckCircle, X, Database, Sparkles, ExternalLink } from 'lucide-react';

export interface ToastData {
  title: string;
  message: string;
  details?: string[];
  timestamp?: string;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-teal-500/40 ring-1 ring-white/10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                HITL Pipeline Active
              </p>
            </div>
            
            <h4 className="text-sm font-bold text-white leading-tight">
              {toast.title}
            </h4>
            
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {toast.message}
            </p>

            {toast.details && toast.details.length > 0 && (
              <div className="mt-2.5 p-2 bg-slate-800/80 rounded-lg border border-slate-700/60 text-[11px] text-teal-200 space-y-1">
                {toast.details.map((detail, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-teal-400 flex-shrink-0" />
                    <span className="truncate">{detail}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>IIT BHU Electrical Engineering</span>
              {toast.timestamp && <span>{toast.timestamp}</span>}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
