// ─── Enums & Literals ────────────────────────────────────────────────

export type RiskTier = 'typical' | 'moderate' | 'elevated';
export type ClinicalStatus = 'pending' | 'reviewed' | 'referred';
export type SubmissionStatus = 'uploaded' | 'analyzing' | 'ai_complete' | 'under_review';
export type BiologicalSex = 'male' | 'female' | 'other';
export type ReferralType =
  | 'none'
  | 'developmental_specialist'
  | 'audiology'
  | 'early_intervention';

// ─── Video & Behavioral Events ───────────────────────────────────────

export interface VideoSlot {
  slotNumber: 1 | 2 | 3;
  title: string;
  fileName: string | null;
  fileSize: number | null; // bytes
  uploaded: boolean;
  videoUrl?: string | null;
  qualityMetrics: {
    framingQuality: number; // 0-100%
    lighting: 'poor' | 'adequate' | 'good';
    resolution: string; // e.g. "1080p"
  };
}

export interface BehavioralEvent {
  id: string;
  videoSlot: 1 | 2 | 3;
  timestampSeconds: number;
  label: string;
  durationSeconds: number;
  severity: 'normal' | 'borderline' | 'atypical';
}

// ─── Biomarker Results ───────────────────────────────────────────────

export interface BiomarkerResult {
  nameCallLatency: {
    measured: number; // seconds
    normalMax: number;
    unit: string;
  };
  socialGazeRatio: {
    measured: number; // percentage 0-100
    normalMin: number;
    normalMax: number;
    unit: string;
  };
  motorStereotypyIndex: {
    frequency: number; // events per minute
    totalDuration: number; // seconds
    normalMaxFrequency: number;
  };
  jointAttentionEpisodes: {
    count: number;
    normalMin: number;
  };
  speechProsody: {
    atypicalPitchBursts: number;
    vocalTurnTaking: number; // per minute
    normalTurnTakingMin: number;
  };
}

// ─── Clinical Notes ──────────────────────────────────────────────────

export interface ClinicalNote {
  notes: string;
  diagnosticImpressions: string;
  referral: ReferralType;
  signedOff: boolean;
  signedAt: string | null;
  reviewedBy: string;
}

// ─── ISAA (Indian Scale for Assessment of Autism) ────────────────────

export type ISAASeverityBand = 'no_autism' | 'mild' | 'moderate' | 'severe';

export interface ISAAScores {
  /** Scores for all 40 items, keyed by item number (1-40). Value 0 = unscored. */
  items: Record<number, number>;
  /** Which item numbers have been AI pre-filled */
  aiPrefilledItems: number[];
}

export interface VideoAnalysisTelemetry {
  total_frames?: number;
  processed_frames?: number;
  fps?: number;
  duration_seconds?: number;
  face_visible_frames?: number;
  face_visibility_ratio?: number;
  avg_wrist_velocity?: number;
  left_wrist_velocity?: number;
  right_wrist_velocity?: number;
  high_motion_events_count?: number;
}

export interface ISAAFlags {
  item_2_poor_eye_contact?: boolean;
  item_25_motor_stereotypies?: boolean;
}

export interface VideoAnalysisResult {
  success: boolean;
  filename?: string;
  video_url?: string;
  relative_url?: string;
  telemetry?: VideoAnalysisTelemetry;
  isaa_flags?: ISAAFlags;
  biomarkers_summary?: {
    social_gaze_ratio_percent?: number;
    motor_stereotypy_velocity?: number;
    high_motion_events?: number;
  };
}

// ─── Patient Record ──────────────────────────────────────────────────

export interface Patient {
  id: string;
  childName: string;
  dateOfBirth: string; // ISO date
  ageInMonths: number;
  biologicalSex: BiologicalSex;
  parentName: string;
  contactEmail: string;
  contactPhone: string;
  submissionDate: string; // ISO datetime
  submissionStatus: SubmissionStatus;
  riskTier: RiskTier;
  clinicalStatus: ClinicalStatus;
  videoSlots: [VideoSlot, VideoSlot, VideoSlot];
  biomarkers: BiomarkerResult | null;
  behavioralEvents: BehavioralEvent[];
  clinicalNote: ClinicalNote;
  isaaScores: ISAAScores | null;
}

