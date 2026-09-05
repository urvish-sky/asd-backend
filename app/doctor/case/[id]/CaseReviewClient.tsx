'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  Video,
  Monitor,
  Sun,
  Maximize,
  FileText,
  Download,
  Save,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  Calendar,
  Hash,
  Clipboard,
  Send,
  Award,
  Activity,
  Volume2,
  VolumeX,
  RotateCcw,
  Link2,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { mockPatients } from '@/lib/mockData';
import BiomarkerChart from '@/components/BiomarkerChart';
import BiomarkerCard from '@/components/BiomarkerCard';
import EventTimeline from '@/components/EventTimeline';
import ISAAForm, { ScoreOverrideItem } from '@/components/ISAAForm';
import Toast, { ToastData } from '@/components/Toast';
import { ReferralType, Patient, VideoSlot, BiomarkerResult } from '@/lib/types';

const REFERRAL_OPTIONS: { value: ReferralType; label: string }[] = [
  { value: 'none', label: 'No Referral Needed' },
  { value: 'developmental_specialist', label: 'Developmental Specialist' },
  { value: 'audiology', label: 'Audiology / Hearing Check' },
  { value: 'early_intervention', label: 'Early Intervention (OT / Speech)' },
];

function getBiomarkerStatus(measured: number, normalThreshold: number, isInverse: boolean = false): 'normal' | 'borderline' | 'atypical' {
  if (isInverse) {
    if (measured <= normalThreshold) return 'normal';
    if (measured <= normalThreshold * 2) return 'borderline';
    return 'atypical';
  } else {
    if (measured >= normalThreshold) return 'normal';
    if (measured >= normalThreshold * 0.6) return 'borderline';
    return 'atypical';
  }
}

