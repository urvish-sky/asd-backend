'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  UserPlus,
  Video,
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  Send,
  Heart,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Baby,
  FileText,
  BookOpen,
  Sparkles,
  Leaf,
  HeartHandshake,
  AlertTriangle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import VideoUploadCard from '@/components/VideoUploadCard';
import ParwaaRecommendationCard from '@/components/ParwaaRecommendationCard';
import { useAppStore } from '@/store/useAppStore';
import { BiologicalSex, VideoSlot, VideoAnalysisResult, Patient } from '@/lib/types';
import { mockPatients } from '@/lib/mockData';

// Baseline hardcoded mock data profiles (Arjun M., Priya K., Rohan S.)
const mockData: Patient[] = mockPatients;

const ProtocolGuideViewer = dynamic(() => import('@/components/ProtocolGuideViewer'), {
  ssr: false,
  loading: () => (
    <div className="clinical-card p-8 mb-6 flex flex-col items-center justify-center bg-teal-50/50 rounded-2xl min-h-[160px] animate-pulse">
      <div className="w-10 h-10 rounded-full bg-emerald-200/60 mb-2 flex items-center justify-center text-emerald-700 font-bold">📋</div>
      <p className="text-xs font-semibold text-emerald-800">Loading Protocol Visual Guide...</p>
      <p className="text-[10px] text-slate-400 mt-1">Preparing visual recording instructions &amp; voice guidance</p>
    </div>
  ),
});

// ─── Video Slot Configurations ──────────────────────────────────────

const VIDEO_SLOTS = [
  {
    slotNumber: 1 as const,
    title: 'Social Engagement & Name-Call Protocol',
    instructions:
      '3 minutes. Position the camera at eye level. Call the child\'s name 3–4 times from behind or to the side without tapping their shoulder. Initiate social games such as peek-a-boo, tickle games, or blowing bubbles. Observe how the child responds to their name and engages socially.',
    markersAnalyzed: ['Auditory orienting latency', 'Eye contact ratio', 'Social smiling'],
  },
  {
    slotNumber: 2 as const,
    title: 'Free Play & Motor Exploration',
    instructions:
      '3 minutes. Keep the child\'s full body in frame at all times. Use a floor or low table setting with varied toys — blocks, spinning objects, cars, and textured items. Allow the child to play freely without directed interaction.',
    markersAnalyzed: [
      'Repetitive motor stereotypies',
      'Bilateral hand-flapping',
      'Body rocking',
      'Finger flicking',
      'Toe-walking',
    ],
  },
  {
    slotNumber: 3 as const,
    title: 'Joint Attention & Shared Requesting',
    instructions:
      '3 minutes. Place an enticing toy or snack slightly out of the child\'s reach. Point to a distant picture on the wall and say "Look at that!" clearly. Observe whether the child follows your gaze, points, or alternates gaze between the object and you.',
    markersAnalyzed: [
      'Proto-declarative pointing',
      'Alternating gaze (object → parent → object)',
      'Shared attention initiation',
    ],
  },
];

// ─── Submission Status Labels ───────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  uploaded: { label: 'Uploaded', className: 'status-uploaded', icon: <Clock className="w-3 h-3" /> },
  analyzing: { label: 'AI CV Analyzing...', className: 'status-analyzing', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
  ai_complete: { label: 'AI Analysis Complete', className: 'status-ai_complete', icon: <CheckCircle className="w-3 h-3" /> },
  under_review: { label: 'Under Pediatrician Review', className: 'status-under_review', icon: <Eye className="w-3 h-3" /> },
};

