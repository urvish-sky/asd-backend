'use client';

import React, { useState } from 'react';
import {
  Download,
  Leaf,
  Sparkles,
  CheckCircle2,
  XCircle,
  Moon,
  Sun,
  Tv,
  Ban,
  Smartphone,
  Heart,
  Clock,
  Printer,
  Shield,
  Award,
  Users,
  Smile,
  Activity,
  ChevronRight,
  Info,
} from 'lucide-react';
import { PARWAA_DATA } from '@/lib/parwaaData';

interface ParwaaRecommendationCardProps {
  childName?: string;
  childAge?: number;
  variant?: 'reward' | 'dashboard';
  className?: string;
}

export default function ParwaaRecommendationCard({
  childName,
  childAge,
  variant = 'reward',
  className = '',
}: ParwaaRecommendationCardProps) {
  const isReward = variant === 'reward';
  const [activeTab, setActiveTab] = useState<'all' | 'aahar' | 'nidra' | 'brahmacharya'>('all');
  const [showHindi, setShowHindi] = useState(true);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const { pillars, guidingPrinciples, clinicalAttribution } = PARWAA_DATA;

  return (
    <div
      id="parwaa-clinical-guide"
      className={`parwaa-container relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-amber-50/40 p-5 sm:p-7 shadow-sm transition-all duration-200 ${className}`}
    >
      {/* Decorative ambient gradients */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-emerald-100/50 blur-3xl print:hidden" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-44 w-44 rounded-full bg-teal-100/40 blur-2xl print:hidden" />

      <div className="relative z-10 space-y-6">
        {/* ─── Top Clinical Header & Attribution ──────────────────── */}
        <div className="border-b border-emerald-200/80 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs">
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              <span>Holistic Developmental Support • PARWAA Framework</span>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setShowHindi(!showHindi)}
                className="text-[11px] font-semibold text-emerald-800 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
              >
                {showHindi ? 'English Only' : 'English + हिंदी'}
              </button>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-lg border border-emerald-200">
                {childAge ? `Age: ${childAge} Months` : 'Pediatric Care Plan'}
              </span>
            </div>
          </div>

          {/* Prominent Mandatory Headers */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                Get personalized ayurvedic diet plan
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white">
                PARWAA
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-emerald-800/95 mt-0.5">
              अपने बच्चे के लिए व्यक्तिगत आयुर्वेदिक आहार योजना प्राप्त करें
            </p>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-1.5 font-medium flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-emerald-900">Clinical Formulation:</span>
              <span>{clinicalAttribution.doctorName}, {clinicalAttribution.department}, {clinicalAttribution.institution}</span>
            </p>
          </div>

          {/* Introductory Supporting Narrative */}
          <div className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white/60 p-3 rounded-xl border border-emerald-100/80">
            This Ayurvedic clinical care plan is formulated to support{' '}
            {childName ? <strong className="text-emerald-950 font-bold">{childName}&apos;s</strong> : 'your child’s'}{' '}
            holistic growth, sensory regulation, and developmental milestones through three classical pillars: <strong>Aahar (Diet)</strong>, <strong>Nidra (Sleep)</strong>, and <strong>Brahmacharya (Active Habits &amp; Digital Detox)</strong>.
          </div>
        </div>

        {/* ─── Navigation Tabs for Interactive Exploration ─────────── */}
        <div className="flex flex-wrap gap-1.5 bg-emerald-100/50 p-1.5 rounded-xl border border-emerald-200/70 print:hidden">
          {[
            { id: 'all', label: 'All 3 Pillars (Overview)', icon: Leaf },
            { id: 'aahar', label: '1. Aahar (Diet Regimen)', icon: Sparkles },
            { id: 'nidra', label: '2. Nidra (Sleep Hygiene)', icon: Moon },
            { id: 'brahmacharya', label: '3. Brahmacharya (Play & Habits)', icon: Sun },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                    : 'text-emerald-800/80 hover:text-emerald-950 hover:bg-white/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-600' : 'text-emerald-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Pillar 1: Aahar (Dietary Regimen) ───────────────────── */}
        {(activeTab === 'all' || activeTab === 'aahar') && (
          <div className="space-y-3 print:break-inside-avoid">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                  1
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-800">
                  {pillars.aahar.title}
                </h4>
              </div>
              {showHindi && (
                <span className="text-xs font-semibold text-emerald-800 hidden sm:inline">
                  {pillars.aahar.hindiTitle}
                </span>
              )}
            </div>

            {/* Aahar Two-Column Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Avoid (Don't) Column */}
              <div className="bg-rose-50/80 border border-rose-200/90 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-rose-200/70">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <h5 className="text-xs font-extrabold text-rose-950 uppercase tracking-wide">
                      Foods to Avoid (वर्ज्य आहार)
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200/80 text-rose-800">
                    Strict Don&apos;ts
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 mb-3 leading-relaxed">
                  Aggravates Vata-Pitta doshas, triggers gut inflammation, and impairs attention:
                </p>
                <ul className="space-y-2">
                  {pillars.aahar.avoid.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-xs text-rose-950">
                      <span className="text-rose-500 font-bold mt-0.5">•</span>
                      <div>
                        <span className="font-bold">{item.english}</span>
                        {showHindi && item.hindi && (
                          <span className="text-rose-800/90 text-[11px] ml-1">({item.hindi})</span>
                        )}
                        {item.description && (
                          <p className="text-[11px] text-rose-800/80 mt-0.5 leading-snug">{item.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Incorporate (Do) Column */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-emerald-200/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h5 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                      Foods to Incorporate (पथ्य आहार)
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-800">
                    Recommended Do&apos;s
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mb-3 leading-relaxed">
                  Medhya Rasayanas to fuel brain plasticity, gut Agni, and nervous calming:
                </p>
                <ul className="space-y-2">
                  {pillars.aahar.incorporate.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-xs text-emerald-950">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">{item.english}</span>
                        {showHindi && item.hindi && (
                          <span className="text-emerald-800/90 text-[11px] ml-1">({item.hindi})</span>
                        )}
                        {item.description && (
                          <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-snug">{item.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ─── Pillar 2: Nidra (Sleep Hygiene & Rest) ─────────────── */}
        {(activeTab === 'all' || activeTab === 'nidra') && (
          <div className="space-y-3 print:break-inside-avoid">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-800">
                  {pillars.nidra.title}
                </h4>
              </div>
              {showHindi && (
                <span className="text-xs font-semibold text-indigo-800 hidden sm:inline">
                  {pillars.nidra.hindiTitle}
                </span>
              )}
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-indigo-200/60">
                <Moon className="w-4 h-4 text-indigo-600" />
                <h5 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                  Calming Nighttime Rituals &amp; Deep Rest Protocol
                </h5>
              </div>
              <p className="text-[11px] text-indigo-800/90 mb-3 leading-relaxed">
                Rebalances sensory equilibrium and allows the brain’s glymphatic system to eliminate metabolic waste:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {pillars.nidra.rituals.map((ritual) => (
                  <div
                    key={ritual.id}
                    className="bg-white/90 rounded-lg p-2.5 border border-indigo-100 shadow-2xs hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold text-xs mt-0.5">•</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{ritual.english}</p>
                        {showHindi && ritual.hindi && (
                          <p className="text-[11px] font-semibold text-indigo-700/90 mt-0.5">{ritual.hindi}</p>
                        )}
                        {ritual.description && (
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">{ritual.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Pillar 3: Brahmacharya (Good Habits, Play & Digital Detox) */}
        {(activeTab === 'all' || activeTab === 'brahmacharya') && (
          <div className="space-y-3 print:break-inside-avoid">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">
                  3
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-800">
                  {pillars.brahmacharya.title}
                </h4>
              </div>
              {showHindi && (
                <span className="text-xs font-semibold text-amber-800 hidden sm:inline">
                  {pillars.brahmacharya.hindiTitle}
                </span>
              )}
            </div>

            <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 shadow-2xs">
              {/* Zero Screen Notice Banner */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-950 mb-3.5">
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                  <Ban className="w-4 h-4" />
                </div>
                <div>
                  <h6 className="text-xs font-bold text-rose-950 uppercase tracking-wide">
                    Mandatory Golden Rule: Strict Zero Screen Policy
                  </h6>
                  <p className="text-[11px] text-slate-700 leading-tight mt-0.5">
                    No smartphones, No television, Zero tablet screens. Constant digital stimulation suppresses language, eye contact, and emotional bonding.
                  </p>
                </div>
              </div>

              {/* Natural Play & Outdoor Engagement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Active Participation */}
                <div className="bg-white/90 rounded-lg p-3 border border-amber-100">
                  <h6 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>Daily Habits &amp; Natural Routines</span>
                  </h6>
                  <ul className="space-y-2">
                    {pillars.brahmacharya.rules.map((rule) => (
                      <li key={rule.id} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">{rule.english}</span>
                          {showHindi && rule.hindi && (
                            <span className="text-[11px] text-amber-800 ml-1">({rule.hindi})</span>
                          )}
                          <p className="text-[10px] text-slate-500 mt-0.5">{rule.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fine Motor & Sensory Activities */}
                <div className="bg-white/90 rounded-lg p-3 border border-amber-100">
                  <h6 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sensory Games &amp; Physical Exercises</span>
                  </h6>
                  <ul className="space-y-2">
                    {pillars.brahmacharya.activities.map((act) => (
                      <li key={act.id} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">{act.english}</span>
                          {showHindi && act.hindi && (
                            <span className="text-[11px] text-amber-800 ml-1">({act.hindi})</span>
                          )}
                          <p className="text-[10px] text-slate-500 mt-0.5">{act.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Core Reminders Bar: Three Golden Principles ─────────── */}
        <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-xl p-4 sm:p-5 text-white shadow-md print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-teal-300" />
            <h5 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-200">
              {guidingPrinciples.title} • {guidingPrinciples.hindiTitle}
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {guidingPrinciples.items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <h6 className="font-bold text-white text-xs">{item.title}</h6>
                    <p className="text-[10px] text-teal-200 font-semibold">{item.hindiTitle}</p>
                  </div>
                </div>
                <p className="text-[11px] text-teal-100/90 leading-relaxed mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Action Bar: Download & Print PDF ────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-emerald-200/80 print:hidden">
          <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {isReward
                ? 'Unlocked permanently upon video screening completion'
                : 'Available 24/7 in your parent account dashboard'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Print single clean A4 sheet */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-all cursor-pointer"
              title="Print clean A4 clinical care plan"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print A4 Guide</span>
            </button>

            {/* Direct Download Button */}
            <a
              href="/ayurvedic-diet-plan.pdf"
              download="PARWAA_Ayurvedic_Diet_Care_Plan.pdf"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-center flex-1 sm:flex-initial"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete PARWAA Guide (PDF)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