export default function CaseReviewClient({ id }: { id: string }) {
  const router = useRouter();
  const patientId = id;

  const { patients, setPatients, updateClinicalNotes, updateReferral, signOffCase, updateClinicalStatus, updateISAAScore } = useAppStore();

  const storePatient = patients.find(
    (p) => p.id === patientId || (p as any).screening_id === patientId || p.id?.toLowerCase() === patientId.toLowerCase()
  );
  const mockPatient = mockPatients.find((p) => p.id === patientId || p.id.toLowerCase() === patientId.toLowerCase());

  const [fetchedPatient, setFetchedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(!storePatient && !mockPatient);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const patient = storePatient || fetchedPatient || mockPatient;

  // ─── Dynamic Data Fetching from FastAPI Backend ─────────────────────
  useEffect(() => {
    let ignore = false;

    async function fetchPatientData() {
      if (storePatient) {
        setLoading(false);
      }

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        let matched: Patient | null = null;

        // 1. Try dedicated endpoint GET /api/patients/${patientId}
        try {
          const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/api/patients/${patientId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.patient) {
              matched = data.patient;
            }
          }
        } catch (e) {
          // fallback to /api/inbox
        }

        // 2. Fallback to /api/inbox list filtering
        if (!matched) {
          const inboxRes = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/api/inbox`);
          if (inboxRes.ok) {
            const inboxData = await inboxRes.json();
            const list: Patient[] = Array.isArray(inboxData.patients)
              ? inboxData.patients
              : Array.isArray(inboxData)
              ? inboxData
              : [];
            matched = list.find(
              (p) =>
                p.id === patientId ||
                (p as any).screening_id === patientId ||
                p.id?.toLowerCase() === patientId.toLowerCase()
            ) || null;
          }
        }

        if (!ignore) {
          if (matched) {
            setFetchedPatient(matched);
            setPatients((prev: Patient[]) => {
              const exists = prev.some((p: Patient) => p.id === matched!.id);
              return exists
                ? prev.map((p: Patient) => (p.id === matched!.id ? { ...p, ...matched } : p))
                : [...prev, matched!];
            });
          } else if (!storePatient && !mockPatient) {
            setFetchError(`Patient record for ID "${patientId}" was not found in the database.`);
          }
        }
      } catch (err: any) {
        if (!ignore && !storePatient && !mockPatient) {
          setFetchError(err?.message || 'Failed to fetch patient data.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchPatientData();

    return () => {
      ignore = true;
    };
  }, [patientId, storePatient, mockPatient, setPatients]);

  const [activeVideoSlot, setActiveVideoSlot] = useState<1 | 2 | 3>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const defaultSlot: VideoSlot = {
    slotNumber: activeVideoSlot,
    title: `Protocol ${activeVideoSlot}`,
    fileName: null,
    fileSize: null,
    uploaded: false,
    qualityMetrics: { framingQuality: 90, lighting: 'good', resolution: '1080p' },
  };

  const activeSlot = patient?.videoSlots?.find((v) => v.slotNumber === activeVideoSlot) || defaultSlot;

  // Compute resolved video source with backend priority and frontend fallback
  const resolvedVideoSrc = useMemo(() => {
    if (activeSlot?.videoUrl) {
      return activeSlot.videoUrl;
    }
    if (activeSlot?.fileName) {
      const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      return `${backendBase}/videos/${activeSlot.fileName}`;
    }
    return `/videos/protocol${activeVideoSlot}_social_engagement.mp4`;
  }, [activeSlot, activeVideoSlot]);

  const [videoSrcOverride, setVideoSrcOverride] = useState<string | null>(null);
  const [prevResolvedSrc, setPrevResolvedSrc] = useState(resolvedVideoSrc);

  // Reset video state when the resolved source changes (e.g. slot switch)
  // Uses the "adjusting state during rendering" pattern instead of useEffect
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (prevResolvedSrc !== resolvedVideoSrc) {
    setPrevResolvedSrc(resolvedVideoSrc);
    setVideoSrcOverride(null);
    setVideoError(null);
    setCurrentTime(0);
    setIsPlaying(false);
  }

  const currentVideoSrc = videoSrcOverride ?? resolvedVideoSrc;

  // Log the video URL to the console to verify if it is rendering as a local path or a backend API endpoint
  useEffect(() => {
    const isBackend = currentVideoSrc.includes(':8000') || currentVideoSrc.includes('/api/videos');
    const isBlob = currentVideoSrc.startsWith('blob:');
    const isLocalPublic = currentVideoSrc.startsWith('/videos/') || currentVideoSrc.startsWith('/public/');

    console.log('[Video Reviewer] Video source URL:', currentVideoSrc, {
      patientId,
      slot: activeVideoSlot,
      fileName: activeSlot?.fileName,
      storageType: isBackend
        ? 'FastAPI Backend Endpoint (http://localhost:8000/videos/...)'
        : isBlob
        ? 'Browser Blob URL (blob:http...)'
        : isLocalPublic
        ? 'Next.js Local Public Static Path (/videos/...)'
        : 'Remote External URL',
      isBackendEndpoint: isBackend,
      isLocalPath: isBlob || isLocalPublic,
    });
  }, [currentVideoSrc, patientId, activeVideoSlot, activeSlot]);

  const handleVideoError = () => {
    console.warn('[Video Reviewer] Playback failed for source:', currentVideoSrc);
    if (currentVideoSrc.includes(':8000') && activeSlot?.fileName) {
      const fallbackUrl = `/videos/${activeSlot.fileName}`;
      console.log('[Video Reviewer] Attempting fallback to Next.js local static route:', fallbackUrl);
      setVideoSrcOverride(fallbackUrl);
    } else {
      setVideoError('Unable to load video stream. Please verify that the backend server is running or check the video file.');
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('[Video Reviewer] Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleSkipTime = (delta: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoRef.current.currentTime + delta, duration));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const [rightPaneTab, setRightPaneTab] = useState<'biomarkers' | 'isaa'>('biomarkers');
  const [notes, setNotes] = useState(patient?.clinicalNote?.notes || '');
  const [diagnosticImpressions, setDiagnosticImpressions] = useState(patient?.clinicalNote?.diagnosticImpressions || '');
  const [selectedReferral, setSelectedReferral] = useState<ReferralType>(patient?.clinicalNote?.referral || 'none');
  const [showExportModal, setShowExportModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Sync clinical notes when patient loads dynamically
  useEffect(() => {
    if (patient?.clinicalNote) {
      setNotes(patient.clinicalNote.notes || '');
      setDiagnosticImpressions(patient.clinicalNote.diagnosticImpressions || '');
      setSelectedReferral(patient.clinicalNote.referral || 'none');
    }
  }, [patient]);

  // ─── HITL Continuous Learning Overrides State ───────────────────────
  const [overrides, setOverrides] = useState<Record<number, ScoreOverrideItem>>(() => {
    const initial: Record<number, ScoreOverrideItem> = {};
    if (patient?.isaaScores?.aiPrefilledItems) {
      patient.isaaScores.aiPrefilledItems.forEach((num) => {
        const scoreVal = patient.isaaScores?.items?.[num] || 0;
        initial[num] = {
          originalScore: scoreVal,
          newScore: scoreVal,
          justification: '',
          isOverridden: false,
        };
      });
    }
    return initial;
  });

  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  const handleOverrideToggle = (itemNumber: number, enabled: boolean) => {
    setOverrides((prev) => {
      const existing = prev[itemNumber] || {
        originalScore: patient?.isaaScores?.items?.[itemNumber] || 0,
        newScore: patient?.isaaScores?.items?.[itemNumber] || 0,
        justification: '',
        isOverridden: false,
      };
      return {
        ...prev,
        [itemNumber]: { ...existing, isOverridden: enabled },
      };
    });
  };

  const handleJustificationChange = (itemNumber: number, text: string) => {
    setOverrides((prev) => {
      const existing = prev[itemNumber] || {
        originalScore: patient?.isaaScores?.items?.[itemNumber] || 0,
        newScore: patient?.isaaScores?.items?.[itemNumber] || 0,
        justification: '',
        isOverridden: true,
      };
      return {
        ...prev,
        [itemNumber]: { ...existing, justification: text },
      };
    });
    if (text.trim() && validationErrors[itemNumber]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[itemNumber];
        return next;
      });
    }
  };

  const handleScoreChange = (itemNumber: number, score: number) => {
    if (!patient) return;
    updateISAAScore(patient.id, itemNumber, score);

    // If item is AI pre-filled, track modified score
    if (patient.isaaScores?.aiPrefilledItems.includes(itemNumber)) {
      setOverrides((prev) => {
        const existing = prev[itemNumber] || {
          originalScore: patient.isaaScores?.items[itemNumber] || score,
          newScore: score,
          justification: '',
          isOverridden: true,
        };
        return {
          ...prev,
          [itemNumber]: {
            ...existing,
            newScore: score,
            isOverridden: true,
          },
        };
      });
    }
  };

  const handleEventClick = (timestampSeconds: number) => {
    setCurrentTime(timestampSeconds);
    if (videoRef.current) {
      videoRef.current.currentTime = timestampSeconds;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('[Video Reviewer] Autoplay on timeline event click prevented:', err);
        });
    } else {
      setIsPlaying(true);
    }
  };

  const handleSaveNotes = () => {
    if (!patient) return;
    updateClinicalNotes(patient.id, notes, diagnosticImpressions);
    updateReferral(patient.id, selectedReferral);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ─── Part 3: Submission Action & Feedback Interception ─────────────
  const handleSaveClinicalSummary = async () => {
    if (!patient) return;

    // Check if any AI-prefilled item has been modified without justification
    const errors: Record<number, string> = {};
    const modifiedOverrides: Array<{
      itemNumber: number;
      originalScore: number;
      doctorNewScore: number;
      justification: string;
    }> = [];

    const currentScores = patient.isaaScores?.items || {};
    const aiItems = patient.isaaScores?.aiPrefilledItems || [];

    aiItems.forEach((itemNum) => {
      const orig = overrides[itemNum]?.originalScore ?? currentScores[itemNum] ?? 0;
      const current = currentScores[itemNum] ?? 0;

      if (current > 0 && current !== orig) {
        const just = (overrides[itemNum]?.justification || '').trim();
        if (!just) {
          errors[itemNum] = `Clinical justification is mandatory for Item ${itemNum} (AI: ${orig} ➔ Doctor: ${current}).`;
        } else {
          modifiedOverrides.push({
            itemNumber: itemNum,
            originalScore: orig,
            doctorNewScore: current,
            justification: just,
          });
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setRightPaneTab('isaa');
      alert('Clinical justification is required for all modified AI predictions before saving.');
      return;
    }

    setValidationErrors({});
    setIsSubmittingFeedback(true);

    // Save clinical summary notes and referral in store
    updateClinicalNotes(patient.id, notes, diagnosticImpressions);
    updateReferral(patient.id, selectedReferral);

    const submissionDetails: string[] = [];
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    if (modifiedOverrides.length > 0) {
      for (const mod of modifiedOverrides) {
        try {
          const resp = await fetch(`${API_BASE_URL}/api/feedback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              submission_id: patient.id,
              item_id: `Item ${mod.itemNumber}`,
              original_ai_score: mod.originalScore,
              doctor_new_score: mod.doctorNewScore,
              justification_text: mod.justification,
            }),
          });
          if (resp.ok) {
            submissionDetails.push(`Item ${mod.itemNumber}: AI ${mod.originalScore} ➔ Doctor ${mod.doctorNewScore}`);
          } else {
            submissionDetails.push(`Item ${mod.itemNumber}: AI ${mod.originalScore} ➔ Doctor ${mod.doctorNewScore} (Queued)`);
          }
        } catch (err) {
          console.warn(`Continuous learning feedback local note: ${err}`);
          submissionDetails.push(`Item ${mod.itemNumber}: AI ${mod.originalScore} ➔ Doctor ${mod.doctorNewScore} (Queued)`);
        }
      }
    }

    setIsSubmittingFeedback(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);

    // Render toast notification confirming submission
    setToast({
      title: 'Feedback submitted to IIT BHU AI Training Database.',
      message: modifiedOverrides.length > 0
        ? `Successfully registered ${modifiedOverrides.length} clinician score override(s) with clinical justifications for continuous learning.`
        : 'Clinical summary successfully saved and synced with patient records.',
      details: submissionDetails.length > 0 ? submissionDetails : undefined,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handleSignOff = () => {
    if (!patient) return;
    updateClinicalNotes(patient.id, notes, diagnosticImpressions);
    updateReferral(patient.id, selectedReferral);
    signOffCase(patient.id, 'Dr. Clinical Reviewer');
    if (selectedReferral !== 'none') {
      updateClinicalStatus(patient.id, 'referred');
    }
    setShowExportModal(true);
  };

  if (loading && !patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center animate-fade-in">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-1">Loading Patient Data...</h2>
        <p className="text-sm text-slate-500">
          Retrieving clinical records, video streams, and AI telemetry for{' '}
          <span className="font-mono font-semibold text-slate-700">{patientId}</span>...
        </p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-fade-in">
        <XCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Patient Not Found</h2>
        <p className="text-slate-500 mb-6">
          {fetchError || `Case "${patientId}" could not be located in the clinical database.`}
        </p>
        <button onClick={() => router.push('/doctor')} className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Triage Inbox
        </button>
      </div>
    );
  }

  // Fallback biomarker definitions for newly registered cases
  const defaultBiomarkers: BiomarkerResult = {
    nameCallLatency: { measured: 1.2, normalMax: 1.2, unit: 's' },
    socialGazeRatio: { measured: 72, normalMin: 65, normalMax: 85, unit: '%' },
    motorStereotypyIndex: { frequency: 0.3, totalDuration: 1.8, normalMaxFrequency: 1.0 },
    jointAttentionEpisodes: { count: 3, normalMin: 3 },
    speechProsody: { atypicalPitchBursts: 0, vocalTurnTaking: 4, normalTurnTakingMin: 3 },
  };

  const bio = patient.biomarkers || defaultBiomarkers;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Navigation */}
      <button
        onClick={() => router.push('/doctor')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Triage Inbox
      </button>

      {/* ─── Patient Metadata Header ──────────────────────────────── */}
      <div className="clinical-card p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg ${
              patient.riskTier === 'elevated' ? 'bg-gradient-to-br from-red-400 to-red-600'
              : patient.riskTier === 'moderate' ? 'bg-gradient-to-br from-amber-400 to-amber-600'
              : 'bg-gradient-to-br from-green-400 to-green-600'
            }`}>
              {patient.childName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{patient.childName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" />{patient.id}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{patient.ageInMonths} months, {patient.biologicalSex}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(patient.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <Maximize className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Framing</p>
                <p className="text-sm font-bold text-slate-700">{activeSlot.qualityMetrics?.framingQuality ?? 90}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <Sun className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Lighting</p>
                <p className="text-sm font-bold text-slate-700 capitalize">{activeSlot.qualityMetrics?.lighting ?? 'good'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
              <Monitor className="w-4 h-4 text-teal-500" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Resolution</p>
                <p className="text-sm font-bold text-slate-700">{activeSlot.qualityMetrics?.resolution ?? '1080p'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Dual-Pane Workspace ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Pane: Video Reviewer */}
        <div className="space-y-4">
          {/* Video Reviewer Card */}
          <div className="clinical-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-semibold text-slate-700">Video Reviewer</h2>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {currentVideoSrc.includes(':8000')
                  ? 'FastAPI Video Server'
                  : currentVideoSrc.startsWith('blob:')
                  ? 'Client Blob Stream'
                  : 'Next.js Static Storage'}
              </div>
            </div>

            {/* Tab selector */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-4">
              {([1, 2, 3] as const).map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    setActiveVideoSlot(slot);
                    setCurrentTime(0);
                    setIsPlaying(false);
                  }}
                  className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                    activeVideoSlot === slot
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Video {slot}
                </button>
              ))}
            </div>

            {/* Real HTML5 Video Player */}
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center group shadow-md">
              <video
                ref={videoRef}
                src={currentVideoSrc}
                className="w-full h-full object-contain cursor-pointer"
                playsInline
                muted={isMuted}
                onClick={togglePlay}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current && Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={handleVideoError}
              />

              {/* Central Floating Play Overlay */}
              {!isPlaying && !videoError && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer transition-opacity"
                >
                  <div className="w-14 h-14 rounded-full bg-teal-500/90 hover:bg-teal-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                    <Play className="w-6 h-6 ml-0.5" />
                  </div>
                </div>
              )}

              {/* Top Banner Overlay */}
              <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 pointer-events-none drop-shadow">
                <span className="font-semibold bg-black/50 px-2 py-0.5 rounded backdrop-blur">
                  {activeSlot?.title || 'Video Protocol'}
                </span>
                <span className="font-mono text-[10px] bg-black/50 px-2 py-0.5 rounded backdrop-blur truncate max-w-[200px]">
                  {activeSlot?.fileName || 'No video recorded'}
                </span>
              </div>

              {/* Error Notice Overlay */}
              {videoError && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center z-10">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-xs text-white/90 font-medium mb-1">{videoError}</p>
                  <button
                    onClick={() => {
                      if (activeSlot?.fileName) {
                        setVideoSrcOverride(`/videos/${activeSlot.fileName}`);
                        setVideoError(null);
                      }
                    }}
                    className="mt-2 text-[11px] bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded font-medium transition-colors"
                  >
                    Switch to Local Static Fallback
                  </button>
                </div>
              )}

              {/* Bottom Control Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                {/* Seek Bar Slider */}
                <div className="relative flex items-center mb-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 180}
                    step="0.1"
                    value={currentTime}
                    onChange={handleScrubberChange}
                    className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:h-2 transition-all"
                  />
                </div>

                {/* Control Buttons & Timers */}
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      className="text-white hover:text-teal-300 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleSkipTime(-5)}
                      title="Rewind 5s"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <div className="font-mono text-[11px] text-white/90">
                      <span>{formatTime(currentTime)}</span>
                      <span className="text-white/40 mx-1">/</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white/80 hover:text-white transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        if (videoRef.current?.requestFullscreen) {
                          videoRef.current.requestFullscreen();
                        }
                      }}
                      title="Fullscreen"
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <Maximize className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Diagnostics URL Display */}
            <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-500 font-medium flex-shrink-0">Video URL:</span>
                <code className="text-[11px] font-mono text-teal-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 truncate">
                  {currentVideoSrc}
                </code>
              </div>
              <a
                href={currentVideoSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-teal-600 hover:text-teal-700 font-medium ml-2 flex-shrink-0 hover:underline"
              >
                Inspect
              </a>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="clinical-card p-4">
            <EventTimeline
              events={patient.behavioralEvents || []}
              activeVideoSlot={activeVideoSlot}
              onEventClick={handleEventClick}
            />
          </div>
        </div>

        {/* Right Pane: Biomarker Scorecard / ISAA */}
        <div className="space-y-4">
          {/* Right Pane Tab Switcher */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setRightPaneTab('biomarkers')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                rightPaneTab === 'biomarkers'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              Biomarkers
            </button>
            <button
              onClick={() => setRightPaneTab('isaa')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                rightPaneTab === 'isaa'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Award className="w-4 h-4" />
              ISAA Assessment
            </button>
          </div>

          {/* Biomarkers Tab */}
          {rightPaneTab === 'biomarkers' && bio && (
            <div className="space-y-4 animate-fade-in">
              {/* Radar Chart */}
              <div className="clinical-card p-4">
                <h2 className="text-sm font-semibold text-slate-700 mb-2">Behavioral Profile — Normative Comparison</h2>
                <BiomarkerChart biomarkers={bio} />
              </div>

              {/* Individual Biomarker Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BiomarkerCard
                  title="Name-Call Orienting Latency"
                  measured={bio.nameCallLatency.measured}
                  unit="seconds"
                  normalRange={`< ${bio.nameCallLatency.normalMax}s`}
                  status={getBiomarkerStatus(bio.nameCallLatency.measured, bio.nameCallLatency.normalMax, true)}
                  percentage={(bio.nameCallLatency.measured / 5) * 100}
                  detail={`vs. norm < ${bio.nameCallLatency.normalMax}s`}
                />
                <BiomarkerCard
                  title="Social Gaze Ratio"
                  measured={bio.socialGazeRatio.measured}
                  unit="%"
                  normalRange={`${bio.socialGazeRatio.normalMin}–${bio.socialGazeRatio.normalMax}%`}
                  status={getBiomarkerStatus(bio.socialGazeRatio.measured, bio.socialGazeRatio.normalMin, false)}
                  percentage={bio.socialGazeRatio.measured}
                  detail="Face fixation time"
                />
                <BiomarkerCard
                  title="Motor Stereotypy Index"
                  measured={bio.motorStereotypyIndex.frequency}
                  unit="events/min"
                  normalRange={`< ${bio.motorStereotypyIndex.normalMaxFrequency}/min`}
                  status={getBiomarkerStatus(bio.motorStereotypyIndex.frequency, bio.motorStereotypyIndex.normalMaxFrequency, true)}
                  percentage={(bio.motorStereotypyIndex.frequency / 10) * 100}
                  detail={`${bio.motorStereotypyIndex.totalDuration}s total`}
                />
                <BiomarkerCard
                  title="Joint Attention Episodes"
                  measured={bio.jointAttentionEpisodes.count}
                  unit="episodes"
                  normalRange={`≥ ${bio.jointAttentionEpisodes.normalMin}`}
                  status={getBiomarkerStatus(bio.jointAttentionEpisodes.count, bio.jointAttentionEpisodes.normalMin, false)}
                  percentage={(bio.jointAttentionEpisodes.count / 10) * 100}
                  detail="Triadic gaze shifts"
                />
                <BiomarkerCard
                  title="Vocal Turn-Taking"
                  measured={bio.speechProsody.vocalTurnTaking}
                  unit="/min"
                  normalRange={`≥ ${bio.speechProsody.normalTurnTakingMin}/min`}
                  status={getBiomarkerStatus(bio.speechProsody.vocalTurnTaking, bio.speechProsody.normalTurnTakingMin, false)}
                  percentage={(bio.speechProsody.vocalTurnTaking / 10) * 100}
                  detail={`${bio.speechProsody.atypicalPitchBursts} atypical bursts`}
                />
              </div>
            </div>
          )}

          {/* ISAA Assessment Tab */}
          {rightPaneTab === 'isaa' && (
            <div className="animate-fade-in">
              <ISAAForm
                patientId={patient.id}
                patientName={patient.childName}
                patientAge={patient.ageInMonths}
                scores={patient.isaaScores?.items || {}}
                aiPrefilledItems={patient.isaaScores?.aiPrefilledItems || []}
                onScoreChange={handleScoreChange}
                overrides={overrides}
                onOverrideToggle={handleOverrideToggle}
                onJustificationChange={handleJustificationChange}
                validationErrors={validationErrors}
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Clinical Notes & Export ──────────────────────────────── */}
      <div className="clinical-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clipboard className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-slate-700">Clinical Evaluation</h2>
          {patient.clinicalNote?.signedOff && (
            <span className="badge badge-reviewed ml-2">
              <CheckCircle className="w-3 h-3" /> Signed Off
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clinical Notes */}
          <div>
            <label className="form-label">Clinical Notes</label>
            <textarea
              className="form-input min-h-[120px] resize-y"
              placeholder="Enter clinical observations, behavioral notes, and developmental assessment findings..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Diagnostic Impressions */}
          <div>
            <label className="form-label">Diagnostic Impressions</label>
            <textarea
              className="form-input min-h-[120px] resize-y"
              placeholder="Summarize diagnostic impressions, differential considerations, and recommended follow-up..."
              value={diagnosticImpressions}
              onChange={(e) => setDiagnosticImpressions(e.target.value)}
            />
          </div>
        </div>

        {/* Referral & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-6 pt-4 border-t border-slate-200">
          <div className="w-full sm:w-auto">
            <label className="form-label">Referral Recommendation</label>
            <select
              className="form-input w-full sm:w-72"
              value={selectedReferral}
              onChange={(e) => setSelectedReferral(e.target.value as ReferralType)}
            >
              {REFERRAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleSaveNotes} className="btn-secondary">
              <Save className="w-4 h-4" />
              {saved ? 'Draft Saved' : 'Save Draft'}
            </button>
            <button
              onClick={handleSaveClinicalSummary}
              disabled={isSubmittingFeedback}
              className="btn-primary bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmittingFeedback ? 'Submitting to AI Database...' : 'Save Clinical Summary'}
            </button>
            <button onClick={handleSignOff} className="btn-secondary text-slate-700">
              <Send className="w-4 h-4" />
              Sign &amp; Export
            </button>
          </div>
        </div>
      </div>

      {/* ─── Export Modal ─────────────────────────────────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="clinical-card max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Clinical Summary Report</h2>
                  <p className="text-xs text-slate-500">Ready for EHR export</p>
                </div>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-500 text-xs font-semibold">Patient ID</span><p className="font-mono font-bold text-slate-800">{patient.id}</p></div>
                <div><span className="text-slate-500 text-xs font-semibold">Patient Name</span><p className="font-bold text-slate-800">{patient.childName}</p></div>
                <div><span className="text-slate-500 text-xs font-semibold">Age</span><p className="font-bold text-slate-800">{patient.ageInMonths} months</p></div>
                <div><span className="text-slate-500 text-xs font-semibold">Sex</span><p className="font-bold text-slate-800 capitalize">{patient.biologicalSex}</p></div>
                <div><span className="text-slate-500 text-xs font-semibold">Risk Assessment</span><p className="font-bold capitalize" style={{ color: patient.riskTier === 'elevated' ? '#dc2626' : patient.riskTier === 'moderate' ? '#d97706' : '#16a34a' }}>{patient.riskTier} Risk</p></div>
                <div><span className="text-slate-500 text-xs font-semibold">Referral</span><p className="font-bold text-slate-800">{REFERRAL_OPTIONS.find(r => r.value === selectedReferral)?.label}</p></div>
              </div>

              {bio && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Biomarker Summary</h4>
                  <div className="space-y-2 text-xs">
                    <p><span className="font-semibold text-slate-700">Name-Call Latency:</span> {bio.nameCallLatency.measured}s (norm &lt; {bio.nameCallLatency.normalMax}s)</p>
                    <p><span className="font-semibold text-slate-700">Social Gaze Ratio:</span> {bio.socialGazeRatio.measured}% (norm {bio.socialGazeRatio.normalMin}–{bio.socialGazeRatio.normalMax}%)</p>
                    <p><span className="font-semibold text-slate-700">Motor Stereotypy:</span> {bio.motorStereotypyIndex.frequency} events/min (norm &lt; {bio.motorStereotypyIndex.normalMaxFrequency}/min)</p>
                    <p><span className="font-semibold text-slate-700">Joint Attention:</span> {bio.jointAttentionEpisodes.count} episodes (norm ≥ {bio.jointAttentionEpisodes.normalMin})</p>
                    <p><span className="font-semibold text-slate-700">Vocal Turn-Taking:</span> {bio.speechProsody.vocalTurnTaking}/min (norm ≥ {bio.speechProsody.normalTurnTakingMin}/min)</p>
                  </div>
                </div>
              )}

              {(notes || diagnosticImpressions) && (
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Clinical Notes</h4>
                  {notes && <p className="text-slate-700 whitespace-pre-wrap mb-2">{notes}</p>}
                  {diagnosticImpressions && (
                    <>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 mt-3">Diagnostic Impressions</h4>
                      <p className="text-slate-700 whitespace-pre-wrap">{diagnosticImpressions}</p>
                    </>
                  )}
                </div>
              )}

              <div className="border-t border-slate-200 pt-4 text-xs text-slate-400">
                <p>Signed by: Dr. Clinical Reviewer • {new Date().toLocaleString()}</p>
                <p className="mt-1 italic">This is a CDSS-generated report for risk prioritization — not a diagnostic instrument.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowExportModal(false)} className="btn-secondary">Close</button>
              <button
                className="btn-primary"
                onClick={() => {
                  const blob = new Blob([`Clinical Summary Report\n\nPatient: ${patient.childName}\nID: ${patient.id}\nRisk: ${patient.riskTier}\nReferral: ${selectedReferral}\n\nNotes: ${notes}\n\nDiagnostic Impressions: ${diagnosticImpressions}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `clinical-summary-${patient.id}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HITL Feedback Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