export default function ParentPortal() {
  const { patients, addPatient, updateSubmissionStatus, applyAIAnalysis } = useAppStore();
  const [activeSection, setActiveSection] = useState<'register' | 'upload' | 'status'>('register');

  // Baseline hardcoded mock data (Arjun M., Priya K., Rohan S.) initialized into state
  const [records, setRecords] = useState<Patient[]>(mockData);

  // ─── Fetch and Merge Live Data from Backend ────────────────────────
  useEffect(() => {
    let ignore = false;

    async function fetchLiveSubmissions() {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/api/inbox`);
        if (res.ok) {
          const data = await res.json();
          const fetchedLiveData: Patient[] = Array.isArray(data.patients)
            ? data.patients
            : Array.isArray(data)
            ? data
            : [];
          if (!ignore) {
            // Keep 3 mock data profiles and append any new live database entries after them
            const newLiveEntries = fetchedLiveData.filter(
              (live) => !mockData.some((m) => m.id === live.id && m.childName === live.childName)
            );
            setRecords([...mockData, ...newLiveEntries]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch live submissions from backend:', err);
      }
    }

    fetchLiveSubmissions();

    return () => {
      ignore = true;
    };
  }, []);

  // Sync any newly registered patient from client store into records
  useEffect(() => {
    if (patients.length > 0) {
      setRecords((prev) => {
        const newLocal = patients.filter((p) => !prev.some((r) => r.id === p.id));
        return newLocal.length > 0 ? [...prev, ...newLocal] : prev;
      });
    }
  }, [patients]);

  // ─── Registration Form State ──────────────────────────────────────
  const [formData, setFormData] = useState({
    childName: '',
    dateOfBirth: '',
    biologicalSex: '' as BiologicalSex | '',
    parentName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [registeredPatientId, setRegisteredPatientId] = useState<string | null>(null);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationAlert, setRegistrationAlert] = useState<{
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // ─── Age Calculation Logic ───────────────────────────────────────
  const calculateMonths = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    const yearsDiff = today.getFullYear() - birthDate.getFullYear();
    const monthsDiff = today.getMonth() - birthDate.getMonth();
    return (yearsDiff * 12) + monthsDiff;
  };

  const calculatedAge = useMemo(() => calculateMonths(formData.dateOfBirth), [formData.dateOfBirth]);

  // ─── Upload State ─────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedSlots, setUploadedSlots] = useState<Record<number, boolean>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<number, VideoAnalysisResult>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ─── Form Validation ──────────────────────────────────────
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.childName.trim()) errors.childName = 'Child\'s name is required';
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateMonths(formData.dateOfBirth);
      if (age < 0) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }
    if (!formData.biologicalSex) errors.biologicalSex = 'Please select biological sex';
    if (!formData.parentName.trim()) errors.parentName = 'Parent/caregiver name is required';
    if (!formData.contactEmail.trim() || !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = 'Valid email is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setRegistrationAlert(null);
    setIsRegistering(true);

    const ageInMonths = Math.max(0, calculateMonths(formData.dateOfBirth));
    let backendPatientId: string | null = null;
    let backendScreeningId: string | null = null;

    // 30-second timeout safeguard to handle Render cold sleep or connection latency
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          child_name: formData.childName,
          childName: formData.childName,
          date_of_birth: formData.dateOfBirth,
          dateOfBirth: formData.dateOfBirth,
          biological_sex: formData.biologicalSex,
          biologicalSex: formData.biologicalSex,
          parent_name: formData.parentName,
          parentName: formData.parentName,
          contact_email: formData.contactEmail,
          contactEmail: formData.contactEmail,
          contact_phone: formData.contactPhone,
          contactPhone: formData.contactPhone,
          risk_tier: 'typical',
          status: 'uploaded',
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.screening_id) {
          backendScreeningId = data.screening_id;
          setScreeningId(data.screening_id);
        }
        if (data.patient_id) {
          backendPatientId = data.patient_id;
        }
      } else {
        // Backend returned non-2xx status (e.g. 500 table missing or 400 validation error)
        const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}: ${res.statusText}` }));
        const errorMessage = errorData.message || errorData.detail || `Server returned error (${res.status})`;
        console.warn('[Registration] Backend submit returned error:', errorData);

        if (errorData.error_code === 'SUPABASE_TABLE_NOT_FOUND') {
          setRegistrationAlert({
            type: 'warning',
            title: 'Supabase Database Setup Required',
            message: 'Your Supabase database tables (patients, screenings, videos) have not been initialized. A local clinical session has been created so you can record videos immediately. Please run backend/schema.sql in your Supabase SQL Editor.',
          });
        } else {
          setRegistrationAlert({
            type: 'warning',
            title: 'Cloud Registration Notice',
            message: `${errorMessage}. A local screening session has been initialized so you can proceed without interruption.`,
          });
        }
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      console.warn('[Registration] Backend patient registration error:', err);

      if (isTimeout) {
        setRegistrationAlert({
          type: 'warning',
          title: 'Backend Server Waking Up (>30s)',
          message: 'The cloud backend server took longer than 30 seconds to respond (Render free instances take ~30-50s to spin up from cold sleep). Your profile has been initialized in this local browser session so you can proceed with video recording immediately.',
        });
      } else {
        const errMsg = err instanceof Error ? err.message : 'Could not reach backend server';
        setRegistrationAlert({
          type: 'warning',
          title: 'Network / Offline Session Active',
          message: `Could not connect to backend server (${errMsg}). Your profile has been created locally in this session so you can proceed to video recording.`,
        });
      }
    } finally {
      clearTimeout(timeoutId);
      setIsRegistering(false);
    }

    const assignedId = addPatient({
      id: backendPatientId || undefined,
      childName: formData.childName,
      dateOfBirth: formData.dateOfBirth,
      ageInMonths,
      biologicalSex: formData.biologicalSex as BiologicalSex,
      parentName: formData.parentName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      videoSlots: [
        { slotNumber: 1, title: VIDEO_SLOTS[0].title, fileName: null, fileSize: null, uploaded: false, qualityMetrics: { framingQuality: 92, lighting: 'good', resolution: '1080p' } },
        { slotNumber: 2, title: VIDEO_SLOTS[1].title, fileName: null, fileSize: null, uploaded: false, qualityMetrics: { framingQuality: 88, lighting: 'good', resolution: '1080p' } },
        { slotNumber: 3, title: VIDEO_SLOTS[2].title, fileName: null, fileSize: null, uploaded: false, qualityMetrics: { framingQuality: 90, lighting: 'adequate', resolution: '1080p' } },
      ] as [VideoSlot, VideoSlot, VideoSlot],
    });

    setRegisteredPatientId(assignedId);
    setActiveSection('upload');
  };

  const handleUploadComplete = useCallback(
    (slotNumber: 1 | 2 | 3, fileName: string, fileSize: number, result?: VideoAnalysisResult) => {
      setUploadedSlots((prev) => ({ ...prev, [slotNumber]: true }));
      if (result) {
        setAnalysisResults((prev) => ({ ...prev, [slotNumber]: result }));
      }
      // Auto-advance to next step
      if (slotNumber < 3) {
        setTimeout(() => setCurrentStep(slotNumber + 1), 600);
      }
    },
    []
  );

  const handleFinalSubmit = async () => {
    if (!registeredPatientId) return;
    setIsSubmitting(true);

    // Apply AI CV Telemetry & ISAA Flags to Patient Record
    updateSubmissionStatus(registeredPatientId, 'analyzing');
    await new Promise((r) => setTimeout(r, 1200));

    applyAIAnalysis(registeredPatientId, Object.values(analysisResults));

    // Also notify backend if screeningId exists
    if (screeningId) {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/api/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: registeredPatientId,
            screening_id: screeningId,
            child_name: formData.childName,
            status: 'ai_complete',
            telemetry: analysisResults[1]?.telemetry || analysisResults[2]?.telemetry || analysisResults[3]?.telemetry || {},
          }),
        }).catch(() => null);
      } catch (e) {
        // ignore non-critical update failure
      }
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const allVideosUploaded = uploadedSlots[1] && uploadedSlots[2] && uploadedSlots[3];

  // ─── Parent's own submissions ─────────────────────────────────────
  const mySubmissions = patients.filter(
    (p) => p.contactEmail === formData.contactEmail || p.id === registeredPatientId
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-md">
            <Baby className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Parent / Guardian Portal</h1>
            <p className="text-sm text-slate-500">Partnering with you to nurture and support your child&apos;s holistic developmental journey.</p>
          </div>
        </div>
      </div>

      {/* 2. "How We Help" Welcome Banner & Ayurvedic Reward Announcement */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-indigo-50/40 p-5 sm:p-6 mb-8 shadow-xs">
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <HeartHandshake className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>How We Support Your Family</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200/60">
                Holistic Growth
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
              Welcome! Our primary goal is to help you improve and support your child&apos;s unique growth. Rather than just analyzing behavior, we use these insights to provide actionable, holistic guidance for your family.
            </p>
          </div>
        </div>

        {/* 3. Visually Distinct Ayurvedic Reward Highlight Banner */}
        <div className="rounded-xl border border-emerald-300 bg-emerald-100/90 text-emerald-900 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-200/80 flex items-center justify-center flex-shrink-0 text-emerald-800 mt-0.5 sm:mt-0">
              <Leaf className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium leading-snug">
                <strong>Bonus:</strong> By uploading 3 videos as guided, you can <strong>Get personalized ayurvedic diet plan</strong> {calculatedAge > 0 ? `tailored for ${calculatedAge} months` : 'for your child'} — <strong>PARWAA Clinical Care Protocol</strong>.
              </p>
              <p className="text-[11px] text-emerald-800/90 font-semibold mt-0.5">
                अपने बच्चे के लिए व्यक्तिगत आयुर्वेदिक आहार योजना प्राप्त करें • Formulated by Dr. Vaibhav Jaisawal, IMS BHU
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection('status')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors self-end sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>View in My Submissions</span>
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-8">
        {[
          { key: 'register', label: 'Registration', icon: <UserPlus className="w-4 h-4" /> },
          { key: 'upload', label: 'Video Upload', icon: <Video className="w-4 h-4" /> },
          { key: 'status', label: 'My Submissions', icon: <ClipboardCheck className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as typeof activeSection)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeSection === tab.key
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Section A: Registration Form ───────────────────────────── */}
      {activeSection === 'register' && (
        <div className="animate-fade-in">
          <div className="clinical-card p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Child Registration</h2>
            <p className="text-sm text-slate-500 mb-6">Please fill in your child&apos;s information to begin the screening process.</p>

            {/* Registration Alert / Cloud Database Notice Banner */}
            {registrationAlert && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 mb-6 animate-fade-in ${
                  registrationAlert.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : registrationAlert.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-sm mb-0.5">{registrationAlert.title}</p>
                  <p className="leading-relaxed">{registrationAlert.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRegistrationAlert(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-1"
                  aria-label="Dismiss notice"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Child Name */}
              <div>
                <label className="form-label">Child&apos;s Full Name or Pseudonym *</label>
                <input
                  type="text"
                  className={`form-input ${formErrors.childName ? 'border-red-400' : ''}`}
                  placeholder="e.g., Arjun M."
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                />
                {formErrors.childName && <p className="text-xs text-red-500 mt-1">{formErrors.childName}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="form-label" htmlFor="dateOfBirth">Date of Birth *</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className={`form-input ${formErrors.dateOfBirth ? 'border-red-400' : ''}`}
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    const dob = e.target.value;
                    setFormData({ ...formData, dateOfBirth: dob });
                    if (formErrors.dateOfBirth) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.dateOfBirth;
                        return next;
                      });
                    }
                  }}
                />
                {/* Read-only dynamically calculated age display */}
                <p className="text-xs font-medium text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <span>Calculated Age:</span>
                  <span className="font-bold text-teal-700">
                    {formData.dateOfBirth ? `${calculatedAge} ${calculatedAge === 1 ? 'month' : 'months'}` : '—'}
                  </span>
                </p>
                {formErrors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{formErrors.dateOfBirth}</p>}
              </div>

              {/* Biological Sex */}
              <div>
                <label className="form-label">Biological Sex *</label>
                <select
                  className={`form-input ${formErrors.biologicalSex ? 'border-red-400' : ''}`}
                  value={formData.biologicalSex}
                  onChange={(e) => setFormData({ ...formData, biologicalSex: e.target.value as BiologicalSex })}
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
                {formErrors.biologicalSex && <p className="text-xs text-red-500 mt-1">{formErrors.biologicalSex}</p>}
              </div>

              {/* Parent Name */}
              <div>
                <label className="form-label">Parent / Caregiver Name *</label>
                <input
                  type="text"
                  className={`form-input ${formErrors.parentName ? 'border-red-400' : ''}`}
                  placeholder="e.g., Kavita Mehta"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                />
                {formErrors.parentName && <p className="text-xs text-red-500 mt-1">{formErrors.parentName}</p>}
              </div>

              {/* Contact Email */}
              <div>
                <label className="form-label">Contact Email *</label>
                <input
                  type="email"
                  className={`form-input ${formErrors.contactEmail ? 'border-red-400' : ''}`}
                  placeholder="parent@email.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
                {formErrors.contactEmail && <p className="text-xs text-red-500 mt-1">{formErrors.contactEmail}</p>}
              </div>

              {/* Contact Phone */}
              <div>
                <label className="form-label">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91-XXXXX-XXXXX"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button onClick={handleRegister} className="btn-primary" disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering Profile...
                  </>
                ) : (
                  <>
                    Register & Continue to Video Upload
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Section B: Video Upload Wizard ─────────────────────────── */}
      {activeSection === 'upload' && (
        <div className="animate-fade-in space-y-6">
          {/* Interactive Protocol Visual & Audio Guide */}
          <ProtocolGuideViewer activeStep={currentStep} />

          {!registeredPatientId && (
            <div className="clinical-card p-6 text-center border-dashed border-2 border-teal-200">
              <p className="text-slate-600 mb-4 font-medium">Please register your child first to link these video recordings with your clinical profile.</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => setActiveSection('register')} className="btn-primary">
                  <ArrowLeft className="w-4 h-4" /> Go to Child Registration
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const dob = '2023-03-01';
                    const age = calculateMonths(dob);
                    let qpPatientId: string | null = null;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000);
                    try {
                      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                      const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/api/submit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal,
                        body: JSON.stringify({
                          child_name: 'Samir V.',
                          childName: 'Samir V.',
                          date_of_birth: dob,
                          dateOfBirth: dob,
                          biological_sex: 'male',
                          biologicalSex: 'male',
                          parent_name: 'Pooja V.',
                          parentName: 'Pooja V.',
                          contact_email: 'pooja.v@example.com',
                          contactEmail: 'pooja.v@example.com',
                          contact_phone: '+91-98765-00000',
                          contactPhone: '+91-98765-00000',
                          risk_tier: 'moderate',
                          status: 'uploaded',
                        }),
                      });
                      clearTimeout(timeoutId);
                      if (res.ok) {
                        const data = await res.json();
                        if (data.screening_id) {
                          setScreeningId(data.screening_id);
                        }
                        if (data.patient_id) {
                          qpPatientId = data.patient_id;
                        }
                      }
                    } catch (e) {
                      clearTimeout(timeoutId);
                      console.warn('Quick profile backend submit error:', e);
                    }

                    const id = addPatient({
                      id: qpPatientId || undefined,
                      childName: 'Samir V.',
                      dateOfBirth: dob,
                      ageInMonths: age,
                      biologicalSex: 'male',
                      parentName: 'Pooja V.',
                      contactEmail: 'pooja.v@example.com',
                      contactPhone: '+91-98765-00000',
                      videoSlots: [
                        { slotNumber: 1, title: VIDEO_SLOTS[0].title, fileName: null, fileSize: null, uploaded: false, qualityMetrics: { framingQuality: 90, lighting: 'good', resolution: '1080p' } },
                        { slotNumber: 2, title: VIDEO_SLOTS[1].title, fileName: null, fileSize: null, uploaded: false, qualityMetrics: { framingQuality: 88, lighting: 'good', resolution: '1080p' } },
                        { slotNumber: 3, title: VIDEO_SLOTS[2].title, fileName: null, fileSize: null, uploaded: false, qualityMetrics: { framingQuality: 92, lighting: 'adequate', resolution: '1080p' } },
                      ] as [VideoSlot, VideoSlot, VideoSlot],
                    });
                    setRegisteredPatientId(id);
                  }}
                  className="btn-secondary text-xs"
                >
                  ⚡ Load Quick Test Profile
                </button>
              </div>
            </div>
          )}

          {registeredPatientId && !submitted && (
            <>
              {/* Step Progress */}
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <button
                      onClick={() => setCurrentStep(step)}
                      className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 ${
                        uploadedSlots[step]
                          ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                          : currentStep === step
                          ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-300'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {uploadedSlots[step] ? <CheckCircle className="w-5 h-5" /> : step}
                    </button>
                    {step < 3 && (
                      <div className={`w-16 h-0.5 rounded ${uploadedSlots[step] ? 'bg-green-300' : 'bg-slate-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Current Upload Card */}
              <VideoUploadCard
                key={currentStep}
                slotNumber={currentStep as 1 | 2 | 3}
                title={VIDEO_SLOTS[currentStep - 1].title}
                instructions={VIDEO_SLOTS[currentStep - 1].instructions}
                markersAnalyzed={VIDEO_SLOTS[currentStep - 1].markersAnalyzed}
                onUploadComplete={handleUploadComplete}
                isUploaded={!!uploadedSlots[currentStep]}
                analysisResult={analysisResults[currentStep]}
                screeningId={screeningId || (registeredPatientId ? `SCR-${registeredPatientId}` : null)}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  className="btn-secondary"
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4" /> Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
                    className="btn-primary"
                  >
                    Next Video <ArrowRight className="w-4 h-4" />
                  </button>
                ) : allVideosUploaded ? (
                  <button
                    onClick={handleFinalSubmit}
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting for AI Analysis...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit for AI Analysis
                      </>
                    )}
                  </button>
                ) : (
                  <button className="btn-primary opacity-50 cursor-not-allowed" disabled>
                    Upload all 3 videos to continue
                  </button>
                )}
              </div>

              {/* Submission Checklist */}
              {allVideosUploaded && !isSubmitting && (
                <div className="clinical-card p-5 bg-teal-50/50 border-teal-200 animate-fade-in">
                  <h3 className="text-sm font-semibold text-teal-800 mb-3 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" /> Pre-Submission Checklist
                  </h3>
                  <div className="space-y-2">
                    {['All 3 video clips uploaded successfully', 'Videos are under 3 minutes each', 'Child is visible and in frame', 'Audio is clear for name-call analysis'].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {submitted && (
            <div className="space-y-6 animate-fade-in">
              {/* Upload Confirmation Card */}
              <div className="clinical-card p-6 sm:p-8 text-center bg-white border border-slate-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
                  <CheckCircle className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Screening Submission Complete!</h3>
                <p className="text-sm text-slate-600 max-w-xl mx-auto mb-4">
                  All 3 standardized video protocols have been received and analyzed by our AI Computer Vision engine. Your pediatrician will review the clinical telemetry alongside your child&apos;s developmental milestones.
                </p>
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  <span>Patient ID: {registeredPatientId || 'ASD-SUB'}</span>
                  <span>•</span>
                  <span>Status: AI Pre-Scored &amp; Ready for Pediatrician Review</span>
                </div>
              </div>

              {/* Navigation Action to Account Dashboard & Unlocked PARWAA Plan */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 shadow-xs">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Reward Unlocked</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-950">PARWAA Ayurvedic Care Plan</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {formData.childName || 'Your child'}&apos;s personalized Ayurvedic diet and lifestyle guidelines ({calculatedAge > 0 ? `${calculatedAge} months` : 'Pediatric'} plan) are ready. View and download the complete plan below or in <strong>My Submissions</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('status')}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <span>Go to My Submissions &amp; View Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Unlocked Reward Preview Card */}
              <div className="mt-6 text-left">
                <ParwaaRecommendationCard
                  variant="reward"
                  childName={formData.childName || (patients.length > 0 ? patients[patients.length - 1].childName : undefined)}
                  childAge={calculatedAge || (patients.length > 0 ? patients[patients.length - 1].ageInMonths : undefined)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Section C: Submissions Status & Account Dashboard ──────── */}
      {activeSection === 'status' && (
        <div className="animate-fade-in space-y-6">
          {/* Reassurance Card */}
          <div className="clinical-card p-6 border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50/50 to-white">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 flex-shrink-0">
                <Heart className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-teal-800 mb-1">About This Screening</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  This is a <strong>routine developmental screening tool</strong>. The AI analysis helps your pediatrician
                  prioritize and review developmental milestones. It is <em>not</em> a diagnosis. Results and next steps
                  will be communicated directly by your child&apos;s doctor during your next visit.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Account Dashboard Integration: My Child's Reports & Resources */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shadow-2xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">My Child&apos;s Reports &amp; Resources</h3>
                <p className="text-xs text-slate-500">
                  Permanent developmental guides, clinical reports &amp; nutritional plans
                </p>
              </div>
            </div>

            {/* Permanent PARWAA Ayurvedic Diet Plan & Care Protocol */}
            <ParwaaRecommendationCard
              variant="dashboard"
              childName={formData.childName || (mySubmissions.length > 0 ? mySubmissions[0].childName : (patients.length > 0 ? patients[patients.length - 1].childName : undefined))}
              childAge={calculatedAge || (mySubmissions.length > 0 ? mySubmissions[0].ageInMonths : (patients.length > 0 ? patients[patients.length - 1].ageInMonths : undefined))}
            />
          </div>

          {/* Submissions List */}
          <div className="clinical-card overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-700">All Submissions</h3>
            </div>

            {records.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No submissions yet. Register your child to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {records.map((record, index) => {
                  const statusInfo = STATUS_LABELS[record.submissionStatus] || {
                    label: 'Under Review',
                    className: 'status-under_review',
                    icon: <Eye className="w-3 h-3" />,
                  };
                  return (
                    <div
                      key={`${record.id}-${index}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                          {record.childName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{record.childName}</p>
                          <p className="text-xs text-slate-500">
                            {record.ageInMonths} months • ID: {record.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          {record.submissionDate ? new Date(record.submissionDate).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className={`badge ${statusInfo.className} flex items-center gap-1`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
