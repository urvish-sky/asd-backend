'use client';

/**
 * Unauthorized Access Page (HTTP 403 Equivalent)
 * Developed under guidance of Prof. Shyam Kamal, IIT BHU.
 */

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut, Stethoscope, Users, Home, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const dynamic = 'force-dynamic';

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, profile, signOut } = useAuth();

  const reason = searchParams.get('reason');
  const queryRole = searchParams.get('role') || role;

  const getReasonMessage = () => {
    if (reason === 'clinician_only') {
      return {
        title: 'Clinician Access Only',
        description:
          'The Clinical Triage Inbox and Case Review interface are restricted to licensed pediatricians, specialists, and clinical evaluators to protect patient data and confidentiality.',
      };
    }
    if (reason === 'admin_only') {
      return {
        title: 'System Administrator Access Only',
        description:
          'User directory management, role updates, and system-wide diagnostic telemetry are restricted to authorized administrators.',
      };
    }
    return {
      title: 'Access Restricted',
      description: 'Your account does not have sufficient role permissions to view the requested portal or resource.',
    };
  };

  const { title, description } = getReasonMessage();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldAlert className="w-9 h-9 text-rose-600" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-3">
          403 • Role Permission Required
        </span>

        <h1 className="text-xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">{description}</p>

        {/* Current Account Details */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left mb-6 text-xs text-slate-600 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Signed In As:</span>
            <span className="font-semibold text-slate-800">{profile?.full_name || 'User'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Account Role:</span>
            <span className="font-bold text-teal-700 uppercase tracking-wide">
              {queryRole || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {queryRole === 'parent' && (
            <button
              onClick={() => router.push('/parent')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Return to Parent Portal</span>
            </button>
          )}

          {queryRole === 'doctor' && (
            <button
              onClick={() => router.push('/doctor')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Return to Doctor Portal</span>
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home Page</span>
          </button>

          <button
            onClick={async () => {
              await signOut();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  );
}
