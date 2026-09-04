'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  Stethoscope,
  CheckSquare,
  AlertTriangle,
  Shield,
  Camera,
  Sun,
  Monitor,
  Shirt,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Eye,
  Activity,
  Ear,
  Scale,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

type TabKey = 'parents' | 'clinicians';

interface AccordionItemProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, icon, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex-shrink-0">
          {icon}
        </div>
        <span className="flex-1 text-sm font-semibold text-slate-800">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 animate-fade-in">
          <div className="pl-11">{children}</div>
        </div>
      )}
    </div>
  );
}

export default function ProtocolsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('parents');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Protocols & Clinical Guide</h1>
            <p className="text-sm text-slate-500">Standardized operating procedures for screening submissions and clinical review</p>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-8">
        <button
          onClick={() => setActiveTab('parents')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'parents'
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          For Parents & Caregivers
        </button>
        <button
          onClick={() => setActiveTab('clinicians')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'clinicians'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          For Pediatricians & Medical Staff
        </button>
      </div>

      {/* ─── Parents Tab ──────────────────────────────────────────── */}
      {activeTab === 'parents' && (
        <div className="space-y-4 animate-fade-in">
          <AccordionItem
            title="Room Setup Checklist"
            icon={<Camera className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="space-y-3 mt-3">
              {[
                { icon: <Sun className="w-4 h-4 text-amber-500" />, text: 'Use natural, diffuse daylight — avoid strong backlighting or overhead fluorescents that create harsh shadows.' },
                { icon: <Monitor className="w-4 h-4 text-slate-500" />, text: 'Turn off background TVs, tablets, and screens to minimize competing auditory and visual stimuli.' },
                { icon: <Shirt className="w-4 h-4 text-blue-500" />, text: 'Dress the child in fitted, solid-color clothing for optimal skeletal keypoint visibility by the AI system.' },
                { icon: <Camera className="w-4 h-4 text-teal-500" />, text: 'Position the camera at the child\'s eye level — use a tripod or prop the phone against a stable surface.' },
                { icon: <Users className="w-4 h-4 text-purple-500" />, text: 'Only the child and one caregiver should be in frame. Remove pets and other children if possible.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-lg">
                  <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </AccordionItem>

          <AccordionItem
            title="Recording Dos and Don'ts"
            icon={<CheckSquare className="w-4 h-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {/* Dos */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-green-600 tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" /> Do
                </h4>
                {[
                  'Call the child\'s name from behind or to the side (not face-to-face)',
                  'Wait 5–10 seconds between name calls to observe response latency',
                  'Let the child explore toys freely without redirecting their play',
                  'Point to distant objects and observe if the child follows your gaze',
                  'Record for the full 3 minutes per clip — don\'t stop early',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
                    <CheckSquare className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              {/* Don'ts */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-red-600 tracking-wider flex items-center gap-1.5">
                  <ThumbsDown className="w-3.5 h-3.5" /> Don&apos;t
                </h4>
                {[
                  'Don\'t tap the child\'s shoulder or use physical prompts during name-call testing',
                  'Don\'t hold toys up near the camera lens (distorts gaze tracking)',
                  'Don\'t use a cluttered room or patterned backgrounds',
                  'Don\'t coach or direct the child during free play observation',
                  'Don\'t zoom in/out repeatedly — keep a stable, wide-angle frame',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Frequently Asked Questions"
            icon={<FileText className="w-4 h-4" />}
          >
            <div className="space-y-4 mt-3">
              {[
                {
                  q: 'What happens after I upload the videos?',
                  a: 'Our AI system analyzes the videos for specific developmental markers. The results are sent directly to your child\'s pediatrician for review. This typically takes 24–48 hours.',
                },
                {
                  q: 'Will this diagnose my child with autism?',
                  a: 'No. This is a screening tool that helps your doctor identify areas for closer observation. Only a qualified developmental pediatrician can make a clinical diagnosis using standardized instruments like the ADOS-2.',
                },
                {
                  q: 'Is my child\'s data secure?',
                  a: 'Yes. All videos and personal information are encrypted and stored in compliance with HIPAA guidelines. Videos are used solely for developmental screening and are not shared with third parties.',
                },
                {
                  q: 'What age range is this screening designed for?',
                  a: 'This platform is calibrated for children aged 12–36 months, which is the critical window for early developmental screening and intervention.',
                },
              ].map((faq, i) => (
                <div key={i} className="p-4 bg-white border border-slate-100 rounded-lg">
                  <p className="text-sm font-semibold text-slate-800 mb-1">{faq.q}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </AccordionItem>
        </div>
      )}

      {/* ─── Clinicians Tab ───────────────────────────────────────── */}
      {activeTab === 'clinicians' && (
        <div className="space-y-4 animate-fade-in">
          <AccordionItem
            title="AI Biomarker Technical Breakdown"
            icon={<Brain className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="space-y-4 mt-3">
              {/* ST-GCN */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-blue-800">Motor Stereotypy Detection (ST-GCN)</h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  Spatio-Temporal Graph Convolutional Networks (ST-GCN) process skeletal keypoint sequences extracted from video frames. The model is trained on annotated datasets of bilateral hand-flapping, body rocking, finger flicking, and toe-walking patterns.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Keypoint Model:</span> <span className="text-slate-700">MediaPipe Pose (33 landmarks)</span></div>
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Temporal Window:</span> <span className="text-slate-700">2-second sliding window at 15fps</span></div>
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Detection Threshold:</span> <span className="text-slate-700">Confidence ≥ 0.85</span></div>
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Validation Accuracy:</span> <span className="text-slate-700">91.3% (cross-validated)</span></div>
                </div>
              </div>

              {/* Gaze Vectors */}
              <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-teal-600" />
                  <h4 className="text-sm font-semibold text-teal-800">Gaze Vector & Social Attention Analysis</h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  A face-mesh model (468 landmarks) extracts iris position and head pose to compute 3D gaze vectors. Social gaze ratio is calculated as the proportion of time the child fixates on human faces vs. non-social regions in the frame.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Face Detection:</span> <span className="text-slate-700">BlazeFace (real-time)</span></div>
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Gaze Estimation:</span> <span className="text-slate-700">L2CS-Net (pitch & yaw)</span></div>
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Normative Benchmark:</span> <span className="text-slate-700">65–85% social gaze (12–36 mo)</span></div>
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">CI Methodology:</span> <span className="text-slate-700">95% Bootstrap CI (N=500)</span></div>
                </div>
              </div>

              {/* Audio Analysis */}
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Ear className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-semibold text-purple-800">Auditory Orienting & Prosody Analysis</h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3">
                  Name-call detection uses speaker diarization + keyword spotting. Orienting latency is measured as the time delta between the audio name-call onset and the child&apos;s head rotation exceeding 15° toward the caller. Prosody analysis uses mel-frequency cepstral coefficients (MFCCs) for pitch contour atypicality.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Normal Latency:</span> <span className="text-slate-700">&lt; 1.2 seconds</span></div>
                  <div className="bg-white p-2.5 rounded-lg"><span className="text-slate-500 font-semibold">Head Turn Threshold:</span> <span className="text-slate-700">15° yaw rotation</span></div>
                </div>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Regulatory Notice & CDSS Classification"
            icon={<Shield className="w-4 h-4" />}
          >
            <div className="mt-3 space-y-4">
              <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 mb-2">Class II Clinical Decision Support System</h4>
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                      This platform is classified as a <strong>Class II Clinical Decision Support System (CDSS)</strong> intended for <strong>risk prioritization and screening assistance only</strong>. It does <em>not</em> provide autonomous diagnostic capability.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        Not a replacement for DSM-5 diagnostic criteria or ADOS-2 standardized assessment
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        AI outputs are probabilistic risk indicators, not definitive diagnoses
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        All clinical decisions must be made by qualified licensed professionals
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        System performance may vary with video quality, lighting, and environmental conditions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Intended Use Statement</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  This CDSS is intended to assist developmental pediatricians in prioritizing patients for detailed clinical evaluation by providing objective, quantifiable behavioral telemetry derived from standardized home video recordings. The system serves as an adjunct screening layer, not an endpoint diagnostic tool.
                </p>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem
            title="Differential Diagnosis Protocols"
            icon={<Scale className="w-4 h-4" />}
          >
            <div className="mt-3 space-y-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <Ear className="w-4 h-4" /> Rule Out: Primary Hearing Deficit
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-2">
                  Before attributing delayed name-call response to ASD, clinicians must rule out hearing impairment:
                </p>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span className="text-red-400">→</span> Order audiological evaluation (OAE/ABR) for all children with elevated name-call latency</li>
                  <li className="flex items-start gap-2"><span className="text-red-400">→</span> Review tympanometry results for middle-ear effusion</li>
                  <li className="flex items-start gap-2"><span className="text-red-400">→</span> Check otitis media history in clinical records</li>
                </ul>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Rule Out: Childhood Apraxia of Speech (CAS)
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-2">
                  Low vocal turn-taking scores may also indicate childhood apraxia of speech rather than ASD-related communication deficits:
                </p>
                <ul className="space-y-1.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span className="text-purple-400">→</span> Assess for groping articulatory movements and inconsistent speech errors</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">→</span> Evaluate receptive language independently of expressive ability</li>
                  <li className="flex items-start gap-2"><span className="text-purple-400">→</span> Refer to speech-language pathology for comprehensive motor speech evaluation</li>
                </ul>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> Comorbidity Screening
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Consider concurrent screening for ADHD (sustained attention deficits), intellectual disability (global developmental delay), and anxiety disorders, which frequently co-occur with ASD and can confound behavioral telemetry interpretation.
                </p>
              </div>
            </div>
          </AccordionItem>
        </div>
      )}
    </div>
  );
}
