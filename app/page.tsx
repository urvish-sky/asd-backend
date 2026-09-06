'use client';

/**
 * Pediatric ASD Screening Platform (CDSS) - Unified Landing Page
 * Developed by Urvish Soni and Zankhana Mehta under the guidance of
 * Professor Shyam Kamal, Department of Electrical Engineering, IIT BHU.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Stethoscope,
  Users,
  Sparkles,
  ArrowRight,
  Activity,
  Video,
  FileCheck2,
  Lock,
  HeartHandshake,
  Leaf,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { role, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 animate-fade-in">
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-slate-200">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-teal-100),white)] opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800 shadow-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>IIT Varanasi (BHU) • Department of Electrical Engineering</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Early Pediatric ASD Screening{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-700 to-blue-700">
              Decision Support System
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A secure, AI-powered Class II Clinical Decision Support System combining computer vision
            behavioral telemetry, the Indian Scale for Assessment of Autism (ISAA), and holistic
            Ayurvedic care for toddlers aged 12–36 months.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {role ? (
              <button
                onClick={() => {
                  if (role === 'doctor') router.push('/doctor');
                  else if (role === 'admin') router.push('/admin');
                  else router.push('/parent');
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-700/20 transition-all duration-200 cursor-pointer"
              >
                <span>Go to My Dashboard ({profile?.full_name || role})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-lg shadow-teal-700/20 transition-all duration-200"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-all duration-200"
                >
                  <span>Create Free Account</span>
                </Link>
              </>
            )}

            <Link
              href="/protocols"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
            >
              <span>View Video Protocols</span>
            </Link>
          </div>

          {/* Highlights Row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Video className="w-4 h-4" />
                <span>3 Protocols</span>
              </div>
              <p className="text-xs text-slate-600">Standardized home activities recorded by caregivers</p>
            </div>

            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Activity className="w-4 h-4" />
                <span>CV Biomarkers</span>
              </div>
              <p className="text-xs text-slate-600">Gaze tracking, motor velocity, and name-call latency</p>
            </div>

            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
                <FileCheck2 className="w-4 h-4" />
                <span>ISAA Standard</span>
              </div>
              <p className="text-xs text-slate-600">40-item Indian diagnostic framework with AI assistance</p>
            </div>

            <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Leaf className="w-4 h-4" />
                <span>Ayurvedic Care</span>
              </div>
              <p className="text-xs text-slate-600">PARWAA diet & nutrition guidance by IMS BHU</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Role-Based Portals Section ──────────────────────────── */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Dedicated Portals by User Role
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Choose your role to access role-specific workflows, data protection safeguards, and specialized toolsets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Parent Portal */}
          <div className="clinical-card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-teal-200/70">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 shadow-2xs">
                <Users className="w-6 h-6 text-teal-700" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                For Parents & Guardians
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-3 mb-2">
                Parent Intake & Video Portal
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Register your toddler, securely record guided 3-minute interaction videos, track submission
                milestones, and receive your child&apos;s personalized Ayurvedic diet plan.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Interactive Protocol Audio/Visual Guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Direct Cloud Storage Streaming (Supabase)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>PARWAA Clinical Nutrition Plan</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/parent')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <span>Enter Parent Portal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Doctor Portal */}
          <div className="clinical-card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-blue-200/70">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 shadow-2xs">
                <Stethoscope className="w-6 h-6 text-blue-700" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                For Pediatricians & Clinicians
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-3 mb-2">
                Clinical Triage & Decision Support
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Comprehensive clinician inbox prioritizing cases by risk tier, providing real-time AI
                video landmark telemetry, and enabling interactive ISAA score modification with continuous learning.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Biomarker Telemetry & Gaze Heatmaps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ISAA Score Modification & Justification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>HITL Continuous Model Retraining</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/doctor')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <span>Enter Doctor Portal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Admin Portal */}
          <div className="clinical-card p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-indigo-200/70">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 shadow-2xs">
                <Sparkles className="w-6 h-6 text-indigo-700" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                For System Administrators
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-3 mb-2">
                Administration & Governance
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Manage registered user accounts, assign clinician or parent roles, inspect Supabase
                storage bucket and database readiness, and oversee platform performance.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>User Directory & Role Reassignment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Database & Storage Diagnostics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Global Screening Analytics</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/admin')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <span>Enter Admin Center</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── Institutional Credibility Banner ─────────────────────── */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4" />
            <span>Academic & Clinical Collaboration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold max-w-3xl mx-auto">
            Indian Institute of Technology (BHU) & Institute of Medical Sciences (BHU)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-2 leading-relaxed">
            Developed by Urvish Soni and Zankhana Mehta under the guidance of Professor Shyam Kamal,
            Department of Electrical Engineering, IIT BHU, in clinical consultation with Dr. Vaibhav Jaisawal, IMS BHU.
          </p>
        </div>
      </section>
    </div>
  );
}
